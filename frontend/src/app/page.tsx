// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a12 0%, #16213e 50%, #0a0a12 100%)' }}>
      {/* Background: dark gradients + animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(240,147,251,0.15),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(79,172,254,0.12),transparent)]" />
        <div className="absolute -left-20 top-24 h-96 w-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(240,147,251,0.3), transparent 70%)', animationDuration: '4s' }} />
        <div className="absolute right-0 -bottom-24 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.25), transparent 70%)', animationDuration: '6s' }} />
      </div>

      {/* Content */}
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-3xl border shadow-2xl backdrop-blur-2xl" 
             style={{ 
               borderColor: 'rgba(255, 255, 255, 0.1)', 
               background: 'rgba(0, 0, 0, 0.5)',
               boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
               backdropFilter: 'blur(30px) saturate(150%)',
               WebkitBackdropFilter: 'blur(30px) saturate(150%)'
             }}>
          <div className="p-12 text-center">
            {/* Logo / mark */}
            <div className="mx-auto mb-8 grid size-24 place-items-center rounded-3xl shadow-2xl animate-pulse" 
                 style={{ 
                   background: 'rgba(0, 0, 0, 0.6)',
                   backdropFilter: 'blur(15px) saturate(150%)',
                   WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                   border: '2px solid rgba(240, 147, 251, 0.4)',
                   animationDuration: '3s',
                   boxShadow: '0 0 40px rgba(240, 147, 251, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="8" stroke="#F9F7F7" strokeWidth="2.5"/>
                <circle cx="20" cy="20" r="3" fill="#F9F7F7"/>
                <path d="M8 20C8 13.4 13.4 8 20 8" stroke="#F9F7F7" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M32 20C32 26.6 26.6 32 20 32" stroke="#F9F7F7" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className="mb-4 font-black tracking-tight" style={{ 
              fontSize: '3rem', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f093fb 50%, #4facfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Eye Detection System
            </h1>
            <p className="mb-10 text-lg font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              ระบบตรวจจับและระบุตัวตนด้วย Face Recognition แบบ Real-time
            </p>

            {/* Features */}
            <div className="mb-10 grid gap-4 text-left sm:grid-cols-2">
              <div className="group rounded-2xl p-5 transition-all hover:scale-105" style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}>
                <div className="mb-3 text-3xl">🎯</div>
                <div className="mb-1 font-bold text-white">Real-time Detection</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>ตรวจจับใบหน้าแบบ Real-time</div>
              </div>
              <div className="group rounded-2xl p-5 transition-all hover:scale-105" style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}>
                <div className="mb-3 text-3xl">👤</div>
                <div className="mb-1 font-bold text-white">Face Recognition</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>ระบุตัวตนอัตโนมัติ</div>
              </div>
              <div className="group rounded-2xl p-5 transition-all hover:scale-105" style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}>
                <div className="mb-3 text-3xl">📊</div>
                <div className="mb-1 font-bold text-white">Live Statistics</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>แสดงสถิติแบบเรียลไทม์</div>
              </div>
              <div className="group rounded-2xl p-5 transition-all hover:scale-105" style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}>
                <div className="mb-3 text-3xl">💾</div>
                <div className="mb-1 font-bold text-white">Database Integration</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>เชื่อมต่อฐานข้อมูล</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/camera"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-4 font-bold shadow-2xl transition-all hover:scale-105 active:scale-100"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(15px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                  border: '1px solid rgba(240, 147, 251, 0.5)',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px 0 rgba(240, 147, 251, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                }}
              >
                <span className="relative z-10">เริ่มใช้งาน</span>
                <svg className="relative z-10 size-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity group-hover:opacity-20" />
              </Link>
            </div>

            {/* Footer info */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Powered by YOLO11n • FastAPI • Next.js • Supabase
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}