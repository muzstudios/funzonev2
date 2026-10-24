import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Check, AlertCircle, X, ShieldCheck, Cpu, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GiftCodeStatus } from '../types';

interface GiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isUnlocked: boolean;
  onSuccessUnlock: () => void;
}

export const GiftCodeModal: React.FC<GiftCodeModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  isUnlocked,
  onSuccessUnlock,
}) => {
  const [code, setCode] = useState('QUANTUM-10');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<GiftCodeStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch status on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/gift-code/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data);
        })
        .catch(err => console.error('Gift status fetch error:', err));
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#eab308'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  const handleRedeem = async (targetCode = code) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/gift-code/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: targetCode,
          clientToken: localStorage.getItem('funzone_client_token') || Math.random().toString(36).substring(7),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(data.message || 'Tebrikler! WİFO A3 QUANTUM ve hediye WİFO A2 başarıyla aktif edildi.');
        triggerConfetti();
        localStorage.setItem('funzone_a3_quantum_unlocked', 'true');
        localStorage.setItem('funzone_a2_gift_unlocked', 'true');
        onSuccessUnlock();

        // Refresh status
        if (status) {
          setStatus({
            ...status,
            remainingUses: data.remainingUses !== undefined ? data.remainingUses : Math.max(0, status.remainingUses - 1),
          });
        }
      } else {
        const errMsg = data.message || 'Hediye kodu geçersiz veya kotası dolmuş.';
        setErrorMessage(errMsg);
        onNotifyGiftAttempt?.(false, errMsg);
      }
    } catch (err: any) {
      const errMsg = 'Bağlantı hatası: ' + err.message;
      setErrorMessage(errMsg);
      onNotifyGiftAttempt?.(false, errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('QUANTUM-10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

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

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className={`relative w-full max-w-lg p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-indigo-200'
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles size={140} className="text-indigo-500" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${
            isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Gift className="text-white w-9 h-9 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  10 KİŞİLİK ÖZEL KOD
                </span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Aktif
                </span>
              </div>
              <h2 className={`text-2xl font-black italic tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                10 Kişilik Hediye Kodu
              </h2>
            </div>
          </div>

          {/* Quota Remaining Counter Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Cpu size={20} />
              </div>
              <div>
                <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Kalan Kullanım Hakkı: <span className="text-indigo-400 font-black">{status?.remainingUses ?? 10} / 10</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Toplam 10 şanslı kullanıcı için geçerlidir</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                10 USERS LIMIT
              </span>
            </div>
          </div>

          {/* Value Proposition Highlights */}
          <div className="space-y-3">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bu Kod Size Neler Kazandırır?
            </h3>
            
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Cpu size={18} />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  1. WİFO A3 QUANTUM (Gelişmiş Yeni Kuantum İşlemci)
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                  1024 Qubit Neural Q-PU mimarisi, derin kodlama, yaratıcı şiir ve bilimsel analiz motoru sınırsız açılır.
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-200'
            }`}>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Gift size={18} />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  2. WİFO A2 HEDİYESİ (Ücretsiz Dahil Edilir) 🎁
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                  A3 Quantum aktive edildiğinde, yüksek hızlı ve efsanevi WİFO A2 modeli de size özel <strong className="text-emerald-500">ücretsiz hediye</strong> olarak açılır.
                </p>
              </div>
            </div>
          </div>

          {/* Quick-fill Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Hediye Kodunuz
              </label>
              <button
                onClick={handleCopyCode}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="QUANTUM-10"
                className={`w-full py-4 px-5 pr-28 rounded-2xl font-mono font-black text-lg tracking-widest border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                }`}
              />

              <button
                type="button"
                onClick={() => setCode('QUANTUM-10')}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
              >
                Otomatik Doldur
              </button>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-500 text-xs font-bold"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs font-bold"
            >
              <ShieldCheck size={18} className="shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRedeem()}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Kuantum İşlemciye Bağlanıyor...</span>
            ) : isUnlocked ? (
              <>
                <Check size={18} />
                <span>KOD ZATEN AKTİF - A3 QUANTUM & A2 KULLANIMA HAZIR</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>KODU ONAYLA, A3 QUANTUM & HEDİYE A2'Yİ AÇ</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
