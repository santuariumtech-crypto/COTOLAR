"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, Clock, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";
import { ESTADO_TRAMITE_STYLES, ESTADO_PAGO_STYLES } from "@/lib/admin-mock";

type Application = {
  id: string;
  matricula: string;
  estado: string;
  notas_admin?: string;
  created_at: string;
  monto_inscripcion: number;
  user_profiles: {
    nombre?: string;
    apellido?: string;
    dni?: string;
    email?: string;
    estado?: string;
  } | null;
  payments: Array<{ estado: string; monto: number }>;
};

export default function TramitesAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  useEffect(() => {
    fetch("/api/admin/applications")
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter(a => {
    const profile = a.user_profiles;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (profile?.nombre?.toLowerCase().includes(q)) ||
      (profile?.apellido?.toLowerCase().includes(q)) ||
      (profile?.dni?.includes(q)) ||
      a.matricula.includes(q);
    const matchEstado = !filterEstado || a.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    total: applications.length,
    pendientes: applications.filter(a => a.estado === 'pendiente_datos' || a.estado === 'revision_documentos').length,
    aprobados: applications.filter(a => a.estado === 'aprobado' || a.estado === 'matriculado').length,
    rechazados: applications.filter(a => a.estado === 'rechazado').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trámites de Matriculación</h1>
        <p className="text-sm text-slate-500 mt-1">Gestioná los trámites de los solicitantes en tiempo real.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Filter, color: 'text-blue-500 bg-blue-50' },
          { label: 'En revisión', value: stats.pendientes, icon: Clock, color: 'text-amber-500 bg-amber-50' },
          { label: 'Aprobados', value: stats.aprobados, icon: CheckCircle, color: 'text-teal-500 bg-teal-50' },
          { label: 'Rechazados', value: stats.rechazados, icon: XCircle, color: 'text-rose-500 bg-rose-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, DNI o matrícula..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente_datos">Datos Pendientes</option>
          <option value="revision_documentos">En Revisión</option>
          <option value="pendiente_pago">Pendiente de Pago</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="matriculado">Matriculado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Solicitante</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Matrícula</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado Trámite</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pago</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400">
                      <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No hay trámites{filterEstado || search ? " que coincidan" : " registrados aún"}</p>
                    </td>
                  </tr>
                ) : filtered.map(app => {
                  const profile = app.user_profiles;
                  const tramiteStyle = ESTADO_TRAMITE_STYLES[app.estado as keyof typeof ESTADO_TRAMITE_STYLES] || ESTADO_TRAMITE_STYLES.pendiente_datos;
                  const lastPayment = app.payments?.[app.payments.length - 1];
                  const pagoStyle = lastPayment ? ESTADO_PAGO_STYLES[lastPayment.estado] : ESTADO_PAGO_STYLES['null'];
                  const nombre = profile ? `${profile.apellido || ''}, ${profile.nombre || ''}`.trim().replace(/^,/, '').trim() : 'Sin datos';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {profile?.nombre?.charAt(0)}{profile?.apellido?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                            <p className="text-xs text-slate-500">{profile?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono font-semibold text-slate-700">N° {app.matricula}</span>
                        <p className="text-xs text-slate-400 mt-0.5">DNI {profile?.dni || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tramiteStyle.className}`}>
                          {tramiteStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${pagoStyle.className}`}>
                          {pagoStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Date(app.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/tramite/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
