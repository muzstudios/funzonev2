import React from 'react';
import { Palette, Check, Eye, EyeOff, Cpu, Atom } from 'lucide-react';
import { AILevel, ProcessorTechType } from '../types';

export interface ProcessorThemeConfig {
  id: AILevel;
  shortLabel: string;
  themeName: string;
  subtitle: string;
  paletteDescription: string;
  techType: ProcessorTechType;
  techQualityLabel: string;
  writeSeconds: number;
  coreCountLabel: string;
  swatchHex: [string, string, string];
  swatchClass: string;
  activeRing: string;
  // Root page background & text
  darkPageBg: string;
  lightPageBg: string;
  // Header & Footer surface
  darkHeaderBg: string;
  lightHeaderBg: string;
  // Card / Canvas surface & border
  darkCardBg: string;
  lightCardBg: string;
  darkBorder: string;
  lightBorder: string;
  // Subheader / Composer surface
  darkSubtleBg: string;
  lightSubtleBg: string;
  // Brand & Heading text gradient
  brandGradient: string;
  // Primary CTA / Send button gradient
  buttonGradient: string;
  // Badge & Accent classes
  badgeBg: string;
  darkBadgeBg: string;
  darkBadgeText: string;
  darkBadgeBorder: string;
  lightBadgeBg: string;
  lightBadgeText: string;
  lightBadgeBorder: string;
  accentText: string;
  activeNavBorder: string;
  // Ambient background radial glow classes
  ambientGlowPrimary: string;
  ambientGlowSecondary: string;
}

export const ALL_AI_LEVELS: AILevel[] = [
  'A1',
  'A1+',
  'A2-',
  'A2',
  'A2+',
  'A3_QUANTUM',
  'Q_PU_9000',
];

