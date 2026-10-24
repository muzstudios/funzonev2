import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  Globe,
  Image as ImageIcon,
  FileCode,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  MousePointerClick,
  Layers,
  Maximize2,
  Send,
  Volume2,
  Eye,
  Sliders,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { AILevel, DroppedFilePayload, PhysicalActionStep } from '../types';
import { BrandLogo } from './BrandLogo';

interface AIPhysicalWorkspaceProps {
  isDarkMode: boolean;
  aiLevel: AILevel;
  activeFile: DroppedFilePayload | null;
  isInspecting: boolean;
  onBackToChat: () => void;
  onDropNewFile: (file: File) => void;
  onInspectUrl: (url: string) => void;
  onLoadSampleItem: (type: 'website' | 'image') => void;
  onAddCustomStepAtCoord: (xPercent: number, yPercent: number, customPrompt?: string) => void;
  onSpeakText?: (text: string) => void;
}

export const AIPhysicalWorkspace: React.FC<AIPhysicalWorkspaceProps> = ({
  isDarkMode,
  aiLevel,
  activeFile,
  isInspecting,
  onBackToChat,
  onDropNewFile,
  onInspectUrl,
  onLoadSampleItem,
  onAddCustomStepAtCoord,
  onSpeakText,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 30, y: 28 });
  const [isClickingEffect, setIsClickingEffect] = useState<boolean>(false);
  const [physicalEnhancementActive, setPhysicalEnhancementActive] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [followUpInput, setFollowUpInput] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragOverStage, setIsDragOverStage] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const steps: PhysicalActionStep[] = activeFile?.physicalSteps || [];
  const currentStep: PhysicalActionStep | undefined = steps[activeStepIdx] || steps[0];

  // Reset step progression when a new file arrives
  useEffect(() => {
    if (!activeFile || !activeFile.physicalSteps?.length) return;
    setActiveStepIdx(0);
    setIsAutoPlaying(true);
    const first = activeFile.physicalSteps[0];
    setCursorPos({ x: first.xPercent, y: first.yPercent });
    setCompletedStepIds([first.id]);
  }, [activeFile?.id, activeFile?.physicalSteps?.length]);

  // Animate AI physical cursor through steps automatically
  useEffect(() => {
    if (!isAutoPlaying || !steps.length || isInspecting) return;

    const timer = window.setInterval(() => {
      setActiveStepIdx((prev) => {
        const nextIdx = (prev + 1) % steps.length;
        const target = steps[nextIdx];
        if (target) {
          setCursorPos({ x: target.xPercent, y: target.yPercent });
          setIsClickingEffect(true);
          window.setTimeout(() => setIsClickingEffect(false), 650);
          setCompletedStepIds((old) =>
            old.includes(target.id) ? old : [...old, target.id]
          );
        }
        return nextIdx;
      });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying, steps, isInspecting]);

  const handleSelectStepManual = (index: number) => {
    const target = steps[index];
    if (!target) return;
    setIsAutoPlaying(false);
    setActiveStepIdx(index);
    setCursorPos({ x: target.xPercent, y: target.yPercent });
    setIsClickingEffect(true);
    window.setTimeout(() => setIsClickingEffect(false), 650);
    setCompletedStepIds((old) => (old.includes(target.id) ? old : [...old, target.id]));
  };

  // Allow clicking directly on the physical canvas so the AI moves there and inspects that spot
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || !activeFile) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const clampedX = Math.max(12, Math.min(88, xPct));
    const clampedY = Math.max(12, Math.min(86, yPct));

    setIsAutoPlaying(false);
    setCursorPos({ x: clampedX, y: clampedY });
    setIsClickingEffect(true);
    window.setTimeout(() => setIsClickingEffect(false), 700);
    onAddCustomStepAtCoord(clampedX, clampedY);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = followUpInput.trim();
    if (!clean) return;
    // Move AI cursor to a new focal coordinate and perform requested physical action
    const randX = Math.floor(22 + Math.random() * 56);
    const randY = Math.floor(22 + Math.random() * 54);
    setIsAutoPlaying(false);
    setCursorPos({ x: randX, y: randY });
    setIsClickingEffect(true);
    window.setTimeout(() => setIsClickingEffect(false), 700);
    onAddCustomStepAtCoord(randX, randY, clean);
    setFollowUpInput('');
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onInspectUrl(urlInput.trim());
    setUrlInput('');
  };

  // Inject live AI physical highlight styles if rendering an HTML website and enhancement is toggled on
  const getEnhancedHtmlDoc = (rawHtml: string) => {
    const aiEnhancementStyle = physicalEnhancementActive
      ? `<style>
          body { transition: all 0.4s ease !important; }
          h1, h2, h3 { text-shadow: 0 0 18px rgba(34,211,238,0.22); }
          button, a { outline: 2px dashed rgba(34,211,238,0.55) !important; outline-offset: 3px !important; }
        </style>`
      : '';
    return `${aiEnhancementStyle}${rawHtml}`;
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.html,.htm,.txt,.md,.js,.jsx,.ts,.tsx,.py,.json,.css,.svg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onDropNewFile(f);
          e.target.value = '';
        }}
      />

      {/* Top Navigation & AI "Hemen Bakıyorum!" Live Status Banner */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
          isDarkMode
            ? 'bg-[#0F1626] border-cyan-500/35 text-slate-100 shadow-[0_0_40px_rgba(34,211,238,0.08)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-500/15">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              type="button"
              onClick={onBackToChat}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <ArrowLeft size={15} />
              <span>Sohbete Dön</span>
            </button>

            <div className="flex items-center gap-3">
              <BrandLogo size={34} />
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-400 font-medium">
                  <span>Yapay Zeka Fiziksel Çalışma & İnceleme Sahnesi</span>
                  <span aria-hidden="true">·</span>
                  <span>Canlı İmleç & Fiziksel Eylem Modu</span>
                </div>
                <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight">
                  {activeFile
                    ? `${activeFile.name} — Canlı Fiziksel İnceleme`
                    : 'Dosya veya Web Sitesi Fiziksel Sahnesi'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>Yeni Dosya / Resim / HTML Seç</span>
            </button>

            <button
              type="button"
              onClick={() => onLoadSampleItem('website')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-500/50 text-slate-200'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Globe size={13} className="text-cyan-400" />
              <span>Örnek Web Sitesi Aç</span>
            </button>

            <button
              type="button"
              onClick={() => onLoadSampleItem('image')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 hover:border-violet-500/50 text-slate-200'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <ImageIcon size={13} className="text-violet-400" />
              <span>Örnek Görsel Aç</span>
            </button>
          </div>
        </div>

        {/* AI "Hemen Bakıyorum!" Live Speech Strip */}
        <div
          className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDarkMode
              ? 'bg-cyan-950/25 border-cyan-500/30 text-cyan-100'
              : 'bg-cyan-50/80 border-cyan-200 text-slate-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold text-cyan-400 mb-0.5">
                Yapay Zeka Canlı Durumu ({aiLevel})
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {isInspecting
                  ? 'Hemen bakıyorum! Bıraktığın dosyayı sahneye aldım, şu an piksel ve yapı katmanlarını fiziksel olarak tarıyorum...'
                  : activeFile?.aiGreeting ||
                    'Hemen bakıyorum! Dosya veya web sitesini buraya sürükleyip bıraktığında seni doğrudan bu sahneye getirip üzerinde fiziksel olarak yaptığım işlemleri canlı gösteriyorum.'}
              </p>
            </div>
          </div>

          {activeFile?.aiGreeting && onSpeakText && (
            <button
              type="button"
              onClick={() =>
                onSpeakText(
                  `${activeFile.aiGreeting} ${activeFile.aiSummary || ''}`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 text-cyan-300'
                  : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Volume2 size={14} />
              <span>Sesli Anlat</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State if no file is loaded yet */}
      {!activeFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverStage(true);
          }}
          onDragLeave={() => setIsDragOverStage(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverStage(false);
            const f = e.dataTransfer.files?.[0];
            if (f) {
              onDropNewFile(f);
              return;
            }
            const droppedUrl =
              e.dataTransfer.getData('text/uri-list') ||
              e.dataTransfer.getData('text/plain');
            if (droppedUrl && droppedUrl.startsWith('http')) {
              onInspectUrl(droppedUrl.trim());
            }
          }}
          className={`p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
            isDragOverStage
              ? 'border-cyan-400 bg-cyan-500/10'
              : isDarkMode
              ? 'bg-[#0E1525] border-slate-700 text-slate-200'
              : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Upload size={30} />
          </div>
          <h2 className="font-display text-xl font-bold">
            Resim, Web Tabanlı Site (.html) veya Dosyayı Buraya Sürükleyip Bırakın
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Sohbet ekranına veya buraya herhangi bir dosya bıraktığınızda yapay zeka{' '}
            <strong className="text-cyan-400">"Hemen bakıyorum!"</strong> diyerek sizi buraya
            getirir ve dosya üzerinde fiziksel imleciyle yaptığı işlemleri canlı olarak gösterir.
          </p>

          <form
            onSubmit={handleUrlSubmit}
            className="max-w-lg mx-auto mt-6 flex items-center gap-2"
          >
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Veya incelemek istediğiniz bir web sitesi adresi (https://...) yazın"
              className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
            >
              Siteye Git & İncele
            </button>
          </form>
        </div>
      ) : (
        /* Main Split Layout: Left = Live Physical Canvas Stage (8 cols), Right = Live Physical Action Log & Controls (4 cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: Live Physical Canvas where AI moves its cursor and performs physical actions */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div
              className={`rounded-3xl border overflow-hidden flex flex-col ${
                isDarkMode
                  ? 'bg-[#0B101C] border-slate-800/90 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Stage Toolbar */}
              <div
                className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isDarkMode
                    ? 'bg-[#111829] border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {activeFile.kind === 'website' ? (
                    <Globe size={15} className="text-cyan-400 shrink-0" />
                  ) : activeFile.kind === 'image' ? (
                    <ImageIcon size={15} className="text-violet-400 shrink-0" />
                  ) : (
                    <FileCode size={15} className="text-emerald-400 shrink-0" />
                  )}
                  <span className="font-semibold truncate">{activeFile.name}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    İmleç Konumu: X:{cursorPos.x}% Y:{cursorPos.y}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Website Viewport Switcher */}
                  {activeFile.kind === 'website' && (
                    <div
                      className={`flex items-center gap-1 p-1 rounded-xl border ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setViewportMode('desktop')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewportMode === 'desktop'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Masaüstü Görünümü"
                      >
                        <Monitor size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode('tablet')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewportMode === 'tablet'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Tablet Görünümü"
                      >
                        <Tablet size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode('mobile')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewportMode === 'mobile'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Mobil Görünümü"
                      >
                        <Smartphone size={13} />
                      </button>
                    </div>
                  )}

                  {/* Toggle AI Physical Enhancement Filter */}
                  <button
                    type="button"
                    onClick={() => setPhysicalEnhancementActive((v) => !v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                      physicalEnhancementActive
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    <Sliders size={12} />
                    <span>
                      {physicalEnhancementActive
                        ? 'Fiziksel İyileştirme: Açık'
                        : 'Fiziksel İyileştirme: Kapalı'}
                    </span>
                  </button>

                  {/* Toggle Bounding Boxes */}
                  <button
                    type="button"
                    onClick={() => setShowBoundingBoxes((v) => !v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                      showBoundingBoxes
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    <Layers size={12} />
                    <span>İşaret Bölgeleri</span>
                  </button>

                  {/* Play / Pause AI Physical Cursor */}
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isAutoPlaying ? 'Fiziksel Turu Duraklat' : 'Fiziksel Turu Oynat'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Physical Stage Container */}
              <div
                ref={stageRef}
                onClick={handleStageClick}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverStage(true);
                }}
                onDragLeave={() => setIsDragOverStage(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverStage(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) onDropNewFile(f);
                }}
                className="relative min-h-[480px] sm:min-h-[540px] w-full flex items-center justify-center overflow-hidden select-none cursor-crosshair bg-[#070B14]"
                title="Sahnenin herhangi bir noktasına tıklayarak yapay zekanın fiziksel imlecini oraya yönlendirebilirsiniz"
              >
                {/* Subtle Measurement Grid Background */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(56,189,248,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.16) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                />

                {/* 1. IMAGE STAGE */}
                {activeFile.kind === 'image' && activeFile.dataUrl && (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={activeFile.dataUrl}
                      alt={activeFile.name}
                      className="max-h-[500px] w-auto max-w-full rounded-2xl object-contain transition-all duration-500 shadow-2xl"
                      style={{
                        filter: physicalEnhancementActive
                          ? 'contrast(1.08) saturate(1.12) brightness(1.03)'
                          : 'none',
                      }}
                    />
                  </div>
                )}

                {/* 2. WEBSITE / HTML STAGE */}
                {activeFile.kind === 'website' && (
                  <div
                    className={`relative h-[500px] transition-all duration-500 rounded-2xl overflow-hidden border border-slate-700/80 bg-white shadow-2xl ${
                      viewportMode === 'mobile'
                        ? 'w-[360px]'
                        : viewportMode === 'tablet'
                        ? 'w-[680px]'
                        : 'w-full m-3'
                    }`}
                  >
                    {/* Simulated Browser Bar inside Stage */}
                    <div className="px-3 py-2 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="px-3 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono truncate max-w-md">
                        {activeFile.webUrl || `local://physical-stage/${activeFile.name}`}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Canlı Sahne
                      </span>
                    </div>

                    {activeFile.textContent ? (
                      <iframe
                        title={activeFile.name}
                        srcDoc={getEnhancedHtmlDoc(activeFile.textContent)}
                        className="w-full h-[460px] border-0 pointer-events-none"
                        sandbox="allow-scripts"
                      />
                    ) : activeFile.webUrl ? (
                      <iframe
                        title={activeFile.name}
                        src={activeFile.webUrl}
                        className="w-full h-[460px] border-0 pointer-events-none bg-white"
                      />
                    ) : null}
                  </div>
                )}

                {/* 3. CODE / DOCUMENT STAGE */}
                {(activeFile.kind === 'code' || activeFile.kind === 'document') && (
                  <div className="w-full h-[500px] m-4 p-5 rounded-2xl bg-[#0A0F1D] border border-slate-800 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-cyan-400">
                      <span>{activeFile.name} — Fiziksel Kod & Metin Analiz Katmanı</span>
                      <span>{(activeFile.sizeBytes / 1024).toFixed(1)} KB</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words">
                      {activeFile.textContent || 'Dosya içeriği yüklendi.'}
                    </pre>
                  </div>
                )}

                {/* AI Laser Scanning Line */}
                <div
                  className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 transition-all duration-700"
                  style={{
                    top: `${cursorPos.y}%`,
                    boxShadow: '0 0 18px rgba(34,211,238,0.8)',
                  }}
                />
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent opacity-65 transition-all duration-700"
                  style={{
                    left: `${cursorPos.x}%`,
                  }}
                />

                {/* Physical Bounding Boxes & Step Pins Over the Stage */}
                {showBoundingBoxes &&
                  steps.map((step, idx) => {
                    const isCurrent = idx === activeStepIdx;
                    return (
                      <div
                        key={step.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleSelectStepManual(idx);
                        }}
                        style={{
                          left: `${Math.max(6, step.xPercent - step.widthPercent / 2)}%`,
                          top: `${Math.max(6, step.yPercent - step.heightPercent / 2)}%`,
                          width: `${step.widthPercent}%`,
                          height: `${step.heightPercent}%`,
                          borderColor: step.color,
                          backgroundColor: isCurrent
                            ? `${step.color}22`
                            : `${step.color}0D`,
                        }}
                        className={`absolute rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                          isCurrent
                            ? 'ring-4 ring-cyan-400/30 z-20 scale-[1.02]'
                            : 'opacity-75 hover:opacity-100 z-10'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: step.color }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-br-xl rounded-tl-lg text-[10px] font-bold text-slate-950 shadow-md"
                        >
                          <span>#{step.stepNumber}</span>
                          <span className="truncate max-w-[140px]">{step.title}</span>
                        </div>
                      </div>
                    );
                  })}

                {/* THE AI'S PHYSICAL CURSOR & HAND ("Orda Kendi fisiksel olarak yaptıklarını göstersin") */}
                <div
                  style={{
                    left: `${cursorPos.x}%`,
                    top: `${cursorPos.y}%`,
                  }}
                  className="pointer-events-none absolute z-30 -translate-x-3 -translate-y-3 transition-all duration-700 ease-out"
                >
                  {/* Click Ripple Animation */}
                  {isClickingEffect && (
                    <span className="absolute -inset-4 rounded-full border-2 border-cyan-400 animate-ping opacity-80" />
                  )}

                  {/* Glowing AI Pointer Node */}
                  <div className="relative flex items-start gap-2">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 p-0.5 shadow-[0_0_25px_rgba(34,211,238,0.9)] flex items-center justify-center">
                      <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex items-center justify-center text-cyan-300">
                        <MousePointerClick size={16} />
                      </div>
                    </div>

                    {/* Floating Live Action Speech Card Attached to AI Cursor */}
                    {currentStep && (
                      <div className="min-w-[230px] max-w-[290px] p-3 rounded-2xl bg-slate-950/95 border border-cyan-400/60 text-slate-100 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-cyan-400 mb-1">
                          <span>
                            WİFO AI FİZİKSEL EYLEM #{currentStep.stepNumber}
                          </span>
                          <span>
                            ({cursorPos.x}%, {cursorPos.y}%)
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          {currentStep.actionLabel}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {currentStep.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Command Bar inside Stage: Tell AI what physical action to do next */}
              <form
                onSubmit={handleFollowUpSubmit}
                className={`p-3.5 border-t flex flex-wrap items-center gap-2 ${
                  isDarkMode
                    ? 'bg-[#101726] border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs font-semibold text-cyan-400 shrink-0 pl-1">
                  Fiziksel Komut Ver:
                </div>
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder="Örn: Sağ üst köşedeki detayı fiziksel olarak incele veya buradaki tasarımı iyileştir (veya doğrudan sahneye tıklayın)..."
                  className={`flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border text-xs outline-none ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs cursor-pointer shrink-0"
                >
                  <Send size={13} />
                  <span>İmleci Gönder & Uygula</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: AI Physical Action Timeline & Summary Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div
              className={`p-5 rounded-3xl border flex-1 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-[#0F1626] border-slate-800/90 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-500/15 pb-3">
                  <div>
                    <div className="text-xs text-cyan-400 font-semibold">
                      Canlı Fiziksel İşlem Günlüğü
                    </div>
                    <h2 className="font-display text-base font-bold mt-0.5">
                      Yapay Zekanın Yaptığı Fiziksel İşlemler
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStepIdx(0);
                      setIsAutoPlaying(true);
                    }}
                    className={`p-2 rounded-xl border text-xs cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                    title="Fiziksel Taramayı Baştan Başlat"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {/* Extracted Color Palette if Image */}
                {activeFile.extractedColors && activeFile.extractedColors.length > 0 && (
                  <div
                    className={`p-3 rounded-2xl border ${
                      isDarkMode
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-400 mb-2">
                      Fiziksel Olarak Çıkarılan Piksel Renk Spektrumu
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFile.extractedColors.map((hex, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[11px] font-mono"
                        >
                          <span
                            className="w-5 h-5 rounded-lg border border-white/20 shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Physical Actions List */}
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                  {steps.map((step, index) => {
                    const isCurrent = index === activeStepIdx;
                    const isDone = completedStepIds.includes(step.id);

                    return (
                      <div
                        key={step.id}
                        onClick={() => handleSelectStepManual(index)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isCurrent
                            ? isDarkMode
                              ? 'bg-cyan-950/35 border-cyan-400/80 text-white shadow-md'
                              : 'bg-cyan-50 border-cyan-500 text-slate-900'
                            : isDarkMode
                            ? 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: step.color }}
                              className="w-5 h-5 rounded-lg text-[11px] font-bold text-slate-950 flex items-center justify-center shrink-0"
                            >
                              {step.stepNumber}
                            </span>
                            <span className="font-display font-bold text-xs">
                              {step.title}
                            </span>
                          </div>
                          {isDone && (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-cyan-400 mb-1">
                          {step.actionLabel} · Konum ({step.xPercent}%, {step.yPercent}%)
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Overall AI Conversational Summary */}
                {activeFile.aiSummary && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isDarkMode
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-cyan-400 mb-1">
                      Yapay Zeka İnceleme Notu:
                    </div>
                    <p>{activeFile.aiSummary}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-500/15 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Sahneye tıklayarak imleci istediğiniz yere yönlendirin</span>
                <button
                  type="button"
                  onClick={onBackToChat}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Sohbete Dön →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
