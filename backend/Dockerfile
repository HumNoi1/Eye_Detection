FROM python:3.10-slim

# ทำให้ pip เสถียรขึ้น และลดขนาด image
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=120

# เพิ่ม runtime libs ที่ OpenCV ต้องใช้
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 ffmpeg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ติดตั้ง PyTorch CPU-only ก่อน (สำคัญ)
# ใช้ index ของ PyTorch เพื่อดึง wheel แบบ +cpu ไม่โหลด CUDA ยักษ์ ๆ
RUN python -m pip install --upgrade pip && \
    pip install --retries 5 --timeout 120 \
      --index-url https://download.pytorch.org/whl/cpu \
      torch==2.1.0+cpu torchvision==0.16.0+cpu

# แล้วค่อยติดตั้ง requirements อื่น ๆ
COPY requirements.txt .
RUN pip install --retries 5 --timeout 120 -r requirements.txt

# คัดลอกโค้ดเข้า image
COPY . .

EXPOSE 8000
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
