"use client";

import { useState, useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
} from "react-router-dom";
import dynamic from "next/dynamic";

import styles from "@/app/styles/home.module.scss";
import BotIcon from "@/public/icons/bot.svg";
import LoadingIcon from "@/public/icons/three-dots.svg";

import { ErrorBoundary } from "./Error";
import { SideBar } from "./sidebar/sidebar";


export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Chat = dynamic(async () => (await import("./chat/chat")).Chat, {
  loading: () => <Loading noLogo />,
});

function Screen() {
  return (
    <div className={styles.container}>
      <SideBar className={styles["sidebar-show"]} />

      <div className={styles["window-content"]}>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/new" element={<Chat />} />
        </Routes>
      </div>
    </div>
  )
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

export function Home() {

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <Screen />
      </HashRouter>
    </ErrorBoundary>
  );
}
