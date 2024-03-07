import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useChatStore } from "@/lib/redux/chat";

import styles from "./action.module.scss";
import ScollDownIcon from "@/public/icons/down.svg";
import HomeIcon from "@/public/icons/home.svg";
import PromptIcon from "@/public/icons/prompt.svg";

function ChatAction(props: {
  text?: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    icon: 16,
    full: 16,
  });

  const updateWidth = () => {
    if (iconRef.current && textRef.current) {
      const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
      const textWidth = getWidth(textRef.current);
      const iconWidth = getWidth(iconRef.current);
      setWidth({
        icon: iconWidth,
        full: textWidth + iconWidth,
      });
    }
  };

  return (
    <div
      className={`${styles["chat-editor-action"]}
        ${props.disabled ? styles["chat-editor-action-disabled"] : ""} clickable`}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>{props.icon}</div>
      { props.text && (
        <div className={styles["text"]} ref={textRef}>{props.text}</div>
      )}
    </div>
  );
}

export function ChatActionList(props: {
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
}) {
  const navigate = useNavigate();
  const chatStore = useChatStore();

  return (
    <div className={styles["chat-editor-actions"]}>
      <ChatAction
        onClick={props.scrollToBottom}
        icon={<ScollDownIcon />}
        disabled={props.hitBottom}
      />
      <ChatAction
        onClick={() => navigate("/")}
        icon={<HomeIcon />}
      />
      <ChatAction
        onClick={props.showPromptHints}
        text="Prompts"
        icon={<PromptIcon />}
      />
    </div>
  )
}
