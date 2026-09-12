'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TicketCard } from '@/components/TicketCard';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Ticket } from '@/types';

export default function TicketViewPage() {
  const { code } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTicket() {
      try {
        // Simulate API call to GET /api/tickets/[code]
        await new Promise(res => setTimeout(res, 1000));
        
        // Mock ticket data
        const mockTicket: Ticket = {
          id: 'tick_123',
          orderId: 'ORD-XYZ',
          ticketCode: code as string,
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
        };
        
        setTicket(mockTicket);
      } catch (err) {
        setError('No se pudo cargar la información de la entrada.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTicket();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="animate-spin text-gold mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Cargando su entrada...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Entrada no encontrada</h2>
          <p className="text-white/60 mb-8">{error || 'El código de entrada proporcionado no es válido.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition-colors w-full"
          >
            <ArrowLeft size={18} /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 md:py-24 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-deep/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

      <div className="w-full max-w-sm mb-8 z-10">
        <Link 
          href={`/orden/${ticket.orderId}`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} /> Ver mi orden
        </Link>
      </div>

      <div className="relative z-10 w-full animate-slide-in-up">
        <TicketCard ticket={ticket} showQR={true} />
      </div>

      <div className="mt-12 text-center relative z-10 max-w-sm">
        <p className="text-white/50 text-sm">
          Presenta este código QR en la entrada del evento y en el área de comida.
        </p>
      </div>
    </div>
  );
}
