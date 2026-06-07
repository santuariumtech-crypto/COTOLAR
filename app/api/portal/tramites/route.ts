import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const MATRICULA = '0423'

export async function GET() {
  const { data, error } = await supabase
    .from('tramites')
    .select('*')
    .eq('matricula', MATRICULA)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data || null)
}

export async function PUT(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('tramites')
    .upsert({ ...body, matricula: MATRICULA, updated_at: new Date().toISOString() }, { onConflict: 'matricula' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
