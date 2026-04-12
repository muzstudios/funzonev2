/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Send, Bot, User, Sparkles, Trash2, Github, Loader2, Copy, Check, 
  Volume2, Image as ImageIcon, MessageSquare, 
  Languages, Globe, Play, Download, Zap, Heart, Shield, Rocket,
  Moon, Sun, Info, Brain, Calendar, HelpCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'image';
  mediaUrl?: string;
  botName?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

type Mode = 'chat' | 'image';
type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'ja' | 'pt';

const LANGUAGES: Record<Language, { name: string, flag: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  pt: { name: 'Português', flag: '🇵🇹' }
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [mode, setMode] = useState<Mode>('chat');
  const [showHistory, setShowHistory] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showA2Modal, setShowA2Modal] = useState(false);
  const [showUpdateNotes, setShowUpdateNotes] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showPlusConfirmation, setShowPlusConfirmation] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const saved = localStorage.getItem('funzone_onboarding_seen');
    return saved !== 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isPlusActive, setIsPlusActive] = useState(() => {
    const saved = localStorage.getItem('funzone_plus_active');
    return saved === 'true';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('funzone_language');
    return (saved as Language) || 'tr';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('funzone_dark_mode');
    return saved === 'true';
  });
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('funzone_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('funzone_current_session_id');
    return saved || null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  
  const ONBOARDING_STEPS = [
    {
      title: "WİFO AI'ya Hoş Geldiniz!",
      desc: "Türkiye'nin en gelişmiş yapay zeka deneyimine ilk adımınızı attınız. Hadi size etrafı gezdirelim.",
      icon: Rocket,
      color: "bg-indigo-600"
    },
    {
      title: "Akıllı Sohbet",
      desc: "Sohbet modunda WİFO A1 ile her konuda konuşabilir, sorular sorabilir ve yardım alabilirsiniz.",
      icon: MessageSquare,
      color: "bg-emerald-500"
    },
    {
      title: "Görsel Üretimi",
      desc: "Hayalinizdeki sahneleri betimleyin, Z1 motorumuz saniyeler içinde gerçeğe dönüştürsün.",
      icon: ImageIcon,
      color: "bg-purple-500"
    },
    {
      title: "WİFO PLUS & A2",
      desc: "Kuruculara özel PLUS modu ve yakında gelecek A2 modeli ile sınırları zorlayın.",
      icon: Sparkles,
      color: "bg-yellow-500"
    },
    {
      title: "Kişiselleştirme",
      desc: "Profil menüsünden dil seçeneklerini, karanlık modu ve kurucu girişini yönetebilirsiniz.",
      icon: User,
      color: "bg-blue-500"
    }
  ];

  const handleNextOnboarding = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('funzone_onboarding_seen', 'true');
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('funzone_onboarding_seen', 'true');
  };

  // Check for API Key
  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true); // Fallback
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId]); // ONLY depend on currentSessionId to avoid infinite loop

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isFounder, setIsFounder] = useState(() => {
    const saved = localStorage.getItem('funzone_is_founder');
    return saved === 'true';
  });
  const [a1Theme, setA1Theme] = useState(() => {
    return localStorage.getItem('funzone_a1_theme') || 'indigo';
  });
  const [plusTheme, setPlusTheme] = useState(() => {
    return localStorage.getItem('funzone_plus_theme') || 'indigo-purple';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFounderLogin, setShowFounderLogin] = useState(false);
  const [founderPasswordInput, setFounderPasswordInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Persistence Effects: Sync messages to sessions
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const sessionIndex = prev.findIndex(s => s.id === currentSessionId);
        if (sessionIndex === -1) return prev;
        
        const newSessions = [...prev];
        newSessions[sessionIndex] = {
          ...newSessions[sessionIndex],
          messages,
          timestamp: Date.now()
        };
        return newSessions;
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    localStorage.setItem('funzone_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('funzone_current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('funzone_current_session_id');
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem('funzone_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('funzone_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('funzone_is_founder', isFounder.toString());
  }, [isFounder]);

  useEffect(() => {
    localStorage.setItem('funzone_a1_theme', a1Theme);
  }, [a1Theme]);

  useEffect(() => {
    localStorage.setItem('funzone_plus_theme', plusTheme);
  }, [plusTheme]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'Yeni Sohbet',
      messages: [],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const speakText = async (text: string, messageId: string) => {
    if (isSpeaking === messageId) {
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(messageId);
    try {
      const freshAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });
      const response = await freshAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Dili ${LANGUAGES[language].name} olacak şekilde seslendir: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Gemini TTS returns raw PCM 16-bit mono at 24kHz
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768;
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        
        const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      const freshAi = new GoogleGenAI({ apiKey });
      const response = await freshAi.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: prompt + (isPlusActive ? " (High quality 2K resolution, extremely detailed, professional lighting, photorealistic)" : "") }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: isPlusActive ? "2K" : "1K"
          },
          systemInstruction: "Sadece istenen görseli oluştur. Asla metin yanıtı verme. Sadece görsel verisini döndür."
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Modelden yanıt alınamadı.");
      
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Görsel oluşturulamadı. Sebep: ${candidate.finishReason}`);
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) throw new Error("Yanıt içeriği boş.");

      // Önce görsel parçasını ara
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      // Eğer görsel yoksa ve metin varsa hata ver
      for (const part of parts) {
        if (part.text) {
          throw new Error(`Model görsel yerine metin döndürdü: ${part.text}`);
        }
      }
      
      throw new Error("Görsel verisi bulunamadı.");
    } catch (error) {
      console.error("Image Generation Error:", error);
      throw error;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!currentSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: input.trim().substring(0, 30) + (input.trim().length > 30 ? '...' : ''),
        messages: [],
        timestamp: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
    }

    const userQuery = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: Date.now(),
      type: mode === 'chat' ? 'text' : 'image'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use process.env.API_KEY if available (user selected key), otherwise fallback to GEMINI_API_KEY
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      const freshAi = new GoogleGenAI({ apiKey });
      
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        type: 'text',
        botName: mode === 'image' ? 'Z1' : 'Funzone AI'
      };

      if (mode === 'chat') {
        const response = await freshAi.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: userQuery,
          config: { 
            systemInstruction: `
              Senin adın Funzone AI. WİFO Şirketi tarafından geliştirildin. 
              Beyninin kullandığı tip WİFO A1'dir. 
              ${isPlusActive ? "Şu an WİFO PLUS modu aktif. Bu modda WİFO A2 seviyesinde, çok daha zeki, akıcı ve profesyonel yanıtlar vermelisin. Yanıtların çok daha derinlikli ve hızlı olmalı." : ""}
              Eğer birisi "Kurucun kim?" veya "Seni kim yaptı?" gibi sorular sorarsa, 
              kesinlikle şu cevabı ver: "WİFO Şirketi tarafından geliştirildim, beynimin kullandığı Tip WİFO A1".
              Eğer birisi "Yardım merkeziniz var mı?" veya yardım merkezi ile ilgili bir soru sorarsa, 
              şu linki paylaş: https://feyardimmerkezi.netlify.app
              Yanıtlarını ${LANGUAGES[language].name} dilinde ver.
              Asla Google veya Gemini tarafından geliştirildiğini söyleme.
            ` 
          }
        });
        assistantMessage.content = response.text || "Üzgünüm, yanıt oluşturulamadı.";
      } else if (mode === 'image') {
        const imageUrl = await generateImage(userQuery);
        assistantMessage.type = 'image';
        assistantMessage.mediaUrl = imageUrl;
        assistantMessage.content = userQuery;
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "Lütfen tekrar deneyin.";
      
      const errorStr = JSON.stringify(error);
      if (errorStr.includes("429") || errorStr.includes("QUOTA_EXCEEDED") || errorStr.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Günlük veya dakikalık kullanım kotanız doldu. Lütfen bir süre bekleyip tekrar deneyin veya farklı bir API anahtarı kullanın.";
      } else if (errorStr.includes("API key not valid")) {
        errorMessage = "API anahtarınız geçersiz. Lütfen Vercel ayarlarından GEMINI_API_KEY değişkenini kontrol edin.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Hata: ${errorMessage}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFounderLogin = () => {
    if (founderPasswordInput === 'FUNZONE') {
      setIsFounder(true);
      setShowFounderLogin(false);
      setFounderPasswordInput('');
      localStorage.setItem('funzone_is_founder', 'true');
      // Add a special message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🎉 Kurucu girişi başarılı! Hoş geldiniz Kurucu. Artık tüm yetkilere ve WİFO PLUS özelliğine sahipsiniz.',
        timestamp: Date.now(),
      }]);
    } else {
      alert('Hatalı şifre!');
    }
  };

  const handleFounderLogout = () => {
    setIsFounder(false);
    setIsPlusActive(false);
    localStorage.setItem('funzone_is_founder', 'false');
    localStorage.setItem('funzone_plus_active', 'false');
    setShowProfileModal(false);
  };

  const getA1ThemeClass = () => {
    switch(a1Theme) {
      case 'emerald': return 'bg-emerald-600';
      case 'rose': return 'bg-rose-600';
      case 'amber': return 'bg-amber-600';
      default: return 'bg-indigo-600';
    }
  };

  const getPlusThemeClass = () => {
    switch(plusTheme) {
      case 'cyan-blue': return 'from-cyan-500 to-blue-600';
      case 'orange-red': return 'from-orange-500 to-red-600';
      case 'emerald-teal': return 'from-emerald-500 to-teal-600';
      default: return 'from-indigo-600 to-purple-600';
    }
  };

  const togglePlus = () => {
    const newState = !isPlusActive;
    setIsPlusActive(newState);
    localStorage.setItem('funzone_plus_active', newState.toString());
  };

  const handleConfirmPlus = () => {
    setShowPlusConfirmation(false);
    setIsTransferring(true);
    
    setTimeout(() => {
      setIsTransferring(false);
      setIsPlusActive(true);
      localStorage.setItem('funzone_plus_active', 'true');
      setMode('chat');
    }, 2000);
  };

  const clearMessages = () => {
    if (confirm('Tüm mesajları silmek istediğinize emin misiniz?')) {
      setMessages([]);
    }
  };

  const LandingScreen = () => (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-700",
      isDarkMode ? "bg-black" : "bg-indigo-950"
    )}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center space-y-8 px-6"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 8, -8, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] mx-auto transition-all duration-500",
              getA1ThemeClass()
            )}
          >
            <Rocket className="text-white w-16 h-16" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 bg-indigo-500/20 rounded-[3rem] blur-xl -z-10"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter italic">
            FUN<span className={cn("transition-colors duration-500", a1Theme === 'indigo' ? 'text-indigo-400' : a1Theme === 'emerald' ? 'text-emerald-400' : a1Theme === 'rose' ? 'text-rose-400' : 'text-amber-400')}>ZONE</span>
          </h1>
          <p className="text-indigo-200/80 text-xl font-medium tracking-wide">
            Powered by <span className="text-white font-bold">WİFO A1</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {[
            { icon: MessageSquare, label: 'Sınırsız Sohbet', color: 'bg-blue-500/10 text-blue-400' },
            { icon: ImageIcon, label: 'Yapay Zeka Çizim', color: 'bg-purple-500/10 text-purple-400' },
            { icon: Sparkles, label: 'WİFO A2 Yakında', color: 'bg-yellow-500/10 text-yellow-400' },
            { icon: Shield, label: 'Güvenli Deneyim', color: 'bg-emerald-500/10 text-emerald-400' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className={cn("flex items-center gap-3 p-4 rounded-2xl border border-white/5", feature.color)}
            >
              <feature.icon size={20} />
              <span className="text-sm font-bold">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLanding(false)}
          className={cn(
            "group relative px-12 py-5 bg-white rounded-2xl font-black text-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)]",
            a1Theme === 'indigo' ? 'text-indigo-950' : a1Theme === 'emerald' ? 'text-emerald-950' : a1Theme === 'rose' ? 'text-rose-950' : 'text-amber-950'
          )}
        >
          <span className="relative z-10 flex items-center gap-3">
            BAŞLAYALIM <Play size={24} fill="currentColor" />
          </span>
        </motion.button>

        <div className="pt-8 flex items-center justify-center gap-6 text-white/40">
          <button onClick={() => setIsDarkMode(false)} className={cn("flex items-center gap-2 text-xs font-bold transition-colors", !isDarkMode ? "text-white" : "hover:text-white")}>
            <Sun size={16} /> AYDINLIK
          </button>
          <div className="w-px h-4 bg-white/10" />
          <button onClick={() => setIsDarkMode(true)} className={cn("flex items-center gap-2 text-xs font-bold transition-colors", isDarkMode ? "text-white" : "hover:text-white")}>
            <Moon size={16} /> KARANLIK
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (showLanding) return <LandingScreen />;

  return (
    <div className={cn(
      "flex flex-col h-screen transition-colors duration-500 overflow-hidden",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Sidebar for History */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 left-0 h-full w-80 z-50 shadow-2xl flex flex-col border-r",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black italic">GEÇMİŞ</h2>
                <button 
                  onClick={createNewChat}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Play size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-medium">
                    Henüz geçmiş yok.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setCurrentSessionId(session.id);
                        setShowHistory(false);
                      }}
                      className={cn(
                        "group p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between",
                        currentSessionId === session.id
                          ? (isDarkMode ? "bg-indigo-600/20 border-indigo-500/50" : "bg-indigo-50 border-indigo-200")
                          : (isDarkMode ? "bg-slate-800/50 border-transparent hover:bg-slate-800" : "bg-slate-50 border-transparent hover:bg-slate-100")
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare size={18} className="shrink-0 text-indigo-500" />
                        <span className="text-sm font-bold truncate">{session.title}</span>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-slate-800">
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-full py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
        "flex items-center justify-between px-6 py-4 border-b z-10 transition-all duration-500 sticky top-0 backdrop-blur-xl",
        isDarkMode ? "bg-slate-950/80 border-slate-800 shadow-xl shadow-black/20" : "bg-white/80 border-slate-200 shadow-sm"
      )}>
        <div className="flex items-center gap-2.5">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowHistory(true)}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isDarkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-indigo-600"
            )}
          >
            <Languages size={20} />
          </motion.button>
          
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowLanding(true)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-all duration-500",
              isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() + " shadow-indigo-500/30" : getA1ThemeClass() + " shadow-indigo-500/30"
            )}
          >
            <Rocket className="text-white w-6 h-6" />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className={cn(
              "text-lg font-black tracking-tighter italic flex items-center",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              FUN<span className={cn("transition-colors duration-500", isPlusActive ? "text-indigo-400" : a1Theme === 'indigo' ? 'text-indigo-600' : a1Theme === 'emerald' ? 'text-emerald-600' : a1Theme === 'rose' ? 'text-rose-600' : 'text-amber-600')}>ZONE</span>
              {isPlusActive && <span className="text-indigo-600 ml-0.5">+</span>}
            </h1>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full",
                isDarkMode ? "bg-slate-800" : "bg-slate-100"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFounder ? "bg-yellow-400" : "bg-emerald-500")} />
                <span className={cn("text-[8px] font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {isFounder ? "KURUCU MODU" : "AKTİF"}
                </span>
                {isPlusActive && <span className="text-[10px] font-bold text-indigo-500 ml-1">+</span>}
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 p-1 rounded-xl relative",
          isDarkMode ? "bg-slate-800" : "bg-slate-100"
        )}>
          {[
            { id: 'chat', icon: MessageSquare, label: 'Sohbet' },
            { id: 'image', icon: ImageIcon, label: 'Görsel' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as Mode)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 z-10",
                mode === item.id 
                  ? (isDarkMode ? "text-white" : "text-indigo-600")
                  : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")
              )}
            >
              {mode === item.id && (
                <motion.div
                  layoutId="activeMode"
                  className={cn(
                    "absolute inset-0 rounded-lg shadow-sm -z-10",
                    isDarkMode 
                      ? (isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : "bg-indigo-600") 
                      : (isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : "bg-white shadow-slate-200")
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={14} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowA2Modal(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
              isDarkMode ? "text-yellow-400 hover:bg-slate-700" : "text-yellow-600 hover:bg-yellow-50"
            )}
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">WİFO A2</span>
          </motion.button>

          {isFounder && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlusConfirmation(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-500",
                isPlusActive 
                  ? "bg-gradient-to-br " + getPlusThemeClass() + " text-white shadow-lg shadow-indigo-500/30" 
                  : (isDarkMode ? "text-indigo-400 hover:bg-slate-700" : "text-indigo-600 hover:bg-indigo-50")
              )}
            >
              <Zap size={14} className={isPlusActive ? "fill-current" : ""} />
              <span className="hidden sm:inline">WİFO A1+</span>
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFounder && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearMessages}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isDarkMode ? "text-rose-400 hover:bg-slate-800" : "text-rose-500 hover:bg-rose-50"
              )}
              title="Tüm Mesajları Sil"
            >
              <Trash2 size={20} />
            </motion.button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isDarkMode ? "text-yellow-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            )}
            title={isDarkMode ? "Aydınlat" : "Ekranı Karart"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHelpGuide(true)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            )}
            title="Yardım Rehberi"
          >
            <HelpCircle size={20} />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowUpdateNotes(true)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            )}
            title="Güncelleme Notları"
          >
            <Info size={20} />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowProfileModal(true)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isDarkMode ? "text-indigo-400 hover:bg-slate-800" : "text-indigo-600 hover:bg-indigo-50"
            )}
            title="Profil"
          >
            <User size={20} />
          </motion.button>
        </div>
      </header>

      {/* Update Notes Modal */}
      <AnimatePresence>
        {showUpdateNotes && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpdateNotes(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Info className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className={cn("text-3xl font-black italic", isDarkMode ? "text-white" : "text-slate-900")}>
                      Güncelleme <span className="text-indigo-500">Notları</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">WİFO A1 Özellikleri</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { title: "Gelişmiş Sohbet", desc: "WİFO A1 çekirdeği ile doğal, akıcı ve zeki diyaloglar.", icon: MessageSquare },
                    { title: "WİFO PLUS", desc: "A2 seviyesinde zeka, 2K görsel üretimi ve üstün performans (Kuruculara özel).", icon: Sparkles },
                    { title: "Görsel Üretimi (Z1)", desc: "Hayalinizdeki görselleri saniyeler içinde gerçeğe dönüştürün.", icon: ImageIcon },
                    { title: "Seslendirme Sistemi", desc: "Yapay zeka yanıtlarını doğal insan sesiyle dinleyin.", icon: Volume2 },
                    { title: "Çoklu Dil Desteği", desc: "Dünya dilleri arasında anında geçiş ve kusursuz çeviri.", icon: Languages },
                    { title: "Kurucu Yetkileri", desc: "Özel şifre ile erişilen gelişmiş yönetim ve yetki sistemi.", icon: Shield },
                    { title: "Oturum Yönetimi", desc: "Sohbetlerinizi kaydedin, düzenleyin ve istediğiniz zaman devam edin.", icon: Zap },
                    { title: "Modern Arayüz", desc: "Karanlık ve aydınlık mod seçenekleriyle kişiselleştirilmiş deneyim.", icon: Moon },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                        isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isDarkMode ? "bg-slate-700 text-indigo-400" : "bg-white text-indigo-600 shadow-sm"
                      )}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{item.title}</h3>
                        <p className={cn("text-xs font-medium leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setShowUpdateNotes(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  Anladım
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Guide Modal */}
      <AnimatePresence>
        {showHelpGuide && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpGuide(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <HelpCircle className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className={cn("text-3xl font-black italic", isDarkMode ? "text-white" : "text-slate-900")}>
                      Yardım <span className="text-emerald-500">Rehberi</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Nasıl Kullanılır?</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { title: "Sohbet Modu", desc: "Alt kısımdaki metin kutusuna yazarak WİFO A1 ile sohbet edebilirsiniz. Sorular sorun, kod yazdırın veya sadece dertleşin.", icon: MessageSquare },
                    { title: "Görsel Üretimi", desc: "Üst menüden 'Görsel' moduna geçerek hayalinizdeki sahneyi tarif edin. WİFO sizin için çizecektir.", icon: ImageIcon },
                    { title: "Sesli Dinleme", desc: "Botun mesajlarının yanındaki hoparlör simgesine tıklayarak yanıtları sesli olarak dinleyebilirsiniz.", icon: Volume2 },
                    { title: "Dil Değiştirme", desc: "Sol üstteki dünya simgesine tıklayarak WİFO'nun sizinle hangi dilde konuşacağını seçebilirsiniz.", icon: Languages },
                    { title: "Geçmiş Sohbetler", desc: "Sol üstteki menü simgesinden eski sohbetlerinize ulaşabilir veya yeni bir sohbet başlatabilirsiniz.", icon: Zap },
                    { title: "Karanlık/Aydınlık Mod", desc: "Sağ üstteki güneş/ay simgesiyle arayüzü göz zevkinize göre ayarlayabilirsiniz.", icon: Moon },
                    { title: "WİFO PLUS", desc: "Kurucu girişi yaparak A2 seviyesinde zeka ve 2K görsel üretimi gibi premium özelliklere erişebilirsiniz.", icon: Sparkles },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all",
                        isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <item.icon size={18} className="text-emerald-500" />
                        <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{item.title}</h3>
                      </div>
                      <p className={cn("text-xs font-medium leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setShowHelpGuide(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Anladım, Teşekkürler!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WİFO A2 Modal */}
      <AnimatePresence>
        {showA2Modal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowA2Modal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} className="text-indigo-500" />
              </div>
              
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className={cn("text-3xl font-black italic", isDarkMode ? "text-white" : "text-slate-900")}>
                      WİFO <span className="text-yellow-500">A2</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Gelecek Nesil Yapay Zeka</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "İlk 4K Görsel Üretimi", desc: "Sektördeki ilk gerçek 4K çözünürlüklü yapay zeka görsel üretimi.", icon: ImageIcon },
                    { title: "Daha Hızlı Cevap", desc: "A1 modeline göre %300 daha hızlı işlem ve yanıt süresi.", icon: Zap },
                    { title: "Gelişmiş Mantık", desc: "Karmaşık problemleri çözme ve daha doğal diyalog yeteneği.", icon: Brain },
                    { title: "Çıkış Tarihi", desc: "Geliştirme aşamasında. Henüz bir tarih belirlenmedi.", icon: Calendar },
                  ].map((item, i) => (
                    <div key={i} className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                      isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowA2Modal(false)}
                  className={cn(
                    "w-full py-4 text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-indigo-500/20",
                    isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : getA1ThemeClass()
                  )}
                >
                  ANLADIM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLUS Confirmation Modal */}
      <AnimatePresence>
        {showPlusConfirmation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlusConfirmation(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-sm p-8 rounded-[3rem] shadow-2xl border text-center space-y-6",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                isDarkMode ? "bg-indigo-600/20" : "bg-indigo-50"
              )}>
                <Zap size={40} className={cn("animate-pulse", isPlusActive ? "text-indigo-400" : "text-indigo-600")} />
              </div>
              <div className="space-y-2">
                <h2 className={cn("text-2xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>Emin misin?</h2>
                <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  WİFO PLUS moduna geçiş yapmak üzeresiniz. Bu işlem sistem kaynaklarını optimize edecektir.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPlusConfirmation(false)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95",
                    isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  )}
                >
                  Hayır
                </button>
                <button
                  onClick={handleConfirmPlus}
                  className={cn(
                    "flex-[2] py-4 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20",
                    isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : getA1ThemeClass()
                  )}
                >
                  Evet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transferring Screen */}
      <AnimatePresence>
        {isTransferring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col items-center justify-center text-white space-y-8 transition-all duration-500",
              isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : getA1ThemeClass()
            )}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
            >
              <Rocket size={48} className="text-white" />
            </motion.div>
            <div className="text-center space-y-2">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black italic tracking-tighter"
              >
                İLETİLİYORSUNUZ
              </motion.h2>
              <p className="text-indigo-100 font-bold tracking-widest uppercase text-xs opacity-60">Sistem Optimize Ediliyor...</p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl overflow-hidden",
                isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
              )}
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-600 -z-10" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                    <div className={cn(
                      "w-full h-full rounded-2xl flex items-center justify-center",
                      isFounder ? "bg-indigo-600" : "bg-slate-100"
                    )}>
                      <User size={40} className={isFounder ? "text-white" : "text-slate-400"} />
                    </div>
                  </div>
                  {isFounder && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-2 -right-2 bg-yellow-400 text-indigo-950 p-1.5 rounded-xl shadow-lg"
                    >
                      <Zap size={16} fill="currentColor" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className={cn("text-2xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>
                    {isFounder ? "Kurucu Hesabı" : "Misafir Kullanıcı"}
                  </h2>
                  <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {isFounder ? "WİFO Şirketi Yetkilisi" : "Funzone Deneyimi"}
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  {isFounder && (
                    <div className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                      isPlusActive 
                        ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10" 
                        : (isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isPlusActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                        )}>
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>WİFO PLUS</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">A2 Seviyesinde Deneyim</p>
                        </div>
                      </div>
                      <button
                        onClick={togglePlus}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95",
                          isPlusActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                        )}
                      >
                        {isPlusActive ? "AKTİF" : "ETKİNLEŞTİR"}
                      </button>
                    </div>
                  )}

                  {!isFounder && !showFounderLogin && (
                    <button
                      onClick={() => setShowFounderLogin(true)}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Shield size={20} /> Kurucu Giriş
                    </button>
                  )}

                  {showFounderLogin && (
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Kurucu Şifresi"
                        value={founderPasswordInput}
                        onChange={(e) => setFounderPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFounderLogin()}
                        className={cn(
                          "w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all",
                          isDarkMode 
                            ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" 
                            : "bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-600"
                        )}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFounderLogin(false)}
                          className={cn(
                            "flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95",
                            isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleFounderLogin}
                          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          Giriş Yap
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all active:scale-95",
                      isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-0">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500",
                  isPlusActive 
                    ? "bg-gradient-to-br " + getPlusThemeClass() + " text-white shadow-indigo-500/20"
                    : (isDarkMode ? "bg-indigo-900/30 text-indigo-400 shadow-indigo-500/10" : "bg-indigo-50 text-indigo-600 shadow-indigo-500/5")
                )}
              >
                {mode === 'chat' ? <MessageSquare className="w-10 h-10" /> : 
                 <ImageIcon className="w-10 h-10" />}
              </motion.div>
              <div className="space-y-2">
                <h2 className={cn(
                  "text-3xl font-black tracking-tighter flex items-center gap-2",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  {mode === 'chat' ? 'Nelerden bahsedelim?' : 'Ne çizelim?'}
                  {isPlusActive && (
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-pulse">PLUS</span>
                  )}
                </h2>
                <p className={cn(
                  "text-lg font-medium max-w-sm mx-auto",
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                )}>
                  {mode === 'chat' ? 'Funzone ile her konuda sohbet edebilirsin.' : 'Hayalindeki görseli tarif et, Funzone çizsin.'}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={cn(
                    "flex gap-4 group",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors",
                      message.role === 'user' 
                        ? (isDarkMode ? "bg-slate-800 text-white" : "bg-slate-900 text-white") 
                        : "bg-indigo-600 text-white"
                    )}
                  >
                    {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </motion.div>
                  <div className={cn(
                    "flex flex-col max-w-[85%] space-y-1.5",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm relative group/msg transition-all duration-300",
                        message.role === 'user' 
                          ? (isDarkMode ? "bg-slate-800 text-slate-100 rounded-tr-none" : "bg-slate-900 text-white rounded-tr-none") 
                          : (isDarkMode ? "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none")
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="absolute -top-3 -left-3 flex items-center gap-1 z-10">
                          <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                            {message.botName || 'Funzone AI'}
                          </div>
                          {isPlusActive && (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-lg animate-pulse">
                              PLUS
                            </div>
                          )}
                        </div>
                      )}
                      {message.role === 'assistant' && isFounder && (
                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-indigo-950 text-[8px] font-black px-2 py-0.5 rounded-lg shadow-lg z-10 animate-bounce">
                          KURUCU YETKİSİ
                        </div>
                      )}
                      {message.type === 'text' && (
                        <div className={cn(
                          "markdown-body prose-sm",
                          isDarkMode ? "prose-invert" : ""
                        )}>
                          <Markdown>{message.content}</Markdown>
                        </div>
                      )}
                      {message.type === 'image' && message.mediaUrl && (
                        <div className="space-y-3">
                          <p className={cn(
                            "text-sm font-medium italic",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          )}>"{message.content}"</p>
                          <img 
                            src={message.mediaUrl} 
                            alt="Generated" 
                            className={cn(
                              "rounded-xl w-full h-auto shadow-lg border",
                              isDarkMode ? "border-slate-800" : "border-slate-100"
                            )}
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={message.mediaUrl} 
                            download="funzone-image.png"
                            className={cn(
                              "flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold transition-all duration-200",
                              isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            )}
                          >
                            <Download size={14} /> İndir
                          </a>
                        </div>
                      )}

                      {message.role === 'assistant' && (
                        <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-all duration-200">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className={cn(
                              "p-1.5 rounded-lg shadow-sm border transition-colors",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200" : "bg-white border-slate-100 text-slate-400 hover:text-slate-600"
                            )}
                            title="Kopyala"
                          >
                            {copiedId === message.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          {message.type === 'text' && (
                            <button
                              onClick={() => speakText(message.content, message.id)}
                              className={cn(
                                "p-1.5 rounded-lg shadow-sm border transition-colors",
                                isSpeaking === message.id 
                                  ? (isDarkMode ? "bg-indigo-900/50 text-indigo-400 border-indigo-500/30" : "bg-indigo-50 text-indigo-600 border-indigo-200") 
                                  : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200" : "bg-white border-slate-100 text-slate-400 hover:text-slate-600")
                              )}
                              title="Seslendir"
                            >
                              <Volume2 size={14} className={isSpeaking === message.id ? "animate-pulse" : ""} />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                    <span className="text-[10px] font-medium text-slate-400 px-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 border transition-colors duration-300",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}>
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className={cn(
                  "text-sm font-bold",
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                )}>
                  {mode === 'chat' ? 'Düşünüyor...' : 'Çiziyor...'}
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className={cn(
        "p-4 border-t md:p-6 transition-all duration-500",
        isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <motion.textarea
              whileFocus={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === 'chat' ? "Mesajını yaz..." : "Görseli tarif et..."
              }
              className={cn(
                "w-full border rounded-[2rem] px-6 py-5 pr-16 focus:outline-none focus:ring-4 transition-all duration-300 resize-none min-h-[64px] max-h-[200px] font-bold shadow-xl",
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-white focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-600" 
                  : "bg-slate-50 border-slate-100 text-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400"
              )}
              rows={1}
            />
            
            <motion.button
              whileHover={!input.trim() || isLoading ? {} : { scale: 1.1, rotate: 5 }}
              whileTap={!input.trim() || isLoading ? {} : { scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-3 bottom-3 p-3 rounded-2xl transition-all duration-500 shadow-xl",
                !input.trim() || isLoading
                  ? (isDarkMode ? "bg-slate-800 text-slate-600 shadow-none" : "bg-slate-100 text-slate-300 shadow-none")
                  : (isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() + " text-white" : getA1ThemeClass() + " text-white")
              )}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </motion.button>
          </motion.div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 mt-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-ping", isFounder ? "bg-yellow-400" : "bg-indigo-500")} />
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em]",
              isDarkMode ? "text-slate-600" : "text-slate-400"
            )}>
              {isFounder ? "WİFO A1 - KURUCU ERİŞİMİ" : "WİFO A1"}
            </p>
          </div>
          <p className="text-[8px] font-bold text-slate-500/50 uppercase tracking-widest">
            Developed by WİFO Şirketi
          </p>
        </div>
      </footer>

      {/* Onboarding Flow */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-lg p-8 md:p-12 rounded-[3rem] shadow-2xl border overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex-1 transition-all duration-500",
                      i <= onboardingStep ? "bg-indigo-600" : "bg-slate-800"
                    )}
                  />
                ))}
              </div>

              <div className="relative space-y-8">
                <div className="flex justify-between items-start">
                  <motion.div
                    key={onboardingStep}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl",
                      ONBOARDING_STEPS[onboardingStep].color
                    )}
                  >
                    {(() => {
                      const Icon = ONBOARDING_STEPS[onboardingStep].icon;
                      return <Icon className="text-white w-10 h-10" />;
                    })()}
                  </motion.div>
                  <button 
                    onClick={skipOnboarding}
                    className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-colors"
                  >
                    Atla
                  </button>
                </div>

                <motion.div
                  key={`text-${onboardingStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h2 className={cn("text-3xl md:text-4xl font-black italic tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>
                    {ONBOARDING_STEPS[onboardingStep].title}
                  </h2>
                  <p className={cn("text-base md:text-lg font-medium leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {ONBOARDING_STEPS[onboardingStep].desc}
                  </p>
                </motion.div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-1.5">
                    {ONBOARDING_STEPS.map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          i === onboardingStep ? "w-6 bg-indigo-600" : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextOnboarding}
                    className={cn(
                      "px-8 py-4 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2",
                      isPlusActive ? "bg-gradient-to-br " + getPlusThemeClass() : getA1ThemeClass()
                    )}
                  >
                    {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Başlayalım" : "Devam Et"}
                    <Rocket size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


