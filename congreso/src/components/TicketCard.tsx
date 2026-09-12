import { Ticket as TicketIcon, Calendar, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MealBadge } from './MealBadge';
import type { Ticket } from '@/types';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  showQR?: boolean;
  compact?: boolean;
}

export function TicketCard({ ticket, showQR = true, compact = false }: TicketCardProps) {
  const isPending = ticket.ticketNumber === -1 || ticket.ticketCode.startsWith('PEND'); // simple mock check
  
  return (
    <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl w-full max-w-sm mx-auto group">
      
      {/* Top Section - Brand */}
      <div className="bg-blue-deep p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-blue/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
              Congreso
            </p>
            <h3 className="text-white font-bold text-xl leading-tight">
              Gracia y<br/>Misericordia
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
            <TicketIcon className="text-gold" size={24} />
          </div>
        </div>
      </div>

      {/* Notch separators */}
      <div className="absolute left-0 top-[112px] -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full border-r border-white/10 z-20"></div>
      <div className="absolute right-0 top-[112px] translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full border-l border-white/10 z-20"></div>
      <div className="absolute left-4 right-4 top-[112px] h-px border-t-2 border-dashed border-white/10 z-10"></div>

      {/* Middle Section - Attendee */}
      <div className="p-6 pt-8 pb-4 bg-slate-900">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Asistente</p>
            <p className="text-white font-bold text-lg truncate max-w-[200px]">
              {ticket.attendeeName}
            </p>
            <p className="text-white/60 text-sm mt-0.5">V-{ticket.attendeeDocId}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Ticket N°</p>
            <p className="text-gold font-mono font-bold text-lg">
              {ticket.ticketNumber > 0 ? ticket.ticketNumber.toString().padStart(4, '0') : '---'}
            </p>
          </div>
        </div>

        {!compact && (
          <div className="space-y-3 mt-6 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <Calendar size={16} className="text-sky-blue" />
              <span>16-18 Oct 2026</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <MapPin size={16} className="text-sky-blue" />
              <span className="truncate">Centro de Arte Lía Bermúdez (CAMLB)</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - QR & Status */}
      <div className="p-6 pt-2 bg-slate-900 flex flex-col items-center">
        
        {/* Meals */}
        <div className="mb-6 w-full flex justify-center pb-6 border-b border-white/5">
          <MealBadge total={3} remaining={ticket.mealsRemaining} />
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="mb-6 relative">
            <div className="bg-white p-3 rounded-2xl shadow-lg relative z-10">
              {ticket.qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR ${ticket.ticketCode}`}
                  width={180}
                  height={180}
                  className="w-[180px] h-[180px] object-contain mx-auto"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.ticketCode)}`}
                  alt={`QR ${ticket.ticketCode}`}
                  width={180}
                  height={180}
                  className="w-[180px] h-[180px] object-contain mx-auto"
                />
              )}
            </div>
            
            {/* Status Overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center text-center p-4">
                <Clock size={32} className="text-gold mb-2" />
                <span className="text-white font-bold text-sm">Pago Pendiente</span>
                <span className="text-white/60 text-xs mt-1">El QR se activará al verificar su pago</span>
              </div>
            )}
            
            {ticket.isUsed && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center text-center p-4">
                <XCircle size={32} className="text-red-400 mb-2" />
                <span className="text-white font-bold text-sm">Ticket Usado</span>
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          "w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold mt-2",
          isPending 
            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            : ticket.isUsed
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-green-500/10 text-green-500 border border-green-500/20"
        )}>
          {isPending ? (
            <><Clock size={16} /> Pago en Verificación</>
          ) : ticket.isUsed ? (
            <><XCircle size={16} /> Ticket Utilizado</>
          ) : (
            <><CheckCircle2 size={16} /> Entrada Válida</>
          )}
        </div>
        
        <p className="text-[10px] text-white/30 text-center mt-4 font-mono">
          {ticket.ticketCode}
        </p>
      </div>
    </div>
  );
}
