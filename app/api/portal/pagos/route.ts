import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  // En producción real, obtendrías la matrícula del usuario logueado
  // const { data: { user } } = await supabase.auth.getUser()
  // const { data: profile } = await supabase.from('user_profiles').select('matricula').eq('email', user.email).single()
  const matricula = '0423' // Mock para prueba actual

  // 1. Obtener pagos mensuales (historial)
  const { data: payments } = await supabase
    .from('monthly_payments')
    .select('*')
    .eq('matricula', matricula)
    .order('anio', { ascending: false })
    .order('mes', { ascending: false })

  // 2. Obtener estado de suscripción (débito automático)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('matricula', matricula)
    .single()

  // 3. Obtener monto actual de cuota
  const { data: config } = await supabase
    .from('system_config')
    .select('valor')
    .eq('clave', 'cuota_mensual')
    .single()

  return NextResponse.json({
    payments: payments || [],
    subscription: subscription || null,
    montoMensual: parseFloat(config?.valor || '5000')
  })
}
