"use client";

import { useState, useEffect } from "react";

import styles from "@/app/styles/home.module.scss";
import BotIcon from "@/public/icons/bot.svg";
import LoadingIcon from "@/public/icons/three-dots.svg";

import { ErrorBoundary } from "./Error";


export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

function Screen() {
  return (
    <div>
      <div>
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
      <Screen />
    </ErrorBoundary>
  );
}
