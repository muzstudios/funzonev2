import React from 'react';
import { Lock, Check, Gift, Crown, Eye, Cpu, Atom } from 'lucide-react';
import { AILevel, ProcessorTechType } from '../types';
import { BrandLogo } from './BrandLogo';
import { PROCESSOR_THEMES } from './ProcessorThemeSystem';

interface ModelSelectorProps {
  currentLevel: AILevel;
  onSelect: (level: AILevel) => void;
  isDarkMode: boolean;
  isA3Unlocked: boolean;
  isFounder: boolean;
  onOpenGiftModal: () => void;
  onOpenFounderLogin: () => void;
  onOpenQpuShowcase: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentLevel,
  onSelect,
  isDarkMode,
  isA3Unlocked,
  isFounder,
  onOpenGiftModal,
  onOpenFounderLogin,
  onOpenQpuShowcase,
}) => {
  const models: {
    id: AILevel;
    name: string;
    tier: string;
    techType: ProcessorTechType;
    techBadge: string;
    specs: string;
    desc: string;
    isLocked: boolean;
    founderOnly?: boolean;
    isNew?: boolean;
  }[] = [
    {
      id: 'A1',
      name: 'WİFO A1',
      tier: 'Tensor · Safir Tema',
      techType: 'TENSOR',
      techBadge: 'TENSOR · ORTALAMA',
      specs: '128 Tensor · 20 Saniye Yazım',
      desc: 'Tensor Teknolojisi (Ortalama Seviye) ile çalışan ve yanıtları tam 20 saniyede tamamlayan temel A Series modeli.',
      isLocked: false,
    },
    {
      id: 'A1+',
      name: 'WİFO A1+',
      tier: 'Tensor · İndigo Tema',
      techType: 'TENSOR',
      techBadge: 'TENSOR · ORTALAMA',
      specs: '256 Tensor · 16 Saniye Yazım',
      desc: 'Tensor Teknolojisi (Ortalama Seviye) ile çalışan ve yanıtları tam 16 saniyede tamamlayan geliştirilmiş A Series modeli.',
      isLocked: false,
    },
    {
      id: 'A2-',
      name: 'WİFO A2-',
      tier: 'Tensor · Buzul Tema',
      techType: 'TENSOR',
      techBadge: 'TENSOR · ORTALAMA',
      specs: '384 Tensor · 15 Saniye Yazım',
      desc: 'Yeni nesil Tensor Teknolojisi (Ortalama Seviye) ile çalışan ve yanıtları tam 15 saniyede tamamlayan en hızlı Tensor işlemcisi.',
      isLocked: false,
      isNew: true,
    },
    {
      id: 'A2',
      name: 'WİFO A2',
      tier: isA3Unlocked ? 'QUBİT · Zümrüt Tema' : 'QUBİT · A3 Hediyesi',
      techType: 'QUBIT',
      techBadge: 'QUBİT · EN İYİ',
      specs: '512 QUBİT · 10 Saniye Yazım',
      desc: 'QUBİT Teknolojisi (En İyi Seviye) ile çalışan, yanıtları tam 10 saniyede tamamlayan ve A3 Quantum ile hediye edilen VIP model.',
      isLocked: !isA3Unlocked,
    },
    {
      id: 'A2+',
      name: 'WİFO A2+',
      tier: 'QUBİT · Ametist Tema',
      techType: 'QUBIT',
      techBadge: 'QUBİT · EN İYİ',
      specs: '768 QUBİT · 8 Saniye Yazım',
      desc: 'QUBİT Teknolojisi (En İyi Seviye) ile çalışan ve yanıtları tam 8 saniyede tamamlayan yeni nesil yüksek hızlı QUBİT işlemcisi.',
      isLocked: false,
      isNew: true,
    },
    {
      id: 'A3_QUANTUM',
      name: 'WİFO A3 Quantum',
      tier: 'QUBİT · Siyan/Viyole',
      techType: 'QUBIT',
      techBadge: 'QUBİT · EN İYİ',
      specs: '1024 QUBİT · 5 Saniye Yazım',
      desc: 'QUBİT Teknolojisi (En İyi Seviye) ile çalışan ve yanıtları tam 5 saniyede tamamlayan süperpozisyon amiral gemisi.',
      isLocked: !isA3Unlocked,
    },
    {
      id: 'Q_PU_9000',
      name: 'Q-PU 9000 Series',
      tier: 'QUBİT · Kehribar/Altın',
      techType: 'QUBIT',
      techBadge: 'QUBİT · EN İYİ ZİRVE',
      specs: '4096 QUBİT · 1 Saniye Yazım',
      desc: 'QUBİT Teknolojisi (En İyi Seviye) zirvesi; yanıtları tam 1 saniyede tamamlayan Kurucu (BATUHAN) özel hiper işlemcisi.',
      isLocked: !isFounder,
      founderOnly: true,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Architecture Tier Legend Banner: Tensor (Ortalama) vs QUBİT (En İyi) */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDarkMode
            ? 'bg-[#0C1220] border-slate-800/90 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/35 text-blue-300 font-semibold">
            <Cpu size={13} />
            <span>TENSOR TEKNOLOJİSİ (ORTALAMA):</span>
            <span className="font-mono text-[11px] text-blue-200">
              A1 (20sn) · A1+ (16sn) · A2- (15sn)
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-semibold">
            <Atom size={13} />
            <span>QUBİT TEKNOLOJİSİ (EN İYİ):</span>
            <span className="font-mono text-[11px] text-emerald-200">
              A2 (10sn) · A2+ (8sn) · A3 Quantum (5sn) · Q-PU 9000 (1sn)
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 font-semibold">
            <span className="font-mono text-xs">∞</span>
            <span>KELİME SINIRI YOK (SONSUZ YANIT)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isA3Unlocked && (
            <button
              type="button"
              onClick={onOpenGiftModal}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Gift size={13} />
              <span>10 Kişilik Hediye Kodu (A3 & A2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQpuShowcase}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye size={13} />
            <span>Eski Videoyu İzle (Tüm Kullanıcılara Açık)</span>
          </button>
        </div>
      </div>

      {/* 7-Model Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {models.map((model) => {
          const isSelected = currentLevel === model.id;
          const themeCfg = PROCESSOR_THEMES[model.id];

          const selectedClasses =
            model.id === 'Q_PU_9000'
              ? isDarkMode
                ? 'bg-[#21170A] border-amber-400/80 text-amber-50 shadow-[0_0_25px_rgba(251,191,36,0.14)]'
                : 'bg-amber-50/90 border-amber-500 text-slate-900 shadow-xs'
              : model.id === 'A2+'
              ? isDarkMode
                ? 'bg-[#1D1130] border-purple-400/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                : 'bg-purple-50/90 border-purple-600 text-slate-900 shadow-xs'
              : model.id === 'A2'
              ? isDarkMode
                ? 'bg-[#0D2320] border-emerald-400/80 text-white shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                : 'bg-emerald-50/90 border-emerald-600 text-slate-900 shadow-xs'
              : model.id === 'A2-'
              ? isDarkMode
                ? 'bg-[#0E2034] border-sky-400/80 text-white shadow-[0_0_20px_rgba(14,165,233,0.14)]'
                : 'bg-sky-50/90 border-sky-600 text-slate-900 shadow-xs'
              : model.id === 'A1'
              ? isDarkMode
                ? 'bg-[#121D33] border-blue-400/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                : 'bg-blue-50/90 border-blue-600 text-slate-900 shadow-xs'
              : model.id === 'A1+'
              ? isDarkMode
                ? 'bg-[#161B36] border-indigo-400/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.12)]'
                : 'bg-indigo-50/90 border-indigo-600 text-slate-900 shadow-xs'
              : isDarkMode
              ? 'bg-[#121D31] border-cyan-400/80 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]'
              : 'bg-cyan-50/80 border-cyan-600 text-slate-900 shadow-xs';

          return (
            <div
              key={model.id}
              onClick={() => {
                if (model.founderOnly && model.isLocked) {
                  onOpenFounderLogin();
                } else if (model.isLocked) {
                  onOpenGiftModal();
                } else {
                  onSelect(model.id);
                }
              }}
              className={`cursor-pointer text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? selectedClasses
                  : isDarkMode
                  ? 'bg-[#111622]/90 border-slate-800/80 hover:border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-bold ${
                      model.techType === 'QUBIT'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {model.techType === 'QUBIT' ? <Atom size={10} /> : <Cpu size={10} />}
                    <span>{model.techBadge}</span>
                  </span>

                  {model.isNew ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px]">
                      YENİ
                    </span>
                  ) : model.founderOnly ? (
                    <Crown size={13} className="text-amber-400 shrink-0" />
                  ) : model.id === 'A3_QUANTUM' ? (
                    <BrandLogo size={13} />
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: themeCfg.swatchHex[0] }}
                  />
                  <h4 className="font-display text-sm font-bold tracking-tight truncate">
                    {model.name}
                  </h4>
                </div>

                <p className={`font-mono tabular-nums text-[10px] font-semibold mt-0.5 ${themeCfg.accentText}`}>
                  ⚡ {model.specs}
                </p>

                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {model.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-500/10 flex items-center justify-between gap-1 text-[10px]">
                {model.isLocked ? (
                  model.founderOnly ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium whitespace-nowrap">
                      <Lock size={10} />
                      <span>Kurucu</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-medium whitespace-nowrap">
                      <Lock size={10} />
                      <span>Hediye Kodu</span>
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium whitespace-nowrap">
                    <Check size={10} />
                    <span>{model.founderOnly ? 'Kurucu' : 'Açık'}</span>
                  </span>
                )}

                {model.founderOnly ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQpuShowcase();
                    }}
                    className="font-semibold text-[10px] text-amber-400 hover:underline whitespace-nowrap cursor-pointer"
                  >
                    İncele →
                  </button>
                ) : isSelected ? (
                  <span className={`font-mono text-[10px] font-semibold whitespace-nowrap ${themeCfg.accentText}`}>
                    Aktif
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
