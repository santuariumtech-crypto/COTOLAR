"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Banner } from "@/lib/supabase";

const FALLBACK = [
  { id: "ev1", title: "Jornada de Actualización 2025", description: "Jornada interdisciplinaria de neurorehabilitación — Próximamente", image_url: "/banner_evento.png", link_url: "/contacto", type: "evento" as const },
];

export default function BannersSection() {
  const [banners, setBanners] = useState<Partial<Banner>[]>([]);

  useEffect(() => {
    fetch("/api/banners?type=evento")
      .then(r => r.json())
      .then(data => setBanners(Array.isArray(data) && data.length > 0 ? data : FALLBACK))
      .catch(() => setBanners(FALLBACK));
  }, []);

  if (banners.length === 0) return null;

  return (
    <section className="bg-slate-50 py-14 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0f3460]">Eventos y Novedades</h2>
            <p className="text-gray-500 text-sm mt-1">Jornadas, congresos y avisos institucionales del COTOLAR</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                {b.image_url && (
                  <Image src={b.image_url} alt={b.title || ""} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f3460]/60 to-transparent" />
                <span className="absolute top-3 left-3 bg-[#1abc9c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {b.type === "evento" ? "Evento" : "Publicidad"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#0f3460] mb-1 group-hover:text-[#1abc9c] transition-colors">{b.title}</h3>
                {b.description && <p className="text-gray-500 text-sm line-clamp-2">{b.description}</p>}
                {b.link_url && (
                  <Link href={b.link_url} className="inline-block mt-3 text-sm font-semibold text-[#1abc9c] hover:text-[#16a085] transition-colors">
                    Ver más →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
