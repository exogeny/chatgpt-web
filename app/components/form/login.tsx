import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';

import styles from "./login.module.scss";
import { SessionState } from "@/lib/redux/authorization";
import { usePostAuthenticationSessionMutation } from "@/lib/redux/authorization";


export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const { authorizationSession, setAuthorizationMessage } = useState<SessionState["message"]>("");
  const postAuthorizeSession = usePostAuthenticationSessionMutation();


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthorizationMessage("");

    try {
      await postAuthorizeSession({ password }).unwarp();
      router.reload();
    } catch (err: unknown) {
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
        className={styles["auth-input"]}
        type="password"
        placeholder="access code"
        onChange={(e) => {

        }}
      />
    </form>
  )
};
