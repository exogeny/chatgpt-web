"use client";

import { useState, useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import dynamic from "next/dynamic";

import styles from "./home.module.scss";
import BotIcon from "@/public/icons/bot.svg";
import LoadingIcon from "@/public/icons/three-dots.svg";

import { SideBar } from "@/app/components/sidebar/sidebar";
import { ErrorBoundary } from "@/app/components/error/Error";


export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Chat = dynamic(async () => (await import("@/app/components/chat/chat")).Chat, {
  loading: () => <Loading noLogo />,
});

function Screen() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  console.log("isHome: ", isHome, "location: ", location.pathname);

  return (
    <div className={styles.container}>
      <SideBar isHome={isHome} />

      <div className={styles["window-content"]}>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/new" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
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
