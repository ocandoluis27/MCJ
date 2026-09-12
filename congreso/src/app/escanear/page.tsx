'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCodeScanner from '@/components/QRCodeScanner';
import { EventStats, ScanResult } from '@/types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function EscanearAccesoPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{ name: string; ticketCode: string; time: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/stats?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleScanCode = async (code: string): Promise<ScanResult> => {
    const res = await fetch('/api/tickets/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode: code, mode: 'access', scannedBy: 'Personal de Puerta' })
    });
    const data: ScanResult = await res.json();

    if (data.success && data.ticket) {
      setStats(prev => {
        if (!prev) return prev;
        const newScanned = prev.attendance.scannedCount + 1;
        return {
          ...prev,
          attendance: {
            ...prev.attendance,
            scannedCount: newScanned,
            pendingScanCount: Math.max(0, prev.confirmedTickets - newScanned)
          }
        };
      });

      setRecentScans(prev => {
        if (prev.length > 0 && prev[0].ticketCode === data.ticket!.ticketCode) return prev;
        return [
          {
            name: data.ticket!.attendeeName,
            ticketCode: data.ticket!.ticketCode,
            time: new Date().toLocaleTimeString('es-VE')
          },
          ...prev.slice(0, 7)
        ];
      });

      setTimeout(fetchStats, 500);
    }

    return data;
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-slate-950 flex flex-col items-center font-outfit">
      <div className="w-full max-w-xl space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Panel</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#70B8DF] font-bold bg-[#1A3E82]/40 border border-[#1A3E82] px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[#70B8DF] animate-pulse" />
            <span>Control de Acceso — Congreso</span>
          </div>
          <button onClick={fetchStats} className="text-xs text-[#F0C43D] hover:underline font-semibold flex items-center gap-1">
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#1A3E82]/40 border border-[#1A3E82] p-3 shadow-lg">
            <div className="flex items-center justify-center gap-1 text-[#70B8DF] text-xs font-semibold mb-1">
              <Users className="h-3.5 w-3.5" />
              <span>Escaneadas</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.attendance.scannedCount ?? 0}
            </div>
            <span className="text-[10px] text-[#70B8DF]/80 font-medium">Asistentes en sala</span>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Pendientes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-200">
              {stats?.attendance.pendingScanCount ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Por llegar</span>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Users className="h-3.5 w-3.5" />
              <span>Total Entradas</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-200">
              {stats?.confirmedTickets ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Vendidas/Físicas</span>
          </div>
        </div>

        <QRCodeScanner onScan={handleScanCode} scanMode="access" />

        {recentScans.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Últimos ingresos:</span>
              <span className="text-emerald-400 font-mono text-[11px]">{recentScans.length} recientes</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {recentScans.map((scan, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{scan.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({scan.ticketCode})</span>
                  </div>
                  <span className="text-[11px] text-[#F0C43D] font-mono shrink-0 ml-2">{scan.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
