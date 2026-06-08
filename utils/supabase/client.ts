'use client'

import { createBrowserClient } from '@supabase/ssr'

// Usado en Client Components ('use client')
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
