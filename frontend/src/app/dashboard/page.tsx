"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** ========= Types ========= */
type Status = "ready" | "connected" | "disconnected" | "error";

type WSData =
  | {
      fps?: number;
      latency?: number;
      frame?: string; // base64 jpeg (optional)
      predicted?: string;
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
type PersonStats = {
  name: string;
  count: number;
  lastConfidence: number;
  maxConfidence: number;
  lastSeen: number;
};

type EventRow = {
  ts: number;
  name: string;
  confidence: number;
};

/** ========= Page ========= */
export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("ready");
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [logs, setLogs] = useState<string[]>(["Waiting for server..."]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [people, setPeople] = useState<Record<string, PersonStats>>({});
  const [fpsSeries, setFpsSeries] = useState<number[]>([]);
  const [latSeries, setLatSeries] = useState<number[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // ใช้ปลายทางเดียวกับหน้า live
  const wsUrl = useMemo(
    () => process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",
    []
  );

  // แปลง predictions ให้เป็น array ที่เรียงตามความมั่นใจ
  const normalizeCandidates = (preds?: WSData["predictions"]): Candidate[] => {
    if (!preds) return [];
    if (Array.isArray(preds)) {
      return preds
        .map((p) => ({
          name: p.name ?? "Unknown",
          confidence: clamp01(p.confidence ?? 0),
        }))
        .sort((a, b) => b.confidence - a.confidence);
    }
    return Object.entries(preds)
      .map(([name, c]) => ({
        name: name || "Unknown",
        confidence: clamp01(Number(c) || 0),
      }))
      .sort((a, b) => b.confidence - a.confidence);
  };

  const connect = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    )
      return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setStartTime(Date.now());
      setLogs((p) => [...tail(p), "WebSocket connected"]);
    };

    ws.onmessage = (ev) => {
      setMsgCount((n) => n + 1);
      let data: WSData;
      try {
        data = JSON.parse(ev.data);
      } catch {
        setLogs((p) => [...tail(p), "Invalid JSON from server"]);
        return;
      }
      if ("error" in data && data.error) {
        setLogs((p) => [...tail(p), `Server error: ${data.error}`]);
        return;
      }

      if ("fps" in data && typeof data.fps === "number") {
        setFps(data.fps);
        pushSeries(setFpsSeries, data.fps);
      }
      if ("latency" in data && typeof data.latency === "number") {
        setLatency(data.latency);
        pushSeries(setLatSeries, data.latency);
      }
      if ("log" in data && data.log) {
        setLogs((p) => [...tail(p), data.log!]);
      }
      if ("frame" in data && data.frame) {
        setTotalFrames((n) => n + 1);
      }
      if ("predictions" in data) {
        const arr = normalizeCandidates(data.predictions);
        setCandidates(arr);

        // อัปเดตคนที่ top-1 เป็นเหตุการณ์ล่าสุด
        const top = arr[0];
        if (top) {
          setEvents((evs) => [
            { ts: Date.now(), name: top.name, confidence: top.confidence },
            ...evs.slice(0, 49),
          ]);

          setPeople((m) => {
            const prev = m[top.name];
            const next: PersonStats = {
              name: top.name,
              count: (prev?.count ?? 0) + 1,
              lastConfidence: top.confidence,
              maxConfidence: Math.max(prev?.maxConfidence ?? 0, top.confidence),
              lastSeen: Date.now(),
            };
            return { ...m, [top.name]: next };
          });
        }
      }
    };

    const cleanup = (reason: string) => {
      setStatus(reason === "error" ? "error" : "disconnected");
      setLogs((p) => [...tail(p), `WebSocket closed: ${reason}`]);
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

  const uniquePeople = Object.keys(people).length;
  const uptime = startTime ? Date.now() - startTime : 0;

  const leaderboard = Object.values(people)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Recognition Dashboard</h1>
            <p className="opacity-70 text-sm">สรุปการทำงานแบบเรียลไทม์จากโมเดลตรวจจับใบหน้า/ดวงตา</p>
          </div>
          <div className="flex gap-2">
            {status === "connected" ? (
              <button
                onClick={disconnect}
                className="rounded-xl bg-foreground px-4 py-2 text-background hover:opacity-90"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                className="rounded-xl border border-foreground px-4 py-2 hover:bg-foreground hover:text-background"
              >
                Connect
              </button>
            )}
            <a
              href="/"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm opacity-80 hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
            >
              Open Live
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Status"
            value={<StatusPill status={status} />}
            subtitle=""
          />
          <StatCard title="Uptime" value={formatDuration(uptime)} subtitle="" />
          <StatCard title="FPS" value={fps.toFixed(1)} subtitle="current" />
          <StatCard title="Latency" value={`${latency | 0} ms`} subtitle="current" />
          <StatCard title="Frames" value={formatNumber(totalFrames)} subtitle="received" />
          <StatCard title="People" value={formatNumber(uniquePeople)} subtitle="detected" />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card title="FPS (last 60 samples)">
            <Sparkline data={fpsSeries} unit="" />
          </Card>
          <Card title="Latency (ms, last 60 samples)">
            <Sparkline data={latSeries} unit="ms" />
          </Card>
        </div>

        {/* Leaderboard + Logs */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Top people">
            {leaderboard.length === 0 ? (
              <Empty text="ยังไม่มีข้อมูลบุคคล" />
            ) : (
              <div className="grid gap-3">
                {leaderboard.map((p) => (
                  <PersonRow key={p.name} p={p} total={sumCounts(people)} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent logs">
            <div className="max-h-64 overflow-y-auto text-xs">
              {logs.slice().reverse().map((l, i) => (
                <div key={i} className="rounded bg-black/5 px-2 py-1 dark:bg-white/5">
                  {l}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent events">
            {events.length === 0 ? (
              <Empty text="ยังไม่มีเหตุการณ์ล่าสุด" />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs opacity-70">
                  <tr className="text-left">
                    <th className="py-1">เวลา</th>
                    <th className="py-1">ชื่อ</th>
                    <th className="py-1 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 10).map((e, i) => (
                    <tr key={i} className="border-t border-black/10 dark:border-white/10">
                      <td className="py-2">{new Date(e.ts).toLocaleTimeString()}</td>
                      <td className="py-2">{e.name}</td>
                      <td className="py-2 text-right">{(e.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/** ========= Small UI bits ========= */
function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-black/25">
      <div className="text-xs opacity-70">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {subtitle ? <div className="text-xs opacity-60">{subtitle}</div> : null}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-black/25">
      <div className="mb-2 text-sm font-medium opacity-90">{title}</div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm opacity-70 dark:border-white/20">
      {text}
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const color =
    status === "connected" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-gray-400";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-2.5 py-1 text-xs dark:border-white/15">
      <span className={`size-2 rounded-full ${color}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

function PersonRow({ p, total }: { p: PersonStats; total: number }) {
  const share = total ? (p.count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 p-3 dark:border-white/15">
      <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
        <span className="text-xs font-semibold">{p.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate font-medium">{p.name}</div>
          <div className="shrink-0 text-xs opacity-70">
            {p.count} • max {(p.maxConfidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
            style={{ width: `${Math.max(2, Math.min(100, Math.round(share))) | 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, unit }: { data: number[]; unit?: string }) {
  // ใช้ viewBox 0..100 (กว้าง) x 0..40 (สูง)
  const n = data.length;
  const pad = 2;
  const h = 40;
  const w = 100;
  if (!n) {
    return <div className="h-24 text-xs opacity-60">No data</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const toX = (i: number) => (i * (w - pad * 2)) / Math.max(1, n - 1) + pad;
  const toY = (v: number) => {
    const norm = (v - min) / span;
    const y = h - pad - norm * (h - pad * 2);
    return y;
  };

  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={w} height={h} rx="6" className="fill-black/5 dark:fill-white/5" />
      <path d={path} stroke="url(#sg)" strokeWidth="1.6" fill="none" />
      {/* baseline */}
      <line
        x1={pad}
        x2={w - pad}
        y1={h - pad}
        y2={h - pad}
        className="stroke-black/10 dark:stroke-white/10"
      />
      {/* last point dot */}
      <circle cx={toX(n - 1)} cy={toY(data[n - 1])} r="1.8" fill="url(#sg)" />
    </svg>
  );
}

/** ========= Utils ========= */
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function tail<T>(arr: T[], keep = 39) {
  return arr.slice(-keep);
}
function pushSeries(
  set: React.Dispatch<React.SetStateAction<number[]>>,
  v: number,
  max = 60
) {
  set((s) => {
    const next = [...s, v];
    if (next.length > max) next.shift();
    return next;
  });
}
function formatNumber(n: number) {
  return Intl.NumberFormat().format(n);
}
function formatDuration(ms: number) {
  if (!ms) return "-";
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [
    h ? `${h}h` : null,
    h || m ? `${m}m` : null,
    `${s}s`,
  ].filter(Boolean);
  return parts.join(" ");
}
function sumCounts(rec: Record<string, PersonStats>) {
  return Object.values(rec).reduce((a, b) => a + b.count, 0);
}
