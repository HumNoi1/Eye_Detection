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
          

          {/* CTA buttons */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/camera"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-background transition hover:opacity-90 active:opacity-80"
            >
              เริ่มใช้งาน (Start)
            </Link>
            
          </div>

          

        </div>
      </main>
    </div>
  );
}