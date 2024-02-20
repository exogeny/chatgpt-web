import { RequestMessage } from "../model/chat";
import { ChatModelConfig } from "../model/model";
import { OpenAIProvider } from "./providers/openai";

export enum ModelProvider {
  OpenAI = "OpenAI",
  GeminiPro = "GeminiPro",
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: ChatModelConfig & { stream?: boolean };

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export interface ClientProvider {
  chat(options: ChatOptions): Promise<void>;
  models(): Promise<{ name: string; }[]>;
};

export class ClientAPI {
  private provider: ClientProvider;

  constructor(provider: ModelProvider = ModelProvider.OpenAI) {
    if (provider === ModelProvider.OpenAI) {
      this.provider = new OpenAIProvider();
    } else {
      throw new Error("Invalid provider");
    }
  }

  config() { }

  prompts() { }

  chat(options: ChatOptions): Promise<void> {
    return this.provider.chat(options);
  }

  models() {
    return this.provider.models();
  }
};