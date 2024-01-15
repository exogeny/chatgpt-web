import { FormEvent } from "react";
import styles from "./login.module.scss";

export const LoginForm: React.FC = () => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault
  };

  return (
    <form
      className={styles["auth-form"]}
      method="POST"
      action="/api/login"
      onSubmit={handleSubmit}>
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder="access code"
        onChange={(e) => {

        }}
      />
    </form>
  )
};
