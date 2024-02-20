export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2021-09",
  "gpt-4-1106-preview": "2023-04",
  "gpt-4-vision-preview": "2023-04",
};

export interface OpenAIChatModel {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
};

export interface ChatModelConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  max_token?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  sendMemory?: boolean;
  historyMessageCount?: number;
  compressMessageLengthThreshold?: number;
  enableInjectSystemPrompts?: boolean;
  template?: string;
};