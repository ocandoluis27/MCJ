'use client';

import { useState, useEffect } from 'react';
import { Ticket } from '@/types';
import { Search, Download, CheckCircle2, Utensils, MapPin, Building, Home, Car, Bus } from 'lucide-react';
import * as xlsx from 'xlsx';

export default function AsistentesPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'digital' | 'physical'>('all');

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTickets(data.tickets);
        setLoading(false);
      });
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.attendeeName.toLowerCase().includes(search.toLowerCase()) || 
      t.attendeeDocId.includes(search) ||
      t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      (t.city && t.city.toLowerCase().includes(search.toLowerCase())) ||
      (t.parish && t.parish.toLowerCase().includes(search.toLowerCase())) ||
      (t.apostolateName && t.apostolateName.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && t.ticketType === filter;
  });

  const handleExport = () => {
    const data = filteredTickets.map(t => ({
      'Código': t.ticketCode,
      'Tipo': t.ticketType === 'physical' ? 'Física' : 'Digital',
      'Asistente': t.attendeeName,
      'Cédula': t.attendeeDocId,
      'Teléfono': t.attendeePhone || 'N/A',
      'Email': t.attendeeEmail || 'N/A',
      'Ciudad': t.city || 'Maracaibo',
      'Parroquia': t.parish || 'N/A',
      'Grupo Apostolado': t.hasApostolate ? (t.apostolateName || 'Sí') : 'No',
      'Hospedaje': t.lodgingStatus === 'needs_lodging' ? 'Requiere hospedaje' : t.lodgingStatus === 'has_own' ? 'Hospedaje propio' : 'Residente local',
      'Sector Hospedaje': t.lodgingLocation || 'N/A',
      'Transporte': t.transportStatus === 'needs_transport' ? 'Requiere apoyo / transporte' : 'Vehículo propio',
      'Almuerzos Restantes': t.mealsRemaining,
      'Asistencia': t.isUsed ? 'Sí' : 'No'
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Asistentes");
    xlsx.writeFile(wb, `Asistentes_Congreso_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Base de Asistentes y Logística</h1>
          <p className="text-sm text-slate-400">Listado consolidado de participantes, procedencia, hospedaje y transporte.</p>
        </div>
        <button 
          onClick={handleExport} 
          className="flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-colors text-xs uppercase tracking-wider shadow-md shadow-gold/20"
        >
          <Download className="h-4 w-4" />
          Exportar a Excel (.xlsx)
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, código, parroquia o grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#70B8DF]"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === 'all' ? 'bg-gold text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Todos</button>
          <button onClick={() => setFilter('digital')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === 'digital' ? 'bg-gold text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Digitales</button>
          <button onClick={() => setFilter('physical')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === 'physical' ? 'bg-gold text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Físicas</button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Código / Tipo</th>
                <th className="px-4 py-3.5">Asistente y Cédula</th>
                <th className="px-4 py-3.5">Parroquia y Ciudad</th>
                <th className="px-4 py-3.5">Apostolado</th>
                <th className="px-4 py-3.5">Hospedaje & Transporte</th>
                <th className="px-4 py-3.5 text-center">Almuerzos</th>
                <th className="px-4 py-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Cargando base de datos...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No se encontraron resultados</td></tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-gold font-bold">{t.ticketCode}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.ticketType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-sm">{t.attendeeName}</div>
                      <div className="text-[11px] text-slate-400">V-{t.attendeeDocId} • {t.attendeePhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{t.parish || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} className="text-sky-blue" />
                        <span>{t.city || 'Maracaibo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.hasApostolate ? (
                        <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px]">
                          {t.apostolateName || 'Activo'}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Sin apostolado</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[11px] text-slate-300">
                        {t.lodgingStatus === 'needs_lodging' ? (
                          <span className="text-rose-300 font-bold">Requiere hospedaje</span>
                        ) : t.lodgingStatus === 'has_own' ? (
                          <span className="text-sky-200">Hospedaje propio</span>
                        ) : (
                          <span className="text-slate-400">Residente local</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t.lodgingLocation ? `Zona: ${t.lodgingLocation}` : ''}
                        {t.transportStatus === 'needs_transport' ? ' • Pide apoyo transporte' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3].map(num => (
                          <div key={num} className={`w-2.5 h-2.5 rounded-full ${num <= t.mealsRemaining ? 'bg-amber-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{t.mealsRemaining}/3</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.isUsed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Ingresó
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
