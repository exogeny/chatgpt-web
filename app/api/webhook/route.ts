import { exec } from 'child_process';
import { access, writeFile, readFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from "next/server";

import { verifyGithubWebHookSecret } from "@/lib/authorization/auth-utils";

function resolveReleaseEvent(data: any) {
  const { action, release } = data;

  // only handle published releases
  if (action === "published") {
    const assetsUrl = release.assets_url;
    const tagName = release.tag_name;
    const folder = "released";

    access(folder).then(() => {
      return true;
    }).catch((error) => {
      if (error.code === "ENOENT") {
        return mkdir(folder);
      }
      throw error;
    }).then(() => {
      return readFile("./public/site.webmanifest");
    }).then((buffer) => {
      const version = JSON.parse(buffer.toString()).version ?? "";
      console.log("[Webhook] Current version: ", version, tagName);
      return (version !== tagName);
    }).then((needUpdated) => {
      if (!needUpdated) {
        console.log("[Webhook] No need to update");
        return;
      }
      fetch(assetsUrl)
        .then((response) => response.json())
        .then((assets) => {
          const asset = assets
            .find((asset: any) => asset.name === "ChatGPT-Release.zip");
          if (asset) {
            return fetch(asset.browser_download_url);
          } else {
            throw new Error("[Webhook] Failed to find ChatGPT-Release.zip asset");
          }
        })
        .then((response) => response.blob())
        .then((blob) => {
          const file = blob as unknown as File;
          if (!file) {
            throw new Error("[Webhook] Failed to fetch release file");
          } else {
            return file.arrayBuffer();
          }
        })
        .then((buffer) => {
          const path = `${folder}/ChatGPT-Release.zip`;
          return writeFile(path, Buffer.from(buffer)).then(() => path);
        })
        .then((path) => {
          exec(`unzip -o ${path} -d "./"`, (error, _stdout, _stderr) => {
            if (error) {
              throw error;
            }
            exec(`pm2 restart chatgpt`, (error, _stdout, _stderr) => {
              if (error) {
                throw error;
              }
              console.log("[Webhook] Restarted");
            });
          });
        })
        .catch((err) => {
          console.log(`[Webhook] Failed to fetch assets for ${tagName}`, err);
        });
    });
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const body = JSON.stringify(data);
  const untrusted = request.headers.get("x-hub-signature-256") ?? "";
  const authorized = await verifyGithubWebHookSecret(body, untrusted);
  if (!authorized) {
    console.log("[Webhook] Unauthorized request");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const githubEvent = request.headers.get("x-github-event");
  if (githubEvent === "ping") {
    console.log('GitHub sent the ping event');
  } else if (githubEvent === "release") {
    resolveReleaseEvent(data);
  } else {
    console.log(`Unhandled event: ${githubEvent}`);
  }

  return new NextResponse("Accepted", { status: 202 });
}