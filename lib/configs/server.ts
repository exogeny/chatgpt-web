declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL?: string;
      CODE?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

async function sha256(str: string) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

const ACCESS_CODES = (function getAccessCodes(): Set<string> {
  const code = process.env.CODE ?? "8ded8bf9-35f9-4b98-9147-a6110a16ed19";

  try {
    let codes = new Set<string>();
    (code?.split(",") ?? [])
      .filter((v) => !!v)
      .map((v) => sha256(v.trim()).then((v) => codes.add(v)));
    return codes;
  } catch (e) {
    return new Set();
  }
})();

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const apiKeyEnvVar = process.env.OPENAI_API_KEY ?? "";
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

  return {
    baseURL: baseURL,
    codes: ACCESS_CODES,
    openaiAPIKey: apiKeyEnvVar,
  };
};