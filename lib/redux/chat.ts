
import { nanoid } from "nanoid";
import { createPersistStore } from "./store";
import { ChatMessage, ChatSession } from "../model/chat";
import { StoreKey } from "../configs/constant";
import { ChatModelConfig, ChatModelType, KnowledgeCutOffDate } from "../model/model";
import { ClientAPI, ModelProvider } from "../client/api";
import { prettyObject } from "../utils/format";
import { ChatControllerPool } from "../client/controller";

export const DefaultTopic = "New Topic";
export const DefaultSystemTemplate = `
You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: $x^2$ 
Latex block: $$e=mc^2$$
`;

export function createEmptyModelConfig(): ChatModelConfig {
  return {
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    top_p: 1,
    max_token: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
    enableInjectSystemPrompts: true,
    template: `{{input}}`,
  } as ChatModelConfig;
}

function countMessages(messages: ChatMessage[]) {
  return messages.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

function estimateTokenLength(text: string): number {
  let tokenCount = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode < 128) {
      if (charCode <= 122 && charCode >= 65) {
        tokenCount += 0.25;
      } else {
        tokenCount += 0.5;
      }
    } else {
      tokenCount += 1.5;
    }
  }
  return tokenCount;
}

function fillTemplateWith(input: string, modelConfig: ChatModelConfig) {
  let cutoff = KnowledgeCutOffDate[modelConfig.model] ?? KnowledgeCutOffDate.default;
  const vars = {
    cutoff,
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    input: input,
  };

  let output = modelConfig.template ?? `{{input}}`;
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }
  Object.entries(vars).forEach(([key, value]) => {
    output = output.replace(`{{${key}}}`, value);
  });
  return output;
}

function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: DefaultTopic,
    memoryPrompt: "",
    context: [],
    messages: [],
    statistics: {
      tokenCount: 0,
      wordCount: 0,
      characterCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    modelConfig: createEmptyModelConfig(),
  } as ChatSession;
}

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}

const DefaultChatState = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
};

