import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Lock,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  RotateCcw,
  FastForward,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface QPU9000ShowcaseProps {
  isFounder: boolean;
  onUnlockAsFounder: () => void;
  onFinishToStartScreen: () => void;
  onSelectQpuProcessor: () => void;
}

const PROMPT_TEXT =
  'Sorgu: Çok boyutlu kuantum kriptografi matrisini çöz, 4096-Qubit mimari optimizasyon kodunu üret ve gerçek zamanlı simülasyon raporunu derle.';

const A3_RESPONSE_TEXT = `WİFO A3 QUANTUM [64-Qubit NPU] Analizi Başlatıldı...
> Katman 1: Matris ayrıştırma işlemi yürütülüyor...
> Katman 2: Standart süperpozisyon düğümleri hesaplanıyor...
> Uyarı: 64-Qubit bant genişliği sınırına yaklaşıldı.
> Kod bloğu oluşturuluyor:
function optimizeA3Matrix(nodes) {
  return nodes.map(n => n.coherence * 0.994);
}
> Sonuç: Temel optimizasyon tamamlandı ancak tam ölçekli simülasyon için ek işlem süresi gerekiyor.`;

const QPU_RESPONSE_TEXT = `Q-PU 9000 SERIES [4096-Qubit Hyper-Core] — ANINDA ÇÖZÜLDÜ (0.0003ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[✓] 4096-Qubit Hiper-Örgü Senkronizasyonu: %99.9999 Koherans
[✓] Çok Boyutlu Kriptografi Matrisi: Tek Döngüde Kırıldı ve Yeniden Şifrelendi
[✓] Kuantum Çekirdek Kodu (12.8 THz):

class QPU9000HyperEngine {
  readonly qubits = 4096;
  readonly clockSpeed = "12.8 THz";
  executeOmniMatrix(tensorField: Float64Array): QuantumState {
    return TensorCore.entangleAll(tensorField, { zeroLatency: true, fidelity: 1.0 });
  }
}

[✓] SİMÜLASYON RAPORU: A3 Quantum'a kıyasla 32.8x daha yüksek hız, sıfır gecikme, tam otonom kuantum üstünlüğü doğrulandı.`;

