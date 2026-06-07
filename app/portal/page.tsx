"use client";

import Link from "next/link";
import {
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
  User,
  Shield,
  TrendingUp,
} from "lucide-react";

const STEPS = [
  { label: "Información Personal", done: true },
  { label: "Datos Académicos", done: true },
  { label: "Documentación", done: false },
  { label: "Pago", done: false },
];

const PROGRESS = 50; // porcentaje completado

const stats = [
  { label: "Año de egreso", value: "2021", icon: TrendingUp, color: "text-blue-500 bg-blue-50" },
  { label: "N° Matrícula", value: "0423", icon: Shield, color: "text-teal-500 bg-teal-50" },
  { label: "Trámites activos", value: "1", icon: FileText, color: "text-amber-500 bg-amber-50" },
  { label: "Perfil completado", value: "50%", icon: User, color: "text-violet-500 bg-violet-50" },
];

export default function PortalHomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500 font-medium">¡Bienvenido de vuelta! 👋</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Romero Brandon Elias</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">
          <Clock className="h-3.5 w-3.5" />
          Matrícula en trámite
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
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex-shrink-0">
            <AlertCircle className="h-3.5 w-3.5" />
            En Trámite
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progreso general</span>
            <span className="font-semibold text-slate-700">{PROGRESS}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1abc9c] to-[#0f3460] rounded-full transition-all duration-700"
              style={{ width: `${PROGRESS}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all
                ${step.done ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step.done ? "bg-[#1abc9c] text-white" : "bg-slate-200 text-slate-500"}`}>
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium leading-tight ${step.done ? "text-teal-700" : "text-slate-500"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <Link
            href="/portal/tramites"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3460] hover:text-[#1abc9c] transition-colors"
          >
            Continuar con el trámite
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

        <button className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#0f3460]/40 transition-all text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0f3460] transition-colors">
            <Download className="h-6 w-6 text-[#0f3460] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Descargar Credencial</p>
            <p className="text-xs text-slate-500 mt-0.5">Descargá tu credencial profesional en PDF</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-[#0f3460] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Aviso informativo */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Documentación pendiente</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Aún falta adjuntar el Certificado de Antecedentes y el comprobante de pago para finalizar tu trámite de matriculación.{" "}
            <Link href="/portal/tramites" className="underline font-semibold hover:text-amber-900">
              Completar ahora →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
