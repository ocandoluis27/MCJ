'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  CreditCard as IdCard, 
  Ticket as TicketIcon,
  MapPin,
  Building,
  Home,
  Car,
  Bus,
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';
import type { PhysicalTicket, Ticket } from '@/types';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export default function RegisterPhysicalTicketPage() {
  const { code } = useParams();
  const router = useRouter();
  
  const [ticketState, setTicketState] = useState<'loading' | 'not_found' | 'already_activated' | 'ready' | 'success'>('loading');
  const [physicalTicket, setPhysicalTicket] = useState<PhysicalTicket | null>(null);
  const [activatedTicket, setActivatedTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [docId, setDocId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Logistics & Church State
  const [city, setCity] = useState('Maracaibo');
  const [parish, setParish] = useState('');
  const [hasApostolate, setHasApostolate] = useState<boolean | null>(null);
  const [apostolateName, setApostolateName] = useState('');
  const [lodgingStatus, setLodgingStatus] = useState<'local' | 'has_own' | 'needs_lodging'>('local');
  const [lodgingLocation, setLodgingLocation] = useState('');
  const [transportStatus, setTransportStatus] = useState<'own_vehicle' | 'needs_transport'>('own_vehicle');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ticket) {
            if (data.ticket.isActivated) {
              setPhysicalTicket({
                number: data.ticket.ticketNumber || 1,
                ticketCode: code as string,
                isActivated: true,
                activatedBy: data.ticket.attendeeName
              });
              setTicketState('already_activated');
            } else {
              setPhysicalTicket({
                number: data.ticket.ticketNumber || 1,
                ticketCode: code as string,
                isActivated: false
              });
              setTicketState('ready');
            }
          } else {
            // Fallback for demo
            setPhysicalTicket({
              number: 145,
              ticketCode: code as string,
              isActivated: false
            });
            setTicketState('ready');
          }
        } else {
          setPhysicalTicket({
            number: 145,
            ticketCode: code as string,
            isActivated: false
          });
          setTicketState('ready');
        }
      } catch (err) {
        setTicketState('ready');
      }
    }
    
    fetchTicket();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !docId || !phone || !city || !parish) {
      setErrorMsg('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (hasApostolate && !apostolateName.trim()) {
      setErrorMsg('Por favor indica a cuál grupo de apostolado o movimiento perteneces.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/tickets/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode: code,
          name,
          docId,
          phone,
          email,
          city,
          parish,
          hasApostolate: hasApostolate ?? false,
          apostolateName: hasApostolate ? apostolateName : undefined,
          lodgingStatus,
          lodgingLocation,
          transportStatus
        })
      });

      // Fire confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F0C43D', '#1A3E82', '#70B8DF']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F0C43D', '#1A3E82', '#70B8DF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      setTicketState('success');
      
      setActivatedTicket({
        id: 'tick_phys_' + code,
        orderId: 'ORD-PHYS',
        ticketCode: code as string,
        ticketNumber: physicalTicket?.number || 1,
        ticketType: 'physical',
        attendeeName: name,
        attendeeDocId: docId,
        attendeePhone: phone,
        attendeeEmail: email,
        buyerName: name,
        buyerPhone: phone,
        city,
        parish,
        hasApostolate: hasApostolate ?? false,
        apostolateName,
        lodgingStatus,
        lodgingLocation,
        transportStatus,
        isUsed: false,
        mealsRemaining: 3,
        mealHistory: []
      });

    } catch (err) {
      setErrorMsg('Error al activar la entrada. Intente de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (ticketState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="animate-spin text-gold mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Verificando entrada física...</p>
      </div>
    );
  }

  if (ticketState === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Entrada no encontrada</h2>
          <p className="text-white/60 mb-8">El código QR no corresponde a una entrada física válida.</p>
          <Link href="/" className="inline-flex justify-center bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl w-full">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (ticketState === 'already_activated') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Entrada ya activada</h2>
          <p className="text-white/60 mb-6">
            Esta entrada física (#{physicalTicket?.number}) ya fue registrada previamente.
          </p>
          <Link href={`/ticket/${code}`} className="inline-flex justify-center bg-gold text-slate-950 font-bold px-6 py-3 rounded-xl w-full">
            Ver Entrada
          </Link>
        </div>
      </div>
    );
  }

  if (ticketState === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center animate-slide-in-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Entrada Activada con Éxito!</h2>
          <p className="text-white/60 text-xs mb-6">
            Tu tarjeta física ha quedado vinculada a tu nombre. Tus 3 almuerzos y tu acceso para los 3 días del Congreso están listos.
          </p>
          <Link href={`/ticket/${code}`} className="inline-flex justify-center bg-gold hover:bg-gold/90 text-slate-950 font-bold px-6 py-4 rounded-xl w-full text-sm uppercase tracking-wider shadow-lg shadow-gold/20 transition-transform active:scale-[0.98]">
            Ver Mi Pase Digital
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 md:py-24 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-deep/20 to-transparent"></div>
      
      <div className="w-full max-w-xl z-10">
        <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          
          <div className="bg-blue-deep p-6 text-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-blue/20 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gold/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <TicketIcon size={14} /> Activación de Entrada Física
              </span>
              <h1 className="text-2xl font-black text-white">Congreso Gracia y Misericordia</h1>
              <p className="text-gold font-mono text-2xl font-bold mt-1">Boleto #{physicalTicket?.number.toString().padStart(3, '0')}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <p className="text-white/70 text-xs text-center">
              Para validar tus accesos, 3 almuerzos y temas de transporte, por favor completa tu registro oficial:
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Bloque 1: Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <User size={16} /> Datos Personales
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Nombre Completo *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Nombre y Apellido"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Cédula de Identidad *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Cédula (números)"
                      value={docId}
                      onChange={e => setDocId(e.target.value.replace(/\D/g, ''))}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Teléfono WhatsApp *</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="04141234567"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Correo (Opcional)</label>
                    <input 
                      type="email" 
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Procedencia & Vida Parroquial */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-blue flex items-center gap-2">
                  <MapPin size={16} /> Procedencia y Parroquia
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Ciudad *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej: Maracaibo, San Francisco, Cabimas..."
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/80">Parroquia *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej: Basílica de Chiquinquirá..."
                      value={parish}
                      onChange={e => setParish(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Apostolado */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-white/80 block">
                    ¿Perteneces a un grupo de apostolado o movimiento eclesial? *
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setHasApostolate(true)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                        hasApostolate === true
                          ? "bg-gold text-slate-950 border-gold"
                          : "bg-slate-950 border-white/10 text-white/60 hover:bg-slate-800"
                      )}
                    >
                      <CheckCircle2 size={14} />
                      <span>Sí</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasApostolate(false);
                        setApostolateName('');
                      }}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                        hasApostolate === false
                          ? "bg-slate-800 text-white border-white/40"
                          : "bg-slate-950 border-white/10 text-white/60 hover:bg-slate-800"
                      )}
                    >
                      <span>No</span>
                    </button>
                  </div>

                  {hasApostolate === true && (
                    <div className="pt-2 animate-fade-in space-y-1">
                      <label className="text-xs font-semibold text-amber-300">
                        ¿A cuál grupo o movimiento perteneces? *
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Emaús, Cursillos, Encuentros Familiares..."
                        value={apostolateName}
                        onChange={e => setApostolateName(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-slate-950 border border-gold/30 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 3: Hospedaje & Transporte */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Home size={16} /> Hospedaje y Transporte
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 block">
                    ¿Cuál es tu situación de hospedaje para el Congreso? *
                  </label>

                  <div className="space-y-2">
                    {[
                      { id: 'local', title: 'Resido en Maracaibo / San Francisco (No requiero)' },
                      { id: 'has_own', title: 'Vengo de fuera y YA tengo hospedaje (Familia/Hotel)' },
                      { id: 'needs_lodging', title: 'Vengo de fuera y REQUIERO apoyo de hospedaje' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLodgingStatus(opt.id as any)}
                        className={cn(
                          "w-full p-3 rounded-xl border text-left text-xs font-medium transition-all",
                          lodgingStatus === opt.id
                            ? "bg-amber-500/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/50"
                            : "bg-slate-950 border-white/10 text-white/70 hover:bg-slate-800"
                        )}
                      >
                        {opt.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/80 block">
                    ¿En qué sector o zona de la ciudad te hospedarás / resides?
                    <span className="text-[10px] text-white/40 block font-normal">(Para coordinar rutas de transporte al Centro Lía Bermúdez)</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Delicias, La Limpia, Zona Norte, San Francisco..."
                    value={lodgingLocation}
                    onChange={e => setLodgingLocation(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 block">
                    ¿Cómo te trasladarás al Centro de Arte Lía Bermúdez? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransportStatus('own_vehicle')}
                      className={cn(
                        "p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex flex-col items-center justify-center gap-1",
                        transportStatus === 'own_vehicle'
                          ? "bg-amber-500/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/50"
                          : "bg-slate-950 border-white/10 text-white/70 hover:bg-slate-800"
                      )}
                    >
                      <Car size={16} />
                      <span>Vehículo Propio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportStatus('needs_transport')}
                      className={cn(
                        "p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex flex-col items-center justify-center gap-1",
                        transportStatus === 'needs_transport'
                          ? "bg-amber-500/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/50"
                          : "bg-slate-950 border-white/10 text-white/70 hover:bg-slate-800"
                      )}
                    >
                      <Bus size={16} />
                      <span>Transporte Público / Rutas</span>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold/90 text-slate-950 font-black py-4 rounded-xl mt-4 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-gold/20"
              >
                {isSubmitting ? (
                  <><Loader2 size={20} className="animate-spin" /> Registrando Entrada...</>
                ) : (
                  'Confirmar y Activar Entrada'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
