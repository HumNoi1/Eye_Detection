# คู่มือการติดตั้งและใช้งาน Eye Detection System

## 📋 สารบัญ
1. [การติดตั้ง](#การติดตั้ง)
2. [การตั้งค่า Supabase](#การตั้งค่า-supabase)
3. [การรันระบบ](#การรันระบบ)
4. [การใช้งาน API](#การใช้งาน-api)
5. [การทดสอบ](#การทดสอบ)
6. [การแก้ปัญหา](#การแก้ปัญหา)

---

## 🚀 การติดตั้ง

### ขั้นตอนที่ 1: ติดตั้ง Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### ขั้นตอนที่ 2: สร้างไฟล์ .env

```bash
cp .env.example .env
```

จากนั้นแก้ไขไฟล์ `.env` และใส่ข้อมูล Supabase ของคุณ:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ การตั้งค่า Supabase

### ขั้นตอนที่ 1: สร้าง Project บน Supabase

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างบัญชี (Sign up) หรือ Login
3. คลิก **"New Project"**
4. ตั้งชื่อ project และรอสักครู่ให้ระบบสร้าง database

### ขั้นตอนที่ 2: รัน SQL Setup

1. ไปที่ **SQL Editor** ในเมนูด้านซ้าย
2. เปิดไฟล์ `database_setup.sql`
3. คัดลอกโค้ด SQL ทั้งหมดไปวางใน SQL Editor
4. คลิก **"Run"** เพื่อสร้างตารางและ setup database

### ขั้นตอนที่ 3: รับ API Keys

1. ไปที่ **Settings** > **API**
2. คัดลอก:
   - **Project URL** → ใส่ใน `SUPABASE_URL`
   - **anon public key** → ใส่ใน `SUPABASE_KEY`

### ขั้นตอนที่ 4: ตรวจสอบตาราง

1. ไปที่ **Table Editor**
2. ควรเห็นตาราง **users** พร้อม columns:
   - `user_id` (UUID)
   - `username` (text)
   - `student_id` (text)
   - `label` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

---

## ▶️ การรันระบบ

### รันแบบ Development

```bash
cd backend
python main.py
```

### รันแบบ Production

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### ตรวจสอบว่าระบบรันสำเร็จ

เปิดเบราว์เซอร์ไปที่: `http://localhost:8000/health`

ควรเห็น response:
```json
{
  "status": "healthy",
  "database": "connected",
  "cache_size": 0,
  "model_loaded": true
}
```

---

## 🔌 การใช้งาน API

### 1. เพิ่ม User ใหม่

**Request:**
```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "สมชาย ใจดี",
    "student_id": "6512345678",
    "label": "person_1"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [{
    "user_id": "uuid-here",
    "username": "สมชาย ใจดี",
    "student_id": "6512345678",
    "label": "person_1",
    "created_at": "2025-10-01T12:00:00"
  }]
}
```

### 2. ดึงข้อมูล Users ทั้งหมด

**Request:**
```bash
curl "http://localhost:8000/users"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid-1",
      "username": "สมชาย ใจดี",
      "student_id": "6512345678",
      "label": "person_1",
      "created_at": "2025-10-01T12:00:00"
    }
  ]
}
```

### 3. ดึงข้อมูล User ตาม Label

**Request:**
```bash
curl "http://localhost:8000/users/person_1"
```

### 4. ลบ User

**Request:**
```bash
curl -X DELETE "http://localhost:8000/users/person_1"
```

### 5. ล้าง Cache

**Request:**
```bash
curl -X POST "http://localhost:8000/cache/clear"
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared: 5 entries removed"
}
```

### 6. WebSocket Connection

เชื่อมต่อผ่าน WebSocket สำหรับ real-time video streaming:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('FPS:', data.fps);
    console.log('Predicted:', data.predicted);
    console.log('User Info:', data.user);
    // data.frame คือ base64 encoded image
};
```

**Response Format:**
```json
{
  "frame": "base64_encoded_image",
  "detections": [
    {
      "x1": 100,
      "y1": 100,
      "x2": 200,
      "y2": 200,
      "conf": 0.95,
      "cls": 0
    }
  ],
  "fps": 30.5,
  "latency": 33,
  "log": "Detected: person_1 (conf: 0.95) at 12:00:00",
  "predicted": "person_1",
  "user": {
    "user_id": "uuid-here",
    "username": "สมชาย ใจดี",
    "student_id": "6512345678",
    "label": "person_1"
  }
}
```

---

## 🧪 การทดสอบ

### ใช้ Test Script

```bash
cd backend
python test_api.py
```

Script นี้จะทดสอบ:
- ✅ Health check
- ✅ Create user
- ✅ Get all users
- ✅ Get user by label
- ✅ Cache functionality
- ✅ Delete user
- ✅ Clear cache

### ทดสอบด้วย Postman

1. Import collection จากไฟล์ (ถ้ามี)
2. หรือสร้าง requests ตามตัวอย่างด้านบน

---

## 🔧 การแก้ปัญหา

### ❌ Database not available

**อาการ:**
```json
{
  "status": "healthy",
  "database": "disconnected"
}
```

**วิธีแก้:**
1. ตรวจสอบไฟล์ `.env` ว่ามีค่า `SUPABASE_URL` และ `SUPABASE_KEY`
2. ตรวจสอบว่า Supabase project ยังทำงานอยู่
3. ตรวจสอบ internet connection
4. ตรวจสอบ logs:
   ```bash
   # ดู logs ใน terminal ที่รัน server
   ```

### ❌ Cannot open camera

**อาการ:**
```json
{
  "error": "Cannot open camera"
}
```

**วิธีแก้:**
1. ตรวจสอบว่า webcam เชื่อมต่ออยู่
2. ปิดแอปอื่นที่อาจใช้ camera อยู่ (Zoom, Teams, etc.)
3. ตรวจสอบ camera permissions
4. ลองเปลี่ยน camera index:
   ```python
   cap = cv2.VideoCapture(1)  # ลอง 0, 1, 2, ...
   ```

### ❌ Model not found

**อาการ:**
```
Failed to load YOLO model
```

**วิธีแก้:**
1. ตรวจสอบว่ามีไฟล์ `best.pt` ในโฟลเดอร์ `backend/`
2. ตรวจสอบชื่อไฟล์ว่าถูกต้อง
3. ถ้าใช้ชื่อไฟล์อื่น ให้แก้ใน `main.py`:
   ```python
   model = YOLO('your_model_name.pt')
   ```

### ❌ Import "supabase" could not be resolved

**วิธีแก้:**
```bash
pip install supabase python-dotenv
```

### ❌ Cache ไม่ทำงาน

**วิธีแก้:**
1. ตรวจสอบ `CACHE_TIMEOUT` ใน `main.py`
2. ลอง clear cache:
   ```bash
   curl -X POST "http://localhost:8000/cache/clear"
   ```
3. Restart server

### 📊 ตรวจสอบ Logs

Server จะแสดง logs แบบนี้:

```
2025-10-01 12:00:00 - __main__ - INFO - Supabase client initialized successfully
2025-10-01 12:00:00 - __main__ - INFO - YOLO model loaded successfully
2025-10-01 12:00:05 - __main__ - INFO - User found in database: person_1
2025-10-01 12:00:10 - __main__ - DEBUG - Cache hit for label: person_1
```

---

## 💡 Tips & Best Practices

### 1. Performance
- ระบบจะใช้ GPU อัตโนมัติถ้าตรวจพบ CUDA
- Cache timeout default = 5 นาที (ปรับได้ตามต้องการ)
- ใช้ `verbose=False` เพื่อลด overhead

### 2. Security
- อย่า commit ไฟล์ `.env` ขึ้น Git
- ใช้ Row Level Security (RLS) บน Supabase สำหรับ production
- เพิ่ม authentication สำหรับ sensitive endpoints

### 3. Monitoring
- ตรวจสอบ `/health` endpoint เป็นประจำ
- ดู logs เพื่อ debug
- ติดตาม cache size และ clear เมื่อจำเป็น

### 4. Database
- เพิ่ม index สำหรับ columns ที่ query บ่อยๆ
- Backup database เป็นประจำ
- ใช้ soft delete แทน hard delete (เพิ่ม `deleted_at` column)

---

## 📚 เอกสารเพิ่มเติม

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [YOLO Documentation](https://docs.ultralytics.com/)
- [OpenCV Documentation](https://docs.opencv.org/)

---

## 📞 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อ:
- Email: your-email@example.com
- GitHub Issues: https://github.com/your-repo/issues

---

**Happy Coding! 🚀**
