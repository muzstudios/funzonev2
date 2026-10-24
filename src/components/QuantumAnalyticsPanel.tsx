import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  Cpu,
  Zap,
  Gauge,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AILevel, Message } from '../types';

interface QuantumAnalyticsPanelProps {
  messages: Message[];
  isDarkMode: boolean;
  activeAiLevel: AILevel;
}

interface TelemetryDataPoint {
  index: number;
  label: string;
  time: string;
  botName: string;
  processor: string;
  qubits: number;
  latencyMs: number;
  coherence: number;
  energyQj: number;
  tokensPerSec: number;
  charCount: number;
  quantumFlux: string;
  isLiveMessage: boolean;
}

export const QuantumAnalyticsPanel: React.FC<QuantumAnalyticsPanelProps> = ({
  messages,
  isDarkMode,
  activeAiLevel,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [chartTab, setChartTab] = useState<'qubit_energy' | 'latency_speed' | 'details'>('qubit_energy');

  // Build telemetry dataset from assistant messages in chat history
  const telemetryData: TelemetryDataPoint[] = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    const mapped: TelemetryDataPoint[] = assistantMessages.map((msg, idx) => {
      const bot = msg.botName || 'WİFO A3 QUANTUM';
      const isQpu9000 =
        bot.includes('Q-PU 9000') ||
        (msg.quantumTelemetry?.qubitsActive ?? 0) >= 2048;
      const isA3 =
        !isQpu9000 &&
        (bot.includes('A3') || (msg.quantumTelemetry?.qubitsActive ?? 0) >= 1024);
      const isA2 = !isQpu9000 && !isA3 && bot.includes('A2');

      const qubits =
        msg.quantumTelemetry?.qubitsActive ||
        (isQpu9000 ? 4096 : isA3 ? 1024 : isA2 ? 512 : 256);

      // Parse coherence string like "99.94%" -> 99.94
      const rawCoherence = msg.quantumTelemetry?.coherenceRatio
        ? parseFloat(msg.quantumTelemetry.coherenceRatio.replace('%', ''))
        : isQpu9000
        ? 99.99
        : isA3
        ? 99.94
        : isA2
        ? 99.42
        : 98.85;

      const charCount = msg.content?.length || 160;
      const latencyMs =
        msg.quantumTelemetry?.latencyMs ||
        (isQpu9000
          ? 38 + (idx * 7) % 25
          : isA3
          ? 145 + (idx * 23) % 90
          : isA2
          ? 240 + (idx * 31) % 110
          : 360 + (idx * 41) % 140);

      const energyQj = Number(((charCount * qubits) / 12500).toFixed(2));
      const tokensPerSec = isQpu9000 ? 1480 : isA3 ? 285 : isA2 ? 110 : 48;

      const timeStr = new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        index: idx + 1,
        label: `Yanıt #${idx + 1}`,
        time: timeStr,
        botName: bot,
        processor:
          msg.quantumTelemetry?.processorName ||
          msg.modelTag ||
          (isQpu9000 ? 'Q-PU 9000 Hyper-Core' : 'WİFO Q-PU 9000'),
        qubits,
        latencyMs,
        coherence: Number.isNaN(rawCoherence) ? 99.9 : rawCoherence,
        energyQj,
        tokensPerSec,
        charCount,
        quantumFlux:
          msg.quantumTelemetry?.quantumFlux ||
          (isQpu9000 ? '12.8 THz · Hiper-Akış' : isA3 ? '4.2 THz · Süperpozisyon' : '2.4 THz · Kanal'),
        isLiveMessage: true,
      };
    });

    // If only 1 welcome message exists so far, prepend 3 baseline Q-PU 9000 calibration points so the chart is immediately rich
    if (mapped.length < 3) {
      const now = Date.now();
      const baseline: TelemetryDataPoint[] = [
        {
          index: 1,
          label: 'Kalibrasyon #1',
          time: new Date(now - 180000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          botName: 'WİFO A1+',
          processor: 'Q-PU 9000 · Alt Küme',
          qubits: 256,
          latencyMs: 310,
          coherence: 98.9,
          energyQj: 4.8,
          tokensPerSec: 52,
          charCount: 230,
          quantumFlux: '1.4 THz · Baz Düğüm',
          isLiveMessage: false,
        },
        {
          index: 2,
          label: 'Kalibrasyon #2',
          time: new Date(now - 120000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          botName: 'WİFO A2 (Hediye)',
          processor: 'Q-PU 9000 · VIP Kanal',
          qubits: 512,
          latencyMs: 215,
          coherence: 99.45,
          energyQj: 11.6,
          tokensPerSec: 115,
          charCount: 285,
          quantumFlux: '2.4 THz · Çift Akış',
          isLiveMessage: false,
        },
        {
          index: 3,
          label: 'Kalibrasyon #3',
          time: new Date(now - 60000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          botName: 'WİFO A3 QUANTUM',
          processor: 'Q-PU 9000 · 1024-Qubit',
          qubits: 1024,
          latencyMs: 142,
          coherence: 99.94,
          energyQj: 26.4,
          tokensPerSec: 285,
          charCount: 320,
          quantumFlux: '4.2 THz · Süperpozisyon',
          isLiveMessage: false,
        },
      ];

      return [
        ...baseline,
        ...mapped.map((item, i) => ({
          ...item,
          index: baseline.length + i + 1,
          label: `Yanıt #${i + 1}`,
        })),
      ];
    }

    return mapped;
  }, [messages]);

  // Summary KPIs
  const summary = useMemo(() => {
    const count = telemetryData.length;
    const totalEnergy = telemetryData.reduce((acc, d) => acc + d.energyQj, 0);
    const avgLatency = Math.round(
      telemetryData.reduce((acc, d) => acc + d.latencyMs, 0) / Math.max(1, count)
    );
    const maxQubits = Math.max(...telemetryData.map((d) => d.qubits), 1024);
    const avgCoherence = (
      telemetryData.reduce((acc, d) => acc + d.coherence, 0) / Math.max(1, count)
    ).toFixed(2);

    return {
      count,
      totalEnergy: totalEnergy.toFixed(2),
      avgLatency,
      maxQubits,
      avgCoherence,
    };
  }, [telemetryData]);

  return (
    <div
      className={`border-t transition-colors ${
        isDarkMode
          ? 'bg-[#0B101B] border-slate-800/80 text-slate-100'
          : 'bg-slate-50/90 border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Panel Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              activeAiLevel === 'Q_PU_9000'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm tracking-tight">
                Kuantum Analiz Paneli (Q-PU 9000 Telemetri)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                CANLI VERİ · {messages.filter((m) => m.role === 'assistant').length} YANIT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sohbet yanıtlarının Qubit kullanımı, Kuantum Enerji yoğunluğu (qJ) ve milisaniye gecikme grafiği
            </p>
          </div>
        </div>

        {/* View Switcher & Collapse Button */}
        <div className="flex flex-wrap items-center gap-1.5">
          {!isCollapsed && (
            <div
              className={`flex items-center p-1 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setChartTab('qubit_energy')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'qubit_energy'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Qubit & Enerji (qJ)
              </button>
              <button
                type="button"
                onClick={() => setChartTab('latency_speed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'latency_speed'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gecikme (ms) & Hız
              </button>
              <button
                type="button"
                onClick={() => setChartTab('details')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'details'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teknik Tablo
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isCollapsed ? (
              <>
                <ChevronDown size={14} />
                <span>Analizi Aç</span>
              </>
            ) : (
              <>
                <ChevronUp size={14} />
                <span>Gizle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="px-4 sm:px-6 pb-5 space-y-4">
          {/* 4 Summary Telemetry KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                isDarkMode ? 'bg-[#111726] border-slate-800/90' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Tepe Qubit Kapasitesi</span>
                <Cpu size={14} className="text-cyan-400" />
              </div>
              <div className="font-mono font-bold text-lg tabular-nums text-cyan-400">
                {summary.maxQubits} Qubit
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Q-PU 9000 Süperpozisyon Düğümü
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDarkMode ? 'bg-[#111726] border-slate-800/90' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Toplam Kuantum Enerjisi</span>
                <Zap size={14} className="text-amber-400" />
              </div>
              <div className="font-mono font-bold text-lg tabular-nums text-amber-400">
                {summary.totalEnergy} qJ
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Yanıt Başına Nöral Akış Yoğunluğu
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDarkMode ? 'bg-[#111726] border-slate-800/90' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Ortalama Gecikme Süresi</span>
                <Gauge size={14} className="text-violet-400" />
              </div>
              <div className="font-mono font-bold text-lg tabular-nums text-violet-400">
                {summary.avgLatency} ms
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kuantum Tünelleme Çıkarım Hızı
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDarkMode ? 'bg-[#111726] border-slate-800/90' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Ortalama Koherans Kararlılığı</span>
                <Activity size={14} className="text-emerald-400" />
              </div>
              <div className="font-mono font-bold text-lg tabular-nums text-emerald-400">
                %{summary.avgCoherence}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hata Düzeltmeli Faz Uyumu
              </div>
            </div>
          </div>

          {/* Chart / Table Viewport */}
          <div
            className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#111726]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {chartTab === 'qubit_energy' && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Yanıtlara Göre Aktif Qubit ve Kuantum Enerji (qJ) Grafiği</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Sol Eksen: Aktif Qubit · Sağ Eksen: Kuantum Enerji (qJ)
                  </span>
                </div>

                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="qubitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: '#22d3ee', fontSize: 11 }}
                        width={48}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#f59e0b', fontSize: 11 }}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: isDarkMode ? '#f8fafc' : '#0f172a',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="qubits"
                        name="Aktif Qubit Sayısı"
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#qubitGrad)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="energyQj"
                        name="Kuantum Enerjisi (qJ)"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#energyGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {chartTab === 'latency_speed' && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Gauge size={14} className="text-violet-400" />
                    <span>Q-PU 9000 Tepki Gecikmesi (ms) ve Sentez Hızı (Token/sn)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Düşük ms = Daha Hızlı Kuantum Tünelleme
                  </span>
                </div>

                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={telemetryData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: '#a78bfa', fontSize: 11 }}
                        width={48}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#34d399', fontSize: 11 }}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: isDarkMode ? '#f8fafc' : '#0f172a',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        yAxisId="left"
                        dataKey="latencyMs"
                        name="Gecikme Süresi (ms)"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="tokensPerSec"
                        name="Üretim Hızı (Token/sn)"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {chartTab === 'details' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Layers size={14} className="text-amber-400" />
                    <span>Mesaj Bazlı Teknik Telemetri Kayıtları</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Toplam {telemetryData.length} Kuantum İşlem Kaydı
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[230px] custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={`border-b text-[11px] uppercase font-mono ${
                          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                        }`}
                      >
                        <th className="py-2 pr-3">Yanıt</th>
                        <th className="py-2 px-3">Model & İşlemci</th>
                        <th className="py-2 px-3">Aktif Qubit</th>
                        <th className="py-2 px-3">Koherans</th>
                        <th className="py-2 px-3">Gecikme</th>
                        <th className="py-2 px-3">Enerji (qJ)</th>
                        <th className="py-2 pl-3">Frekans Akışı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                      {telemetryData.map((row) => (
                        <tr
                          key={row.index}
                          className={
                            isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/70'
                          }
                        >
                          <td className="py-2 pr-3 font-semibold text-cyan-400">
                            {row.label}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">({row.time})</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-sans font-semibold">{row.botName}</span>
                            <span className="text-slate-500 ml-1">· {row.processor}</span>
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-400 tabular-nums">
                            {row.qubits} Qubit
                          </td>
                          <td className="py-2 px-3 text-emerald-400 tabular-nums">
                            %{row.coherence}
                          </td>
                          <td className="py-2 px-3 text-violet-400 tabular-nums">
                            {row.latencyMs} ms
                          </td>
                          <td className="py-2 px-3 text-cyan-300 tabular-nums">
                            {row.energyQj} qJ
                          </td>
                          <td className="py-2 pl-3 text-slate-400">{row.quantumFlux}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
