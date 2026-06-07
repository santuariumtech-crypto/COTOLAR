"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Upload, CheckCircle2, Loader2, User, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const personalSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido: z.string().min(2, "Mínimo 2 caracteres"),
  dni: z.string().regex(/^\d{7,8}$/, "DNI inválido (7 u 8 dígitos)"),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d{1}$/, "Formato: XX-XXXXXXXX-X"),
  domicilio: z.string().min(5, "Ingresá un domicilio válido"),
  telefono: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
});

const academicSchema = z.object({
  universidad: z.string().min(3, "Campo requerido"),
  titulo: z.string().min(3, "Campo requerido"),
  fechaEgreso: z.string().min(1, "Seleccioná la fecha"),
  resolucion: z.string().optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;
type AcademicFormData = z.infer<typeof academicSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full h-10 px-3 rounded-xl border text-sm outline-none transition-all
  ${hasError ? "border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-500/20" : "border-slate-200 bg-white focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20"}`;

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ label, bucket, path, onUploadDone }: { label: string; bucket: string; path: string; onUploadDone?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${path}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onUploadDone?.(urlData.publicUrl);
      setUploaded(true);
      toast.success("Archivo subido correctamente");
    } catch {
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all
      ${uploaded ? "border-teal-400 bg-teal-50" : "border-slate-300 bg-slate-50 hover:border-[#1abc9c] hover:bg-teal-50/30"}`}>
      {uploading ? (
        <div className="flex flex-col items-center gap-1 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-xs">Subiendo...</span>
        </div>
      ) : uploaded ? (
        <div className="flex flex-col items-center gap-1 text-teal-600">
          <CheckCircle2 className="h-7 w-7" />
          <span className="text-xs font-medium">Adjuntado ✓</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <Upload className="h-7 w-7" />
          <span className="text-xs font-medium">{label}</span>
          <span className="text-[10px]">JPG, PNG, PDF — máx. 5MB</span>
        </div>
      )}
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
    </label>
  );
}

// ─── Personal Form ────────────────────────────────────────────────────────────

