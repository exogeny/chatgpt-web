"use client";

import styles from "./login.module.scss";
import { LoginForm } from "@/app/components/form/login";

export default function Login() {
  return (
    <div className={styles["auth-page"]}>
      <div className={styles["auth-title"]}>"Need Access Code"</div>
      <div className={styles["auth-tips"]}>"Please enter access code below"</div>

      <LoginForm />
    </div>
  )
}