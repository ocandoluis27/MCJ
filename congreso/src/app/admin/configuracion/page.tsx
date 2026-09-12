'use client';

import { useState, useEffect } from 'react';
import { EventConfig } from '@/types';
import { Save, RefreshCw } from 'lucide-react';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.config);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) alert('Configuración guardada exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Cargando configuración...</div>;
  if (!config) return <div className="p-8 text-rose-400">Error al cargar.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Configuración del Evento</h1>
        <p className="text-sm text-slate-400">Ajusta los parámetros generales del Congreso.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Información Básica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Evento</label>
              <input type="text" value={config.eventName} onChange={e => setConfig({...config, eventName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Precio de Entrada (USD)</label>
              <input type="number" step="0.01" value={config.ticketPriceUsd} onChange={e => setConfig({...config, ticketPriceUsd: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Tasas de Cambio Activas (BCV)</label>
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white flex items-center justify-between">
                  <span className="text-slate-500">USD $</span>
                  <span className="font-mono text-[#F0C43D]">{config.currentRateBsDollar} Bs</span>
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white flex items-center justify-between">
                  <span className="text-slate-500">EUR €</span>
                  <span className="font-mono text-[#70B8DF]">{config.currentRateBsEuro} Bs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Pago Móvil (Receptor)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Banco</label>
              <input type="text" value={config.paymentDetails.pagoMovil.bank} onChange={e => setConfig({...config, paymentDetails: {...config.paymentDetails, pagoMovil: {...config.paymentDetails.pagoMovil, bank: e.target.value}}})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label>
              <input type="text" value={config.paymentDetails.pagoMovil.phone} onChange={e => setConfig({...config, paymentDetails: {...config.paymentDetails, pagoMovil: {...config.paymentDetails.pagoMovil, phone: e.target.value}}})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Cédula / RIF</label>
              <input type="text" value={config.paymentDetails.pagoMovil.docId} onChange={e => setConfig({...config, paymentDetails: {...config.paymentDetails, pagoMovil: {...config.paymentDetails.pagoMovil, docId: e.target.value}}})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Titular</label>
              <input type="text" value={config.paymentDetails.pagoMovil.holder} onChange={e => setConfig({...config, paymentDetails: {...config.paymentDetails, pagoMovil: {...config.paymentDetails.pagoMovil, holder: e.target.value}}})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#70B8DF] focus:outline-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#1A3E82] hover:bg-[#1A3E82]/80 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
          {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
