import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getIronSession } from 'iron-session/edge';

import { sessionOptions } from "./lib/authorization/auth-config";
import { verifyPassword } from "./lib/authorization/auth-utils";

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  const { authorizationSession } = await getIronSession(request, response, sessionOptions);
  const url = request.nextUrl.pathname;

  console.log("[middleware] session: ", authorizationSession);
  if (authorizationSession === undefined || !verifyPassword(authorizationSession.password)) {
    if (url.startsWith("/api")) {
      return NextResponse.redirect(new URL("/api/unauthorized", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
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
