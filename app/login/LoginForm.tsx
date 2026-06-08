'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { login, signup } from '@/app/auth/actions'
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')
  const infoMsg = searchParams.get('info')
  const tabParam = searchParams.get('tab')

  const [tab, setTab] = useState<'login' | 'registro'>(tabParam === 'registro' ? 'registro' : 'login')
  const [showPass, setShowPass] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleLogin = (formData: FormData) => {
    startTransition(() => { login(formData) })
  }

  const handleSignup = (formData: FormData) => {
    startTransition(() => { signup(formData) })
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
        {(['login', 'registro'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-white text-[#0f3460] shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        ))}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl p-3.5 mb-5">
          <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-300">{decodeURIComponent(errorMsg)}</p>
        </div>
      )}

      {/* Info message (ej: verificar email) */}
      {infoMsg === 'verificar-email' && (
        <div className="flex items-start gap-2.5 bg-blue-500/15 border border-blue-500/30 rounded-xl p-3.5 mb-5">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-300">
            Te enviamos un email de confirmación. Revisá tu bandeja de entrada y hacé clic en el link para activar tu cuenta.
          </p>
        </div>
      )}

      {/* ── FORMULARIO LOGIN ── */}
      {tab === 'login' && (
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <Link href="/login?tab=olvide" className="text-xs text-[#1abc9c] hover:text-[#17a589] transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-10 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1abc9c] to-[#0f3460] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#1abc9c]/20 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando...</>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Demo admin hint */}
          <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 text-center">
              <span className="font-semibold text-slate-300">Admin:</span> admin@cotolar.org.ar
            </p>
          </div>
        </form>
      )}

      {/* ── FORMULARIO REGISTRO ── */}
      {tab === 'registro' && (
        <form action={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ana"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Apellido</label>
              <input
                name="apellido"
                type="text"
                required
                placeholder="López"
                className="w-full h-11 px-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña <span className="text-slate-500 font-normal">(mín. 6 caracteres)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-10 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-[#1abc9c]/60 focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1abc9c] to-[#0f3460] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#1abc9c]/20 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Al registrarte aceptás los{' '}
            <Link href="/institucional" className="text-[#1abc9c] hover:underline">
              términos y condiciones
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
