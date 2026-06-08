"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft, User, FileText, CreditCard,
  CheckCircle, XCircle, AlertTriangle, Pencil, Save,
  X, ExternalLink, RotateCcw, ShieldCheck, Loader2,
} from "lucide-react";
import {
  ESTADO_TRAMITE_STYLES, ESTADO_MATRICULA_STYLES,
  ESTADO_PAGO_STYLES, type EstadoTramite, type EstadoMatricula,
} from "@/lib/admin-mock";

// ─── Helper Components ────────────────────────────────────────────────────────

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-900 font-medium">{value || <span className="text-slate-400 italic">Sin datos</span>}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TramiteDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === '1');
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [rechazarModal, setRechazarModal] = useState(false);
  const [notaRechazo, setNotaRechazo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/applications/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setApp(data);
          setEditData(data.user_profiles || {});
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
          <p>Trámite no encontrado</p>
          <Link href="/admin/matriculados" className="mt-2 text-sm text-blue-600 underline">Volver a la lista</Link>
        </div>
      </div>
    );
  }

  const user = app.user_profiles || {};
  const tramiteStyle = ESTADO_TRAMITE_STYLES[app.estado as keyof typeof ESTADO_TRAMITE_STYLES] || ESTADO_TRAMITE_STYLES.pendiente_datos;
  const estadoStyle = ESTADO_MATRICULA_STYLES[user.estado as keyof typeof ESTADO_MATRICULA_STYLES] || ESTADO_MATRICULA_STYLES.en_tramite;
  
  const lastPayment = app.payments?.[app.payments.length - 1];
  const pagoStyle = lastPayment ? ESTADO_PAGO_STYLES[lastPayment.estado as keyof typeof ESTADO_PAGO_STYLES] : ESTADO_PAGO_STYLES['null'];

  const docs = app.documents || [];

  // ── Actions ──────────────────────────────────────────────────────────────────

  const cambiarEstadoTramite = async (nuevoEstado: EstadoTramite, nota?: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, notas_admin: nota || app.notas_admin }),
      });
      if (res.ok) {
        setApp((prev: any) => ({ ...prev, estado: nuevoEstado, notas_admin: nota || prev.notas_admin }));
        toast.success(`Estado del trámite actualizado a: ${ESTADO_TRAMITE_STYLES[nuevoEstado].label}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEstadoMatriculaChange = async (nuevoEstado: EstadoMatricula) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoMatricula: nuevoEstado, matricula: user.matricula }),
      });
      if (res.ok) {
        setApp((prev: any) => ({
          ...prev,
          user_profiles: { ...prev.user_profiles, estado: nuevoEstado }
        }));
        toast.success("Estado de matrícula actualizado");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    // Note: To fully implement edit we need a PUT /api/admin/users route, 
    // for now we'll simulate the state update on frontend
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setApp((prev: any) => ({ ...prev, user_profiles: { ...prev.user_profiles, ...editData } }));
    setIsEditing(false);
    setSaving(false);
    toast.success("Datos actualizados correctamente (Simulado)");
  };

  const handleRechazar = async () => {
    if (!notaRechazo.trim()) { toast.error("Ingresá el motivo del rechazo"); return; }
    await cambiarEstadoTramite('rechazado', notaRechazo);
    handleEstadoMatriculaChange('inactivo');
    setRechazarModal(false);
    setNotaRechazo("");
  };

  const docsValidados = docs.filter((d: any) => d.estado_verificacion === 'valido').length;
  const docsTotal = docs.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/tramite" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.apellido || ''}, {user.nombre || ''}</h1>
            <p className="text-sm text-slate-500">Matrícula N° {app.matricula} · DNI {user.dni}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge label={estadoStyle.label} className={estadoStyle.className} />
          <Badge label={tramiteStyle.label} className={tramiteStyle.className} />
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Pencil className="h-4 w-4" /> Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(false); setEditData(user); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nota de rechazo */}
      {app.notas_admin && app.estado === 'rechazado' && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <XCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-800">Motivo de rechazo</p>
            <p className="text-sm text-rose-700 mt-0.5">{app.notas_admin}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT column: Personal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Datos Personales */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <User className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Datos Personales</h2>
            </div>
            <div className="px-6 py-4">
              {!isEditing ? (
                <>
                  <InfoRow label="Nombre" value={`${user.nombre || ''} ${user.apellido || ''}`} />
                  <InfoRow label="DNI" value={user.dni} />
                  <InfoRow label="CUIT" value={user.cuit} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Teléfono" value={user.telefono} />
                  <InfoRow label="Domicilio" value={user.domicilio} />
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'nombre', label: 'Nombre' },
                    { key: 'apellido', label: 'Apellido' },
                    { key: 'dni', label: 'DNI' },
                    { key: 'cuit', label: 'CUIT' },
                    { key: 'email', label: 'Email' },
                    { key: 'telefono', label: 'Teléfono' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                      <input
                        value={editData[f.key] || ''}
                        onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Domicilio</label>
                    <input
                      value={editData.domicilio || ''}
                      onChange={e => setEditData(prev => ({ ...prev, domicilio: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documentos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-500" />
                <h2 className="font-semibold text-slate-900 text-sm">Documentación</h2>
              </div>
              <span className="text-xs text-slate-500">{docsValidados}/{docsTotal} validados</span>
            </div>
            <div className="divide-y divide-slate-100">
              {docs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No hay documentos adjuntos</div>
              ) : docs.map((doc: any) => {
                const docStyle = doc.estado_verificacion === 'valido'
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : doc.estado_verificacion === 'invalido'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';
                const docLabel = doc.estado_verificacion === 'valido' ? 'Válido' : doc.estado_verificacion === 'invalido' ? 'Inválido' : 'Pendiente';

                return (
                  <div key={doc.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.tipo_documento}</p>
                        {!doc.file_url && <p className="text-xs text-slate-400">Sin archivo</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${docStyle}`}>{docLabel}</span>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver archivo">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT column: Estado + Acciones + Pago */}
        <div className="space-y-5">

          {/* Cambiar Estado */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 text-sm">Estado del Trámite</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cambiar estado manualmente</label>
                <select
                  value={app.estado}
                  onChange={e => cambiarEstadoTramite(e.target.value as EstadoTramite)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all"
                >
                  <option value="pendiente_datos">Datos Pendientes</option>
                  <option value="revision_documentos">En Revisión</option>
                  <option value="pendiente_pago">Pendiente de Pago</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="matriculado">Matriculado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Estado de matrícula</label>
                <select
                  value={user.estado}
                  onChange={e => handleEstadoMatriculaChange(e.target.value as EstadoMatricula)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="en_tramite">En Trámite</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 text-sm">Acciones</h2>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => cambiarEstadoTramite('pendiente_pago')}
                disabled={saving || app.estado === 'matriculado' || app.estado === 'aprobado'}
                className="w-full flex items-center gap-3 px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4" />
                Aprobar Documentación
              </button>
              <button
                onClick={() => setRechazarModal(true)}
                disabled={saving || app.estado === 'rechazado'}
                className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                Rechazar Documentación
              </button>
              <button
                onClick={() => { cambiarEstadoTramite('matriculado'); handleEstadoMatriculaChange('activo'); }}
                disabled={saving || app.estado === 'matriculado'}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="h-4 w-4" />
                Dar de Alta Matrícula
              </button>
              <button
                onClick={() => { cambiarEstadoTramite('pendiente_datos'); handleEstadoMatriculaChange('en_tramite'); }}
                disabled={saving}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar Trámite
              </button>
            </div>
          </div>

          {/* Estado de Pago */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Pago</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">Estado</span>
                <Badge label={pagoStyle.label} className={pagoStyle.className} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Monto</span>
                <span className="text-sm font-bold text-slate-900">
                  ${app.monto_inscripcion?.toLocaleString('es-AR') || '15.000'} ARS
                </span>
              </div>
              {lastPayment?.estado === 'pending' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-medium">Pago en espera de confirmación de Mercado Pago.</p>
                </div>
              )}
              {lastPayment?.estado === 'rejected' && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-xs text-rose-700 font-medium">El pago fue rechazado. El usuario debe reintentar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal rechazo */}
      {rechazarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Rechazar documentación</h3>
            <p className="text-sm text-slate-500 text-center mb-5">Ingresá el motivo del rechazo. El usuario lo verá desde su portal.</p>
            <textarea
              rows={3}
              value={notaRechazo}
              onChange={e => setNotaRechazo(e.target.value)}
              placeholder="Ej: El analítico de materias está ilegible. Por favor, adjuntá una copia de mayor calidad."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRechazarModal(false); setNotaRechazo(""); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleRechazar} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
