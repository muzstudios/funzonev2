import React, { useEffect, useState } from 'react';
import { Zap, Activity, Cpu, EyeOff, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Message } from '../types';

interface QuantumEnergyFlowBarProps {
  message?: Message;
  isDarkMode: boolean;
  isGenerating?: boolean;
  activeAiLevel?: string;
  onToggleGlobalVisibility?: () => void;
}

export const QuantumEnergyFlowBar: React.FC<QuantumEnergyFlowBarProps> = ({
  message,
  isDarkMode,
  isGenerating = false,
  activeAiLevel = 'A3_QUANTUM',
  onToggleGlobalVisibility,
}) => {
  const [fillPercent, setFillPercent] = useState<number>(isGenerating ? 8 : 0);
  const [displayedQubits, setDisplayedQubits] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [replayKey, setReplayKey] = useState<number>(0);

  // Determine model tier & target Tensor/QUBİT metrics
  const botLabel = message?.botName || activeAiLevel;
  const isQpu9000 =
    botLabel.includes('Q-PU 9000') ||
    botLabel.includes('Q_PU_9000') ||
    (message?.quantumTelemetry?.qubitsActive ?? 0) >= 2048;
  const isA3 =
    !isQpu9000 &&
    (botLabel.includes('A3') || (message?.quantumTelemetry?.qubitsActive ?? 0) >= 1024);
  const isA2Plus = !isQpu9000 && !isA3 && botLabel.includes('A2+');
  const isA2Minus = !isQpu9000 && !isA3 && !isA2Plus && botLabel.includes('A2-');
  const isA2 = !isQpu9000 && !isA3 && !isA2Plus && !isA2Minus && botLabel.includes('A2');
  const isA1Plus = !isQpu9000 && !isA3 && !isA2Plus && !isA2Minus && !isA2 && botLabel.includes('A1+');

  // Tensor Teknolojisi (Ortalama): A1, A1+, A2- | QUBİT Teknolojisi (En İyi): A2, A2+, A3, Q-PU 9000
  const isTensorTech =
    message?.quantumTelemetry?.techType === 'TENSOR' ||
    (!isQpu9000 && !isA3 && !isA2Plus && !isA2);
  const unitName = isTensorTech ? 'Tensor (Ortalama)' : 'QUBİT (En İyi)';

  const maxQubits =
    message?.quantumTelemetry?.qubitsActive ||
    (isQpu9000
      ? 4096
      : isA3
      ? 1024
      : isA2Plus
      ? 768
      : isA2
      ? 512
      : isA2Minus
      ? 384
      : isA1Plus
      ? 256
      : 128);

  const coherence =
    message?.quantumTelemetry?.coherenceRatio ||
    (isQpu9000
      ? '99.999%'
      : isA3
      ? '99.94%'
      : isA2Plus
      ? '99.25%'
      : isA2
      ? '98.60%'
      : isA2Minus
      ? '97.50%'
      : isA1Plus
      ? '96.40%'
      : '94.20%');

  const clockFlux =
    message?.quantumTelemetry?.quantumFlux ||
    (isQpu9000
      ? '12.8 THz · 1sn QUBİT'
      : isA3
      ? '5.2 THz · 5sn QUBİT'
      : isA2Plus
      ? '3.6 THz · 8sn QUBİT'
      : isA2
      ? '2.4 THz · 10sn QUBİT'
      : isA2Minus
      ? '1.9 THz · 15sn Tensor'
      : isA1Plus
      ? '1.5 THz · 16sn Tensor'
      : '1.1 THz · 20sn Tensor');

  // Compute deterministic energy value based on content length and Qubits
  const charCount = message?.content?.length || 180;
  const energyJoules = ((charCount * maxQubits) / 12500).toFixed(2);

  // Progressive fill animation as message completes or while generating
  useEffect(() => {
    if (isGenerating) {
      setFillPercent(12);
      const interval = window.setInterval(() => {
        setFillPercent((prev) => {
          if (prev >= 92) return 92;
          const step = Math.max(2, Math.floor((95 - prev) * 0.18));
          return Math.min(92, prev + step);
        });
      }, 140);
      return () => clearInterval(interval);
    }

    // Message completed: smoothly fill from 0% to 100%
    setFillPercent(0);
    setDisplayedQubits(0);

    let current = 0;
    const stepTime = 18;
    const timer = window.setInterval(() => {
      current += 4;
      if (current >= 100) {
        setFillPercent(100);
        setDisplayedQubits(maxQubits);
        clearInterval(timer);
      } else {
        setFillPercent(current);
        setDisplayedQubits(Math.round((current / 100) * maxQubits));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isGenerating, message?.id, message?.timestamp, maxQubits, replayKey]);

  // Keep displayedQubits synced during live generation
  useEffect(() => {
    if (isGenerating) {
      setDisplayedQubits(Math.round((fillPercent / 100) * maxQubits));
    }
  }, [fillPercent, isGenerating, maxQubits]);

  const gradientClass = isQpu9000
    ? 'from-amber-400 via-orange-500 to-rose-500'
    : isA3
    ? 'from-cyan-400 via-blue-500 to-violet-500'
    : isA2
    ? 'from-emerald-400 via-teal-500 to-cyan-500'
    : 'from-blue-400 via-indigo-500 to-slate-500';

  const glowColorClass = isQpu9000
    ? 'shadow-[0_0_14px_rgba(251,191,36,0.45)]'
    : isA3
    ? 'shadow-[0_0_14px_rgba(34,211,238,0.4)]'
    : isA2
    ? 'shadow-[0_0_12px_rgba(52,211,153,0.35)]'
    : 'shadow-[0_0_10px_rgba(96,165,250,0.3)]';

  const accentTextClass = isQpu9000
    ? 'text-amber-400'
    : isA3
    ? 'text-cyan-400'
    : isA2
    ? 'text-emerald-400'
    : 'text-blue-400';

  const segmentCount = 16;

  return (
    <div
      className={`mt-3 rounded-2xl border px-3.5 py-2.5 transition-all ${
        isDarkMode
          ? 'bg-[#0D1320]/90 border-slate-800/90 hover:border-slate-700/90'
          : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Top Row: Label, Qubit Counter, Percentage & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-lg ${
              isQpu9000
                ? 'bg-amber-500/15 text-amber-400'
                : isA3
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            <Zap size={12} className={isGenerating || fillPercent < 100 ? 'animate-pulse' : ''} />
          </span>

          <span className={`font-display font-bold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {isTensorTech ? 'Tensor Enerji Çubuğu' : 'QUBİT Enerji Çubuğu'}
          </span>

          <span className="text-slate-500" aria-hidden="true">·</span>

          <span className={`font-mono font-semibold tabular-nums ${accentTextClass}`}>
            {displayedQubits} / {maxQubits} {unitName}
          </span>

          <span className="hidden sm:inline text-slate-500" aria-hidden="true">·</span>

          <span className="hidden sm:inline font-mono tabular-nums text-slate-400">
            {energyJoules} qJ
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status / Completion Percentage */}
          <span
            className={`px-2 py-0.5 rounded-md font-mono font-bold tabular-nums text-[10px] ${
              fillPercent >= 100
                ? isQpu9000
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {isGenerating
              ? `Sentezleniyor %${fillPercent}`
              : fillPercent < 100
              ? `Akış %${fillPercent}`
              : `%100 Tamamlandı`}
          </span>

          {/* Replay Energy Fill Button */}
          {!isGenerating && (
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-200/70'
              }`}
              title="Kuantum Enerji Akışını Yeniden Oynat"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Expand / Collapse Telemetry Details */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title={isExpanded ? 'Detayları Gizle' : 'Qubit Telemetri Detaylarını Göster'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Quick Hide / Turn Off Energy Bar Button */}
          {onToggleGlobalVisibility && (
            <button
              type="button"
              onClick={onToggleGlobalVisibility}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200/70'
              }`}
              title="Kuantum Enerji Çubuğunu Kapat (Üst araç çubuğundan istediğiniz zaman tekrar açabilirsiniz)"
            >
              <EyeOff size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Progressive Quantum Energy Bar */}
      <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-slate-800/80 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} ${glowColorClass} transition-all duration-75 ease-out relative`}
          style={{ width: `${fillPercent}%` }}
        >
          {/* Shimmering Quantum Wave Pulse */}
          <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Segmented Qubit Harmonic Cells */}
      <div className="grid grid-cols-16 gap-1 mt-1.5">
        {Array.from({ length: segmentCount }).map((_, idx) => {
          const threshold = ((idx + 1) / segmentCount) * 100;
          const isLit = fillPercent >= threshold;
          return (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-150 ${
                isLit
                  ? `bg-gradient-to-r ${gradientClass} opacity-90`
                  : isDarkMode
                  ? 'bg-slate-800/70'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>

      {/* Expandable Quantum Energy Telemetry Drawer */}
      {isExpanded && (
        <div
          className={`mt-2.5 pt-2.5 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] ${
            isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}
        >
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Cpu size={10} />
              <span>Aktif Çekirdek</span>
            </div>
            <div className={`font-mono font-semibold mt-0.5 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {message?.modelTag || (isQpu9000 ? 'Q-PU 9000 HYPER' : 'Q-PU 9000')}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Activity size={10} />
              <span>Kuantum Koherans</span>
            </div>
            <div className={`font-mono font-semibold tabular-nums mt-0.5 ${accentTextClass}`}>
              {coherence}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">Frekans Akışı</div>
            <div className={`font-mono font-semibold mt-0.5 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {clockFlux}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">Qubit Enerji Yoğunluğu</div>
            <div className="font-mono font-semibold tabular-nums mt-0.5 text-emerald-400">
              {energyJoules} qJ ({charCount} krk)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
