"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "sonner";
import {
  User, GraduationCap, FileCheck, CreditCard,
  CheckCircle2, Lock, AlertCircle, Upload,
  ChevronRight, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type TramiteData = {
  id?: string;
  paso_1_done: boolean;
  paso_2_done: boolean;
  paso_3_done: boolean;
  paso_4_done: boolean;
  estado: string;
  antecedentes_url?: string;
  libre_deuda_url?: string;
  comprobante_pago_url?: string;
};

type StepStatus = "done" | "active" | "locked";

function getStatus(idx: number, tramite: TramiteData): StepStatus {
  const done = [tramite.paso_1_done, tramite.paso_2_done, tramite.paso_3_done, tramite.paso_4_done];
  if (done[idx]) return "done";
  // active if all previous are done
  if (idx === 0 || done.slice(0, idx).every(Boolean)) return "active";
  return "locked";
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function MiniDropZone({ label, bucket, path, onUploadDone, defaultDone }: {
  label: string; bucket: string; path: string;
  onUploadDone?: (url: string) => void; defaultDone?: boolean
}) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(defaultDone || false);

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
      toast.success("Documento adjuntado correctamente");
    } catch {
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all
      ${uploaded ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-300 hover:border-[#1abc9c] hover:bg-teal-50/30 text-slate-500"}`}>
      {uploading ? <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" /> :
        uploaded ? <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" /> :
          <Upload className="h-5 w-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{uploaded ? "Adjuntado ✓" : label}</span>
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
    </label>
  );
}

// ─── Step Content ─────────────────────────────────────────────────────────────

function StepContent({ stepId, tramite, config, onComplete }: {
  stepId: number; tramite: TramiteData; config: Record<string, string>; onComplete: (updates: Partial<TramiteData>) => void
}) {
  const [saving, setSaving] = useState(false);
  const [antecedentesUrl, setAntecedentesUrl] = useState(tramite.antecedentes_url || "");
  const [libreDeudaUrl, setLibreDeudaUrl] = useState(tramite.libre_deuda_url || "");
  const [comprobanteUrl, setComprobanteUrl] = useState(tramite.comprobante_pago_url || "");

  if (stepId === 1 || stepId === 2) {
    return (
      <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-200">
        <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-teal-800">Este paso ya está completo</p>
          <p className="text-xs text-teal-600 mt-0.5">
            Actualizá desde{" "}
            <a href="/portal/perfil" className="underline font-semibold">Mi Perfil</a>.
          </p>
        </div>
      </div>
    );
  }

  if (stepId === 3) {
    const canSave = !!antecedentesUrl && !!libreDeudaUrl;

    const handleConfirm = async () => {
      setSaving(true);
      try {
        const updates: Partial<TramiteData> = {
          paso_3_done: true,
          antecedentes_url: antecedentesUrl,
          libre_deuda_url: libreDeudaUrl,
        };
        await fetch("/api/portal/tramites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        toast.success("¡Documentación confirmada!");
        onComplete(updates);
      } catch {
        toast.error("Error al guardar");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">Los documentos deben tener fecha no mayor a 3 meses.</p>
        </div>
        <div className="space-y-3">
          <MiniDropZone label="Certificado de Antecedentes Penales (PDF)" bucket="banners" path="tramite/antecedentes"
            onUploadDone={setAntecedentesUrl} defaultDone={!!tramite.antecedentes_url} />
          <MiniDropZone label="Certificado de Libre Deuda (PDF)" bucket="banners" path="tramite/libre_deuda"
            onUploadDone={setLibreDeudaUrl} defaultDone={!!tramite.libre_deuda_url} />
        </div>
        <button onClick={handleConfirm} disabled={!canSave || saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f3460] hover:bg-[#0a2847] text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</> : "Confirmar documentación"}
        </button>
      </div>
    );
  }

  if (stepId === 4) {
    const handlePay = async () => {
      setSaving(true);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: tramite.id, matricula: "0423" }), // Mock matricula '0423' for now
        });
        const data = await res.json();
        
        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          toast.error("Error al generar el link de pago");
        }
      } catch {
        toast.error("Error al iniciar el pago");
        setSaving(false);
      }
    };

    const handleVoucher = async () => {
      if (!comprobanteUrl) {
        toast.error("Primero adjuntá el comprobante");
        return;
      }
      setSaving(true);
      try {
        const updates: Partial<TramiteData> = { paso_4_done: true, comprobante_pago_url: comprobanteUrl, estado: "activa" };
        await fetch("/api/portal/tramites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        toast.success("¡Comprobante recibido! Tu matrícula será activada en 24hs hábiles.");
        onComplete(updates);
      } catch {
        toast.error("Error al enviar el comprobante");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">Derecho de inscripción</span>
            <span className="text-lg font-extrabold text-[#0f3460]">${parseInt(config.monto_inscripcion || "15000").toLocaleString('es-AR')}</span>
          </div>
          <div className="space-y-2 text-xs text-slate-500 border-t border-slate-200 pt-3">
            <div className="flex justify-between"><span>Valor configurado por el colegio</span><span>ARS</span></div>
          </div>
        </div>
        <div className="space-y-2">
          <MiniDropZone label="Adjuntar comprobante de pago" bucket="banners" path="tramite/pago"
            onUploadDone={setComprobanteUrl} defaultDone={!!tramite.comprobante_pago_url} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={handlePay} disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1abc9c] hover:bg-[#17a589] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pagar online (Mercado Pago)
          </button>
          <button onClick={handleVoucher} disabled={saving || !comprobanteUrl}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all disabled:opacity-40">
            <Upload className="h-4 w-4" />
            Confirmar comprobante
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STEP_CONFIG = [
  { id: 1, label: "Información Personal", description: "Nombre, DNI, CUIT y domicilio.", icon: User },
  { id: 2, label: "Información Académica", description: "Universidad, título y fecha de egreso.", icon: GraduationCap },
  { id: 3, label: "Documentación Complementaria", description: "Certificado de antecedentes y libre deuda.", icon: FileCheck },
  { id: 4, label: "Pago de Inscripción", description: "Abono del derecho de inscripción.", icon: CreditCard },
];

export default function TramitesPage() {
  const [tramite, setTramite] = useState<TramiteData & { id?: string }>({
    paso_1_done: false, paso_2_done: false, paso_3_done: false, paso_4_done: false, estado: "en_tramite",
  });
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchTramite = useCallback(async () => {
    try {
      const [resTramite, resConfig] = await Promise.all([
        fetch("/api/portal/tramites"),
        fetch("/api/admin/config")
      ]);
      const data = await resTramite.json();
      const configData = await resConfig.json();
      
      setConfig(configData);
      
      if (data) {
        setTramite(data);
        // auto-expand first incomplete step
        const steps = [data.paso_1_done, data.paso_2_done, data.paso_3_done, data.paso_4_done];
        const firstIncomplete = steps.findIndex(s => !s);
        setExpanded(firstIncomplete >= 0 ? firstIncomplete + 1 : null);
      }
    } catch {
      toast.error("Error al cargar el trámite");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTramite(); }, [fetchTramite]);

  const handleComplete = (updates: Partial<TramiteData>) => {
    setTramite(prev => ({ ...prev, ...updates }));
    const newTramite = { ...tramite, ...updates };
    const steps = [newTramite.paso_1_done, newTramite.paso_2_done, newTramite.paso_3_done, newTramite.paso_4_done];
    const firstIncomplete = steps.findIndex(s => !s);
    setExpanded(firstIncomplete >= 0 ? firstIncomplete + 1 : null);
  };

  const donePasos = [tramite.paso_1_done, tramite.paso_2_done, tramite.paso_3_done, tramite.paso_4_done].filter(Boolean).length;
  const progress = Math.round((donePasos / 4) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1abc9c]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Trámites / Matriculación</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tu progreso se guarda en tiempo real en la base de datos del COTOLAR.
        </p>
      </div>

      {/* Estado + progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500">Estado actual</p>
            <p className={`text-sm font-bold ${tramite.estado === "activa" ? "text-teal-600" : "text-amber-600"}`}>
              {tramite.estado === "activa" ? "✅ Matrícula Activa" : "🕐 En Trámite"}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-[#0f3460]">{progress}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1abc9c] to-[#0f3460] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{donePasos} de 4 pasos completados</p>
      </div>

      {/* Stepper */}
      <div className="space-y-3">
        {STEP_CONFIG.map((step, idx) => {
          const status: StepStatus = getStatus(idx, tramite);
          const isLocked = status === "locked";
          const isDone = status === "done";
          const isActive = status === "active";
          const isExpanded = expanded === step.id && !isLocked;

          return (
            <div key={step.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
              ${isLocked ? "opacity-60" : ""}
              ${isDone ? "border-teal-200" : isActive ? "border-[#1abc9c] ring-1 ring-[#1abc9c]/20" : "border-slate-200"}`}>
              <button disabled={isLocked} onClick={() => setExpanded(isExpanded ? null : step.id)}
                className="w-full flex items-center gap-4 p-5 text-left disabled:cursor-not-allowed">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDone ? "bg-teal-500 text-white" : isActive ? "bg-[#0f3460] text-white" : "bg-slate-100 text-slate-400"}`}>
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : isLocked ? <Lock className="h-4 w-4" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${isDone ? "text-teal-700" : isActive ? "text-[#0f3460]" : "text-slate-400"}`}>
                      Paso {step.id}: {step.label}
                    </span>
                    {isDone && <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">COMPLETADO</span>}
                    {isActive && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">PENDIENTE</span>}
                    {isLocked && <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex items-center gap-1"><Lock className="h-2.5 w-2.5" />Bloqueado</span>}
                  </div>
                  <p className={`text-xs mt-0.5 ${isLocked ? "text-slate-400" : "text-slate-500"}`}>{step.description}</p>
                </div>
                {!isLocked && <ChevronRight className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <div className="pt-4">
                    <StepContent stepId={step.id} tramite={tramite} config={config} onComplete={handleComplete} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
