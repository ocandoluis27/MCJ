'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventStats, Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Ticket, 
  Users, 
  DollarSign, 
  Utensils, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders')
      ]);
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setOrders(ordersData.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalSold = stats?.totalSoldTickets || 0;
  const totalQuota = stats?.totalQuota || 1000;
  const percentFilled = Math.min(100, Math.round((totalSold / totalQuota) * 100));
  const totalMeals = totalSold * (stats?.attendance.totalMealsRemaining ?? 3); // Approx total

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Dashboard del Congreso</h1>
          <p className="text-sm text-slate-400">Resumen en tiempo real del evento.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm">Entradas Vendidas</span>
            <div className="bg-[#1A3E82]/30 p-2 rounded-lg"><Ticket className="h-4 w-4 text-[#70B8DF]" /></div>
          </div>
          <div className="text-3xl font-black text-white">{totalSold} <span className="text-base font-normal text-slate-500">/ {totalQuota}</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#70B8DF] h-full rounded-full" style={{ width: `${percentFilled}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm">Físicas Activadas</span>
            <div className="bg-[#F0C43D]/20 p-2 rounded-lg"><QrCode className="h-4 w-4 text-[#F0C43D]" /></div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.physicalActivated || 0} <span className="text-base font-normal text-slate-500">/ 250</span></div>
          <div className="text-xs text-slate-400 mt-3">Quedan {stats?.physicalPending || 250} por activar</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm">Ingresos Totales</span>
            <div className="bg-emerald-500/20 p-2 rounded-lg"><DollarSign className="h-4 w-4 text-emerald-400" /></div>
          </div>
          <div className="text-3xl font-black text-emerald-400">${stats?.totalRevenueUsd.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-slate-400 mt-3">En fondos aprobados</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm">Almuerzos Servidos</span>
            <div className="bg-amber-500/20 p-2 rounded-lg"><Utensils className="h-4 w-4 text-amber-400" /></div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.attendance.totalMealsServed || 0}</div>
          <div className="text-xs text-slate-400 mt-3">{stats?.attendance.totalMealsRemaining || 0} almuerzos restantes en sistema</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg">Órdenes Recientes</h3>
            <Link href="/admin/comprobantes" className="text-sm text-[#F0C43D] hover:underline">Ver todas</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono">{order.id}</td>
                    <td className="px-4 py-3">{order.buyerName}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{formatCurrency(order.amountPaid, order.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {order.status === 'approved' ? 'Aprobado' : order.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No hay órdenes recientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-lg">Acciones Rápidas</h3>
          <Link href="/admin/comprobantes" className="block w-full text-center bg-[#1A3E82] hover:bg-[#1A3E82]/80 text-white font-medium py-3 rounded-xl transition-colors">
            Verificar Pagos
          </Link>
          <Link href="/admin/asistentes" className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">
            Ver Asistentes
          </Link>
          <Link href="/admin/entradas-fisicas" className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">
            Gestionar QRs Físicos
          </Link>
        </div>
      </div>
    </div>
  );
}
