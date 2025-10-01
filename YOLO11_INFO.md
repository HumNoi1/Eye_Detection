# 🎯 YOLO11n Model Information

โปรเจคนี้ใช้ **YOLO11n** (YOLO version 11 nano) สำหรับการตรวจจับใบหน้า

## 📊 เกี่ยวกับ YOLO11n

YOLO11n เป็น model ขนาดเล็กที่สุดใน YOLO11 series ซึ่งมีข้อดีคือ:

- ⚡ **เร็วมาก**: Inference speed สูง เหมาะสำหรับ real-time
- 💾 **ขนาดเล็ก**: ใช้ memory น้อย รันได้แม้ไม่มี GPU
- 🎯 **แม่นยำพอ**: แม่นยำเพียงพอสำหรับ face detection
- 🔋 **ประหยัด**: ใช้พลังงานน้อย เหมาะกับ edge devices

## 📈 YOLO11 Model Variants

| Model | Size | Speed | mAP | Use Case |
|-------|------|-------|-----|----------|
| YOLO11n | ~3MB | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Real-time, Edge devices |
| YOLO11s | ~9MB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced performance |
| YOLO11m | ~20MB | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | High accuracy |
| YOLO11l | ~25MB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Very high accuracy |
| YOLO11x | ~35MB | ⚡ | ⭐⭐⭐⭐⭐⭐ | Maximum accuracy |

## 🔧 การใช้งานใน Project

### Model Files

```
backend/
├── best.pt          # Your trained YOLO11n model
└── yolo11n.pt       # (Optional) Pretrained YOLO11n
```

### Loading Model

```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('best.pt')

# Or use pretrained (will auto-download)
model = YOLO('yolo11n.pt')
```

## 🎓 การ Train YOLO11n Model

### 1. เตรียม Dataset

```
dataset/
├── images/
│   ├── train/
│   └── val/
└── labels/
    ├── train/
    └── val/
```

### 2. สร้าง data.yaml

```yaml
# data.yaml
train: ./images/train
val: ./images/val

nc: 35  # number of classes (จำนวนคน)
names: ['Poom', 'Eark', 'Person3', ...]  # class names
```

### 3. Train Model

```python
from ultralytics import YOLO

# Load a pretrained YOLO11n model
model = YOLO('yolo11n.pt')

# Train the model
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='face_detection_yolo11n',
    patience=20,
    save=True,
    device=0  # use GPU 0, or 'cpu' for CPU
)
```

### 4. Export Best Model

```bash
# best.pt จะถูกสร้างที่
runs/detect/face_detection_yolo11n/weights/best.pt

# คัดลอกไปใช้
cp runs/detect/face_detection_yolo11n/weights/best.pt backend/best.pt
```

## 📊 Performance Benchmarks

### ระบบทดสอบ
- **CPU**: Intel i7-10750H
- **RAM**: 16GB
- **GPU**: NVIDIA GTX 1660 Ti (6GB)

### Results

| Metric | CPU Only | GPU (CUDA) |
|--------|----------|------------|
| FPS | 15-20 | 45-60 |
| Latency | 50-65ms | 16-22ms |
| RAM Usage | ~500MB | ~800MB |
| VRAM Usage | N/A | ~2GB |

## 🚀 การ Optimize Performance

### 1. ใช้ GPU (แนะนำ)

```python
# ใน main.py
device = 0 if torch.cuda.is_available() else 'cpu'
results = model(frame, device=device, half=True)  # FP16 mode
```

### 2. ลดขนาด Image

```python
# Resize image ก่อน inference
frame_resized = cv2.resize(frame, (640, 480))
results = model(frame_resized, device=device)
```

### 3. ปรับ Confidence Threshold

```python
# เพิ่ม threshold เพื่อลด false positives
results = model(frame, conf=0.5)  # default: 0.25
```

### 4. Batch Processing (ถ้าเป็นวิดีโอ)

```python
# Process multiple frames at once
frames = [frame1, frame2, frame3]
results = model(frames, device=device)
```

## 📦 ติดตั้ง Ultralytics

```bash
# ติดตั้ง Ultralytics (รองรับ YOLO11)
pip install ultralytics>=8.0.0

# สำหรับ GPU support
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 🔍 Verify YOLO11 Installation

```python
from ultralytics import YOLO
import torch

# Check version
print(f"Ultralytics version: {YOLO.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

# Test model loading
model = YOLO('yolo11n.pt')  # Will download if not exists
print(f"Model loaded: {model.model_name}")
```

## 📚 เอกสารเพิ่มเติม

- [Ultralytics YOLO11 Docs](https://docs.ultralytics.com/models/yolo11/)
- [YOLO11 GitHub](https://github.com/ultralytics/ultralytics)
- [Training Tips](https://docs.ultralytics.com/modes/train/)
- [Export Formats](https://docs.ultralytics.com/modes/export/)

## ❓ FAQ

### Q: ทำไมเลือก YOLO11n แทน YOLOv8?

**A:** YOLO11 เป็นเวอร์ชันล่าสุด มีการปรับปรุง:
- ⚡ เร็วกว่า YOLOv8 ประมาณ 10-15%
- 🎯 แม่นยำกว่าที่ model size เท่ากัน
- 🔧 API ใช้งานง่ายกว่า
- 📦 รองรับ export format มากกว่า

### Q: ต้องการ GPU แบบไหน?

**A:** 
- **Minimum**: ไม่จำเป็นต้องมี GPU (ใช้ CPU ได้)
- **Recommended**: NVIDIA GPU with CUDA (GTX 1650+)
- **Optimal**: RTX 3060+ หรือ RTX 4060+ สำหรับ FP16

### Q: best.pt มีขนาดเท่าไร?

**A:** ขึ้นอยู่กับ:
- Base model (YOLO11n ≈ 3MB)
- จำนวน classes (แต่ละ class เพิ่ม ~100KB)
- โดยทั่วไป: **3-10MB** สำหรับ YOLO11n

### Q: สามารถใช้กับ mobile ได้ไหม?

**A:** ได้! YOLO11n เหมาะมากสำหรับ mobile:
```python
# Export to mobile format
model.export(format='tflite')  # TensorFlow Lite
model.export(format='coreml')  # iOS Core ML
```

---

<div align="center">

**YOLO11n** - Fast, Accurate, Efficient 🚀

</div>
