# 🔧 วิธีแก้ปัญหา: ไม่แสดง Username และ Student ID

## 🎯 สาเหตุที่เป็นไปได้

1. **ไม่มีไฟล์ .env** - Backend ไม่สามารถเชื่อมต่อ Supabase ได้
2. **Label ไม่ตรงกัน** - Label จาก YOLO model ไม่ตรงกับ label ใน database
3. **ไม่มีข้อมูลใน Database** - ยังไม่ได้ import ข้อมูลเข้า Supabase

## ✅ วิธีแก้ไข (ทำทีละขั้นตอน)

### ขั้นตอนที่ 1: สร้างไฟล์ .env

```bash
cd backend
cp .env.example .env
```

จากนั้นแก้ไขไฟล์ `.env` โดยกรอกข้อมูล Supabase ของคุณ:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**วิธีหา Supabase credentials:**
1. เข้า https://supabase.com/dashboard
2. เลือก Project ของคุณ
3. ไปที่ Settings → API
4. คัดลอก:
   - **Project URL** → ใส่ใน `SUPABASE_URL`
   - **anon/public key** → ใส่ใน `SUPABASE_KEY`

### ขั้นตอนที่ 2: Import ข้อมูลเข้า Supabase

1. เข้า Supabase Dashboard
2. ไปที่ **SQL Editor**
3. คัดลอกโค้ดทั้งหมดจาก `database_setup.sql`
4. Paste และกด **Run**
5. ตรวจสอบว่ามีข้อมูล 35 คนใน `users` table

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ

```bash
cd backend
python3 test_database.py
```

ถ้าทำงานถูกต้อง จะแสดง:
- ✓ SUPABASE_URL และ SUPABASE_KEY
- ✓ Connected to Supabase successfully
- ✓ รายชื่อผู้ใช้ 5 คนแรก
- ✓ Query by label successful
- ✅ All tests passed!

### ขั้นตอนที่ 4: เช็ค Label จาก YOLO Model

```bash
cd backend
python3 -c "from ultralytics import YOLO; model = YOLO('best.pt'); print('Labels:', list(model.names.values()))"
```

**ตรวจสอบว่า:**
- Label จาก YOLO ต้องตรงกับ label ใน database **เป๊ะๆ** (case-sensitive)
- ตัวอย่าง: YOLO ใช้ `"Poom"` → Database ต้องมี label `"Poom"` เหมือนกัน

### ขั้นตอนที่ 5: รัน Backend และตรวจสอบ Log

```bash
cd backend
uvicorn main:app --reload
```

ดู log ว่ามีข้อความอะไร:
- ✓ `Supabase client initialized successfully` = ดี!
- ✓ `User found: Poom -> Kittipat Chalonggchon` = ดี!
- ❌ `Supabase client not initialized` = ยังไม่มี .env
- ⚠️ `No user found for label: 'xxx'` = Label ไม่ตรงกัน

### ขั้นตอนที่ 6: เปิด Frontend

```bash
cd frontend
npm run dev
```

เปิด http://localhost:3000/camera และตรวจสอบว่า:
1. เชื่อมต่อกล้องได้
2. ตรวจจับใบหน้าได้
3. แสดง **👤 Username** และ **🎓 Student ID** ในการ์ด "All Detected People"

## 🔍 Debug Tips

### ถ้ายังไม่แสดงข้อมูล:

1. **เช็ค Browser Console** (F12)
   - ดูว่ามี error อะไรไหม
   - ดู WebSocket messages ว่า `user` field มีค่าไหม

2. **เช็ค Backend Log**
   - มีข้อความ `🔍 Querying database for label: xxx` ไหม?
   - มี `✓ User found` หรือ `⚠ No user found`?

3. **เช็ค Label ใน Database**
   ```sql
   SELECT label FROM users ORDER BY label;
   ```
   
4. **เช็ค Label ที่ YOLO ใช้**
   - ดูใน backend log ว่าตรวจพบ label อะไร

## 🎨 ตัวอย่างผลลัพธ์ที่ถูกต้อง

เมื่อทำงานถูกต้อง จะเห็น:

```
┌─────────────────────────────────────┐
│ All Detected People (Last 5s)      │
├─────────────────────────────────────┤
│ [P] Poom               80.0% 👑     │
│     👤 Kittipat Chalonggchon        │
│     🎓 65025367                     │
│     36 detections                   │
│     ████████████░░░░░░              │
├─────────────────────────────────────┤
│ [E] Eark               17.8%        │
│     👤 Thensin Chuangkeattichai     │
│     🎓 65020946                     │
│     8 detections                    │
│     ████░░░░░░░░░░░░░░              │
└─────────────────────────────────────┘
```

## 📞 ยังไงก็แก้ไม่ได้?

ส่งข้อมูลเหล่านี้มา:

1. ผลลัพธ์จาก `python3 test_database.py`
2. Backend log (10 บรรทัดล่าสุด)
3. Labels จาก YOLO model
4. Screenshot ของหน้าเว็บ
5. Browser Console errors (F12)
