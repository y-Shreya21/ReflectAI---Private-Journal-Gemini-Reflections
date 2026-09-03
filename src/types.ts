export type ReflectionMode = 'reflect' | 'summarize' | 'brainstorm';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  initialPrompt: string;
  initialResponse: string;
  messages: ChatMessage[];
  mode: ReflectionMode;
  modelUsed: string;
  mood?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ThreatItem {
  zone: string;
  threat: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  countermeasure: string;
}
