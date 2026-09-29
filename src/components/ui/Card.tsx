import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'amber' | 'emerald' | 'indigo' | 'teal' | 'none';
}

const glowBorders = {
  amber: 'border-amber-500/30 hover:border-amber-400/60 shadow-amber-500/5',
  emerald: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-500/5',
  indigo: 'border-indigo-500/30 hover:border-indigo-400/60 shadow-indigo-500/5',
  teal: 'border-teal-500/30 hover:border-teal-400/60 shadow-teal-500/5',
  none: 'border-slate-800 hover:border-slate-700',
};

export const Card: React.FC<CardProps> = React.memo(({
  children,
  className = '',
  glow = 'none',
}) => {
  return (
    <div
      className={`rounded-2xl border bg-slate-900/80 p-4 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-200 ${glowBorders[glow]} ${className}`}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
