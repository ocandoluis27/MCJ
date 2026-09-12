'use client';

import { useState, useEffect } from 'react';
import { PhysicalTicket } from '@/types';
import { QrCode, Search, Download, PlusCircle } from 'lucide-react';

export default function EntradasFisicasPage() {
  const [tickets, setTickets] = useState<PhysicalTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets/physical');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleGenerate = async () => {
    if (!confirm('¿Seguro que deseas generar las 250 entradas físicas? Esto tomará unos segundos.')) return;
    setGenerating(true);
    try {
      await fetch('/api/tickets/physical', { method: 'POST' });
      await fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.number.toString().includes(search) || 
    t.ticketCode.toLowerCase().includes(search.toLowerCase())
  );

  const activatedCount = tickets.filter(t => t.isActivated).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Entradas Físicas</h1>
          <p className="text-sm text-slate-400">Control de los 250 tickets pre-impresos.</p>
        </div>
        <div className="flex gap-2">
          {tickets.length === 0 && (
            <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 bg-[#F0C43D] hover:bg-[#F0C43D]/90 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50">
              <PlusCircle className="h-4 w-4" />
              {generating ? 'Generando...' : 'Generar 250 Entradas'}
            </button>
          )}
          <a href="/api/tickets/physical/download" target="_blank" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Download className="h-4 w-4" />
            Descargar QRs (ZIP)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-sm text-slate-400">Total Generadas</div>
          <div className="text-2xl font-black text-white">{tickets.length} / 250</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-sm text-slate-400">Activadas</div>
          <div className="text-2xl font-black text-emerald-400">{activatedCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-sm text-slate-400">Pendientes</div>
          <div className="text-2xl font-black text-amber-400">{tickets.length - activatedCount}</div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por número (ej: 45) o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#70B8DF]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Cargando entradas...</div>
        ) : filteredTickets.map(t => (
          <div key={t.number} className={`relative p-3 rounded-xl border ${t.isActivated ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
            <div className="absolute top-2 right-2 text-xs font-mono font-bold opacity-50">#{t.number.toString().padStart(3, '0')}</div>
            <QrCode className={`h-8 w-8 mb-2 ${t.isActivated ? 'text-emerald-400' : 'text-slate-600'}`} />
            <div className="text-[10px] font-mono text-slate-400 break-all">{t.ticketCode}</div>
            {t.isActivated ? (
              <div className="mt-2 text-xs font-bold text-emerald-400 truncate" title={t.activatedBy}>{t.activatedBy}</div>
            ) : (
              <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sin activar</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
