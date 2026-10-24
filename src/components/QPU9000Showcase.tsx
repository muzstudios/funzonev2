import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  RotateCcw,
  FastForward,
  Cpu,
  CheckCircle2,
  Timer,
  Play,
  Film,
  Globe,
  Atom,
  X,
} from 'lucide-react';

interface QPU9000ShowcaseProps {
  isFounder: boolean;
  onUnlockAsFounder: () => void;
  onFinishToStartScreen: () => void;
  onSelectQpuProcessor: () => void;
  onCloseModal?: () => void;
}

type VideoStage = 'white_entry' | 'quote' | 'architecture' | 'duel' | 'finale';

const PROMPT_TEXT =
  'Sorgu: Çok boyutlu kuantum kriptografi matrisini çöz, 4096-QUBİT mimari optimizasyon kodunu üret ve gerçek zamanlı simülasyon raporunu derle.';

const A2_RESPONSE_TEXT = `WİFO A2 VIP [512-QUBİT · En İyi Teknoloji] — 10 Saniye Kalibre Akış
> Katman 1: Çok boyutlu QUBİT kriptografi düğümleri taranıyor...
> Katman 2: QUBİT blokları senkronize ediliyor (%98.60 Koherans)...
> Katman 3: Optimizasyon fonksiyonu:
function optimizeA2Qubit(matrix) {
  return matrix.map(cell => cell.flux * 0.986);
}
> Sonuç: WİFO A2 VIP (QUBİT) analizi tam 10.0 saniyede tamamlandı.`;

const A2_PLUS_RESPONSE_TEXT = `WİFO A2+ [768-QUBİT · En İyi Teknoloji] — 8 Saniye Turbo QUBİT Akış
> Katman 1: 768-QUBİT paralel süperpozisyon kanalı devrede (%99.25 Koherans)...
> Katman 2: Yeni nesil A2+ QUBİT motoru Tensor serisini geride bıraktı...
> Katman 3: Çekirdek kodu:
function executeA2PlusQubit(nodes) {
  return QubitEngine.accelerate(nodes, { qubits: 768, targetSec: 8.0 });
}
> Sonuç: WİFO A2+ (QUBİT) analizi tam 8.0 saniyede tamamlandı!`;

const A3_RESPONSE_TEXT = `WİFO A3 QUANTUM [1024-QUBİT · En İyi Teknoloji] — 5 Saniye Kuantum Akış
> Katman 1: 1024-QUBİT paralel süperpozisyon matrisi devrede (%99.94 Koherans)...
> Katman 2: Kuantum kriptografi denklemi 2x hızlandırılmış darbe ile çözüldü...
> Katman 3: Çekirdek kodu:
function executeA3Quantum(nodes) {
  return QuantumCore.superpose(nodes, { qubits: 1024, targetSec: 5.0 });
}
> Sonuç: WİFO A3 QUANTUM analizi tam 5.0 saniyede yüksek hassasiyetle tamamlandı.`;

const QPU_RESPONSE_TEXT = `Q-PU 9000 SERIES [4096-QUBİT · EN İYİ ZİRVE] — 1 SANİYEDE ÇÖZÜLDÜ (1.0s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[✓] 4096-QUBİT Hiper-Örgü Senkronizasyonu: %99.9999 Koherans
[✓] Çok Boyutlu Kriptografi Matrisi: Tek Döngüde Kırıldı
[✓] Kuantum Çekirdek Kodu (12.8 THz · 1 Saniye Hiper-Yazım):

class QPU9000HyperEngine {
  readonly qubits = 4096;
  readonly tech = "QUBİT (En İyi)";
  readonly writeSpeed = "1.0 Saniye";
}

[✓] SİMÜLASYON RAPORU: Tensor (A1 20sn, A1+ 16sn, A2- 15sn) ve QUBİT (A2 10sn, A2+ 8sn, A3 5sn) serisinin zirvesi!`;

