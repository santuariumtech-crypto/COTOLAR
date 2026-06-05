import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import BannersSection from "@/components/BannersSection";
import NewsSection from "@/components/NewsSection";
import Link from "next/link";
import { ShieldCheck, FileText, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Inicio",
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
