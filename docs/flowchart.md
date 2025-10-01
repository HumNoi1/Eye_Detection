# Eye Detection System Flow Diagrams

เอกสารนี้สรุปขั้นตอนการทำงานของระบบปัจจุบัน (Backend FastAPI + YOLO + WebSocket Streaming) ทั้งในมุมมองระดับระบบและระดับวงรอบประมวลผลเฟรม พร้อมทั้ง Diagram ในรูปแบบ Mermaid ที่สามารถ Render ได้ทันทีใน Markdown viewer ที่รองรับ

---
## 1. System Level Flow
```
Start
  |
  v
ผู้ใช้เปิดหน้าเว็บ (/camera)
  |
  v
Frontend เปิด WebSocket ไปยัง Backend /ws
  |
  v
Backend Accept การเชื่อมต่อ
  |
  v
เปิดกล้อง (VideoCapture(0)) สำเร็จ?
  |----------------------|
  |Yes                   |No
  v                      v
เข้าสู่ Loop เฟรม       ส่ง error + ปิดการเชื่อมต่อ + End
  |
  v
(ดู Frame Processing Loop)
  |
  v
Client ปิด / Error เกิดขึ้น
  |
  v
Release กล้อง & ปิด WebSocket
  |
  v
End
```

### Mermaid Version (System Level)
```mermaid
flowchart TD
    A([Start]) --> B[User opens /camera]
    B --> C[Frontend opens WebSocket /ws]
    C --> D{Open Camera OK?}
    D -->|No| E[Send error JSON & Close]
    E --> F([End])
    D -->|Yes| G[[Frame Loop]]
    G --> H{Client disconnect<br/>or Error?}
    H -->|Yes| I[Release Camera & Close WS]
    I --> F
    H -->|No| G
```

---
## 2. Frame Processing Loop Flow
```
(Loop Start)
  |
  v
อ่านเฟรมจากกล้อง สำเร็จ?
  |----------------------|
  |Yes                   |No -> Break (ออกจาก Loop)
  v
YOLO Inference บนเฟรม
  |
  v
สร้าง Annotated Frame (plot)
  |
  v
Extract Detections (boxes, conf, cls)
  |
  v
ลบ history ที่เก่ากว่า 10 วินาที
  |
  v
เพิ่ม cls ปัจจุบันลง history
  |
  v
history ว่าง?
  |----------------------|
  |Yes                   |No
  v                      v
predicted = ""      predicted = most common label
  |
  v
คำนวณ latency / fps / log
  |
  v
เข้ารหัส annotated frame -> JPEG -> Base64
  |
  v
ประกอบ JSON payload (frame, detections, fps, latency, log, predicted)
  |
  v
ส่งผ่าน WebSocket สำเร็จ?
  |----------------------|
  |Yes                   |No -> Break (ออกจาก Loop)
  v
sleep ~30ms
  |
  v
วนกลับไปอ่านเฟรมใหม่ (ต่อเนื่อง)
```

### Mermaid Version (Frame Loop)
```mermaid
flowchart TD
    L1([Frame Loop Start]) --> L2[Read frame]
    L2 --> L3{Read OK?}
    L3 -->|No| L99([Break Loop])
    L3 -->|Yes| L4[YOLO Inference]
    L4 --> L5[Create annotated frame]
    L5 --> L6[Extract detections]
    L6 --> L7[Prune old history (>10s)]
    L7 --> L8[Append current classes]
    L8 --> L9{History empty?}
    L9 -->|Yes| L10[predicted = empty]
    L9 -->|No| L11[predicted = most common]
    L10 --> L12[Compute latency / fps / log]
    L11 --> L12
    L12 --> L13[Encode frame -> Base64]
    L13 --> L14[Build JSON payload]
    L14 --> L15{Send OK?}
    L15 -->|No| L99
    L15 -->|Yes| L16[sleep 30ms]
    L16 --> L2
```

---
## 3. Sequence Diagram (End-to-End Streaming)
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Next.js)
  participant BE as Backend (FastAPI)
  participant CV as Camera
  participant YOLO as Model

  U->>FE: Open /camera page
  FE->>BE: WebSocket connect /ws
  BE->>CV: Open camera
  loop Real-time
    CV-->>BE: Frame
    BE->>YOLO: Inference(frame)
    YOLO-->>BE: Boxes + Classes + Conf
    BE->>BE: Update history & predicted
    BE->>BE: Annotate + Encode Base64
    BE-->>FE: JSON(frame + detections + stats)
    FE-->>U: Render view
  end
  U-->>FE: Close page / disconnect
  FE-->>BE: Close WS
  BE->>CV: Release camera
