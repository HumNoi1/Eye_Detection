# Eye Detection Backend

Backend API สำหรับระบบตรวจจับใบหน้าด้วย YOLO และเชื่อมต่อกับ Supabase Database

## Features

- 🎥 Real-time face detection ผ่าน WebSocket
- 👤 User identification จาก predicted label
- 💾 เชื่อมต่อ Supabase Database
- ⚡ Caching system เพื่อลด database queries
- 📊 Comprehensive logging และ error handling
- 🔌 RESTful API สำหรับจัดการ users

## Requirements

- Python 3.8+
- Webcam
- YOLO model (`best.pt`)
- Supabase account

## Installation

1. ติดตั้ง dependencies:
```bash
pip install -r requirements.txt
```

2. สร้างไฟล์ `.env` จาก `.env.example`:
```bash
cp .env.example .env
```

3. แก้ไขไฟล์ `.env` ใส่ข้อมูล Supabase:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## Supabase Database Setup

สร้างตารางใน Supabase:

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  label VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- เพิ่ม indexes เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX idx_users_label ON users(label);
CREATE INDEX idx_users_student_id ON users(student_id);
```

## Running the Server

```bash
python main.py
```

หรือใช้ uvicorn โดยตรง:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server จะรันที่: `http://localhost:8000`

## API Endpoints

### WebSocket
- `WS /ws` - Real-time video streaming พร้อม face detection

### User Management
- `GET /users` - ดึงรายชื่อ users ทั้งหมด
- `POST /users` - สร้าง user ใหม่
- `GET /users/{label}` - ดึงข้อมูล user ตาม label
- `DELETE /users/{label}` - ลบ user ตาม label

### System
- `POST /cache/clear` - ล้าง user cache
- `GET /health` - ตรวจสอบสถานะระบบ

## API Usage Examples

### Create User
```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "สมชาย ใจดี",
    "student_id": "6512345678",
    "label": "person_1"
  }'
```

### Get All Users
```bash
curl "http://localhost:8000/users"
```

### Get User by Label
```bash
curl "http://localhost:8000/users/person_1"
```

### Delete User
```bash
curl -X DELETE "http://localhost:8000/users/person_1"
```

### Health Check
```bash
curl "http://localhost:8000/health"
```

## Caching System

- Cache timeout: 5 นาที
- อัตโนมัติล้าง cache เมื่อมีการสร้าง/ลบ user
- สามารถล้าง cache ด้วยตัวเองผ่าน API `/cache/clear`

## Error Handling

ระบบมี comprehensive error handling:
- Database connection errors
- Model loading errors
- Camera access errors
- WebSocket connection errors
- API request errors

ทุก errors จะถูก log และส่ง response ที่เหมาะสมกลับไป

## Logging

ระบบใช้ Python logging module:
- `INFO`: Normal operations
- `WARNING`: Non-critical issues
- `ERROR`: Critical errors

## Performance Tips

1. ใช้ CUDA/GPU ถ้ามี: ระบบจะใช้ GPU อัตโนมัติถ้าตรวจพบ
2. Cache ช่วยลด database queries
3. Adjust `CACHE_TIMEOUT` ตามความต้องการ
4. ใช้ `verbose=False` ใน YOLO inference

## Troubleshooting

### Database not available
- ตรวจสอบ `.env` file
- ตรวจสอบ Supabase credentials
- ตรวจสอบ internet connection

### Cannot open camera
- ตรวจสอบว่า webcam เชื่อมต่ออยู่
- ตรวจสอบ permissions
- ปิดแอปอื่นที่ใช้ camera

### Model not found
- ตรวจสอบว่ามีไฟล์ `best.pt` ในโฟลเดอร์เดียวกัน
- ตรวจสอบ file path

## License

MIT License
