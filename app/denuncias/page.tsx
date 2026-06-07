"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { AlertTriangle, Upload, CheckCircle2, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────────────────

const denunciaSchema = z.object({
  // Tipo de denuncia
  tipo: z.enum(["ejercicio_ilegal", "consultorio_no_habilitado", "oferta_educativa_falsa", "otro"], {
    required_error: "Seleccioná el tipo de denuncia",
  }),

  // Datos del denunciado
  denunciado_nombre: z.string().min(3, "Nombre requerido"),
  denunciado_domicilio: z.string().min(5, "Domicilio requerido"),
  denunciado_localidad: z.string().min(2, "Localidad requerida"),
  denunciado_telefono: z.string().optional(),
  denunciado_redes: z.string().optional(),
  dias_horarios: z.string().optional(),
  adjunta_documentacion: z.enum(["si", "no"]),
  relato: z.string().min(30, "Describí brevemente los hechos (mínimo 30 caracteres)"),

  // Datos del denunciante
  denunciante_nombre: z.string().min(3, "Tu nombre es requerido"),
  denunciante_dni: z.string().regex(/^\d{7,8}$/, "DNI inválido"),
  denunciante_localidad: z.string().min(2, "Localidad requerida"),
  denunciante_telefono: z.string().min(8, "Teléfono requerido"),
  denunciante_matricula: z.string().optional(),
  denunciante_email: z.string().email("Email inválido"),

  confidencial: z.boolean().default(true),
});

