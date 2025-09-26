from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from ultralytics import YOLO
import time
import torch

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model once at startup
model_path = "best.pt"  # Assuming best.pt is for eye detection
model = YOLO(model_path)
#model.to('cpu')
model.to('cuda' if torch.cuda.is_available() else 'cpu')
model.eval()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/infer/eye")
async def infer_eye(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run inference
    results = model(img, imgsz=640, conf=0.25, iou=0.5)
    
    # Process results
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = box.conf[0].cpu().numpy()
            cls = int(box.cls[0].cpu().numpy())
            label = model.names[cls]
            detections.append({
                "bbox": [float(x1), float(y1), float(x2), float(y2)],
                "label": label,
                "confidence": float(conf)
            })
    
    end_time = time.time()
    inference_time = (end_time - start_time) * 1000  # ms
    
    return {
        "detections": detections,
        "time_ms": inference_time,
        "model_name": "yolov11n"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
