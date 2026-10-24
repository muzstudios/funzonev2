import React, { useState } from 'react';
import { Image, Sparkles, Download, RefreshCw, Wand2, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface QuantumImageStudioProps {
  isDarkMode: boolean;
  onBackToChat: () => void;
}

export const QuantumImageStudio: React.FC<QuantumImageStudioProps> = ({
  isDarkMode,
  onBackToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'Kuantum çekirdeğinde parlayan fütüristik yapay zeka işlemcisi, sibernetik neon ışıklar',
    'Yıldızlararası galakside yüzen kuantum bilgisayar tapınağı, 8K sinematik',
    'İstanbul Boğazı üzerinde uçan kuantum enerji kuşu, fotogerçekçi gün batımı',
    'Altın oran sarmalında kristalize kuantum küpü, hiper-detaylı 3D render',
  ];

  const handleGenerate = async (targetPrompt = prompt) => {
    if (!targetPrompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError(data.error || 'Görsel üretilemedi.');
      }
    } catch (err: any) {
      setError('Bağlantı hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-6 border-b border-slate-500/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-lg shadow-pink-500/20">
              <Wand2 size={24} />
            </div>
            <div>
              <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                WİFO Z1 Kuantum Görsel Stüdyosu
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Yeni nesil yapay zeka ile hayal ettiğiniz her şeyi görselleştirin
              </p>
            </div>
          </div>
          <button
            onClick={onBackToChat}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            Sohbete Dön
          </button>
        </div>

        {/* Input box */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nasıl bir görsel üretmek istiyorsunuz? (Örn: Gece yarısı neon ışıkları altında kuantum sibernetik kedi...)"
              className={`w-full p-4 rounded-2xl border text-sm font-medium transition-all outline-none resize-none ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2">En/Boy Oranı:</span>
            {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Preset Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              İlham Alın:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item);
                    handleGenerate(item);
                  }}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border text-left transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'bg-slate-100/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ✨ {item}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-500">{error}</p>
          )}

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Kuantum İşlemci Görseli İşliyor...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Kuantum Görsel Üret</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Result Preview */}
        {generatedImage && (
          <div className="mt-8 pt-6 border-t border-slate-500/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Üretilen Görsel Sonucu
              </h3>
              <a
                href={generatedImage}
                download="funzone-quantum-image.png"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
              >
                <Download size={14} />
                <span>İndir</span>
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-500/20 max-h-[500px] flex items-center justify-center bg-black/10">
              <img
                src={generatedImage}
                alt="Generated AI artwork"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
