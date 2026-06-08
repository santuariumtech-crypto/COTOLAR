import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      user_profiles (*),
      payments (*),
      documents (*)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const { estado, notas_admin, matricula, estadoMatricula } = body

  // Update application
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .update({
      ...(estado && { estado }),
      ...(notas_admin !== undefined && { notas_admin }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (appError) return NextResponse.json({ error: appError.message }, { status: 500 })

  // If also updating user's estado
  if (estadoMatricula && matricula) {
    await supabase
      .from('user_profiles')
      .update({ estado: estadoMatricula, updated_at: new Date().toISOString() })
      .eq('matricula', matricula)
  }

  return NextResponse.json(appData)
}
