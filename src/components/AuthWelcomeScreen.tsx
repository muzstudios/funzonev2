import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Crown,
  Gift,
  AudioWaveform,
  Cpu,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface AuthWelcomeScreenProps {
  isDarkMode: boolean;
  onCompleteAuth: (profile: UserProfile) => void;
  onQuickStartGuest: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({
  isDarkMode,
  onCompleteAuth,
  onQuickStartGuest,
  isModal = false,
  onCloseModal,
  currentUser,
  onLogout,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (authTab === 'register' && cleanName.length < 2) {
      setError('Lütfen en az 2 karakterden oluşan adınızı girin.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Lütfen geçerli bir e-posta adresi girin (örn. kullanici@wifo.ai).');
      return;
    }

    if (password.trim().length < 4) {
      setError('Güvenliğiniz için şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    const isFounderEmail =
      cleanEmail.toLowerCase().includes('batuhan') ||
      cleanName.toLowerCase().includes('batuhan');

    const profile: UserProfile = {
      id: 'user-' + Date.now(),
      name:
        authTab === 'register'
          ? cleanName
          : isFounderEmail
          ? 'FE OWNER BATUHAN'
          : cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isFounderEmail ? 'founder' : 'member',
      title: isFounderEmail ? 'Kurucu & Baş Mimar' : 'Kuantum Üyesi',
      joinedAt: Date.now(),
    };

    onCompleteAuth(profile);
  };

  const handleFounderQuickLogin = () => {
    const founderProfile: UserProfile = {
      id: 'founder-batuhan',
      name: 'FE OWNER BATUHAN',
      email: 'batuhan@wifo-quantum.ai',
      role: 'founder',
      title: 'WİFO Şirketi Kurucusu',
      joinedAt: Date.now(),
    };
    onCompleteAuth(founderProfile);
  };

  const content = (
    <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left Column (7 cols): "Başla Yeri" Onboarding & Value Proposition */}
      <div
        className={`lg:col-span-7 p-7 sm:p-10 rounded-3xl border flex flex-col justify-between ${
          isDarkMode
            ? 'bg-[#111622] border-slate-800/90 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Lockup & Kicker */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size={38} animated />
              <div>
                <span className="font-display font-extrabold text-xl tracking-tight">
                  Funzone WİFO
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>WİFO A3 Quantum</span>
                  <span aria-hidden="true">·</span>
                  <span>Kurucu: FE OWNER BATUHAN</span>
                </div>
              </div>
            </div>

            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Hero Statement */}
          <div className="space-y-3 pt-2">
            <h1
              className="font-display font-extrabold tracking-tight text-2xl sm:text-4xl leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Yeni Nesil Kuantum İşlemcili Yapay Zeka ve Ses Değiştirme Stüdyosu
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              1024 Qubit Q-PU 9000 işlemci mimarisi, 10 kişilik özel hediye koduyla ücretsiz açılan WİFO A2 modeli,
              mikrofonla sesli komut ve 6 farklı ses değiştirme karakteriyle tanışın.
            </p>
          </div>

          {/* Numbered Editorial Capability Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div
              className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B0F17] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                <Cpu size={14} />
                <span>01. WİFO A3 Quantum & Hediye A2</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gelişmiş kuantum işlemci mimarisi yanında WİFO A2 modelini tüm kullanıcılara hediye olarak sunar.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B0F17] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                <AudioWaveform size={14} />
                <span>02. Ses Değiştirme & Sesli Giriş</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Barbaros, Elif, Q-PU 9000 Sibernetik, Nova ve Bilge ses profilleriyle yanıtları istediğiniz tonda dinleyin.
              </p>
            </div>

            <div
              className={`sm:col-span-2 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode ? 'bg-[#0B0F17] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                  <Gift size={14} />
                  <span>03. 10 Kişilik Özel Hediye Kodu: QUANTUM-10</span>
                </div>
                <p className="text-xs text-slate-400">
                  Sohbet ekranından 10 kişilik hediye kodunu girerek A3 Quantum ve hediye A2 paketini anında etkinleştirin.
                </p>
              </div>
              <span className="font-mono tabular-nums text-xs font-bold text-emerald-400 shrink-0">
                10/10 Kota Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Immediate "Hemen Başla" Action Bar */}
        <div className="pt-6 mt-6 border-t border-slate-500/15 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Hesap oluşturmadan da tek tıkla kuantum çalışma alanına geçebilirsiniz.
          </div>

          <button
            type="button"
            onClick={onQuickStartGuest}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-display font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 shadow-lg shadow-cyan-500/15"
          >
            <span>Hemen Başla</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Right Column (5 cols): "Giriş Yapma Sistemi" (Login / Register / Profile) */}
      <div
        className={`lg:col-span-5 p-7 sm:p-9 rounded-3xl border flex flex-col justify-between ${
          isDarkMode
            ? 'bg-[#111622] border-slate-800/90 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold">
                {currentUser ? 'Aktif Kullanıcı Hesabı' : 'Kullanıcı Giriş Sistemi'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser
                  ? 'Oturum bilgileriniz ve yetki seviyeniz'
                  : 'Tercihlerinizi ve sohbet geçmişinizi hesabınızla eşitleyin'}
              </p>
            </div>

            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {currentUser && (
            <div
              className={`mb-5 p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isDarkMode ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentUser.title} · {currentUser.email}
                  </p>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-xs font-semibold shrink-0"
                >
                  Çıkış Yap
                </button>
              )}
            </div>
          )}

          {/* Mode Switcher: Giriş Yap vs Kayıt Ol */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl border mb-5 ${
              isDarkMode ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                authTab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                authTab === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yeni Hesap Oluştur
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authTab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Adınız Soyadınız
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Batuhan Altuntaş"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#0B0F17] border-slate-800 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kullanici@wifo.ai"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#0B0F17] border-slate-800 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Şifre
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#0B0F17] border-slate-800 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>{authTab === 'login' ? 'Giriş Yap ve Başla' : 'Kayıt Ol ve Başla'}</span>
            </button>
          </form>
        </div>

        {/* Founder Quick Login Option */}
        <div className="pt-5 mt-5 border-t border-slate-500/15 space-y-2.5">
          <p className="text-[11px] text-slate-400 text-center">Hızlı Yetkili Erişim Seçenekleri</p>
          <button
            type="button"
            onClick={handleFounderQuickLogin}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isDarkMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Crown size={14} className="text-amber-400" />
            <span>Kurucu Girişi (FE OWNER BATUHAN)</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCloseModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative z-10 w-full max-w-[1200px] my-auto"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors ${
        isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      <div className="my-auto py-6">{content}</div>
    </div>
  );
};
