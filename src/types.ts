export type AILevel = 'A1' | 'A1+' | 'A2' | 'A3_QUANTUM' | 'Q_PU_9000';
export type AppMode = 'chat' | 'bioscience' | 'a_series' | 'qpu_9000' | 'image' | 'processor';

export interface QuantumTelemetry {
  processorName: string;
  qubitsActive: number;
  coherenceRatio: string;
  latencyMs: number;
  quantumFlux: string;
  giftA2Active: boolean;
  usedFallback?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'image';
  mediaUrl?: string;
  botName?: string;
  modelTag?: string;
  quantumTelemetry?: QuantumTelemetry;
  feedback?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface GiftCodeStatus {
  code: string;
  altCodes: string[];
  totalLimit: number;
  remainingUses: number;
  isExhausted: boolean;
  reward: {
    primary: string;
    gift: string;
  };
}

export type NotificationCategory = 'gift_code' | 'chat_history' | 'model_switch' | 'system';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  giftCodeEvents: boolean;
  chatHistoryEvents: boolean;
  modelSwitchEvents: boolean;
  securityAndQuotaEvents: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: number;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'founder' | 'member' | 'guest';
  title: string;
  joinedAt: number;
}

export type VoiceProfileId =
  | 'natural_assistant'
  | 'deep_commander'
  | 'quantum_cyborg'
  | 'energetic_nova'
  | 'calm_sage'
  | 'custom_studio';

export interface VoiceSettings {
  profileId: VoiceProfileId;
  pitch: number;
  rate: number;
  volume: number;
  selectedVoiceURI: string;
  quantumResonance: boolean;
  autoSpeak: boolean;
}


