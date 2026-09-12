'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard as IdCard, 
  Phone, 
  Mail, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Upload, 
  Receipt,
  MapPin,
  Building,
  Home,
  Car,
  Bus,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { C2PPaymentForm } from '@/components/C2PPaymentForm';
import { cn } from '@/lib/utils';
import type { Attendee, PaymentMethod } from '@/types';

const TICKET_PRICE = 15; // USD por entrada

export default function PurchasePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Rates
  const [rates, setRates] = useState({ usd: 45.5, eur: 49.2 });
  const [loadingRates, setLoadingRates] = useState(true);

  // Form State - Datos Personales
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerDocId, setBuyerDocId] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Form State - Eclesial & Procedencia
  const [buyerCity, setBuyerCity] = useState('Maracaibo');
  const [buyerParish, setBuyerParish] = useState('');
  const [buyerHasApostolate, setBuyerHasApostolate] = useState<boolean | null>(null);
  const [buyerApostolateName, setBuyerApostolateName] = useState('');

  // Form State - Hospedaje & Transporte
  const [buyerLodgingStatus, setBuyerLodgingStatus] = useState<'local' | 'has_own' | 'needs_lodging'>('local');
  const [buyerLodgingLocation, setBuyerLodgingLocation] = useState('');
  const [buyerTransportStatus, setBuyerTransportStatus] = useState<'own_vehicle' | 'needs_transport'>('own_vehicle');

  const [additionalAttendees, setAdditionalAttendees] = useState<Attendee[]>([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('c2p');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/rates');
        if (res.ok) {
          const data = await res.json();
          setRates({ usd: data.dolar || 45.5, eur: data.euro || 49.2 });
        }
      } catch (err) {
        console.error('Failed to fetch rates', err);
      } finally {
        setLoadingRates(false);
      }
    }
    fetchRates();
  }, []);

  useEffect(() => {
    const additionalCount = quantity - 1;
    if (additionalCount > additionalAttendees.length) {
      const toAdd = additionalCount - additionalAttendees.length;
      const newAttendees = Array(toAdd).fill({ 
        name: '', 
        docId: '', 
        city: buyerCity,
        parish: buyerParish,
        lodgingStatus: buyerLodgingStatus
      });
      setAdditionalAttendees([...additionalAttendees, ...newAttendees]);
    } else if (additionalCount < additionalAttendees.length) {
      setAdditionalAttendees(additionalAttendees.slice(0, additionalCount));
    }
  }, [quantity, additionalAttendees, buyerCity, buyerParish, buyerLodgingStatus]);

  const updateAdditionalAttendee = (index: number, field: keyof Attendee, value: any) => {
    const updated = [...additionalAttendees];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalAttendees(updated);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerDocId || !buyerPhone || !buyerCity || !buyerParish) {
      alert('Por favor complete los campos obligatorios: Nombre, Cédula, Teléfono, Ciudad y Parroquia.');
      return;
    }
    
    if (buyerHasApostolate && !buyerApostolateName.trim()) {
      alert('Por favor indica a cuál grupo de apostolado o movimiento perteneces.');
      return;
    }

    // Check additional attendees
    for (const attendee of additionalAttendees) {
      if (!attendee.name || !attendee.docId) {
        alert('Por favor complete los datos de todos los acompañantes.');
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createOrder = async (reference: string, proofUrl?: string) => {
    setIsSubmitting(true);
    
    const allAttendees: Attendee[] = [
      { 
        name: buyerName, 
        docId: buyerDocId, 
        phone: buyerPhone, 
        email: buyerEmail,
        city: buyerCity,
        parish: buyerParish,
        hasApostolate: buyerHasApostolate ?? false,
        apostolateName: buyerHasApostolate ? buyerApostolateName : undefined,
        lodgingStatus: buyerLodgingStatus,
        lodgingLocation: buyerLodgingLocation,
        transportStatus: buyerTransportStatus
      },
      ...additionalAttendees
    ];

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerDocId,
          buyerPhone,
          buyerEmail,
          quantity,
          attendees: allAttendees,
          paymentMethod,
          paymentReference: reference || 'N/A',
          paymentProofUrl: proofUrl,
          amountPaid: paymentMethod === 'c2p' ? totalBs : totalUsd,
          currency: paymentMethod === 'c2p' ? 'VES' : 'USD',
          convertedUsd: totalUsd,
          rateApplied: rates.usd,
          salesChannel: 'online'
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        router.push(`/orden/${data.order.id}`);
      } else {
        alert(data.error || 'Error al procesar la orden.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert('Error de conexión al procesar la orden.');
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    createOrder(reference);
  };

  const totalUsd = quantity * TICKET_PRICE;
  const totalBs = totalUsd * rates.usd;

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Progress Bar */}
        <div className="mb-10 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold rounded-full z-0 transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
          
          <div className={cn("relative z-10 flex flex-col items-center gap-2", step >= 1 ? "text-gold" : "text-white/40")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 bg-slate-950 shadow-md", step >= 1 ? "border-gold text-gold" : "border-slate-800 text-slate-500")}>
              1
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">1. Registro y Logística</span>
          </div>
          
          <div className={cn("relative z-10 flex flex-col items-center gap-2", step >= 2 ? "text-gold" : "text-white/40")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 bg-slate-950 shadow-md", step >= 2 ? "border-gold text-gold" : "border-slate-800 text-slate-500")}>
              2
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">2. Pago Seguro</span>
          </div>
        </div>

        {/* Step 1: Registration */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Paso 1 de 2</span>
              <h1 className="text-3xl font-extrabold text-white mb-2">Inscripción al Congreso</h1>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Completa el formulario oficial para organizar tu acreditación, almuerzos y logística de traslado.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              
              {/* Card 1: Datos Personales */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <User className="text-gold" size={22} /> 
                  1. Datos del Titular / Comprador
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Nombre y Apellido *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: María Fernández"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Cédula de Identidad *</label>
                    <div className="relative">
                      <IdCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: 18456789 (solo números)"
                        value={buyerDocId}
                        onChange={e => setBuyerDocId(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Teléfono WhatsApp *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input 
                        required
                        type="tel" 
                        placeholder="Ej: 04141234567"
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                    <p className="text-[11px] text-white/40">Te enviaremos tus entradas digitales con código QR por aquí</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Correo Electrónico (Opcional)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        type="email" 
                        placeholder="ejemplo@correo.com"
                        value={buyerEmail}
                        onChange={e => setBuyerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Procedencia y Datos Eclesiásticos */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <MapPin className="text-sky-blue" size={22} /> 
                  2. Procedencia y Vida Parroquial
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Ciudad de Procedencia *</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Maracaibo, San Francisco, Cabimas, Caracas..."
                        value={buyerCity}
                        onChange={e => setBuyerCity(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/90">Parroquia a la que Asistes *</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Basílica Ntra. Sra. de Chiquinquirá..."
                        value={buyerParish}
                        onChange={e => setBuyerParish(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>
                </div>

                {/* ¿Pertenece a grupo de apostolado? */}
                <div className="pt-2 space-y-3">
                  <label className="text-xs font-bold text-white/90 block">
                    ¿Perteneces activamente a algún grupo de apostolado o movimiento eclesial? *
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setBuyerHasApostolate(true)}
                      className={cn(
                        "py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2",
                        buyerHasApostolate === true
                          ? "bg-gold text-slate-950 border-gold shadow-md shadow-gold/20"
                          : "bg-slate-950 border-white/10 text-white/70 hover:bg-slate-800"
                      )}
                    >
                      <CheckCircle2 size={14} />
                      <span>Sí, pertenezco</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerHasApostolate(false);
                        setBuyerApostolateName('');
                      }}
                      className={cn(
                        "py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2",
                        buyerHasApostolate === false
                          ? "bg-slate-800 text-white border-white/40 shadow-md"
                          : "bg-slate-950 border-white/10 text-white/70 hover:bg-slate-800"
                      )}
                    >
                      <span>No pertenezco</span>
                    </button>
                  </div>

                  {/* Campo condicional si Sí */}
                  {buyerHasApostolate === true && (
                    <div className="pt-2 space-y-1.5 animate-fade-in">
                      <label className="text-xs font-semibold text-amber-300">
                        ¿A cuál grupo, movimiento o pastoral perteneces? *
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Emaús, Cursillos, Encuentros Familiares, Lazos de Amor Mariano, Pastoral Juvenil..."
                        value={buyerApostolateName}
                        onChange={e => setBuyerApostolateName(e.target.value)}
                        className="w-full bg-slate-950 border border-gold/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Hospedaje & Transporte */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <Home className="text-amber-400" size={22} /> 
                  3. Logística de Hospedaje y Transporte
                </h2>
                
                {/* Situación de Hospedaje */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/90 block">
                    ¿Cuál es tu situación de hospedaje para los 3 días del Congreso? *
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { 
                        id: 'local', 
                        title: 'Resido en Maracaibo o San Francisco', 
                        desc: 'No requiero hospedaje, asistiré desde mi residencia propia.',
                        icon: Home
                      },
                      { 
                        id: 'has_own', 
                        title: 'Vengo de otra ciudad y YA tengo hospedaje', 
                        desc: 'Me hospedaré con familiares, amigos o en hotel por mi propia cuenta.',
                        icon: Building
                      },
                      { 
                        id: 'needs_lodging', 
                        title: 'Vengo de otra ciudad y REQUIERO apoyo de hospedaje', 
                        desc: 'Necesito coordinación con familias o casas de acogida del Congreso.',
                        icon: HeartHandshake
                      }
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = buyerLodgingStatus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBuyerLodgingStatus(opt.id as any)}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5",
                            isSelected
                              ? "bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/50"
                              : "bg-slate-950 border-white/10 hover:bg-slate-800/60"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl mt-0.5 shrink-0",
                            isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                          )}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <span className={cn("text-xs font-bold block", isSelected ? "text-amber-300" : "text-white")}>
                              {opt.title}
                            </span>
                            <span className="text-[11px] text-white/60 leading-relaxed block mt-0.5">
                              {opt.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sector donde se hospedará (para logística de transporte) */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-white/90 block">
                    ¿En qué sector o zona de la ciudad te hospedarás / resides?
                    <span className="text-white/40 font-normal text-[11px] block mt-0.5">
                      (Nos permite coordinar rutas de transporte y puntos de encuentro al Lía Bermúdez)
                    </span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Zona Norte, Delicias, 5 de Julio, La Limpia, San Francisco, Circunvalación 2..."
                    value={buyerLodgingLocation}
                    onChange={e => setBuyerLodgingLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                {/* Traslado / Transporte */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-white/90 block">
                    ¿Cómo te trasladarás al Centro de Arte Lía Bermúdez (CAMLB)? *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBuyerTransportStatus('own_vehicle')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3",
                        buyerTransportStatus === 'own_vehicle'
                          ? "bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50"
                          : "bg-slate-950 border-white/10 hover:bg-slate-800"
                      )}
                    >
                      <Car size={20} className={buyerTransportStatus === 'own_vehicle' ? "text-amber-300" : "text-slate-400"} />
                      <div>
                        <span className="text-xs font-bold text-white block">Vehículo / Transporte Propio</span>
                        <span className="text-[10px] text-white/50">Cuento con movilidad propia</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuyerTransportStatus('needs_transport')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3",
                        buyerTransportStatus === 'needs_transport'
                          ? "bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50"
                          : "bg-slate-950 border-white/10 hover:bg-slate-800"
                      )}
                    >
                      <Bus size={20} className={buyerTransportStatus === 'needs_transport' ? "text-amber-300" : "text-slate-400"} />
                      <div>
                        <span className="text-xs font-bold text-white block">Transporte Público / Rutas</span>
                        <span className="text-[10px] text-white/50">Requeriré apoyo o transporte público</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4: Entradas y Acompañantes */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="text-gold" size={22} /> 
                    4. Cantidad de Entradas
                  </h2>
                  <div className="flex items-center gap-4 bg-slate-950 border border-white/10 p-2 rounded-xl">
                    <span className="text-xs text-white/60 px-2 font-medium">Cantidad:</span>
                    <select 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-slate-800 text-white border-none rounded-lg py-1.5 px-3 focus:ring-0 font-bold text-center text-sm cursor-pointer"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Entrada' : 'Entradas'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {quantity > 1 && (
                  <div className="space-y-4 mt-4">
                    <p className="text-xs text-amber-300 font-medium">
                      Por favor ingresa los datos de cada uno de tus acompañantes:
                    </p>
                    {additionalAttendees.map((attendee, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-white/5 relative">
                        <div className="absolute -left-2.5 -top-2.5 w-6 h-6 rounded-full bg-gold text-slate-950 flex items-center justify-center text-[10px] font-black">
                          {index + 2}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/70">Nombre Completo</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Nombre del acompañante"
                            value={attendee.name}
                            onChange={e => updateAdditionalAttendee(index, 'name', e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/70">Cédula de Identidad</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Cédula"
                            value={attendee.docId}
                            onChange={e => updateAdditionalAttendee(index, 'docId', e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de Continuar */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold text-slate-950 font-black px-10 py-4 rounded-full text-sm uppercase tracking-wider hover:scale-105 active:scale-[0.98] transition-transform shadow-xl shadow-gold/20"
                >
                  <span>Continuar al Pago ({quantity} {quantity === 1 ? 'Entrada' : 'Entradas'})</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Volver a datos
              </button>
              <div className="text-right">
                <span className="text-[11px] text-white/50 uppercase tracking-widest block">Total a Pagar</span>
                <span className="text-2xl font-black text-emerald-400">${totalUsd.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Resumen de Orden */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3 text-xs">
              <div>
                <span className="text-white/50 block">Titular:</span>
                <strong className="text-white font-bold">{buyerName} ({buyerDocId})</strong>
                <span className="text-white/60 block">{buyerCity} • {buyerParish}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-white/50 block">Entradas:</span>
                <strong className="text-gold">{quantity} Pase(s) Oficial(es) de 3 Días</strong>
                <span className="text-white/60 block">{quantity * 3} Almuerzos incluidos</span>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Selecciona tu Método de Pago</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'c2p', label: 'C2P Débito Directo', badge: 'Recomendado' },
                  { id: 'pago_movil', label: 'Pago Móvil', badge: 'Manual' },
                  { id: 'cash', label: 'Efectivo / Taquilla', badge: 'En Sede' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                      paymentMethod === m.id
                        ? "bg-gold/15 border-gold ring-1 ring-gold shadow-lg shadow-gold/10"
                        : "bg-slate-900 border-white/10 text-white/60 hover:bg-slate-800"
                    )}
                  >
                    <span className="text-[11px] font-bold text-white block">{m.label}</span>
                    <span className="text-[9px] text-gold/80 uppercase font-bold">{m.badge}</span>
                  </button>
                ))}
              </div>

              {/* Formulario C2P */}
              {paymentMethod === 'c2p' && (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl mt-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Pago por C2P (Comercio a Persona)</h3>
                      <p className="text-xs text-white/60">Débito directo e instantáneo a tu cuenta bancaria nacional.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        Tasa BCV: Bs. {rates.usd}
                      </span>
                    </div>
                  </div>

                  <C2PPaymentForm 
                    amountBs={totalBs}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => alert(err)}
                  />
                </div>
              )}

              {/* Pago Móvil */}
              {paymentMethod === 'pago_movil' && (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">Datos de Pago Móvil</h3>
                  <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs border border-white/10">
                    <p className="text-white/80"><strong>Banco:</strong> Banco de Venezuela (0102)</p>
                    <p className="text-white/80"><strong>Teléfono:</strong> 0414-0000000</p>
                    <p className="text-white/80"><strong>RIF / C.I.:</strong> J-123456789</p>
                    <p className="text-amber-300 font-bold">Monto Exacto: Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const ref = prompt('Ingresa el número de referencia del Pago Móvil:');
                        if (ref) handlePaymentSuccess(ref);
                      }}
                      className="w-full bg-gold text-slate-950 font-bold py-3.5 rounded-xl text-sm"
                    >
                      Reportar Pago Móvil Realizado
                    </button>
                  </div>
                </div>
              )}

              {/* Efectivo */}
              {paymentMethod === 'cash' && (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-4 text-center">
                  <h3 className="text-base font-bold text-white">Pago en Efectivo o Taquilla</h3>
                  <p className="text-xs text-white/60 max-w-md mx-auto">
                    Tu orden quedará registrada en estado pendiente. Podrás abonar en efectivo en la sede de la Asociación o directamente el primer día del Congreso en la taquilla del Centro de Arte Lía Bermúdez.
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePaymentSuccess('EFECTIVO-TAQUILLA')}
                    className="bg-gold text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm"
                  >
                    Confirmar Reserva con Pago en Taquilla
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
