"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Filter, Plus, Eye, Pencil, Trash2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Users, CheckCircle, Clock, XCircle,
} from "lucide-react";
import {
  MOCK_MATRICULADOS, ESTADO_TRAMITE_STYLES, ESTADO_MATRICULA_STYLES,
  ESTADO_PAGO_STYLES, type Matriculado, type EstadoTramite, type EstadoMatricula,
} from "@/lib/admin-mock";
import { toast, Toaster } from "sonner";

type SortField = 'apellido' | 'matricula' | 'estado' | 'tramite' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 8;

export default function MatriculadosAdminPage() {
  const [data, setData] = useState<Matriculado[]>(MOCK_MATRICULADOS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoMatricula | "">("");
  const [filterTramite, setFilterTramite] = useState<EstadoTramite | "">("");
  const [filterPago, setFilterPago] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Filtrado + búsqueda ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        m.apellido.toLowerCase().includes(q) ||
        m.matricula.includes(q) ||
        m.dni.includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }
    if (filterEstado) r = r.filter(m => m.estado === filterEstado);
    if (filterTramite) r = r.filter(m => m.tramite === filterTramite);
    if (filterPago) {
      if (filterPago === 'null') r = r.filter(m => m.estadoPago === null);
      else r = r.filter(m => m.estadoPago === filterPago);
    }
    r = [...r].sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return r;
  }, [data, search, filterEstado, filterTramite, filterPago, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-blue-500" /> : <ChevronDown className="h-3 w-3 text-blue-500" />;
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(m => m.id !== id));
    setDeleteId(null);
    toast.success("Matriculado eliminado correctamente");
  };

  const stats = {
    total: data.length,
    activos: data.filter(m => m.estado === 'activo').length,
    enTramite: data.filter(m => m.estado === 'en_tramite').length,
    rechazados: data.filter(m => m.tramite === 'rechazado').length,
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Matriculados</h1>
          <p className="text-sm text-slate-500 mt-1">Administrá el padrón completo de profesionales habilitados.</p>
        </div>
        <Link
          href="/admin/matriculados/nuevo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Agregar matriculado
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-500 bg-blue-50' },
          { label: 'Activos', value: stats.activos, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'En Trámite', value: stats.enTramite, icon: Clock, color: 'text-amber-500 bg-amber-50' },
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, apellido, DNI o matrícula..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filter Estado Matrícula */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filterEstado}
              onChange={e => { setFilterEstado(e.target.value as EstadoMatricula | ""); setPage(1); }}
              className="h-10 pl-9 pr-8 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white appearance-none transition-all focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Estado matrícula</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="en_tramite">En Trámite</option>
              <option value="suspendido">Suspendido</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {/* Filter Trámite */}
          <select
            value={filterTramite}
            onChange={e => { setFilterTramite(e.target.value as EstadoTramite | ""); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white transition-all focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Estado trámite</option>
            <option value="pendiente_datos">Datos Pendientes</option>
            <option value="revision_documentos">En Revisión</option>
            <option value="pendiente_pago">Pend. de Pago</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="matriculado">Matriculado</option>
          </select>

          {/* Filter Pago */}
          <select
            value={filterPago}
            onChange={e => { setFilterPago(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white transition-all focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Estado pago</option>
            <option value="approved">Aprobado</option>
            <option value="pending">Pendiente</option>
            <option value="rejected">Rechazado</option>
            <option value="null">Sin pago</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-left">
                  <button onClick={() => sort('apellido')} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900">
                    Profesional <SortIcon field="apellido" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left">
                  <button onClick={() => sort('matricula')} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900">
                    Matrícula <SortIcon field="matricula" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left">
                  <button onClick={() => sort('estado')} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900">
                    Estado <SortIcon field="estado" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left">
                  <button onClick={() => sort('tramite')} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900">
                    Trámite <SortIcon field="tramite" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pago</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No se encontraron resultados</p>
                    <p className="text-sm mt-1">Probá con otros filtros o términos de búsqueda</p>
                  </td>
                </tr>
              ) : paged.map(m => {
                const tramiteStyle = ESTADO_TRAMITE_STYLES[m.tramite];
                const estadoStyle = ESTADO_MATRICULA_STYLES[m.estado];
                const pagoStyle = m.estadoPago ? ESTADO_PAGO_STYLES[m.estadoPago] : ESTADO_PAGO_STYLES['null'];

                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {m.nombre.charAt(0)}{m.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{m.apellido}, {m.nombre}</p>
                          <p className="text-xs text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-mono font-semibold text-slate-700">N° {m.matricula}</span>
                      <p className="text-xs text-slate-400 mt-0.5">DNI {m.dni}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoStyle.className}`}>
                        {estadoStyle.label}
                      </span>
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
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/tramite/${m.id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/tramite/${m.id}?edit=1`}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(m.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {filtered.length === 0 ? '0 resultados' : `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">¿Eliminar matriculado?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Esta acción no se puede deshacer. Se eliminará el registro del sistema.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
