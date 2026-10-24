import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  User,
  Trash2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Gift,
  Moon,
  Sun,
  RefreshCw,
  Bell,
  Download,
  Square,
  Sliders,
  AudioWaveform,
  LogIn,
  Crown,
  Compass,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Dna,
  BarChart3,
  Settings,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  Cpu,
  Atom,
  Film,
  Upload,
  Globe,
  MousePointerClick,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  AILevel,
  AppMode,
  AppNotification,
  DroppedFilePayload,
  DroppedItemKind,
  Message,
  NotificationCategory,
  NotificationPreferences,
  NotificationSeverity,
  PhysicalActionStep,
  UserProfile,
  VoiceSettings,
} from './types';
import { BrandLogo } from './components/BrandLogo';
import { QuantumProcessorHUD } from './components/QuantumProcessorHUD';
import { GiftCodeModal } from './components/GiftCodeModal';
import { ModelSelector } from './components/ModelSelector';
import { QuantumImageStudio } from './components/QuantumImageStudio';
import {
  NotificationSettingsModal,
  NotificationToastContainer,
  playQuantumNotificationSound,
} from './components/NotificationSettingsModal';
import {
  VoiceChangerModal,
  VOICE_PROFILES,
  playQuantumVoiceResonance,
} from './components/VoiceChangerModal';
import { AuthWelcomeScreen } from './components/AuthWelcomeScreen';
import { SmartTopicsBar, SmartTopicItem } from './components/SmartTopicsBar';
import { ASeriesComparisonView } from './components/ASeriesComparisonView';
import { QPU9000Showcase } from './components/QPU9000Showcase';
import { QuantumEnergyFlowBar } from './components/QuantumEnergyFlowBar';
import { QuantumAnalyticsPanel } from './components/QuantumAnalyticsPanel';
import { BioscienceWorkbench } from './components/BioscienceWorkbench';
import { PROCESSOR_THEMES, ProcessorThemeStrip } from './components/ProcessorThemeSystem';
import { SettingsView } from './components/SettingsView';
import {
  QuantumStateModulationPanel,
  QuantumModulationState,
} from './components/QuantumStateModulationPanel';
import { ThreeProcessorVisualizer } from './components/ThreeProcessorVisualizer';
import { AIPhysicalWorkspace } from './components/AIPhysicalWorkspace';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  browserPushEnabled: false,
  giftCodeEvents: true,
  chatHistoryEvents: true,
  modelSwitchEvents: true,
  securityAndQuotaEvents: true,
};

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  profileId: 'natural_assistant',
  pitch: 1.06,
  rate: 1.04,
  volume: 1.0,
  selectedVoiceURI: '',
  quantumResonance: false,
  autoSpeak: true,
};

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [subIndex: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function formatTextForSpeech(markdownText: string): string {
  return markdownText
    .replace(/```[\s\S]*?```/g, ' Kod bloğu eklendi. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*#_~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('funzone_theme') !== 'light';
  });

  // User Authentication & "Başla Yeri" Onboarding state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('funzone_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Whether the user is viewing the full-screen "Başla Yeri" welcome/login hub
  const [showStartScreen, setShowStartScreen] = useState<boolean>(() => {
    return !localStorage.getItem('funzone_has_started');
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App navigation mode
  const [mode, setMode] = useState<AppMode>('chat');

  // Gift & Unlock states
  const [isA3Unlocked, setIsA3Unlocked] = useState<boolean>(() => {
    return localStorage.getItem('funzone_a3_quantum_unlocked') === 'true';
  });
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftRemaining, setGiftRemaining] = useState<number>(10);

  // Notification Settings & Log states
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('funzone_notification_prefs');
    if (saved) {
      try {
        return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_NOTIFICATION_PREFS;
      }
    }
    return DEFAULT_NOTIFICATION_PREFS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('funzone_notification_log');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'init-notif',
        title: 'Kuantum Bildirim & Ses Değiştirici Hazır',
        message: '6 farklı ses karakteri, Sesli Giriş, Giriş Sistemi ve 10 kişilik hediye kodu aktif.',
        category: 'system',
        severity: 'info',
        timestamp: Date.now(),
        read: false,
      },
    ];
  });

  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // AI Level state
  const [aiLevel, setAiLevel] = useState<AILevel>(() => {
    return localStorage.getItem('funzone_a3_quantum_unlocked') === 'true' ? 'A3_QUANTUM' : 'A1+';
  });

  // Voice Changer & SpeechSynthesis states
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('funzone_voice_settings');
    if (saved) {
      try {
        return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_VOICE_SETTINGS;
      }
    }
    return DEFAULT_VOICE_SETTINGS;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Voice Input (Microphone SpeechRecognition) states
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoSendVoice, setAutoSendVoice] = useState<boolean>(() => {
    return localStorage.getItem('funzone_auto_send_voice') !== 'false';
  });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestVoiceTextRef = useRef<string>('');

  // Chat states
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('funzone_chat_history');
    if (saved) {
      try {
        const parsed: Message[] = JSON.parse(saved);
        // Filter out any old robotic template responses so the conversation stays natural
        const cleaned = parsed.filter(
          (m) =>
            !m.content.includes('Sorunuz analiz edildi:') &&
            !m.content.includes('Aktif Çekirdek:') &&
            !m.content.includes('Mimari Özet:')
        );
        if (cleaned.length > 0) {
          return cleaned;
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `Merhaba! Seninle sohbet etmek, fikir alışverişinde bulunmak ve merak ettiğin her konuda birlikte düşünmek için buradayım. Bugün neler konuşalım?`,
        timestamp: Date.now(),
        botName: 'WİFO A3 QUANTUM',
        modelTag: 'Q-PU 9000',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [typingStream, setTypingStream] = useState<{
    messageId: string;
    fullText: string;
    targetSeconds: number;
    elapsedSeconds: number;
  } | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const [showProcessorPanel, setShowProcessorPanel] = useState(false);
  const [showModulationPanel, setShowModulationPanel] = useState<boolean>(true);
  const [isPromoVideoModalOpen, setIsPromoVideoModalOpen] = useState<boolean>(false);
  const [quantumModulation, setQuantumModulation] = useState<QuantumModulationState | null>(null);
  const [showEnergyFlowBar, setShowEnergyFlowBar] = useState<boolean>(() => {
    return localStorage.getItem('funzone_energy_bar_enabled') !== 'false';
  });
  const [showSmartTopicsBar, setShowSmartTopicsBar] = useState<boolean>(() => {
    return localStorage.getItem('funzone_smart_topics_enabled') !== 'false';
  });
  const [isProcessorThemeEnabled, setIsProcessorThemeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('funzone_processor_theme_enabled') !== 'false';
  });
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>(() => {
    return localStorage.getItem('funzone_session_title') || 'Kuantum Genel Oturumu';
  });
  const [draggedTopic, setDraggedTopic] = useState<SmartTopicItem | null>(null);
  const [isDragOverChat, setIsDragOverChat] = useState(false);
  const [isDragOverInput, setIsDragOverInput] = useState(false);
  const [activeDroppedFile, setActiveDroppedFile] = useState<DroppedFilePayload | null>(null);
  const [isInspectingFile, setIsInspectingFile] = useState<boolean>(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeVoicePreset =
    VOICE_PROFILES.find((p) => p.id === voiceSettings.profileId) || VOICE_PROFILES[0];
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const activeProcTheme = PROCESSOR_THEMES[aiLevel] || PROCESSOR_THEMES.A3_QUANTUM;

  // Sync theme
  useEffect(() => {
    localStorage.setItem('funzone_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('funzone_notification_prefs', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  useEffect(() => {
    localStorage.setItem('funzone_notification_log', JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('funzone_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('funzone_session_title', activeSessionTitle);
  }, [activeSessionTitle]);

  useEffect(() => {
    localStorage.setItem('funzone_auto_send_voice', String(autoSendVoice));
  }, [autoSendVoice]);

  useEffect(() => {
    localStorage.setItem('funzone_energy_bar_enabled', String(showEnergyFlowBar));
  }, [showEnergyFlowBar]);

  useEffect(() => {
    localStorage.setItem('funzone_smart_topics_enabled', String(showSmartTopicsBar));
  }, [showSmartTopicsBar]);

  useEffect(() => {
    localStorage.setItem('funzone_processor_theme_enabled', String(isProcessorThemeEnabled));
  }, [isProcessorThemeEnabled]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('funzone_user_profile', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('funzone_user_profile');
    }
  }, [currentUser]);

  // Load SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Central Notification Dispatcher
  const triggerNotification = useCallback(
    (
      title: string,
      message: string,
      category: NotificationCategory,
      severity: NotificationSeverity = 'info',
      forceDeliver = false
    ) => {
      const newItem: AppNotification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title,
        message,
        category,
        severity,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newItem, ...prev.slice(0, 49)]);

      if (!forceDeliver) {
        if (!notificationPrefs.enabled) return;
        if (category === 'gift_code' && !notificationPrefs.giftCodeEvents) return;
        if (category === 'chat_history' && !notificationPrefs.chatHistoryEvents) return;
        if (category === 'model_switch' && !notificationPrefs.modelSwitchEvents) return;
        if (category === 'system' && !notificationPrefs.securityAndQuotaEvents) return;
      }

      setToasts((prev) => [newItem, ...prev.slice(0, 3)]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newItem.id));
      }, 5000);

      if (notificationPrefs.soundEnabled) {
        playQuantumNotificationSound(severity);
      }

      if (
        notificationPrefs.browserPushEnabled &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(title, { body: message });
        } catch {
          // Ignore restricted context errors
        }
      }
    },
    [notificationPrefs]
  );

  // Enhanced SpeechSynthesis Reader with Voice Changer support
  const speakText = useCallback(
    (id: string, rawText: string, forceSpeak = false, customVoiceOverride?: VoiceSettings) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      const activeSettings = customVoiceOverride || voiceSettings;

      if (!forceSpeak && speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleaned = formatTextForSpeech(rawText);
      if (!cleaned) return;

      // Play subtle harmonic vocoder effect if Quantum Resonance is enabled
      if (activeSettings.quantumResonance) {
        playQuantumVoiceResonance();
      }

      // Select appropriate voice
      const turkishVoices = availableVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('tr') ||
          v.name.toLowerCase().includes('turkish') ||
          v.name.toLowerCase().includes('türkçe')
      );

      let chosenVoice: SpeechSynthesisVoice | null = null;
      if (activeSettings.selectedVoiceURI) {
        chosenVoice =
          availableVoices.find((v) => v.voiceURI === activeSettings.selectedVoiceURI) || null;
      }

      if (!chosenVoice && turkishVoices.length > 0) {
        chosenVoice =
          turkishVoices.find(
            (v) => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google')
          ) || turkishVoices[0];
      }

      const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
      setSpeakingId(id);

      sentences.forEach((sentence, idx) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = 'tr-TR';
        utterance.pitch = activeSettings.pitch;
        utterance.rate = activeSettings.rate;
        utterance.volume = activeSettings.volume;
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
        if (idx === sentences.length - 1) {
          utterance.onend = () => setSpeakingId(null);
          utterance.onerror = () => setSpeakingId(null);
        }
        window.speechSynthesis.speak(utterance);
      });
    },
    [availableVoices, speakingId, voiceSettings]
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  };

  // Save chat history
  useEffect(() => {
    localStorage.setItem('funzone_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch gift code status
  useEffect(() => {
    fetch('/api/gift-code/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.remainingUses !== undefined) {
          setGiftRemaining(data.remainingUses);
        }
      })
      .catch((err) => console.log('Gift code status check:', err));
  }, []);

  const handleCompleteAuth = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('funzone_has_started', 'true');
    setShowStartScreen(false);
    setIsAuthModalOpen(false);

    triggerNotification(
      `Hoş Geldiniz, ${profile.name}`,
      `${profile.title} olarak oturum açıldı. WİFO Kuantum çalışma alanı hazır.`,
      'system',
      'success'
    );
  };

  const handleQuickStartGuest = () => {
    if (!currentUser) {
      const guestProfile: UserProfile = {
        id: 'guest-' + Date.now(),
        name: 'Misafir Kullanıcı',
        email: 'misafir@wifo.ai',
        role: 'guest',
        title: 'Hızlı Başlangıç',
        joinedAt: Date.now(),
      };
      setCurrentUser(guestProfile);
    }
    localStorage.setItem('funzone_has_started', 'true');
    setShowStartScreen(false);
    setIsAuthModalOpen(false);
  };

  const handleInstantFounderUnlock = () => {
    const founderProfile: UserProfile = {
      id: 'founder-batuhan',
      name: 'FE OWNER BATUHAN',
      email: 'batuhan@wifo.quantum',
      role: 'founder',
      title: 'WİFO Şirketi Kurucusu & Baş Mimar',
      joinedAt: Date.now(),
    };
    setCurrentUser(founderProfile);
    setIsA3Unlocked(true);
    localStorage.setItem('funzone_a3_quantum_unlocked', 'true');
    setAiLevel('Q_PU_9000');
    triggerNotification(
      'Kurucu Kimliği Doğrulandı',
      'FE OWNER BATUHAN olarak giriş yapıldı. Q-PU 9000 Series işlemcisi ve inceleme alanı açıldı.',
      'system',
      'success'
    );
  };

  const handleLogout = () => {
    stopSpeaking();
    setCurrentUser(null);
    setIsAuthModalOpen(false);
    setShowStartScreen(true);
    triggerNotification(
      'Oturum Kapatıldı',
      'Hesabınızdan güvenle çıkış yapıldı.',
      'system',
      'info'
    );
  };

  const handleSuccessfulUnlock = () => {
    setIsA3Unlocked(true);
    setAiLevel('A3_QUANTUM');
    setGiftRemaining((prev) => Math.max(0, prev - 1));
    const unlockMsgText = `10 Kişilik Hediye Kodu başarıyla uygulandı. WİFO A3 QUANTUM ve hediyeniz olan WİFO A2 modeli sınırsız olarak kullanımınıza açıldı.`;
    const unlockMsg: Message = {
      id: 'unlock-' + Date.now(),
      role: 'assistant',
      content: `**10 Kişilik Hediye Kodu Başarıyla Uygulandı**\n\n- **WİFO A3 QUANTUM:** Yeni Kuantum Nöral İşlemcimiz (Q-PU 9000, 1024 Qubit) tam yetkiyle aktif edildi.\n- **WİFO A2 Hediyesi:** A3 Quantum'un hediyesi olan WİFO A2 modeli de ücretsiz olarak kullanımınıza sunuldu.`,
      timestamp: Date.now(),
      botName: 'WİFO A3 QUANTUM',
      modelTag: 'Q-PU 9000',
    };
    setMessages((prev) => [...prev, unlockMsg]);

    triggerNotification(
      'Hediye Kodu Aktive Edildi',
      '10 kişilik QUANTUM-10 kodu kullanıldı: WİFO A3 QUANTUM ve Hediye WİFO A2 hesabınıza tanımlandı.',
      'gift_code',
      'success'
    );

    if (voiceSettings.autoSpeak) {
      speakText(unlockMsg.id, unlockMsgText, true);
    }
  };

  const getTargetWriteSeconds = useCallback((level: AILevel): number => {
    if (level === 'Q_PU_9000') return 1;
    if (level === 'A3_QUANTUM') return 5;
    if (level === 'A2+') return 8;
    if (level === 'A2') return 10;
    if (level === 'A2-') return 15;
    if (level === 'A1+') return 16;
    return 20;
  }, []);

  const skipTypingStream = useCallback(() => {
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingStream((curr) => {
      if (curr) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === curr.messageId
              ? { ...m, content: curr.fullText, writeDurationSec: curr.targetSeconds }
              : m
          )
        );
      }
      return null;
    });
  }, []);

  const startCalibratedTypewriter = useCallback(
    (messageId: string, fullText: string, targetSeconds: number, autoSpeakAfter: boolean) => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      const durationMs = Math.max(400, targetSeconds * 1000);
      const startTime = performance.now();

      setTypingStream({
        messageId,
        fullText,
        targetSeconds,
        elapsedSeconds: 0,
      });

      typingTimerRef.current = window.setInterval(() => {
        const elapsedMs = performance.now() - startTime;
        const progress = Math.min(1, elapsedMs / durationMs);
        const charCount = Math.max(1, Math.floor(progress * fullText.length));
        const currentSlice = fullText.slice(0, charCount);
        const elapsedSec = Number(Math.min(targetSeconds, elapsedMs / 1000).toFixed(1));

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: progress >= 1 ? fullText : currentSlice,
                  writeDurationSec: targetSeconds,
                }
              : m
          )
        );

        if (progress >= 1) {
          if (typingTimerRef.current) {
            window.clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setTypingStream(null);
          if (autoSpeakAfter) {
            speakText(messageId, fullText, true);
          }
        } else {
          setTypingStream((prev) =>
            prev && prev.messageId === messageId ? { ...prev, elapsedSeconds: elapsedSec } : prev
          );
        }
      }, 35);
    },
    [speakText]
  );

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const submitPrompt = useCallback(
    async (promptText: string) => {
      const cleanInput = promptText.trim();
      if (!cleanInput || loading) return;

      skipTypingStream();

      const userMessage: Message = {
        id: 'msg-' + Date.now(),
        role: 'user',
        content: cleanInput,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setInterimTranscript('');
      setLoading(true);

      const requestStart = performance.now();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanInput,
            history: messages.slice(-30).map((m) => ({ role: m.role, content: m.content })),
            aiLevel,
            isFounder: currentUser?.role === 'founder',
            isGiftClaimed: isA3Unlocked,
          }),
        });

        const data = await response.json();

        if (response.ok && data.reply) {
          const botName =
            aiLevel === 'Q_PU_9000'
              ? 'Q-PU 9000 SERIES (QUBİT · En İyi · 1sn)'
              : aiLevel === 'A3_QUANTUM'
              ? 'WİFO A3 QUANTUM (QUBİT · En İyi · 5sn)'
              : aiLevel === 'A2+'
              ? 'WİFO A2+ (QUBİT · En İyi · 8sn)'
              : aiLevel === 'A2'
              ? 'WİFO A2 (QUBİT · En İyi · 10sn)'
              : aiLevel === 'A2-'
              ? 'WİFO A2- (Tensor · Ortalama · 15sn)'
              : aiLevel === 'A1+'
              ? 'WİFO A1+ (Tensor · Ortalama · 16sn)'
              : 'WİFO A1 (Tensor · Ortalama · 20sn)';

          const targetSeconds =
            typeof data.targetWriteSeconds === 'number'
              ? data.targetWriteSeconds
              : getTargetWriteSeconds(aiLevel);

          const fetchElapsedSec = (performance.now() - requestStart) / 1000;
          const remainingStreamSec =
            targetSeconds === 1
              ? Math.max(0.55, 1.0 - Math.min(0.45, fetchElapsedSec))
              : Math.max(1.2, targetSeconds - Math.min(targetSeconds * 0.35, fetchElapsedSec));

          const newMsgId = 'res-' + Date.now();
          const initialChars = Math.max(4, Math.floor(data.reply.length * 0.06));
          const assistantMessage: Message = {
            id: newMsgId,
            role: 'assistant',
            content: data.reply.slice(0, initialChars),
            timestamp: Date.now(),
            botName,
            modelTag: data.quantumTelemetry?.processorName || 'Q-PU 9000',
            quantumTelemetry: data.quantumTelemetry,
            writeDurationSec: targetSeconds,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setLoading(false);

          startCalibratedTypewriter(
            newMsgId,
            data.reply,
            Number(remainingStreamSec.toFixed(1)) > 0 ? targetSeconds : targetSeconds,
            voiceSettings.autoSpeak
          );
        } else {
          const errorMsg: Message = {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content: `Uyarı: ${data.error || 'Cevap alınamadı. Lütfen tekrar deneyin.'}`,
            timestamp: Date.now(),
            botName: 'Sistem Uyarısı',
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } catch (err: any) {
        const connErrorMsg: Message = {
          id: 'conn-err-' + Date.now(),
          role: 'assistant',
          content: `Sunucuya bağlanırken bir sorun oluştu: ${err.message}`,
          timestamp: Date.now(),
          botName: 'Bağlantı Uyarısı',
        };
        setMessages((prev) => [...prev, connErrorMsg]);
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    },
    [
      aiLevel,
      currentUser?.role,
      getTargetWriteSeconds,
      isA3Unlocked,
      loading,
      messages,
      skipTypingStream,
      startCalibratedTypewriter,
      triggerNotification,
      voiceSettings.autoSpeak,
    ]
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitPrompt(input);
  };

  // Helper to extract dominant hex colors from an image dataURL using an offscreen canvas
  const extractImageColors = (dataUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 24;
          canvas.height = 24;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(['#22d3ee', '#6366f1', '#a855f7', '#10b981']);
            return;
          }
          ctx.drawImage(img, 0, 0, 24, 24);
          const sampleCoords = [
            [6, 6],
            [18, 6],
            [12, 12],
            [6, 18],
            [18, 18],
          ];
          const hexes: string[] = [];
          for (const [cx, cy] of sampleCoords) {
            const p = ctx.getImageData(cx, cy, 1, 1).data;
            const hex =
              '#' +
              [p[0], p[1], p[2]]
                .map((v) => v.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();
            if (!hexes.includes(hex)) hexes.push(hex);
          }
          resolve(hexes.slice(0, 4));
        } catch {
          resolve(['#22d3ee', '#6366f1', '#a855f7', '#10b981']);
        }
      };
      img.onerror = () => resolve(['#22d3ee', '#6366f1', '#a855f7', '#10b981']);
      img.src = dataUrl;
    });
  };

  // Run backend multimodal inspection and auto-navigate to AIPhysicalWorkspace
  const runPhysicalInspectionFlow = useCallback(
    async (payload: DroppedFilePayload) => {
      skipTypingStream();
      setActiveDroppedFile(payload);
      setIsInspectingFile(true);

      const userFileMsg: Message = {
        id: 'file-user-' + Date.now(),
        role: 'user',
        content:
          payload.kind === 'website'
            ? `🌐 **Web Tabanlı Site Bırakıldı:** \`${payload.name}\`${payload.webUrl ? ` (${payload.webUrl})` : ''}`
            : payload.kind === 'image'
            ? `🖼️ **Görsel Dosyası Bırakıldı:** \`${payload.name}\``
            : `📄 **Dosya Bırakıldı:** \`${payload.name}\``,
        timestamp: Date.now(),
        droppedFile: payload,
      };

      const aiMsgId = 'file-ai-' + (Date.now() + 1);
      const immediateGreeting = `**Hemen bakıyorum!** "${payload.name}" ${
        payload.kind === 'website'
          ? 'web tabanlı sitesini'
          : payload.kind === 'image'
          ? 'görselini'
          : 'dosyasını'
      } canlı fiziksel çalışma sahnesinde açtım. Seni şimdi oraya götürüyorum; sahnede imlecimle yaptığım fiziksel inceleme ve işlemleri canlı olarak izleyebilirsin!`;

      const aiInitialMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: immediateGreeting,
        timestamp: Date.now() + 1,
        botName: activeProcTheme.shortLabel,
        droppedFile: payload,
      };

      setMessages((prev) => [...prev, userFileMsg, aiInitialMsg]);

      if (voiceSettings.autoSpeak) {
        speakText(aiMsgId, `Hemen bakıyorum! ${payload.name} dosyasını fiziksel sahnede açtım ve üzerinde çalışmaya başladım.`, true);
      }

      // Smoothly transport the user to the dropped item's Physical Workspace
      window.setTimeout(() => {
        setMode('physical_workspace');
      }, 380);

      try {
        const res = await fetch('/api/inspect-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: payload.name,
            mimeType: payload.mimeType,
            kind: payload.kind,
            dataUrl: payload.dataUrl || '',
            textContent: payload.textContent || '',
            webUrl: payload.webUrl || '',
            aiLevel,
          }),
        });
        const data = await res.json();
        if (res.ok && data.physicalSteps) {
          const enriched: DroppedFilePayload = {
            ...payload,
            aiGreeting: data.greeting,
            aiSummary: data.summary,
            physicalSteps: data.physicalSteps,
          };
          setActiveDroppedFile(enriched);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    content: `**${data.greeting}**\n\n${data.summary}`,
                    droppedFile: enriched,
                  }
                : m.id === userFileMsg.id
                ? { ...m, droppedFile: enriched }
                : m
            )
          );
        }
      } catch {
        // Fallback steps are already handled if offline
      } finally {
        setIsInspectingFile(false);
      }
    },
    [activeProcTheme.shortLabel, aiLevel, skipTypingStream, speakText, voiceSettings.autoSpeak]
  );

  // Process any dropped File object from OS / browser
  const handleProcessDroppedFile = useCallback(
    async (file: File) => {
      const lowerName = file.name.toLowerCase();
      const isImage =
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(lowerName);
      const isWebsite =
        file.type === 'text/html' || /\.(html?|xhtml)$/i.test(lowerName);
      const isCode = /\.(js|jsx|ts|tsx|py|json|css|sql|sh|xml|yaml|yml)$/i.test(
        lowerName
      );

      const kind: DroppedItemKind = isImage
        ? 'image'
        : isWebsite
        ? 'website'
        : isCode
        ? 'code'
        : 'document';

      const baseSteps: PhysicalActionStep[] = [
        {
          id: 'init-1',
          stepNumber: 1,
          title: isWebsite ? 'Üst Başlık & Navigasyon Katmanı' : 'Birincil Odak & Merkez Alanı',
          actionLabel: isWebsite ? 'DOM Yapısı & Hizalama Tıklaması' : 'Optik Odak & Kompozisyon Taraması',
          description: 'Hemen bakıyorum: Bu bölgeyi fiziksel imlecimle tarayıp yapısal hizalamasını doğruluyorum.',
          xPercent: 28,
          yPercent: 24,
          widthPercent: 26,
          heightPercent: 18,
          color: '#22d3ee',
        },
        {
          id: 'init-2',
          stepNumber: 2,
          title: isWebsite ? 'Ana İçerik & Etkileşim Katmanı' : 'Renk & Kontrast Spektrumu',
          actionLabel: 'Canlı Kalibrasyon & İyileştirme',
          description: 'Bu alandaki görsel kontrastı ve detay katmanlarını fiziksel olarak işaretleyip optimize ediyorum.',
          xPercent: 56,
          yPercent: 48,
          widthPercent: 28,
          heightPercent: 22,
          color: '#a855f7',
        },
        {
          id: 'init-3',
          stepNumber: 3,
          title: 'Alt Bileşen & Bütünlük Kontrolü',
          actionLabel: 'Fiziksel Doğrulama & Tamamlama',
          description: 'Alt bölümdeki tüm öğeleri canlı sahnede test edip fiziksel iyileştirmeyi tamamlıyorum.',
          xPercent: 44,
          yPercent: 74,
          widthPercent: 26,
          heightPercent: 18,
          color: '#10b981',
        },
      ];

      if (isImage) {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = String(reader.result || '');
          const colors = await extractImageColors(dataUrl);
          const payload: DroppedFilePayload = {
            id: 'drop-' + Date.now(),
            name: file.name,
            mimeType: file.type || 'image/png',
            sizeBytes: file.size,
            kind: 'image',
            dataUrl,
            timestamp: Date.now(),
            aiGreeting: `Hemen bakıyorum! "${file.name}" görselini fiziksel inceleme sahnesinde açtım, şu an üzerinde canlı tarama ve işlemlerimi yapıyorum.`,
            physicalSteps: baseSteps,
            extractedColors: colors,
          };
          runPhysicalInspectionFlow(payload);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const textContent = String(reader.result || '');
          const payload: DroppedFilePayload = {
            id: 'drop-' + Date.now(),
            name: file.name,
            mimeType: file.type || (isWebsite ? 'text/html' : 'text/plain'),
            sizeBytes: file.size,
            kind,
            textContent,
            timestamp: Date.now(),
            aiGreeting: `Hemen bakıyorum! "${file.name}" ${isWebsite ? 'web sitesini' : 'dosyasını'} fiziksel sahnede açtım ve üzerinde canlı işlemlerimi gerçekleştiriyorum.`,
            physicalSteps: baseSteps,
          };
          runPhysicalInspectionFlow(payload);
        };
        reader.readAsText(file);
      }
    },
    [runPhysicalInspectionFlow]
  );

  // Inspect a dropped or typed Web URL
  const handleInspectWebUrl = useCallback(
    (rawUrl: string) => {
      const cleanUrl = rawUrl.trim();
      const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      let hostName = formattedUrl;
      try {
        hostName = new URL(formattedUrl).hostname || formattedUrl;
      } catch {
        hostName = cleanUrl;
      }

      const syntheticHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #0b1120; color: #f8fafc; padding: 28px; }
    .nav { display: flex; justify-content: space-between; align-items: center; padding-bottom: 18px; border-bottom: 1px solid #1e293b; }
    .hero { margin-top: 28px; padding: 28px; border-radius: 20px; background: linear-gradient(135deg, #0f172a, #1e1b4b); border: 1px solid #334155; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 22px; }
    .card { padding: 18px; border-radius: 14px; background: #111827; border: 1px solid #1f2937; }
    .btn { display: inline-block; margin-top: 14px; padding: 10px 18px; border-radius: 10px; background: #06b6d4; color: #020617; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <div class="nav">
    <strong>🌐 ${hostName}</strong>
    <span style="color:#38bdf8;font-size:13px;">Canlı Web Tabanlı Site Sahnesi</span>
  </div>
  <div class="hero">
    <h1 style="margin:0 0 10px 0;font-size:24px;">${hostName} — Web Arayüzü & DOM Yapısı</h1>
    <p style="margin:0;color:#94a3b8;font-size:14px;">Adres: ${formattedUrl} · Yapay zeka şu anda bu web sitesinin bileşenlerini fiziksel olarak tarıyor ve optimize ediyor.</p>
    <a class="btn" href="#">Etkileşimli Ana Buton</a>
  </div>
  <div class="grid">
    <div class="card"><strong>01. Üst Navigasyon</strong><p style="font-size:12px;color:#94a3b8;">Menü ve başlık hizalaması</p></div>
    <div class="card"><strong>02. Dinamik İçerik</strong><p style="font-size:12px;color:#94a3b8;">Görsel ve tipografi katmanı</p></div>
    <div class="card"><strong>03. Etkileşim & Performans</strong><p style="font-size:12px;color:#94a3b8;">Responsive ızgara yapısı</p></div>
  </div>
</body>
</html>`;

      const payload: DroppedFilePayload = {
        id: 'web-' + Date.now(),
        name: `${hostName} (Web Sitesi)`,
        mimeType: 'text/html',
        sizeBytes: syntheticHtml.length,
        kind: 'website',
        webUrl: formattedUrl,
        textContent: syntheticHtml,
        timestamp: Date.now(),
        aiGreeting: `Hemen bakıyorum! "${hostName}" web sitesini canlı fiziksel sahnede açtım, şu an sayfa öğelerine tıklayarak fiziksel incelememi gerçekleştiriyorum.`,
      };
      runPhysicalInspectionFlow(payload);
    },
    [runPhysicalInspectionFlow]
  );

  // Load 1-click sample website or image so user can test immediately
  const handleLoadSamplePhysicalItem = useCallback(
    (type: 'website' | 'image') => {
      if (type === 'website') {
        const sampleHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; padding: 26px; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: #111827; border-radius: 14px; border: 1px solid #1e293b; }
    .hero { margin-top: 22px; padding: 28px; border-radius: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid #38bdf844; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 20px; }
    .card { padding: 16px; border-radius: 14px; background: #111827; border: 1px solid #1f2937; }
    button { margin-top: 14px; padding: 10px 18px; border-radius: 10px; border: none; background: #22d3ee; color: #020617; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <strong>⚡ WİFO NEXT-GEN WEB PORTAL</strong>
    <span style="color:#22d3ee;font-size:12px;">Canlı HTML5 Web Uygulaması</span>
  </header>
  <section class="hero">
    <h1 style="margin:0 0 8px 0;font-size:22px;">Yeni Nesil Kuantum Bulut Arayüzü</h1>
    <p style="margin:0;color:#94a3b8;font-size:13px;">Yapay zeka bu web sitesinin başlık, buton ve ızgara bileşenlerini fiziksel imleciyle canlı olarak inceler ve iyileştirir.</p>
    <button>Hemen Başlat</button>
  </section>
  <section class="cards">
    <div class="card"><h3 style="margin:0 0 6px 0;font-size:14px;color:#38bdf8;">Hızlı Akış</h3><p style="margin:0;font-size:12px;color:#94a3b8;">Düşük gecikmeli veri katmanı</p></div>
    <div class="card"><h3 style="margin:0 0 6px 0;font-size:14px;color:#a855f7;">Modüler Tasarım</h3><p style="margin:0;font-size:12px;color:#94a3b8;">Esnek bileşen mimarisi</p></div>
    <div class="card"><h3 style="margin:0 0 6px 0;font-size:14px;color:#10b981;">Canlı Telemetri</h3><p style="margin:0;font-size:12px;color:#94a3b8;">Gerçek zamanlı izleme</p></div>
  </section>
</body>
</html>`;
        const payload: DroppedFilePayload = {
          id: 'sample-web-' + Date.now(),
          name: 'ornek-web-sitesi.html',
          mimeType: 'text/html',
          sizeBytes: sampleHtml.length,
          kind: 'website',
          textContent: sampleHtml,
          timestamp: Date.now(),
        };
        runPhysicalInspectionFlow(payload);
      } else {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#090d16"/>
              <stop offset="50%" stop-color="#111c35"/>
              <stop offset="100%" stop-color="#1e1b4b"/>
            </linearGradient>
          </defs>
          <rect width="900" height="540" fill="url(#bg)"/>
          <circle cx="260" cy="240" r="110" fill="#22d3ee" opacity="0.22" stroke="#22d3ee" stroke-width="3"/>
          <circle cx="260" cy="240" r="48" fill="#22d3ee"/>
          <rect x="460" y="130" width="340" height="230" rx="22" fill="#0f172a" stroke="#a855f7" stroke-width="3"/>
          <text x="630" y="210" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="bold">WİFO GÖRSEL TASARIM</text>
          <text x="630" y="255" text-anchor="middle" fill="#38bdf8" font-family="sans-serif"Font-size="16">Fiziksel Piksel &amp; Odak Katmanı</text>
          <rect x="520" y="290" width="220" height="40" rx="10" fill="#10b981"/>
        </svg>`;
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
        const payload: DroppedFilePayload = {
          id: 'sample-img-' + Date.now(),
          name: 'ornek-arayuz-tasarimi.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: svgContent.length,
          kind: 'image',
          dataUrl,
          extractedColors: ['#22D3EE', '#A855F7', '#10B981', '#0F172A'],
          timestamp: Date.now(),
        };
        runPhysicalInspectionFlow(payload);
      }
    },
    [runPhysicalInspectionFlow]
  );

  // Add a custom physical step when the user clicks on the stage or submits a physical command
  const handleAddCustomPhysicalStep = useCallback(
    (xPercent: number, yPercent: number, customPrompt?: string) => {
      setActiveDroppedFile((prev) => {
        if (!prev) return prev;
        const existing = prev.physicalSteps || [];
        const nextNum = existing.length + 1;
        const newStep: PhysicalActionStep = {
          id: 'custom-step-' + Date.now(),
          stepNumber: nextNum,
          title: customPrompt
            ? `Özel Komut: ${customPrompt.slice(0, 32)}`
            : `Seçilen Odak Noktası #${nextNum}`,
          actionLabel: customPrompt
            ? 'Kullanıcı Komutu Fiziksel Uygulaması'
            : 'Canlı Nokta Taraması & Müdahale',
          description: customPrompt
            ? `Hemen bakıyorum! "${customPrompt}" isteğin doğrultusunda (${xPercent}%, ${yPercent}%) koordinatına gelerek fiziksel işlemi uyguladım.`
            : `Hemen bakıyorum! Tıkladığın (${xPercent}%, ${yPercent}%) koordinatına imlecimle geldim ve bu bölgeyi fiziksel olarak tarayıp işaretledim.`,
          xPercent,
          yPercent,
          widthPercent: 24,
          heightPercent: 18,
          color: '#22d3ee',
          physicalEffect: 'click',
        };
        return {
          ...prev,
          aiGreeting: newStep.description,
          physicalSteps: [...existing, newStep],
        };
      });
    },
    []
  );

  // Microphone Voice Input (SpeechRecognition) Handler
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      triggerNotification(
        'Sesli Giriş Desteklenmiyor',
        'Tarayıcınız Web Speech API mikrofon tanıma özelliğini desteklemiyor. Chrome veya Edge kullanabilirsiniz.',
        'system',
        'warning',
        true
      );
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;
      latestVoiceTextRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }

        if (finalTranscript) {
          const combined = (input ? input + ' ' : '') + finalTranscript.trim();
          latestVoiceTextRef.current = combined;
          setInput(combined);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (event: { error: string }) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed') {
          triggerNotification(
            'Mikrofon İzni Gerekli',
            'Sesli giriş için lütfen tarayıcınızdan mikrofon erişimine izin verin.',
            'system',
            'warning',
            true
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        const recognized = latestVoiceTextRef.current.trim();
        if (recognized && autoSendVoice) {
          latestVoiceTextRef.current = '';
          submitPrompt(recognized);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMessageFeedback = (id: string, reaction: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextFeedback = m.feedback === reaction ? null : reaction;
        if (nextFeedback === 'like') {
          triggerNotification(
            'Yanıt Beğenildi',
            'Geri bildiriminiz WİFO A3 Quantum öğrenme matrisine kaydedildi.',
            'chat_history',
            'success'
          );
        } else if (nextFeedback === 'dislike') {
          triggerNotification(
            'Geri Bildirim Alındı',
            'Yanıtı beğenmediğiniz kaydedildi. Dilerseniz "Yeniden Dene" ile yeni bir yanıt üretebilirsiniz.',
            'chat_history',
            'info'
          );
        }
        return { ...m, feedback: nextFeedback };
      })
    );
  };

  const handleRetryMessage = async (assistantMsgId: string) => {
    if (loading || regeneratingId) return;

    const targetIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (targetIndex === -1) return;

    // Find the preceding user message to regenerate from, or use a default prompt if retrying the welcome message
    let promptToRetry = 'Kendini ve WİFO A3 QUANTUM kuantum işlemci mimarisini kısaca tanıt.';
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].content.trim()) {
        promptToRetry = messages[i].content.trim();
        break;
      }
    }

    stopSpeaking();
    setRegeneratingId(assistantMsgId);

    try {
      const priorHistory = messages
        .slice(0, Math.max(0, targetIndex - 1))
        .slice(-30)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToRetry,
          history: priorHistory,
          aiLevel,
          isFounder: currentUser?.role === 'founder',
          isGiftClaimed: isA3Unlocked,
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const botName =
          aiLevel === 'Q_PU_9000'
            ? 'Q-PU 9000 SERIES (QUBİT · En İyi · 1sn)'
            : aiLevel === 'A3_QUANTUM'
            ? 'WİFO A3 QUANTUM (QUBİT · En İyi · 5sn)'
            : aiLevel === 'A2+'
            ? 'WİFO A2+ (QUBİT · En İyi · 8sn)'
            : aiLevel === 'A2'
            ? 'WİFO A2 (QUBİT · En İyi · 10sn)'
            : aiLevel === 'A2-'
            ? 'WİFO A2- (Tensor · Ortalama · 15sn)'
            : aiLevel === 'A1+'
            ? 'WİFO A1+ (Tensor · Ortalama · 16sn)'
            : 'WİFO A1 (Tensor · Ortalama · 20sn)';

        const targetSeconds =
          typeof data.targetWriteSeconds === 'number'
            ? data.targetWriteSeconds
            : getTargetWriteSeconds(aiLevel);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.reply.slice(0, Math.max(4, Math.floor(data.reply.length * 0.06))),
                  timestamp: Date.now(),
                  botName,
                  modelTag: data.quantumTelemetry?.processorName || 'Q-PU 9000',
                  quantumTelemetry: data.quantumTelemetry,
                  feedback: null,
                  writeDurationSec: targetSeconds,
                }
              : m
          )
        );

        startCalibratedTypewriter(assistantMsgId, data.reply, targetSeconds, voiceSettings.autoSpeak);
      }
    } catch (err: any) {
      triggerNotification(
        'Yeniden Deneme Hatası',
        `Yanıt yeniden üretilirken bir sorun oluştu: ${err.message}`,
        'system',
        'warning'
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const clearChatHistory = () => {
    stopSpeaking();
    const previousCount = messages.length;
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        role: 'assistant',
        content: `Merhaba! Sohbet geçmişini temizledim, yeni bir sayfa açtık. Şimdi hangi konu üzerinde konuşmak istersin?`,
        timestamp: Date.now(),
        botName: 'WİFO A3 QUANTUM',
        modelTag: 'Q-PU 9000',
      },
    ]);
    triggerNotification(
      'Sohbet Geçmişi Sıfırlandı',
      `${previousCount} mesajlık sohbet geçmişi temizlendi ve yeni oturum başlatıldı.`,
      'chat_history',
      'warning'
    );
  };

  const exportChatHistory = () => {
    const content = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString('tr-TR')}] ${
            m.role === 'user' ? currentUser?.name || 'Kullanıcı' : m.botName || 'WİFO AI'
          }:\n${m.content}\n`
      )
      .join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funzone-quantum-sohbet-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    triggerNotification(
      'Sohbet Geçmişi Yedeklendi',
      `${messages.length} mesaj içeren sohbet geçmişi başarıyla dışa aktarıldı.`,
      'chat_history',
      'success'
    );
  };

  const handleSelectModel = (level: AILevel) => {
    if (level === 'Q_PU_9000' && currentUser?.role !== 'founder') {
      triggerNotification(
        'Sadece Kurucu Erişebilir',
        'Q-PU 9000 Series işlemcisine yalnızca Kurucu (FE OWNER BATUHAN) giriş yapabilir.',
        'system',
        'warning',
        true
      );
      setIsAuthModalOpen(true);
      return;
    }
    if (level !== aiLevel) {
      setAiLevel(level);
      const label =
        level === 'Q_PU_9000'
          ? 'Q-PU 9000 SERIES (4096 QUBİT · En İyi Teknoloji · 1sn)'
          : level === 'A3_QUANTUM'
          ? 'WİFO A3 QUANTUM (1024 QUBİT · En İyi Teknoloji · 5sn)'
          : level === 'A2+'
          ? 'WİFO A2+ (768 QUBİT · En İyi Teknoloji · 8sn)'
          : level === 'A2'
          ? 'WİFO A2 (512 QUBİT · En İyi Teknoloji · 10sn)'
          : level === 'A2-'
          ? 'WİFO A2- (384 Tensor · Ortalama Teknoloji · 15sn)'
          : level === 'A1+'
          ? 'WİFO A1+ (256 Tensor · Ortalama Teknoloji · 16sn)'
          : 'WİFO A1 (128 Tensor · Ortalama Teknoloji · 20sn)';
      triggerNotification(
        'Yapay Zeka Modeli Değiştirildi',
        `Aktif işlemci çekirdeği ${label} olarak güncellendi.`,
        'model_switch',
        'info'
      );
    }
  };

  // Full-Screen "Başla Yeri" & "Giriş Yapma Sistemi" Hub when showStartScreen is true
  if (showStartScreen) {
    return (
      <>
        <NotificationToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
          onOpenSettings={() => setIsNotificationModalOpen(true)}
          isDarkMode={isDarkMode}
        />
        <AuthWelcomeScreen
          isDarkMode={isDarkMode}
          onCompleteAuth={handleCompleteAuth}
          onQuickStartGuest={handleQuickStartGuest}
          onWatchPromoVideo={() => {
            localStorage.setItem('funzone_has_started', 'true');
            setShowStartScreen(false);
            setMode('qpu_9000');
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col font-sans quantum-surface-grid transition-colors duration-500 ${
        isProcessorThemeEnabled
          ? isDarkMode
            ? activeProcTheme.darkPageBg
            : activeProcTheme.lightPageBg
          : isDarkMode
          ? 'bg-[#080C14] text-slate-100'
          : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Subtle Ambient Processor Theme Radial Aura */}
      {isProcessorThemeEnabled && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div
            className={`absolute -top-32 left-1/4 w-[620px] h-[420px] rounded-full blur-[130px] transition-colors duration-700 ${activeProcTheme.ambientGlowPrimary}`}
          />
          <div
            className={`absolute bottom-0 right-1/5 w-[520px] h-[380px] rounded-full blur-[140px] transition-colors duration-700 ${activeProcTheme.ambientGlowSecondary}`}
          />
        </div>
      )}
      {/* Real-time Toast Notification Stack */}
      <NotificationToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onOpenSettings={() => setIsNotificationModalOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Full-Screen Eski Tanıtım Videosu Modal (Accessible by ALL users from Chat) */}
      {isPromoVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-2 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl">
            <QPU9000Showcase
              isFounder={currentUser?.role === 'founder'}
              onUnlockAsFounder={handleInstantFounderUnlock}
              onSelectQpuProcessor={() => {
                if (currentUser?.role === 'founder') {
                  setAiLevel('Q_PU_9000');
                }
              }}
              onFinishToStartScreen={() => {
                setIsPromoVideoModalOpen(false);
              }}
              onCloseModal={() => setIsPromoVideoModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Voice Changer & Character Studio Modal */}
      <VoiceChangerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        isDarkMode={isDarkMode}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={(next) => {
          setVoiceSettings(next);
        }}
        availableVoices={availableVoices}
        isSpeaking={speakingId !== null}
        onTestVoice={(settingsToTest) =>
          speakText(
            'voice-test-sample',
            'Merhaba, ben WİFO A3 Quantum. Ses değiştirme stüdyosu ile ses tonumu, kalınlığımı ve konuşma hızımı dilediğiniz gibi özelleştirebilirsiniz.',
            true,
            settingsToTest
          )
        }
        onStopVoice={stopSpeaking}
      />

      {/* Login / Account Switch Modal */}
      {isAuthModalOpen && (
        <AuthWelcomeScreen
          isDarkMode={isDarkMode}
          onCompleteAuth={handleCompleteAuth}
          onQuickStartGuest={handleQuickStartGuest}
          onWatchPromoVideo={() => {
            setIsAuthModalOpen(false);
            setMode('qpu_9000');
          }}
          isModal
          onCloseModal={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Notification Settings & Event Log Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isDarkMode={isDarkMode}
        preferences={notificationPrefs}
        onUpdatePreferences={setNotificationPrefs}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onClearNotifications={() => setNotifications([])}
        onDeleteNotification={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        onTriggerTestNotification={() =>
          triggerNotification(
            'Test Bildirimi Başarılı',
            'Sohbet geçmişi ve 10 kişilik hediye kodu bildirim ayarlarınız sorunsuz çalışıyor.',
            'system',
            'success',
            true
          )
        }
      />

      {/* 10-User Gift Code Modal */}
      <GiftCodeModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        isDarkMode={isDarkMode}
        isUnlocked={isA3Unlocked}
        onSuccessUnlock={handleSuccessfulUnlock}
        onNotifyGiftAttempt={(success, msg) => {
          if (!success) {
            triggerNotification('Hediye Kodu Uyarısı', msg, 'gift_code', 'warning');
          }
        }}
      />

      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-500 ${
          isProcessorThemeEnabled
            ? isDarkMode
              ? activeProcTheme.darkHeaderBg
              : activeProcTheme.lightHeaderBg
            : isDarkMode
            ? 'bg-[#080C14]/90 border-slate-800/80'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            type="button"
            onClick={() => setMode('chat')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none cursor-pointer"
          >
            <BrandLogo size={28} animated />
            <span
              className={`font-display font-extrabold text-lg tracking-tight bg-gradient-to-r ${
                isProcessorThemeEnabled
                  ? activeProcTheme.brandGradient
                  : 'from-cyan-400 via-blue-400 to-violet-400'
              } bg-clip-text text-transparent transition-all duration-500`}
            >
              Funzone
            </span>
          </button>

          {/* Zone 2: 5 Concise Single-Line Typographic Navigation Links */}
          <nav
            aria-label="Üst Gezinme"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {[
              { id: 'chat' as AppMode, label: 'Kuantum Sohbet' },
              { id: 'a_series' as AppMode, label: 'Modeller' },
              { id: 'analytics' as AppMode, label: 'Analiz' },
              { id: 'bioscience' as AppMode, label: 'Biyobilim Lab' },
              { id: 'settings' as AppMode, label: 'Ayarlar' },
            ].map((navItem) => {
              const isActive = mode === navItem.id;
              return (
                <button
                  key={navItem.id}
                  type="button"
                  onClick={() => setMode(navItem.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? `${activeProcTheme.activeNavBorder} font-semibold`
                        : 'border-slate-900 text-slate-900 font-semibold'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-100'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {navItem.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsGiftModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-xs text-white bg-gradient-to-r ${
                isProcessorThemeEnabled
                  ? activeProcTheme.buttonGradient
                  : 'from-cyan-500 via-blue-600 to-indigo-600'
              } hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 shadow-xs cursor-pointer`}
            >
              <Gift size={14} />
              <span>10 Kişilik Hediye Kodu</span>
              <span className="font-mono tabular-nums opacity-90">· {giftRemaining}/10</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace — Enterprise Tab Architecture */}
      <main className="relative z-10 flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        {/* Architectural Workspace Sub-Navigation & Status Bar */}
        <div
          className={`p-2 sm:px-4 sm:py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-colors duration-500 ${
            isProcessorThemeEnabled
              ? isDarkMode
                ? `${activeProcTheme.darkCardBg} ${activeProcTheme.darkBorder}`
                : `${activeProcTheme.lightCardBg} ${activeProcTheme.lightBorder}`
              : isDarkMode
              ? 'bg-[#0E1422] border-slate-800/80'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Left: Segmented Module Tab Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            {[
              {
                id: 'chat' as AppMode,
                label: 'Sohbet',
                icon: <MessageSquare size={13} />,
              },
              {
                id: 'physical_workspace' as AppMode,
                label: 'Fiziksel Sahne (Dosya/Site)',
                icon: <MousePointerClick size={13} className="text-cyan-400" />,
              },
              {
                id: 'a_series' as AppMode,
                label: 'Modeller & A Series',
                icon: <Layers size={13} />,
              },
              {
                id: 'analytics' as AppMode,
                label: 'Kuantum Analiz',
                icon: <BarChart3 size={13} />,
              },
              {
                id: 'bioscience' as AppMode,
                label: 'Biyobilim Lab',
                icon: <Dna size={13} className="text-teal-400" />,
              },
              {
                id: 'qpu_9000' as AppMode,
                label: 'Eski Video & Q-PU 9000',
                icon: <Film size={13} className="text-amber-400" />,
              },
              {
                id: 'image' as AppMode,
                label: 'Görsel Stüdyosu',
                icon: <ImageIcon size={13} />,
              },
              {
                id: 'processor' as AppMode,
                label: 'Mimarî',
                icon: <Cpu size={13} />,
              },
              {
                id: 'settings' as AppMode,
                label: 'Ayarlar',
                icon: <Settings size={13} />,
              },
            ].map((tab) => {
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'bg-[#162034] text-white border border-slate-700/90 font-semibold shadow-2xs'
                        : 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Clean Unboxed Status & Quick Utility Actions */}
          <div className="flex items-center gap-2.5 text-xs ml-auto">
            <div className="hidden xl:flex items-center gap-2 text-slate-400">
              <span>Çekirdek:</span>
              <button
                type="button"
                onClick={() => setMode('a_series')}
                className={`font-display font-semibold hover:underline cursor-pointer ${activeProcTheme.accentText}`}
              >
                {activeProcTheme.shortLabel}
              </button>
              <span aria-hidden="true">·</span>
              <span>Tema:</span>
              <button
                type="button"
                onClick={() => setMode('settings')}
                className="text-slate-300 hover:underline cursor-pointer"
              >
                {isProcessorThemeEnabled ? activeProcTheme.themeName : 'Standart'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentUser?.role === 'founder'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : isDarkMode
                  ? 'bg-[#0A0F1A] border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
              title="Hesap ve Kurucu Girişi"
            >
              {currentUser?.role === 'founder' ? (
                <Crown size={13} className="text-amber-400" />
              ) : (
                <LogIn size={13} className="text-cyan-400" />
              )}
              <span>{currentUser ? currentUser.name : 'Giriş Yap'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className={`p-1.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#0A0F1A] border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Bildirimler"
            >
              <Bell size={14} className={unreadNotificationCount > 0 ? 'text-cyan-400' : ''} />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#0A0F1A] border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Karanlık / Aydınlık Mod"
            >
              {isDarkMode ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Mode Viewports */}
        {mode === 'settings' ? (
          <SettingsView
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            aiLevel={aiLevel}
            onSelectAiLevel={handleSelectModel}
            isProcessorThemeEnabled={isProcessorThemeEnabled}
            onToggleProcessorTheme={() => setIsProcessorThemeEnabled((prev) => !prev)}
            showEnergyFlowBar={showEnergyFlowBar}
            onToggleEnergyFlowBar={() => setShowEnergyFlowBar((prev) => !prev)}
            showSmartTopicsBar={showSmartTopicsBar}
            onToggleSmartTopicsBar={() => setShowSmartTopicsBar((prev) => !prev)}
            voiceSettings={voiceSettings}
            onUpdateVoiceSettings={setVoiceSettings}
            autoSendVoice={autoSendVoice}
            onToggleAutoSendVoice={() => setAutoSendVoice((prev) => !prev)}
            isSpeaking={speakingId !== null}
            onTestVoice={(settingsToTest) =>
              speakText(
                'voice-test-sample',
                'Merhaba, ben WİFO A3 Quantum. Ses değiştirme stüdyosu ve işlemci teması ayarlarınız başarıyla aktif edildi.',
                true,
                settingsToTest
              )
            }
            onStopVoice={stopSpeaking}
            onOpenVoiceStudioModal={() => setIsVoiceModalOpen(true)}
            notificationPrefs={notificationPrefs}
            onUpdateNotificationPrefs={setNotificationPrefs}
            onTriggerTestNotification={() =>
              triggerNotification(
                'Test Bildirimi Başarılı',
                'Ayarlar sekmesinden tetiklenen kuantum bildirim testi sorunsuz çalışıyor.',
                'system',
                'success',
                true
              )
            }
            onOpenNotificationLogModal={() => setIsNotificationModalOpen(true)}
            currentUser={currentUser}
            isA3Unlocked={isA3Unlocked}
            giftRemaining={giftRemaining}
            messageCount={messages.length}
            onInstantFounderLogin={handleInstantFounderUnlock}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onOpenGiftModal={() => setIsGiftModalOpen(true)}
            onExportChatHistory={exportChatHistory}
            onClearChatHistory={clearChatHistory}
            onOpenStartScreen={() => setShowStartScreen(true)}
          />
        ) : mode === 'physical_workspace' ? (
          <AIPhysicalWorkspace
            isDarkMode={isDarkMode}
            aiLevel={aiLevel}
            activeFile={activeDroppedFile}
            isInspecting={isInspectingFile}
            onBackToChat={() => setMode('chat')}
            onDropNewFile={handleProcessDroppedFile}
            onInspectUrl={handleInspectWebUrl}
            onLoadSampleItem={handleLoadSamplePhysicalItem}
            onAddCustomStepAtCoord={handleAddCustomPhysicalStep}
            onSpeakText={(txt) => speakText('physical-voice-' + Date.now(), txt, true)}
          />
        ) : mode === 'analytics' ? (
          <div className="space-y-6">
            <QuantumProcessorHUD
              isDarkMode={isDarkMode}
              isUnlocked={isA3Unlocked}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
              onSelectA3Quantum={() => {
                if (!isA3Unlocked) {
                  setIsGiftModalOpen(true);
                } else {
                  handleSelectModel('A3_QUANTUM');
                  setMode('chat');
                }
              }}
              telemetry={messages[messages.length - 1]?.quantumTelemetry}
            />

            <div
              className={`rounded-3xl border overflow-hidden ${
                isDarkMode ? 'bg-[#111622] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <QuantumAnalyticsPanel
                messages={messages}
                isDarkMode={isDarkMode}
                activeAiLevel={aiLevel}
              />
            </div>
          </div>
        ) : mode === 'bioscience' ? (
          <BioscienceWorkbench
            isDarkMode={isDarkMode}
            onAskQuantumAssistant={(promptText, sessionTitle) => {
              setActiveSessionTitle(sessionTitle);
              setMode('chat');
              submitPrompt(promptText);
            }}
          />
        ) : mode === 'a_series' ? (
          <div className="space-y-6">
            <ProcessorThemeStrip
              currentLevel={aiLevel}
              isDarkMode={isDarkMode}
              isProcessorThemeEnabled={isProcessorThemeEnabled}
              onToggleProcessorTheme={() => setIsProcessorThemeEnabled((prev) => !prev)}
              onSelectLevel={handleSelectModel}
            />

            <ModelSelector
              currentLevel={aiLevel}
              onSelect={handleSelectModel}
              isDarkMode={isDarkMode}
              isA3Unlocked={isA3Unlocked}
              isFounder={currentUser?.role === 'founder'}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
              onOpenFounderLogin={() => setIsAuthModalOpen(true)}
              onOpenQpuShowcase={() => setMode('qpu_9000')}
            />

            <ASeriesComparisonView
              isDarkMode={isDarkMode}
              isA3Unlocked={isA3Unlocked}
              isFounder={currentUser?.role === 'founder'}
              activeLevel={aiLevel}
              onSelectModelAndChat={(lvl) => {
                handleSelectModel(lvl);
                setMode('chat');
              }}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
              onOpenQpu9000Tab={() => setMode('qpu_9000')}
              onOpenFounderLogin={() => setIsAuthModalOpen(true)}
            />
          </div>
        ) : mode === 'qpu_9000' ? (
          <div className="rounded-3xl overflow-hidden border border-amber-500/30 min-h-[640px] flex flex-col shadow-2xl">
            <QPU9000Showcase
              isFounder={currentUser?.role === 'founder'}
              onUnlockAsFounder={handleInstantFounderUnlock}
              onSelectQpuProcessor={() => {
                setAiLevel('Q_PU_9000');
              }}
              onFinishToStartScreen={() => {
                setMode('chat');
                setShowStartScreen(true);
              }}
            />
          </div>
        ) : mode === 'image' ? (
          <QuantumImageStudio isDarkMode={isDarkMode} onBackToChat={() => setMode('chat')} />
        ) : mode === 'processor' ? (
          <div className="space-y-6">
            <ThreeProcessorVisualizer
              activeLevel={aiLevel}
              onSelectLevel={handleSelectModel}
              isDarkMode={isDarkMode}
            />

            <QuantumProcessorHUD
              isDarkMode={isDarkMode}
              isUnlocked={isA3Unlocked}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
              onSelectA3Quantum={() => {
                if (!isA3Unlocked) {
                  setIsGiftModalOpen(true);
                } else {
                  handleSelectModel('A3_QUANTUM');
                  setMode('chat');
                }
              }}
              telemetry={messages[messages.length - 1]?.quantumTelemetry}
            />

            <div
              className={`p-6 sm:p-8 rounded-2xl border ${
                isDarkMode ? 'bg-[#111622] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <BrandLogo size={26} />
                <h2 className="font-display text-xl font-bold">
                  WİFO İşlemci Mimarisi: Tensor (Ortalama) vs QUBİT (En İyi)
                </h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl mb-6">
                WİFO işlemci ailesi iki temel mimariye ayrılır: <strong>A1 (20sn)</strong>, <strong>A1+ (16sn)</strong> ve <strong>A2- (15sn)</strong> modelleri <strong>Tensor Teknolojisi (Ortalama Seviye)</strong> ile çalışırken; <strong>A2 (10sn)</strong>, <strong>A2+ (8sn)</strong>, <strong>A3 Quantum (5sn)</strong> ve <strong>Q-PU 9000 Series (1sn)</strong> modelleri <strong>QUBİT Teknolojisi (En İyi Seviye)</strong> üzerinde çalışır.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161F30] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-display font-bold text-sm">01. Tensor Teknolojisi (Ortalama)</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    WİFO A1 (20sn), WİFO A1+ (16sn) ve yeni WİFO A2- (15sn) modelleri klasik çok boyutlu Tensor matrisleriyle dengeli performans sunar.
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161F30] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-display font-bold text-sm">02. QUBİT Teknolojisi (En İyi)</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    WİFO A2 (10sn), yeni WİFO A2+ (8sn), WİFO A3 Quantum (5sn) ve Q-PU 9000 Series (1sn) süperpozisyon tabanlı QUBİT mimarisiyle en iyi hızı sağlar.
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161F30] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-display font-bold text-sm">03. 6 Karakterli Ses Değiştirme Stüdyosu</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Elif, Barbaros, Q-PU 9000 Sibernetik, Nova, Bilge ve Özel Frekans modlarıyla yanıtları istediğiniz
                    ses kalınlığı ve hızda dinleyin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Sleek, Uncluttered Conversational Canvas */}
            <div
              className={`flex-1 flex flex-col rounded-3xl border overflow-hidden transition-colors duration-500 shadow-sm ${
                isProcessorThemeEnabled
                  ? isDarkMode
                    ? `${activeProcTheme.darkCardBg} ${activeProcTheme.darkBorder}`
                    : `${activeProcTheme.lightCardBg} ${activeProcTheme.lightBorder}`
                  : isDarkMode
                  ? 'bg-[#111622] border-slate-800/80'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Refined Canvas Subheader */}
              <div
                className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 transition-colors duration-500 ${
                  isProcessorThemeEnabled
                    ? isDarkMode
                      ? `${activeProcTheme.darkBorder} ${activeProcTheme.darkSubtleBg}`
                      : `${activeProcTheme.lightBorder} ${activeProcTheme.lightSubtleBg}`
                    : isDarkMode
                    ? 'border-slate-800/80 bg-[#0E131F]'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <BrandLogo size={18} />
                  <span className="font-display font-semibold">{activeSessionTitle}</span>
                  <span className="text-slate-500" aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setMode('a_series')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      isDarkMode
                        ? `${activeProcTheme.darkBadgeBg} ${activeProcTheme.darkBadgeText} ${activeProcTheme.darkBadgeBorder}`
                        : `${activeProcTheme.lightBadgeBg} ${activeProcTheme.lightBadgeText} ${activeProcTheme.lightBadgeBorder}`
                    }`}
                    title="Modeli veya İşlemci Temasını Değiştir"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeProcTheme.swatchClass}`} />
                    <span>{activeProcTheme.shortLabel}</span>
                    <span className="font-mono tabular-nums opacity-90">
                      · {getTargetWriteSeconds(aiLevel)}sn Yazım
                    </span>
                    <span className="font-mono text-[10px] opacity-90">
                      · {activeProcTheme.techQualityLabel}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Ses Karakterini Değiştir"
                  >
                    <AudioWaveform size={12} className="text-cyan-400" />
                    <span>{activeVoicePreset.name.split('·')[0].trim()}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPromoVideoModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    title="Eski Orijinal Tanıtım Videosunu İzle (Tüm Kullanıcılara Açık)"
                  >
                    <Film size={13} />
                    <span>Eski Video (Herkese Açık)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModulationPanel((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      showModulationPanel
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Q-PU 9000 Kuantum Durum Modülasyonu Panelini Aç / Kapat"
                  >
                    <Atom size={13} />
                    <span className="hidden sm:inline">
                      Dolanıklık: {showModulationPanel ? 'Açık' : 'Kapalı'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('analytics')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-200/60'
                    }`}
                    title="Kuantum Analiz ve Telemetri Grafikleri Sekmesine Git"
                  >
                    <BarChart3 size={13} />
                    <span className="hidden sm:inline">Analiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEnergyFlowBar((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      showEnergyFlowBar
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Kuantum Enerji Çubuğunu Aç / Kapat"
                  >
                    <Zap size={13} />
                    <span className="hidden sm:inline">
                      Enerji: {showEnergyFlowBar ? 'Açık' : 'Kapalı'}
                    </span>
                  </button>

                  {speakingId && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      <Square size={11} />
                      <span>Sesi Durdur</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setMode('settings')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Ayarlar Sekmesini Aç"
                  >
                    <Settings size={14} />
                    <span className="hidden sm:inline">Ayarlar</span>
                  </button>
                </div>
              </div>

              {/* Context-Aware Smart Topics Bar (Optional via Settings) */}
              {showSmartTopicsBar && (
                <SmartTopicsBar
                  messages={messages}
                  isDarkMode={isDarkMode}
                  activeSessionTitle={activeSessionTitle}
                  onSelectTopicPrompt={(promptText, titleText) => {
                    setActiveSessionTitle(titleText);
                    submitPrompt(promptText);
                  }}
                  onApplySessionTitle={(titleText) => {
                    setActiveSessionTitle(titleText);
                    triggerNotification(
                      'Akıllı Başlık Uygulandı',
                      `Sohbet oturumu başlığı "${titleText}" olarak güncellendi.`,
                      'chat_history',
                      'info'
                    );
                  }}
                  onDragStartTopic={(topic) => setDraggedTopic(topic)}
                  onDragEndTopic={() => {
                    setDraggedTopic(null);
                    setIsDragOverChat(false);
                    setIsDragOverInput(false);
                  }}
                />
              )}

              {/* User-Interactive Q-PU 9000 Quantum State Modulation Panel inside Chat Window */}
              {showModulationPanel && (
                <QuantumStateModulationPanel
                  isDarkMode={isDarkMode}
                  activeAiLevel={aiLevel}
                  isGenerating={loading || typingStream !== null}
                  telemetry={messages[messages.length - 1]?.quantumTelemetry}
                  onModulationChange={(nextMod) => setQuantumModulation(nextMod)}
                  onOpenPromoVideo={() => setIsPromoVideoModalOpen(true)}
                />
              )}

              {/* Message Stream (Drop Zone for Files, Images, Websites & Smart Topics) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  if (!isDragOverChat) setIsDragOverChat(true);
                }}
                onDragLeave={() => setIsDragOverChat(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverChat(false);

                  // 1. Check if user dropped actual file(s) (image, HTML website, code, document)
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProcessDroppedFile(e.dataTransfer.files[0]);
                    setDraggedTopic(null);
                    return;
                  }

                  // 2. Check if user dropped a Smart Topic chip
                  const rawTopic = e.dataTransfer.getData('application/x-funzone-topic');
                  if (rawTopic) {
                    try {
                      const parsed: SmartTopicItem = JSON.parse(rawTopic);
                      setActiveSessionTitle(parsed.title);
                      submitPrompt(parsed.prompt);
                      setDraggedTopic(null);
                      return;
                    } catch {
                      // Fallback
                    }
                  }

                  // 3. Check if user dropped a web URL / link
                  const droppedUri = e.dataTransfer.getData('text/uri-list');
                  if (droppedUri && droppedUri.trim().startsWith('http')) {
                    handleInspectWebUrl(droppedUri.trim());
                    setDraggedTopic(null);
                    return;
                  }

                  const plain = e.dataTransfer.getData('text/plain');
                  if (plain && plain.trim()) {
                    if (/^https?:\/\/\S+$/i.test(plain.trim())) {
                      handleInspectWebUrl(plain.trim());
                    } else {
                      submitPrompt(plain.trim());
                    }
                  }
                  setDraggedTopic(null);
                }}
                className={`relative flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6 space-y-6 max-h-[580px] min-h-[440px] transition-colors ${
                  isDragOverChat
                    ? isDarkMode
                      ? 'bg-cyan-950/30 ring-2 ring-inset ring-cyan-400'
                      : 'bg-blue-50/80 ring-2 ring-inset ring-blue-500'
                    : ''
                }`}
              >
                {isDragOverChat && !draggedTopic && (
                  <div className="sticky top-2 z-30 p-5 rounded-2xl border-2 border-dashed border-cyan-400 bg-slate-950/90 text-cyan-200 text-center shadow-2xl pointer-events-none">
                    <div className="flex items-center justify-center gap-2 font-display font-bold text-sm text-cyan-300">
                      <Upload size={18} />
                      <span>
                        Dosyayı, Resmi veya Web Sitesini Buraya Bırakın!
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Yapay zeka <strong>"Hemen bakıyorum!"</strong> diyerek sizi bıraktığınız dosyanın/sitenin fiziksel çalışma sahnesine götürecek ve orada yaptıklarını canlı gösterecek.
                    </p>
                  </div>
                )}
                {draggedTopic && (
                  <div
                    className={`sticky top-0 z-20 p-3 rounded-xl border text-center text-xs font-semibold pointer-events-none transition-all ${
                      isDragOverChat
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : isDarkMode
                        ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                        : 'bg-white/90 border-slate-300 text-slate-700'
                    }`}
                  >
                    "{draggedTopic.title}" başlığını buraya bırakarak doğrudan sorabilir veya aşağıdaki mesaj kutusuna bırakıp düzenleyebilirsiniz.
                  </div>
                )}
                {messages.length <= 1 && (
                  <div className="py-5 mb-4 border-b border-slate-500/10 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span className={activeProcTheme.accentText}>{activeProcTheme.shortLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{activeProcTheme.themeName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {aiLevel === 'Q_PU_9000' ? '4096 Qubit' : aiLevel === 'A3_QUANTUM' ? '1024 Qubit' : 'Hibrit Tensör'}
                          </span>
                          {quantumModulation && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-amber-400">
                                Dolanıklık: %{quantumModulation.entanglementDepth.toFixed(2)} ({quantumModulation.phaseAngleDeg}°)
                              </span>
                            </>
                          )}
                        </div>
                        <h1
                          className={`font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance bg-gradient-to-r ${
                            isProcessorThemeEnabled
                              ? activeProcTheme.brandGradient
                              : 'from-cyan-400 via-blue-400 to-violet-400'
                          } bg-clip-text text-transparent`}
                        >
                          Merhaba {currentUser ? currentUser.name : ''}, bugün hangi problemi çözelim?
                        </h1>
                        <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                          Kuantum yazılım mimarisi, 3 boyutlu protein analizi veya ileri mühendislik simülasyonları için doğrudan yazabilir ya da aşağıdaki hızlı çalışma kartlarını seçebilirsiniz.
                        </p>
                      </div>
                    </div>

                    {/* 4 Executive Quick-Launch Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          submitPrompt(
                            'Bana Python ile 1024-Qubit süperpozisyon durum vektörünü simüle eden modüler bir kuantum algoritma mimarisi yazar mısın?'
                          )
                        }
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A0F1A] border-slate-800/90 hover:border-cyan-500/50'
                            : 'bg-slate-50/80 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-[11px] font-mono text-cyan-400 mb-1">
                          01 · Yazılım & Algoritma
                        </div>
                        <div className="font-display font-bold text-xs group-hover:text-cyan-300 transition-colors">
                          Python Kuantum Simülatörü
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          Modüler durum vektörü ve paralel çıkarım kodu üret
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('bioscience')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A0F1A] border-slate-800/90 hover:border-teal-500/50'
                            : 'bg-slate-50/80 border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="text-[11px] font-mono text-teal-400 mb-1">
                          02 · Biyobilim & 3Dmol.js
                        </div>
                        <div className="font-display font-bold text-xs group-hover:text-teal-300 transition-colors">
                          3B Protein & Genom Laboratuvarı
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          AlphaFold DB, RCSB PDB ve UniProtKB yapılarını incele
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('analytics')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A0F1A] border-slate-800/90 hover:border-violet-500/50'
                            : 'bg-slate-50/80 border-slate-200 hover:border-violet-400'
                        }`}
                      >
                        <div className="text-[11px] font-mono text-violet-400 mb-1">
                          03 · Canlı Telemetri
                        </div>
                        <div className="font-display font-bold text-xs group-hover:text-violet-300 transition-colors">
                          Kuantum Analiz & Qubit Grafikleri
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          Q-PU 9000 enerji (qJ) ve gecikme (ms) metriklerini gör
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPromoVideoModalOpen(true)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A0F1A] border-amber-500/40 hover:border-amber-400'
                            : 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
                        }`}
                      >
                        <div className="text-[11px] font-mono text-amber-400 mb-1">
                          04 · Tüm Kullanıcılara Açık
                        </div>
                        <div className="font-display font-bold text-xs group-hover:text-amber-300 transition-colors">
                          Eski Orijinal Video & Q-PU 9000
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          Sinematik tanıtım videosunu ve 20sn-1sn hız düellosunu izle
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const isSpeaking = speakingId === message.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <BrandLogo size={26} />
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] sm:max-w-[78%] ${
                          isUser
                            ? isDarkMode
                              ? 'bg-[#1E293B] text-slate-100 px-5 py-3.5 rounded-3xl rounded-tr-md'
                              : 'bg-slate-200/80 text-slate-900 px-5 py-3.5 rounded-3xl rounded-tr-md'
                            : 'flex-1 min-w-0'
                        }`}
                      >
                        {/* Assistant Metadata Kicker */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                            <span className={`font-display font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {message.botName || 'WİFO A3 QUANTUM'}
                            </span>
                            {message.modelTag && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums text-[11px]">{message.modelTag}</span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[11px]">
                              {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {typingStream?.messageId === message.id ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[11px] text-amber-400 font-semibold">
                                  <Zap size={11} className="animate-pulse" />
                                  <span>
                                    Yazılıyor: {typingStream.elapsedSeconds.toFixed(1)}sn /{' '}
                                    {typingStream.targetSeconds.toFixed(1)}sn
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={skipTypingStream}
                                  className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[10px] font-semibold text-cyan-300 transition-colors cursor-pointer"
                                >
                                  Hemen Tamamla
                                </button>
                              </>
                            ) : message.writeDurationSec ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums text-[11px] text-emerald-400">
                                  ⚡ {message.writeDurationSec}sn yazım hızı
                                </span>
                              </>
                            ) : null}
                          </div>
                        )}

                        {/* Markdown Content */}
                        <div
                          className={`text-[15px] leading-relaxed break-words prose max-w-none ${
                            isDarkMode ? 'prose-invert' : 'prose-slate'
                          } prose-p:leading-relaxed prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800`}
                        >
                          <Markdown>{message.content}</Markdown>
                        </div>

                        {/* Dropped File / Website Interactive Card inside Chat Message */}
                        {message.droppedFile && (
                          <div
                            className={`mt-3 p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDarkMode
                                ? 'bg-slate-900/90 border-cyan-500/40 text-slate-100'
                                : 'bg-cyan-50/70 border-cyan-300 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {message.droppedFile.kind === 'image' && message.droppedFile.dataUrl ? (
                                <img
                                  src={message.droppedFile.dataUrl}
                                  alt={message.droppedFile.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                                  {message.droppedFile.kind === 'website' ? (
                                    <Globe size={20} />
                                  ) : (
                                    <Upload size={20} />
                                  )}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                  {message.droppedFile.name}
                                </div>
                                <div className="text-[11px] text-cyan-400">
                                  {message.droppedFile.physicalSteps?.length || 5} Fiziksel İşlem Noktası Hazır
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveDroppedFile(message.droppedFile || null);
                                setMode('physical_workspace');
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs transition-colors shrink-0 cursor-pointer"
                            >
                              <MousePointerClick size={14} />
                              <span>Fiziksel Sahneye Git & Yaptıklarını Gör</span>
                            </button>
                          </div>
                        )}

                        {/* Quantum Energy Flow Bar beneath assistant messages */}
                        {!isUser && showEnergyFlowBar && (
                          <QuantumEnergyFlowBar
                            message={message}
                            isDarkMode={isDarkMode}
                            isGenerating={
                              regeneratingId === message.id || typingStream?.messageId === message.id
                            }
                            activeAiLevel={aiLevel}
                            onToggleGlobalVisibility={() => setShowEnergyFlowBar(false)}
                          />
                        )}

                        {/* Assistant Action Bar (Like, Dislike, Retry, Voice Read, Change Voice & Copy) */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-500/10">
                            {/* Beğen (Like) */}
                            <button
                              type="button"
                              onClick={() => handleMessageFeedback(message.id, 'like')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                message.feedback === 'like'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isDarkMode
                                  ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                              }`}
                              title="Yanıtı Beğen"
                            >
                              <ThumbsUp size={13} />
                              <span>{message.feedback === 'like' ? 'Beğenildi' : 'Beğen'}</span>
                            </button>

                            {/* Beğenme (Dislike) */}
                            <button
                              type="button"
                              onClick={() => handleMessageFeedback(message.id, 'dislike')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                message.feedback === 'dislike'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : isDarkMode
                                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                              }`}
                              title="Yanıtı Beğenme"
                            >
                              <ThumbsDown size={13} />
                              <span>{message.feedback === 'dislike' ? 'Beğenilmedi' : 'Beğenme'}</span>
                            </button>

                            {/* Yeniden Dene (Retry / Regenerate) */}
                            <button
                              type="button"
                              onClick={() => handleRetryMessage(message.id)}
                              disabled={regeneratingId === message.id || loading}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${
                                regeneratingId === message.id
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : isDarkMode
                                  ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                              }`}
                              title="Yanıtı Yeniden Üret (Yeniden Dene)"
                            >
                              <RotateCcw
                                size={13}
                                className={regeneratingId === message.id ? 'animate-spin' : ''}
                              />
                              <span>
                                {regeneratingId === message.id ? 'Yenileniyor...' : 'Yeniden Dene'}
                              </span>
                            </button>

                            <span className="text-slate-700 mx-0.5 select-none" aria-hidden="true">|</span>

                            {/* Sesli Dinle */}
                            <button
                              type="button"
                              onClick={() => speakText(message.id, message.content)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                isSpeaking
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : isDarkMode
                                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title={isSpeaking ? 'Seslendirmeyi Durdur' : 'Seçili Ses Karakteriyle Dinle'}
                            >
                              <Volume2 size={14} />
                              <span>
                                {isSpeaking
                                  ? 'Seslendiriliyor (Durdur)'
                                  : `Sesli Dinle (${activeVoicePreset.name.split('·')[0].trim()})`}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsVoiceModalOpen(true)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                isDarkMode
                                  ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                              }`}
                              title="Ses Karakterini Değiştir"
                            >
                              <AudioWaveform size={13} />
                              <span>Ses Değiştir</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                isDarkMode
                                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Metni Kopyala"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check size={14} className="text-emerald-400" />
                                  <span className="text-emerald-400">Kopyalandı</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>Kopyala</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-slate-300'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <User size={15} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex flex-col gap-2 max-w-[88%] sm:max-w-[78%]">
                    <div className="flex items-center gap-4">
                      <BrandLogo size={26} className="animate-spin" />
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <RefreshCw size={14} className="animate-spin text-cyan-400" />
                        <span>
                          {aiLevel === 'Q_PU_9000'
                            ? 'Q-PU 9000 Series 4096-Qubit hiper-yanıtı sentezliyor...'
                            : 'WİFO A3 Quantum yanıtı sentezliyor...'}
                        </span>
                      </div>
                    </div>
                    {showEnergyFlowBar && (
                      <div className="pl-10">
                        <QuantumEnergyFlowBar
                          isDarkMode={isDarkMode}
                          isGenerating={true}
                          activeAiLevel={aiLevel}
                          onToggleGlobalVisibility={() => setShowEnergyFlowBar(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Prompt Composer with Voice Input & Voice Changer Shortcut */}
              <div
                className={`p-4 sm:px-6 sm:pb-6 border-t ${
                  isDarkMode ? 'bg-[#0E131F] border-slate-800/80' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                {/* Live Voice Recognition Status Bar */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={`mb-3 px-4 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDarkMode
                          ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mic size={15} className="text-rose-400 shrink-0" />
                        <span className="font-semibold shrink-0">Mikrofon Dinleniyor:</span>
                        <span className="truncate italic text-slate-300">
                          {interimTranscript || 'Lütfen sorunuzu sesli olarak söyleyin...'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={autoSendVoice}
                            onChange={(e) => setAutoSendVoice(e.target.checked)}
                            className="rounded border-slate-600"
                          />
                          <span>Otomatik Gönder</span>
                        </label>
                        <button
                          type="button"
                          onClick={toggleVoiceInput}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-semibold text-[11px]"
                        >
                          Bitir
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Suggestion Chips + Infinite Word Capacity Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    {[
                      'Kuantum işlemcinin mimarisi nedir?',
                      'Kelime sınırı var mı? Uzun ve detaylı analiz yaz',
                      'Kurucun kim?',
                      '10 kişilik hediye kodu ne işe yarar?',
                      'Python ile kuantum simülatörü kodu yaz',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => submitPrompt(preset)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#161F30] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Live Infinite Word Counter Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border font-mono text-[11px] shrink-0 ${
                      isDarkMode
                        ? 'bg-emerald-950/30 border-emerald-500/35 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                    title="Kelime veya karakter sınırı yoktur. İstediğiniz uzunlukta mesaj yazabilir ve sonsuz uzunlukta yanıt alabilirsiniz."
                  >
                    <span className="font-bold text-xs">∞</span>
                    <span>Kelime Sınırı Yok (Sonsuz Yanıt)</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {(interimTranscript ? `${input} ${interimTranscript}` : input)
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length}{' '}
                      kelime
                    </span>
                  </div>
                </div>

                {/* Hidden File Input for Chat Composer */}
                <input
                  ref={chatFileInputRef}
                  type="file"
                  accept="image/*,.html,.htm,.txt,.md,.js,.jsx,.ts,.tsx,.py,.json,.css,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessDroppedFile(f);
                    e.target.value = '';
                  }}
                />

                {/* Rounded Composer Box (Also a Drop Zone for Files, Websites & Smart Topics) */}
                <form
                  onSubmit={handleSendMessage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                    if (!isDragOverInput) setIsDragOverInput(true);
                  }}
                  onDragLeave={() => setIsDragOverInput(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverInput(false);

                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleProcessDroppedFile(e.dataTransfer.files[0]);
                      setDraggedTopic(null);
                      return;
                    }

                    const rawTopic = e.dataTransfer.getData('application/x-funzone-topic');
                    if (rawTopic) {
                      try {
                        const parsed: SmartTopicItem = JSON.parse(rawTopic);
                        setActiveSessionTitle(parsed.title);
                        setInput((prev) => (prev ? `${prev} ${parsed.prompt}` : parsed.prompt));
                        setDraggedTopic(null);
                        textareaRef.current?.focus();
                        return;
                      } catch {
                        // Fallback to text/plain
                      }
                    }

                    const droppedUri = e.dataTransfer.getData('text/uri-list');
                    if (droppedUri && droppedUri.trim().startsWith('http')) {
                      handleInspectWebUrl(droppedUri.trim());
                      setDraggedTopic(null);
                      return;
                    }

                    const plain = e.dataTransfer.getData('text/plain');
                    if (plain) {
                      if (/^https?:\/\/\S+$/i.test(plain.trim())) {
                        handleInspectWebUrl(plain.trim());
                        return;
                      }
                      setInput((prev) => (prev ? `${prev} ${plain}` : plain));
                    }
                    setDraggedTopic(null);
                    textareaRef.current?.focus();
                  }}
                  className={`flex items-center gap-2 p-2 pl-3 rounded-3xl border transition-colors ${
                    isDragOverInput
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/20'
                      : isListening
                      ? 'border-cyan-400 ring-2 ring-cyan-500/20'
                      : isDarkMode
                      ? 'bg-[#161F30] border-slate-800 focus-within:border-slate-600'
                      : 'bg-white border-slate-300 focus-within:border-blue-500 shadow-xs'
                  }`}
                >
                  {/* File / Website Upload & Drop Trigger Button */}
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isDarkMode
                        ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300'
                        : 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800'
                    }`}
                    title="Resim, Web Tabanlı Site (.html) veya Dosya Seç / Sürükle Bırak"
                  >
                    <Upload size={14} />
                    <span className="hidden sm:inline">Dosya / Site Bırak</span>
                  </button>

                  <textarea
                    ref={textareaRef}
                    rows={Math.min(6, Math.max(1, (input.match(/\n/g) || []).length + (input.length > 140 ? 2 : 1)))}
                    value={interimTranscript ? `${input}${input ? ' ' : ''}${interimTranscript}` : input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isDragOverInput
                        ? 'Dosyayı veya Web Sitesini buraya bırakın — Yapay zeka hemen bakıp fiziksel sahneye götürsün...'
                        : isListening
                        ? 'Dinleniyor... Konuşmanız metne dönüştürülüyor (∞ Sınırsız Kelime)'
                        : 'Mesaj yazın veya buraya Resim / Web Sitesi (.html) sürükleyip bırakın...'
                    }
                    className={`flex-1 py-2 text-sm bg-transparent outline-none resize-y max-h-60 ${
                      isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                  />

                  {/* Voice Changer Studio Shortcut Button */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isDarkMode
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Ses Değiştirme Stüdyosu"
                  >
                    <AudioWaveform size={14} />
                    <span>Ses Değiştir</span>
                  </button>

                  {/* Voice Input ('Sesli Giriş') Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-sm'
                        : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                    title="Mikrofonla Sesli Soru Sor (Sesli Giriş)"
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} className="text-cyan-400" />}
                    <span>{isListening ? 'Dinleniyor...' : 'Sesli Giriş'}</span>
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || (!input.trim() && !interimTranscript.trim())}
                    className={`p-2.5 rounded-2xl bg-gradient-to-r ${
                      isProcessorThemeEnabled
                        ? activeProcTheme.buttonGradient
                        : 'from-cyan-500 via-blue-600 to-violet-600'
                    } text-white hover:opacity-95 transition-all duration-300 disabled:opacity-35 shrink-0 cursor-pointer`}
                    title="Gönder"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer
        className={`py-4 border-t text-xs transition-colors ${
          isDarkMode ? 'border-slate-800/80 text-slate-500 bg-[#0B0F17]' : 'border-slate-200 text-slate-500 bg-white'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BrandLogo size={16} />
            <span className="font-display font-semibold text-slate-400">Funzone</span>
            <span aria-hidden="true">·</span>
            <span>WİFO A3 Quantum & Hediye WİFO A2</span>
          </div>
          <div>
            Kurucu & Geliştirici: <strong className="text-slate-300 font-semibold">FE OWNER BATUHAN</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
