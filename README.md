# 👁️ Eye Detection System

ระบบตรวจจับและระบุตัวตนด้วย Face Recognition แบบ Real-time พร้อมการเชื่อมต่อกับ Supabase Database

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a393.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📸 Screenshots

<div align="center">
  <img src="docs/demo.gif" alt="Demo" width="80%">
  <p><em>ระบบตรวจจับใบหน้าแบบ Real-time พร้อมแสดงข้อมูลผู้ใช้</em></p>
</div>

### Main Features
- 🎯 Real-time face detection with YOLO11n
- 👤 Face recognition with database integration
- 📊 Live statistics dashboard
- 🌓 Dark/Light mode support

## 📋 สารบัญ

- [คุณสมบัติ](#-คุณสมบัติ)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [ความต้องการของระบบ](#-ความต้องการของระบบ)
- [การติดตั้ง](#-การติดตั้ง)
- [การตั้งค่า](#-การตั้งค่า)
- [การใช้งาน](#-การใช้งาน)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [API Documentation](#-api-documentation)
- [การแก้ปัญหา](#-การแก้ปัญหา)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ คุณสมบัติ

### 🎯 Core Features
- ✅ **Real-time Face Detection** - ตรวจจับใบหน้าจากกล้องแบบ real-time ด้วย YOLO11n
- ✅ **Face Recognition** - ระบุตัวตนด้วยโมเดลที่ train เอง (best.pt)
- ✅ **5-Second Sliding Window** - วิเคราะห์ 5 วินาทีล่าสุดเพื่อความแม่นยำสูง
- ✅ **Percentage-based Prediction** - แสดงเปอร์เซ็นต์ความมั่นใจของแต่ละคน
- ✅ **Database Integration** - เชื่อมต่อ Supabase เพื่อดึงข้อมูลผู้ใช้
- ✅ **Multi-person Detection** - รองรับการตรวจจับหลายคนพร้อมกัน
- ✅ **Caching System** - ลด database queries ด้วย cache (5 นาที TTL)

### 🎨 UI/UX Features
- 🌓 **Dark/Light Mode** - รองรับทั้ง dark และ light theme
- 📊 **Live Statistics** - แสดง FPS, Latency, และจำนวน detections
- 👥 **User Information Display** - แสดงชื่อ, รหัสนิสิต, และข้อมูลผู้ใช้
- 📝 **System Logs** - แสดง log การทำงานแบบ real-time
- 📱 **Responsive Design** - ใช้งานได้ทั้ง desktop และ mobile

### 🔧 Technical Features
- ⚡ **WebSocket Communication** - การสื่อสารแบบ real-time
- 🎥 **Frame Throttling** - ควบคุม frame rate (~30 FPS)
- 🔄 **Auto-reconnection** - เชื่อมต่อใหม่อัตโนมัติเมื่อขาดหาย
- 📦 **Smart Caching** - cache user data เพื่อ performance
- 🔍 **Detailed Logging** - log ระดับ DEBUG สำหรับการ troubleshoot

## 🛠️ เทคโนโลยีที่ใช้

### Backend
- **FastAPI** - Web framework สำหรับ Python
- **YOLO11n (Ultralytics)** - Object detection model
- **OpenCV** - Computer vision library
- **PyTorch** - Deep learning framework
- **Supabase** - PostgreSQL database และ authentication
- **WebSocket** - Real-time bidirectional communication

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **WebSocket API** - Browser WebSocket client

### Database
- **Supabase (PostgreSQL)** - Cloud database
- **Row Level Security** - Database security policies

## 📦 ความต้องการของระบบ

### Software Requirements
- **Python** 3.8 หรือสูงกว่า
- **Node.js** 18.x หรือสูงกว่า
- **npm** หรือ **yarn**
- **Webcam** สำหรับการตรวจจับ
- **Supabase Account** (ฟรี)

### Hardware Requirements
- **CPU**: Intel i5 หรือเทียบเท่า (แนะนำ i7+)
- **RAM**: 8GB ขึ้นไป (แนะนำ 16GB+)
- **GPU**: NVIDIA GPU พร้อม CUDA (optional แต่แนะนำสำหรับความเร็ว)
- **Webcam**: 720p หรือสูงกว่า

## 🚀 การติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/HumNoi1/Eye_Detection.git
cd Eye_Detection
```

### 2. ติดตั้ง Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

หรือติดตั้งทีละตัว:
```bash
pip install fastapi uvicorn ultralytics opencv-python torch python-dotenv supabase python-multipart pydantic
```

### 3. ติดตั้ง Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ การตั้งค่า

### 1. ตั้งค่า Supabase

#### สร้าง Supabase Project
1. ไปที่ https://supabase.com/dashboard
2. คลิก **New Project**
3. กรอกข้อมูล:
   - Project Name: `eye-detection`
   - Database Password: (สร้างรหัสผ่านที่แข็งแรง)
   - Region: Southeast Asia (Singapore)

#### Import Database Schema
1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. คัดลอกโค้ดทั้งหมดจาก `backend/database_setup.sql`
3. Paste และกด **Run**
4. ตรวจสอบว่าตาราง `users` ถูกสร้างและมีข้อมูล 35 คน

### 2. ตั้งค่า Backend Environment

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend`:

```bash
cd backend
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**วิธีหา Supabase Credentials:**
1. ไปที่ Supabase Dashboard → Project Settings → API
2. คัดลอก:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`

### 3. ทดสอบการเชื่อมต่อ Database

```bash
cd backend
python3 test_database.py
```

ถ้าทำงานถูกต้องจะเห็น:
```
============================================================
🔍 Database Connection Test
============================================================

1️⃣ Checking environment variables...
✓ SUPABASE_URL: https://xxx.supabase.co
✓ SUPABASE_KEY: eyJhbGciOiJIUzI1...

2️⃣ Testing connection to Supabase...
✓ Connected to Supabase successfully

3️⃣ Querying users table...
✓ Found 35 users (showing first 5):

------------------------------------------------------------
Label           Username                  Student ID     
------------------------------------------------------------
Poom            Kittipat Chalonggchon     65025367       
Eark            Thensin Chuangkeattichai  65020946       
...

✅ All tests passed! Database is ready to use.
```

### 4. ตั้งค่า YOLO11n Model

วาง trained model (`best.pt`) ในโฟลเดอร์ `backend/`:

```
backend/
├── best.pt          # Your trained YOLO11n model
├── main.py
└── ...
```

**หมายเหตุ:** 
- Label ใน YOLO11n model ต้องตรงกับ column `label` ใน database (case-sensitive)
- ถ้ายังไม่มี trained model สามารถใช้ pretrained YOLO11n ได้ (จะดาวน์โหลดอัตโนมัติ)
- ดูวิธีการ train model ที่ [YOLO11_INFO.md](YOLO11_INFO.md)

### 5. ตั้งค่า Frontend (Optional)

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `frontend/` (ถ้าต้องการเปลี่ยน WebSocket URL):

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 🎮 การใช้งาน

### Quick Start

เปิด 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 1. เริ่ม Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ ควรเห็นข้อความ:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
INFO:     Supabase client initialized successfully
INFO:     YOLO model loaded successfully
```

🔗 เปิดเบราว์เซอร์ไปที่ http://localhost:8000/docs เพื่อดู API Documentation

### 2. เริ่ม Frontend Development Server

```bash
cd frontend
npm run dev
```

✅ ควรเห็นข้อความ:
```
   ▲ Next.js 15.5.4
   - Local:        http://localhost:3000
   - Ready in 1.2s
```

🔗 เปิดเบราว์เซอร์ไปที่ http://localhost:3000

### 3. ใช้งานระบบ

1. ไปที่ **http://localhost:3000/camera**
2. คลิกปุ่ม **"เริ่มสตรีม"** 🎥
3. อนุญาตให้เข้าถึงกล้อง (Allow camera access)
4. ระบบจะเริ่มตรวจจับและแสดงผลแบบ real-time

### 4. คุณสมบัติที่ใช้ได้

- 👤 **Live Detection**: ดูตัวตนของคนที่ถูกตรวจจับพร้อมเปอร์เซ็นต์ความมั่นใจ
- 📊 **Statistics**: ดู FPS, Latency และจำนวน detections
- 🌓 **Theme Toggle**: สลับระหว่าง Dark/Light mode
- 📝 **System Logs**: ดู real-time logs ของระบบ
- 👥 **Multi-person**: ตรวจจับหลายคนพร้อมกัน พร้อมข้อมูลแต่ละคน

## 📁 โครงสร้างโปรเจค

```
Eye_Detection/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── database_setup.sql         # Database schema และ sample data
│   ├── test_database.py          # Database connection test
│   ├── test_api.py               # API endpoint tests
│   ├── requirements.txt          # Python dependencies
│   ├── best.pt                   # Trained YOLO11n model
│   ├── yolo11n.pt               # Base YOLO11n model (backup)
│   ├── .env                      # Environment variables (create this)
│   ├── .env.example             # Environment template
│   └── README.md                # Backend documentation
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx          # Home page
│   │       ├── layout.tsx        # Root layout
│   │       ├── globals.css       # Global styles
│   │       └── camera/
│   │           └── page.tsx      # Camera detection page
│   ├── public/                   # Static assets
│   ├── package.json              # Node dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── next.config.ts           # Next.js config
│   ├── tailwind.config.ts       # Tailwind config
│   └── postcss.config.mjs       # PostCSS config
│
├── README.md                     # Main documentation (this file)
├── TROUBLESHOOTING.md           # Troubleshooting guide
├── CONTRIBUTING.md              # Contributing guidelines
├── YOLO11_INFO.md               # YOLO11n model information
├── LICENSE                       # MIT License
└── .gitignore                   # Git ignore rules
```

## 📚 API Documentation

### WebSocket Endpoint

**URL:** `ws://localhost:8000/ws`

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

**Response Format:**
```typescript
{
  frame: string;              // Base64 encoded JPEG image
  detections: Array<{         // Raw detection data
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    conf: number;
    cls: number;
  }>;
  fps: number;                // Frames per second
  latency: number;            // Detection latency (ms)
  log: string;                // Log message
  predicted: string;          // Top prediction label
  predicted_percentage: number; // Top prediction confidence (%)
  prediction_stats: {         // All detected people statistics
    [label: string]: {
      count: number;          // Number of detections
      percentage: number;     // Confidence percentage
      user: {                 // User info from database
        user_id: string;
        username: string;
        student_id: string;
        label: string;
        created_at: string;
      } | null;
    };
  };
  history_size: number;       // Number of detections in 5s window
  user: {                     // Top prediction user info
    user_id: string;
    username: string;
    student_id: string;
    label: string;
    created_at: string;
  } | null;
}
```

### REST API Endpoints

#### Get All Users
```http
GET /users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "username": "Kittipat Chalonggchon",
      "student_id": "65025367",
      "label": "Poom",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get User by Label
```http
GET /users/{label}
```

**Example:**
```bash
curl http://localhost:8000/users/Poom
```

#### Create User
```http
POST /users
Content-Type: application/json

{
  "username": "John Doe",
  "student_id": "65025999",
  "label": "John"
}
```

#### Delete User
```http
DELETE /users/{label}
```

#### Clear Cache
```http
POST /cache/clear
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "cache_size": 5,
  "model_loaded": true
}
```

## 🔧 การแก้ปัญหา

### ปัญหาที่พบบ่อย

#### 1. ไม่แสดง Username และ Student ID

**สาเหตุ:**
- ไม่มีไฟล์ `.env` หรือกรอกข้อมูลไม่ถูกต้อง
- Label จาก YOLO ไม่ตรงกับ label ใน database

**วิธีแก้:**
1. ตรวจสอบไฟล์ `.env` มีข้อมูลถูกต้อง
2. รัน `python3 test_database.py` เพื่อทดสอบ
3. เช็ค backend log ว่ามีข้อความ "✓ User found" หรือไม่
4. ตรวจสอบ label ใน database ตรงกับ YOLO model

#### 2. WebSocket Error

**สาเหตุ:**
- Backend ไม่ทำงาน
- CORS หรือ network issues

**วิธีแก้:**
```bash
# เช็คว่า backend ทำงานหรือไม่
curl http://localhost:8000/health

# ดู backend logs
# มองหา error messages
```

#### 3. กล้องไม่ทำงาน

**สาเหตุ:**
- Browser ไม่อนุญาตให้เข้าถึงกล้อง
- กล้องถูกใช้งานโดยโปรแกรมอื่น

**วิธีแก้:**
1. ตรวจสอบ browser permissions
2. ปิดโปรแกรมอื่นที่ใช้กล้อง
3. ลอง refresh หน้าเพจ

#### 4. Low FPS / Laggy

**สาเหตุ:**
- CPU/GPU ไม่แรงพอ
- ใช้ model ขนาดใหญ่

**วิธีแก้:**
1. ใช้ GPU ถ้ามี (ต้องติดตั้ง CUDA)
2. ลด frame rate ในโค้ด
3. ใช้ model ที่เล็กกว่า (yolo11n.pt เป็น nano version แล้ว)

### ดูเอกสารเพิ่มเติม

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - คู่มือแก้ปัญหาแบบละเอียด
- Backend logs - `uvicorn main:app --log-level debug`
- Browser Console - กด F12 เพื่อดู errors

## 🤝 Contributing

### การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

### Code Style

- **Python:** ใช้ PEP 8
- **TypeScript:** ใช้ ESLint + Prettier
- **Commits:** ใช้ conventional commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **HumNoi1** - *Initial work* - [HumNoi1](https://github.com/HumNoi1)

## 🙏 Acknowledgments

- [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics) - Object detection model
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

หากมีปัญหาหรือคำถาม:

1. เช็ค [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. ดู [Issues](https://github.com/HumNoi1/Eye_Detection/issues)
3. เปิด Issue ใหม่พร้อมรายละเอียด:
   - Output จาก `python3 test_database.py`
   - Backend logs
   - Browser console errors
   - Screenshots

---

<div align="center">

Made with ❤️ by HumNoi1

⭐ Star this repo if you find it helpful!

</div>
