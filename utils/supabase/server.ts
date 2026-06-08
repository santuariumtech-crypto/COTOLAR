import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Usado en Server Components, Server Actions y Route Handlers
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwlkcalyypszqvhtwvlq.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bGtjYWx5eXBzenF2aHR3dmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODQ3MTcsImV4cCI6MjA5NjI2MDcxN30.l-016vh0btQMNvzZ49aIdekJJRAlJFR39azMLwCISWM'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components read-only, ignorar errores de escritura
          }
        },
      },
    }
  )
}
