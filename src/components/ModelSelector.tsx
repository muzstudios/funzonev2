import React from 'react';
import { Lock, Check, Gift, Crown, Eye } from 'lucide-react';
import { AILevel } from '../types';
import { BrandLogo } from './BrandLogo';

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
    specs: string;
    desc: string;
    isLocked: boolean;
    founderOnly?: boolean;
  }[] = [
    {
      id: 'A1',
      name: 'WİFO A1',
      tier: 'A Series · Temel',
      specs: '128 Tensor · 24 tok/sn',
      desc: 'Günlük sorular ve pratik diyaloglar için hafif A Series modeli.',
      isLocked: false,
    },
    {
      id: 'A1+',
      name: 'WİFO A1+',
      tier: 'A Series · Gelişmiş',
      specs: '256 Tensor · 32 tok/sn',
      desc: 'Üretkenlik, metin yazarlığı ve hızlı problem çözme motoru.',
      isLocked: false,
    },
    {
      id: 'A2',
      name: 'WİFO A2',
      tier: isA3Unlocked ? 'A Series · Hediye Aktif' : 'A Series · A3 Hediyesi',
      specs: '512 Qubit · 38 tok/sn',
      desc: 'WİFO A3 Quantum aktivasyonu ile ücretsiz hediye edilen VIP model.',
      isLocked: !isA3Unlocked,
    },
    {
      id: 'A3_QUANTUM',
      name: 'WİFO A3 Quantum',
      tier: 'A Series · Amiral Gemisi',
      specs: '1024 Qubit · 45 tok/sn',
      desc: '10 kişilik hediye koduyla açılan ileri düzey kodlama ve muhakeme zekası.',
      isLocked: !isA3Unlocked,
    },
    {
      id: 'Q_PU_9000',
      name: 'Q-PU 9000 Series',
      tier: 'Sadece Kurucu (Batuhan)',
      specs: '4096 Qubit · 1480 tok/sn',
      desc: 'Yalnızca Kurucu (FE OWNER BATUHAN) yetkisiyle açılan yeni nesil ultra hızlı işlemci.',
      isLocked: !isFounder,
      founderOnly: true,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            İşlemci & Zeka Seçimi
          </span>
          <span aria-hidden="true">·</span>
          <span>A Series ve Kurucu Özel Q-PU 9000 Series</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isA3Unlocked && (
            <button
              type="button"
              onClick={onOpenGiftModal}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Gift size={13} />
              <span>10 Kişilik Hediye Kodu (A3 & A2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQpuShowcase}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Eye size={13} />
            <span>Q-PU 9000 Series İncele</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {models.map((model) => {
          const isSelected = currentLevel === model.id;

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
              className={`cursor-pointer text-left p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? model.founderOnly
                    ? isDarkMode
                      ? 'bg-amber-950/35 border-amber-400/80 text-white'
                      : 'bg-amber-50 border-amber-500 text-slate-900'
                    : isDarkMode
                    ? 'bg-[#161F30] border-cyan-400/70 text-white'
                    : 'bg-blue-50/70 border-blue-600 text-slate-900'
                  : isDarkMode
                  ? 'bg-[#111622] border-slate-800/80 hover:border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-400 mb-1.5">
                  <span className={`truncate ${model.founderOnly ? 'text-amber-400 font-semibold' : ''}`}>
                    {model.tier}
                  </span>
                  {model.founderOnly ? (
                    <Crown size={14} className="text-amber-400 shrink-0" />
                  ) : model.id === 'A3_QUANTUM' ? (
                    <BrandLogo size={14} />
                  ) : null}
                </div>

                <h4 className="font-display text-sm font-bold tracking-tight">{model.name}</h4>
                <p className="font-mono tabular-nums text-[10px] text-cyan-400/90 mt-0.5">{model.specs}</p>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{model.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-500/10 flex items-center justify-between gap-2 text-[11px]">
                {model.isLocked ? (
                  model.founderOnly ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium whitespace-nowrap">
                      <Lock size={11} />
                      <span>Sadece Kurucu</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-medium whitespace-nowrap">
                      <Lock size={11} />
                      <span>Hediye Kodu</span>
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium whitespace-nowrap">
                    <Check size={11} />
                    <span>{model.founderOnly ? 'Kurucu Yetkisi' : 'Açık'}</span>
                  </span>
                )}

                {model.founderOnly ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQpuShowcase();
                    }}
                    className="font-semibold text-[11px] text-amber-400 hover:underline whitespace-nowrap"
                  >
                    İncele →
                  </button>
                ) : isSelected ? (
                  <span className="font-mono text-[10px] font-semibold text-cyan-400 whitespace-nowrap">
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
