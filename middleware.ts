import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Emails con acceso al panel de administración
const ADMIN_EMAILS = ['admin@cotolar.org.ar', 'secretaria@cotolar.org.ar']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwlkcalyypszqvhtwvlq.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bGtjYWx5eXBzenF2aHR3dmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODQ3MTcsImV4cCI6MjA5NjI2MDcxN30.l-016vh0btQMNvzZ49aIdekJJRAlJFR39azMLwCISWM'

    // 1. Crear cliente de Supabase que refresca la sesión automáticamente via cookies
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 2. Obtener usuario autenticado (refresca la sesión si está por vencer)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // ── Regla 1: Si ya está logueado e intenta ir a /login → redirigir a /portal ──
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    // ── Regla 2: Rutas del Portal /portal/** requieren sesión activa ──
    if (pathname.startsWith('/portal')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
    }

    // ── Regla 3: Rutas del Admin /admin/** requieren ser admin ──
    if (pathname.startsWith('/admin')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      // Verificar si el email del usuario tiene rol admin
      const email = user.email || ''
      const isAdmin = ADMIN_EMAILS.includes(email)

      if (!isAdmin) {
        // No es admin → redirigir a home con mensaje
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('error', 'no-admin')
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    // Si hay algún error catastrófico en el middleware, no rompas la app entera (500)
    console.error("Middleware error:", error)
  }

  // Retornar la respuesta con las cookies de sesión actualizadas
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ejecutar el proxy en todas las rutas EXCEPTO:
     * - Recursos estáticos (_next/static, _next/image, favicon.ico)
     * - API routes públicas (webhooks, banners)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/banners|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
