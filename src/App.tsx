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
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  AILevel,
  AppMode,
  AppNotification,
  Message,
  NotificationCategory,
  NotificationPreferences,
  NotificationSeverity,
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
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `Merhaba, ben **WİFO A3 QUANTUM**. WİFO Şirketi tarafından (**Kurucu: FE OWNER BATUHAN**) geliştirilen yeni nesil **Q-PU 9000 Kuantum Nöral İşlemci** mimarisiyle çalışıyorum.\n\n- **10 Kişilik Hediye Kodu (\`QUANTUM-10\`):** WİFO A3 QUANTUM'u tam kapasite açar ve **WİFO A2** modelini ücretsiz hediye olarak hesabınıza tanımlar.\n- **Ses Değiştirme Stüdyosu & Sesli Giriş:** Üst araç çubuğundaki **Ses Değiştirici** ile 6 farklı ses karakterinden (Elif, Barbaros, Q-PU 9000 Sibernetik, Nova, Bilge) dilediğinizi seçebilir, **Sesli Giriş** ile mikrofondan soru sorabilirsiniz.`,
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
  const [showProcessorPanel, setShowProcessorPanel] = useState(false);
  const [showEnergyFlowBar, setShowEnergyFlowBar] = useState<boolean>(() => {
    return localStorage.getItem('funzone_energy_bar_enabled') !== 'false';
  });
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>(() => {
    return localStorage.getItem('funzone_session_title') || 'Kuantum Genel Oturumu';
  });
  const [draggedTopic, setDraggedTopic] = useState<SmartTopicItem | null>(null);
  const [isDragOverChat, setIsDragOverChat] = useState(false);
  const [isDragOverInput, setIsDragOverInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const submitPrompt = useCallback(
    async (promptText: string) => {
      const cleanInput = promptText.trim();
      if (!cleanInput || loading) return;

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

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanInput,
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            aiLevel,
            isFounder: currentUser?.role === 'founder',
            isGiftClaimed: isA3Unlocked,
          }),
        });

        const data = await response.json();

        if (response.ok && data.reply) {
          const botName =
            aiLevel === 'Q_PU_9000'
              ? 'Q-PU 9000 SERIES (Kurucu Özel)'
              : aiLevel === 'A3_QUANTUM'
              ? 'WİFO A3 QUANTUM'
              : aiLevel === 'A2'
              ? 'WİFO A2 (Hediye)'
              : aiLevel === 'A1+'
              ? 'WİFO A1+'
              : 'WİFO A1';

          const assistantMessage: Message = {
            id: 'res-' + Date.now(),
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
            botName,
            modelTag: data.quantumTelemetry?.processorName || 'Q-PU 9000',
            quantumTelemetry: data.quantumTelemetry,
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (voiceSettings.autoSpeak) {
            speakText(assistantMessage.id, data.reply, true);
          }

          if (data.quantumTelemetry?.usedFallback) {
            triggerNotification(
              'Kuantum Rezerv Çekirdeği Devrede',
              'Yanıtınız kesintisiz olarak WİFO Q-PU 9000 yerel kuantum motoruyla üretildi.',
              'system',
              'info'
            );
          }
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
    [aiLevel, currentUser?.role, isA3Unlocked, loading, messages, speakText, triggerNotification, voiceSettings.autoSpeak]
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitPrompt(input);
  };

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
        .slice(-6)
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
            ? 'Q-PU 9000 SERIES (Kurucu Özel)'
            : aiLevel === 'A3_QUANTUM'
            ? 'WİFO A3 QUANTUM'
            : aiLevel === 'A2'
            ? 'WİFO A2 (Hediye)'
            : aiLevel === 'A1+'
            ? 'WİFO A1+'
            : 'WİFO A1';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.reply,
                  timestamp: Date.now(),
                  botName,
                  modelTag: data.quantumTelemetry?.processorName || 'Q-PU 9000',
                  quantumTelemetry: data.quantumTelemetry,
                  feedback: null,
                }
              : m
          )
        );

        if (voiceSettings.autoSpeak) {
          speakText(assistantMsgId, data.reply, true);
        }
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
        content: `**Sohbet Geçmişi Temizlendi.**\n\nWİFO A3 QUANTUM ve hediye WİFO A2 yeni oturum için hazır. Sesli veya yazılı olarak sorunuzu iletebilirsiniz.`,
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
          ? 'Q-PU 9000 SERIES (4096 Qubit Kurucu Çekirdeği)'
          : level === 'A3_QUANTUM'
          ? 'WİFO A3 QUANTUM (1024 Qubit Q-PU 9000)'
          : level === 'A2'
          ? 'WİFO A2 (VIP Hediye Modeli)'
          : `WİFO ${level}`;
      triggerNotification(
        'Yapay Zeka Modeli Değiştirildi',
        `Aktif işlemci çekirdeği ${label} olarak güncellendi.`,
        'model_switch',
        'info'
      );
    }
  };

  const activeVoicePreset =
    VOICE_PROFILES.find((p) => p.id === voiceSettings.profileId) || VOICE_PROFILES[0];
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

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
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Real-time Toast Notification Stack */}
      <NotificationToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onOpenSettings={() => setIsNotificationModalOpen(true)}
        isDarkMode={isDarkMode}
      />

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
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
          isDarkMode ? 'bg-[#0B0F17]/90 border-slate-800/80' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title with new Hexagonal Quantum Infinity Emblem */}
          <button
            type="button"
            onClick={() => setMode('chat')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none"
          >
            <BrandLogo size={30} animated />
            <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Funzone
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                mode === 'chat'
                  ? isDarkMode
                    ? 'border-cyan-400 text-white'
                    : 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Kuantum Sohbet
            </button>
            <button
              type="button"
              onClick={() => setMode('bioscience')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                mode === 'bioscience'
                  ? 'border-teal-400 text-teal-300 font-semibold'
                  : 'border-transparent text-teal-400/90 hover:text-teal-300'
              }`}
            >
              <Dna size={14} className="text-teal-400" />
              <span>Biyobilim Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('a_series')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                mode === 'a_series'
                  ? isDarkMode
                    ? 'border-cyan-400 text-white font-semibold'
                    : 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              A Series
            </button>
            <button
              type="button"
              onClick={() => setMode('qpu_9000')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                mode === 'qpu_9000'
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Crown size={14} className="text-amber-400" />
              <span>Q-PU 9000 Series</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Ses Değiştirici
            </button>
            <button
              type="button"
              onClick={() => setMode('image')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                mode === 'image'
                  ? isDarkMode
                    ? 'border-cyan-400 text-white'
                    : 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Görsel Stüdyosu
            </button>
            <button
              type="button"
              onClick={() => setMode('processor')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                mode === 'processor'
                  ? isDarkMode
                    ? 'border-cyan-400 text-white'
                    : 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              İşlemci Mimarisi
            </button>
            <button
              type="button"
              onClick={() => setShowStartScreen(true)}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Başla Yeri
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsGiftModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 shadow-sm"
            >
              <Gift size={14} />
              <span>10 Kişilik Hediye Kodu</span>
              <span className="font-mono tabular-nums">· {giftRemaining}/10</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Contextual Workspace Toolbar (User Account, Voice Changer, Auto-Speech, Notifications, Theme) */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#111622] border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          {/* Left: User Account Button & Active Model */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold transition-colors whitespace-nowrap shrink-0 ${
                currentUser?.role === 'founder'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : isDarkMode
                  ? 'bg-[#161F30] border-slate-700 text-slate-200 hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              title="Hesap ve Giriş Ayarları"
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
              onClick={() => setShowStartScreen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-colors whitespace-nowrap shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Başla Yeri (Karşılama Ekranı)"
            >
              <Compass size={13} className="text-cyan-400" />
              <span>Başla Yeri</span>
            </button>

            <span className="hidden sm:inline text-slate-600" aria-hidden="true">·</span>
            <span className="hidden sm:inline font-display font-bold">
              {aiLevel === 'Q_PU_9000'
                ? 'Q-PU 9000 Series (Kurucu)'
                : aiLevel === 'A3_QUANTUM'
                ? 'WİFO A3 Quantum'
                : aiLevel === 'A2'
                ? 'WİFO A2 (Hediye)'
                : `WİFO ${aiLevel}`}
            </span>

            {/* Quick Mobile/Desktop Pills for Bioscience, A Series & Q-PU 9000 Series */}
            <button
              type="button"
              onClick={() => setMode('bioscience')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'bioscience'
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                  : isDarkMode
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                  : 'bg-teal-50 border-teal-200 text-teal-800'
              }`}
            >
              <Dna size={13} className="text-teal-400" />
              <span>Biyobilim (3B Protein & Genom)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('a_series')}
              className={`px-2.5 py-1.5 rounded-xl border font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'a_series'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              A Series Güç Farkı
            </button>

            <button
              type="button"
              onClick={() => setMode('qpu_9000')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'qpu_9000'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Crown size={12} className="text-amber-400" />
              <span>Q-PU 9000 Series (İncele)</span>
            </button>
          </div>

          {/* Right: Voice Changer Studio, Auto-Speak, Notifications, Telemetry & Theme */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Voice Changer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                isDarkMode
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                  : 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100'
              }`}
              title="Ses Değiştirme Sistemi (Ses Karakteri, Kalınlık & Hız)"
            >
              <AudioWaveform size={14} />
              <span>Ses: {activeVoicePreset.name.split('·')[0].trim()}</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                ({voiceSettings.pitch.toFixed(2)}x)
              </span>
            </button>

            {/* Auto-Speak Response Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !voiceSettings.autoSpeak;
                setVoiceSettings({ ...voiceSettings, autoSpeak: next });
                if (!next) stopSpeaking();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                voiceSettings.autoSpeak
                  ? isDarkMode
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="Gelen yanıtları otomatik seslendir"
            >
              {voiceSettings.autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden md:inline">
                Otomatik Ses: {voiceSettings.autoSpeak ? 'Açık' : 'Kapalı'}
              </span>
            </button>

            {/* Toggle Quantum Energy Flow Bar (Qubit Energy Visualizer) */}
            <button
              type="button"
              onClick={() => setShowEnergyFlowBar((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showEnergyFlowBar
                  ? isDarkMode
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="Mesajların altındaki Qubit Kuantum Enerji Çubuğunu Aç / Kapat"
            >
              <Zap size={13} className={showEnergyFlowBar ? 'text-emerald-400' : 'text-slate-500'} />
              <span>Enerji Çubuğu: {showEnergyFlowBar ? 'Açık' : 'Kapalı'}</span>
            </button>

            {/* Toggle Quantum Telemetry HUD */}
            <button
              type="button"
              onClick={() => setShowProcessorPanel(!showProcessorPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                showProcessorPanel
                  ? isDarkMode
                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                    : 'bg-violet-50 border-violet-300 text-violet-700'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Sliders size={13} />
              <span className="hidden sm:inline">Telemetri</span>
            </button>

            {/* Notification Settings Quick Access */}
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Bildirim Ayarları"
            >
              <Bell size={13} className={notificationPrefs.enabled ? 'text-cyan-400' : 'text-slate-500'} />
              <span className="hidden sm:inline">Bildirimler</span>
              {unreadNotificationCount > 0 && (
                <span className="font-mono tabular-nums text-[11px] text-cyan-400">
                  ({unreadNotificationCount})
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-colors shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Temayı Değiştir"
            >
              {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Collapsible Quantum Processor Telemetry HUD */}
        <AnimatePresence>
          {showProcessorPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Mode Viewports */}
        {mode === 'bioscience' ? (
          <BioscienceWorkbench
            isDarkMode={isDarkMode}
            onAskQuantumAssistant={(promptText, sessionTitle) => {
              setActiveSessionTitle(sessionTitle);
              setMode('chat');
              submitPrompt(promptText);
            }}
          />
        ) : mode === 'a_series' ? (
          <ASeriesComparisonView
            isDarkMode={isDarkMode}
            isA3Unlocked={isA3Unlocked}
            isFounder={currentUser?.role === 'founder'}
            onSelectModelAndChat={(lvl) => {
              handleSelectModel(lvl);
              setMode('chat');
            }}
            onOpenGiftModal={() => setIsGiftModalOpen(true)}
            onOpenQpu9000Tab={() => setMode('qpu_9000')}
            onOpenFounderLogin={() => setIsAuthModalOpen(true)}
          />
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
                  WİFO Q-PU 9000 Kuantum İşlemci & Hediye A2 Mimarisi
                </h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl mb-6">
                Yeni nesil WİFO A3 QUANTUM modeli, klasik yapay zeka tensörlerinden farklı olarak 1024 Qubitlik
                süperpozisyon tabanlı kuantum simülasyon çekirdekleri üzerinde çalışır ve 10 kişilik hediye koduyla
                WİFO A2 modelini ücretsiz olarak armağan eder.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161F30] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-display font-bold text-sm">01. Paralel Kuantum Çıkarım</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    1024 süperpozisyon dalgası aynı anda değerlendirilir, ileri seviye yazılım mimarisi ve matematiksel
                    analiz hızı maksimuma çıkarılır.
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161F30] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-display font-bold text-sm">02. Hediye WİFO A2 Entegrasyonu</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A3 Quantum aktivasyonu, doğrudan bağımsız WİFO A2 VIP zeka kanalını kullanıcıya ücretsiz hediye
                    olarak tanımlar.
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
          <div className="flex-1 flex flex-col gap-5">
            {/* Clean Model Selector Grid */}
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

            {/* Conversational Canvas */}
            <div
              className={`flex-1 flex flex-col rounded-2xl border overflow-hidden ${
                isDarkMode ? 'bg-[#111622] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              {/* Subtle Canvas Subheader */}
              <div
                className={`px-5 py-3.5 border-b flex items-center justify-between gap-4 ${
                  isDarkMode ? 'border-slate-800/80 bg-[#0E131F]' : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <BrandLogo size={18} />
                  <span className="font-display font-semibold">
                    {activeSessionTitle}
                  </span>
                  <span className="text-slate-500" aria-hidden="true">·</span>
                  <span className="text-slate-400">
                    {aiLevel === 'Q_PU_9000'
                      ? 'Q-PU 9000 Series (Kurucu)'
                      : aiLevel === 'A3_QUANTUM'
                      ? 'WİFO A3 Quantum'
                      : aiLevel === 'A2'
                      ? 'WİFO A2 (Hediye)'
                      : `WİFO ${aiLevel}`}
                  </span>
                  <span className="text-slate-500" aria-hidden="true">·</span>
                  <span className="text-slate-400">
                    Ses: <strong className="text-cyan-400">{activeVoicePreset.name.split('·')[0].trim()}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
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
                      Qubit Enerji: {showEnergyFlowBar ? 'Açık' : 'Kapalı'}
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
                    onClick={exportChatHistory}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Sohbet Geçmişini İndir"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Geçmişi İndir</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearChatHistory}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-slate-200/60'
                    }`}
                    title="Sohbet Geçmişini Sıfırla"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Temizle</span>
                  </button>
                </div>
              </div>

              {/* Context-Aware Smart Topics Bar (Drag-and-Drop or 1-Click) */}
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

              {/* Message Stream (Also a Drop Zone for Smart Topics) */}
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
                  const rawTopic = e.dataTransfer.getData('application/x-funzone-topic');
                  if (rawTopic) {
                    try {
                      const parsed: SmartTopicItem = JSON.parse(rawTopic);
                      setActiveSessionTitle(parsed.title);
                      submitPrompt(parsed.prompt);
                      setDraggedTopic(null);
                      return;
                    } catch {
                      // Fallback to plain text
                    }
                  }
                  const plain = e.dataTransfer.getData('text/plain');
                  if (plain && plain.trim()) {
                    submitPrompt(plain.trim());
                  }
                  setDraggedTopic(null);
                }}
                className={`relative flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6 space-y-6 max-h-[540px] min-h-[420px] transition-colors ${
                  isDragOverChat
                    ? isDarkMode
                      ? 'bg-cyan-950/25 ring-2 ring-inset ring-cyan-400/50'
                      : 'bg-blue-50/70 ring-2 ring-inset ring-blue-400/50'
                    : ''
                }`}
              >
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
                  <div className="py-4 mb-2 border-b border-slate-500/10">
                    <div className="flex items-center gap-3 mb-2">
                      <BrandLogo size={36} />
                      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                        Merhaba {currentUser ? currentUser.name : ''}, nasıl yardımcı olabilirim?
                      </h1>
                    </div>
                    <p className="text-sm text-slate-400 max-w-2xl">
                      Ses Değiştirici ile asistanın ses karakterini değiştirebilir, mikrofona dokunarak sesli soru sorabilir veya 10 kişilik hediye kodunu kullanabilirsiniz.
                    </p>
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

                        {/* Quantum Energy Flow Bar beneath assistant messages */}
                        {!isUser && showEnergyFlowBar && (
                          <QuantumEnergyFlowBar
                            message={message}
                            isDarkMode={isDarkMode}
                            isGenerating={regeneratingId === message.id}
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

              {/* Quantum Analytics Panel (recharts Telemetry Visualization) beneath message history */}
              <QuantumAnalyticsPanel
                messages={messages}
                isDarkMode={isDarkMode}
                activeAiLevel={aiLevel}
              />

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

                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar text-xs">
                  {[
                    'Kuantum işlemcinin mimarisi nedir?',
                    'Kurucun kim?',
                    '10 kişilik hediye kodu ne işe yarar?',
                    'Python ile kuantum simülatörü kodu yaz',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => submitPrompt(preset)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl border transition-colors shrink-0 ${
                        isDarkMode
                          ? 'bg-[#161F30] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Rounded Composer Box (Also a Drop Zone for Smart Topics) */}
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
                    const plain = e.dataTransfer.getData('text/plain');
                    if (plain) {
                      setInput((prev) => (prev ? `${prev} ${plain}` : plain));
                    }
                    setDraggedTopic(null);
                    textareaRef.current?.focus();
                  }}
                  className={`flex items-center gap-2 p-2 pl-4 rounded-3xl border transition-colors ${
                    isDragOverInput
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/20'
                      : isListening
                      ? 'border-cyan-400 ring-2 ring-cyan-500/20'
                      : isDarkMode
                      ? 'bg-[#161F30] border-slate-800 focus-within:border-slate-600'
                      : 'bg-white border-slate-300 focus-within:border-blue-500 shadow-xs'
                  }`}
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
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
                        ? 'Akıllı başlığı buraya bırakarak mesaj kutusuna ekleyin...'
                        : isListening
                        ? 'Dinleniyor... Konuşmanız metne dönüştürülüyor'
                        : 'WİFO A3 Quantum’a bir soru sorun, Sesli Giriş başlatın veya Akıllı Başlık sürükleyin...'
                    }
                    className={`flex-1 py-2 text-sm bg-transparent outline-none resize-none ${
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
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white hover:opacity-95 transition-opacity disabled:opacity-35 shrink-0"
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
