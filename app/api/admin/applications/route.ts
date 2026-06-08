import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  // Join user_profiles + applications + payments
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      estado,
      monto_inscripcion,
      notas_admin,
      created_at,
      updated_at,
      matricula,
      user_profiles (
        nombre, apellido, dni, email, telefono, domicilio, cuit, estado
      ),
      payments (
        estado, monto, mp_payment_id, created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
