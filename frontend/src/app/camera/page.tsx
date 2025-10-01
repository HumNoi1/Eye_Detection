"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** ===== Types ===== */
type Status = "ready" | "connected" | "disconnected" | "error";

type UserInfo = {
  user_id: string;
  username: string;
  student_id: string;
  label: string;
  created_at: string;
  updated_at?: string;
};

type PredictionStats = {
  [label: string]: {
    count: number;
    percentage: number;
    user?: UserInfo | null;  // user info for each detected person
  };
};

type WSData = {
  fps?: number;
  latency?: number;
  frame?: string; // base64 jpeg
  predicted?: string; // top identity (string)
  predicted_percentage?: number; // confidence percentage of top prediction
  prediction_stats?: PredictionStats; // all detected people with percentages
  history_size?: number; // number of detections in 5s window
  log?: string;
  error?: string;
  user?: UserInfo | null; // user info from database
};

type Candidate = { 
  name: string; 
  confidence: number; 
  count?: number;
  user?: UserInfo | null;  // user info from database
};

/** ===== Page ===== */
export default function FaceDetectionPage() {
  const [status, setStatus] = useState<Status>("ready");
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [logs, setLogs] = useState<string[]>(["Waiting for camera..."]);
  const [predicted, setPredicted] = useState("");
  const [predictedPercentage, setPredictedPercentage] = useState(0);
  const [_predictionStats, setPredictionStats] = useState<PredictionStats>({}); // kept for future use
  const [historySize, setHistorySize] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // เปลี่ยนปลายทางได้ด้วย NEXT_PUBLIC_WS_URL
  const wsUrl = useMemo(
    () => process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",
    []
  );

  /** ===== Helpers ===== */
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

  const normalizeCandidates = (stats?: PredictionStats): Candidate[] => {
    if (!stats) return [];
    return Object.entries(stats)
      .map(([name, data]) => ({
        name: name || "Unknown",
        confidence: clamp01(data.percentage / 100),
        count: data.count,
        user: data.user  // include user info from backend
      }))
      .sort((a, b) => b.confidence - a.confidence);
  };

  // throttle การวาดที่ฝั่ง UI (~33fps)
  const lastDrawAtRef = useRef(0);
  const MIN_DRAW_INTERVAL_MS = 30;

  const drawFrame = async (b64?: string) => {
    if (!b64) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = performance.now();
    if (now - lastDrawAtRef.current < MIN_DRAW_INTERVAL_MS) return;
    lastDrawAtRef.current = now;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const src = "data:image/jpeg;base64," + b64;

    // เร็ว: createImageBitmap (fallback เป็น Image())
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const bmp: ImageBitmap = await createImageBitmap(blob);
      // ปรับ canvas ให้คงอัตราส่วน 16:9 (1280x720)
      if (canvas.width !== 1280 || canvas.height !== 720) {
        canvas.width = 1280;
        canvas.height = 720;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      if (bmp.close) bmp.close();
    } catch {
      const img = new Image();
      img.onload = () => {
        if (canvas.width !== 1280 || canvas.height !== 720) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = src;
    }
  };

  /** ===== WS Connect / Disconnect ===== */
  const connect = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setLogs((p) => [...p.slice(-9), "WebSocket connected"]);
    };

    ws.onmessage = (event) => {
      let data: WSData;
      try {
        data = JSON.parse(event.data);
      } catch {
        setLogs((p) => [...p.slice(-9), "Invalid JSON from server"]);
        return;
      }

      if ("error" in data && data.error) {
        setLogs((p) => [...p.slice(-9), `Server error: ${data.error}`]);
        return;
      }

      if ("fps" in data && typeof data.fps === "number") setFps(data.fps);
      if ("latency" in data && typeof data.latency === "number") setLatency(data.latency);
      if ("log" in data && data.log) setLogs((p) => [...p.slice(-9), data.log ?? ""]);
      
      if ("predicted" in data && typeof data.predicted === "string") setPredicted(data.predicted);
      if ("predicted_percentage" in data && typeof data.predicted_percentage === "number") 
        setPredictedPercentage(data.predicted_percentage);
      if ("prediction_stats" in data) {
        setPredictionStats(data.prediction_stats || {});
        setCandidates(normalizeCandidates(data.prediction_stats));
      }
      if ("history_size" in data && typeof data.history_size === "number") 
        setHistorySize(data.history_size);
      if ("user" in data) setUserInfo(data.user || null);
      
      if ("frame" in data && data.frame) void drawFrame(data.frame);
    };

    const cleanup = (reason: string) => {
      setStatus(reason === "error" ? "error" : "disconnected");
      setLogs((p) => [...p.slice(-9), `WebSocket closed: ${reason}`]);
      if (wsRef.current) {
        try {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
        } catch {}
      }
      wsRef.current = null;
    };

    ws.onclose = () => cleanup("normal");
    ws.onerror = () => {
      try {
        ws.close();
      } catch {}
      cleanup("error");
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
    }
  };

  // cleanup ตอน unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  /** ===== Render ===== */
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background: gradient + blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,0.22),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(34,197,94,0.18),transparent),linear-gradient(to_bottom,var(--color-background),var(--color-background))]" />
        <div className="absolute -left-24 top-24 size-[360px] rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-indigo-500 to-sky-400" />
        <div className="absolute right-0 -bottom-24 size-[420px] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-emerald-500 to-teal-400" />
        <div className="absolute right-16 top-16 hidden sm:block">
          <Sparkles />
        </div>
      </div>

      <main className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 gap-8 p-6 lg:grid-cols-3 lg:gap-10">
        {/* กล้องใหญ่ เต็ม 2 คอลัมน์ */}
        <section className="lg:col-span-2">
          <div className="rounded-3xl border border-black/10 bg-white/70 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/25">
            <div className="flex items-center justify-between gap-4 px-6 pt-5">
              <h2 className="text-xl font-semibold">Live Camera</h2>
              <StatusPill status={status} />
            </div>

            <div className="px-6 pb-6">
              {/* อัตราส่วน 16:9 และขยายเต็มความกว้าง */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/15">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    width={1280}
                    height={720}
                  />
                  {status !== "connected" && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="rounded-xl bg-black/10 px-4 py-3 text-sm backdrop-blur dark:bg-white/10">
                        กด “เริ่มสตรีม” เพื่อเปิดกล้อง
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls + Stats */}
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="flex gap-2 flex-wrap">
                  {status === "connected" ? (
                    <button
                      onClick={disconnect}
                      className="rounded-xl border border-foreground px-5 py-2 text-foreground transition hover:bg-foreground hover:text-background active:opacity-80"
                    >
                      หยุดสตรีม
                    </button>
                  ) : (
                    <button
                      onClick={connect}
                      className="rounded-xl border border-foreground px-5 py-2 text-foreground transition hover:bg-foreground hover:text-background active:opacity-80"
                    >
                      เริ่มสตรีม
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <p className="opacity-70">FPS</p>
                    <p className="text-lg font-semibold">{fps}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Latency (ms)</p>
                    <p className="text-lg font-semibold">{latency}</p>
                  </div>
                </div>
              </div>

              {/* System Logs */}
              <div className="mt-4">
                <p className="mb-1 text-sm opacity-70">System Logs</p>
                <div className="max-h-40 overflow-y-auto rounded-lg bg-black/5 p-2 text-xs dark:bg-white/5">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* แสดงผลทาย: แยก "กลุ่มใครกลุ่มมัน" เป็นการ์ดรายบุคคล */}
        <section className="lg:col-span-1">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/25">
            <h3 className="text-lg font-semibold">Recognition</h3>

            {/* Top match */}
            <div className="mt-4 rounded-2xl border border-black/10 p-4 dark:border-white/15">
              <p className="text-sm opacity-70">Top Prediction</p>
              <div className="mt-1 text-2xl font-bold">{predicted || "None"}</div>
              
              {/* Display user info from database if available */}
              {userInfo ? (
                <div className="mt-3 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">👤</span>
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {userInfo.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">🎓</span>
                      <span className="font-mono text-xs">
                        Student ID: {userInfo.student_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">🏷️</span>
                      <span className="font-mono text-xs">
                        Label: {userInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              ) : predicted && (
                <div className="mt-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/30">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    ⚠️ No user data found for label &quot;{predicted}&quot;
                  </p>
                </div>
              )}
              
              <div className="mt-3">
                <Progress value={predictedPercentage} />
                <div className="mt-1 text-xs opacity-70">
                  Confidence: {predictedPercentage.toFixed(1)}% ({historySize} detections)
                </div>
              </div>
            </div>

            {/* User Info from Database */}
            {userInfo && (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  👤 User Information
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Name:</span>
                    <span className="font-semibold">{userInfo.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Student ID:</span>
                    <span className="font-semibold">{userInfo.student_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Label:</span>
                    <span className="font-mono text-xs">{userInfo.label}</span>
                  </div>
                </div>
              </div>
            )}

            {/* All detected people */}
            <div className="mt-5">
              <p className="mb-2 text-sm opacity-70">
                All Detected People (Last 5s)
              </p>
              <div className="grid gap-3">
                {candidates.length === 0 && (
                  <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm opacity-70 dark:border-white/20">
                    ยังไม่มีการตรวจจับ
                  </div>
                )}
                {candidates.map((c) => (
                  <PersonCard 
                    key={c.name} 
                    name={c.name} 
                    confidence={c.confidence}
                    count={c.count}
                    isTop={c.name === predicted}
                    user={c.user}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/** ===== UI Bits ===== */
function StatusPill({ status }: { status: Status }) {
  const color =
    status === "connected" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-gray-400";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs dark:border-white/15">
      <span className={`size-2 rounded-full ${color}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

function PersonCard({ 
  name, 
  confidence, 
  count, 
  isTop,
  user 
}: { 
  name: string; 
  confidence: number; 
  count?: number;
  isTop?: boolean;
  user?: UserInfo | null;
}) {
  const borderColor = isTop 
    ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
    : "border-black/10 dark:border-white/15";
  
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${borderColor}`}>
      <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
        <span className="text-sm font-semibold">{name?.trim()?.charAt(0)?.toUpperCase() || "?"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium">{name || "Unknown"}</div>
            {isTop && <span className="text-xs">👑</span>}
          </div>
          <div className="shrink-0 text-xs opacity-70">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
        
        {/* Display user info from database */}
        {user && (
          <div className="mt-1 space-y-0.5 text-xs">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span>👤</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <span>🎓</span>
              <span className="font-mono">{user.student_id}</span>
            </div>
          </div>
        )}
        
        {count !== undefined && (
          <div className="text-xs opacity-60 mt-1">
            {count} detections
          </div>
        )}
        <div className="mt-1">
          <Progress value={confidence * 100} />
        </div>
      </div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${v}%` }} />
    </div>
  );
}

function Sparkles() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden className="opacity-50">
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
