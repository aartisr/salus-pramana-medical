import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'indigo' | 'teal' | 'cyan' | 'rose' | 'slate';
  className?: string;
}

const textColors = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  indigo: 'text-indigo-400',
  teal: 'text-teal-300',
  cyan: 'text-cyan-300',
  rose: 'text-rose-400',
  slate: 'text-slate-100',
};

export const StatCard: React.FC<StatCardProps> = React.memo(({
  label,
  value,
  unit,
  subtext,
  icon,
  variant = 'slate',
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3.5 sm:p-4 space-y-1 backdrop-blur-sm transition-all hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
        <span>{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono ${textColors[variant]}`}>
        {value} {unit && <span className="text-xs sm:text-sm font-normal text-slate-400">{unit}</span>}
      </div>
      {subtext && <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{subtext}</p>}
    </div>
  );
});

StatCard.displayName = 'StatCard';
