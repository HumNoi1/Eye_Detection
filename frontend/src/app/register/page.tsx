// app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(236,72,153,0.25),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(168,85,247,0.2),transparent),linear-gradient(to_bottom,var(--color-background),var(--color-background))]" />
      </div>

      <main className="grid md:grid-cols-2 min-h-dvh">
        {/* Left info */}
        <section className="order-2 md:order-1 hidden md:flex flex-col justify-center p-10">
          <Link
            href="/"
            className="w-fit rounded-full border border-black/10 px-3 py-1 text-sm opacity-80 transition hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            ← Back to Home
          </Link>
          <div className="mt-10">
          <div className="mt-10">
            <h1 className="text-4xl/tight font-semibold">Create account 🎉</h1>
            <p className="mt-3 max-w-md opacity-80">
              สมัครสมาชิกใหม่เพื่อใช้งานระบบ EyeRecog ได้เลย
            </p>
          </div>
          </div>
        </section>

        {/* Right form */}
        <section className="order-1 md:order-2 grid place-items-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/30">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold">Sign up</h2>
                <p className="mt-1 text-sm opacity-80">
                  สร้างบัญชีใหม่เพื่อเริ่มต้นการใช้งาน
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("UI Register (ยังไม่เชื่อม backend)");
                }}
                className="grid gap-4"
              >
                <label className="grid gap-1">
                  <span className="text-sm">ชื่อผู้ใช้</span>
                  <input
                    type="text"
                    required
                    placeholder="yourname"
                    className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-foreground/20 dark:border-white/20"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">อีเมล</span>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-foreground/20 dark:border-white/20"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">รหัสผ่าน</span>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 pr-12 outline-none focus:ring-2 ring-foreground/20 dark:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs opacity-70 hover:bg-black/[.04] hover:opacity-100 focus:ring-2 dark:hover:bg-white/[.06]"
                    >
                      {showPwd ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  className="mt-2 h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90 active:opacity-80"
                >
                  Sign up
                </button>

                <div className="text-center text-xs opacity-80">
                  มีบัญชีอยู่แล้ว?{" "}
                  <a href="/login" className="underline underline-offset-4">
                    กลับไปหน้า Login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}