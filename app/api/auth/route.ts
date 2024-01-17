import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session';

import { sessionOptions } from "@/lib/authorization/auth-config";
import { verifyPassword } from "@/lib/authorization/auth-utils";

export async function GET(request: NextRequest) {
  const response = new Response();
  const session = await getIronSession(request, response, sessionOptions);
  const { password } = session?.authorizationSession ?? "";
  return NextResponse.json({ password }, response);
}

export async function POST(request: NextRequest) {
  const response = new Response();
  const { password } = await request.json();
  console.log(password);
  const session = await getIronSession(request, response, sessionOptions);

  if (verifyPassword(password)) {
    session.authorizationSession = {
      password: password,
    };
    await session.save();
    console.log(session);
    return NextResponse.json({ message: "success" }, response);
  }

  return NextResponse.json({ message: "incorrect password" }, response);
}

export async function DELETE(request: NextRequest) {
  const response = new Response();
  const session = await getIronSession(request, response, sessionOptions);
  session.destroy();
  return NextResponse.json({ message: "success" }, response);
}