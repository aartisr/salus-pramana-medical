import React from 'react';

export type BadgeVariant =
  | 'emerald'
  | 'amber'
  | 'indigo'
  | 'teal'
  | 'cyan'
  | 'rose'
  | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  slate: 'bg-slate-900 text-slate-300 border-slate-800',
};

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.2',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  icon,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-medium border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
