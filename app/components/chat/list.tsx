import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import styles from "./list.module.scss";
import DeleteIcon from "@/public/icons/delete.svg";

import { useMobileScreen } from "@/lib/mobile";
import { useChatStore } from "@/lib/redux/chat";
import Avatar from "../emoji/avatar";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: string;
  index: number;
  narrow?: boolean;
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (props.selected && draggableRef.current) {
      draggableRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [props.selected]);

  return (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles["chat-item"]} ${props.selected && styles["chat-item-selected"]}`}
          onClick={props.onClick}
          ref={(element) => {
            draggableRef.current = element;
            provided.innerRef(element);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          title={`${props.title}\n${props.count} messages`}
        >
          {
            props.narrow ? (
              <div className={styles["chat-item-narrow"]}>
                <div className={styles["chat-item-narrow-bar"]}>
                  <div className={styles["chat-item-narrow-title"]}>{props.title}</div>
                  <div className={styles["chat-item-narrow-count"]}>
                    ({props.count})
                  </div>
                </div>
                <div className={styles["chat-item-avatar"] + " no-dark"}>
                  <Avatar
                    image="/images/panda_1f43c.png"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={styles["chat-item-title"]}>{props.title}</div>
                <div className={styles["chat-item-info"]}>
                  <div className={styles["chat-item-count"]}>{props.count} messages</div>
                  <div className={styles["chat-item-date"]}>{props.time}</div>
                </div>
              </>
            )
          }

          <div
            className={styles["chat-item-delete"]}
            onClickCapture={(e) => {
              props.onDelete?.();
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  )
}

export function ChatList(props: {
    narrow?: boolean;
}) {
  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );
  const chatStore = useChatStore();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sessions.map((session, index) => (
              <ChatItem
                title={session.topic}
                time={new Date(session.lastUpdate).toLocaleString()}
                count={session.messages.length}
                key={session.id}
                id={session.id}
                index={index}
                narrow={props.narrow}
                selected={index === selectedIndex}
                onClick={() => {
                  navigate("/chat");
                  selectSession(index);
                }}
                onDelete={async () => {
                  if (!props.narrow && !isMobileScreen) {
                  } else {
                    chatStore.removeSession(index);
                  }
                }}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}