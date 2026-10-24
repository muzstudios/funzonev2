import React from 'react';
import {
  Cpu,
  Gift,
  Crown,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  Eye,
  Atom,
} from 'lucide-react';
import { AILevel, ProcessorTechType } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThreeProcessorVisualizer } from './ThreeProcessorVisualizer';

interface ASeriesComparisonViewProps {
  isDarkMode: boolean;
  isA3Unlocked: boolean;
  isFounder: boolean;
  activeLevel?: AILevel;
  onSelectModelAndChat: (level: AILevel) => void;
  onOpenGiftModal: () => void;
  onOpenQpu9000Tab: () => void;
  onOpenFounderLogin: () => void;
}

export const ASeriesComparisonView: React.FC<ASeriesComparisonViewProps> = ({
  isDarkMode,
  isA3Unlocked,
  isFounder,
  activeLevel = 'A3_QUANTUM',
  onSelectModelAndChat,
  onOpenGiftModal,
  onOpenQpu9000Tab,
  onOpenFounderLogin,
}) => {
  const aSeriesModels: {
    id: AILevel;
    name: string;
    subtitle: string;
    techType: ProcessorTechType;
    techLabel: string;
    multiplier: string;
    powerDiff: string;
    qubits: string;
    speed: string;
    reasoningScore: number;
    codingScore: number;
    speedScore: number;
    coherence: string;
    contextWindow: string;
    accessText: string;
    unlocked: boolean;
    accentColor: string;
    textColor: string;
    isNew?: boolean;
  }[] = [
    {
      id: 'A1',
      name: 'WİFO A1',
      subtitle: 'Temel Tensor Çekirdeği · Başlangıç Seviyesi',
      techType: 'TENSOR',
      techLabel: 'Tensor Teknolojisi · Ortalama',
      multiplier: '1.0x Baz Güç',
      powerDiff: 'Yanıtları Tam 20 Saniyede Yazar (Tensor · Ortalama)',
      qubits: '128 Nöral Tensor',
      speed: '20 Saniyede Yazım (180 tok/sn)',
      reasoningScore: 68,
      codingScore: 64,
      speedScore: 48,
      coherence: '%94.20',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: 'Tüm Kullanıcılara Açık',
      unlocked: true,
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
    {
      id: 'A1+',
      name: 'WİFO A1+',
      subtitle: 'Geliştirilmiş Tensor Üretkenlik Çekirdeği',
      techType: 'TENSOR',
      techLabel: 'Tensor Teknolojisi · Ortalama',
      multiplier: '2.0x Güç Farkı',
      powerDiff: "Yanıtları Tam 16 Saniyede Yazar (A1'den 4sn Hızlı)",
      qubits: '256 Nöral Tensor',
      speed: '16 Saniyede Yazım (240 tok/sn)',
      reasoningScore: 76,
      codingScore: 74,
      speedScore: 62,
      coherence: '%96.40',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: 'Tüm Kullanıcılara Açık',
      unlocked: true,
      accentColor: 'bg-indigo-500',
      textColor: 'text-indigo-400',
    },
    {
      id: 'A2-',
      name: 'WİFO A2- (Yeni)',
      subtitle: 'Üst Düzey Tensor Matrisi · 15 Saniye Akış',
      techType: 'TENSOR',
      techLabel: 'Tensor Teknolojisi · Ortalama',
      multiplier: '2.8x Güç Farkı',
      powerDiff: 'Yanıtları Tam 15 Saniyede Yazar (En Hızlı Tensor)',
      qubits: '384 Nöral Tensor',
      speed: '15 Saniyede Yazım (280 tok/sn)',
      reasoningScore: 82,
      codingScore: 80,
      speedScore: 70,
      coherence: '%97.50',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: 'Tüm Kullanıcılara Açık',
      unlocked: true,
      accentColor: 'bg-sky-500',
      textColor: 'text-sky-400',
      isNew: true,
    },
    {
      id: 'A2',
      name: 'WİFO A2 (Hediye)',
      subtitle: 'VIP QUBİT Yaratıcı & Derin Analiz Çekirdeği',
      techType: 'QUBIT',
      techLabel: 'QUBİT Teknolojisi · En İyi',
      multiplier: '4.8x Güç Farkı',
      powerDiff: 'Yanıtları Tam 10 Saniyede Yazar (QUBİT · En İyi)',
      qubits: '512 QUBİT Süperpozisyon',
      speed: '10 Saniyede Yazım (380 tok/sn)',
      reasoningScore: 89,
      codingScore: 88,
      speedScore: 82,
      coherence: '%98.60',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: 'A3 Quantum ile Ücretsiz Hediye',
      unlocked: isA3Unlocked,
      accentColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      id: 'A2+',
      name: 'WİFO A2+ (Yeni)',
      subtitle: 'Yüksek Hızlı QUBİT Süperpozisyon Çekirdeği',
      techType: 'QUBIT',
      techLabel: 'QUBİT Teknolojisi · En İyi',
      multiplier: '7.6x Güç Farkı',
      powerDiff: 'Yanıtları Tam 8 Saniyede Yazar (QUBİT · En İyi)',
      qubits: '768 QUBİT Süperpozisyon',
      speed: '8 Saniyede Yazım (520 tok/sn)',
      reasoningScore: 94,
      codingScore: 93,
      speedScore: 89,
      coherence: '%99.25',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: 'Tüm Kullanıcılara Açık',
      unlocked: true,
      accentColor: 'bg-purple-500',
      textColor: 'text-purple-400',
      isNew: true,
    },
    {
      id: 'A3_QUANTUM',
      name: 'WİFO A3 QUANTUM',
      subtitle: 'A Series Amiral Gemisi QUBİT Çekirdeği',
      techType: 'QUBIT',
      techLabel: 'QUBİT Teknolojisi · En İyi',
      multiplier: '16.4x Güç Farkı',
      powerDiff: 'Yanıtları Tam 5 Saniyede Yazar (QUBİT · En İyi)',
      qubits: '1024 QUBİT Süperpozisyon',
      speed: '5 Saniyede Yazım (760 tok/sn)',
      reasoningScore: 99,
      codingScore: 98,
      speedScore: 96,
      coherence: '%99.94',
      contextWindow: '∞ Sonsuz Kelime (Sınırsız)',
      accessText: '10 Kişilik QUANTUM-10 Kodu',
      unlocked: isA3Unlocked,
      accentColor: 'bg-cyan-400',
      textColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive 3D Three.js Processor Visualizer */}
      <ThreeProcessorVisualizer
        activeLevel={activeLevel}
        onSelectLevel={(lvl) => onSelectModelAndChat(lvl)}
        isDarkMode={isDarkMode}
      />

      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode
            ? 'bg-[#111622] border-slate-800/90 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-500/15">
          <div className="flex items-start sm:items-center gap-3.5">
            <BrandLogo size={36} />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>WİFO İşlemci Mimarisi</span>
                <span aria-hidden="true">·</span>
                <span>
                  Tensor Teknolojisi (Ortalama: A1 20sn, A1+ 16sn, A2- 15sn) vs QUBİT Teknolojisi (En İyi: A2 10sn, A2+ 8sn, A3 5sn, Q-PU 9000 1sn)
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                Tensor (Ortalama) & QUBİT (En İyi) İşlemci Hiyerarşisi
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isA3Unlocked && (
              <button
                type="button"
                onClick={onOpenGiftModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <Gift size={14} />
                <span>10 Kişilik Hediye Kodu ile A3 & A2'yi Aç</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQpu9000Tab}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-display font-bold text-xs hover:opacity-95 transition-opacity whitespace-nowrap cursor-pointer"
            >
              <Eye size={14} />
              <span>Eski Videoyu İzle & Q-PU 9000 (1sn)</span>
            </button>
          </div>
        </div>

        {/* Tensor vs QUBİT Architecture Comparison Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isDarkMode
                ? 'bg-blue-950/20 border-blue-500/30 text-slate-100'
                : 'bg-blue-50/70 border-blue-200 text-slate-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-sm text-blue-400">
                  TENSOR TEKNOLOJİSİ (ORTALAMA SEVİYE)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">
                  A1 · A1+ · A2-
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Klasik çok boyutlu matris çarpımı ile çalışan <strong>Ortalama</strong> seviye işlemcilerdir:
                <strong> WİFO A1 (20sn)</strong>, <strong>WİFO A1+ (16sn)</strong> ve yeni <strong>WİFO A2- (15sn)</strong>.
              </p>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isDarkMode
                ? 'bg-emerald-950/20 border-emerald-500/35 text-slate-100'
                : 'bg-emerald-50/70 border-emerald-300 text-slate-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Atom size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-sm text-emerald-400">
                  QUBİT TEKNOLOJİSİ (EN İYİ SEVİYE)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  A2 · A2+ · A3 QUANTUM · Q-PU 9000
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Kuantum süperpozisyon ve dolanıklık ile çalışan <strong>En İyi</strong> seviye işlemcilerdir:
                <strong> WİFO A2 (10sn)</strong>, yeni <strong>WİFO A2+ (8sn)</strong>, <strong>WİFO A3 Quantum (5sn)</strong> ve <strong>Q-PU 9000 Series (1sn)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 6-Card A-Series Grid (A1, A1+, A2-, A2, A2+, A3 Quantum) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-6">
          {aSeriesModels.map((model, index) => (
            <div
              key={model.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                model.id === 'A3_QUANTUM'
                  ? isDarkMode
                    ? 'bg-[#151F32] border-cyan-500/50'
                    : 'bg-blue-50/50 border-blue-400'
                  : model.isNew
                  ? isDarkMode
                    ? 'bg-[#131829] border-purple-500/40'
                    : 'bg-purple-50/30 border-purple-300'
                  : isDarkMode
                  ? 'bg-[#0C111C] border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                      model.techType === 'QUBIT'
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                        : 'bg-blue-500/15 border-blue-500/35 text-blue-300'
                    }`}
                  >
                    {model.techType === 'QUBIT' ? <Atom size={11} /> : <Cpu size={11} />}
                    <span>{model.techLabel}</span>
                  </span>

                  <span className={`font-mono font-bold tabular-nums ${model.textColor}`}>
                    0{index + 1} · {model.multiplier}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-extrabold tracking-tight">
                      {model.name}
                    </h2>
                    {model.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        YENİ İŞLEMCİ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{model.subtitle}</p>
                  <p className={`text-xs font-semibold mt-1.5 ${model.textColor}`}>
                    {model.powerDiff}
                  </p>
                </div>

                {/* Key Tabular Specs */}
                <div className="space-y-2 pt-2 border-t border-slate-500/15 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mimari & Seviye</span>
                    <span
                      className={`font-mono font-bold ${
                        model.techType === 'QUBIT' ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    >
                      {model.techType === 'QUBIT' ? 'QUBİT (En İyi)' : 'Tensor (Ortalama)'}
                    </span>
                  </div>
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
                </div>

                {/* Comparative Progress Bars */}
                <div className="space-y-2.5 pt-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Derin Mantık & Analiz Gücü</span>
                      <span className="font-mono tabular-nums font-bold">
                        %{model.reasoningScore}
                      </span>
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            <span>QUBİT TEKNOLOJİSİ ZİRVESİ (EN İYİ) · FE OWNER BATUHAN</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">4096 QUBİT · 1 SANİYE YAZIM</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
            Q-PU 9000 Series (1sn) & Eski Orijinal Tanıtım Videosu (Herkese Açık)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Tensor (A1 20sn, A1+ 16sn, A2- 15sn) ve QUBİT (A2 10sn, A2+ 8sn, A3 Quantum 5sn, Q-PU
            9000 1sn) modellerinin canlı yazış hızı düellosunu ve orijinal sinematik tanıtımını
            izleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isFounder && (
            <button
              type="button"
              onClick={onOpenFounderLogin}
              className="px-4 py-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-display font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Crown size={15} />
              <span>Kurucu Girişi Yap</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQpu9000Tab}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Eye size={15} />
            <span>Eski Videoyu & Q-PU 9000'i Aç</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
