import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// ─── Webhook de Mercado Pago ──────────────────────────────────────────────────
// MP envía notificaciones POST a esta ruta cuando cambia el estado de un pago.
// La URL debe estar configurada en el dashboard de MP como "Webhook URL".
// Para pruebas locales: usa ngrok o similar para exponer localhost.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ''

async function getMPPayment(paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[Webhook MP] Recibido:', JSON.stringify(body))

    // MP envía distintos tipos de notificaciones
    const type = body.type || body.topic
    const dataId = body.data?.id || body.id

    if (type !== 'payment' || !dataId) {
      // Ignorar notificaciones que no sean de pago
      return NextResponse.json({ received: true })
    }

    // 1. Consultar el pago en la API de MP para obtener estado real
    let paymentData: Record<string, unknown> | null = null
    
    if (MP_ACCESS_TOKEN && !MP_ACCESS_TOKEN.startsWith('TEST-0000')) {
      paymentData = await getMPPayment(dataId)
    }

    // Si no hay token real, simulamos para testing
    if (!paymentData) {
      console.log('[Webhook MP] Sin token real — modo simulación')
      return NextResponse.json({ received: true, simulated: true })
    }

    const {
      status,                    // 'approved' | 'rejected' | 'pending' | 'in_process'
      external_reference,        // application_id
      id: mp_payment_id,
      transaction_amount,
      payment_method_id,
    } = paymentData as {
      status: string,
      external_reference: string,
      id: string,
      transaction_amount: number,
      payment_method_id: string,
    }

    if (!external_reference) {
      return NextResponse.json({ error: 'Sin external_reference' }, { status: 400 })
    }

    // 2. Actualizar tabla payments
    await supabase
      .from('payments')
      .update({
        mp_payment_id: String(mp_payment_id),
        estado: status,
        monto: transaction_amount,
        metodo_pago: payment_method_id,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', external_reference)

    // 3. Si aprobado → actualizar estado del trámite
    if (status === 'approved') {
      await supabase
        .from('applications')
        .update({
          estado: 'aprobado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', external_reference)

      // También actualizar el estado de user_profiles
      const { data: app } = await supabase
        .from('applications')
        .select('matricula')
        .eq('id', external_reference)
        .single()

      if (app?.matricula) {
        await supabase
          .from('user_profiles')
          .update({ estado: 'activo', updated_at: new Date().toISOString() })
          .eq('matricula', app.matricula)

        // También sincronizar con la tabla tramites para el portal
        await supabase
          .from('tramites')
          .update({ paso_4_done: true, estado: 'activa', updated_at: new Date().toISOString() })
          .eq('matricula', app.matricula)
      }

      console.log(`[Webhook MP] Pago APROBADO para application ${external_reference}`)
    }

    if (status === 'rejected') {
      await supabase
        .from('applications')
        .update({
          estado: 'pendiente_pago',
          notas_admin: 'Pago rechazado por Mercado Pago. El usuario debe reintentar.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', external_reference)

      console.log(`[Webhook MP] Pago RECHAZADO para application ${external_reference}`)
    }

    return NextResponse.json({ received: true, status })

  } catch (error) {
    console.error('[Webhook MP] Error:', error)
    // MP reintenta si no recibe 2xx, por eso siempre devolvemos 200 aunque haya error interno
    return NextResponse.json({ received: true, error: 'Internal error logged' })
  }
}

// GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    status: 'Webhook de Mercado Pago activo',
    timestamp: new Date().toISOString(),
  })
}