export const QPU9000Showcase: React.FC<QPU9000ShowcaseProps> = ({
  isFounder,
  onUnlockAsFounder,
  onFinishToStartScreen,
  onSelectQpuProcessor,
}) => {
  // Stages:
  // 0: Initial Pure White Screen (#FFFFFF) -> Smoothly fades to Pure Black (#000000)
  // 1: Center Statement ("A SERİES Güç ve Hızlılık olarak Güçlenmiyicek ama.. Q-PU Series Herşeyiyle değişicek..")
  // 2: Dual AI Typing Speed Comparison (A3 Quantum vs Q-PU 9000 Series)
  // 3: Grand Finale ("FUNZONE QUANTUM SERİES")
  const [stage, setStage] = useState<'white_entry' | 'quote' | 'duel' | 'finale'>('white_entry');
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Typing states for Stage 2
  const [a3Typed, setA3Typed] = useState('');
  const [qpuTyped, setQpuTyped] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Web Audio API synth refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sequencerIntervalRef = useRef<number | null>(null);

  // Start procedural cinematic synth music
  const startBackgroundMusic = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.22, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Deep ambient pad chord (D minor 9th cyberpunk / quantum vibe)
      const padFreqs = [146.83, 220.0, 261.63, 329.63]; // D3, A3, C4, E4
      padFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const padGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        padGain.gain.setValueAtTime(0.001, ctx.currentTime);
        padGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 2.5);

        osc.connect(padGain);
        padGain.connect(masterGain);
        osc.start();
      });

      // Arpeggiator + Bass pulse sequence
      const arpNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23]; // D4, F4, A4, C5, D5...
      const bassNotes = [73.42, 73.42, 58.27, 65.41]; // D2, D2, Bb1, C2
      let step = 0;

      sequencerIntervalRef.current = window.setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const now = audioCtxRef.current.currentTime;

        // Pluck Arp Note
        const arpOsc = audioCtxRef.current.createOscillator();
        const arpGain = audioCtxRef.current.createGain();
        arpOsc.type = 'sawtooth';
        const noteFreq = arpNotes[step % arpNotes.length];
        arpOsc.frequency.setValueAtTime(noteFreq, now);

        // Lowpass filter for warm synth pluck
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + 0.22);

        arpGain.gain.setValueAtTime(0.09, now);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        arpOsc.connect(filter);
        filter.connect(arpGain);
        arpGain.connect(masterGain);

        arpOsc.start(now);
        arpOsc.stop(now + 0.25);

        // Deep Sub-Bass pulse every 4 steps
        if (step % 4 === 0) {
          const bassOsc = audioCtxRef.current.createOscillator();
          const bassGain = audioCtxRef.current.createGain();
          bassOsc.type = 'sine';
          const bassFreq = bassNotes[Math.floor(step / 4) % bassNotes.length];
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          bassGain.gain.setValueAtTime(0.24, now);
          bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

          bassOsc.connect(bassGain);
          bassGain.connect(masterGain);

          bassOsc.start(now);
          bassOsc.stop(now + 0.9);
        }

        step++;
      }, 240);
    } catch {
      // Ignore audio autoplay errors if browser blocks
    }
  };

  const stopBackgroundMusic = () => {
    if (sequencerIntervalRef.current) {
      clearInterval(sequencerIntervalRef.current);
      sequencerIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(next ? 0 : 0.22, audioCtxRef.current.currentTime);
      }
      return next;
    });
  };

  // Main choreographed timeline when Founder is authenticated
  useEffect(() => {
    if (!isFounder) return;

    setStage('white_entry');
    setIsDarkBg(false);
    setA3Typed('');
    setQpuTyped('');
    setCountdown(null);

    startBackgroundMusic();

    // 1) Start Pure White (#FFFFFF), then smoothly transition to Black (#000000)
    const tDark = window.setTimeout(() => {
      setIsDarkBg(true);
    }, 350);

    // 2) Show the Quote in the center of the screen
    const tQuote = window.setTimeout(() => {
      setStage('quote');
    }, 1800);

    // 3) Transition to the 2 AI Chats Typing Speed Duel
    const tDuel = window.setTimeout(() => {
      setStage('duel');
    }, 7600);

    // 4) Transition to "FUNZONE QUANTUM SERİES" Finale
    const tFinale = window.setTimeout(() => {
      setStage('finale');
      setCountdown(4);
    }, 17500);

    // 5) Automatically return to Start Screen ("Başlama Yerine geri atıcak")
    const tFinish = window.setTimeout(() => {
      stopBackgroundMusic();
      onSelectQpuProcessor();
      onFinishToStartScreen();
    }, 22000);

    return () => {
      clearTimeout(tDark);
      clearTimeout(tQuote);
      clearTimeout(tDuel);
      clearTimeout(tFinale);
      clearTimeout(tFinish);
      stopBackgroundMusic();
    };
  }, [isFounder]);

  // Typing animation for Stage 2 ('duel')
  useEffect(() => {
    if (stage !== 'duel') return;

    setA3Typed('');
    setQpuTyped('');

    // Q-PU 9000 types hyper-fast (18 chars per 16ms -> finishes in ~0.8 seconds!)
    let qpuIndex = 0;
    const qpuInterval = window.setInterval(() => {
      qpuIndex += 18;
      if (qpuIndex >= QPU_RESPONSE_TEXT.length) {
        setQpuTyped(QPU_RESPONSE_TEXT);
        clearInterval(qpuInterval);
      } else {
        setQpuTyped(QPU_RESPONSE_TEXT.slice(0, qpuIndex));
      }
    }, 18);

    // A3 Quantum types at standard human-readable AI speed (2 chars per 45ms -> takes ~8.5 seconds)
    let a3Index = 0;
    const a3Interval = window.setInterval(() => {
      a3Index += 2;
      if (a3Index >= A3_RESPONSE_TEXT.length) {
        setA3Typed(A3_RESPONSE_TEXT);
        clearInterval(a3Interval);
      } else {
        setA3Typed(A3_RESPONSE_TEXT.slice(0, a3Index));
      }
    }, 45);

    return () => {
      clearInterval(qpuInterval);
      clearInterval(a3Interval);
    };
  }, [stage]);

  // Countdown tick during Finale stage
  useEffect(() => {
    if (stage !== 'finale' || countdown === null) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev && prev > 1 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, countdown]);

  // Founder-only Lock Gate if current user is not Founder
  if (!isFounder) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-12 bg-slate-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full rounded-3xl p-8 bg-slate-900/90 border border-amber-500/30 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5" />
            SADECE KURUCU ERİŞİMİ (FOUNDER ONLY)
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Q-PU 9000 Series Gizli İnceleme Alanı
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Bu yeni nesil kuantum işlemciye ve sinematik hız karşılaştırmasına yalnızca kurucu{' '}
            <span className="text-amber-300 font-semibold">FE OWNER BATUHAN</span> erişebilir.
          </p>

          <button
            onClick={onUnlockAsFounder}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Kurucu Olarak Giriş Yap (FE OWNER BATUHAN) ve Başlat</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex-1 overflow-y-auto flex flex-col justify-between transition-colors duration-[2200ms] ease-in-out select-none ${
        isDarkBg ? 'bg-black text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Subtle Ambient Quantum Glow in Black Mode */}
      {isDarkBg && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-amber-500/10 blur-[150px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-rose-500/10 blur-[130px]" />
        </div>
      )}

      {/* Top Control Bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase">
            <Crown className="w-3.5 h-3.5" />
            Q-PU 9000 SERIES • KURUCU İNCELEMESİ
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Arka Plan Müziği Aktif
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Sesi Aç' : 'Şarkı Çalıyor'}</span>
          </button>

          {stage !== 'finale' && (
            <button
              onClick={() => {
                setStage('finale');
                setCountdown(3);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Finale Geç</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {/* STAGE 0: White to Black smooth transition */}
          {stage === 'white_entry' && (
            <motion.div
              key="white_entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="text-xs font-mono uppercase tracking-[0.4em] opacity-60">
                Q-PU 9000 SERIES • KUANTUM GEÇİŞİ BAŞLATILIYOR
              </div>
            </motion.div>
          )}

          {/* STAGE 1: Center Quote */}
          {stage === 'quote' && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -16 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="max-w-4xl mx-auto text-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                YENİ ÇAĞ MANİFESTOSU
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
                &ldquo;A SERİES Güç ve Hızlılık olarak Güçlenmiyicek ama.. Q-PU Series Herşeyiyle değişicek..&rdquo;
              </h1>
            </motion.div>
          )}

          {/* STAGE 2: 2 AI Chats Typing Speed Comparison (A3 Quantum vs Q-PU 9000) */}
          {stage === 'duel' && (
            <motion.div
              key="duel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="text-center mb-6">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
                  CANLI YAZIŞMA HIZI KARŞILAŞTIRMASI
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  WİFO A3 QUANTUM vs Q-PU 9000 SERIES
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl mx-auto">
                  {PROMPT_TEXT}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: WİFO A3 QUANTUM */}
                <div className="rounded-3xl bg-slate-900/90 border border-purple-500/30 p-6 flex flex-col h-[360px] shadow-xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">WİFO A3 QUANTUM</div>
                        <div className="text-[11px] text-purple-300 font-mono">64-Qubit • Standart Kuantum Hızı</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-purple-300 tabular-nums">42 Tok/sn</div>
                      <div className="text-[10px] text-slate-400">
                        {a3Typed.length < A3_RESPONSE_TEXT.length ? 'Yazıyor...' : 'Tamamlandı'}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-purple-500 transition-all duration-100"
                      style={{ width: `${Math.min(100, (a3Typed.length / A3_RESPONSE_TEXT.length) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {a3Typed}
                    {a3Typed.length < A3_RESPONSE_TEXT.length && (
                      <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />
                    )}
                  </pre>
                </div>

                {/* Right Card: Q-PU 9000 SERIES */}
                <div className="rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-950 border-2 border-amber-400/60 p-6 flex flex-col h-[360px] shadow-2xl shadow-amber-500/10 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-md">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                          <span>Q-PU 9000 SERIES</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40">
                            32.8x DAHA HIZLI
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-200/80 font-mono">4096-Qubit • 12.8 THz Hiper-Çekirdek</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-400 tabular-nums">1,480 Tok/sn</div>
                      <div className="text-[10px] text-emerald-300 flex items-center justify-end gap-1">
                        {qpuTyped.length >= QPU_RESPONSE_TEXT.length ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>0.8 Saniyede Bitti!</span>
                          </>
                        ) : (
                          <span>Hiper-Yazım...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, (qpuTyped.length / QPU_RESPONSE_TEXT.length) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-xs text-amber-100 whitespace-pre-wrap leading-relaxed">
                    {qpuTyped}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Finale ("FUNZONE QUANTUM SERİES") */}
          {stage === 'finale' && (
            <motion.div
              key="finale"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono uppercase tracking-[0.25em] mb-6">
                <Crown className="w-4 h-4" />
                KURUCU ÖZEL LANSMANI TAMAMLANDI
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-300 via-white to-rose-400 bg-clip-text text-transparent mb-6 drop-shadow-[0_0_35px_rgba(251,191,36,0.35)]">
                FUNZONE QUANTUM SERİES
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
                Q-PU 9000 Series işlemcisi kurucu hesabınız için aktif edildi. Başlama yerine yönlendiriliyorsunuz...
                {countdown !== null && (
                  <span className="ml-2 font-mono font-bold text-amber-400 tabular-nums">({countdown}s)</span>
                )}
              </p>

              <button
                onClick={() => {
                  stopBackgroundMusic();
                  onSelectQpuProcessor();
                  onFinishToStartScreen();
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Hemen Başlama Yerine Dön</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Timeline Indicator */}
      <div className="relative z-20 px-6 py-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className={stage === 'white_entry' ? 'text-amber-400 font-bold' : ''}>1. Beyazdan Siyaha Geçiş</span>
          <span>→</span>
          <span className={stage === 'quote' ? 'text-amber-400 font-bold' : ''}>2. Q-PU Manifestosu</span>
          <span>→</span>
          <span className={stage === 'duel' ? 'text-amber-400 font-bold' : ''}>3. A3 vs Q-PU 9000 Yazış Hızı</span>
          <span>→</span>
          <span className={stage === 'finale' ? 'text-amber-400 font-bold' : ''}>4. FUNZONE QUANTUM SERİES</span>
        </div>
      </div>
    </div>
  );
};
