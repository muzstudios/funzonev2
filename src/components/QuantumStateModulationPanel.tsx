import React, { useState, useEffect, useMemo } from 'react';
import {
  Atom,
  Zap,
  Sliders,
  Activity,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Radio,
  Cpu,
  ShieldCheck,
  Play,
  Film,
} from 'lucide-react';
import { AILevel, QuantumTelemetry } from '../types';

export interface QuantumModulationState {
  presetId: 'bell_phi' | 'ghz_multi' | 'w_topology' | 'qpu_hyper';
  entanglementDepth: number; // 50.0 to 99.9999
  phaseAngleDeg: number; // 0 to 360
  pulseFrequencyTHz: number; // 1.2 to 12.8
  coherenceStability: number; // %
  activeQubitPairs: number;
}

interface QuantumStateModulationPanelProps {
  isDarkMode: boolean;
  activeAiLevel: AILevel;
  isGenerating: boolean;
  telemetry?: QuantumTelemetry;
  onModulationChange?: (state: QuantumModulationState) => void;
  onOpenPromoVideo?: () => void;
}

interface PresetOption {
  id: QuantumModulationState['presetId'];
  name: string;
  ketSymbol: string;
  formula: string;
  description: string;
  defaultDepth: number;
  defaultPhase: number;
  defaultFreq: number;
  defaultPairs: number;
  accentColor: string;
}

const QUANTUM_PRESETS: PresetOption[] = [
  {
    id: 'qpu_hyper',
    name: 'Q-PU 9000 Hiper-Dolanıklık',
    ketSymbol: '|Ψ₄₀₉₆⟩',
    formula: '1/√2^n ∑ |q₁q₂...q₄₀₉₆⟩',
    description: '4096-Qubit tam süperpozisyon ve hiper-düşük gecikmeli (1sn) dolanıklık örgüsü',
    defaultDepth: 99.9994,
    defaultPhase: 180,
    defaultFreq: 9.8,
    defaultPairs: 2048,
    accentColor: 'amber',
  },
  {
    id: 'bell_phi',
    name: 'Bell Durumu (Maksimum Çift)',
    ketSymbol: '|Φ⁺⟩',
    formula: '(|00⟩ + |11⟩) / √2',
    description: 'İkili kubit çiftleri arasında simetrik EPR kuantum dolanıklık köprüsü',
    defaultDepth: 96.4,
    defaultPhase: 90,
    defaultFreq: 4.5,
    defaultPairs: 512,
    accentColor: 'cyan',
  },
  {
    id: 'ghz_multi',
    name: 'GHZ Çoklu-Kubit Kilitlenmesi',
    ketSymbol: '|GHZ⟩',
    formula: '(|000...0⟩ + |111...1⟩) / √2',
    description: 'Küresel faz uyumlu çoklu kubit senkronizasyonu ve paralel çıkarım',
    defaultDepth: 98.75,
    defaultPhase: 135,
    defaultFreq: 7.2,
    defaultPairs: 1024,
    accentColor: 'violet',
  },
  {
    id: 'w_topology',
    name: 'W-Durumu Hata Toleransı',
    ketSymbol: '|Wₙ⟩',
    formula: '(|100...0⟩ + |010...0⟩ + ... + |00...1⟩)/√n',
    description: 'Dekohere olmaya karşı korumalı, yüksek kararlılıklı topolojik kubit ağı',
    defaultDepth: 94.8,
    defaultPhase: 240,
    defaultFreq: 5.6,
    defaultPairs: 768,
    accentColor: 'emerald',
  },
];

interface QubitNode {
  id: number;
  label: string;
  x: number;
  y: number;
  ring: 'inner' | 'outer';
}

const QUBIT_NODES: QubitNode[] = [
  { id: 0, label: 'Q₀', x: 150, y: 34, ring: 'outer' },
  { id: 1, label: 'Q₁', x: 242, y: 66, ring: 'outer' },
  { id: 2, label: 'Q₂', x: 266, y: 135, ring: 'outer' },
  { id: 3, label: 'Q₃', x: 215, y: 196, ring: 'outer' },
  { id: 4, label: 'Q₄', x: 85, y: 196, ring: 'outer' },
  { id: 5, label: 'Q₅', x: 34, y: 135, ring: 'outer' },
  { id: 6, label: 'Q₆', x: 58, y: 66, ring: 'outer' },
  { id: 7, label: 'Q₇', x: 150, y: 118, ring: 'inner' },
];

