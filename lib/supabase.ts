import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
