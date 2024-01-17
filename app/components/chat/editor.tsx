import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import styles from "./editor.module.scss";
import SendWhiteIcon from "@/public/icons/send-white.svg";
import { Button } from "../button/button";
import { PromptHintList, RenderPrompt } from "./prompt";
import { ChatActionList } from "./action";

import { StoreKey } from "@/lib/configs/constant";
import { useChatCommand } from "@/lib/command";
import { useChatStore } from "@/lib/redux/chat";
import { usePromptStore } from "@/lib/redux/prompt";

function shouldSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  return e.key === "Enter" && !e.shiftKey;
}

function useScrollToBottom() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollDomToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  useEffect(() => {
    if (autoScroll) {
      scrollDomToBottom();
    }
  });

  return { scrollRef, autoScroll, setAutoScroll, scrollDomToBottom };
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);
  if (!dom) {
    dom = document.createElement("span");
    dom.style.position = "absolute";
    dom.style.wordBreak = "break-word";
    dom.style.fontSize = "14px";
    dom.style.transform = "translateY(-200vh)";
    dom.style.pointerEvents = "none";
    dom.style.opacity = "0";
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }
  return dom!;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom);
  const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom("__measure");
  const singleLineDom = getOrCreateMeasureDom("__single_measure", (dom) => {
    dom.innerText = "ForSingleLineMeasure";
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + "px";
  measureDom.innerText = dom.value !== "" ? dom.value : "2";
  measureDom.style.fontSize = dom.style.fontSize;
  const endWithEmptyLine = dom.value.endsWith("\n");
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height,
  );

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function ChatEditor(props: { isMobileScreen?: boolean }) {
  const navigate = useNavigate();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputRows, setInputRows] = useState(2);
  const [promptHints, setPromptHints] = useState<RenderPrompt[]>([]);
  const [hitBottom, setHitBottom] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
  const autoFocus = props.isMobileScreen ?? false;

  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 2;
      const inputRows = Math.min(20, Math.max(2 + Number(!props.isMobileScreen), rows));
      setInputRows(inputRows);
    }, 100, { leading: true, trailing: true }
  );
  useEffect(measure, [userInput]);

  const chatCommands = useChatCommand({
    create: () => chatStore.createSession(),
    createWithMask: () => navigate("/new"),
    prev: () => chatStore.nextSession(-1),
    next: () => chatStore.nextSession(1),
    clear: () => chatStore.updateCurrentSession(
      (session) => (session.clearContextIndex = session.messages.length),
    ),
    remove: () => chatStore.removeSession(chatStore.currentSessionIndex),
  });

  const onSearch = useDebouncedCallback((text: string) => {
    const matchedPrompts = promptStore.search(text);
    setPromptHints(matchedPrompts);
  }, 100, { leading: true, trailing: true });

  const onPromptSelect = (prompt: RenderPrompt) => {
    setTimeout(() => {
      setPromptHints([]);
      const matchedChatCommand = chatCommands.match(prompt.content);
      if (matchedChatCommand.matched) {
        // user is selected a chat command, just trigger it
        matchedChatCommand.invoke();
        setUserInput("");
      } else {
        setUserInput(prompt.content);
      }
      inputRef.current?.focus();
    }, 30);
  };

  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      // setPromptHint([]);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "ArrowUp" && userInput.length <= 0 && !(e.metaKey || e.altKey || e.ctrlKey)) {
      setUserInput(localStorage.getItem(StoreKey.LastInput) ?? "");
      e.preventDefault();
      return;
    }

    if (shouldSubmit(e) && promptHints.length === 0) {
      submitMessage(userInput);
      e.preventDefault();
    }
  };

  const scrollToBottom = () => {

  };

  const submitMessage = (userInput: string) => {
    if (userInput.trim().length > 0) {
      const matchCommand = chatCommands.match(userInput);
      if (matchCommand.matched) {
        setUserInput("");
        setPromptHints([]);
        matchCommand.invoke();
        return;
      }

      setIsLoading(true);
      chatStore.onUserInput(userInput).then(() => setIsLoading(false));
      localStorage.setItem(StoreKey.LastInput, userInput);
      setUserInput("");
      setPromptHints([]);
      inputRef.current?.focus();
      setAutoScroll(true);
    }
  };

  return (
    <div className={styles["chat-editor"]}>
      <PromptHintList prompts={promptHints} onPromptSelect={onPromptSelect} />

      <ChatActionList
        showPromptModal={() => setShowPromptModal(true)}
        scrollToBottom={scrollToBottom}
        hitBottom={hitBottom}
        showPromptHints={() => {
          if (promptHints.length > 0) {
            setPromptHints([]);
            return;
          }
          inputRef.current?.focus();
          setUserInput("/");
          onSearch("");
        }}
      />

      <div className={styles["chat-editor-inner"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-editor-input"]}
          placeholder="Type a message..."
          onInput={(e) => onInput(e.currentTarget.value)}
          value={userInput}
          onKeyDown={onInputKeyDown}
          onFocus={scrollToBottom}
          onClick={scrollToBottom}
          rows={inputRows}
          autoFocus={autoFocus}
          style={{fontSize: "1.5rem"}}
        />
        <Button
          icon={<SendWhiteIcon />}
          text="Send"
          className={styles["chat-editor-send"]}
          type="primary"
          onClick={() => submitMessage(userInput)}
        />
      </div>
    </div>
  )
}