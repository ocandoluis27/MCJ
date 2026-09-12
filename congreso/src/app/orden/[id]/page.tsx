'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TicketCard } from '@/components/TicketCard';
import { Loader2, CheckCircle2, Clock, AlertCircle, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Order, Ticket } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Simulate API call to GET /api/orders/[id]
        await new Promise(res => setTimeout(res, 1500));
        
        // Mock order data
        const mockOrder: Order = {
          id: id as string,
          createdAt: new Date().toISOString(),
          buyerName: 'Juan Pérez',
          buyerEmail: 'juan@example.com',
          buyerPhone: '04141234567',
          buyerDocId: '12345678',
          quantity: 2,
          attendees: [
            { name: 'Juan Pérez', docId: '12345678' },
            { name: 'María González', docId: '87654321' }
          ],
          paymentMethod: 'c2p',
          paymentReference: '12345678',
          amountPaid: 30,
          currency: 'USD',
          convertedUsd: 30,
          status: 'approved',
          salesChannel: 'online',
          tickets: [
            {
              id: 't1',
              orderId: id as string,
              ticketCode: 'CONG-042-A1B2',
              ticketNumber: 42,
              ticketType: 'digital',
              attendeeName: 'Juan Pérez',
              attendeeDocId: '12345678',
              attendeePhone: '04141234567',
              attendeeEmail: 'juan@example.com',
              buyerName: 'Juan Pérez',
              buyerPhone: '04141234567',
              isUsed: false,
              mealsRemaining: 3,
              mealHistory: []
            },
            {
              id: 't2',
              orderId: id as string,
              ticketCode: 'CONG-043-C3D4',
              ticketNumber: 43,
              ticketType: 'digital',
              attendeeName: 'María González',
              attendeeDocId: '87654321',
              attendeePhone: '04141234567',
              attendeeEmail: '',
              buyerName: 'Juan Pérez',
              buyerPhone: '04141234567',
              isUsed: false,
              mealsRemaining: 3,
              mealHistory: []
            }
          ]
        };
        
        setOrder(mockOrder);
      } catch (err) {
        setError('No se pudo cargar la información de la orden.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [id]);

  const handleShareWhatsApp = () => {
    if (!order) return;
    const text = `¡Hola! Aquí está el enlace a mi orden para el Congreso: ${window.location.origin}/orden/${order.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="animate-spin text-gold mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Cargando su orden...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Orden no encontrada</h2>
          <p className="text-white/60 mb-8">{error || 'El ID de orden proporcionado no es válido.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition-colors w-full"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = order.status === 'approved';
  const isPending = order.status === 'pending';
  const isRejected = order.status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Status Banner */}
        <div className={cn(
          "rounded-3xl p-6 md:p-10 mb-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-2xl relative overflow-hidden",
          isApproved && "bg-green-500/10 border border-green-500/20",
          isPending && "bg-yellow-500/10 border border-yellow-500/20",
          isRejected && "bg-red-500/10 border border-red-500/20"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/50"></div>
          
          <div className="relative z-10 shrink-0">
            {isApproved && <CheckCircle2 size={64} className="text-green-500" />}
            {isPending && <Clock size={64} className="text-yellow-500" />}
            {isRejected && <AlertCircle size={64} className="text-red-500" />}
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {isApproved && "¡Pago Confirmado!"}
              {isPending && "Orden Recibida - Pago en Verificación"}
              {isRejected && "Problema con el Pago"}
            </h1>
            <p className={cn(
              "text-lg",
              isApproved ? "text-green-200" : isPending ? "text-yellow-200" : "text-red-200"
            )}>
              {isApproved && "Tus entradas están listas. Te esperamos en el Congreso."}
              {isPending && "Estamos validando tu pago. Pronto se activarán tus entradas."}
              {isRejected && `Tu pago fue rechazado. Motivo: ${order.rejectionReason || 'No especificado'}`}
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <button 
              onClick={handleShareWhatsApp}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10"
            >
              <Share2 size={18} />
              Compartir Orden
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-10 mb-10 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
            Detalles de la Orden <span className="text-gold">#{order.id}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-white/50 text-sm mb-1">Comprador</p>
                <p className="text-white font-medium text-lg">{order.buyerName}</p>
                <p className="text-white/70">{order.buyerPhone}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Fecha</p>
                <p className="text-white">{new Date(order.createdAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-white/50 text-sm mb-1">Pago</p>
                <p className="text-white font-medium capitalize flex items-center gap-2">
                  {order.paymentMethod === 'c2p' ? 'Cobro C2P' : order.paymentMethod === 'pago_movil' ? 'Pago Móvil' : 'Efectivo'}
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-white/60 font-mono">Ref: {order.paymentReference}</span>
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Total Pagado</p>
                <p className="text-gold font-bold text-2xl">{formatCurrency(order.amountPaid, order.currency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Listing */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Tus Entradas ({order.tickets.length})</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {order.tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-col items-center">
                <TicketCard ticket={ticket} showQR={isApproved} />
                
                {isApproved && (
                  <Link 
                    href={`/ticket/${ticket.ticketCode}`}
                    className="mt-6 flex items-center gap-2 text-gold hover:text-gold/80 font-medium transition-colors"
                  >
                    Ver entrada completa <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
