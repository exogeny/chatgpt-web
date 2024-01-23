import { getServerSideConfig } from '@/lib/configs/server';

export function verifyPassword(hash: string) {
  const { codes } = getServerSideConfig();
  return codes.has(hash);
}

export async function verifyGithubWebHookSecret(body: string, untrusted: string) {
  const { githubWebHookSecret } = getServerSideConfig();
  if (githubWebHookSecret.length === 0 || untrusted.length === 0) {
    return false;
  }
  console.log("[Webhook] Verifying request, ", githubWebHookSecret);
  const algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };
  const key = await crypto.subtle.importKey(
    "raw",
    Buffer.from(githubWebHookSecret, "ascii"),
    algorithm,
    false,
    ["sign", "verify"],
  );
  const result = await crypto.subtle.verify(
    algorithm.name,
    key,
    Buffer.from(untrusted.split("=")[1], "hex"),
    Buffer.from(body, "ascii"),
  );

  return result;
}