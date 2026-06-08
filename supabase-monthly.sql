-- =============================================
-- COTOLAR - Suscripciones y Cuotas Mensuales
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

CREATE TABLE IF NOT EXISTS monthly_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text NOT NULL,
  mes integer NOT NULL,
  anio integer NOT NULL,
  monto numeric(10,2) NOT NULL,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'rechazado')),
  metodo_pago text,
  mp_payment_id text,
  mp_preapproval_id text, -- ID de la suscripción de débito automático (si aplica)
  fecha_pago timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Asegurar que no se genere un cobro duplicado para el mismo mes y año para la misma matrícula
CREATE UNIQUE INDEX idx_monthly_payments_unique_month ON monthly_payments (matricula, mes, anio);

-- Tabla para guardar si un usuario está adherido a débito automático
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE NOT NULL,
  mp_preapproval_id text NOT NULL, -- ID de Mercado Pago
  estado text DEFAULT 'authorized' CHECK (estado IN ('authorized', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Permisos (RLS)
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon full access monthly_payments" ON monthly_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Agregar campo 'fecha_emision_credencial' en user_profiles si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_profiles' AND column_name='fecha_emision_credencial'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN fecha_emision_credencial timestamptz;
  END IF;
END $$;
