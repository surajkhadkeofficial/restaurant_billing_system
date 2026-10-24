import React from 'react';

interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, size = 'sm' }) => {
  const dimensionClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const innerDotClass = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  if (isVeg) {
    return (
      <span 
        className={`${dimensionClass} border border-emerald-600 rounded-[3px] flex items-center justify-center shrink-0 bg-white shadow-2xs`}
        title="Pure Vegetarian"
        aria-label="Vegetarian"
      >
        <span className={`${innerDotClass} rounded-full bg-emerald-600`} />
      </span>
    );
  }

  return (
    <span 
      className={`${dimensionClass} border border-red-700 rounded-[3px] flex items-center justify-center shrink-0 bg-white shadow-2xs`}
      title="Non-Vegetarian"
      aria-label="Non-Vegetarian"
    >
      <span 
        className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-700" 
      />
    </span>
  );
};

interface SpiceLevelIndicatorProps {
  level: 'mild' | 'medium' | 'spicy';
}

export const SpiceLevelIndicator: React.FC<SpiceLevelIndicatorProps> = ({ level }) => {
  const count = level === 'mild' ? 1 : level === 'medium' ? 2 : 3;
  const label = level === 'mild' ? 'Mild' : level === 'medium' ? 'Medium' : 'Spicy';
  
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-800" title={`Spice Level: ${label}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-xs">🌶️</span>
      ))}
      <span className="text-[10px] text-stone-500 font-medium ml-0.5">{label}</span>
    </span>
  );
};
