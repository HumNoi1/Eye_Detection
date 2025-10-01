# ⚙️ Configuration Guide

คู่มือการตั้งค่าและปรับแต่งระบบ Eye Detection

## 📑 สารบัญ

- [Confidence Threshold](#confidence-threshold)
- [Performance Tuning](#performance-tuning)
- [Camera Settings](#camera-settings)
- [Database Settings](#database-settings)

---

## 🎚️ Confidence Threshold

### คืออะไร?

Confidence threshold คือค่าความมั่นใจขั้นต่ำที่ YOLO model ต้องมีเพื่อจะถือว่าตรวจจับได้

**ตัวอย่าง:**
- Confidence = 0.25 → ต้องมั่นใจอย่างน้อย 25% จึงจะแสดงผล
- Confidence = 0.80 → ต้องมั่นใจ 80% ขึ้นไป

### ค่าเริ่มต้น

```python
CONFIDENCE_THRESHOLD = 0.25  # 25%
```

### การปรับค่า

#### วิธีที่ 1: ผ่าน API (แนะนำ)

```bash
# ดูค่าปัจจุบัน
curl http://localhost:8000/config/confidence

# ตั้งค่าใหม่
curl -X POST "http://localhost:8000/config/confidence?confidence=0.3"
```

#### วิธีที่ 2: แก้ไขในโค้ด

แก้ไขไฟล์ `backend/main.py`:

```python
# บรรทัดที่ 43
CONFIDENCE_THRESHOLD = 0.3  # เปลี่ยนจาก 0.25 เป็น 0.3
```

จากนั้น restart server:
```bash
uvicorn main:app --reload
```

### คำแนะนำการใช้งาน

| สถานการณ์ | Confidence | เหตุผล |
|-----------|-----------|---------|
| 💡 สภาพแสงน้อย | 0.15-0.25 | ตรวจจับได้ง่ายขึ้น |
| 🌞 สภาพแสงดี | 0.25-0.40 | สมดุล ✅ |
| 🎯 ต้องการความแม่นยำสูง | 0.50-0.70 | ลด false positive |
| 👥 หลายคนในกรอบ | 0.20-0.30 | หลีกเลี่ยงการพลาด |
| 🖼️ พื้นหลังซับซ้อน | 0.40-0.60 | ลดการตรวจจับผิด |

### ตัวอย่างการใช้งาน

#### กรณีที่ 1: ห้องมืด (กลางคืน)

```bash
# ลด threshold เพื่อตรวจจับได้ดีขึ้น
curl -X POST "http://localhost:8000/config/confidence?confidence=0.2"
```

**ผลลัพธ์:**
- ✅ ตรวจจับได้แม้แสงน้อย
- ⚠️ อาจมี false positive เพิ่มขึ้น

#### กรณีที่ 2: สำนักงาน (แสงจัด)

```bash
# เพิ่ม threshold เพื่อความแม่นยำ
curl -X POST "http://localhost:8000/config/confidence?confidence=0.4"
```

**ผลลัพธ์:**
- ✅ แม่นยำสูง
- ✅ ไม่ตรวจจับวัตถุอื่นผิด

#### กรณีที่ 3: Demo/Presentation

```bash
# ใช้ค่ากลางเพื่อความมั่นใจ
curl -X POST "http://localhost:8000/config/confidence?confidence=0.35"
```

**ผลลัพถ์:**
- ✅ สมดุลระหว่างการตรวจจับและความแม่นยำ

### การทดสอบหาค่าที่เหมาะสม

```bash
# ทดสอบหลายค่า
for conf in 0.2 0.25 0.3 0.35 0.4; do
    echo "Testing confidence: $conf"
    curl -X POST "http://localhost:8000/config/confidence?confidence=$conf"
    sleep 30  # ทดสอบ 30 วินาที
done
```

---

## ⚡ Performance Tuning

### JPEG Quality

แก้ไขไฟล์ `backend/main.py` (บรรทัด 190):

```python
# Quality 70 (default) - Balance
_, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])

# Quality 50 - Lower size, faster streaming
_, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 50])

# Quality 90 - Higher quality, larger size
_, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
```

| Quality | Frame Size | Network Usage | Visual Quality |
|---------|-----------|---------------|----------------|
| 50 | ~15 KB | Low ⚡ | Good |
| 70 | ~25 KB | Medium ✅ | Very Good |
| 90 | ~45 KB | High | Excellent |

### Frame Resolution

แก้ไขก่อน inference:

```python
# บรรทัดที่ 177 (ใน websocket_endpoint)
ret, frame = cap.read()
if not ret:
    break

# เพิ่มบรรทัดนี้เพื่อลดขนาด
frame = cv2.resize(frame, (640, 480))  # หรือ (320, 240) สำหรับเร็วมาก

start_time = time.time()
```

| Resolution | Speed | Quality | Recommendation |
|-----------|-------|---------|----------------|
| 320x240 | ⚡⚡⚡⚡⚡ | ⭐⭐ | Low-end devices |
| 640x480 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Recommended ✅ |
| 1280x720 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | High-end only |
| 1920x1080 | ⚡⚡ | ⭐⭐⭐⭐⭐⭐ | Overkill |

### History Window

แก้ไขไฟล์ `backend/main.py` (บรรทัด 53):

```python
HISTORY_WINDOW = 5  # seconds - default

# เร็วขึ้น แต่อาจไม่เสถียร
HISTORY_WINDOW = 3  # 3 seconds

# ช้าลง แต่เสถียรกว่า
HISTORY_WINDOW = 10  # 10 seconds
```

---

## 📹 Camera Settings

### เปลี่ยน Camera Index

```python
# ใน websocket_endpoint (บรรทัด 166)
cap = cv2.VideoCapture(0)  # Camera 0 (default)

# ใช้ camera อื่น
cap = cv2.VideoCapture(1)  # Camera 1
cap = cv2.VideoCapture(2)  # Camera 2
```

### ตรวจสอบ Camera ที่มี

```bash
# Linux
v4l2-ctl --list-devices

# Python
python3 -c "
import cv2
for i in range(5):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f'Camera {i}: Available')
        cap.release()
"
```

### ตั้งค่า Resolution

```python
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)
```

---

## 💾 Database Settings

### Cache Timeout

แก้ไขไฟล์ `backend/main.py` (บรรทัด 59):

```python
CACHE_TIMEOUT = 300  # 5 minutes (default)

# สำหรับข้อมูลที่เปลี่ยนบ่อย
CACHE_TIMEOUT = 60  # 1 minute

# สำหรับข้อมูลที่ไม่ค่อยเปลี่ยน
CACHE_TIMEOUT = 600  # 10 minutes
```

### Connection Pool

เพิ่มใน environment variables:

```env
# .env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
SUPABASE_MAX_CONNECTIONS=10  # เพิ่มบรรทัดนี้
```

---

## 🔧 Quick Settings Cheat Sheet

### 🏃 สำหรับ Performance

```python
# main.py
CONFIDENCE_THRESHOLD = 0.3      # เพิ่มเล็กน้อย
HISTORY_WINDOW = 3              # ลดลง
JPEG_QUALITY = 50               # ลด quality
FRAME_SIZE = (640, 480)         # ลด resolution
```

### 🎯 สำหรับ Accuracy

```python
# main.py
CONFIDENCE_THRESHOLD = 0.5      # เพิ่มขึ้น
HISTORY_WINDOW = 10             # เพิ่มขึ้น
JPEG_QUALITY = 80               # เพิ่ม quality
FRAME_SIZE = (1280, 720)        # เพิ่ม resolution
```

### ⚖️ สำหรับ Balance (แนะนำ)

```python
# main.py
CONFIDENCE_THRESHOLD = 0.25     # ค่าเริ่มต้น ✅
HISTORY_WINDOW = 5              # ค่าเริ่มต้น ✅
JPEG_QUALITY = 70               # ค่าเริ่มต้น ✅
FRAME_SIZE = (640, 480)         # แนะนำ ✅
```

---

## 📊 Monitoring

### ดูค่าปัจจุบันทั้งหมด

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "cache_size": 5,
  "model_loaded": true,
  "confidence_threshold": 0.25
}
```

### Log Levels

แก้ไข logging level:

```python
# main.py (บรรทัด 18)
logging.basicConfig(
    level=logging.DEBUG,  # เปลี่ยนจาก INFO เป็น DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Levels:**
- `DEBUG` - ทุกอย่าง (มาก)
- `INFO` - ข้อมูลสำคัญ (แนะนำ ✅)
- `WARNING` - แจ้งเตือน
- `ERROR` - ข้อผิดพลาดเท่านั้น

---

## 💡 Tips & Tricks

### 1. Auto-adjust Confidence

สร้าง script ปรับค่าอัตโนมัติตามเวลา:

```python
import requests
from datetime import datetime

def auto_adjust_confidence():
    hour = datetime.now().hour
    
    if 6 <= hour < 18:  # เช้า-บ่าย (แสงดี)
        confidence = 0.35
    else:  # ค่ำ-กลางคืน (แสงน้อย)
        confidence = 0.20
    
    requests.post(f"http://localhost:8000/config/confidence?confidence={confidence}")
    print(f"Set confidence to {confidence}")

auto_adjust_confidence()
```

### 2. Performance Monitoring

```bash
# ติดตามแบบ real-time
watch -n 1 'curl -s http://localhost:8000/health | jq'
```

### 3. Backup Configuration

```bash
# Save current config
curl http://localhost:8000/health > config_backup.json

# Save confidence
curl http://localhost:8000/config/confidence > confidence_backup.json
```

---

**💡 คำแนะนำ:**
- เริ่มด้วยค่า default (0.25)
- ทดสอบในสภาพแวดล้อมจริง
- ปรับค่าทีละนิดจนได้ผลลัพธ์ที่ต้องการ
- บันทึกค่าที่ใช้ได้ดีไว้

---

Made with ❤️ by HumNoi1