export const PROCESSOR_THEMES: Record<AILevel, ProcessorThemeConfig> = {
  A1: {
    id: 'A1',
    shortLabel: 'WİFO A1',
    themeName: 'Safir Tensor',
    subtitle: 'WİFO A1 · Tensor Teknolojisi (Ortalama) · 20 Saniye Yazım',
    paletteDescription: '128 Tensor matrisi (Ortalama Seviye) ve 20sn yazım için kobalt mavi paleti',
    techType: 'TENSOR',
    techQualityLabel: 'Tensor · Ortalama',
    writeSeconds: 20,
    coreCountLabel: '128 Tensor',
    swatchHex: ['#3B82F6', '#6366F1', '#475569'],
    swatchClass: 'bg-blue-500',
    activeRing: 'ring-blue-500/40',
    darkPageBg: 'bg-[#080D18] text-slate-100',
    lightPageBg: 'bg-[#F6F8FC] text-slate-900',
    darkHeaderBg: 'bg-[#080D18]/90 border-blue-900/35',
    lightHeaderBg: 'bg-white/95 border-blue-200/70',
    darkCardBg: 'bg-[#0E1525]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-blue-500/20',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#0A101D]',
    lightSubtleBg: 'bg-slate-50/80',
    brandGradient: 'from-blue-400 via-indigo-400 to-slate-200',
    buttonGradient: 'from-blue-600 via-indigo-600 to-blue-700',
    badgeBg: 'bg-blue-500/15 border-blue-500/35 text-blue-300',
    darkBadgeBg: 'bg-blue-500/12',
    darkBadgeText: 'text-blue-300',
    darkBadgeBorder: 'border-blue-500/30',
    lightBadgeBg: 'bg-blue-50',
    lightBadgeText: 'text-blue-700',
    lightBadgeBorder: 'border-blue-200',
    accentText: 'text-blue-400',
    activeNavBorder: 'border-blue-400 text-blue-300',
    ambientGlowPrimary: 'bg-blue-500/7',
    ambientGlowSecondary: 'bg-slate-500/6',
  },
  'A1+': {
    id: 'A1+',
    shortLabel: 'WİFO A1+',
    themeName: 'İndigo Tensor',
    subtitle: 'WİFO A1+ · Tensor Teknolojisi (Ortalama) · 16 Saniye Yazım',
    paletteDescription: '256 Tensor çekirdeği (Ortalama Seviye) ve 16sn yazım için elektrik indigo paleti',
    techType: 'TENSOR',
    techQualityLabel: 'Tensor · Ortalama',
    writeSeconds: 16,
    coreCountLabel: '256 Tensor',
    swatchHex: ['#38BDF8', '#6366F1', '#818CF8'],
    swatchClass: 'bg-indigo-500',
    activeRing: 'ring-indigo-500/40',
    darkPageBg: 'bg-[#090D1C] text-slate-100',
    lightPageBg: 'bg-[#F6F8FF] text-slate-900',
    darkHeaderBg: 'bg-[#090D1C]/90 border-indigo-900/40',
    lightHeaderBg: 'bg-white/95 border-indigo-200/75',
    darkCardBg: 'bg-[#101528]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-indigo-500/20',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#0C1020]',
    lightSubtleBg: 'bg-indigo-50/40',
    brandGradient: 'from-sky-400 via-indigo-400 to-violet-400',
    buttonGradient: 'from-sky-500 via-indigo-600 to-violet-600',
    badgeBg: 'bg-indigo-500/15 border-indigo-500/35 text-indigo-300',
    darkBadgeBg: 'bg-indigo-500/12',
    darkBadgeText: 'text-indigo-300',
    darkBadgeBorder: 'border-indigo-500/30',
    lightBadgeBg: 'bg-indigo-50',
    lightBadgeText: 'text-indigo-700',
    lightBadgeBorder: 'border-indigo-200',
    accentText: 'text-indigo-400',
    activeNavBorder: 'border-indigo-400 text-indigo-300',
    ambientGlowPrimary: 'bg-indigo-500/8',
    ambientGlowSecondary: 'bg-sky-500/7',
  },
  'A2-': {
    id: 'A2-',
    shortLabel: 'WİFO A2-',
    themeName: 'Buzul Tensor',
    subtitle: 'WİFO A2- · Tensor Teknolojisi (Ortalama) · 15 Saniye Yazım',
    paletteDescription: '384 Tensor matrisi (Tensor serisinin en üst modeli) ve 15sn yazım için buzul turkuaz paleti',
    techType: 'TENSOR',
    techQualityLabel: 'Tensor · Ortalama',
    writeSeconds: 15,
    coreCountLabel: '384 Tensor',
    swatchHex: ['#0EA5E9', '#14B8A6', '#64748B'],
    swatchClass: 'bg-sky-500',
    activeRing: 'ring-sky-500/40',
    darkPageBg: 'bg-[#071019] text-slate-100',
    lightPageBg: 'bg-[#F3FAFF] text-slate-900',
    darkHeaderBg: 'bg-[#071019]/90 border-sky-900/40',
    lightHeaderBg: 'bg-white/95 border-sky-200/75',
    darkCardBg: 'bg-[#0C1826]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-sky-500/25',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#09131F]',
    lightSubtleBg: 'bg-sky-50/40',
    brandGradient: 'from-sky-400 via-teal-400 to-blue-300',
    buttonGradient: 'from-sky-500 via-teal-600 to-blue-600',
    badgeBg: 'bg-sky-500/15 border-sky-500/35 text-sky-300',
    darkBadgeBg: 'bg-sky-500/12',
    darkBadgeText: 'text-sky-300',
    darkBadgeBorder: 'border-sky-500/30',
    lightBadgeBg: 'bg-sky-50',
    lightBadgeText: 'text-sky-700',
    lightBadgeBorder: 'border-sky-200',
    accentText: 'text-sky-400',
    activeNavBorder: 'border-sky-400 text-sky-300',
    ambientGlowPrimary: 'bg-sky-500/8',
    ambientGlowSecondary: 'bg-teal-500/7',
  },
  A2: {
    id: 'A2',
    shortLabel: 'WİFO A2',
    themeName: 'Zümrüt QUBİT',
    subtitle: 'WİFO A2 · QUBİT Teknolojisi (En İyi) · 10 Saniye Yazım',
    paletteDescription: '512 QUBİT (En İyi Teknoloji) ve 10sn yazım hızı için zümrüt yeşili paleti',
    techType: 'QUBIT',
    techQualityLabel: 'QUBİT · En İyi',
    writeSeconds: 10,
    coreCountLabel: '512 QUBİT',
    swatchHex: ['#10B981', '#14B8A6', '#06B6D4'],
    swatchClass: 'bg-emerald-500',
    activeRing: 'ring-emerald-500/40',
    darkPageBg: 'bg-[#06100F] text-slate-100',
    lightPageBg: 'bg-[#F4FBF9] text-slate-900',
    darkHeaderBg: 'bg-[#06100F]/90 border-emerald-900/40',
    lightHeaderBg: 'bg-white/95 border-emerald-200/75',
    darkCardBg: 'bg-[#0B1A18]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-emerald-500/20',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#081413]',
    lightSubtleBg: 'bg-emerald-50/40',
    brandGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    buttonGradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300',
    darkBadgeBg: 'bg-emerald-500/12',
    darkBadgeText: 'text-emerald-300',
    darkBadgeBorder: 'border-emerald-500/30',
    lightBadgeBg: 'bg-emerald-50',
    lightBadgeText: 'text-emerald-700',
    lightBadgeBorder: 'border-emerald-200',
    accentText: 'text-emerald-400',
    activeNavBorder: 'border-emerald-400 text-emerald-300',
    ambientGlowPrimary: 'bg-emerald-500/8',
    ambientGlowSecondary: 'bg-teal-500/8',
  },
  'A2+': {
    id: 'A2+',
    shortLabel: 'WİFO A2+',
    themeName: 'Ametist QUBİT',
    subtitle: 'WİFO A2+ · QUBİT Teknolojisi (En İyi) · 8 Saniye Yazım',
    paletteDescription: '768 QUBİT (En İyi Teknoloji) ve 8sn turbo yazım için mor-fuşya kuantum paleti',
    techType: 'QUBIT',
    techQualityLabel: 'QUBİT · En İyi',
    writeSeconds: 8,
    coreCountLabel: '768 QUBİT',
    swatchHex: ['#A855F7', '#EC4899', '#6366F1'],
    swatchClass: 'bg-purple-500',
    activeRing: 'ring-purple-500/40',
    darkPageBg: 'bg-[#0D0816] text-slate-100',
    lightPageBg: 'bg-[#FCF7FF] text-slate-900',
    darkHeaderBg: 'bg-[#0D0816]/90 border-purple-900/40',
    lightHeaderBg: 'bg-white/95 border-purple-200/75',
    darkCardBg: 'bg-[#170F26]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-purple-500/25',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#110B1D]',
    lightSubtleBg: 'bg-purple-50/40',
    brandGradient: 'from-purple-400 via-fuchsia-400 to-indigo-400',
    buttonGradient: 'from-purple-600 via-fuchsia-600 to-indigo-600',
    badgeBg: 'bg-purple-500/15 border-purple-500/35 text-purple-300',
    darkBadgeBg: 'bg-purple-500/12',
    darkBadgeText: 'text-purple-300',
    darkBadgeBorder: 'border-purple-500/30',
    lightBadgeBg: 'bg-purple-50',
    lightBadgeText: 'text-purple-700',
    lightBadgeBorder: 'border-purple-200',
    accentText: 'text-purple-400',
    activeNavBorder: 'border-purple-400 text-purple-300',
    ambientGlowPrimary: 'bg-purple-500/9',
    ambientGlowSecondary: 'bg-fuchsia-500/7',
  },
  A3_QUANTUM: {
    id: 'A3_QUANTUM',
    shortLabel: 'WİFO A3 Quantum',
    themeName: 'Kuantum Siyan QUBİT',
    subtitle: 'WİFO A3 QUANTUM · QUBİT Teknolojisi (En İyi) · 5 Saniye Yazım',
    paletteDescription: '1024 QUBİT (En İyi Teknoloji) ve 5sn süperpozisyon yazımı için derin siyan paleti',
    techType: 'QUBIT',
    techQualityLabel: 'QUBİT · En İyi',
    writeSeconds: 5,
    coreCountLabel: '1024 QUBİT',
    swatchHex: ['#22D3EE', '#3B82F6', '#8B5CF6'],
    swatchClass: 'bg-cyan-400',
    activeRing: 'ring-cyan-400/40',
    darkPageBg: 'bg-[#080C16] text-slate-100',
    lightPageBg: 'bg-[#F7FAFF] text-slate-900',
    darkHeaderBg: 'bg-[#080C16]/90 border-slate-800/80',
    lightHeaderBg: 'bg-white/95 border-slate-200/80',
    darkCardBg: 'bg-[#0E1422]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-slate-800/90',
    lightBorder: 'border-slate-200/90',
    darkSubtleBg: 'bg-[#0A0F1B]',
    lightSubtleBg: 'bg-slate-50/70',
    brandGradient: 'from-cyan-400 via-blue-400 to-violet-400',
    buttonGradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300',
    darkBadgeBg: 'bg-cyan-500/12',
    darkBadgeText: 'text-cyan-300',
    darkBadgeBorder: 'border-cyan-500/30',
    lightBadgeBg: 'bg-cyan-50',
    lightBadgeText: 'text-cyan-800',
    lightBadgeBorder: 'border-cyan-200',
    accentText: 'text-cyan-400',
    activeNavBorder: 'border-cyan-400 text-cyan-300',
    ambientGlowPrimary: 'bg-cyan-500/8',
    ambientGlowSecondary: 'bg-blue-500/8',
  },
  Q_PU_9000: {
    id: 'Q_PU_9000',
    shortLabel: 'Q-PU 9000 Series',
    themeName: 'Kurucu Kehribar QUBİT',
    subtitle: 'Q-PU 9000 SERIES · QUBİT Teknolojisi (En İyi) · 1 Saniye Yazım',
    paletteDescription: '4096 QUBİT (En İyi Teknoloji) ve 1sn hiper-yazım için kehribar ve altın tonları',
    techType: 'QUBIT',
    techQualityLabel: 'QUBİT · En İyi',
    writeSeconds: 1,
    coreCountLabel: '4096 QUBİT',
    swatchHex: ['#FBBF24', '#F97316', '#F43F5E'],
    swatchClass: 'bg-amber-400',
    activeRing: 'ring-amber-400/50',
    darkPageBg: 'bg-[#0E0A06] text-amber-50',
    lightPageBg: 'bg-[#FFFDF9] text-slate-900',
    darkHeaderBg: 'bg-[#110C07]/90 border-amber-500/25',
    lightHeaderBg: 'bg-[#FFFDF9]/95 border-amber-200/80',
    darkCardBg: 'bg-[#171109]/95',
    lightCardBg: 'bg-white',
    darkBorder: 'border-amber-500/25',
    lightBorder: 'border-amber-200/90',
    darkSubtleBg: 'bg-[#120D07]',
    lightSubtleBg: 'bg-amber-50/50',
    brandGradient: 'from-amber-300 via-orange-400 to-rose-400',
    buttonGradient: 'from-amber-400 via-orange-500 to-rose-500',
    badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    darkBadgeBg: 'bg-amber-500/15',
    darkBadgeText: 'text-amber-300',
    darkBadgeBorder: 'border-amber-500/35',
    lightBadgeBg: 'bg-amber-50',
    lightBadgeText: 'text-amber-800',
    lightBadgeBorder: 'border-amber-300',
    accentText: 'text-amber-400',
    activeNavBorder: 'border-amber-400 text-amber-300',
    ambientGlowPrimary: 'bg-amber-500/10',
    ambientGlowSecondary: 'bg-orange-500/8',
  },
};

