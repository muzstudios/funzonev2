import React from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  X,
  Sliders,
  Play,
  Square,
  Check,
  Radio,
  Mic2,
  AudioWaveform,
  RotateCcw,
} from 'lucide-react';
import { VoiceProfileId, VoiceSettings } from '../types';
import { BrandLogo } from './BrandLogo';

export interface VoiceProfilePreset {
  id: VoiceProfileId;
  name: string;
  subtitle: string;
  description: string;
  pitch: number;
  rate: number;
  quantumResonance: boolean;
  preferFemale?: boolean;
  preferMale?: boolean;
}

export const VOICE_PROFILES: VoiceProfilePreset[] = [
  {
    id: 'natural_assistant',
    name: 'Elif · Doğal Asistan',
    subtitle: 'Berrak & Dengeli Ton',
    description: 'Günlük sohbetler ve uzun açıklamalar için doğal, akıcı ve sıcak ses tonu.',
    pitch: 1.06,
    rate: 1.04,
    quantumResonance: false,
    preferFemale: true,
  },
  {
    id: 'deep_commander',
    name: 'Barbaros · Derin & Karizmatik',
    subtitle: 'Kalın Bas Frekans',
    description: 'Düşük perde (0.72x Pitch) ile güçlendirilmiş ağırbaşlı, otoriter ve tok ses.',
    pitch: 0.72,
    rate: 0.94,
    quantumResonance: false,
    preferMale: true,
  },
  {
    id: 'quantum_cyborg',
    name: 'Q-PU 9000 · Kuantum Sibernetik',
    subtitle: 'Harmonik Rezonans & Hızlı',
    description: 'Kuantum harmonik sinyal efektiyle birleştirilmiş fütüristik çekirdek sesi.',
    pitch: 0.84,
    rate: 1.18,
    quantumResonance: true,
  },
  {
    id: 'energetic_nova',
    name: 'Nova · Enerjik & Parlak',
    subtitle: 'Yüksek Perde & Dinamik',
    description: 'Canlı, hızlı tempolu ve neşeli ses karakteri (1.26x Pitch · 1.22x Hız).',
    pitch: 1.26,
    rate: 1.22,
    quantumResonance: false,
    preferFemale: true,
  },
  {
    id: 'calm_sage',
    name: 'Bilge · Sakin & Derin Düşünür',
    subtitle: 'Dingin & Tane Tane',
    description: 'Şiir, felsefe ve detaylı bilimsel anlatımlar için dingin ve yavaşlatılmış ton.',
    pitch: 0.86,
    rate: 0.86,
    quantumResonance: false,
    preferMale: true,
  },
  {
    id: 'custom_studio',
    name: 'Özel Stüdyo Modu',
    subtitle: 'Tam Manuel Frekans',
    description: 'Perde (kalınlık/incelik), hız ve sistem sesini tamamen kendi zevkinize göre ayarlayın.',
    pitch: 1.0,
    rate: 1.05,
    quantumResonance: false,
  },
];

// Plays a subtle futuristic harmonic vocoder/resonance chord when Quantum Resonance is enabled
export function playQuantumVoiceResonance() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const freqs = [220, 329.63, 440, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.12, now + 0.22);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  } catch {
    // Ignore audio context restriction errors
  }
}

interface VoiceChangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (next: VoiceSettings) => void;
  availableVoices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  onTestVoice: (settingsToTest?: VoiceSettings) => void;
  onStopVoice: () => void;
}

