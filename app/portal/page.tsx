"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download, CreditCard, CheckCircle2, Clock,
  AlertCircle, ArrowRight, FileText, User, Shield, TrendingUp, Loader2,
} from "lucide-react";

type TramiteData = {
  paso_1_done: boolean;
  paso_2_done: boolean;
  paso_3_done: boolean;
  paso_4_done: boolean;
  estado: string;
};

type ProfileData = {
  nombre?: string;
  apellido?: string;
  matricula?: string;
  fecha_egreso?: string;
};

export default function PortalHomePage() {
  const [tramite, setTramite] = useState<TramiteData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/tramites").then(r => r.json()).catch(() => null),
      fetch("/api/portal/profile").then(r => r.json()).catch(() => null),
    ]).then(([t, p]) => {
      setTramite(t);
      setProfile(p);
    }).finally(() => setLoading(false));
  }, []);

  const steps = tramite
    ? [tramite.paso_1_done, tramite.paso_2_done, tramite.paso_3_done, tramite.paso_4_done]
    : [false, false, false, false];

  const donePasos = steps.filter(Boolean).length;
  const progress = Math.round((donePasos / 4) * 100);
  const isActiva = tramite?.estado === "activa" || tramite?.paso_4_done;

  const nombreCompleto = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim() || "Matriculado/a"
    : "Cargando...";

  const STEP_LABELS = ["Información Personal", "Datos Académicos", "Documentación", "Pago"];

  const stats = [
    { label: "Año de egreso", value: profile?.fecha_egreso?.substring(0, 4) || "—", icon: TrendingUp, color: "text-blue-500 bg-blue-50" },
    { label: "N° Matrícula", value: "0423", icon: Shield, color: "text-teal-500 bg-teal-50" },
    { label: "Pasos completados", value: `${donePasos}/4`, icon: FileText, color: "text-amber-500 bg-amber-50" },
    { label: "Perfil completado", value: `${progress}%`, icon: User, color: "text-violet-500 bg-violet-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1abc9c]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500 font-medium">¡Bienvenido/a de vuelta! 👋</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{nombreCompleto}</h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border
          ${isActiva ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
          {isActiva
            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Matrícula Activa</>
            : <><Clock className="h-3.5 w-3.5" /> En Trámite</>}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Matrícula Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Estado de tu Matrícula</h2>
            <p className="text-sm text-slate-500">Completá todos los pasos para activar tu matrícula profesional.</p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full flex-shrink-0 border
            ${isActiva ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            <AlertCircle className="h-3.5 w-3.5" />
            {isActiva ? "Activa" : "En Trámite"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progreso general</span>
            <span className="font-semibold text-slate-700">{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1abc9c] to-[#0f3460] rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all
                ${steps[i] ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${steps[i] ? "bg-[#1abc9c] text-white" : "bg-slate-200 text-slate-500"}`}>
                {steps[i] ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium leading-tight ${steps[i] ? "text-teal-700" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <Link
            href="/portal/tramites"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3460] hover:text-[#1abc9c] transition-colors"
          >
            {isActiva ? "Ver detalle del trámite" : "Continuar con el trámite"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#1abc9c]/40 transition-all text-left">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1abc9c] transition-colors">
            <CreditCard className="h-6 w-6 text-[#1abc9c] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Adherir a Débito Automático</p>
            <p className="text-xs text-slate-500 mt-0.5">Pagá tu cuota mensual sin preocuparte</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-[#1abc9c] group-hover:translate-x-1 transition-all" />
        </button>

        <button
          disabled={!isActiva}
          title={!isActiva ? "Disponible una vez aprobada la matrícula" : ""}
          className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#0f3460]/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0f3460] transition-colors">
            <Download className="h-6 w-6 text-[#0f3460] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Descargar Credencial</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isActiva ? "Descargá tu credencial profesional en PDF" : "Disponible tras aprobación de matrícula"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-[#0f3460] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Aviso dinámico */}
      {!isActiva && donePasos < 4 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {donePasos === 0 ? "Comenzá tu trámite de matriculación" :
               donePasos === 3 ? "¡Solo falta el pago para activar tu matrícula!" :
               "Trámite en progreso — completá los pasos pendientes"}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Pasos completados: {donePasos}/4.{" "}
              <Link href="/portal/tramites" className="underline font-semibold hover:text-amber-900">
                Continuar ahora →
              </Link>
            </p>
          </div>
        </div>
      )}

      {isActiva && (
        <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-2xl p-4">
          <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-teal-800">¡Matrícula activa! 🎉</p>
            <p className="text-xs text-teal-700 mt-0.5">
              Tu matrícula profesional está habilitada. Podés descargar tu credencial cuando quieras.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
