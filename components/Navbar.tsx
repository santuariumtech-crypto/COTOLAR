"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Mail, LayoutDashboard } from "lucide-react";
import LogoCotolar from "@/components/LogoCotolar";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/institucional", label: "Institucional" },
  { href: "/matriculados", label: "Matriculados" },
  { href: "/denuncias", label: "Denuncias" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg border-b border-blue-100"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      {/* Banda superior institucional */}
      <div className="bg-[#0f3460] text-white text-xs py-1.5 px-4 text-center hidden sm:block">
        Colegio de Terapia Ocupacional de La Rioja — Av. Rivadavia 1234, La Rioja Capital
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <LogoCotolar className="w-40 sm:w-48 h-auto hover:opacity-90 transition-opacity" />
          </Link>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#0f3460] hover:bg-blue-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botones Portal + Webmail + Hamburguesa */}
          <div className="flex items-center gap-2">
            <Link
              href="/portal"
              className="hidden sm:flex items-center gap-1.5 bg-[#1abc9c] hover:bg-[#17a589] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <LayoutDashboard className="w-4 h-4" />
              Portal
            </Link>
            <a
              href="#"
              className="hidden sm:flex items-center gap-2 bg-[#0f3460] hover:bg-[#1a5276] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <Mail className="w-4 h-4 group-hover:animate-bounce" />
              Webmail
            </a>

            {/* Menú hamburguesa (móvil) */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-[#0f3460] hover:bg-blue-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-4 space-y-2">
              <Link
                href="/portal"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#1abc9c] text-white text-sm font-semibold px-4 py-2.5 rounded-lg w-full"
              >
                <LayoutDashboard className="w-4 h-4" />
                Portal del Matriculado
              </Link>
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-[#0f3460] text-white text-sm font-semibold px-4 py-2.5 rounded-lg w-full"
              >
                <Mail className="w-4 h-4" />
                Acceso Webmail
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
