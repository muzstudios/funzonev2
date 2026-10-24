export type AILevel =
  | 'A1'
  | 'A1+'
  | 'A2-'
  | 'A2'
  | 'A2+'
  | 'A3_QUANTUM'
  | 'Q_PU_9000';

export type ProcessorTechType = 'TENSOR' | 'QUBIT';

export type AppMode =
  | 'chat'
  | 'physical_workspace'
  | 'a_series'
  | 'analytics'
  | 'bioscience'
  | 'qpu_9000'
  | 'image'
  | 'processor'
  | 'settings';

export type DroppedItemKind = 'image' | 'website' | 'code' | 'document';

export interface PhysicalActionStep {
  id: string;
  stepNumber: number;
  title: string;
  actionLabel: string;
  description: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  color: string;
  physicalEffect?: string;
}

export interface DroppedFilePayload {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  kind: DroppedItemKind;
  dataUrl?: string;
  textContent?: string;
  webUrl?: string;
  timestamp: number;
  aiGreeting?: string;
  aiSummary?: string;
  physicalSteps?: PhysicalActionStep[];
  extractedColors?: string[];
  dimensions?: { width: number; height: number };
}

export type UserRole = 'founder' | 'member' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  joinedAt: number;
}

export interface QuantumTelemetry {
  processorName: string;
  qubitsActive: number;
  coherenceRatio: string;
  coherence?: string;
  latencyMs: number;
  quantumFlux: string;
  giftA2Active: boolean;
  usedFallback?: boolean;
  targetWriteSeconds?: number;
  techType?: ProcessorTechType;
  techTierLabel?: string;
}

export type MessageFeedback = 'like' | 'dislike' | null;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  botName?: string;
  modelTag?: string;
  quantumTelemetry?: QuantumTelemetry;
  feedback?: MessageFeedback;
  writeDurationSec?: number;
  droppedFile?: DroppedFilePayload;
}

export type NotificationCategory = 'gift_code' | 'chat_history' | 'model_switch' | 'system';
export type NotificationSeverity = 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: number;
  read: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  giftCodeEvents: boolean;
  chatHistoryEvents: boolean;
  modelSwitchEvents: boolean;
  securityAndQuotaEvents: boolean;
}

export type VoiceProfileId =
  | 'natural_assistant'
  | 'deep_commander'
  | 'quantum_cyber'
  | 'energetic_nova'
  | 'calm_sage'
  | 'custom_studio';

export interface VoiceSettings {
  profileId: VoiceProfileId;
  pitch: number; // 0.5 to 1.8
  rate: number; // 0.6 to 1.6
  volume: number; // 0.1 to 1.0
  selectedVoiceURI: string;
  quantumResonance: boolean;
  autoSpeak: boolean;
}