type DenunciaFormData = z.infer<typeof denunciaSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5"><span>⚠</span> {error}</p>}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full h-10 px-3 rounded-xl border text-sm outline-none transition-all
  ${hasError ? "border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-500/20" : "border-slate-200 bg-white focus:border-[#0f3460] focus:ring-2 focus:ring-[#0f3460]/10"}`;

const TIPOS = [
  { value: "ejercicio_ilegal", label: "Ejercicio Ilegal / Usurpación de Título" },
  { value: "consultorio_no_habilitado", label: "Consultorio No Habilitado" },
  { value: "oferta_educativa_falsa", label: "Oferta Educativa Engañosa" },
  { value: "otro", label: "Otro" },
];

export default function DenunciasPage() {
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docAdjuntado, setDocAdjuntado] = useState(false);
  const [showDenunciante, setShowDenunciante] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DenunciaFormData>({
    resolver: zodResolver(denunciaSchema),
    defaultValues: { adjunta_documentacion: "no", confidencial: true },
  });

  const onSubmit = async (data: DenunciaFormData) => {
    await new Promise(r => setTimeout(r, 1500));
    console.log("Denuncia enviada:", data);
    toast.success("¡Denuncia recibida! Te enviaremos una confirmación al email ingresado.");
    setSubmitted(true);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploading(true);
      setTimeout(() => { setUploading(false); setDocAdjuntado(true); toast.success("Documentación adjuntada"); }, 1500);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#1abc9c]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">¡Denuncia enviada!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Tu denuncia fue recibida por el COTOLAR. Será analizada por el Consejo Directivo y tomaremos las acciones correspondientes.<br /><br />
            <strong>Tu identidad se mantiene bajo estricta reserva.</strong>
          </p>
          <button onClick={() => setSubmitted(false)} className="text-sm text-[#0f3460] underline font-semibold hover:text-[#1abc9c] transition-colors">
            Realizar otra denuncia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Toaster richColors position="top-right" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f3460] to-[#1a3a5c] py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Formulario de Denuncia</h1>
          <p className="text-blue-200 text-base max-w-2xl mx-auto leading-relaxed">
            Todo hecho que constituya ejercicio ilegal y/o usurpación de título, consultorio no habilitado u oferta educativa engañosa en el ámbito de la Terapia Ocupacional puede ser denunciado al COTOLAR.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Importante:</strong> Los datos del denunciante cuentan con estricta reserva de identidad por parte del COTOLAR. Las denuncias deberán ser enviadas al correo institucional o completar este formulario digital.
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Tipo de denuncia */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Tipo de Denuncia
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPOS.map((t) => {
                const checked = watch("tipo") === t.value;
                return (
                  <label key={t.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${checked ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/30"}`}>
                    <input type="radio" value={t.value} {...register("tipo")} className="accent-rose-500 w-4 h-4 flex-shrink-0" />
                    <span className={`text-sm font-medium ${checked ? "text-rose-700" : "text-slate-700"}`}>{t.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.tipo && <p className="text-xs text-rose-500 mt-2">⚠ {errors.tipo.message}</p>}
          </div>

          {/* Datos del denunciado */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Datos del Denunciado / Institución
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nombre y apellido / Institución" error={errors.denunciado_nombre?.message} required>
                  <input {...register("denunciado_nombre")} className={inputClass(!!errors.denunciado_nombre)} placeholder="Nombre del denunciado o institución" />
                </Field>
              </div>
              <Field label="Domicilio" error={errors.denunciado_domicilio?.message} required>
                <input {...register("denunciado_domicilio")} className={inputClass(!!errors.denunciado_domicilio)} placeholder="Calle y número" />
              </Field>
              <Field label="Localidad" error={errors.denunciado_localidad?.message} required>
                <input {...register("denunciado_localidad")} className={inputClass(!!errors.denunciado_localidad)} placeholder="Ciudad / Localidad" />
              </Field>
              <Field label="Teléfono / Redes sociales" error={errors.denunciado_telefono?.message}>
                <input {...register("denunciado_telefono")} className={inputClass()} placeholder="Tel. o Instagram, Facebook..." />
              </Field>
              <Field label="Días y horarios de atención">
                <input {...register("dias_horarios")} className={inputClass()} placeholder="Ej: Lunes a Viernes 9 a 18hs" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Breve relato de los hechos" error={errors.relato?.message} required>
                  <textarea
                    {...register("relato")}
                    rows={4}
                    placeholder="Describí lo ocurrido con la mayor cantidad de detalles posible..."
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none
                      ${errors.relato ? "border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-500/20" : "border-slate-200 bg-white focus:border-[#0f3460] focus:ring-2 focus:ring-[#0f3460]/10"}`}
                  />
                </Field>
              </div>

              {/* Adjunta documentación */}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">¿Se adjunta documentación? <span className="text-rose-500">*</span></p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" value="si" {...register("adjunta_documentacion")} className="accent-[#0f3460] w-4 h-4" />
                    Sí
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" value="no" {...register("adjunta_documentacion")} className="accent-[#0f3460] w-4 h-4" />
                    No
                  </label>
                </div>
                {watch("adjunta_documentacion") === "si" && (
                  <label className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all
                    ${docAdjuntado ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-300 hover:border-[#0f3460] hover:bg-blue-50/30 text-slate-500"}`}>
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : docAdjuntado ? <CheckCircle2 className="h-5 w-5 text-teal-500" /> : <Upload className="h-5 w-5" />}
                    <span className="text-sm font-medium">{uploading ? "Subiendo..." : docAdjuntado ? "Documentación adjuntada ✓" : "Adjuntar archivo (PDF, imagen)"}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Datos del denunciante */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Datos del Denunciante
              </h2>
              <button type="button" onClick={() => setShowDenunciante(!showDenunciante)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
                {showDenunciante ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showDenunciante ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-5">
              <ShieldAlert className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">Los datos del denunciante cuentan con <strong>estricta reserva de identidad</strong> por parte del COTOLAR y su Consejo Directivo.</p>
            </div>

            {showDenunciante && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Nombre y apellido" error={errors.denunciante_nombre?.message} required>
                    <input {...register("denunciante_nombre")} className={inputClass(!!errors.denunciante_nombre)} placeholder="Tu nombre completo" />
                  </Field>
                </div>
                <Field label="DNI" error={errors.denunciante_dni?.message} required>
                  <input {...register("denunciante_dni")} className={inputClass(!!errors.denunciante_dni)} placeholder="41523876" />
                </Field>
                <Field label="Localidad" error={errors.denunciante_localidad?.message} required>
                  <input {...register("denunciante_localidad")} className={inputClass(!!errors.denunciante_localidad)} placeholder="Tu ciudad" />
                </Field>
                <Field label="Teléfono" error={errors.denunciante_telefono?.message} required>
                  <input {...register("denunciante_telefono")} className={inputClass(!!errors.denunciante_telefono)} placeholder="3804567890" />
                </Field>
                <Field label="Email" error={errors.denunciante_email?.message} required>
                  <input type="email" {...register("denunciante_email")} className={inputClass(!!errors.denunciante_email)} placeholder="tu@email.com" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="N° de Matrícula (si es TO matriculado/a)">
                    <input {...register("denunciante_matricula")} className={inputClass()} placeholder="Opcional — solo si sos matriculado/a" />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <input type="checkbox" {...register("confidencial")} id="confidencial" className="accent-[#0f3460] w-4 h-4 mt-0.5 flex-shrink-0" defaultChecked />
              <label htmlFor="confidencial" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                Entiendo que esta denuncia será tratada de forma <strong>confidencial</strong> por el Consejo Directivo del COTOLAR, conforme a la Ley 15.200.
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-shrink-0 flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <><AlertTriangle className="h-4 w-4" /> Enviar Denuncia</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
