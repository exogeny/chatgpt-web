import { use, useState } from "react";

import styles from "./chat.module.scss";
import { Button } from "../button/button";
import { ChatMessageList } from "./message";

import RenameIcon from "@/public/icons/rename.svg";
import { DefaultTopic, useChatStore } from "@/lib/redux/chat";
import { ChatEditor } from "./editor";

function ChatBox() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const [isEditingMessage, setIsEditingMessage] = useState(false);

  return (
    <div className={styles.chat} key={session.id}>
      <div className="window-header">
        <div className={`window-header-title ${styles["chat-box-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-box-main-title"]}`}
            onClickCapture={() => setIsEditingMessage(true)}
          >
            {!session.topic ? DefaultTopic : session.topic}
          </div>
          <div className="window-header-sub-title">{session.messages.length} messages</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <Button
              icon={<RenameIcon />}
              bordered
              onClick={() => setIsEditingMessage(true)}
            />
          </div>
        </div>
      </div>

      <ChatMessageList
        session={session}
      />
      <ChatEditor />
    </div>
  )
}

export function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  return <ChatBox key={sessionIndex}></ChatBox>
}
