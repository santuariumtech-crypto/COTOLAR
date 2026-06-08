-- =============================================
-- COTOLAR — Sistema Admin + Pagos
-- Ejecutar en Supabase → SQL Editor → New Query
-- =============================================

-- 1. Perfiles de usuario con rol
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE,
  rol text DEFAULT 'user' CHECK (rol IN ('admin', 'staff', 'user')),
  nombre text,
  apellido text,
  dni text,
  cuit text,
  domicilio text,
  telefono text,
  email text,
  estado text DEFAULT 'en_tramite' CHECK (estado IN ('activo', 'inactivo', 'en_tramite', 'suspendido', 'baja')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Solicitudes / Trámites
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text REFERENCES user_profiles(matricula) ON DELETE CASCADE,
  estado text DEFAULT 'pendiente_datos' CHECK (estado IN (
    'pendiente_datos', 'revision_documentos', 'pendiente_pago', 'aprobado', 'rechazado', 'matriculado'
  )),
  notas_admin text,
  monto_inscripcion integer DEFAULT 15000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Documentos del trámite
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  tipo_documento text NOT NULL CHECK (tipo_documento IN (
    'dni_frente', 'dni_dorso', 'titulo', 'analitico', 'antecedentes', 'libre_deuda', 'foto'
  )),
  file_url text,
  estado_verificacion text DEFAULT 'pendiente' CHECK (estado_verificacion IN ('pendiente', 'valido', 'invalido')),
  notas text,
  created_at timestamptz DEFAULT now()
);

-- 4. Pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  mp_preference_id text,
  mp_payment_id text,
  monto integer NOT NULL DEFAULT 15000,
  estado text DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected', 'in_process')),
  metodo_pago text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Configuración del sistema (montos dinámicos)
CREATE TABLE IF NOT EXISTS system_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clave text UNIQUE NOT NULL,
  valor text NOT NULL,
  descripcion text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO system_config (clave, valor, descripcion) VALUES
  ('monto_inscripcion', '15000', 'Derecho de inscripción en pesos ARS'),
  ('monto_cuota_mensual', '3000', 'Cuota mensual en pesos ARS'),
  ('email_admin', 'secretaria@cotolar.org.ar', 'Email de notificaciones del admin')
ON CONFLICT (clave) DO NOTHING;

-- 6. Mock data — 10 usuarios de prueba
INSERT INTO user_profiles (matricula, nombre, apellido, dni, cuit, email, telefono, domicilio, estado) VALUES
  ('0420', 'Ana',      'López',      '35421876', '27-35421876-5', 'ana.lopez@gmail.com',      '3804111111', 'Av. Rivadavia 123',   'activo'),
  ('0421', 'Carlos',   'Martínez',   '37891234', '20-37891234-1', 'carlos.m@hotmail.com',     '3804222222', 'San Martín 456',      'activo'),
  ('0422', 'Laura',    'González',   '39012345', '27-39012345-3', 'laura.g@gmail.com',        '3804333333', 'Rivadavia 789',       'en_tramite'),
  ('0423', 'Brandon',  'Romero',     '41523876', '20-41523876-3', 'brandon.romero@gmail.com', '3804567890', 'Av. Rivadavia 1234',  'en_tramite'),
  ('0424', 'Sofía',    'Fernández',  '38765432', '27-38765432-7', 'sofia.f@gmail.com',        '3804444444', 'Belgrano 234',        'activo'),
  ('0425', 'Diego',    'Ramírez',    '40123456', '20-40123456-9', 'diego.r@yahoo.com',        '3804555555', 'Urquiza 567',         'inactivo'),
  ('0426', 'Valentina','Torres',     '41987654', '27-41987654-2', 'valen.t@gmail.com',        '3804666666', 'Pelagio Luna 890',    'en_tramite'),
  ('0427', 'Marcos',   'Herrera',    '36543210', '20-36543210-4', 'marcos.h@outlook.com',     '3804777777', 'Joaquín V. González', 'activo'),
  ('0428', 'Florencia','Acosta',     '42345678', '27-42345678-6', 'flor.a@gmail.com',         '3804888888', 'España 321',          'suspendido'),
  ('0429', 'Nicolás',  'Vargas',     '39876543', '20-39876543-8', 'nico.v@gmail.com',         '3804999999', 'Av. Castro Barros',   'activo')
ON CONFLICT (matricula) DO NOTHING;

-- 7. Crear applications para cada usuario
INSERT INTO applications (matricula, estado, monto_inscripcion) VALUES
  ('0420', 'matriculado',        15000),
  ('0421', 'aprobado',           15000),
  ('0422', 'revision_documentos',15000),
  ('0423', 'pendiente_pago',     15000),
  ('0424', 'matriculado',        15000),
  ('0425', 'rechazado',          15000),
  ('0426', 'pendiente_datos',    15000),
  ('0427', 'aprobado',           15000),
  ('0428', 'rechazado',          15000),
  ('0429', 'matriculado',        15000)
ON CONFLICT DO NOTHING;

-- 8. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 9. Políticas permisivas (sin auth por ahora)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_profiles' AND policyname='Anon full user_profiles') THEN
    CREATE POLICY "Anon full user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='applications' AND policyname='Anon full applications') THEN
    CREATE POLICY "Anon full applications" ON applications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='documents' AND policyname='Anon full documents') THEN
    CREATE POLICY "Anon full documents" ON documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Anon full payments') THEN
    CREATE POLICY "Anon full payments" ON payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_config' AND policyname='Anon full system_config') THEN
    CREATE POLICY "Anon full system_config" ON system_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
