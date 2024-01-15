import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getIronSession } from 'iron-session/edge';

import { sessionOptions } from "./lib/authorization/auth-config";

export const middleware = async (request: NextRequest) => {
  console.log("middleware", request.nextUrl.pathname);
  const response = NextResponse.next();
  const { authSession } = await getIronSession(request, response, sessionOptions);
  const url = request.nextUrl.pathname;

  if (authSession === undefined) {
    if (url.startsWith("/api")) {
      return NextResponse.redirect(new URL("/api/auth/unauthorized", request.url));
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
  ]
}