export const useChatStore = createPersistStore(
  DefaultChatState,

  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },

      selectSession(index: number) {
        set({ currentSessionIndex: index });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      createSession() {
        const session = createEmptySession();

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      removeSession(index: number) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) {
          return;
        }

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length = 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];
        return session;
      },

      onCreateMessage(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat();
          session.lastUpdate = Date.now();
        });
        get().updateStatistics(message);
        get().summarizeSession();
      },

      updateStatistics(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.statistics.characterCount += message.content.length;
        });
      },

      summarizeSession() {
        const session = get().currentSession();
        const modelConfig = session.modelConfig;

        var api: ClientAPI;
        if (modelConfig.model === "gemini-pro") {
          api = new ClientAPI(ModelProvider.GeminiPro);
        } else {
          api = new ClientAPI(ModelProvider.OpenAI);
        }

        const messages = session.messages;
        const MIN_SUMMARIZE_LENGTH = 50;
        if (session.topic === DefaultTopic &&
          countMessages(messages) > MIN_SUMMARIZE_LENGTH
        ) {
          const topicMessages = messages.concat(
            createMessage({
              role: "user",
              content: "lease generate a four to five word title summarizing " +
                "our conversation without any lead-in, punctuation, " +
                "quotation marks, periods, symbols, bold text, or additional " +
                "text.Remove enclosing quotation marks.",
            }),
          );
          api.chat({
            messages: topicMessages,
            config: {
              model: "gpt-3.5-turbo",
            },
            onFinish(message) {
              get().updateCurrentSession((session) => {
                session.topic = message.length > 0 ? message.trim() : DefaultTopic;
              });
            }
          });
        }

        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMessages = messages
          .filter((message) => !message.isError)
          .slice(summarizeIndex);
        const historyMessageCount = countMessages(toBeSummarizedMessages);
        if (historyMessageCount > (modelConfig?.max_token ?? 4000)) {
          const n = toBeSummarizedMessages.length;
          toBeSummarizedMessages = toBeSummarizedMessages.slice(
            Math.max(0, n - (modelConfig?.historyMessageCount ?? 0)),
          );
        }

        toBeSummarizedMessages.unshift(get().getPromptWithMemory());
        const lastSummarizeIndex = session.messages.length;
        const compressMessageLengthThreshold = 
          modelConfig?.compressMessageLengthThreshold ?? 1000;
        console.log(
          "[Chat History] ",
          toBeSummarizedMessages,
          historyMessageCount,
          compressMessageLengthThreshold,
        );
        if (historyMessageCount > compressMessageLengthThreshold &&
          modelConfig?.sendMemory
        ) {
          api.chat({
            messages: toBeSummarizedMessages.concat(
              createMessage({
                role: "system",
                content: "Summarize the discussion briefly in 200 words or " +
                  "less to use as a prompt for future context.",
                date: "",
              }),
            ),
            config: { ...modelConfig, stream: true, model: "gpt-3.5-turbo" },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message) {
              console.log("[Summarize] ", message);
              get().updateCurrentSession((session) => {
                session.lastSummarizeIndex = lastSummarizeIndex;
                session.memoryPrompt = message;
              });
            },
            onError(err) {
              console.error("[Summarize] ", err)
            },
          });
        }
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      async onUserInput(
        content: string,
        updateMessageId: (id: string) => void,
        setIsFinished?: (finished: boolean) => void)
      {
        setIsFinished?.(false);
        const session = get().currentSession();
        const modelConfig = session.modelConfig;
        const userContent = fillTemplateWith(content, modelConfig);
        console.log("[User Input] after template: ", userContent);

        const userMessage: ChatMessage = createMessage({
          role: "user",
          content: userContent,
        });
        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
        });
        updateMessageId(botMessage.id);

        // recent messages
        const recentMessages = get().getMessagesWithMemory();
        const sendMessages = recentMessages.concat(userMessage);
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          const savedUserMessage = {
            ...userMessage,
            content,
          };
          session.messages = session.messages.concat([
            savedUserMessage, botMessage,
          ]);
        });

        var api: ClientAPI;
        if (modelConfig.model === "gemini-pro") {
          api = new ClientAPI(ModelProvider.GeminiPro);
        } else {
          api = new ClientAPI(ModelProvider.OpenAI);
        }

        api.chat({
          messages: sendMessages,
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
          },
          onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;
              get().onCreateMessage(botMessage);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
            setIsFinished?.(true);
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content +=
              "\n\n" + prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            console.error("[Chat] error: ", error);
            setIsFinished?.(true);
          },
          onController(controller) {
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller
            );
          },
        });
      },

      getMessagesWithMemory() {
        const session = get().currentSession();
        const modelConfig = session.modelConfig;
        const clearContextIndex = session.clearContextIndex ?? 0;
        const messages = session.messages.slice();
        const totalMessageCount = messages.length;
        const contextPrompts = session.context.slice();
        const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts &&
          modelConfig.model.startsWith("gpt-");

        var systemPrompts: ChatMessage[] = [];
        systemPrompts = shouldInjectSystemPrompts
          ? [
            createMessage({
              role: "system",
              content: fillTemplateWith("", {
                ...modelConfig,
                template: DefaultSystemTemplate,
              }),
            }),
          ] : [];
        if (shouldInjectSystemPrompts) {
          console.log("[System Prompt] ", systemPrompts.at(0)?.content ?? "empty");
        }

        const shouldSendLongTermMemory = modelConfig.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 &&
          session.lastSummarizeIndex > clearContextIndex;
        const longTermMemoryPrompts = shouldSendLongTermMemory
          ? [get().getPromptWithMemory()] : [];
        const longTermMemoryStartIndex = session.lastSummarizeIndex;
        const shortTermMemoryStartIndex = Math.max(
          0, totalMessageCount - (modelConfig?.historyMessageCount ?? 0));

        // concat send messages, including:
        // 0. system prompt: to get close to OpenAI Web ChatGPT
        // 1. long term memory: summarized memory messages
        // 2. pre-defined in-context prompts
        // 3. short term memory: latest n messages
        // 4. newest input message
        const memoryStartIndex = shouldSendLongTermMemory
          ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
          : shortTermMemoryStartIndex;
        const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
        const maxTokenThreadshold = modelConfig?.max_token ?? 4000;
        const reversedRecentMessages = [];
        for (
          let i = totalMessageCount - 1, tokenCount = 0;
          i >= contextStartIndex && tokenCount < maxTokenThreadshold;
          i -= 1
        ) {
          const msg = messages[i];
          if (!msg || msg.isError) {
            continue;
          }
          tokenCount += estimateTokenLength(msg.content);
          reversedRecentMessages.push(msg);
        }

        const recentMessages = [
          ...systemPrompts,
          ...longTermMemoryPrompts,
          ...contextPrompts,
          ...reversedRecentMessages.reverse(),
        ];
        return recentMessages;
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },

      clearAll() {
        localStorage.clear();
        location.reload();
      },

      getPromptWithMemory() {
        const session = get().currentSession();
        return {
          role: "system",
          content: session.memoryPrompt.length > 0
            ? "This is a summary of the chat history as a recap: " + session.memoryPrompt
            : "",
          date: "",
        } as ChatMessage;
      },
    };
    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 1.0,
    migrate(persistedState, version) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state)) as typeof DefaultChatState;

      return newState as any;
    }
  }
)
