"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** ===== Types ===== */
type Status = "ready" | "connected" | "disconnected" | "error";

type WSData =
  | {
      fps?: number;
      latency?: number;
      frame?: string; // base64 jpeg
      predicted?: string; // top identity (string)
      predictions?: Array<{ name: string; confidence: number }>;
      log?: string;
      error?: string;
    }
  | {
      fps?: number;
      latency?: number;
      frame?: string;
      predicted?: string;
      predictions?: Record<string, number>;
      log?: string;
      error?: string;
    };

type Candidate = { name: string; confidence: number };

/** ===== Page ===== */
export default function FaceDetectionPage() {
  const [status, setStatus] = useState<Status>("ready");
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [logs, setLogs] = useState<string[]>(["Waiting for camera..."]);
  const [predicted, setPredicted] = useState("");
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
  const pct = (n: number) => `${(clamp01(n) * 100).toFixed(1)}%`;

  const normalizeCandidates = (preds?: WSData["predictions"]): Candidate[] => {
    if (!preds) return [];
    if (Array.isArray(preds)) {
      return preds
        .map((p) => ({ name: p.name ?? "Unknown", confidence: clamp01(p.confidence ?? 0) }))
        .sort((a, b) => b.confidence - a.confidence);
    }
    return Object.entries(preds)
      .map(([name, c]) => ({ name: name || "Unknown", confidence: clamp01(Number(c) || 0) }))
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
      // @ts-ignore
      const bmp: ImageBitmap = await createImageBitmap(blob);
      // ปรับ canvas ให้คงอัตราส่วน 16:9 (1280x720)
      if (canvas.width !== 1280 || canvas.height !== 720) {
        canvas.width = 1280;
        canvas.height = 720;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      // @ts-ignore
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
      if ("predictions" in data) setCandidates(normalizeCandidates(data.predictions));
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
  const top = candidates[0];

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
                <div className="flex gap-2">
                  {status === "connected" ? (
                    <button
                      onClick={disconnect}
                      className="rounded-xl bg-foreground px-5 py-2 text-background transition hover:opacity-90 active:opacity-80"
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

              {/* Logs */}
              <div className="mt-4">
                <p className="mb-1 text-sm opacity-70">Logs</p>
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
              <p className="text-sm opacity-70">Top match</p>
              <div className="mt-1 text-2xl font-bold">{top ? top.name : "None"}</div>
              <div className="mt-2">
                <Progress value={(top?.confidence ?? 0) * 100} />
                <div className="mt-1 text-xs opacity-70">Confidence: {pct(top?.confidence ?? 0)}</div>
              </div>
              <div className="mt-1 text-xs opacity-70">Predicted: {predicted || "-"}</div>
            </div>

            {/* All candidates */}
            <div className="mt-5">
              <p className="mb-2 text-sm opacity-70">All candidates</p>
              <div className="grid gap-3">
                {candidates.length === 0 && (
                  <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm opacity-70 dark:border-white/20">
                    ยังไม่มีข้อมูลผู้สมัครที่ตรวจจับได้
                  </div>
                )}
                {candidates.map((c) => (
                  <PersonCard key={c.name} name={c.name} confidence={c.confidence} />
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

function PersonCard({ name, confidence }: { name: string; confidence: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 p-3 dark:border-white/15">
      <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
        <span className="text-sm font-semibold">{name?.trim()?.charAt(0)?.toUpperCase() || "?"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate font-medium">{name || "Unknown"}</div>
          <div className="shrink-0 text-xs opacity-70">{(confidence * 100).toFixed(1)}%</div>
        </div>
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
