import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial="initial"
        animate="animate"
      >
        {/* Background Glow */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" /> {/* Blue */}
            <stop offset="50%" stopColor="#8B5CF6" /> {/* Purple */}
            <stop offset="100%" stopColor="#10B981" /> {/* Green */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Outer Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeDasharray="10 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* WİFO A1 Core Shape */}
        <motion.path
          d="M30 50 L50 20 L70 50 L50 80 Z"
          fill="url(#logoGradient)"
          fillOpacity="0.2"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinejoin="round"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central "A1" Text or Symbol */}
        <motion.path
          d="M40 60 L50 35 L60 60 M45 52 L55 52"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Orbiting Particles */}
        <motion.circle
          cx="50"
          cy="20"
          r="3"
          fill="#10B981"
          animate={{
            cx: [50, 80, 50, 20, 50],
            cy: [20, 50, 80, 50, 20],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
};

export default Logo;
