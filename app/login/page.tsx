"use client";

import { useRouter } from "next/navigation";

import styles from "./login.module.scss";
import { Button } from "@/app/components/button/button";
import { LoginForm } from "@/app/components/form/login";

export default function Login() {
  const navigate = useRouter();
  const goChat = () => navigate.push("/");

  return (
    <div className={styles["auth-page"]}>
      <div className={styles["auth-title"]}>"Need Access Code"</div>
      <div className={styles["auth-tips"]}>"Please enter access code below"</div>

      <LoginForm />

      <div className={styles["auth-actions"]}>
        <Button
          text="Sign in"
          type="primary"
          onClick={goChat}
        />
      </div>
    </div>
  )
}