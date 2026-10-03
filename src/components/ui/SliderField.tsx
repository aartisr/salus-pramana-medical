import React from 'react';

interface SliderFieldProps {
  label: string;
  valueDisplay: React.ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  accent?: 'indigo' | 'amber' | 'emerald' | 'teal' | 'cyan';
  helperText?: string;
  className?: string;
}

const accentColors = {
  indigo: 'accent-indigo-500',
  amber: 'accent-amber-500',
  emerald: 'accent-emerald-500',
  teal: 'accent-teal-500',
  cyan: 'accent-cyan-500',
};

export const SliderField: React.FC<SliderFieldProps> = React.memo(({
  label,
  valueDisplay,
  min,
  max,
  step,
  value,
  onChange,
  accent = 'indigo',
  helperText,
  className = '',
}) => {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-3.5 space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold">{valueDisplay}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full ${accentColors[accent]} cursor-pointer`}
      />
      {helperText && <p className="text-[10px] text-slate-500 truncate">{helperText}</p>}
    </div>
  );
});

SliderField.displayName = 'SliderField';
