import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getIronSession } from 'iron-session/edge';

import { getServerSideConfig } from '@/lib/configs/server';
import { sessionOptions } from "./lib/authorization/auth-config";
import { verifyPassword } from "./lib/authorization/auth-utils";

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  const { authorizationSession } = await getIronSession(request, response, sessionOptions);
  const { baseURL } = getServerSideConfig();

  if (authorizationSession === undefined || !verifyPassword(authorizationSession.password)) {
    if (url.startsWith("/api")) {
      return NextResponse.redirect(new URL("/api/unauthorized", baseURL));
    } else {
      return NextResponse.redirect(new URL("/login", baseURL));
    }
  }
  return response;
};

export const config = {
  matcher: [
    // page routes
    "/",
    "/api/openai",
  ]
}
