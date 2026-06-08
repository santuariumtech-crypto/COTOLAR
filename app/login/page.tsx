import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Iniciar Sesión — COTOLAR',
  description: 'Portal de autogestión del Colegio de Terapia Ocupacional de La Rioja',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f3460] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1abc9c]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1abc9c] to-[#0f3460] shadow-xl shadow-[#1abc9c]/20 mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 3c2.2 0 4.2.7 5.8 1.9L7.9 21.8C6.7 20.2 6 18.2 6 16c0-5.5 4.5-9 10-9zm0 18c-2.2 0-4.2-.7-5.8-1.9l13.9-12.9c1.2 1.6 1.9 3.6 1.9 5.8 0 5.5-4.5 9-10 9z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">COTOLAR</h1>
          <p className="text-sm text-slate-400 mt-1">Portal de Autogestión Profesional</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Colegio de Terapia Ocupacional de La Rioja © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
