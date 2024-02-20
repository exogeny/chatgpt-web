import {
  EventStreamContentType,
  fetchEventSource,
  FetchEventSourceInit,
} from "@fortaine/fetch-event-source";
import { ChatOptions, ClientProvider } from "../api";
import { prettyObject } from "@/lib/utils/format";
import { OpenAIChatModel } from "@/lib/model/model";

function processStream(
  path: string,
  payload: FetchEventSourceInit,
  options: ChatOptions,
  controller: AbortController,
  requestTimeoutId?: ReturnType<typeof setTimeout>,
) {
  let responseText = "";
  let remainText = "";
  let finished = false;

  function animateResponseText() {
    if (finished || controller.signal.aborted) {
      responseText += remainText;
      return;
    }

    if (remainText.length > 0) {
      const fetchCount = Math.max(1, Math.round(remainText.length / 60));
      const fetchText = remainText.slice(0, fetchCount);
      responseText += fetchText;
      remainText = remainText.slice(fetchCount);
      options.onUpdate?.(responseText, fetchText);
    }

    requestAnimationFrame(animateResponseText);
  }

  animateResponseText();
  const finish = () => {
    if (!finished) {
      finished = true;
      options.onFinish(responseText + remainText);
    }
  }
  controller.signal.onabort = finish;

  fetchEventSource(path, {
    ...payload,
    async onopen(res) {
      clearTimeout(requestTimeoutId);

      const contentType = res.headers.get("content-type");
      if (contentType?.startsWith("text/plain")) {
        responseText = await res.clone().text();
        return finish();
      }

      if (!res.ok || res.status !== 200 ||
        !res.headers.get("content-type")?.startsWith(EventStreamContentType)
      ) {
        const responseTexts = [responseText];
        let extraInfo = await res.clone().text();
        try {
          const resJson = await res.clone().json();
          extraInfo = prettyObject(resJson);
        } catch { }

        if (res.status === 401) {
          responseTexts.push("Unauthorized access");
        }

        if (extraInfo) {
          responseTexts.push(extraInfo);
        }

        responseText = responseTexts.join("\n");
        return finish();
      }
    },
    onmessage(message) {
      if (message.data === "[DONE]" || finished) {
        return finish();
      }

      const text = message.data;
      try {
        const json = JSON.parse(text) as {
          choices: Array<{
            delta: {
              content: string;
            };
          }>;
        };

        const delta = json.choices?.at(0)?.delta?.content;
        if (delta) {
          remainText += delta;
        }
      } catch (e) {
        console.error("[Response Animation] failed to parse json: ", e);
      }
    },
    onclose() {
      finish();
    },
    onerror(e) {
      options.onError?.(e);
      throw e;
    },
    openWhenHidden: true,
  });
}

export class OpenAIProvider implements ClientProvider {
  async chat(options: ChatOptions) {
    const messages = options.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: options.config.model,
      temperature: options.config.temperature,
      presence_penalty: options.config.presence_penalty,
      frequency_penalty: options.config.frequency_penalty,
      top_p: options.config.top_p,
    };

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = "/api/openai/chat";
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      };

      const requestTimeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);

      if (shouldStream) {
        processStream(chatPath, chatPayload, options, controller, requestTimeoutId);
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);
        const resJson = await res.json();
        const message = resJson.choices?.at(0)?.message?.content ?? "";
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }

  async models() {
    const res = await fetch(
      "/api/openai/models",
      {
        method: "GET",
      },
    );
    const resJson = (await res.json()) as OpenAIChatModel;
    const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
    if (!chatModels) {
      return [];
    }

    return chatModels.map((m) => ({
      name: m.id,
    }));
  }
};
