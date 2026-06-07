-- =============================================
-- COTOLAR - Portal de Autogestión
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

-- 1. Tabla de perfiles personales
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE NOT NULL DEFAULT '0423',
  nombre text,
  apellido text,
  dni text,
  cuit text,
  domicilio text,
  telefono text,
  email text,
  dni_frente_url text,
  dni_dorso_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Tabla de datos académicos
CREATE TABLE IF NOT EXISTS academic_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE NOT NULL DEFAULT '0423',
  universidad text,
  titulo text,
  fecha_egreso date,
  resolucion text,
  titulo_url text,
  analitico_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Tabla de trámites / estado de pasos
CREATE TABLE IF NOT EXISTS tramites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE NOT NULL DEFAULT '0423',
  paso_1_done boolean DEFAULT false,
  paso_2_done boolean DEFAULT false,
  paso_3_done boolean DEFAULT false,
  paso_4_done boolean DEFAULT false,
  antecedentes_url text,
  libre_deuda_url text,
  comprobante_pago_url text,
  estado text DEFAULT 'en_tramite' CHECK (estado IN ('en_tramite', 'activa', 'suspendida', 'baja')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Insertar registros de prueba para el usuario demo
INSERT INTO profiles (matricula, nombre, apellido, dni, cuit, domicilio, telefono, email)
VALUES ('0423', 'Brandon Elias', 'Romero', '41523876', '20-41523876-3', 'Av. Rivadavia 1234, La Rioja', '3804567890', 'brandon.romero@gmail.com')
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO academic_profiles (matricula, universidad, titulo, fecha_egreso)
VALUES ('0423', 'Universidad Nacional de La Rioja', 'Lic. en Terapia Ocupacional', '2021-12-01')
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO tramites (matricula, paso_1_done, paso_2_done, estado)
VALUES ('0423', true, true, 'en_tramite')
ON CONFLICT (matricula) DO NOTHING;

-- 5. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- 6. Políticas: acceso total para anon (sin auth por ahora)
CREATE POLICY IF NOT EXISTS "Anon full access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Anon full access academic" ON academic_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Anon full access tramites" ON tramites FOR ALL USING (true) WITH CHECK (true);
