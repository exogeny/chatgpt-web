import { BuildConfig, getBuildConfig } from "./build";

function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (document) {
    const meta = document.head.querySelector(
      `meta[name="${key}"]`,
    ) as HTMLMetaElement;
    ret = meta?.content ?? defaultValue;
  } else {
    ret = defaultValue ?? "";
  }
  return ret;
}

export function getClientConfig() {
  if (typeof document !== "undefined") {
    return JSON.parse(queryMeta("config")) as BuildConfig;
  }

  if (typeof process !== "undefined") {
    return getBuildConfig();
  }
}