import { createClient } from '@supabase/supabase-js'

// Claves públicas (es seguro hardcodearlas ya que Next.js las expone al cliente de todas formas)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwlkcalyypszqvhtwvlq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bGtjYWx5eXBzenF2aHR3dmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODQ3MTcsImV4cCI6MjA5NjI2MDcxN30.l-016vh0btQMNvzZ49aIdekJJRAlJFR39azMLwCISWM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Banner = {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  type: 'hero' | 'evento' | 'publicidad'
  active: boolean
  order_index: number
  created_at: string
}
