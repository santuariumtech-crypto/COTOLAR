'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Traducir errores comunes al español
    const msg = traducirError(error.message)
    redirect(`/login?error=${encodeURIComponent(msg)}`)
  }

  revalidatePath('/', 'layout')
  
  // Redirigir según el email (admin o usuario normal)
  const ADMIN_EMAILS = ['admin@cotolar.org.ar', 'secretaria@cotolar.org.ar']
  redirect(ADMIN_EMAILS.includes(email) ? '/admin' : '/portal')
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, apellido },
    },
  })

  if (error) {
    const msg = traducirError(error.message)
    redirect(`/login?error=${encodeURIComponent(msg)}&tab=registro`)
  }

  // Si el usuario ya existe pero no verificó su email
  if (data.user && data.session === null) {
    redirect('/login?info=verificar-email')
  }

  revalidatePath('/', 'layout')
  redirect('/portal')
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── Helper: traducir mensajes de error de Supabase ──────────────────────────
function traducirError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos'
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email'
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres'
  if (msg.includes('Unable to validate email address')) return 'El email ingresado no es válido'
  if (msg.includes('Email not confirmed')) return 'Debés confirmar tu email antes de ingresar'
  if (msg.includes('Too many requests')) return 'Demasiados intentos. Esperá unos minutos'
  return 'Ocurrió un error. Intentá nuevamente.'
}