```

---
## 4. Payload Structure (ปัจจุบัน)
```jsonc
{
  "frame": "<Base64 JPEG>",
  "detections": [
    {"x1": float, "y1": float, "x2": float, "y2": float, "conf": float, "cls": int}
  ],
  "fps": number,
  "latency": milliseconds,
  "log": "Detected: ...",
  "predicted": "<label or empty>"
}
```

---
## 5. ข้อเสนอแนะเพิ่มเติม (Optional Improvements)
- รองรับหลายผู้ใช้ด้วย session object แทน global state
- เพิ่ม timestamp (UTC ISO8601) ใน payload
- แยกกล้องเป็น input แบบ client-side (WebRTC) หากต้องการ scale
- ลดขนาดภาพก่อนส่ง (resize + quality tune)
- เพิ่ม auth / token ในการเปิด WebSocket
- แยก worker inference เพื่อไม่บล็อก event loop

---
## 6. Mermaid Source Files
ไฟล์แยกสำหรับแก้ไขง่าย:
- `docs/diagrams/system_flow.mmd`
- `docs/diagrams/frame_loop.mmd`
- `docs/diagrams/sequence.mmd`

## 7. การ Export เป็น PNG
ติดตั้ง Mermaid CLI (ขอแนะนำให้ global หรือ dev dependency ที่ root แยกจาก frontend ถ้าไม่อยากปนกับ Next.js) วิธีง่าย:

### ตัวเลือก A: ใช้ npx (ครั้งคราว)
```powershell
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/system_flow.mmd -o docs/diagrams/system_flow.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/frame_loop.mmd -o docs/diagrams/frame_loop.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/sequence.mmd -o docs/diagrams/sequence.png
```

### ตัวเลือก B: ติดตั้งเป็น dev dependency (แนะนำ)
สร้าง/เพิ่ม `package.json` ระดับ root หรือใช้ของ frontend ก็ได้ แต่ควรแยกเพื่อไม่ให้ next build ดึงไปโดยไม่จำเป็น

ตัวอย่าง (ใช้ของ frontend เดิม):
```powershell
cd frontend
npm install -D @mermaid-js/mermaid-cli
```
เพิ่ม script ใน `frontend/package.json`:
```jsonc
"scripts": {
  // ...existing scripts
  "diagram:system": "mmdc -i ../docs/diagrams/system_flow.mmd -o ../docs/diagrams/system_flow.png",
  "diagram:loop": "mmdc -i ../docs/diagrams/frame_loop.mmd -o ../docs/diagrams/frame_loop.png",
  "diagram:seq": "mmdc -i ../docs/diagrams/sequence.mmd -o ../docs/diagrams/sequence.png",
  "diagram:all": "npm-run-all diagram:*"
}
```
(หากไม่มี npm-run-all ให้ติดตั้งเพิ่ม: `npm i -D npm-run-all` หรือใช้ PowerShell wildcard: `npm run diagram:system; npm run diagram:loop; npm run diagram:seq`)

### ตัวเลือก C: ใช้ Docker (ถ้าต้องการ reproducible)
```powershell
docker run --rm -v ${PWD}:/work minlag/mermaid-cli mmdc -i /work/docs/diagrams/system_flow.mmd -o /work/docs/diagrams/system_flow.png
```

## 8. หมายเหตุคุณภาพภาพ
- สามารถเพิ่มความละเอียดด้วย flag `-w 1800` (หรือ `-b transparent` สำหรับพื้นหลังโปร่งใส)
- ใส่ธีม: `-t forest` หรือสร้าง theme config แยก

ตัวอย่าง:
```powershell
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/system_flow.mmd -o docs/diagrams/system_flow.png -w 1600 -t forest
```

---
## 9. Combined Frontend + Backend Detailed Flow
ด้านล่างเป็น Flowchart แบบรวม (Frontend + Backend) ตามที่ผู้ใช้ระบุ เพิ่มเติมจาก Diagram เดิมเพื่อให้เห็นการประสานงานเต็มวงจร และมีการไฮไลท์ขั้นตอนสำคัญด้วยสี

```mermaid
graph TB
    Start([เริ่มต้น]) --> UserClick[ผู้ใช้กดปุ่ม 'เปิดกล้อง']
    
    UserClick --> WSConnect[สร้าง WebSocket Connection<br/>ws://localhost:8000/ws]
    
    WSConnect --> BackendAccept{Backend รับ<br/>Connection?}
    
    BackendAccept -->|ไม่สำเร็จ| ErrorMsg[แสดงข้อความ Error]
    BackendAccept -->|สำเร็จ| OpenCamera[Backend: เปิดกล้อง<br/>cv2.VideoCapture]
    
    ErrorMsg --> End([จบการทำงาน])
    
    OpenCamera --> CameraCheck{กล้องเปิด<br/>สำเร็จ?}
    
    CameraCheck -->|ไม่สำเร็จ| SendError[ส่ง error message<br/>ปิด WebSocket]
    CameraCheck -->|สำเร็จ| LoopStart[เริ่ม Loop]
    
    SendError --> End
    
    LoopStart --> ReadFrame[อ่าน Frame จากกล้อง]
    
    ReadFrame --> FrameCheck{อ่าน Frame<br/>สำเร็จ?}
    
    FrameCheck -->|ไม่สำเร็จ| ReleaseCamera[ปิดกล้อง<br/>cap.release]
    FrameCheck -->|สำเร็จ| RunYOLO[รัน YOLO Model<br/>ตรวจจับวัตถุ]
    
    ReleaseCamera --> End
    
    RunYOLO --> CalcLatency[คำนวณ Latency<br/>time.time - start_time]
    
    CalcLatency --> Annotate[วาด Bounding Boxes<br/>บน Frame]
    
    Annotate --> EncodeFrame[Encode Frame เป็น<br/>Base64 JPEG]
    
    EncodeFrame --> ExtractDetect[แยกข้อมูล Detections<br/>x1,y1,x2,y2,conf,cls]
    
    ExtractDetect --> UpdateHistory[อัพเดท History<br/>เก็บ 10 วินาทีล่าสุด]
    
    UpdateHistory --> CleanOld[ลบข้อมูลเก่า<br/>เกิน 10 วินาที]
    
    CleanOld --> CountClasses[นับจำนวนแต่ละ Class<br/>ใน History]
    
    CountClasses --> PredictMost[หา Class ที่เจอ<br/>บ่อยที่สุด]
    
    PredictMost --> CalcFPS[คำนวณ FPS]
    
    CalcFPS --> CreateLog[สร้าง Log Message]
    
    CreateLog --> PrepareData[จัดเตรียม JSON Data:<br/>frame, detections, fps,<br/>latency, log, predicted]
    
    PrepareData --> SendWS{ส่งข้อมูล<br/>ผ่าน WebSocket}
    
    SendWS -->|สำเร็จ| Sleep[รอ 0.03 วินาที]
    SendWS -->|ไม่สำเร็จ| ReleaseCamera
    
    Sleep --> LoopStart
    
    %% Frontend Flow
    WSConnect -.->|เมื่อได้รับข้อมูล| ReceiveData[Frontend: รับ JSON Data]
    
    ReceiveData --> ParseJSON[Parse JSON]
    
    ParseJSON --> CheckError{มี error?}
    
    CheckError -->|มี| ShowError[แสดง Error ใน Logs]
    CheckError -->|ไม่มี| UpdateState[อัพเดท State:<br/>fps, latency, predicted]
    
    ShowError --> WaitNext[รอข้อมูลชุดถัดไป]
    
    UpdateState --> AddLog[เพิ่ม Log<br/>เก็บ 10 รายการล่าสุด]
    
    AddLog --> DecodeFrame[Decode Base64<br/>เป็น Image]
    
    DecodeFrame --> DrawCanvas[วาดภาพบน Canvas<br/>640x480]
    
    DrawCanvas --> WaitNext
    
    WaitNext -.-> ReceiveData
    
    %% User Stop
    UserClick -.->|กดปิดกล้อง| CloseWS[ปิด WebSocket]
    CloseWS --> UpdateStatus[อัพเดทสถานะ:<br/>disconnected]
    UpdateStatus --> End
    
    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style RunYOLO fill:#fff4e1
    style PredictMost fill:#e1f0ff
    style DrawCanvas fill:#f0e1ff
```

> หมายเหตุ: หากต้องการ export diagram นี้เป็น PNG เพิ่ม คำสั่ง:
```powershell
npx -y @mermaid-js/mermaid-cli -i docs/flowchart.md -o docs/diagrams/combined_flow.png -w 1800 -t default
```
(หรือจะแยกออกเป็นไฟล์ `.mmd` ภายหลัง)
