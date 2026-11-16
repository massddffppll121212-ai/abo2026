import React, { useState } from 'react';

interface Spatial3DCardProps {
  onClick: () => void;
  title: string;
  subtitle: string;
  badgeText?: string;
  icon3D: string;
  colorScheme: 'rose' | 'amber' | 'emerald' | 'sky' | 'purple' | 'indigo';
  children?: React.ReactNode;
  className?: string;
}

const SCHEMES = {
  rose: {
    border: 'border-rose-300/80 hover:border-rose-500',
    badge: 'bg-rose-500 text-white',
    bgGradient: 'from-white/95 via-rose-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(244,63,94,0.18)] hover:shadow-[0_20px_48px_rgba(244,63,94,0.32)]',
    iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-500 shadow-rose-300/80',
    titleColor: 'group-hover:text-rose-600',
  },
  amber: {
    border: 'border-amber-300/80 hover:border-amber-500',
    badge: 'bg-amber-500 text-white',
    bgGradient: 'from-white/95 via-amber-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(245,158,11,0.18)] hover:shadow-[0_20px_48px_rgba(245,158,11,0.32)]',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-300/80',
    titleColor: 'group-hover:text-amber-600',
  },
  emerald: {
    border: 'border-emerald-300/80 hover:border-emerald-500',
    badge: 'bg-emerald-600 text-white',
    bgGradient: 'from-white/95 via-emerald-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(16,185,129,0.18)] hover:shadow-[0_20px_48px_rgba(16,185,129,0.32)]',
    iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-300/80',
    titleColor: 'group-hover:text-emerald-600',
  },
  sky: {
    border: 'border-sky-300/80 hover:border-sky-500',
    badge: 'bg-sky-500 text-white',
    bgGradient: 'from-white/95 via-sky-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(14,165,233,0.18)] hover:shadow-[0_20px_48px_rgba(14,165,233,0.32)]',
    iconBg: 'bg-gradient-to-tr from-sky-400 to-blue-600 shadow-sky-300/80',
    titleColor: 'group-hover:text-sky-600',
  },
  purple: {
    border: 'border-purple-300/80 hover:border-purple-500',
    badge: 'bg-purple-600 text-white',
    bgGradient: 'from-white/95 via-purple-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(168,85,247,0.18)] hover:shadow-[0_20px_48px_rgba(168,85,247,0.32)]',
    iconBg: 'bg-gradient-to-tr from-purple-500 to-fuchsia-600 shadow-purple-300/80',
    titleColor: 'group-hover:text-purple-600',
  },
  indigo: {
    border: 'border-indigo-300/80 hover:border-indigo-500',
    badge: 'bg-indigo-600 text-white',
    bgGradient: 'from-white/95 via-indigo-50/60 to-white/90',
    shadow: 'shadow-[0_16px_36px_rgba(99,102,241,0.18)] hover:shadow-[0_20px_48px_rgba(99,102,241,0.32)]',
    iconBg: 'bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-indigo-300/80',
    titleColor: 'group-hover:text-indigo-600',
  },
};

export const Spatial3DCard: React.FC<Spatial3DCardProps> = ({
  onClick,
  title,
  subtitle,
  badgeText,
  icon3D,
  colorScheme,
  children,
  className = '',
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const theme = SCHEMES[colorScheme] || SCHEMES.amber;

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate subtle 3D tilt angles
    setRotateY((x / rect.width) * 14);
    setRotateX((-y / rect.height) * 14);
  };

  const handlePointerLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <button
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`,
        transition: 'transform 0.18s ease-out, shadow 0.25s ease',
        transformStyle: 'preserve-3d',
      }}
      className={`group relative bg-gradient-to-br ${theme.bgGradient} backdrop-blur-xl border-3 ${theme.border} rounded-[28px] p-5 text-right flex items-center justify-between ${theme.shadow} transition-all active:scale-95 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Top 3D Specular Highlight Shimmer */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      {/* Content Side */}
      <div className="space-y-1.5 z-10" style={{ transform: 'translateZ(15px)' }}>
        {badgeText && (
          <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs ${theme.badge}`}>
            {badgeText}
          </span>
        )}

        <h3 className={`text-xl font-black text-slate-800 pt-0.5 transition-colors ${theme.titleColor}`}>
          {title}
        </h3>

        <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[260px] sm:max-w-xs">
          {subtitle}
        </p>

        {children}
      </div>

      {/* 2026-Gen Futuristic 3D Icon Badge */}
      <div 
        className="z-10 shrink-0" 
        style={{ transform: 'translateZ(30px)' }}
      >
        <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl ${theme.iconBg} text-white flex items-center justify-center text-3xl sm:text-4xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 border-2 border-white/40`}>
          <span className="drop-shadow-md select-none">{icon3D}</span>
        </div>
      </div>
    </button>
  );
};
