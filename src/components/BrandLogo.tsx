import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 28,
  className = '',
  animated = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${
        animated ? 'transition-transform duration-500 hover:scale-105' : ''
      } ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wifo_hex_outer" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="wifo_hex_inner" x1="10" y1="8" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="wifo_core_glow" x1="16" y1="16" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A5F3FC" />
        </linearGradient>
      </defs>

      {/* Outer Isometric Hexagonal Shield */}
      <path
        d="M22 3L38.5 12.5V31.5L22 41L5.5 31.5V12.5L22 3Z"
        stroke="url(#wifo_hex_outer)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="rgba(15, 23, 42, 0.55)"
      />

      {/* Interlocking Quantum Infinity / Orbital Ribbon */}
      <path
        d="M11.5 22C11.5 17.5 15.2 14.5 18.8 17.2L25.2 26.8C28.8 29.5 32.5 26.5 32.5 22C32.5 17.5 28.8 14.5 25.2 17.2L18.8 26.8C15.2 29.5 11.5 26.5 11.5 22Z"
        stroke="url(#wifo_hex_inner)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Isometric Structural Axis Lines */}
      <path
        d="M22 3V11M22 33V41M5.5 12.5L12 16.2M32 27.8L38.5 31.5M38.5 12.5L32 16.2M12 27.8L5.5 31.5"
        stroke="url(#wifo_hex_outer)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Central Quantum Core Diamond */}
      <polygon
        points="22,16.5 27.5,22 22,27.5 16.5,22"
        fill="url(#wifo_core_glow)"
      />
    </svg>
  );
};
