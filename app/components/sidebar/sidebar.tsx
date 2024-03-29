import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";

import styles from "./sidebar.module.scss";
import { isIOS, useMobileScreen } from "@/lib/mobile";

import { Button } from "../button/button";
import { useChatStore } from "@/lib/redux/chat";
import { getClientConfig } from "@/lib/configs/client";
import AddIcon from "@/public/icons/add.svg";

const ChatList = dynamic(async () => (await import("../chat/list")).ChatList, {
  loading: () => null,
});

export function SideBar(props: {
  isHome?: boolean;
}) {
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen]);

  const chatStore = useChatStore();
  const version = getClientConfig()?.version ?? "unknown";

  return (
    <div
      className={`${styles.sidebar} ${props.isHome && styles["sidebar-show"]} ${isMobileScreen && styles["narrow-sidebar"]}`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}>
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>ChatGPT Web Proxy</div>
        <div className={styles["sidebar-subtitle"]}>Version: { version }</div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <Button
          text="Mask"
          className={styles["sidebar-bar-button"]}
          shadow
        />
        <Button
          text="Plugin"
          className={styles["sidebar-bar-button"]}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate("/");
          }
        }}
      >
        <ChatList narrow={isMobileScreen} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <Button
          icon={<AddIcon />}
          text={isMobileScreen ? undefined : "New Chat"}
          onClick={() => {
            chatStore.createSession();
            navigate("/new");
          }}
          shadow
        />
      </div>
    </div>
  )
}