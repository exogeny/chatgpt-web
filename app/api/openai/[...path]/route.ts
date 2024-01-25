import { NextRequest, NextResponse } from "next/server";

import { prettyObject } from "@/lib/utils/format";
import { getServerSideConfig } from "@/lib/configs/server";

const MAPPING_ROUTES: Record<string, string> = {
  "chat": "v1/chat/completions",
  "models": "v1/models",
  "usage": "v1/usage",
};
const ALLOWD_PATHS = new Set(Object.keys(MAPPING_ROUTES));

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  let query = "";
  const searchParams = req.nextUrl.searchParams;
  searchParams.delete("path");
  if (searchParams.size > 0) {
    query = `?${searchParams.toString()}`;
  }

  console.log("[OpenAI Route] request path: ", params.path.join("/"), query);
  if (req.method === "OPTIONS") {
    return NextResponse.json({ bpdy: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWD_PATHS.has(subpath)) {
    console.log("[OpenAI Route] forbidden path: ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to access this path",
      },
      {
        status: 403,
      });
  }

  try {
    const { openaiAPIKey } = getServerSideConfig();
    const openaiAPIURL = "https://api.openai.com";
    const path = `${openaiAPIURL}/${MAPPING_ROUTES[subpath]}${query}`;

    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Authorization": `Bearer ${openaiAPIKey}`,
      },
      method: req.method,
      body: req.body,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
    };

    const res = await fetch(path, fetchOptions);
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");
    // The latest version of the OpenAI API forced the content-encoding to be
    // "br" in json response So if the streaming is disabled, we need to remove
    // the content-encoding header Because Vercel uses gzip to compress the
    // response, if we don't remove the content-encoding header
    // The browser will try to decode the response with brotli and fail
    newHeaders.delete("content-encoding");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });

  } catch (e) {
    console.log("[OpenAI Route] failed to make a chat request", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;
export const OPTIONS = handle;

export const runtime = "edge";