import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight, Utensils, Users, BookOpen, Sparkles, HeartHandshake } from 'lucide-react';
import { Countdown } from '@/components/Countdown';

export default function LandingPage() {
  const SPEAKERS = [
    { name: 'Pbro. Ignacio Amorós', role: 'Sacerdote y Escritor', tag: 'Predicador' },
    { name: 'Pbro. Renzo Gotera', role: 'Sacerdote Arquidiocesano', tag: 'Predicador' },
    { name: 'Pbro. Inocencio Llamas', role: 'Sacerdote y Misionero', tag: 'Predicador' },
    { name: 'Sor. Caterina Esselen', role: 'Religiosa de la Divina Misericordia', tag: 'Ponente' },
    { name: 'Sor. Filipa', role: 'Religiosa de la Divina Misericordia', tag: 'Ponente' },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden bg-slate-950">
        {/* Background decorations - Rayos de la Misericordia */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full md:w-[800px] h-full bg-gradient-to-l from-blue-deep/30 to-transparent opacity-80" />
          
          {/* Rayo Rojo (Misericordia) y Celeste (Gracia) en CSS */}
          <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-600/15 blur-[130px] mix-blend-screen" />
          <div className="absolute top-1/4 right-[10%] w-[450px] h-[450px] rounded-full bg-blue-deep/40 blur-[110px] mix-blend-screen animate-pulse duration-10000" />
          <div className="absolute bottom-1/4 right-[25%] w-[320px] h-[320px] rounded-full bg-gold/20 blur-[90px] mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-12">
          {/* Left Content */}
          <div className="col-span-1 lg:col-span-7 flex flex-col items-start space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90 uppercase">
                Asociación Pública de Fieles María Camino a Jesús
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-serif italic text-gold tracking-widest block uppercase">
                «Llamó a los que quiso para que estuvieran con Él» — Marcos 3, 13
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.08] text-white">
                CONGRESO<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold font-serif italic font-normal">
                  Gracia y Misericordia
                </span>
              </h1>
            </div>
            
            <p className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
              Tres días inolvidables de renovación espiritual, Santa Eucaristía, adoración y formación con sacerdotes y religiosas invitadas en el corazón de Maracaibo.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white/90 w-full pt-2">
              <div className="flex items-center gap-3 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                <Calendar size={18} className="text-gold shrink-0" />
                <span className="font-bold text-sm">16 al 18 de Octubre 2026</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                <MapPin size={18} className="text-sky-blue shrink-0" />
                <span className="font-medium text-sm">Centro de Arte Lía Bermúdez (CAMLB)</span>
              </div>
            </div>
            
            <div className="pt-4 w-full sm:w-auto flex flex-col sm:flex-row gap-4">
              <Link 
                href="/comprar" 
                className="group relative inline-flex items-center justify-center gap-2 bg-gold text-slate-950 font-black px-8 py-4 rounded-full overflow-hidden transition-transform active:scale-[0.98] shadow-lg shadow-gold/20"
              >
                <span className="relative z-10 text-sm uppercase tracking-wider">Adquirir Entrada</span>
                <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/25 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </Link>
              <a
                href="#ponentes"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-bold"
              >
                Conocer Ponentes
              </a>
            </div>
          </div>
          
          {/* Right Content / Afiche Oficial & Countdown */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-center lg:items-end gap-6 animate-slide-in-up">
            <div className="relative w-full max-w-sm rounded-3xl border-2 border-gold/30 bg-slate-900/60 backdrop-blur-xl overflow-hidden p-5 shadow-2xl space-y-4">
              {/* Afiche Thumbnail */}
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/afiche-congreso.jpg" 
                  alt="Afiche Oficial Congreso Gracia y Misericordia"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-bold text-amber-300 bg-slate-950/90 px-2.5 py-1 rounded-full border border-gold/30">
                    Afiche Oficial del Congreso
                  </span>
                </div>
              </div>

              <div>
                <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase block mb-1">Cuenta Regresiva</span>
                <Countdown />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Ponentes e Invitados Especiales */}
      <section id="ponentes" className="py-20 bg-slate-900 text-white relative border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-2">Invitados Especiales</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Predicadores y Religiosas</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Contaremos con la presencia y enseñanza de destacados sacerdotes y religiosas consagradas al carisma de la Misericordia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPEAKERS.map((speaker, index) => (
              <div 
                key={index}
                className="rounded-2xl bg-slate-950/70 border border-white/10 p-6 flex flex-col justify-between hover:border-gold/50 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
                      {speaker.tag}
                    </span>
                    <Sparkles size={16} className="text-gold/60" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{speaker.name}</h3>
                  <p className="text-xs text-slate-400">{speaker.role}</p>
                </div>
              </div>
            ))}

            {/* Tarjeta Santa Faustina */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-deep/60 to-slate-950 border border-gold/40 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Intercesora
                  </span>
                  <HeartHandshake size={16} className="text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Santa Faustina Kowalska</h3>
                <p className="text-xs text-slate-300">Apóstol de la Divina Misericordia e inspiración de nuestro movimiento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section - Lo que incluye la entrada */}
      <section id="congreso" className="py-24 bg-slate-50 text-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Title column */}
            <div className="col-span-1 md:col-span-5 md:sticky md:top-32 self-start">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-deep block mb-2">Detalles del Congreso</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Una experiencia de <br/>
                <span className="text-blue-deep font-serif italic">Gracia y Misericordia</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
                El Centro de Arte Lía Bermúdez de Maracaibo abrirá sus puertas para recibir a cientos de fieles durante 3 días completos de oración, Santa Misa, conferencias y fraternidad.
              </p>
              <Link 
                href="/comprar"
                className="inline-flex items-center gap-2 text-blue-deep font-bold hover:gap-3 transition-all text-base"
              >
                Adquiere tu pase digital <ArrowRight size={20} />
              </Link>
            </div>
            
            {/* Features column */}
            <div className="col-span-1 md:col-span-7 flex flex-col gap-8">
              
              {/* Feature 1 */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="w-14 h-14 bg-blue-deep rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-deep/20 relative z-10">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">Formación y Santa Eucaristía</h3>
                <p className="text-slate-600 leading-relaxed relative z-10">
                  Conferencias magistrales, testimonios y la celebración diaria de la Santa Misa, acompañados de sacerdotes y religiosas dedicados a la predicación de la fe.
                </p>
              </div>

              {/* Feature 2 - Comidas */}
              <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-10 shadow-xl md:ml-8 relative overflow-hidden group">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center mb-6 text-slate-950 shadow-lg shadow-gold/20 relative z-10">
                  <Utensils size={28} />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">3 Almuerzos Incluidos</h3>
                    <p className="text-white/70 leading-relaxed">
                      Tu entrada incluye los almuerzos de los tres días del Congreso (Viernes 16, Sábado 17 y Domingo 18). Nuestro sistema QR descuenta automáticamente cada comida en el comedor sin necesidad de tickets físicos de papel.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2 ml-6 shrink-0">
                    <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-slate-950 font-black text-xs">D1</span>
                    <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-slate-950 font-black text-xs">D2</span>
                    <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-slate-950 font-black text-xs">D3</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-sky-blue/10 rounded-3xl p-8 md:p-10 border border-sky-blue/20 hover:bg-sky-blue/15 transition-colors relative overflow-hidden group">
                <div className="w-14 h-14 bg-sky-blue rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-sky-blue/20 relative z-10">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">Comunidad y Fraternidad</h3>
                <p className="text-slate-700 leading-relaxed relative z-10">
                  Encuentro con miembros de parroquias, movimientos apostólicos y familias de todo el estado Zulia y Venezuela para compartir un mismo carisma en comunión eclesial.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-blue-deep text-white text-center px-4 relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Aforo Limitado</span>
          <h2 className="text-3xl sm:text-5xl font-black">Reserva tu entrada hoy</h2>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Completa el formulario de registro obligatorio y asegura tu pase para los tres días del Congreso Gracia y Misericordia.
          </p>
          <div className="pt-4">
            <Link 
              href="/comprar" 
              className="inline-flex items-center gap-2 bg-gold text-slate-950 font-black px-10 py-4 rounded-full text-base hover:scale-105 transition-transform shadow-2xl shadow-gold/30"
            >
              Comprar Entrada Ahora <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
