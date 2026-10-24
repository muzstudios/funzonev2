import React, { useState } from 'react';
import {
  Palette,
  Bell,
  Shield,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Crown,
  Gift,
  Download,
  Trash2,
  LogIn,
  LogOut,
  Check,
  AudioWaveform,
  Play,
  Square,
  Sliders,
  Compass,
  Cpu,
  MessageSquare,
} from 'lucide-react';
import {
  AILevel,
  NotificationPreferences,
  UserProfile,
  VoiceSettings,
} from '../types';
import { ALL_AI_LEVELS, PROCESSOR_THEMES } from './ProcessorThemeSystem';
import { VOICE_PROFILES } from './VoiceChangerModal';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  aiLevel: AILevel;
  onSelectAiLevel: (level: AILevel) => void;
  isProcessorThemeEnabled: boolean;
  onToggleProcessorTheme: () => void;
  showEnergyFlowBar: boolean;
  onToggleEnergyFlowBar: () => void;
  showSmartTopicsBar: boolean;
  onToggleSmartTopicsBar: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (next: VoiceSettings) => void;
  autoSendVoice: boolean;
  onToggleAutoSendVoice: () => void;
  isSpeaking: boolean;
  onTestVoice: (settings?: VoiceSettings) => void;
  onStopVoice: () => void;
  onOpenVoiceStudioModal: () => void;
  notificationPrefs: NotificationPreferences;
  onUpdateNotificationPrefs: (next: NotificationPreferences) => void;
  onTriggerTestNotification: () => void;
  onOpenNotificationLogModal: () => void;
  currentUser: UserProfile | null;
  isA3Unlocked: boolean;
  giftRemaining: number;
  messageCount: number;
  onInstantFounderLogin: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenGiftModal: () => void;
  onExportChatHistory: () => void;
  onClearChatHistory: () => void;
  onOpenStartScreen: () => void;
}