export const QuantumStateModulationPanel: React.FC<QuantumStateModulationPanelProps> = ({
  isDarkMode,
  activeAiLevel,
  isGenerating,
  telemetry,
  onModulationChange,
  onOpenPromoVideo,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] =
    useState<QuantumModulationState['presetId']>('qpu_hyper');
  const [entanglementDepth, setEntanglementDepth] = useState<number>(99.94);
  const [phaseAngleDeg, setPhaseAngleDeg] = useState<number>(180);
  const [pulseFrequencyTHz, setPulseFrequencyTHz] = useState<number>(9.8);
  const [selectedNodeId, setSelectedNodeId] = useState<number>(7);
  const [pulseWaveTick, setPulseWaveTick] = useState<number>(0);
  const [burstActive, setBurstActive] = useState<boolean>(false);

  // Sync baseline with active AI level when user switches processor
  useEffect(() => {
    if (activeAiLevel === 'Q_PU_9000') {
      setSelectedPresetId('qpu_hyper');
      setEntanglementDepth(99.99);
      setPulseFrequencyTHz(11.4);
      setPhaseAngleDeg(180);
    } else if (activeAiLevel === 'A3_QUANTUM') {
      setSelectedPresetId('ghz_multi');
      setEntanglementDepth(98.85);
      setPulseFrequencyTHz(7.8);
      setPhaseAngleDeg(135);
    } else if (activeAiLevel === 'A2+') {
      setSelectedPresetId('ghz_multi');
      setEntanglementDepth(97.2);
      setPulseFrequencyTHz(6.4);
      setPhaseAngleDeg(115);
    } else if (activeAiLevel === 'A2') {
      setSelectedPresetId('bell_phi');
      setEntanglementDepth(95.4);
      setPulseFrequencyTHz(5.2);
      setPhaseAngleDeg(90);
    } else if (activeAiLevel === 'A2-') {
      setSelectedPresetId('w_topology');
      setEntanglementDepth(93.0);
      setPulseFrequencyTHz(4.2);
      setPhaseAngleDeg(75);
    } else if (activeAiLevel === 'A1+') {
      setSelectedPresetId('w_topology');
      setEntanglementDepth(91.2);
      setPulseFrequencyTHz(3.8);
      setPhaseAngleDeg(60);
    } else {
      setSelectedPresetId('w_topology');
      setEntanglementDepth(86.5);
      setPulseFrequencyTHz(2.4);
      setPhaseAngleDeg(45);
    }
  }, [activeAiLevel]);

  // Continuous phase wave animation for live interferometer & entanglement bridges
  useEffect(() => {
    const intervalMs = isGenerating ? 45 : 85;
    const timer = window.setInterval(() => {
      setPulseWaveTick((prev) => (prev + 1) % 360);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const activePreset = useMemo(
    () => QUANTUM_PRESETS.find((p) => p.id === selectedPresetId) || QUANTUM_PRESETS[0],
    [selectedPresetId]
  );

  const isTensorTech =
    activeAiLevel === 'A1' || activeAiLevel === 'A1+' || activeAiLevel === 'A2-';

  // Compute derived quantum metrics based on user modulation
  const derivedMetrics = useMemo(() => {
    const basePairs =
      activeAiLevel === 'Q_PU_9000'
        ? 2048
        : activeAiLevel === 'A3_QUANTUM'
        ? 512
        : activeAiLevel === 'A2+'
        ? 384
        : activeAiLevel === 'A2'
        ? 256
        : activeAiLevel === 'A2-'
        ? 192
        : activeAiLevel === 'A1+'
        ? 128
        : 64;

    const activeQubitPairs = Math.round(basePairs * (entanglementDepth / 100));
    const bellInequalityS = (2.0 + (entanglementDepth / 100) * 0.8284).toFixed(4); // Tsirelson bound 2√2 ≈ 2.8284
    const coherenceTimeUs = Math.round(
      1200 + (entanglementDepth - 50) * 68 + pulseFrequencyTHz * 115
    );
    const vonNeumannEntropy = ((entanglementDepth / 100) * 0.9998).toFixed(4);
    const fidelityPercent = Math.min(
      99.9999,
      entanglementDepth * 0.998 + (isGenerating ? 0.18 : 0.05)
    ).toFixed(3);

    return {
      activeQubitPairs,
      bellInequalityS,
      coherenceTimeUs,
      vonNeumannEntropy,
      fidelityPercent,
    };
  }, [activeAiLevel, entanglementDepth, pulseFrequencyTHz, isGenerating]);

  const handleApplyPreset = (preset: PresetOption) => {
    setSelectedPresetId(preset.id);
    setEntanglementDepth(preset.defaultDepth);
    setPhaseAngleDeg(preset.defaultPhase);
    setPulseFrequencyTHz(preset.defaultFreq);
    triggerQuantumBurst();
    onModulationChange?.({
      presetId: preset.id,
      entanglementDepth: preset.defaultDepth,
      phaseAngleDeg: preset.defaultPhase,
      pulseFrequencyTHz: preset.defaultFreq,
      coherenceStability: Number(derivedMetrics.fidelityPercent),
      activeQubitPairs: preset.defaultPairs,
    });
  };

  const triggerQuantumBurst = () => {
    setBurstActive(true);
    window.setTimeout(() => setBurstActive(false), 900);
  };

  // Generate SVG interference wave path based on phaseAngleDeg, pulseFrequencyTHz, and entanglementDepth
  const wavePathData = useMemo(() => {
    const points: string[] = [];
    const width = 280;
    const centerY = 32;
    const amplitude = 8 + ((entanglementDepth - 50) / 50) * 14 + (burstActive ? 5 : 0);
    const phaseRad = ((phaseAngleDeg + pulseWaveTick * 3) * Math.PI) / 180;
    const freqFactor = pulseFrequencyTHz * 0.045;

    for (let x = 0; x <= width; x += 6) {
      const y =
        centerY +
        Math.sin(x * freqFactor + phaseRad) *
          amplitude *
          Math.cos(x * 0.015 - phaseRad * 0.5);
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [entanglementDepth, phaseAngleDeg, pulseFrequencyTHz, pulseWaveTick, burstActive]);

  const conjugateWavePathData = useMemo(() => {
    const points: string[] = [];
    const width = 280;
    const centerY = 32;
    const amplitude = 8 + ((entanglementDepth - 50) / 50) * 14;
    const phaseRad = ((phaseAngleDeg + 180 - pulseWaveTick * 3) * Math.PI) / 180;
    const freqFactor = pulseFrequencyTHz * 0.045;

    for (let x = 0; x <= width; x += 6) {
      const y =
        centerY +
        Math.sin(x * freqFactor + phaseRad) *
          amplitude *
          Math.cos(x * 0.015 + phaseRad * 0.5);
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [entanglementDepth, phaseAngleDeg, pulseFrequencyTHz, pulseWaveTick]);

  return (
    <div
      className={`mx-4 sm:mx-6 mt-3 rounded-2xl border transition-all duration-300 overflow-hidden ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#0B101D] via-[#0F172A] to-[#131B2E] border-amber-500/30 shadow-lg shadow-amber-500/5'
          : 'bg-gradient-to-br from-amber-50/70 via-white to-cyan-50/50 border-amber-300/80 shadow-sm'
      }`}
    >
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
              isGenerating || burstActive
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 animate-pulse'
                : isDarkMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-amber-100 border-amber-300 text-amber-700'
            }`}
          >
            <Atom size={15} className={isGenerating ? 'animate-spin' : ''} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-display text-xs sm:text-sm font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Q-PU 9000 Kuantum Durum Modülasyonu
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                  isTensorTech
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/35'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                }`}
              >
                {isTensorTech
                  ? `${activeAiLevel} · Tensor Teknolojisi (Ortalama)`
                  : `${activeAiLevel} · QUBİT Teknolojisi (En İyi)`}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activePreset.ketSymbol} · {entanglementDepth.toFixed(2)}% Dolanıklık
              </span>
              {isGenerating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Radio size={10} className="animate-ping" />
                  <span>Canlı Sentez Aktif</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Q-PU 9000 işlemcisinin anlık kuantum dolanıklık örgüsünü, faz açısını (θ) ve THz rezonansını etkileşimli olarak modüle edin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onOpenPromoVideo && (
            <button
              type="button"
              onClick={onOpenPromoVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-display font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 shadow-md shadow-amber-500/20 hover:opacity-95 transition-all cursor-pointer"
              title="Eski Orijinal Tanıtım Videosunu ve Hız Düellosunu İzle (Tüm Kullanıcılara Açık)"
            >
              <Film size={12} />
              <span>Eski Tanıtım Videosunu İzle (Herkese Açık)</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerQuantumBurst}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
              burstActive
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 scale-95'
                : isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-cyan-300 hover:border-cyan-500/50'
                : 'bg-white border-slate-200 text-cyan-700 hover:bg-cyan-50'
            }`}
            title="Kubit Örgüsüne Anlık Kuantum Dolanıklık Darbesi Gönder"
          >
            <Zap size={12} />
            <span className="hidden md:inline">Kuantum Darbe</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders size={12} />
            <span>{isExpanded ? 'Paneli Daralt' : 'Modüle Et'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expandable Interactive Modulation Workspace */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column (5 cols): Interactive Qubit Entanglement Lattice & Wave Interferometer */}
          <div
            className={`lg:col-span-5 rounded-2xl border p-3.5 flex flex-col justify-between ${
              isDarkMode
                ? 'bg-[#070B14]/90 border-slate-800/90'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                <Sparkles size={12} />
                <span>CANLI KUBİT DOLANIKLIK ÖRGÜSÜ (TIKLANABİLİR)</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 tabular-nums">
                Bell S = {derivedMetrics.bellInequalityS}
              </span>
            </div>

            {/* Interactive SVG Entanglement Topology */}
            <div className="relative w-full h-[185px] flex items-center justify-center">
              <svg
                viewBox="0 0 300 225"
                className="w-full h-full max-h-[185px] select-none overflow-visible"
              >
                <defs>
                  <radialGradient id="qpuCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="entangleLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Ambient Quantum Core Halo */}
                <circle
                  cx="150"
                  cy="118"
                  r={65 + (entanglementDepth - 50) * 0.45 + (burstActive ? 12 : 0)}
                  fill="url(#qpuCoreGlow)"
                />

                {/* Outer Coherence Ring */}
                <circle
                  cx="150"
                  cy="118"
                  r="88"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Entanglement Bridges between Qubit Nodes */}
                {QUBIT_NODES.map((nodeA, i) =>
                  QUBIT_NODES.slice(i + 1).map((nodeB) => {
                    const isConnectedToSelected =
                      nodeA.id === selectedNodeId || nodeB.id === selectedNodeId;
                    const opacityBase = ((entanglementDepth - 45) / 55) * 0.75;
                    const strokeOpacity = isConnectedToSelected
                      ? Math.min(1, opacityBase + 0.35)
                      : opacityBase * 0.45;
                    return (
                      <line
                        key={`bridge-${nodeA.id}-${nodeB.id}`}
                        x1={nodeA.x}
                        y1={nodeA.y}
                        x2={nodeB.x}
                        y2={nodeB.y}
                        stroke="url(#entangleLineGrad)"
                        strokeWidth={isConnectedToSelected ? (burstActive ? 2.6 : 1.8) : 0.9}
                        strokeOpacity={strokeOpacity}
                        strokeDasharray={
                          isConnectedToSelected ? undefined : `${4 + (phaseAngleDeg % 5)} 3`
                        }
                      />
                    );
                  })
                )}

                {/* Clickable Qubit Nodes */}
                {QUBIT_NODES.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const isCenter = node.ring === 'inner';
                  const radius = isCenter ? 16 : isSelected ? 13 : 10.5;

                  return (
                    <g
                      key={node.id}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setPhaseAngleDeg((prev) => (prev + 45) % 360);
                        triggerQuantumBurst();
                      }}
                      className="cursor-pointer group"
                    >
                      {(isSelected || isCenter) && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 5}
                          fill="none"
                          stroke={isCenter ? '#f59e0b' : '#22d3ee'}
                          strokeWidth="1.5"
                          strokeOpacity="0.6"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={
                          isCenter
                            ? '#f59e0b'
                            : isSelected
                            ? '#06b6d4'
                            : '#1e293b'
                        }
                        stroke={isCenter ? '#fde68a' : isSelected ? '#cffafe' : '#64748b'}
                        strokeWidth="1.8"
                      />
                      <text
                        x={node.x}
                        y={node.y + 3.5}
                        textAnchor="middle"
                        className={`text-[9px] font-mono font-bold fill-current ${
                          isCenter || isSelected ? 'text-slate-950' : 'text-slate-200'
                        }`}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Real-time Phase Wave Interferometer Strip */}
            <div className="pt-2 border-t border-slate-800/90">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Faz Girişim Dalgası: θ = {phaseAngleDeg}°</span>
                <span className="text-amber-300">{pulseFrequencyTHz.toFixed(1)} THz Rezonans</span>
              </div>
              <svg viewBox="0 0 280 64" className="w-full h-11 overflow-visible">
                <path
                  d={conjugateWavePathData}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                <path
                  d={wavePathData}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Right Column (7 cols): Interactive Sliders, State Presets & Live Entanglement Telemetry */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
            {/* 4 Quantum State Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  1. Kuantum Dolanıklık Durum Ön-Ayarları (Durum Vektörü Seçin)
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  Formül: {activePreset.formula}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUANTUM_PRESETS.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-sm'
                            : 'bg-amber-100/90 border-amber-500 text-slate-900'
                          : isDarkMode
                          ? 'bg-[#0A0F1C] border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {preset.ketSymbol}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <div className="font-display text-[11px] font-semibold line-clamp-1">
                        {preset.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Interactive Modulation Sliders */}
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isDarkMode
                  ? 'bg-[#0A0F1C]/90 border-slate-800/90'
                  : 'bg-slate-50/90 border-slate-200'
              }`}
            >
              {/* Slider 1: Entanglement Depth (%) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">
                    Dolanıklık Derinliği (Kuantum Koherans Yoğunluğu)
                  </span>
                  <span className="font-mono font-bold text-amber-400 tabular-nums">
                    %{entanglementDepth.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={99.99}
                  step={0.05}
                  value={entanglementDepth}
                  onChange={(e) => {
                    const nextVal = parseFloat(e.target.value);
                    setEntanglementDepth(nextVal);
                    onModulationChange?.({
                      presetId: selectedPresetId,
                      entanglementDepth: nextVal,
                      phaseAngleDeg,
                      pulseFrequencyTHz,
                      coherenceStability: Number(derivedMetrics.fidelityPercent),
                      activeQubitPairs: derivedMetrics.activeQubitPairs,
                    });
                  }}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {/* Slider 2 & 3 Side-by-Side: Phase Angle (θ) and Frequency (THz) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Kuantum Faz Açısı (θ)</span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums">
                      {phaseAngleDeg}° ({((phaseAngleDeg / 180) * Math.PI).toFixed(2)} rad)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={phaseAngleDeg}
                    onChange={(e) => setPhaseAngleDeg(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Q-PU Rezonans Frekansı</span>
                    <span className="font-mono font-bold text-violet-400 tabular-nums">
                      {pulseFrequencyTHz.toFixed(1)} THz
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.2}
                    max={12.8}
                    step={0.2}
                    value={pulseFrequencyTHz}
                    onChange={(e) => setPulseFrequencyTHz(parseFloat(e.target.value))}
                    className="w-full accent-violet-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Live Telemetry Readout Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#0A0F1C] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Cpu size={11} className="text-amber-400" />
                  <span>Dolanık Çift</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-amber-400 tabular-nums mt-0.5">
                  {derivedMetrics.activeQubitPairs} Çift ({derivedMetrics.activeQubitPairs * 2} Qubit)
                </div>
              </div>

              <div
                className={`px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#0A0F1C] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Activity size={11} className="text-cyan-400" />
                  <span>Von Neumann S(ρ)</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-cyan-400 tabular-nums mt-0.5">
                  {derivedMetrics.vonNeumannEntropy} Ebit
                </div>
              </div>

              <div
                className={`px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#0A0F1C] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <RefreshCw size={11} className="text-violet-400" />
                  <span>Koherans Süresi</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-violet-400 tabular-nums mt-0.5">
                  {derivedMetrics.coherenceTimeUs} μs
                </div>
              </div>

              <div
                className={`px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#0A0F1C] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>Durum Sadakati</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tabular-nums mt-0.5">
                  %{ telemetry?.coherence || derivedMetrics.fidelityPercent }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
