import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  X,
  Gift,
  MessageSquare,
  Cpu,
  ShieldAlert,
  Volume2,
  VolumeX,
  Check,
  Trash2,
  Sparkles,
  CheckCheck,
  Send,
  Globe,
  Clock,
  Sliders,
  History,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  NotificationSeverity,
} from '../types';

// Web Audio API synth sound for Quantum Notification Chime
export function playQuantumNotificationSound(severity: NotificationSeverity = 'info') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (severity === 'warning' || severity === 'critical') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Ignore audio context restriction errors if user hasn't interacted yet
  }
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  preferences: NotificationPreferences;
  onUpdatePreferences: (newPrefs: NotificationPreferences) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onDeleteNotification: (id: string) => void;
  onTriggerTestNotification: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  preferences,
  onUpdatePreferences,
  notifications,
  onMarkAllRead,
  onClearNotifications,
  onDeleteNotification,
  onTriggerTestNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const togglePref = (key: keyof NotificationPreferences) => {
    const nextValue = !preferences[key];
    const updated = { ...preferences, [key]: nextValue };
    onUpdatePreferences(updated);
  };

  const handleToggleBrowserPush = async () => {
    if (!('Notification' in window)) {
      onUpdatePreferences({ ...preferences, browserPushEnabled: false });
      return;
    }
    if (!preferences.browserPushEnabled) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          onUpdatePreferences({ ...preferences, browserPushEnabled: true });
        }
      } catch {
        onUpdatePreferences({ ...preferences, browserPushEnabled: true });
      }
    } else {
      onUpdatePreferences({ ...preferences, browserPushEnabled: false });
    }
  };

  const getCategoryMeta = (cat: NotificationCategory) => {
    switch (cat) {
      case 'gift_code':
        return {
          label: 'Hediye Kodu',
          icon: <Gift size={14} />,
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      case 'chat_history':
        return {
          label: 'Sohbet Geçmişi',
          icon: <MessageSquare size={14} />,
          badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        };
      case 'model_switch':
        return {
          label: 'Kuantum Model',
          icon: <Cpu size={14} />,
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        };
      default:
        return {
          label: 'Sistem & Güvenlik',
          icon: <ShieldAlert size={14} />,
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
    }
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

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className={`relative w-full max-w-2xl rounded-[2rem] shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode ? 'bg-slate-900 border-indigo-500/30 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-6 border-b flex items-center justify-between gap-4 ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              {preferences.enabled ? (
                <BellRing className="text-white w-6 h-6 animate-pulse" />
              ) : (
                <BellOff className="text-white/80 w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Bildirim Ayarları</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    preferences.enabled
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {preferences.enabled ? 'Aktif' : 'Sessizde'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sohbet geçmişi, 10 kişilik hediye kodu kullanımı ve kuantum işlemci olay bildirimlerini yönetin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200'
            }`}
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div
          className={`px-6 pt-3 border-b flex items-center justify-between gap-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders size={14} />
              <span>Kritik Olay & Kanal Ayarları</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History size={14} />
              <span>Bildirim Geçmişi</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-mono">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onTriggerTestNotification}
            className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
          >
            <Send size={12} />
            <span>Test Bildirimi Gönder</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'settings' ? (
            <>
              {/* Master Toggle Card */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  preferences.enabled
                    ? isDarkMode
                      ? 'bg-indigo-950/30 border-indigo-500/40'
                      : 'bg-indigo-50/80 border-indigo-200'
                    : isDarkMode
                    ? 'bg-slate-800/40 border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      preferences.enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/30 text-slate-400'
                    }`}
                  >
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Ana Bildirim Sistemi</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Kritik uygulama olaylarında gerçek zamanlı bildirim ve uyarı pencerelerini göster
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.enabled}
                  onClick={() => togglePref('enabled')}
                  className={`relative w-13 h-7 rounded-full transition-colors p-1 shrink-0 ${
                    preferences.enabled ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      preferences.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Critical Event Triggers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Kritik Olay Tetikleyicileri
                  </h4>
                  <button
                    onClick={() =>
                      onUpdatePreferences({
                        ...preferences,
                        enabled: true,
                        giftCodeEvents: true,
                        chatHistoryEvents: true,
                        modelSwitchEvents: true,
                        securityAndQuotaEvents: true,
                      })
                    }
                    className="text-[11px] font-bold text-indigo-400 hover:underline"
                  >
                    Tümünü Aç
                  </button>
                </div>

                {/* 1. Gift Code Events */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-opacity ${
                    !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                  } ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                      <Gift size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black">Hediye Kodu Kullanımı & Kota Uyarıları</p>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500/20 text-amber-400">
                          Kritik
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        10 kişilik özel <span className="font-mono text-amber-400">QUANTUM-10</span> kodu etkinleştirildiğinde,
                        WİFO A3 QUANTUM + Hediye A2 açıldığında veya hatalı kod denemelerinde anında bildir.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.giftCodeEvents}
                    onClick={() => togglePref('giftCodeEvents')}
                    className={`relative w-12 h-6.5 rounded-full transition-colors p-0.5 shrink-0 ${
                      preferences.giftCodeEvents ? 'bg-amber-500' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        preferences.giftCodeEvents ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Chat History Events */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-opacity ${
                    !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                  } ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black">Sohbet Geçmişi & Kayıt Olayları</p>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-400">
                          Kritik
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Sohbet geçmişi sıfırlandığında/silindiğinde, dışa aktarıldığında (yedeklendiğinde) veya geçmiş
                        verileri güncellendiğinde bildirim gönder.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.chatHistoryEvents}
                    onClick={() => togglePref('chatHistoryEvents')}
                    className={`relative w-12 h-6.5 rounded-full transition-colors p-0.5 shrink-0 ${
                      preferences.chatHistoryEvents ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        preferences.chatHistoryEvents ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Model & Quantum Processor Switch Events */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-opacity ${
                    !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                  } ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 shrink-0 mt-0.5">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black">WİFO Model & Kuantum İşlemci Geçişleri</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        WİFO A1, A1+, Hediye A2 ve WİFO A3 QUANTUM (Q-PU 9000) modelleri arasında geçiş yapıldığında
                        aktif çekirdek bilgisini bildir.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.modelSwitchEvents}
                    onClick={() => togglePref('modelSwitchEvents')}
                    className={`relative w-12 h-6.5 rounded-full transition-colors p-0.5 shrink-0 ${
                      preferences.modelSwitchEvents ? 'bg-purple-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        preferences.modelSwitchEvents ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. System & Security Quota Alerts */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-opacity ${
                    !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                  } ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black">Kuantum Rezerv & Sistem Güvenlik Uyarıları</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        API yoğunluğu sırasında yerel kuantum rezerv motoru devreye girdiğinde veya bağlantı durumu
                        değiştiğinde bilgi ver.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.securityAndQuotaEvents}
                    onClick={() => togglePref('securityAndQuotaEvents')}
                    className={`relative w-12 h-6.5 rounded-full transition-colors p-0.5 shrink-0 ${
                      preferences.securityAndQuotaEvents ? 'bg-emerald-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        preferences.securityAndQuotaEvents ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Delivery Channels (Sound & Browser Push) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Bildirim İletim Kanalları
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sound Channel */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                    } ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                        {preferences.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Sesli Kuantum Uyarısı</p>
                        <p className="text-[10px] text-slate-400">Kritik olaylarda sinyal sesi çal</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.soundEnabled}
                      onClick={() => togglePref('soundEnabled')}
                      className={`relative w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                        preferences.soundEnabled ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          preferences.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Browser Desktop Notification Channel */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      !preferences.enabled ? 'opacity-50 pointer-events-none' : ''
                    } ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
                        <Globe size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Tarayıcı Bildirimleri</p>
                        <p className="text-[10px] text-slate-400">
                          {browserPermission === 'granted'
                            ? 'Masaüstü izni verildi'
                            : browserPermission === 'denied'
                            ? 'Tarayıcı izni engellendi'
                            : 'Masaüstü bildirim izni'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.browserPushEnabled}
                      onClick={handleToggleBrowserPush}
                      className={`relative w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                        preferences.browserPushEnabled ? 'bg-pink-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          preferences.browserPushEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Notification History Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Toplam {notifications.length} kayıtlı olay ({unreadCount} okunmamış)
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                    >
                      <CheckCheck size={13} />
                      <span>Tümünü Okundu İşaretle</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Geçmişi Temizle</span>
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div
                  className={`p-10 rounded-3xl border text-center space-y-2 ${
                    isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Bell className="w-10 h-10 text-slate-500 mx-auto opacity-50" />
                  <p className="text-sm font-bold text-slate-400">Henüz kayıtlı bir bildirim yok</p>
                  <p className="text-xs text-slate-500">
                    Hediye kodu kullanıldığında veya sohbet geçmişi temizlendiğinde bildirimler burada listelenir.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((item) => {
                    const meta = getCategoryMeta(item.category);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                          !item.read
                            ? isDarkMode
                              ? 'bg-indigo-950/25 border-indigo-500/40'
                              : 'bg-indigo-50/60 border-indigo-200'
                            : isDarkMode
                            ? 'bg-slate-800/40 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${meta.badgeClass}`}>
                            {meta.icon}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black">{item.title}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${meta.badgeClass}`}>
                                {meta.label}
                              </span>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" title="Yeni" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-2">
                              <Clock size={10} />
                              <span>
                                {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteNotification(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                          title="Bildirimi Sil"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Tercihleriniz tarayıcınızda otomatik olarak kaydedilir.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-md shadow-indigo-600/20 hover:opacity-95 transition-opacity"
          >
            Tamam
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface NotificationToastContainerProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
  onOpenSettings,
  isDarkMode,
}) => {
  const getSeverityStyles = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'success':
        return {
          border: 'border-emerald-500/40',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          icon: <Check size={16} />,
        };
      case 'warning':
        return {
          border: 'border-amber-500/40',
          iconBg: 'bg-amber-500/20 text-amber-400',
          icon: <AlertTriangle size={16} />,
        };
      case 'critical':
        return {
          border: 'border-rose-500/40',
          iconBg: 'bg-rose-500/20 text-rose-400',
          icon: <ShieldAlert size={16} />,
        };
      default:
        return {
          border: 'border-indigo-500/40',
          iconBg: 'bg-indigo-500/20 text-indigo-400',
          icon: <Info size={16} />,
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = getSeverityStyles(toast.severity);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 ${
                style.border
              } ${
                isDarkMode
                  ? 'bg-slate-900/95 text-slate-100 shadow-black/50'
                  : 'bg-white/95 text-slate-900 shadow-slate-300/60'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${style.iconBg}`}>{style.icon}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black truncate">{toast.title}</p>
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{toast.message}</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500">
                    {new Date(toast.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => {
                      onDismiss(toast.id);
                      onOpenSettings();
                    }}
                    className="font-bold text-indigo-400 hover:underline"
                  >
                    Bildirim Ayarları
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
