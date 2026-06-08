import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('system_config')
    .select('clave, valor, descripcion')
    .order('clave')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Retorna como objeto { clave: valor }
  const config: Record<string, string> = {}
  for (const row of data || []) {
    config[row.clave] = row.valor
  }
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const body = await request.json()
  // body: { clave: string, valor: string }
  const { clave, valor } = body

  if (!clave || !valor) {
    return NextResponse.json({ error: 'clave y valor son requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('system_config')
    .update({ valor, updated_at: new Date().toISOString() })
    .eq('clave', clave)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
