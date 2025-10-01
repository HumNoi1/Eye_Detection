# 🔧 คู่มือแก้ปัญหา (Troubleshooting Guide)

คู่มือนี้รวบรวมปัญหาที่พบบ่อยและวิธีการแก้ไข

## 📑 สารบัญ

- [ปัญหาการติดตั้ง](#ปัญหาการติดตั้ง)
- [ปัญหา Database](#ปัญหา-database)
- [ปัญหา WebSocket](#ปัญหา-websocket)
- [ปัญหากล้อง](#ปัญหากล้อง)
- [ปัญหา Performance](#ปัญหา-performance)
- [ปัญหาอื่นๆ](#ปัญหาอื่นๆ)

---

## ปัญหาการติดตั้ง

### ❌ Error: `ModuleNotFoundError: No module named 'ultralytics'`

**สาเหตุ:** ไม่ได้ติดตั้ง dependencies

**วิธีแก้:**
```bash
cd backend
pip install -r requirements.txt
```

### ❌ Error: `torch.cuda.is_available() returns False`

**สาเหตุ:** ไม่มี GPU หรือไม่ได้ติดตั้ง CUDA

**วิธีแก้:**
```bash
# ตรวจสอบ CUDA
nvidia-smi

# ถ้าไม่มี GPU ระบบจะใช้ CPU (ช้ากว่า แต่ยังใช้งานได้)
# หรือติดตั้ง PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### ❌ Error: `cv2.VideoCapture(0)` fails

**สาเหตุ:** ไม่พบกล้อง

**วิธีแก้:**
```bash
# Linux: ตรวจสอบกล้อง
v4l2-ctl --list-devices

# ลองเปลี่ยน index
# ใน main.py บรรทัด 167: cap = cv2.VideoCapture(1)  # เปลี่ยนจาก 0 เป็น 1
```

---

## ปัญหา Database

### ❌ ไม่แสดง Username และ Student ID

**สาเหตุ #1:** ไม่มีไฟล์ `.env`

**วิธีแก้:**
```bash
cd backend
cp .env.example .env
nano .env  # แก้ไขใส่ค่าจริง
```

**สาเหตุ #2:** Label ไม่ตรงกัน

**วิธีแก้:**
```bash
# ทดสอบ database connection
python3 test_database.py

# เช็ค labels ใน database
# ไปที่ Supabase Dashboard → Table Editor → users
# ดูว่า column 'label' มีค่าอะไรบ้าง

# เช็ค labels ที่ YOLO11n model detect
# ดู backend terminal logs ขณะรันระบบ
```

**ตัวอย่าง Log ที่บอกปัญหา:**
```
⚠ No user found for label: 'poom' in database
```
→ แปลว่า YOLO11n detect "poom" แต่ใน database มี "Poom" (case-sensitive!)

**วิธีแก้:**
1. แก้ label ใน database ให้ตรงกับ YOLO11n
2. หรือ train YOLO11n model ใหม่ให้ตรงกับ database

### ❌ Error: `supabase.table('users').select('*')` fails

**สาเหตุ:** API key ไม่ถูกต้องหรือ table ไม่มี

**วิธีแก้:**
```bash
# 1. ตรวจสอบ .env
cat backend/.env

# 2. ตรวจสอบว่า table ถูกสร้าง
# ไปที่ Supabase Dashboard → Table Editor
# ควรเห็น table 'users' พร้อมข้อมูล

# 3. ตรวจสอบ RLS (Row Level Security)
# ไปที่ Supabase Dashboard → Authentication → Policies
# ตรวจสอบว่ามี policy ที่อนุญาตให้อ่านได้
```

### ❌ Error: `Database query error: 401 Unauthorized`

**สาเหตุ:** ใช้ key ผิดตัว

**วิธีแก้:**
1. ไปที่ Supabase Dashboard → Settings → API
2. ใช้ **anon/public key** (ไม่ใช่ service_role key)
3. คัดลอกมาใส่ใน `.env`

---

## ปัญหา WebSocket

### ❌ Error: `WebSocket connection failed`

**สาเหตุ #1:** Backend ไม่ทำงาน

**วิธีแก้:**
```bash
# เช็คว่า backend ทำงาน
curl http://localhost:8000/health

# ถ้าไม่ได้ response ให้เริ่ม backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**สาเหตุ #2:** Port ถูกใช้งาน

**วิธีแก้:**
```bash
# เช็คว่า port 8000 ว่างหรือไม่
lsof -i :8000

# ถ้า port ถูกใช้ ให้ kill process หรือใช้ port อื่น
uvicorn main:app --reload --port 8001
```

**สาเหตุ #3:** CORS issue

**วิธีแก้:**
แก้ไข `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ❌ WebSocket disconnects randomly

**สาเหตุ:** Network instability หรือ timeout

**วิธีแก้:**
แก้ไข `frontend/src/app/camera/page.tsx`:
```typescript
// เพิ่ม heartbeat/ping-pong
useEffect(() => {
  const interval = setInterval(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000); // ทุก 30 วินาที
  
  return () => clearInterval(interval);
}, []);
```

---

## ปัญหากล้อง

### ❌ Error: `getUserMedia() not supported`

**สาเหตุ:** Browser ไม่รองรับหรือไม่ใช้ HTTPS

**วิธีแก้:**
- ใช้ browser ที่รองรับ (Chrome, Firefox, Edge)
- ใช้ `localhost` (ไม่ต้อง HTTPS)
- ถ้าใช้ IP address ต้องใช้ HTTPS

### ❌ กล้องถูก block โดย browser

**วิธีแก้:**
1. คลิกที่ไอคอนกล้องข้าง URL bar
2. เลือก "Allow"
3. Refresh หน้า

**Chrome:**
- Settings → Privacy and Security → Site Settings → Camera
- เพิ่ม http://localhost:3000 ใน "Allow"

**Firefox:**
- about:preferences#privacy
- Permissions → Camera → Settings
- เพิ่ม http://localhost:3000

### ❌ กล้องแสดงภาพสีดำ

**สาเหตุ:** กล้องถูกใช้งานโดยโปรแกรมอื่น

**วิธีแก้:**
```bash
# Linux: ดูว่าโปรแกรมไหนใช้กล้อง
lsof /dev/video0

# ปิดโปรแกรมที่ใช้กล้อง
# เช่น Zoom, Skype, OBS, etc.
```

---

## ปัญหา Performance

### 🐌 FPS ต่ำ (< 15 FPS)

**สาเหตุ #1:** ใช้ CPU

**วิธีแก้:**
```bash
# ติดตั้ง PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# ตรวจสอบว่าใช้ GPU
python3 -c "import torch; print(torch.cuda.is_available())"
```

**สาเหตุ #2:** Model ขนาดใหญ่

**วิธีแก้:**
แก้ไข `backend/main.py`:
```python
# ลด confidence threshold
results = model(frame, device=device, verbose=False, conf=0.5)  # เพิ่มจาก 0.25

# หรือใช้ model ที่เล็กกว่า (ถ้าเทรนจาก yolo11s หรือใหญ่กว่า)
model = YOLO('yolo11n.pt')  # nano version (เล็กและเร็วที่สุด)
```

**สาเหตุ #3:** Network latency

**วิธีแก้:**
แก้ไข `backend/main.py`:
```python
# ลด quality ของ JPEG
_, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 50])  # ลดจาก 70
```

### 🐌 Latency สูง (> 100ms)

**วิธีแก้:**
```python
# ลด image size ก่อน inference
frame_resized = cv2.resize(frame, (640, 480))  # ลดขนาดจาก original
results = model(frame_resized, ...)
```

### 💾 Memory leak / RAM เต็ม

**วิธีแก้:**
```python
# เพิ่มใน backend/main.py
import gc

# หลัง model inference
results = model(frame, ...)
# ... process results ...
del results
gc.collect()
```

---

## ปัญหาอื่นๆ

### ❌ Error: `best.pt not found`

**สาเหตุ:** ไม่มีไฟล์ model

**วิธีแก้:**
```bash
# วาง trained model ไว้ใน backend/
cp /path/to/your/best.pt backend/best.pt

# หรือใช้ pretrained YOLO11n model
# ดาวน์โหลดจาก https://github.com/ultralytics/assets/releases
# หรือใช้โค้ด: model = YOLO('yolo11n.pt')  # จะดาวน์โหลดอัตโนมัติ
```

### ❌ Frontend ไม่โหลด / blank page

**สาเหตุ:** Node modules ไม่ครบ

**วิธีแก้:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Error: `EADDRINUSE: address already in use`

**สาเหตุ:** Port ถูกใช้งาน

**วิธีแก้:**
```bash
# หา process ที่ใช้ port
lsof -i :3000  # สำหรับ frontend
lsof -i :8000  # สำหรับ backend

# Kill process
kill -9 <PID>

# หรือใช้ port อื่น
npm run dev -- -p 3001
```

### 🔍 ดู Detailed Logs

**Backend:**
```bash
# เพิ่ม debug level
uvicorn main:app --reload --log-level debug

# หรือแก้ไขใน main.py
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```bash
# เปิด Browser Console (F12)
# ดู Console, Network tabs
```

---

## 📞 ยังแก้ไม่ได้?

1. เช็ค [GitHub Issues](https://github.com/HumNoi1/Eye_Detection/issues)
2. เปิด Issue ใหม่พร้อม:
   - Output จาก `python3 test_database.py`
   - Backend terminal logs
   - Browser console errors (F12)
   - Screenshots
   - ระบุ OS, Python version, Node version

---

Made with ❤️ by HumNoi1
