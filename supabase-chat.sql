-- =============================================
-- COTOLAR - Mensajería, Notificaciones y Avatares
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

-- 1. Actualizar user_profiles para Avatares
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_profiles' AND column_name='avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- 2. Crear Tabla messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL, -- auth.users.id
  receiver_id uuid,        -- auth.users.id (null significa que es un mensaje general para los Admins)
  content text NOT NULL,
  attachment_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Crear Tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- null = admin (opcional, pero acá forzamos a usuario o admin en específico)
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. Habilitar RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Crear Políticas RLS
-- (Por simplicidad en la prueba, permitiremos acceso total a usuarios autenticados.
-- En producción se restringiría con base en auth.uid() = sender_id o auth.uid() = receiver_id)
CREATE POLICY "Anon full access messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 6. Configurar Supabase Realtime para estas tablas
-- Esto requiere permisos de superuser. En el dashboard de Supabase (Database -> Replication), 
-- o usar la siguiente query:
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE messages, notifications;
COMMIT;

-- 7. Buckets de Storage
-- Los buckets deben crearse desde el panel de Supabase Storage manualmente si falla:
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT DO NOTHING;

-- 8. Actualizar usuarios existentes con Avatares Mockeados
-- Usaremos la API de Pravatar o Dicebear
UPDATE user_profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/initials/svg?seed=' || COALESCE(nombre, 'C') || ' ' || COALESCE(apellido, 'U')
WHERE avatar_url IS NULL;
