export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  isFavorite?: boolean;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
      role?: string;
    };
    index?: number;
    finish_reason?: string;
  }>;
  id?: string;
  object?: string;
  created?: number;
  model?: string;
}

export interface ChatSettings {
  voiceSpeed: number;
  voicePitch: number;
  darkMode: boolean;
}