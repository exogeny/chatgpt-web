import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../button/button";
import { ChatEditor } from "./editor";
import { ChatMessageList } from "./message";
import { Selector } from "../selector/selector";
import styles from "./chat.module.scss";
import DownArrowIcon from "@/public/icons/down.svg";

import RenameIcon from "@/public/icons/rename.svg";
import { DefaultTopic, useChatStore } from "@/lib/redux/chat";
import { ChatModelType, ChatModels } from "@/lib/model/model";

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

function ChatBox() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const titleEditorRef = useRef<HTMLInputElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const [hitBottom, setHitBottom] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();

  const currentModel = session.modelConfig.model;
  const avaiableModels = ChatModels
    .filter((model) => model.available);

  const handleModelSelectorOutsideClick = (e: MouseEvent) => {
    if (modelSelectorRef.current &&
      !modelSelectorRef.current.contains(e.target) &&
      showModelSelector) {
      setShowModelSelector(false);
    }

    if (isEditingTitle && titleEditorRef.current &&
      !titleEditorRef.current.contains(e.target as Node)) {
      setIsEditingTitle(false);
    }
  };

  useEffect(() => {

  }, [chatStore, currentModel]);

  useEffect(() => {
    document.addEventListener("click", handleModelSelectorOutsideClick);

    return () => {
      document.removeEventListener("click", handleModelSelectorOutsideClick);
    };
  })

  return (
    <div className={styles.chat} key={session.id}>
      <div className="window-header">
        <div className={`window-header-title ${styles["chat-box-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-box-main-title"]}`}
            onClick={() => setIsEditingTitle(true)}
          >
            {
              isEditingTitle ? (
                <div className={styles["chat-box-main-title-editor"]}>
                  <input
                    type="text"
                    ref={titleEditorRef}
                    autoFocus={true}
                    onInput={(e) => {
                      chatStore.updateCurrentSession((s) => {
                        if (e.currentTarget.value === "") {
                          s.topic = DefaultTopic;
                        } else {
                          s.topic = e.currentTarget.value;
                        }
                      });
                    }}
                    defaultValue={session.topic} />
                </div>
              ) : (
                <div>{!session.topic ? DefaultTopic : session.topic}</div>
              )
            }
          </div>
          <div className="window-header-sub-title">{session.messages.length} messages</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button" ref={modelSelectorRef}>
            <Button
              icon={<DownArrowIcon />}
              text={currentModel}
              bordered
              className={styles["model-selector-button"]}
              onClick={() => setShowModelSelector(!showModelSelector)}
            />

            {
              showModelSelector && (
                <Selector
                  id="model-selector"
                  defaultSelectedValue={currentModel}
                  items={avaiableModels.map((m) => ({
                    title: m.name,
                    value: m.name,
                  }))}
                  onClose={() => setShowModelSelector(false)}
                  onSelection={(s) => {
                    if (s.length === 0) return;
                    chatStore.updateCurrentSession((session) => {
                      session.modelConfig.model = s[0] as ChatModelType;
                    });
                    // showToast(s[0]);
                  }}
                />
              )
            }
          </div>
          <div className="window-action-button">
            <Button
              icon={<RenameIcon />}
              bordered
              onClick={() => {
                setIsEditingTitle(true);
              }}
            />
          </div>
        </div>
      </div>

      <ChatMessageList
        session={session}
        scrollRef={scrollRef}
        setHitBottom={setHitBottom}
        setAutoScroll={setAutoScroll}
      />
      <ChatEditor
        hitBottom={hitBottom}
        scrollToBottom={scrollDomToBottom}
      />
    </div>
  )
}

export function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  return <ChatBox key={sessionIndex}></ChatBox>
}
