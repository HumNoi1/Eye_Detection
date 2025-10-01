// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background: gradients + soft blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(34,197,94,0.18),transparent),linear-gradient(to_bottom,var(--color-background),var(--color-background))]" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 opacity-25 blur-3xl" />
        <div className="absolute right-0 -bottom-24 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-3xl" />
      </div>

      {/* Content */}
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-black/20">
          {/* Logo / mark */}
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-black/10 bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md dark:border-white/15">
            <span className="text-xl font-semibold">ER</span>
          </div>

          <h1 className="text-3xl/tight font-semibold">
            EyeRecog
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm opacity-80">
            ระบบเข้าสู่ระบบและสมัครสมาชิกที่เรียบง่าย ปลอดภัย และใช้งานได้ทันที
          </p>

          {/* CTA buttons */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-background transition hover:opacity-90 active:opacity-80"
            >
              เริ่มใช้งาน (Start)
            </Link>
            
          </div>

          {/* Feature bullets */}
          <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm opacity-85">
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground/70" />
              UI เน้นความเรียบง่าย อ่านง่าย รองรับโหมดมืด
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground/70" />
              ฟอร์ม Login / Register แยกเป็นหน้า พร้อมลิงก์เชื่อมครบ
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground/70" />
              ดีไซน์ glass + gradient ดูทันสมัย เบาตา
            </li>
          </ul>

          {/* Footer links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs opacity-70">
            <a className="underline underline-offset-4" href="/login">เข้าสู่ระบบ</a>
            <span>•</span>
            <a className="underline underline-offset-4" href="/register">สมัครสมาชิก</a>
            <span>•</span>
            <Link className="underline underline-offset-4" href="/">กลับหน้าแรก</Link>
          </div>
        </div>
      </main>
    </div>
  );
}