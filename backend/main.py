import cv2
from ultralytics import YOLO
from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
import asyncio
import base64
import json
import time
from collections import deque, Counter
import torch
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Initialize Supabase client
try:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase credentials not found. Database features will be disabled.")
        supabase: Client = None
    else:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None

try:
    model = YOLO('best.pt')
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    raise

cap = None

history = deque()
HISTORY_WINDOW = 5  # seconds - เก็บ log 5 วินาทีล่าสุด

predicted = ""
predicted_percentage = 0.0

# User cache with timestamp
user_cache = {}
CACHE_TIMEOUT = 300  # 5 minutes

# Pydantic models for API
class UserCreate(BaseModel):
    username: str
    student_id: str
    label: str

class UserResponse(BaseModel):
    user_id: str
    username: str
    student_id: str
    label: str
    created_at: str

async def get_user_by_label(label: str):
    """Query user from database by label with caching"""
    if not supabase:
        logger.error(f"❌ Supabase client not initialized! Cannot query user for label: {label}")
        return None
    
    # Check cache first
    if label in user_cache:
        cached_time, user_data = user_cache[label]
        if datetime.now() - cached_time < timedelta(seconds=CACHE_TIMEOUT):
            logger.info(f"✓ Cache hit for label: {label} -> {user_data.get('username', 'N/A')}")
            return user_data
        else:
            logger.debug(f"⌛ Cache expired for label: {label}")
    
    # Query from database
    try:
        logger.info(f"🔍 Querying database for label: {label}")
        response = supabase.table('users').select('*').eq('label', label).execute()
        if response.data and len(response.data) > 0:
            user_data = response.data[0]
            user_cache[label] = (datetime.now(), user_data)
            logger.info(f"✓ User found: {label} -> {user_data['username']} (ID: {user_data['student_id']})")
            return user_data
        else:
            logger.warning(f"⚠ No user found for label: '{label}' in database")
            # Cache negative result to avoid repeated queries
            user_cache[label] = (datetime.now(), None)
            return None
    except Exception as e:
        logger.error(f"❌ Database query error for label {label}: {e}")
        return None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    global cap
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        await websocket.send_text(json.dumps({'error': 'Cannot open camera'}))
        await websocket.close()
        return
    prev_time = time.time()
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        start_time = time.time()
        device = 0 if torch.cuda.is_available() else 'cpu'
        results = model(frame, device=device, verbose=False)
        latency = int((time.time() - start_time) * 1000)
        annotated_frame = results[0].plot()
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_b64 = base64.b64encode(buffer).decode('utf-8')
        detections = []
        for box in results[0].boxes:
            detections.append({
                'x1': box.xyxy[0][0].item(),
                'y1': box.xyxy[0][1].item(),
                'x2': box.xyxy[0][2].item(),
                'y2': box.xyxy[0][3].item(),
                'conf': box.conf[0].item(),
                'cls': box.cls[0].item()
            })
        current_time = time.time()
        # clean old detections (เก็บแค่ 5 วินาทีล่าสุด)
        while history and history[0][0] < current_time - HISTORY_WINDOW:
            history.popleft()
        # add current detections
        for d in detections:
            history.append((current_time, int(d['cls'])))
        
        # predict most common with percentage
        user_info = None
        prediction_stats = {}  # เก็บสถิติแต่ละคนพร้อม user info
        
        try:
            if history:
                # นับจำนวนแต่ละ class
                cls_counts = Counter(cls for _, cls in history)
                total_detections = len(history)
                
                # คำนวณเปอร์เซ็นต์แต่ละคนและ query user info
                logger.debug(f"📊 Processing {len(cls_counts)} detected people")
                for cls, count in cls_counts.items():
                    label = model.names[cls]
                    percentage = (count / total_detections) * 100
                    
                    # Query user info for this label
                    logger.debug(f"Querying user info for: {label}")
                    label_user_info = await get_user_by_label(label)
                    
                    prediction_stats[label] = {
                        'count': count,
                        'percentage': round(percentage, 2),
                        'user': label_user_info  # เพิ่ม user info ของแต่ละคน
                    }
                    
                    if label_user_info:
                        logger.info(f"✓ Added user info for {label}: {label_user_info['username']}")
                    else:
                        logger.warning(f"⚠ No user info for label: {label}")
                
                # หาคนที่มีเปอร์เซ็นต์สูงสุด
                most_common_cls, most_common_count = cls_counts.most_common(1)[0]
                predicted = model.names[most_common_cls]
                predicted_percentage = (most_common_count / total_detections) * 100
                
                # Get user info for top prediction from stats
                user_info = prediction_stats[predicted].get('user')
                
                logger.debug(f"Prediction: {predicted} ({predicted_percentage:.2f}%) | Stats: {prediction_stats}")
            else:
                predicted = ""
                predicted_percentage = 0.0
                prediction_stats = {}
        except Exception as e:
            logger.error(f"Error in prediction/user lookup: {e}")
            predicted = ""
            predicted_percentage = 0.0
            prediction_stats = {}
            user_info = None

        current_time = time.time()
        fps = 1 / (current_time - prev_time) if current_time - prev_time > 0 else 0
        prev_time = current_time
        detection_texts = [f"{model.names[int(d['cls'])]}: {d['conf']:.2f}" for d in detections]
        log = f"Detected: {', '.join(detection_texts)} at {time.strftime('%H:%M:%S')}" if detections else ""
        data = {
            'frame': frame_b64,
            'detections': detections,
            'fps': round(fps, 2),
            'latency': latency,
            'log': log,
            'predicted': predicted,
            'predicted_percentage': round(predicted_percentage, 2),
            'prediction_stats': prediction_stats,
            'history_size': len(history),
            'user': user_info  # Add user information from database
        }
        try:
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(0.03)
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            break
    
    if cap:
        cap.release()
        logger.info("Camera released")

# API Endpoints for User Management
@app.get("/users")
async def get_users():
    """Get all users from database"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        response = supabase.table('users').select('*').execute()
        logger.info(f"Retrieved {len(response.data)} users")
        return {"success": True, "data": response.data}
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/users")
async def create_user(user: UserCreate):
    """Create new user in database"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        data = {
            'username': user.username,
            'student_id': user.student_id,
            'label': user.label
        }
        response = supabase.table('users').insert(data).execute()
        
        # Clear cache for this label
        if user.label in user_cache:
            del user_cache[user.label]
        
        logger.info(f"User created: {user.username} ({user.label})")
        return {"success": True, "data": response.data}
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/users/{label}")
async def get_user(label: str):
    """Get user by label"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        user_data = await get_user_by_label(label)
        if user_data:
            return {"success": True, "data": user_data}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/users/{label}")
async def delete_user(label: str):
    """Delete user by label"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        response = supabase.table('users').delete().eq('label', label).execute()
        
        # Clear cache
        if label in user_cache:
            del user_cache[label]
        
        logger.info(f"User deleted: {label}")
        return {"success": True, "message": "User deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/cache/clear")
async def clear_cache():
    """Clear user cache"""
    global user_cache
    cache_size = len(user_cache)
    user_cache.clear()
    logger.info(f"Cache cleared: {cache_size} entries removed")
    return {"success": True, "message": f"Cache cleared: {cache_size} entries removed"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected" if supabase else "disconnected",
        "cache_size": len(user_cache),
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)