export const QPU9000Showcase: React.FC<QPU9000ShowcaseProps> = ({
  isFounder,
  onUnlockAsFounder,
  onFinishToStartScreen,
  onSelectQpuProcessor,
  onCloseModal,
}) => {
  const [stage, setStage] = useState<VideoStage>('white_entry');
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [videoRunKey, setVideoRunKey] = useState(0);
  const [duelRunId, setDuelRunId] = useState(0);

  // Typing states for Duel Stage (Calibrated to exact 20s, 16s, 15s, 10s, 8s, 5s, and 1s!)
  const [a2Typed, setA2Typed] = useState('');
  const [a2PlusTyped, setA2PlusTyped] = useState('');
  const [a3Typed, setA3Typed] = useState('');
  const [qpuTyped, setQpuTyped] = useState('');

  const [a1Elapsed, setA1Elapsed] = useState(0);
  const [a1PlusElapsed, setA1PlusElapsed] = useState(0);
  const [a2MinusElapsed, setA2MinusElapsed] = useState(0);
  const [a2Elapsed, setA2Elapsed] = useState(0);
  const [a2PlusElapsed, setA2PlusElapsed] = useState(0);
  const [a3Elapsed, setA3Elapsed] = useState(0);
  const [qpuElapsed, setQpuElapsed] = useState(0);

  // Web Audio API synth refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sequencerIntervalRef = useRef<number | null>(null);

  const startBackgroundMusic = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      const padFreqs = [146.83, 220.0, 261.63, 329.63];
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

      const arpNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23];
      const bassNotes = [73.42, 73.42, 58.27, 65.41];
      let step = 0;

      sequencerIntervalRef.current = window.setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const now = audioCtxRef.current.currentTime;

        const arpOsc = audioCtxRef.current.createOscillator();
        const arpGain = audioCtxRef.current.createGain();
        arpOsc.type = 'sawtooth';
        const noteFreq = arpNotes[step % arpNotes.length];
        arpOsc.frequency.setValueAtTime(noteFreq, now);

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
      // Ignore audio autoplay restrictions
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

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(next ? 0 : 0.22, audioCtxRef.current.currentTime);
      }
      return next;
    });
  };

  // Classic Original Video Choreographed Timeline — Open to ALL Users!
  useEffect(() => {
    setStage('white_entry');
    setIsDarkBg(false);
    setA2Typed('');
    setA2PlusTyped('');
    setA3Typed('');
    setQpuTyped('');

    startBackgroundMusic();

    const tDark = window.setTimeout(() => {
      setIsDarkBg(true);
    }, 400);

    if (!isAutoPlaying) {
      return () => {
        clearTimeout(tDark);
      };
    }

    const tQuote = window.setTimeout(() => {
      setStage('quote');
    }, 2400);

    const tArch = window.setTimeout(() => {
      setStage('architecture');
    }, 7200);

    const tDuel = window.setTimeout(() => {
      setStage('duel');
    }, 12500);

    const tFinale = window.setTimeout(() => {
      setStage('finale');
    }, 24000);

    return () => {
      clearTimeout(tDark);
      clearTimeout(tQuote);
      clearTimeout(tArch);
      clearTimeout(tDuel);
      clearTimeout(tFinale);
      stopBackgroundMusic();
    };
  }, [videoRunKey]);

  const handleRestartFullVideo = () => {
    setIsAutoPlaying(true);
    setVideoRunKey((prev) => prev + 1);
  };

  const handleJumpToStage = (targetStage: VideoStage) => {
    setIsAutoPlaying(false);
    setIsDarkBg(true);
    setStage(targetStage);
    if (targetStage === 'duel') {
      setDuelRunId((prev) => prev + 1);
    }
  };

  // Exact time-calibrated typing animation for Duel Stage:
  // Q-PU 9000 SERIES = 1.00 second (1000 ms) [QUBİT - En İyi]
  // WİFO A3 QUANTUM  = 5.00 seconds (5000 ms) [QUBİT - En İyi]
  // WİFO A2+         = 8.00 seconds (8000 ms) [QUBİT - En İyi]
  // WİFO A2 VIP      = 10.00 seconds (10000 ms) [QUBİT - En İyi]
  // Plus live Tensor progress bars for WİFO A2- (15.0s), WİFO A1+ (16.0s), and WİFO A1 (20.0s) [Tensor - Ortalama]
  useEffect(() => {
    if (stage !== 'duel') return;

    setA2Typed('');
    setA2PlusTyped('');
    setA3Typed('');
    setQpuTyped('');
    setA1Elapsed(0);
    setA1PlusElapsed(0);
    setA2MinusElapsed(0);
    setA2Elapsed(0);
    setA2PlusElapsed(0);
    setA3Elapsed(0);
    setQpuElapsed(0);

    const startTime = performance.now();

    const tick = window.setInterval(() => {
      const elapsedMs = performance.now() - startTime;
      const elapsedSec = elapsedMs / 1000;

      // 1) Q-PU 9000 SERIES: 1000ms (1.0s)
      const qpuRatio = Math.min(1, elapsedMs / 1000);
      setQpuElapsed(Math.min(1.0, elapsedSec));
      setQpuTyped(QPU_RESPONSE_TEXT.slice(0, Math.floor(qpuRatio * QPU_RESPONSE_TEXT.length)));

      // 2) WİFO A3 QUANTUM: 5000ms (5.0s)
      const a3Ratio = Math.min(1, elapsedMs / 5000);
      setA3Elapsed(Math.min(5.0, elapsedSec));
      setA3Typed(A3_RESPONSE_TEXT.slice(0, Math.floor(a3Ratio * A3_RESPONSE_TEXT.length)));

      // 3) WİFO A2+ (New): 8000ms (8.0s)
      const a2PlusRatio = Math.min(1, elapsedMs / 8000);
      setA2PlusElapsed(Math.min(8.0, elapsedSec));
      setA2PlusTyped(
        A2_PLUS_RESPONSE_TEXT.slice(0, Math.floor(a2PlusRatio * A2_PLUS_RESPONSE_TEXT.length))
      );

      // 4) WİFO A2 VIP: 10000ms (10.0s)
      const a2Ratio = Math.min(1, elapsedMs / 10000);
      setA2Elapsed(Math.min(10.0, elapsedSec));
      setA2Typed(A2_RESPONSE_TEXT.slice(0, Math.floor(a2Ratio * A2_RESPONSE_TEXT.length)));

      // 5) Tensor (Ortalama) reference meters: A2- (15.0s), A1+ (16.0s), A1 (20.0s)
      setA2MinusElapsed(Math.min(15.0, elapsedSec));
      setA1PlusElapsed(Math.min(16.0, elapsedSec));
      setA1Elapsed(Math.min(20.0, elapsedSec));

      if (elapsedMs >= 20000) {
        clearInterval(tick);
      }
    }, 30);

    return () => clearInterval(tick);
  }, [stage, duelRunId]);

  return (
    <div
      className={`relative flex-1 overflow-y-auto flex flex-col justify-between transition-colors duration-[2000ms] ease-in-out select-none min-h-[640px] ${
        isDarkBg ? 'bg-black text-white' : 'bg-white text-slate-900'
      }`}
    >
      {isDarkBg && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-amber-500/10 blur-[150px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[420px] h-[420px] rounded-full bg-rose-500/10 blur-[130px]" />
        </div>
      )}

      {/* Top Control Bar — Explicitly Open to ALL Users */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>TÜM KULLANICILARA AÇIK</span>
          </span>

          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>ESKİ ORİJİNAL SİNEMATİK VİDEO & 7 İŞLEMCİ HIZ VİTRİNİ</span>
          </span>

          {!isFounder && (
            <button
              type="button"
              onClick={onUnlockAsFounder}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              Kurucu Modunu da Aç (FE OWNER BATUHAN)
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRestartFullVideo}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Eski Videoyu Baştan Oynat</span>
          </button>

          {stage === 'duel' && (
            <button
              type="button"
              onClick={() => setDuelRunId((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-medium text-cyan-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Hız Yarışını Tekrarlat</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer text-white"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Sesi Aç</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Müzik Aktif</span>
              </>
            )}
          </button>

          {onCloseModal ? (
            <button
              type="button"
              onClick={() => {
                stopBackgroundMusic();
                onCloseModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold text-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Videoyu Kapat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopBackgroundMusic();
                onSelectQpuProcessor();
                onFinishToStartScreen();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Başlama Yerine Geç</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Stage Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* STAGE 1: Classic White-to-Black Cinematic Entry */}
          {stage === 'white_entry' && (
            <motion.div
              key="white_entry"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.9 }}
              className="text-center max-w-3xl mx-auto px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SAHNE 01 · WİFO ŞİRKETİ SİNEMATİK SUNUMU (HERKESE AÇIK)</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
                BEYAZDAN SİYAHA KUANTUM DOĞUŞU
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Kurucu <strong className="text-amber-400">FE OWNER BATUHAN</strong> vizyonuyla inşa
                edilen Tensor (A1, A1+, A2-) ve QUBİT (A2, A2+, A3 Quantum, Q-PU 9000) ailesinin
                orijinal tanıtım videosu başlıyor...
              </p>
            </motion.div>
          )}

          {/* STAGE 2: Original Manifesto Quote */}
          {stage === 'quote' && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 1.04 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="max-w-4xl mx-auto text-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SAHNE 02 · TENSOR (ORTALAMA) DEN QUBİT (EN İYİ) MİMARİSİNE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                “Tensor işlemciler (A1, A1+, A2-) ortalama hızda matrisleri işler; QUBİT işlemciler
                (A2, A2+, A3, Q-PU 9000) ise süperpozisyonla en iyi geleceği yazar.”
              </h2>
              <p className="mt-6 text-sm text-amber-300/80 font-mono tracking-widest uppercase">
                — FE OWNER BATUHAN · WİFO ŞİRKETİ KURUCUSU
              </p>
            </motion.div>
          )}

          {/* STAGE 3: 7-Model Architecture Scene (Tensor vs QUBİT) */}
          {stage === 'architecture' && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-6xl mx-auto space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <Atom className="w-4 h-4" />
                  <span>SAHNE 03 · 7 KADEMELİ TENSOR (ORTALAMA) & QUBİT (EN İYİ) HİYERARŞİSİ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Tensor (A1 · A1+ · A2-) ve QUBİT (A2 · A2+ · A3 · Q-PU 9000) Ailesi
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {[
                  {
                    name: 'WİFO A1',
                    speed: '20 Saniye',
                    tech: 'TENSOR · ORTALAMA',
                    cores: '128 Tensor',
                    desc: 'Temel Tensor Mantık Çekirdeği',
                    border: 'border-blue-500/40',
                    text: 'text-blue-300',
                    isQubit: false,
                  },
                  {
                    name: 'WİFO A1+',
                    speed: '16 Saniye',
                    tech: 'TENSOR · ORTALAMA',
                    cores: '256 Tensor',
                    desc: 'Geliştirilmiş Tensor Akış Sistemi',
                    border: 'border-indigo-500/40',
                    text: 'text-indigo-300',
                    isQubit: false,
                  },
                  {
                    name: 'WİFO A2- (Yeni)',
                    speed: '15 Saniye',
                    tech: 'TENSOR · ORTALAMA',
                    cores: '384 Tensor',
                    desc: 'En Hızlı Tensor İşlemcisi',
                    border: 'border-sky-400/60',
                    text: 'text-sky-300',
                    isQubit: false,
                  },
                  {
                    name: 'WİFO A2',
                    speed: '10 Saniye',
                    tech: 'QUBİT · EN İYİ',
                    cores: '512 QUBİT',
                    desc: 'Hediye VIP QUBİT Çekirdeği',
                    border: 'border-emerald-500/50',
                    text: 'text-emerald-300',
                    isQubit: true,
                  },
                  {
                    name: 'WİFO A2+ (Yeni)',
                    speed: '8 Saniye',
                    tech: 'QUBİT · EN İYİ',
                    cores: '768 QUBİT',
                    desc: 'Yeni Nesil Turbo QUBİT Motoru',
                    border: 'border-purple-400/60',
                    text: 'text-purple-300',
                    isQubit: true,
                  },
                  {
                    name: 'WİFO A3 QUANTUM',
                    speed: '5 Saniye',
                    tech: 'QUBİT · EN İYİ',
                    cores: '1024 QUBİT',
                    desc: 'Amiral Gemisi QUBİT Süperpozisyon',
                    border: 'border-cyan-400/60',
                    text: 'text-cyan-300',
                    isQubit: true,
                  },
                  {
                    name: 'Q-PU 9000',
                    speed: '1 Saniye',
                    tech: 'QUBİT · EN İYİ ZİRVE',
                    cores: '4096 QUBİT',
                    desc: '12.8 THz Hiper-QUBİT Zirvesi',
                    border: 'border-amber-400/90',
                    text: 'text-amber-300',
                    isQubit: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl bg-slate-900/90 border ${item.border} flex flex-col justify-between`}
                  >
                    <div>
                      <div
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold mb-1.5 ${
                          item.isQubit
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {item.tech}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{item.cores}</div>
                      <div className={`font-display font-bold text-sm mt-0.5 ${item.text}`}>
                        {item.name}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Yazım:</span>
                      <span className={`font-mono text-xs font-bold ${item.text}`}>
                        ⚡ {item.speed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: Live Speed Duel across all 7 Models */}
          {stage === 'duel' && (
            <motion.div
              key="duel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 mb-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>SAHNE 04 · TENSOR (ORTALAMA) VS QUBİT (EN İYİ) CANLI YAZIM DÜELLOSU</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Tensor: A1 (20sn) · A1+ (16sn) · A2- (15sn) | QUBİT: A2 (10sn) · A2+ (8sn) · A3 (5sn) · Q-PU 9000 (1sn)
                </h2>
              </div>

              {/* 3 Tensor Technology (Ortalama) Reference Speed Bars: A1 (20s), A1+ (16s), A2- (15s) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-blue-300">
                      WİFO A1 · Tensor (Ortalama)
                    </span>
                    <span className="font-mono text-blue-200 tabular-nums">
                      {a1Elapsed.toFixed(1)}s / 20.0s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a1Elapsed / 20.0) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-indigo-300">
                      WİFO A1+ · Tensor (Ortalama)
                    </span>
                    <span className="font-mono text-indigo-200 tabular-nums">
                      {a1PlusElapsed.toFixed(1)}s / 16.0s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a1PlusElapsed / 16.0) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-sky-400/40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-sky-300">
                      WİFO A2- (Yeni) · Tensor (Ortalama)
                    </span>
                    <span className="font-mono text-sky-200 tabular-nums">
                      {a2MinusElapsed.toFixed(1)}s / 15.0s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a2MinusElapsed / 15.0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 QUBİT Technology (En İyi) Live Stream Cards: A2 (10s), A2+ (8s), A3 Quantum (5s), Q-PU 9000 (1s) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Card 1: WİFO A2 (10 Seconds · QUBİT) */}
                <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/35 p-4 flex flex-col h-[290px]">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">WİFO A2 (QUBİT)</div>
                      <div className="text-[10px] text-emerald-300 font-mono">
                        En İyi · Hedef: 10.0sn
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{a2Elapsed.toFixed(1)}s / 10.0s</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a2Elapsed / 10.0) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {a2Typed}
                  </pre>
                </div>

                {/* Card 2: WİFO A2+ (8 Seconds · QUBİT) */}
                <div className="rounded-2xl bg-slate-900/90 border border-purple-500/45 p-4 flex flex-col h-[290px]">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-purple-200">
                        WİFO A2+ (Yeni QUBİT)
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        En İyi · Hedef: 8.0sn
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-purple-300 flex items-center justify-end gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{a2PlusElapsed.toFixed(1)}s / 8.0s</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-purple-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a2PlusElapsed / 8.0) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-[10px] text-purple-100 whitespace-pre-wrap leading-relaxed">
                    {a2PlusTyped}
                  </pre>
                </div>

                {/* Card 3: WİFO A3 QUANTUM (5 Seconds · QUBİT) */}
                <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/45 p-4 flex flex-col h-[290px]">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">WİFO A3 QUANTUM</div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        En İyi · Hedef: 5.0sn
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-cyan-300 flex items-center justify-end gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{a3Elapsed.toFixed(1)}s / 5.0s</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, (a3Elapsed / 5.0) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {a3Typed}
                  </pre>
                </div>

                {/* Card 4: Q-PU 9000 SERIES (1 Second · QUBİT Zirve) */}
                <div className="rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-950 border-2 border-amber-400/70 p-4 flex flex-col h-[290px] shadow-xl">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-500/20">
                    <div>
                      <div className="text-xs font-bold text-amber-300">Q-PU 9000 SERIES</div>
                      <div className="text-[10px] text-amber-200/80 font-mono">
                        En İyi Zirve · 1.0sn
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{qpuElapsed.toFixed(1)}s / 1.0s</span>
                      </div>
                      <div className="text-[9px] text-emerald-400 flex items-center justify-end gap-1">
                        {qpuElapsed >= 1.0 ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>1sn Bitti!</span>
                          </>
                        ) : (
                          <span>Yazıyor...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, (qpuElapsed / 1.0) * 100)}%` }}
                    />
                  </div>

                  <pre className="flex-1 overflow-y-auto font-mono text-[10px] text-amber-100 whitespace-pre-wrap leading-relaxed">
                    {qpuTyped}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: Grand Finale */}
          {stage === 'finale' && (
            <motion.div
              key="finale"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-mono mb-6">
                <Crown className="w-4 h-4" />
                <span>SAHNE 05 · ORİJİNAL TANITIM FİNALİ (TÜM KULLANICILARA AÇIK)</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-white to-rose-400 bg-clip-text text-transparent mb-6">
                FUNZONE QUANTUM SERİES
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
                Tensor Teknolojisi (Ortalama: A1 20sn, A1+ 16sn, A2- 15sn) ve QUBİT Teknolojisi (En
                İyi: A2 10sn, A2+ 8sn, A3 Quantum 5sn, Q-PU 9000 Series 1sn) işlemci ailesi tüm
                kullanıcılarımızın deneyimine hazırdır.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestartFullVideo}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Eski Videoyu Tekrar İzle</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopBackgroundMusic();
                    onSelectQpuProcessor();
                    if (onCloseModal) {
                      onCloseModal();
                    } else {
                      onFinishToStartScreen();
                    }
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{onCloseModal ? 'Sohbet Ekranına Dön' : 'Başlama Yerine Dön'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Interactive Scene Scrubber — Anyone can click any scene */}
      <div className="relative z-20 px-6 py-4 border-t border-white/10 bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'white_entry' as VideoStage, label: '1. Beyazdan Siyaha Giriş' },
            { id: 'quote' as VideoStage, label: '2. Tensor vs QUBİT Manifestosu' },
            { id: 'architecture' as VideoStage, label: '3. 7 İşlemci Mimarisi' },
            { id: 'duel' as VideoStage, label: '4. Canlı Hız Düellosu (20s-1s)' },
            { id: 'finale' as VideoStage, label: '5. FUNZONE QUANTUM SERİES' },
          ].map((sceneBtn) => {
            const isCurrent = stage === sceneBtn.id;
            return (
              <button
                key={sceneBtn.id}
                type="button"
                onClick={() => handleJumpToStage(sceneBtn.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/20 border border-amber-400/60 text-amber-300 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {sceneBtn.label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-emerald-400">
          ✓ Tüm Kullanıcılara Açık Orijinal Video
        </div>
      </div>
    </div>
  );
};
