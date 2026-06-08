import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ''

export async function POST(request: Request) {
  try {
    const { matricula, email, returnUrl } = await request.json()

    // 1. Obtener monto actual de la cuota desde system_config
    const { data: config } = await supabase
      .from('system_config')
      .select('valor')
      .eq('clave', 'cuota_mensual')
      .single()

    const amount = parseFloat(config?.valor || '5000')

    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.startsWith('TEST-0000')) {
      // Modo simulación sin credenciales reales
      return NextResponse.json({
        init_point: `${returnUrl}?simulated_subscription=true`,
        simulated: true
      })
    }

    // 2. Crear el plan de suscripción en Mercado Pago
    // Preapproval Request
    const body = {
      reason: 'Cuota Mensual COTOLAR',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'ARS',
      },
      back_url: returnUrl,
      payer_email: email,
      external_reference: `SUB_${matricula}`,
      status: 'pending'
    }

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[MP Subscription Error]', data)
      throw new Error('Error al crear suscripción en Mercado Pago')
    }

    // 3. Guardar en tabla subscriptions como pendiente
    await supabase.from('subscriptions').upsert({
      matricula,
      mp_preapproval_id: data.id,
      estado: 'pending'
    })

    return NextResponse.json({
      init_point: data.init_point,
      id: data.id
    })

  } catch (error: any) {
    console.error('Subscription Endpoint Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
