import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink, Instagram, Facebook } from "lucide-react";
import LogoCotolar from "@/components/LogoCotolar";

const quickLinks = [
  { href: "/institucional", label: "Quiénes Somos" },
  { href: "/matriculados", label: "Buscador de Profesionales" },
  { href: "/matriculados", label: "Requisitos de Matriculación" },
  { href: "/contacto", label: "Contacto" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f3460] text-white">
      {/* Banda decorativa */}
      <div className="h-1 bg-gradient-to-r from-[#1abc9c] via-[#2471a3] to-[#0f3460]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Columna 1: Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LogoCotolar className="w-40 sm:w-48 h-auto" />
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Organismo que regula, habilita y fiscaliza el ejercicio profesional de la Terapia Ocupacional en la provincia de La Rioja.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Acceso Webmail
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/cotolar_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1abc9c] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram COTOLAR"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/coptorlarioja/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#2471a3] flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook COTOLAR"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Columna 2: Links rápidos */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest border-b border-white/20 pb-2">
              Accesos Rápidos
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-blue-200 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#1abc9c] group-hover:w-2 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest border-b border-white/20 pb-2">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-blue-200">
                <MapPin className="w-4 h-4 mt-0.5 text-[#1abc9c] shrink-0" />
                <span>Av. Rivadavia 1234, (F5300) La Rioja Capital, Argentina</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-200">
                <Phone className="w-4 h-4 text-[#1abc9c] shrink-0" />
                <a href="tel:+5438044200000" className="hover:text-white transition-colors">
                  (+54 380) 442-0000
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-200">
                <Mail className="w-4 h-4 text-[#1abc9c] shrink-0" />
                <a href="mailto:info@cotolar.org.ar" className="hover:text-white transition-colors">
                  info@cotolar.org.ar
                </a>
              </li>
            </ul>
            <p className="text-xs text-blue-300 mt-4">
              Atención al público: Lunes a Viernes de 9:00 a 14:00 hs.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4 text-center">
        <p className="text-blue-300 text-xs">
          © {new Date().getFullYear()} COTOLAR — Colegio de Terapia Ocupacional de La Rioja.
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
