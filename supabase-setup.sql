-- =============================================
-- COTOLAR - Script SQL para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- =============================================

-- 1. Tabla de Banners (imágenes del sitio)
CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  type text NOT NULL DEFAULT 'hero' CHECK (type IN ('hero', 'evento', 'publicidad')),
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Tabla de Correos Autorizados para el Admin
CREATE TABLE IF NOT EXISTS authorized_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- 3. Insertar correos autorizados de prueba
INSERT INTO authorized_emails (email, role) VALUES
  ('admin@cto.org.ar', 'admin'),
  ('secretaria@cto.org.ar', 'staff'),
  ('presidente@cto.org.ar', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 4. Insertar banners de ejemplo (imágenes del sitio oficial)
INSERT INTO banners (title, description, image_url, type, active, order_index) VALUES
  ('Bienvenidos al COTOLAR', 'Colegio de Terapia Ocupacional de La Rioja — Habilitando y protegiendo el ejercicio profesional', '/hero1.png', 'hero', true, 1),
  ('Terapia Ocupacional en Acción', 'Profesionales comprometidos con la salud y rehabilitación de nuestra comunidad', '/hero2.png', 'hero', true, 2),
  ('Jornada de Actualización 2025', 'Jornada interdisciplinaria de neurorehabilitación — Próximamente', '/banner_evento.png', 'evento', true, 1)
ON CONFLICT DO NOTHING;

-- 5. Habilitar Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;

-- 6. Políticas: Lectura pública de banners activos
CREATE POLICY IF NOT EXISTS "Public read active banners"
  ON banners FOR SELECT USING (active = true);

-- 7. Políticas: Gestión completa para anon (admin sin auth aún)
CREATE POLICY IF NOT EXISTS "Anon can manage banners"
  ON banners FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anon can read authorized_emails"
  ON authorized_emails FOR SELECT USING (true);

-- =============================================
-- STORAGE: Crear bucket para imágenes
-- Ir a: Storage → New Bucket → Name: "banners" → Public: ON
-- =============================================
