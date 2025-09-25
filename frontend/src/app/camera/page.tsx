"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Detection {
  bbox: [number, number, number, number];
  label: string;
  confidence: number;
}

export default function FaceDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<'ready' | 'connecting' | 'running' | 'error'>('ready');
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);

  const API_URL = 'http://localhost:8000/infer/eye';

  const startCamera = async () => {
    try {
      setStatus('connecting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setStatus('running');
        startFrameCapture();
      }
    } catch (err) {
      setError('Failed to access camera: ' + (err as Error).message);
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsStreaming(false);
    setStatus('ready');
    setDetections([]);
    setFps(0);
    setLatency(0);
  };

  const captureAndSendFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const startTime = Date.now();

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        const endTime = Date.now();
        setLatency(endTime - startTime);

        if (result.error) {
          setError(result.error);
          setStatus('error');
        } else {
          setDetections(result.detections || []);
          setError(null);
        }
      } catch (err) {
        setError('Failed to send frame: ' + (err as Error).message);
        setStatus('error');
      }
    }, 'image/jpeg', 0.8);
  }, [isStreaming, API_URL]);

  const startFrameCapture = () => {
    const captureFrame = () => {
      const now = Date.now();
      if (now - lastFrameTimeRef.current >= 200) { // 200ms interval
        captureAndSendFrame();
        lastFrameTimeRef.current = now;

        // Calculate FPS
        setFps(prev => prev * 0.9 + (1000 / (now - lastFrameTimeRef.current)) * 0.1);
      }

      if (isStreaming) {
        animationFrameRef.current = requestAnimationFrame(captureFrame);
      }
    };

    captureFrame();
  };

  const drawOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detections
    detections.forEach(detection => {
      const [x1, y1, x2, y2] = detection.bbox;

      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw label
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      const label = `${detection.label} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.fillText(label, x1, y1 - 5);
    });
  }, [detections]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background: gradient + blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,0.25),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(16,185,129,0.2),transparent),linear-gradient(to_bottom,var(--color-background),var(--color-background))]" />
        <div className="absolute -left-24 top-24 size-[360px] rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-blue-500 to-cyan-400" />
        <div className="absolute right-0 -bottom-24 size-[420px] rounded-full blur-3xl opacity-25 bg-gradient-to-tr from-emerald-500 to-teal-400" />
        <div className="absolute right-16 top-16 hidden sm:block">
          <Sparkles />
        </div>
      </div>

      <main className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left: marketing / brand */}
        <section className="order-2 lg:order-1 hidden lg:flex flex-col justify-center p-10">
          <a
            href="/login"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm opacity-80 transition hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            <span aria-hidden>←</span> Back to Login
          </a>

          <div className="mt-10">
            <h1 className="text-4xl/tight font-semibold">
              Camera Preview 📷
            </h1>
            <p className="mt-4 text-lg opacity-80">
              ระบบกล้องแบบเรียลไทม์ สำหรับการแสดงผลวิดีโอจากกล้องหน้า
            </p>
            <div className="mt-8 grid gap-4">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-green-500" />
                <span className="text-sm opacity-70">แสดงผลแบบเรียลไทม์</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-sm opacity-70">รองรับกล้องหน้า</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-purple-500" />
                <span className="text-sm opacity-70">คุณภาพ HD</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: camera card */}
        <section className="order-1 lg:order-2 grid place-items-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/30">
              {/* Logo / Title */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl border border-black/10 bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md dark:border-white/15">
                  <span className="text-lg">📷</span>
                </div>
                <h2 className="text-2xl font-semibold">Camera Preview</h2>
                <p className="mt-1 text-sm opacity-80">
                  เปิดกล้องเพื่อดูภาพแบบเรียลไทม์
                </p>
              </div>

              {/* Camera Section */}
              <div className="mb-6">
                <div className="relative mx-auto h-64 w-full overflow-hidden rounded-xl border-2 border-dashed border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/5">
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Canvas for overlay */}
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute inset-0 h-full w-full pointer-events-none"
                  />
                  {/* Hidden canvas for frame capture */}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />

                  {!isStreaming && (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-3 size-16 rounded-full bg-black/10 flex items-center justify-center dark:bg-white/10">
                          <span className="text-2xl">📷</span>
                        </div>
                        <p className="text-sm opacity-70">กดปุ่มด้านล่างเพื่อเปิดกล้อง</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Display */}
              <div className="mb-4 space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border border-black/10 dark:border-white/15">
                  <div className={`size-2 rounded-full ${
                    status === 'running' ? 'bg-green-500' :
                    status === 'connecting' ? 'bg-yellow-500' :
                    status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="capitalize">{status}</span>
                </div>

                {status === 'running' && (
                  <div className="flex justify-between text-xs opacity-70">
                    <span>FPS: {fps.toFixed(1)}</span>
                    <span>Latency: {latency}ms</span>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid gap-3">
                {!isStreaming ? (
                  <button
                    onClick={startCamera}
                    className="h-11 w-full rounded-xl font-medium transition bg-foreground text-background hover:opacity-90 active:opacity-80"
                  >
                    เปิดกล้อง
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="h-11 w-full rounded-xl font-medium transition bg-red-500 text-white hover:bg-red-600 active:opacity-80"
                  >
                    ปิดกล้อง
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 text-xs opacity-70">
                <p className="mb-2 font-medium">คำแนะนำ:</p>
                <ul className="space-y-1">
                  <li>• อนุญาตให้เข้าถึงกล้องเมื่อเบราว์เซอร์ขอสิทธิ์</li>
                  <li>• ตรวจสอบให้แน่ใจว่ากล้องไม่ถูกใช้งานโดยแอปอื่น</li>
                  <li>• ให้แสงสว่างเพียงพอสำหรับภาพที่ชัดเจน</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Sparkles() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden
      className="opacity-50"
    >
      <g filter="url(#f1)">
        <path d="M70 10 L75 35 L100 40 L75 45 L70 70 L65 45 L40 40 L65 35 Z" fill="url(#g1)" />
      </g>
      <g filter="url(#f2)">
        <circle cx="110" cy="28" r="6" fill="url(#g2)" />
      </g>
      <defs>
        <linearGradient id="g1" x1="40" y1="10" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="g2" x1="104" y1="22" x2="116" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <filter id="f1" x="30" y="0" width="80" height="90" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
        </filter>
        <filter id="f2" x="100" y="18" width="20" height="20" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
        </filter>
      </defs>
    </svg>
  );
}