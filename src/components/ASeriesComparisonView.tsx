import React from 'react';
import {
  Cpu,
  Gift,
  Crown,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  Eye,
  Zap,
  Layers,
  Gauge,
} from 'lucide-react';
import { AILevel } from '../types';
import { BrandLogo } from './BrandLogo';

interface ASeriesComparisonViewProps {
  isDarkMode: boolean;
  isA3Unlocked: boolean;
  isFounder: boolean;
  onSelectModelAndChat: (level: AILevel) => void;
  onOpenGiftModal: () => void;
  onOpenQpu9000Tab: () => void;
  onOpenFounderLogin: () => void;
}

export const ASeriesComparisonView: React.FC<ASeriesComparisonViewProps> = ({
  isDarkMode,
  isA3Unlocked,
  isFounder,
  onSelectModelAndChat,
  onOpenGiftModal,
  onOpenQpu9000Tab,
  onOpenFounderLogin,
}) => {
  const aSeriesModels = [
    {
      id: 'A1' as AILevel,
      name: 'WİFO A1',
      subtitle: 'Temel Çekirdek · Başlangıç Seviyesi',
      multiplier: '1.0x Baz Güç',
      powerDiff: 'Referans Seviye',
      qubits: '128 Nöral Tensor',
      speed: '24 token/sn',
      reasoningScore: 68,
      codingScore: 64,
      speedScore: 55,
      coherence: '%94.20',
      contextWindow: '32.000 Token',
      accessText: 'Tüm Kullanıcılara Açık',
      unlocked: true,
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
    {
      id: 'A2' as AILevel,
      name: 'WİFO A2 (Hediye)',
      subtitle: 'VIP Yaratıcı & Derin Analiz Çekirdeği',
      multiplier: '4.8x Güç Farkı',
      powerDiff: "A1'e göre +%380 daha güçlü",
      qubits: '512 Hibrit Qubit',
      speed: '38 token/sn',
      reasoningScore: 89,
      codingScore: 87,
      speedScore: 78,
      coherence: '%98.60',
      contextWindow: '128.000 Token',
      accessText: 'A3 Quantum ile Ücretsiz Hediye',
      unlocked: isA3Unlocked,
      accentColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      id: 'A3_QUANTUM' as AILevel,
      name: 'WİFO A3 QUANTUM',
      subtitle: 'A Series Amiral Gemisi Kuantum Çekirdek',
      multiplier: '16.4x Güç Farkı',
      powerDiff: "A1'e göre +%1.540 · A2'ye göre 3.4x güçlü",
      qubits: '1024 Qubit Süperpozisyon',
      speed: '45 token/sn',
      reasoningScore: 99,
      codingScore: 98,
      speedScore: 92,
      coherence: '%99.94',
      contextWindow: '1.000.000 Token',
      accessText: '10 Kişilik QUANTUM-10 Kodu',
      unlocked: isA3Unlocked,
      accentColor: 'bg-cyan-400',
      textColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? 'bg-[#111622] border-slate-800/90 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-500/15">
          <div className="flex items-start sm:items-center gap-3.5">
            <BrandLogo size={36} />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>WİFO A Series Mimarisi</span>
                <span aria-hidden="true">·</span>
                <span>A1, A2 ve A3 Quantum Güç & Performans Analizi</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                A Series (A1 · A2 · A3 Quantum) Güç Farklılığı Matrisi
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isA3Unlocked && (
              <button
                type="button"
                onClick={onOpenGiftModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs transition-colors whitespace-nowrap"
              >
                <Gift size={14} />
                <span>10 Kişilik Hediye Kodu ile A3 & A2'yi Aç</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQpu9000Tab}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-display font-bold text-xs hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <Eye size={14} />
              <span>Yeni İşlemciyi İncele: Q-PU 9000 Series</span>
            </button>
          </div>
        </div>

        {/* 3-Column A1 vs A2 vs A3 Power Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-6">
          {aSeriesModels.map((model, index) => (
            <div
              key={model.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                model.id === 'A3_QUANTUM'
                  ? isDarkMode
                    ? 'bg-[#151F32] border-cyan-500/50'
                    : 'bg-blue-50/50 border-blue-400'
                  : isDarkMode
                  ? 'bg-[#0C111C] border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-mono tabular-nums">0{index + 1}. A SERIES</span>
                  <span className={`font-mono font-bold tabular-nums ${model.textColor}`}>
                    {model.multiplier}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight">{model.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{model.subtitle}</p>
                  <p className={`text-xs font-semibold mt-1.5 ${model.textColor}`}>{model.powerDiff}</p>
                </div>

                {/* Key Tabular Specs */}
                <div className="space-y-2 pt-2 border-t border-slate-500/15 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Çekirdek Gücü</span>
                    <span className="font-mono tabular-nums font-semibold">{model.qubits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Yazış Hızı</span>
                    <span className="font-mono tabular-nums font-semibold">{model.speed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kuantum Tutarlılık</span>
                    <span className="font-mono tabular-nums font-semibold">{model.coherence}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bağlam Kapasitesi</span>
                    <span className="font-mono tabular-nums font-semibold">{model.contextWindow}</span>
                  </div>
                </div>

                {/* Comparative Progress Bars */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Derin Mantık & Analiz Gücü</span>
                      <span className="font-mono tabular-nums font-bold">%{model.reasoningScore}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${model.accentColor}`}
                        style={{ width: `${model.reasoningScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">İleri Yazılım & Kodlama</span>
                      <span className="font-mono tabular-nums font-bold">%{model.codingScore}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${model.accentColor}`}
                        style={{ width: `${model.codingScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Yanıt & Çıkarım Çevikliği</span>
                      <span className="font-mono tabular-nums font-bold">%{model.speedScore}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${model.accentColor}`}
                        style={{ width: `${model.speedScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-500/15 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  {model.unlocked ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Lock size={13} className="text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{model.accessText}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (!model.unlocked) {
                      onOpenGiftModal();
                    } else {
                      onSelectModelAndChat(model.id);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                    model.unlocked
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  <span>{model.unlocked ? 'Bu Modelle Konuş' : 'Kilidi Aç'}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder-Exclusive Q-PU 9000 Series Inspection Callout Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#111622] via-[#191528] to-[#111622] border-amber-500/40 text-slate-100'
            : 'bg-amber-50/70 border-amber-300 text-slate-900'
        }`}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold">
            <Crown size={15} />
            <span>SADECE KURUCU (FE OWNER BATUHAN) ÖZEL ERİŞİMİ</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">4096 QUBIT · 1.480 TOKEN/SN</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
            Yeni İşlemci: Q-PU 9000 Series İnceleme Deneyimi
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            A Series (A1, A2, A3) modelleri arasındaki güç farkının ötesine geçen, yalnızca Kurucu yetkisiyle
            girilebilen <strong>Q-PU 9000 Series</strong> işlemcisinin canlı yazış hızı düellosunu ve sinematik
            tanıtımını inceleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isFounder && (
            <button
              type="button"
              onClick={onOpenFounderLogin}
              className="px-4 py-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-display font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Crown size={15} />
              <span>Kurucu Girişi Yap</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQpu9000Tab}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-amber-500/20"
          >
            <Eye size={15} />
            <span>İnceleme Seçeneği: Q-PU 9000 Series'e Geç</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
