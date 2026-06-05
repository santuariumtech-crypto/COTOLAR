"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Banner } from "@/lib/supabase";
import { Plus, Trash2, Eye, EyeOff, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

const TYPES = [
  { value: "hero", label: "🖼️ Hero (Carousel Principal)", color: "blue" },
  { value: "evento", label: "📅 Evento / Jornada", color: "emerald" },
  { value: "publicidad", label: "📢 Publicidad / Aviso", color: "amber" },
];

const typeStyles: Record<string, string> = {
  hero: "bg-blue-50 text-blue-700 border-blue-200",
  evento: "bg-emerald-50 text-emerald-700 border-emerald-200",
  publicidad: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ImagenesPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link_url: "",
    type: "hero" as Banner["type"],
    active: true,
    order_index: 0,
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/banners?all=true");
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const filtered = activeTab === "todos" ? banners : banners.filter(b => b.type === activeTab);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleToggleActive = async (banner: Banner) => {
    await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !banner.active }),
    });
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este banner permanentemente?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Seleccioná una imagen");
    setUploading(true);

    try {
      // Upload to Supabase Storage
      const ext = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, selectedFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("banners").getPublicUrl(fileName);

      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image_url: urlData.publicUrl }),
      });

      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setForm({ title: "", description: "", link_url: "", type: "hero", active: true, order_index: 0 });
      fetchBanners();
    } catch (err) {
      alert("Error al subir la imagen. Verificá que el bucket 'banners' exista en Supabase Storage.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Imágenes y Banners</h1>
          <p className="text-sm text-slate-500 mt-1">Gestioná las imágenes del sitio: carousel, eventos y publicidad.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md text-sm"
        >
          <Plus className="h-4 w-4" />
          Subir imagen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "todos", label: "Todos" }, ...TYPES.map(t => ({ value: t.value, label: t.label }))].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeTab === tab.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
          <ImageIcon className="h-14 w-14 mb-4 text-slate-200" />
          <p className="font-medium text-slate-500">No hay imágenes en esta categoría</p>
          <p className="text-sm mt-1">Hacé clic en "Subir imagen" para agregar una</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((banner) => (
            <div key={banner.id} className={`group bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${!banner.active ? "opacity-60" : "border-slate-200"}`}>
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-1.5 rounded-lg backdrop-blur-sm text-white transition-colors ${banner.active ? "bg-emerald-500/80 hover:bg-emerald-600" : "bg-slate-500/80 hover:bg-slate-600"}`}
                    title={banner.active ? "Desactivar" : "Activar"}
                  >
                    {banner.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 backdrop-blur-sm text-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{banner.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${typeStyles[banner.type]}`}>
                    {banner.type}
                  </span>
                </div>
                {banner.description && <p className="text-xs text-slate-500 line-clamp-2">{banner.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para subir imagen */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Subir nueva imagen</h2>
              <button onClick={() => { setShowModal(false); setPreviewUrl(null); setSelectedFile(null); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">Imagen *</label>
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${previewUrl ? "border-transparent p-0" : "border-slate-300 hover:border-blue-400 bg-slate-50"}`}>
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Hacé clic para seleccionar una imagen</span>
                      <span className="text-xs">JPG, PNG, WEBP hasta 5MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {previewUrl && (
                  <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="mt-1 text-xs text-rose-500 hover:text-rose-700">
                    Quitar imagen
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">Título *</label>
                <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Jornada de Neurorehabilitación 2025" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">Descripción (opcional)</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descripción del banner..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Tipo *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Banner["type"] }))} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all">
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Orden</label>
                  <input type="number" min={0} value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) }))} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">Link de destino (opcional)</label>
                <input type="url" value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>

              <div className="flex items-center gap-3 py-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-slate-700">Publicar inmediatamente</span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowModal(false); setPreviewUrl(null); setSelectedFile(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={uploading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70">
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</> : <><Upload className="h-4 w-4" /> Subir y publicar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
