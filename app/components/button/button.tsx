import * as React from "react";

import styles from "./button.module.scss";

export type ButtonType = "default" | "primary" | "danger" | "submit" | null;

export function Button(props: {
  onClick?: () => void;
  icon?: JSX.Element;
  type?: ButtonType;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
}) {
  return (
    <button
      className={
        styles["button"] +
        ` ${props.bordered && styles.border} ${props.shadow ? styles.shadow : ""} 
          ${props.className ?? ""} clickable ${styles[props.type ?? "default"]}`
      }
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
      tabIndex={props.tabIndex}
      autoFocus={props.autoFocus}
    >
      {props.icon && (
        <div
          className={
            styles["button-icon"] +
            ` ${props.type === "primary" && "no-dark"}`
          }
        >
          {props.icon}
        </div>
      )}

      {props.text && (
        <div className={styles["button-text"]}>{props.text}</div>
      )}
    </button>
  );
}