interface ProcessorThemeStripProps {
  currentLevel: AILevel;
  isDarkMode: boolean;
  isProcessorThemeEnabled: boolean;
  onToggleProcessorTheme: () => void;
  onSelectLevel: (level: AILevel) => void;
}

export const ProcessorThemeStrip: React.FC<ProcessorThemeStripProps> = ({
  currentLevel,
  isDarkMode,
  isProcessorThemeEnabled,
  onToggleProcessorTheme,
  onSelectLevel,
}) => {
  const activeConfig = PROCESSOR_THEMES[currentLevel] || PROCESSOR_THEMES.A3_QUANTUM;

  return (
    <div
      className={`px-5 py-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all duration-500 ${
        isProcessorThemeEnabled
          ? isDarkMode
            ? `${activeConfig.darkCardBg} ${activeConfig.darkBorder}`
            : `${activeConfig.lightCardBg} ${activeConfig.lightBorder}`
          : isDarkMode
          ? 'bg-[#0E1422] border-slate-800/80'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Left: Unboxed Typographic Metadata + Technology Badge + Color Swatches */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Palette size={14} className={activeConfig.accentText} />
          <span>İşlemci Atmosferi:</span>
          <span className={activeConfig.accentText}>
            {isProcessorThemeEnabled ? activeConfig.themeName : 'Standart Nötr'}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
            activeConfig.techType === 'QUBIT'
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : 'bg-blue-500/15 border-blue-500/35 text-blue-300'
          }`}
        >
          {activeConfig.techType === 'QUBIT' ? <Atom size={11} /> : <Cpu size={11} />}
          <span>
            {activeConfig.techType === 'QUBIT'
              ? 'QUBİT Teknolojisi (En İyi)'
              : 'Tensor Teknolojisi (Ortalama)'}
          </span>
          <span>· {activeConfig.writeSeconds}sn</span>
        </span>

        <div className="flex items-center gap-1.5">
          {activeConfig.swatchHex.map((hex, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: hex }}
              title={`Palet Tonu ${i + 1}: ${hex}`}
            />
          ))}
        </div>
      </div>

      {/* Right: Interactive Segmented Processor Theme Switcher (All 7 Models) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border ${
            isDarkMode ? 'bg-[#090D16] border-slate-800/80' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {ALL_AI_LEVELS.map((lvl) => {
            const cfg = PROCESSOR_THEMES[lvl];
            const isSelected = currentLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(lvl)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`${cfg.shortLabel} · ${cfg.techQualityLabel} · ${cfg.writeSeconds}sn`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cfg.swatchHex[0] }}
                />
                <span>
                  {lvl === 'A3_QUANTUM' ? 'A3' : lvl === 'Q_PU_9000' ? 'Q-PU 9000' : lvl}
                </span>
                <span className="text-[9px] opacity-75">({cfg.writeSeconds}s)</span>
                {isSelected && <Check size={11} className={cfg.accentText} />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleProcessorTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isProcessorThemeEnabled
              ? activeConfig.badgeBg
              : isDarkMode
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="İşlemciye Göre Dinamik Renk Paletini Aç / Kapat"
        >
          {isProcessorThemeEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{isProcessorThemeEnabled ? 'Palet Açık' : 'Palet Kapalı'}</span>
        </button>
      </div>
    </div>
  );
};
