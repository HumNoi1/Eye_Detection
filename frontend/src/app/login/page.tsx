"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  

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

      <main className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 md:grid-cols-2">
        {/* Left: marketing / brand */}
        <section className="order-2 md:order-1 flex flex-col justify-center p-6 md:p-10">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm opacity-80 transition hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            <span aria-hidden>←</span> EyeRecog Home
          </Link>

          <div className="mt-10">
            <h1 className="text-4xl/tight font-semibold">
              EyeRecog Home 👋
            </h1>
            <p className="mt-4 text-lg opacity-80">
              ระบบยืนยันตัวตนด้วยการตรวจจับใบหน้า ปลอดภัย และใช้งานง่าย
            </p>
            <div className="mt-8 grid gap-4">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-green-500" />
                <span className="text-sm opacity-70">เข้าสู่ระบบด้วยอีเมล</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-sm opacity-70">ตรวจจับใบหน้าแบบเรียลไทม์</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-purple-500" />
                <span className="text-sm opacity-70">ระบบรักษาความปลอดภัย</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: login card */}
        <section className="order-1 md:order-2 grid place-items-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/30">
              {/* Logo / Title */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl border border-black/10 bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md dark:border-white/15">
                  <span className="text-lg font-semibold">L</span>
                </div>
                <h2 className="text-2xl font-semibold">Sign in</h2>
                <p className="mt-1 text-sm opacity-80">
                  เข้าสู่ระบบด้วยอีเมลและรหัสผ่านของคุณ
                </p>
              </div>

              {/* Login Form (UI only) */}
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm">อีเมล</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 outline-none ring-foreground/20 transition placeholder:opacity-60 focus:ring-2 dark:border-white/20"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">รหัสผ่าน</span>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 pr-12 outline-none ring-foreground/20 transition placeholder:opacity-60 focus:ring-2 dark:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs opacity-70 ring-foreground/20 transition hover:bg-black/[.04] hover:opacity-100 focus:outline-none focus:ring-2 dark:hover:bg-white/[.06]"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between">
                  <label className="inline-flex select-none items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-foreground"
                      defaultChecked
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  onClick={() => alert("นี่คือหน้า UI อย่างเดียว (ยังไม่เชื่อม backend)")}
                  className="mt-1 h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90 active:opacity-80"
                >
                  Sign in
                </button>

                <div className="text-center text-xs opacity-80">
                  ยังไม่มีบัญชี?{" "}
                  <a className="underline underline-offset-4" href="#">
                    สร้างบัญชีใหม่
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/15" />
                <span className="text-xs opacity-60">or</span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/15" />
              </div>

              {/* Alternative Login Options */}
              <div className="flex justify-center">
                <a
                  href="/camera"
                  className="flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 text-sm backdrop-blur transition hover:bg-white/80 dark:border-white/15 dark:bg-black/30 dark:hover:bg-black/40"
                >
                  📷 Face Camera
                </a>
               
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