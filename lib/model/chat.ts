import { ChatModelConfig } from "./model";

export const MessageRoles = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof MessageRoles)[number];

export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  model?: any;
};

export interface ChatStatistcs {
  tokenCount: number;
  wordCount: number;
  characterCount: number;
}

export interface ChatSession {
  id: string;
  topic: string;

  context: RequestMessage[];
  memoryPrompt: string;
  messages: ChatMessage[];
  statistics: ChatStatistcs;

  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;

  modelConfig: ChatModelConfig;
}