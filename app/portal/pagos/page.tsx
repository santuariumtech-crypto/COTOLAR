"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ArrowRight, CalendarDays, Receipt, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";

type Pago = {
  id: string;
  mes: number;
  anio: number;
  monto: number;
  estado: string;
  fecha_pago: string | null;
};

type Subscription = {
  mp_preapproval_id: string;
  estado: string;
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [montoMensual, setMontoMensual] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    fetch("/api/portal/pagos")
      .then(r => r.json())
      .then(data => {
        setPagos(data.payments || []);
        setSubscription(data.subscription || null);
        if (data.montoMensual) setMontoMensual(data.montoMensual);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setLoadingSub(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricula: "0423",
          email: "brandon.romero@gmail.com", // Mock
          returnUrl: window.location.href,
        })
      });
      const data = await res.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error("Error al iniciar suscripción");
      }
    } catch (error) {
      toast.error("Ocurrió un error");
    } finally {
      setLoadingSub(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1abc9c]" />
      </div>
    );
  }

  const isSubscribed = subscription && subscription.estado !== 'cancelled';
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Buscar si está pagado el mes actual
  const pagoActual = pagos.find(p => p.mes === currentMonth && p.anio === currentYear);
  const isPaidThisMonth = pagoActual?.estado === "pagado";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pagos y Cuotas</h1>
        <p className="text-sm text-slate-500 mt-1">Gestioná el pago de tu matrícula y consultá tus comprobantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Estado Mes Actual */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Cuota Actual ({MESES[currentMonth - 1]} {currentYear})
            </h2>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isPaidThisMonth ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"}`}>
              {isPaidThisMonth ? "Pagado" : "Pendiente"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm text-slate-500">Monto a abonar</p>
                <p className="text-3xl font-black text-slate-900 mt-1">${montoMensual.toLocaleString('es-AR')}</p>
              </div>
            </div>

            {!isPaidThisMonth && (
              <div className="space-y-3">
                <button 
                  className="w-full flex justify-center items-center gap-2 bg-[#0f3460] hover:bg-[#0a2847] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md"
                >
                  <CreditCard className="h-4 w-4" /> Pagar Cuota Manual
                </button>
                <p className="text-xs text-center text-slate-500">Abona el mes actual por única vez</p>
              </div>
            )}
            
            {isPaidThisMonth && (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="text-sm font-bold text-teal-900">¡Cuota al día!</p>
                  <p className="text-xs text-teal-700">Tu próximo vencimiento es el 1 al 10 del mes que viene.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Débito Automático */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${isSubscribed ? 'bg-gradient-to-br from-[#1abc9c]/10 to-[#0f3460]/5 border-[#1abc9c]/30' : 'bg-white border-slate-200'}`}>
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center gap-2">
            <CreditCard className={`h-4 w-4 ${isSubscribed ? 'text-[#1abc9c]' : 'text-slate-400'}`} />
            <h2 className="font-semibold text-slate-900 text-sm">Débito Automático</h2>
          </div>
          <div className="p-6">
            {isSubscribed ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#1abc9c] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Adherido exitosamente</p>
                    <p className="text-xs text-slate-600 mt-1">El monto mensual se debitará automáticamente de tu tarjeta vinculada a través de Mercado Pago.</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200/50">
                  <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                    Cancelar suscripción
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">No estás adherido al débito automático. Olvidate de los vencimientos y pagá automáticamente todos los meses.</p>
                </div>
                <button 
                  onClick={handleSubscribe}
                  disabled={loadingSub}
                  className="w-full flex justify-center items-center gap-2 bg-[#1abc9c] hover:bg-[#17a589] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#1abc9c]/20 disabled:opacity-50"
                >
                  {loadingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Adherir mi Tarjeta
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-slate-500" /> Historial de Pagos
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pagos.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No hay pagos registrados aún.</div>
          ) : pagos.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.estado === 'pagado' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                  {p.estado === 'pagado' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Cuota {MESES[p.mes - 1]} {p.anio}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : 'Pendiente'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">${p.monto.toLocaleString('es-AR')}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${p.estado === 'pagado' ? 'text-teal-600' : 'text-amber-600'}`}>
                  {p.estado}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
