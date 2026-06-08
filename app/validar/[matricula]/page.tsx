import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Para que no cachee el estado, lo trae en vivo

export default async function ValidarMatriculaPage(
  props: { params: Promise<{ matricula: string }> }
) {
  const { matricula } = await props.params;

  // Buscar en user_profiles
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("nombre, apellido, dni, estado")
    .eq("matricula", matricula)
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Matrícula no encontrada</h1>
          <p className="text-sm text-slate-500 mb-6">
            El número de matrícula <strong>{matricula}</strong> no existe en los registros del COTOLAR.
          </p>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isActivo = profile.estado === "activo";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full border border-slate-100">
        <div className={`p-8 text-center text-white ${isActivo ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
            {isActivo ? <ShieldCheck className="h-10 w-10 text-white" /> : <AlertTriangle className="h-10 w-10 text-white" />}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {isActivo ? "Matrícula Vigente" : "Matrícula Inactiva"}
          </h1>
          <p className="text-white/80 text-sm font-medium">Colegio de Terapia Ocupacional de La Rioja</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Profesional</p>
            <p className="text-lg font-bold text-slate-900">{profile.nombre} {profile.apellido}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Matrícula N°</p>
              <p className="text-base font-bold text-slate-800">{matricula}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">DNI</p>
              <p className="text-base font-bold text-slate-800">{profile.dni || "—"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              Información verificada en tiempo real con la base de datos oficial del Colegio de Terapia Ocupacional de La Rioja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
