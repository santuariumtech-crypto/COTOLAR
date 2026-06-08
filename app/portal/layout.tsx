import { Suspense } from "react";
import PortalLayoutClient from "./PortalLayoutClient";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, apellido, matricula')
    .eq('matricula', '0423') // Temporal: en producción usar user.id
    .single();

  const nombre = profile?.nombre || user?.user_metadata?.nombre || 'Matriculado';
  const apellido = profile?.apellido || user?.user_metadata?.apellido || '';
  const matricula = profile?.matricula || '—';
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || 'M';

  return (
    <Suspense>
      <PortalLayoutClient
        nombre={nombre}
        apellido={apellido}
        matricula={matricula}
        initials={initials}
      >
        {children}
      </PortalLayoutClient>
    </Suspense>
  );
}
