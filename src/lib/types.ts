export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  tokensCount?: number;
  modelUsed?: string;
  error?: boolean;
}

export type PersonaId = 'coder' | 'writer' | 'expert' | 'tutor' | 'creative';

export interface Persona {
  id: PersonaId;
  name: string;
  title: string;
  description: string;
  iconName: string;
  systemPrompt: string;
  badgeColor: string;
}

export type LLMProvider = 'demo' | 'gemini' | 'openai';

export interface ModelSettings {
  provider: LLMProvider;
  modelName: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  personaId: PersonaId;
}

export interface PromptSuggestion {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category: 'code' | 'creative' | 'explain' | 'productivity';
  icon: string;
}