export const VoiceChangerModal: React.FC<VoiceChangerModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  voiceSettings,
  onUpdateVoiceSettings,
  availableVoices,
  isSpeaking,
  onTestVoice,
  onStopVoice,
}) => {
  if (!isOpen) return null;

  const turkishVoices = availableVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('tr') ||
      v.name.toLowerCase().includes('turkish') ||
      v.name.toLowerCase().includes('türkçe')
  );
  const voiceList = turkishVoices.length > 0 ? turkishVoices : availableVoices.slice(0, 12);

  const handleSelectPreset = (preset: VoiceProfilePreset) => {
    const nextSettings: VoiceSettings = {
      ...voiceSettings,
      profileId: preset.id,
      pitch: preset.pitch,
      rate: preset.rate,
      quantumResonance: preset.quantumResonance,
    };
    onUpdateVoiceSettings(nextSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode
            ? 'bg-[#111622] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b flex items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                isDarkMode ? 'bg-[#161F30] border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <AudioWaveform className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>WİFO Akustik Sentez Motoru</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {voiceSettings.pitch.toFixed(2)}x Perde / {voiceSettings.rate.toFixed(2)}x Hız
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
                Ses Değiştirme & Karakter Stüdyosu
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-200/70 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Top Bar: Auto-Speak Master & Test Button */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#161F30]/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">Gelen Yanıtları Otomatik Seslendir</p>
                <p className="text-[11px] text-slate-400">
                  Seçtiğiniz ses karakteri ile her yeni WİFO yanıtını otomatik olarak sesli okur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={onStopVoice}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Square size={13} />
                  <span>Sesi Durdur</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onTestVoice(voiceSettings)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <Play size={13} />
                  <span>Seçili Sesi Test Et</span>
                </button>
              )}

              <button
                type="button"
                role="switch"
                aria-checked={voiceSettings.autoSpeak}
                onClick={() =>
                  onUpdateVoiceSettings({ ...voiceSettings, autoSpeak: !voiceSettings.autoSpeak })
                }
                className={`relative w-12 h-6.5 rounded-full transition-colors p-0.5 shrink-0 ${
                  voiceSettings.autoSpeak ? 'bg-blue-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    voiceSettings.autoSpeak ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 6 Voice Character Profiles Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400">
                Hazır Ses Karakterleri (Ses Değiştirici Profilleri)
              </h3>
              <span className="text-[11px] text-slate-500">Bir karaktere tıklayarak anında geçiş yapın</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VOICE_PROFILES.map((preset) => {
                const isSelected = voiceSettings.profileId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-[#182338] border-cyan-400/70 text-white'
                          : 'bg-blue-50/80 border-blue-600 text-slate-900'
                        : isDarkMode
                        ? 'bg-[#0E131F] border-slate-800 hover:border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1">
                        <span>{preset.subtitle}</span>
                        {isSelected && <Check size={14} className="text-cyan-400 shrink-0" />}
                      </div>
                      <h4 className="font-display font-bold text-sm">{preset.name}</h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-500/10 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                      <span>Perde: {preset.pitch.toFixed(2)}x</span>
                      <span>Hız: {preset.rate.toFixed(2)}x</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Studio Sliders (Pitch, Speed, Volume, Resonance, System Voice) */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-[#0E131F] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={15} className="text-cyan-400" />
                <h4 className="font-display text-xs font-bold">
                  Frekans, Ses Kalınlığı (Pitch) ve Hız Ayarları
                </h4>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(VOICE_PROFILES[0])
                }
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Varsayılana Sıfırla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pitch (Ses Kalınlığı / İnceliği) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ses Tonu / Kalınlık (Pitch)</span>
                  <span className="font-mono tabular-nums font-bold text-cyan-400">
                    {voiceSettings.pitch.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.7"
                  step="0.02"
                  value={voiceSettings.pitch}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      profileId: 'custom_studio',
                      pitch: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.50x (Kalın/Bas)</span>
                  <span>1.00x</span>
                  <span>1.70x (İnce)</span>
                </div>
              </div>

              {/* Rate (Konuşma Hızı) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Konuşma Hızı (Speed)</span>
                  <span className="font-mono tabular-nums font-bold text-blue-400">
                    {voiceSettings.rate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.65"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      profileId: 'custom_studio',
                      rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-blue-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.65x (Yavaş)</span>
                  <span>1.05x</span>
                  <span>1.65x (Hızlı)</span>
                </div>
              </div>

              {/* Volume (Ses Yüksekliği) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ses Yüksekliği</span>
                  <span className="font-mono tabular-nums font-bold text-violet-400">
                    %{Math.round(voiceSettings.volume * 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={voiceSettings.volume}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      volume: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-violet-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>%20</span>
                  <span>%60</span>
                  <span>%100</span>
                </div>
              </div>
            </div>

            {/* System Voice Engine & Quantum Resonance Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Tarayıcı Ses Motoru Seçimi ({voiceList.length} ses bulundu)
                </label>
                <select
                  value={voiceSettings.selectedVoiceURI}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      selectedVoiceURI: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDarkMode
                      ? 'bg-[#161F30] border-slate-700 text-slate-200'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Otomatik En İyi Türkçe Ses (Önerilen)</option>
                  {voiceList.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      quantumResonance: !voiceSettings.quantumResonance,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    voiceSettings.quantumResonance
                      ? isDarkMode
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                      : isDarkMode
                      ? 'bg-[#161F30] border-slate-700 text-slate-400'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Radio size={14} />
                    <span>Kuantum Sibernetik Rezonans Efekti</span>
                  </span>
                  <span className="font-mono">{voiceSettings.quantumResonance ? 'AÇIK' : 'KAPALI'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDarkMode ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BrandLogo size={16} />
            <span>Seçtiğiniz ses karakteri tüm sohbet yanıtlarında kullanılır.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
