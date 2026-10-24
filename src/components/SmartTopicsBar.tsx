import React, { useMemo, useState } from 'react';
import {
  GripVertical,
  RefreshCw,
  ArrowUpRight,
  BookmarkCheck,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Message } from '../types';

export interface SmartTopicItem {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

interface SmartTopicsBarProps {
  messages: Message[];
  isDarkMode: boolean;
  activeSessionTitle: string;
  onSelectTopicPrompt: (prompt: string, title: string) => void;
  onApplySessionTitle: (title: string) => void;
  onDragStartTopic: (topic: SmartTopicItem) => void;
  onDragEndTopic: () => void;
}

function generateContextualTopics(messages: Message[], seed: number): SmartTopicItem[] {
  const combinedText = messages
    .slice(-4)
    .map((m) => m.content.toLowerCase())
    .join(' ');

  const pools: SmartTopicItem[] = [];

  if (
    combinedText.includes('python') ||
    combinedText.includes('kod') ||
    combinedText.includes('class') ||
    combinedText.includes('yazılım') ||
    combinedText.includes('algoritma')
  ) {
    pools.push(
      {
        id: 'code-opt',
        title: 'Kuantum Algoritma Optimizasyonu',
        prompt:
          'Az önceki kodu performans, bellek yönetimi ve zaman karmaşıklığı (Big-O) açısından optimize edip açıklar mısın?',
        category: 'Yazılım Mimarisi',
      },
      {
        id: 'code-test',
        title: 'Birim Testleri ve Hata Yakalama',
        prompt:
          'Bu kod yapısı için kapsamlı birim testleri (unit test) ve uç durum (edge-case) hata yakalama mekanizması yazar mısın?',
        category: 'Kalite & Test',
      },
      {
        id: 'code-async',
        title: 'Paralel ve Asenkron İşleme',
        prompt:
          'Bu mimariyi çoklu iş parçacığı (multi-threading) veya asenkron kuantum kuyruk yapısıyla nasıl ölçeklendirebiliriz?',
        category: 'İleri Mühendislik',
      },
      {
        id: 'code-api',
        title: 'REST & WebSocket Servis Entegrasyonu',
        prompt:
          'Bu modülü gerçek zamanlı bir mikroservis API uç noktasına dönüştürmek için örnek mimariyi oluşturur musun?',
        category: 'Sistem Tasarımı',
      }
    );
  }

  if (
    combinedText.includes('hediye') ||
    combinedText.includes('quantum-10') ||
    combinedText.includes('a2') ||
    combinedText.includes('kota')
  ) {
    pools.push(
      {
        id: 'gift-a2-compare',
        title: 'WİFO A3 Quantum ve Hediye A2 Karşılaştırması',
        prompt:
          'WİFO A3 QUANTUM ile hediye olarak açılan WİFO A2 modelinin güçlü yönlerini ve hangi senaryolarda kullanılacağını karşılaştırır mısın?',
        category: 'Model Analizi',
      },
      {
        id: 'gift-vip-features',
        title: '10 Kişilik Kuantum Yetkileri',
        prompt:
          'QUANTUM-10 hediye kodu ile aktifleşen 1024 Qubit Q-PU 9000 işlemcisinin sunduğu tüm ayrıcalıkları detaylandır.',
        category: 'Özel Erişim',
      }
    );
  }

  if (
    combinedText.includes('kuantum') ||
    combinedText.includes('işlemci') ||
    combinedText.includes('qubit') ||
    combinedText.includes('q-pu')
  ) {
    pools.push(
      {
        id: 'qpu-superposition',
        title: '1024 Qubit Süperpozisyon Mimarisi',
        prompt:
          'Q-PU 9000 işlemcisindeki 1024 Qubit süperpozisyon ve kuantum dolanıklık prensibinin yapay zeka çıkarım hızını nasıl artırdığını açıkla.',
        category: 'Kuantum Fizik',
      },
      {
        id: 'qpu-error-correction',
        title: 'Kuantum Hata Düzeltme Matrisi',
        prompt:
          'Kuantum hesaplamada %99.94 tutarlılık (coherence) oranını korumak için kullanılan gürültü engelleme teknikleri nelerdir?',
        category: 'Donanım & Çekirdek',
      }
    );
  }

  const defaultTopics: SmartTopicItem[] = [
    {
      id: 'gen-architecture',
      title: 'Derinlemesine Sistem Mimarisi Özeti',
      prompt:
        'Şu ana kadar konuştuğumuz konuyu maddeler halinde yapılandırılmış bir teknik mimari raporu olarak özetler misin?',
      category: 'Akıllı Özet',
    },
    {
      id: 'gen-python-sim',
      title: 'Python Kuantum Devre Simülatörü',
      prompt:
        'Bana Python ile çalışan, 1024 Qubit durum vektörünü simüle eden temiz ve modüler bir örnek kod yazar mısın?',
      category: 'Kod Üretimi',
    },
    {
      id: 'gen-strategy',
      title: '2026 Yapay Zeka Yol Haritası',
      prompt:
        'Bu konu çerçevesinde uygulanabilir 5 adımlı ileri seviye bir strateji ve eylem planı hazırlar mısın?',
      category: 'Strateji',
    },
    {
      id: 'gen-founder-vision',
      title: 'WİFO Şirketi & Kurucu Vizyonu',
      prompt:
        'WİFO Şirketi kurucusu FE OWNER BATUHAN vizyonuyla geliştirilen A3 Quantum ve A2 ekosisteminin teknolojik hedefleri nelerdir?',
      category: 'Kurumsal Vizyon',
    },
    {
      id: 'gen-creative',
      title: 'Yaratıcı Senaryo & Felsefi Analiz',
      prompt:
        'Konuştuğumuz konuyu geleceğin teknolojisi açısından felsefi ve yaratıcı bir bakış açısıyla değerlendirir misin?',
      category: 'Derin Düşünce',
    },
    {
      id: 'gen-security',
      title: 'Kuantum Şifreleme & Güvenlik Protokolü',
      prompt:
        'Kuantum bilgisayarlar çağında veri güvenliği ve post-kuantum kriptografi algoritmaları nasıl çalışır?',
      category: 'Siber Güvenlik',
    },
  ];

  const merged = [...pools, ...defaultTopics];
  const uniqueMap = new Map<string, SmartTopicItem>();
  merged.forEach((item) => uniqueMap.set(item.id, item));
  const uniqueList = Array.from(uniqueMap.values());

  const offset = seed % uniqueList.length;
  const rotated = [...uniqueList.slice(offset), ...uniqueList.slice(0, offset)];
  return rotated.slice(0, 4);
}

export const SmartTopicsBar: React.FC<SmartTopicsBarProps> = ({
  messages,
  isDarkMode,
  activeSessionTitle,
  onSelectTopicPrompt,
  onApplySessionTitle,
  onDragStartTopic,
  onDragEndTopic,
}) => {
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const suggestedTopics = useMemo(
    () => generateContextualTopics(messages, refreshSeed),
    [messages, refreshSeed]
  );

  return (
    <div
      className={`px-5 py-2.5 border-b transition-colors ${
        isDarkMode ? 'bg-[#0A0F1A] border-slate-800/80' : 'bg-slate-50/70 border-slate-200/80'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Layers size={13} className="text-cyan-400 shrink-0" />
          <span className="font-display font-semibold">Akıllı Başlık Önerileri</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Sohbete sürükleyip bırakın veya tek tıkla konuyu başlatın
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshSeed((prev) => prev + 1)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isDarkMode
                ? 'bg-[#121929] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Sohbet bağlamına göre yeni akıllı başlıklar öner"
          >
            <RefreshCw size={11} />
            <span>Yenile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isDarkMode
                ? 'bg-[#121929] border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isExpanded ? 'Akıllı Başlıkları Daralt' : 'Akıllı Başlıkları Genişlet'}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>{isExpanded ? 'Daralt' : 'Göster'}</span>
          </button>
        </div>
      </div>

      {/* Draggable & Single-Click Smart Topic Cards */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5">
          {suggestedTopics.map((topic) => {
            const isBeingDragged = draggingId === topic.id;
            const isCurrentTitle = activeSessionTitle === topic.title;

            return (
              <div
                key={topic.id}
                draggable
                onDragStart={(e) => {
                  setDraggingId(topic.id);
                  e.dataTransfer.setData('text/plain', topic.prompt);
                  e.dataTransfer.setData('application/x-funzone-topic', JSON.stringify(topic));
                  e.dataTransfer.effectAllowed = 'copyMove';
                  onDragStartTopic(topic);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  onDragEndTopic();
                }}
                className={`group relative p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between ${
                  isBeingDragged
                    ? 'opacity-50 scale-95 border-cyan-400'
                    : isCurrentTitle
                    ? isDarkMode
                      ? 'bg-[#152036] border-cyan-500/50'
                      : 'bg-blue-50/90 border-blue-400'
                    : isDarkMode
                    ? 'bg-[#0F1626] border-slate-800/90 hover:border-slate-700'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 truncate">
                      <GripVertical
                        size={11}
                        className="text-slate-500 group-hover:text-cyan-400 shrink-0"
                      />
                      <span>{topic.category}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplySessionTitle(topic.title);
                      }}
                      className={`flex items-center gap-1 text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrentTitle
                          ? 'text-cyan-400 font-semibold'
                          : 'text-slate-400 hover:text-cyan-400'
                      }`}
                      title="Sohbet Başlığı Olarak Ata"
                    >
                      <BookmarkCheck size={11} />
                      <span>{isCurrentTitle ? 'Aktif Başlık' : 'Başlık Yap'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTopicPrompt(topic.prompt, topic.title)}
                    className="text-left w-full group/btn cursor-pointer"
                  >
                    <h4
                      className={`font-display text-xs font-bold leading-snug flex items-center justify-between gap-1 ${
                        isDarkMode
                          ? 'text-slate-100 group-hover/btn:text-cyan-300'
                          : 'text-slate-900 group-hover/btn:text-blue-600'
                      }`}
                    >
                      <span className="truncate">{topic.title}</span>
                      <ArrowUpRight
                        size={13}
                        className="shrink-0 opacity-60 group-hover/btn:opacity-100"
                      />
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{topic.prompt}</p>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
