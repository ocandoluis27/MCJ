'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCodeScanner from '@/components/QRCodeScanner';
import { EventStats, ScanResult } from '@/types';
import { 
  Utensils, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function AlmuerzosPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{ name: string; ticketCode: string; time: string; remaining: number }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

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
      body: JSON.stringify({ ticketCode: code, mode: 'meal', day: selectedDay, scannedBy: 'Estación de Comida' })
    });
    const data: ScanResult = await res.json();

    if (data.success && data.ticket) {
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendance: {
            ...prev.attendance,
            totalMealsServed: prev.attendance.totalMealsServed + 1,
            totalMealsRemaining: Math.max(0, prev.attendance.totalMealsRemaining - 1)
          }
        };
      });

      setRecentScans(prev => {
        if (prev.length > 0 && prev[0].ticketCode === data.ticket!.ticketCode) return prev;
        return [
          {
            name: data.ticket!.attendeeName,
            ticketCode: data.ticket!.ticketCode,
            time: new Date().toLocaleTimeString('es-VE'),
            remaining: data.ticket!.mealsRemaining
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
          <div className="flex items-center gap-1.5 text-xs text-[#F0C43D] font-bold bg-[#F0C43D]/10 border border-[#F0C43D]/30 px-3 py-1 rounded-full">
            <Utensils className="h-3 w-3" />
            <span>Control de Almuerzos</span>
          </div>
          <button onClick={fetchStats} className="text-xs text-[#F0C43D] hover:underline font-semibold flex items-center gap-1">
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                selectedDay === day 
                ? 'bg-[#1A3E82] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Día {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-amber-950/70 border border-amber-500/40 p-3 shadow-lg">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold mb-1">
              <Utensils className="h-3.5 w-3.5" />
              <span>Servidos (Global)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {stats?.attendance.totalMealsServed ?? 0}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 shadow-lg">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Utensils className="h-3.5 w-3.5" />
              <span>Restantes (Global)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-200">
              {stats?.attendance.totalMealsRemaining ?? 0}
            </div>
          </div>
        </div>

        <QRCodeScanner onScan={handleScanCode} scanMode="meal" />

        {recentScans.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Últimos almuerzos entregados:</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {recentScans.map((scan, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{scan.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(num => (
                        <div key={num} className={`w-2 h-2 rounded-full ${num <= scan.remaining ? 'bg-[#F0C43D]' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{scan.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
