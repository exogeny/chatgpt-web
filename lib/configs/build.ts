export const getBuildConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const buildMode = process.env.BUILD_MODE ?? "standalone";

  const commitInfo = (() => {
    try {
      const version = "v" + require("@/package.json").version;
      const childProcess = require("child_process");
      const commitDate: string = childProcess
        .execSync('git log -1 --format="%at000" --date=unix')
        .toString()
        .trim();
      const commitHash: string = childProcess
        .execSync('git log --pretty=format:"%H" -n 1')
        .toString()
        .trim();

      return { version, commitDate, commitHash };
    } catch (e) {
      console.error("[Build Config] No git or not from git repo.");
      return {
        version: "unknown",
        commitDate: "unknown",
        commitHash: "unknown",
      };
    }
  })();

  return {
    ...commitInfo,
    buildMode,
  };
};

export type BuildConfig = ReturnType<typeof getBuildConfig>;