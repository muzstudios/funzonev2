import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { QuantumTelemetry } from '../types';
import { BrandLogo } from './BrandLogo';

interface QuantumProcessorHUDProps {
  isDarkMode: boolean;
  isUnlocked: boolean;
  onOpenGiftModal: () => void;
  onSelectA3Quantum: () => void;
  telemetry?: QuantumTelemetry | null;
}

export const QuantumProcessorHUD: React.FC<QuantumProcessorHUDProps> = ({
  isDarkMode,
  isUnlocked,
  onOpenGiftModal,
  onSelectA3Quantum,
  telemetry,
}) => {
  const [coherence, setCoherence] = useState(99.94);
  const [flux, setFlux] = useState(5.24);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoherence(99.88 + Math.random() * 0.09);
      setFlux(5.21 + Math.random() * 0.08);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={`w-full rounded-2xl p-5 sm:p-6 border transition-colors ${
        isDarkMode
          ? 'bg-[#111622] border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-500/15">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
              isDarkMode ? 'bg-[#161F30] border-slate-700/70' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <BrandLogo size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>WİFO Kuantum Mimarisi</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Q-PU 9000 Tensor Core</span>
              <span aria-hidden="true">·</span>
              <span>Kurucu: FE OWNER BATUHAN</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              WİFO A3 Quantum & Hediye WİFO A2 İşlemci Durumu
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-3 py-2">
              <CheckCircle2 size={15} />
              <span>A3 Quantum & Hediye A2 Aktif</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenGiftModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Gift size={14} />
              <span>10 Kişilik Hediye Kodunu Kullan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSelectA3Quantum}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white'
            }`}
          >
            <span>A3 Quantum Seç</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Clean Tabular Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        <div>
          <p className="text-xs text-slate-400">Kuantum Kapasitesi</p>
          <p className="font-display text-xl font-bold font-mono tabular-nums mt-1">
            {telemetry?.qubitsActive ?? 1024} <span className="text-xs font-normal text-slate-400">Qubit</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Süperpozisyon Paralel Çıkarım</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Tutarlılık Oranı</p>
          <p className="font-display text-xl font-bold font-mono tabular-nums mt-1">
            {telemetry?.coherenceRatio ?? `${coherence.toFixed(2)}%`}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Düşük Gürültü Toleransı</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">İşlemci Frekansı</p>
          <p className="font-display text-xl font-bold font-mono tabular-nums mt-1">
            {flux.toFixed(2)} <span className="text-xs font-normal text-slate-400">THz</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Yanıt Gecikmesi: <span className="font-mono tabular-nums">{telemetry?.latencyMs ?? 48} ms</span>
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Hediye Paket Durumu</p>
          <p className={`font-display text-base font-bold mt-1 ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isUnlocked ? 'WİFO A2 Ücretsiz Açık' : 'QUANTUM-10 Bekleniyor'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            10 kullanıcıya özel A3 + A2 paketi
          </p>
        </div>
      </div>
    </section>
  );
};
