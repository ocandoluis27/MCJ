import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

interface MealBadgeProps {
  total: number;
  remaining: number;
}

export function MealBadge({ total = 3, remaining }: MealBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-900/50 rounded-full border border-white/5 shadow-inner">
        {Array.from({ length: total }).map((_, i) => {
          const isRemaining = i < remaining;
          return (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                isRemaining 
                  ? "bg-gold shadow-[0_0_8px_rgba(240,196,61,0.5)]" 
                  : "bg-slate-800 border border-white/10"
              )}
            >
              {isRemaining && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-800/50 text-white/70 border border-white/5">
        <Utensils size={12} className={remaining > 0 ? "text-gold" : "text-white/40"} />
        <span>
          {remaining} {remaining === 1 ? 'almuerzo' : 'almuerzos'} restante{remaining !== 1 && 's'}
        </span>
      </div>
    </div>
  );
}
