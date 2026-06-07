import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Phone, LayoutDashboard, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Inicio | COTOLAR",
  description:
    "Bienvenido al COTOLAR, Colegio de Terapia Ocupacional de La Rioja. Encontrá profesionales habilitados, requisitos de matriculación y novedades institucionales.",
};

const servicios = [
  {
    icon: ShieldCheck,
    title: "Matrícula Habilitante",
    desc: "Verificá la habilitación legal de cualquier profesional de Terapia Ocupacional en la provincia.",
    color: "text-[#1abc9c]",
    bg: "bg-[#1abc9c]/10",
  },
  {
    icon: FileText,
    title: "Trámites y Requisitos",
    desc: "Accedé a toda la información necesaria para iniciar o renovar tu matrícula profesional.",
    color: "text-[#2471a3]",
    bg: "bg-[#2471a3]/10",
  },
  {
    icon: Phone,
    title: "Atención al Colegiado",
    desc: "Comunicación directa con el colegio para consultas, trámites presenciales y administrativos.",
    color: "text-[#0f3460]",
    bg: "bg-[#0f3460]/10",
  },
];

import HeroCarousel from "@/components/HeroCarousel";
import BannersSection from "@/components/BannersSection";
import NewsSection from "@/components/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <BannersSection />

      {/* Sección de servicios */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f3460] mb-1 group-hover:text-[#2471a3] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL DEL MATRICULADO ── */}
      <section className="bg-gradient-to-br from-[#0f3460] via-[#1a5276] to-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left text */}
            <div>
              <span className="inline-block bg-[#1abc9c]/20 text-[#1abc9c] border border-[#1abc9c]/30 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Exclusivo para profesionales matriculados
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Portal de Autogestión del Matriculado
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed mb-8">
                Gestioná tu perfil, seguí el estado de tu matrícula, subí documentación y realizá tus trámites online — sin ir al colegio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/portal"
                  className="inline-flex items-center justify-center gap-2 bg-[#1abc9c] hover:bg-[#17a589] text-white font-bold px-7 py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 text-sm"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Acceder al Portal
                </Link>
                <Link
                  href="/institucional"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-4 rounded-xl transition-all hover:-translate-y-0.5 text-sm backdrop-blur-sm"
                >
                  ¿Cómo matricularme?
                </Link>
              </div>
            </div>

            {/* Right — feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "👤", title: "Mi Perfil", desc: "Actualizá tus datos personales y académicos." },
                { icon: "📋", title: "Mis Trámites", desc: "Seguí el estado de tu matriculación paso a paso." },
                { icon: "📎", title: "Documentación", desc: "Subí tus certificados y comprobantes online." },
                { icon: "💳", title: "Pagos", desc: "Adherí a débito automático y descargá tu credencial." },
              ].map((f, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all">
                  <span className="text-2xl mb-2 block">{f.icon}</span>
                  <p className="text-white font-bold text-sm mb-1">{f.title}</p>
                  <p className="text-blue-200 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DENUNCIAS CTA ── */}
      <section className="bg-slate-50 py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-extrabold text-[#0f3460] mb-2">¿Ejercicio ilegal de la profesión?</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                Si conocés un caso de ejercicio ilegal, usurpación de título o consultorio no habilitado de Terapia Ocupacional en La Rioja, podés denunciarlo de forma confidencial al COTOLAR.
              </p>
            </div>
            <Link
              href="/denuncias"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Hacer una denuncia
            </Link>
          </div>
        </div>
      </section>

      <NewsSection />

      {/* CTA institucional */}
      <section className="bg-gradient-to-r from-[#0f3460] to-[#1a5276] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            ¿Sos profesional de Terapia Ocupacional?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Matriculate en el COTOLAR y ejercé tu profesión de manera legal y respaldada
            en toda la provincia de La Rioja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/institucional"
              className="bg-[#1abc9c] hover:bg-[#17a589] text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Ver requisitos de matriculación
            </Link>
            <Link
              href="/contacto"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Contactar al colegio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
