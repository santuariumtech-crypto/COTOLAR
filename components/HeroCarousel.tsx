"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Banner } from "@/lib/supabase";

const FALLBACK_BANNERS = [
  { id: "1", title: "Bienvenidos al COTOLAR", description: "Colegio de Terapia Ocupacional de La Rioja — Habilitando y protegiendo el ejercicio profesional.", image_url: "/hero1.png", link_url: "/institucional" },
  { id: "2", title: "Terapia Ocupacional en Acción", description: "Profesionales comprometidos con la salud y rehabilitación de nuestra comunidad riojana.", image_url: "/hero2.png", link_url: "/matriculados" },
];

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Partial<Banner>[]>(FALLBACK_BANNERS);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/banners?type=hero")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBanners(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => goNext(), 6000);
    return () => clearInterval(timer);
  }, [banners.length, current]);

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(c => (c + 1) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(c => (c - 1 + banners.length) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const banner = banners[current];

  return (
    <section className="relative h-[520px] md:h-[600px] overflow-hidden bg-slate-900">
      {/* Background Image */}
      {banner.image_url && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
          <Image
            src={banner.image_url}
            alt={banner.title || "Banner COTOLAR"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f3460]/85 via-[#0f3460]/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <span className="inline-block bg-[#1abc9c]/20 text-[#1abc9c] border border-[#1abc9c]/30 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              COTOLAR — La Rioja
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              {banner.title}
            </h1>
            {banner.description && (
              <p className="text-blue-100 text-base md:text-lg leading-relaxed mb-8">
                {banner.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {banner.link_url && (
                <Link
                  href={banner.link_url}
                  className="bg-[#1abc9c] hover:bg-[#17a589] text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 text-sm"
                >
                  Saber más →
                </Link>
              )}
              <Link
                href="/matriculados"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm backdrop-blur-sm"
              >
                Ver profesionales habilitados
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full transition-all border border-white/20">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full transition-all border border-white/20">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-[#1abc9c]" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
