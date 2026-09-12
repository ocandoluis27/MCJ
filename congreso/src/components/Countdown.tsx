'use client';

import { useState, useEffect } from 'react';

export function Countdown() {
  // Target date: 16 de Octubre de 2026
  const targetDate = new Date('2026-10-16T08:00:00-04:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl">
      {[
        { label: 'DÍAS', value: timeLeft.days },
        { label: 'HORAS', value: timeLeft.hours },
        { label: 'MINUTOS', value: timeLeft.minutes },
        { label: 'SEGUNDOS', value: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 w-full aspect-square rounded-xl md:rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <span className="text-2xl md:text-5xl font-bold text-white tabular-nums tracking-tighter">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-white/60 tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