type SettingsTabId = 'appearance' | 'voice' | 'notifications' | 'account';

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  onToggleDarkMode,
  aiLevel,
  onSelectAiLevel,
  isProcessorThemeEnabled,
  onToggleProcessorTheme,
  showEnergyFlowBar,
  onToggleEnergyFlowBar,
  showSmartTopicsBar,
  onToggleSmartTopicsBar,
  voiceSettings,
  onUpdateVoiceSettings,
  autoSendVoice,
  onToggleAutoSendVoice,
  isSpeaking,
  onTestVoice,
  onStopVoice,
  onOpenVoiceStudioModal,
  notificationPrefs,
  onUpdateNotificationPrefs,
  onTriggerTestNotification,
  onOpenNotificationLogModal,
  currentUser,
  isA3Unlocked,
  giftRemaining,
  messageCount,
  onInstantFounderLogin,
  onOpenAuthModal,
  onLogout,
  onOpenGiftModal,
  onExportChatHistory,
  onClearChatHistory,
  onOpenStartScreen,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsTabId>('appearance');
  const activeProcTheme = PROCESSOR_THEMES[aiLevel] || PROCESSOR_THEMES.A3_QUANTUM;
  const levels: AILevel[] = ALL_AI_LEVELS;

  const sections: {
    id: SettingsTabId;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'appearance',
      label: 'Görünüm & İşlemci Teması',
      subtitle: 'Renk paleti, karanlık mod ve arayüz bileşenleri',
      icon: <Palette size={16} />,
    },
    {
      id: 'voice',
      label: 'Ses & Konuşma Stüdyosu',
      subtitle: '6 ses karakteri, frekans kalınlığı ve mikrofon',
      icon: <AudioWaveform size={16} />,
    },
    {
      id: 'notifications',
      label: 'Bildirim & Uyarılar',
      subtitle: 'Sesli uyarılar, hediye kodu ve sistem bildirimleri',
      icon: <Bell size={16} />,
    },
    {
      id: 'account',
      label: 'Hesap, Kurucu & Veri',
      subtitle: 'FE OWNER BATUHAN yetkisi, hediye kodu ve yedekleme',
      icon: <Shield size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header Surface */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${
          isProcessorThemeEnabled
            ? isDarkMode
              ? `${activeProcTheme.darkCardBg} ${activeProcTheme.darkBorder}`
              : `${activeProcTheme.lightCardBg} ${activeProcTheme.lightBorder}`
            : isDarkMode
            ? 'bg-[#0E1422] border-slate-800/80'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Sliders size={13} className={activeProcTheme.accentText} />
              <span>Funzone Kontrol Merkezi</span>
              <span aria-hidden="true">·</span>
              <span>Tercihler & Donanım Özelleştirme</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              Sistem & Deneyim Ayarları
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Seçili işlemci temasını, ses karakterlerini, sohbet arayüzü bileşenlerini ve Kurucu
              erişim yetkilerini tek bir merkezden yönetin.
            </p>
          </div>

          {/* Unboxed Typographic Active Summary */}
          <div
            className={`px-4 py-3 rounded-xl border shrink-0 ${
              isDarkMode ? 'bg-[#090D16] border-slate-800/90' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs text-slate-400">Aktif İşlemci & Tema</div>
            <div className="font-display font-bold text-sm mt-0.5 flex items-center gap-2">
              <span>{activeProcTheme.shortLabel}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className={activeProcTheme.accentText}>{activeProcTheme.themeName}</span>
            </div>
          </div>
        </div>

        {/* Sub-navigation Segmented Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-500/10">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#141D30] border-cyan-500/50 text-white'
                      : 'bg-blue-50/90 border-blue-500/40 text-slate-900'
                    : isDarkMode
                    ? 'bg-[#0A0F1A] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : isDarkMode
                      ? 'bg-slate-800/80 text-slate-400'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {sec.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs truncate">{sec.label}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {sec.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Görünüm & İşlemci Teması */}
      {activeSection === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Processor Theme Palette */}
          <div
            className={`lg:col-span-7 p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Palette size={18} className="text-amber-400" />
                  <span>Dinamik İşlemci Teması Sistemi</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Seçilen yapay zeka seviyesine göre (A1 Safir, A2 Zümrüt, A3 Siyan, Q-PU 9000
                  Kehribar/Altın) uygulama atmosferini otomatik uyarlar.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleProcessorTheme}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isProcessorThemeEnabled
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                {isProcessorThemeEnabled ? 'İşlemci Teması: Açık' : 'İşlemci Teması: Kapalı'}
              </button>
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl) => {
                const theme = PROCESSOR_THEMES[lvl];
                const isSelected = aiLevel === lvl;
                const isQpu = lvl === 'Q_PU_9000';
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectAiLevel(lvl)}
                    className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? `${theme.darkSubtleBg} ${theme.darkBorder}`
                          : `${theme.lightSubtleBg} ${theme.lightBorder}`
                        : isDarkMode
                        ? 'bg-[#0A0F1A] border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex items-center gap-1 shrink-0">
                        {theme.swatchHex.map((hex, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-white/15"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-display font-bold text-sm">
                            {theme.shortLabel}
                          </span>
                          <span className="text-slate-500" aria-hidden="true">·</span>
                          <span className={theme.accentText}>{theme.themeName}</span>
                          <span className="text-slate-500" aria-hidden="true">·</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                              theme.techType === 'QUBIT'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {theme.techQualityLabel} · {theme.writeSeconds}sn
                          </span>
                          {isQpu && (
                            <>
                              <span className="text-slate-500" aria-hidden="true">·</span>
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <Crown size={11} /> Kurucu Özel
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {theme.paletteDescription}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-xs font-semibold">
                      {isSelected ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check size={13} /> Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400">Uygula</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Interface Elegance & Display Toggles */}
          <div
            className={`lg:col-span-5 p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                <span>Arayüz Zarafeti & Görünüm</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sohbet ekranında hangi yardımcı bileşenlerin görüneceğini özelleştirin.
              </p>
            </div>

            <div className="space-y-3">
              {/* Dark / Light Mode */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon size={18} className="text-cyan-400 shrink-0" />
                  ) : (
                    <Sun size={18} className="text-amber-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-display font-semibold text-sm">
                      Ana Görünüm Modu ({isDarkMode ? 'Karanlık Uzay' : 'Aydınlık Kristal'})
                    </div>
                    <div className="text-xs text-slate-400">
                      Göz yormayan kuantum kontrast dengesi
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {isDarkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
                </button>
              </div>

              {/* Quantum Energy Flow Bar Toggle */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap
                    size={18}
                    className={
                      showEnergyFlowBar ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'
                    }
                  />
                  <div>
                    <div className="font-display font-semibold text-sm">
                      Kuantum Enerji Çubuğu (Qubit Bar)
                    </div>
                    <div className="text-xs text-slate-400">
                      Mesajların altında Qubit enerji akışını göster
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleEnergyFlowBar}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    showEnergyFlowBar
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {showEnergyFlowBar ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              {/* Smart Topics Bar Toggle */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare
                    size={18}
                    className={
                      showSmartTopicsBar ? 'text-cyan-400 shrink-0' : 'text-slate-500 shrink-0'
                    }
                  />
                  <div>
                    <div className="font-display font-semibold text-sm">
                      Akıllı Başlıklar Çubuğu
                    </div>
                    <div className="text-xs text-slate-400">
                      Sohbet üstünde bağlama uygun sürükle-bırak konu önerileri
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleSmartTopicsBar}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    showSmartTopicsBar
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {showSmartTopicsBar ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Ses & Konuşma Stüdyosu */}
      {activeSection === 'voice' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <AudioWaveform size={18} className="text-cyan-400" />
                <span>Ses Karakteri & Konuşma Sentezi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Asistan yanıtlarını seslendiren karakteri, ses kalınlığını (pitch) ve konuşma
                hızını ayarlayın.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={onStopVoice}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Square size={13} />
                  <span>Sesi Durdur</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onTestVoice(voiceSettings)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play size={13} />
                  <span>Seçili Sesi Test Et</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenVoiceStudioModal}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                Gelişmiş Ses Stüdyosu
              </button>
            </div>
          </div>

          {/* 6 Voice Character Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VOICE_PROFILES.map((profile) => {
              const isSelected = voiceSettings.profileId === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      profileId: profile.id,
                      pitch: profile.pitch,
                      rate: profile.rate,
                      quantumResonance: profile.quantumResonance,
                    })
                  }
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#142038] border-cyan-400/60 text-white'
                        : 'bg-blue-50 border-blue-500/50 text-slate-900'
                      : isDarkMode
                      ? 'bg-[#0A0F1A] border-slate-800/90 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-display font-bold text-sm">{profile.name}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{profile.badge}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {profile.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-mono tabular-nums text-slate-400">
                    <span>Kalınlık: {profile.pitch.toFixed(2)}x</span>
                    <span aria-hidden="true">·</span>
                    <span>Hız: {profile.rate.toFixed(2)}x</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sliders & Voice Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div
              className={`p-4 rounded-xl border space-y-4 ${
                isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>Ses Tonu / Kalınlık (Pitch)</span>
                  <span className="font-mono tabular-nums text-cyan-400">
                    {voiceSettings.pitch.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.6"
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
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>Konuşma Hızı (Rate)</span>
                  <span className="font-mono tabular-nums text-cyan-400">
                    {voiceSettings.rate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.02"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      profileId: 'custom_studio',
                      rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-xs">
                    Yanıtları Otomatik Seslendir
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Asistan mesajı tamamlandığında sesli okur
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      autoSpeak: !voiceSettings.autoSpeak,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    voiceSettings.autoSpeak
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {voiceSettings.autoSpeak ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-xs">
                    Mikrofon Otomatik Gönderim
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sesli giriş bittiğinde soruyu doğrudan gönderir
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleAutoSendVoice}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    autoSendVoice
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {autoSendVoice ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-xs">
                    Kuantum Rezonans Efekti
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Konuşma başında sibernetik harmonik tını çalar
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      quantumResonance: !voiceSettings.quantumResonance,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    voiceSettings.quantumResonance
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {voiceSettings.quantumResonance ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Bildirim & Uyarı Tercihleri */}
      {activeSection === 'notifications' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Bell size={18} className="text-cyan-400" />
                <span>Bildirim & Sistem Uyarıları</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Hangi etkinliklerde bildirim ve kuantum ses sinyali alacağınızı seçin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTriggerTestNotification}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Test Bildirimi Gönder
              </button>
              <button
                type="button"
                onClick={onOpenNotificationLogModal}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                Bildirim Geçmişini Gör
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'enabled' as const,
                title: 'Tüm Bildirimler Aktif',
                desc: 'Uygulama içi anlık bildirim kartlarını göster',
              },
              {
                key: 'soundEnabled' as const,
                title: 'Kuantum Bildirim Sesleri',
                desc: 'Bildirim geldiğinde zarif akustik sinyal çal',
              },
              {
                key: 'giftCodeEvents' as const,
                title: '10 Kişilik Hediye Kodu Bildirimleri',
                desc: 'QUANTUM-10 aktivasyon ve kota bildirimleri',
              },
              {
                key: 'modelSwitchEvents' as const,
                title: 'İşlemci & Model Geçiş Bildirimleri',
                desc: 'A1, A2, A3 ve Q-PU 9000 geçişlerinde bilgi ver',
              },
              {
                key: 'chatHistoryEvents' as const,
                title: 'Sohbet & Akıllı Başlık Etkinlikleri',
                desc: 'Yedekleme, sıfırlama ve başlık güncellemeleri',
              },
              {
                key: 'securityAndQuotaEvents' as const,
                title: 'Kurucu & Sistem Güvenlik Bildirimleri',
                desc: 'Oturum ve rezerv kuantum çekirdeği durumları',
              },
            ].map((item) => {
              const active = notificationPrefs[item.key];
              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-display font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateNotificationPrefs({
                        ...notificationPrefs,
                        [item.key]: !active,
                      })
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    {active ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Hesap, Kurucu Yetkisi & Veri Yönetimi */}
      {activeSection === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Account & Founder Card */}
          <div
            className={`lg:col-span-6 p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                <span>Hesap & Kurucu Erişimi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Q-PU 9000 Series (4096 Qubit) işlemcisine tam erişim için Kurucu profilini veya
                hesap ayarlarını yönetin.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                currentUser?.role === 'founder'
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : isDarkMode
                  ? 'bg-[#0A0F1A] border-slate-800/90'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-amber-400">
                  {currentUser?.role === 'founder'
                    ? 'Kurucu & Baş Mimar Aktif'
                    : 'Mevcut Oturum'}
                </div>
                <div className="font-display text-base font-bold mt-0.5">
                  {currentUser ? currentUser.name : 'Misafir Oturumu'}
                </div>
                <div className="text-xs text-slate-400">
                  {currentUser
                    ? `${currentUser.title} · ${currentUser.email}`
                    : 'Henüz giriş yapılmadı'}
                </div>
              </div>

              {currentUser?.role !== 'founder' && (
                <button
                  type="button"
                  onClick={onInstantFounderLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-slate-950 font-display font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Crown size={13} />
                  <span>Kurucu Girişi (BATUHAN)</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <LogIn size={14} className="text-cyan-400" />
                <span>Hesap Değiştir</span>
              </button>

              <button
                type="button"
                onClick={onOpenStartScreen}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <Compass size={14} className="text-cyan-400" />
                <span>Başla Yerine Dön</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Çıkış Yap</span>
                </button>
              )}
            </div>
          </div>

          {/* Gift Code & Chat Data Management */}
          <div
            className={`lg:col-span-6 p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-[#0E1422] border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" />
                <span>Hediye Kodu & Veri Yönetimi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                10 kişilik `QUANTUM-10` hediye kodunu yönetin veya sohbet geçmişinizi yedekleyin.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isDarkMode ? 'bg-[#0A0F1A] border-slate-800/90' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="font-display font-bold text-sm flex items-center gap-2">
                  <Gift size={15} className="text-cyan-400" />
                  <span>10 Kişilik Hediye Kodu (QUANTUM-10)</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                  {isA3Unlocked ? 'A3 Quantum & Hediye A2 Aktif' : 'Henüz Kullanılmadı'} · Kalan:{' '}
                  {giftRemaining}/10
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenGiftModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-display font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Kodu Aç
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExportChatHistory}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Download size={14} className="text-emerald-400" />
                <span className="tabular-nums">Sohbet Geçmişini İndir ({messageCount} mesaj)</span>
              </button>

              <button
                type="button"
                onClick={onClearChatHistory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Sohbet Geçmişini Temizle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
