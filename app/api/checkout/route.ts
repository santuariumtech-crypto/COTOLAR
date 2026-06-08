import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// ─── Mercado Pago Checkout ─────────────────────────────────────────────────────
// Configura estas variables en Vercel / .env.local cuando tengas las credenciales reales:
// MP_ACCESS_TOKEN=TEST-xxxx (Sandbox) o APP_USR-xxxx (Producción)
// NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxx
// APP_URL=https://tu-sitio.vercel.app

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
const APP_URL = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { application_id, matricula } = body

    if (!application_id) {
      return NextResponse.json({ error: 'application_id es requerido' }, { status: 400 })
    }

    // 1. Obtener el monto dinámico desde system_config
    const { data: config } = await supabase
      .from('system_config')
      .select('valor')
      .eq('clave', 'monto_inscripcion')
      .single()

    const monto = config ? parseInt(config.valor) : 15000

    // 2. Crear preferencia en Mercado Pago
    const preferenceBody = {
      items: [
        {
          id: application_id,
          title: 'Derecho de Inscripción — COTOLAR',
          description: `Matriculación profesional — Matrícula N° ${matricula || ''}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: monto,
        }
      ],
      back_urls: {
        success: `${APP_URL}/portal/tramites?pago=success`,
        failure: `${APP_URL}/portal/tramites?pago=failure`,
        pending: `${APP_URL}/portal/tramites?pago=pending`,
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/webhooks/mercadopago`,
      external_reference: application_id,
      metadata: { application_id, matricula },
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceBody),
    })

    if (!mpRes.ok) {
      const mpError = await mpRes.text()
      console.error('MP Error:', mpError)
      // En sandbox sin credenciales reales, devolvemos URL simulada
      return NextResponse.json({
        sandbox: true,
        init_point: `${APP_URL}/portal/tramites?pago=pending&ref=${application_id}`,
        preference_id: `SANDBOX-${application_id}`,
        monto,
        message: 'Modo sandbox — configura MP_ACCESS_TOKEN para producción',
      })
    }

    const mpData = await mpRes.json()
    const { id: mp_preference_id, init_point, sandbox_init_point } = mpData

    // 3. Guardar preference_id en payments
    await supabase.from('payments').insert({
      application_id,
      mp_preference_id,
      monto,
      estado: 'pending',
    })

    // 4. Actualizar estado del trámite a pendiente_pago
    await supabase
      .from('applications')
      .update({ estado: 'pendiente_pago', updated_at: new Date().toISOString() })
      .eq('id', application_id)

    return NextResponse.json({
      init_point: sandbox_init_point || init_point,
      preference_id: mp_preference_id,
      monto,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
