import cv2
from ultralytics import YOLO
from fastapi import FastAPI, WebSocket
import asyncio
import base64
import json
import time
from collections import deque, Counter
import torch

app = FastAPI()

model = YOLO('best.pt')

cap = None

history = deque()

predicted = ""

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
        # clean old detections
        while history and history[0][0] < current_time - 10:
            history.popleft()
        # add current detections
        for d in detections:
            history.append((current_time, int(d['cls'])))
        # predict most common
        if history:
            cls_counts = Counter(cls for _, cls in history)
            most_common = cls_counts.most_common(1)[0][0]
            predicted = model.names[most_common]
        else:
            predicted = ""

        current_time = time.time()
        fps = 1 / (current_time - prev_time) if current_time - prev_time > 0 else 0
        prev_time = current_time
        log = f"Detected: {', '.join([f'{model.names[int(d['cls'])]} (conf: {d['conf']:.2f})' for d in detections])} at {time.strftime('%H:%M:%S')}" if detections else ""
        data = {
            'frame': frame_b64,
            'detections': detections,
            'fps': round(fps, 2),
            'latency': latency,
            'log': log,
            'predicted': predicted
        }
        try:
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(0.03)
        except:
            break
    cap.release()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)