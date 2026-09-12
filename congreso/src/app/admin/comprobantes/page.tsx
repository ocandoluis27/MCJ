'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Check, X, FileImage, Image as ImageIcon } from 'lucide-react';

export default function ComprobantesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: status === 'rejected' ? rejectReason : undefined })
      });
      setSelectedOrder(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Verificación de Pagos</h1>
          <p className="text-sm text-slate-400">Aprueba o rechaza los comprobantes enviados.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-[#F0C43D] text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Pendientes</button>
        <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Aprobados</button>
        <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Rechazados</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando órdenes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">No hay comprobantes en esta categoría.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono text-[#F0C43D]">{order.id}</div>
                  <div className="font-bold text-white">{order.buyerName}</div>
                  <div className="text-xs text-slate-400">{order.buyerDocId}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">{formatCurrency(order.amountPaid, order.currency)}</div>
                  <div className="text-xs text-slate-400 uppercase">{order.paymentMethod}</div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 text-sm">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Referencia:</span>
                  <span className="font-mono text-white">{order.paymentReference}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Entradas:</span>
                  <span className="font-bold text-white">{order.quantity}</span>
                </div>
              </div>

              {order.paymentProofUrl && (
                <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  Ver Comprobante
                </a>
              )}

              {filter === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setSelectedOrder(order)} className="flex-1 flex items-center justify-center gap-1 bg-rose-950 hover:bg-rose-900 text-rose-400 py-2 rounded-xl text-sm font-medium transition-colors border border-rose-900/50">
                    <X className="h-4 w-4" /> Rechazar
                  </button>
                  <button onClick={() => handleStatusChange(order.id, 'approved')} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                    <Check className="h-4 w-4" /> Aprobar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-white">Rechazar Pago</h3>
            <p className="text-sm text-slate-400">Indica la razón del rechazo para la orden {selectedOrder.id}:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500 min-h-[100px]"
              placeholder="Ej: Referencia no encontrada en el banco..."
            />
            <div className="flex gap-2">
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-xl">Cancelar</button>
              <button onClick={() => handleStatusChange(selectedOrder.id, 'rejected')} disabled={!rejectReason.trim()} className="flex-1 py-2 text-sm bg-rose-600 hover:bg-rose-500 text-white rounded-xl disabled:opacity-50">Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
