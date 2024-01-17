import crypto from "crypto";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';

import styles from "./login.module.scss";
import { SessionState } from "@/lib/redux/authorization";
import { usePostAuthenticationSessionMutation } from "@/lib/redux/authorization";

import { Button } from "@/app/components/button/button";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [authorizationSession, setAuthorizationMessage] = useState<SessionState["message"]>("access token");
  const [postAuthorizeSession, { isLoading }] = usePostAuthenticationSessionMutation();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'password') {
      const hash = crypto.createHash('sha256').update(value).digest('hex');
      setPassword(hash);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);

    try {
      postAuthorizeSession({ password }).unwrap().then((data) => {
        if (data.message !== "success") {
          setError(true);
          setAuthorizationMessage(data.message);
        } else {
          router.push("/");
        }
      });
    } catch (err: unknown) {
      console.log(err)
      setAuthorizationMessage((err as { data: { message: string } }).data.message);
    }
  };

  return (
    <form
      className={styles["auth-form"]}
      method="POST"
      action="/api/login"
      onSubmit={handleSubmit}>
      <input
        className={`${styles["auth-input"]} ${error && styles["error"]}`}
        type="password"
        name="password"
        placeholder={authorizationSession}
        onChange={onChange}
      />
      <div className={styles["auth-actions"]}>
        <Button
          text="Sign in"
          type="submit"
          disabled={password.length === 0}
        />
      </div>
      <div className={styles["auth-error"]}>
        {error && authorizationSession}
      </div>
    </form>
  )
};
