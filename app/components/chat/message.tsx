import { Fragment } from "react";
import dynamic from "next/dynamic";

import { ChatMessage, ChatSession } from "@/lib/model/chat";

import styles from "./message.module.scss";
import Avatar from "../emoji/avatar";
import { Button } from "../button/button";
import EditIcon from "@/public/icons/edit.svg"
import LoadingIcon from "@/public/icons/three-dots.svg";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />
});

function ChatMessageItem(props: {
  index: number;
  message: ChatMessage;
  session: ChatSession;
  isContext?: boolean;
}) {
  const { session, message, isContext } = props;
  const isUser = message.role === "user";

  return (
    <Fragment key={message.id}>
      <div
        className={isUser ? styles["chat-message-user"] : styles["chat-message"]}
      >
        <div className={styles["chat-message-container"]}>
          <div className={styles["chat-message-header"]}>
            <div className={styles["chat-message-avatar"]}>
              <div className={styles["chat-message-edit"]}>
                <Button
                  icon={<EditIcon />}
                  onClick={async () => {

                  }}
                />
              </div>
              {
                isUser ? (
                  <Avatar image="/images/panda_1f43c.png" />
                ) : (
                  <>
                    {
                      ["system"].includes(message.role) ? (
                        <Avatar avatar="2699-fe0f" />
                      ) : (
                        <Avatar model={props.session.modelConfig.model} />
                      )
                    }
                  </>
                )
              }
            </div>
          </div>
          <div className={styles["chat-message-item"]}>
            <Markdown
              content={message.content}
              loading={
                (message.streaming) &&
                message.content.length === 0 &&
                !isUser
              }
              onContextMenu={(e) => onRightClick(e, message)}
            />
          </div>
          <div className={styles["chat-message-action-date"]}>
            {isContext ? "Contextual Prompt" : message.date.toLocaleString() }
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export function ChatMessageList(props: {
  session: ChatSession
}) {
  return (
    <div className={styles["chat-message-list"]}>
      {props.session.messages.map((message, index) => {
        return (
          <ChatMessageItem
            message={message}
            session={props.session}
            key={index}
          />
        );
      })}
    </div>
  );
}