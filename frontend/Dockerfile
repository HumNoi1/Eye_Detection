# Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# ถ้าไม่มี package-lock.json ให้ใช้: RUN npm install
RUN npm ci

# สำคัญ: context คือ ./frontend อยู่แล้ว
COPY . .
RUN npm run build

# Runner
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# ปิดเทเลเมทรี Next.js (ถ้าต้องการ)
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