function PersonalTab() {
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [dniFrenteUrl, setDniFrenteUrl] = useState("");
  const [dniDorsoUrl, setDniDorsoUrl] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
  });

  useEffect(() => {
    fetch("/api/portal/profile")
      .then(r => r.json())
      .then(data => {
        if (data) {
          reset({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            dni: data.dni || "",
            cuit: data.cuit || "",
            domicilio: data.domicilio || "",
            telefono: data.telefono || "",
            email: data.email || "",
          });
          if (data.dni_frente_url) setDniFrenteUrl(data.dni_frente_url);
          if (data.dni_dorso_url) setDniDorsoUrl(data.dni_dorso_url);
        }
      })
      .catch(() => toast.error("Error al cargar los datos"))
      .finally(() => setLoadingData(false));
  }, [reset]);

  const onSubmit = async (formData: PersonalFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dni_frente_url: dniFrenteUrl, dni_dorso_url: dniDorsoUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Datos personales guardados!");
      reset(formData);
    } catch {
      toast.error("Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1abc9c]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.nombre?.message} required>
          <input {...register("nombre")} className={inputClass(!!errors.nombre)} placeholder="Tu nombre" />
        </Field>
        <Field label="Apellido" error={errors.apellido?.message} required>
          <input {...register("apellido")} className={inputClass(!!errors.apellido)} placeholder="Tu apellido" />
        </Field>
        <Field label="DNI" error={errors.dni?.message} required>
          <input {...register("dni")} className={inputClass(!!errors.dni)} placeholder="41523876" />
        </Field>
        <Field label="CUIT" error={errors.cuit?.message} required>
          <input {...register("cuit")} className={inputClass(!!errors.cuit)} placeholder="XX-XXXXXXXX-X" />
        </Field>
        <Field label="Teléfono" error={errors.telefono?.message} required>
          <input {...register("telefono")} className={inputClass(!!errors.telefono)} placeholder="3804567890" />
        </Field>
        <Field label="Email" error={errors.email?.message} required>
          <input {...register("email")} type="email" className={inputClass(!!errors.email)} placeholder="tu@email.com" />
        </Field>
      </div>
      <Field label="Domicilio" error={errors.domicilio?.message} required>
        <input {...register("domicilio")} className={inputClass(!!errors.domicilio)} placeholder="Calle, número, localidad" />
      </Field>

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-3">
          Foto del DNI <span className="text-rose-500">*</span>
          <span className="text-slate-400 font-normal ml-1">(Frente y dorso)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <DropZone label="DNI — Frente" bucket="banners" path="dni/frente" onUploadDone={setDniFrenteUrl} />
          <DropZone label="DNI — Dorso" bucket="banners" path="dni/dorso" onUploadDone={setDniDorsoUrl} />
        </div>
        {(dniFrenteUrl || dniDorsoUrl) && (
          <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Imágenes del DNI guardadas
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f3460] hover:bg-[#0a2847] text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

// ─── Academic Form ────────────────────────────────────────────────────────────

function AcademicTab() {
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [tituloUrl, setTituloUrl] = useState("");
  const [analiticoUrl, setAnaliticoUrl] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<AcademicFormData>({
    resolver: zodResolver(academicSchema),
  });

  useEffect(() => {
    fetch("/api/portal/academic")
      .then(r => r.json())
      .then(data => {
        if (data) {
          reset({
            universidad: data.universidad || "",
            titulo: data.titulo || "",
            fechaEgreso: data.fecha_egreso ? data.fecha_egreso.substring(0, 10) : "",
            resolucion: data.resolucion || "",
          });
          if (data.titulo_url) setTituloUrl(data.titulo_url);
          if (data.analitico_url) setAnaliticoUrl(data.analitico_url);
        }
      })
      .catch(() => toast.error("Error al cargar los datos"))
      .finally(() => setLoadingData(false));
  }, [reset]);

  const onSubmit = async (formData: AcademicFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/academic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universidad: formData.universidad,
          titulo: formData.titulo,
          fecha_egreso: formData.fechaEgreso,
          resolucion: formData.resolucion,
          titulo_url: tituloUrl,
          analitico_url: analiticoUrl,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Datos académicos guardados!");
      reset(formData);
    } catch {
      toast.error("Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1abc9c]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Universidad" error={errors.universidad?.message} required>
            <input {...register("universidad")} className={inputClass(!!errors.universidad)} placeholder="Ej: Universidad Nacional de La Rioja" />
          </Field>
        </div>
        <Field label="Título obtenido" error={errors.titulo?.message} required>
          <input {...register("titulo")} className={inputClass(!!errors.titulo)} placeholder="Ej: Lic. en Terapia Ocupacional" />
        </Field>
        <Field label="Fecha de egreso" error={errors.fechaEgreso?.message} required>
          <input type="date" {...register("fechaEgreso")} className={inputClass(!!errors.fechaEgreso)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="N° de Resolución (opcional)">
            <input {...register("resolucion")} className={inputClass()} placeholder="Ej: Res. 001/2021" />
          </Field>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-3">
          Documentación académica <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DropZone label="Título universitario (PDF)" bucket="banners" path="docs/titulo" onUploadDone={setTituloUrl} />
          <DropZone label="Analítico de materias (PDF)" bucket="banners" path="docs/analitico" onUploadDone={setAnaliticoUrl} />
        </div>
        {(tituloUrl || analiticoUrl) && (
          <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Documentos guardados en Supabase
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f3460] hover:bg-[#0a2847] text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "personal", label: "Datos Personales", icon: User },
  { id: "academico", label: "Datos Académicos", icon: GraduationCap },
];

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">Tus datos se guardan directamente en la base de datos del COTOLAR.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all border-b-2 -mb-px
                ${activeTab === tab.id ? "border-[#1abc9c] text-[#0f3460]" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "personal" ? <PersonalTab /> : <AcademicTab />}
        </div>
      </div>
    </div>
  );
}
