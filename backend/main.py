from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from ultralytics import YOLO
import time
import torch

app = FastAPI(title="Eye Detection API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None

@app.on_event("startup")
async def startup_event():
    global model
    print("Loading YOLO model...")
    try:
        # Load YOLOv8n model (YOLO11 may not be available yet, using v8 as example)
        model = YOLO('/home/humnoi1/Documents/Model/best.pt')  # This will download if not present
        # Set to evaluation mode and move to GPU if available
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        model.to(device)
        print(f"Model loaded successfully on {device}")
    except Exception as e:
        print(f"Error loading model: {e}")
        # For demo purposes, we'll continue without model
        pass

@app.post("/infer/eye")
async def infer_eye(file: UploadFile = File(...)):
    start_time = time.time()

    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image file", "time_ms": 0}

        # Run inference
        if model is not None:
            results = model(img, conf=0.25, iou=0.45, imgsz=640)

            # Process results
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())

                    # Get class name
                    label = result.names[class_id] if hasattr(result, 'names') else f"class_{class_id}"

                    # For eye detection, you might want to filter specific classes
                    # For now, return all detections
                    detections.append({
                        "bbox": [float(x1), float(y1), float(x2), float(y2)],
                        "label": label,
                        "confidence": confidence
                    })

            processing_time = time.time() - start_time

            return {
                "detections": detections,
                "time_ms": processing_time * 1000,
                "model_name": "Eye Detection Custom Model",
                "image_size": [int(img.shape[1]), int(img.shape[0])]  # width, height
            }
        else:
            return {"error": "Model not loaded", "time_ms": 0}

    except Exception as e:
        processing_time = time.time() - start_time
        return {"error": f"Processing failed: {str(e)}", "time_ms": processing_time * 1000}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
