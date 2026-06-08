import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      username?: unknown;
      password?: unknown;
    };
    const username = typeof payload.username === "string" ? payload.username.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const session = await createAdminSession(username, password);

    if (!session) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ username: session.user.username });
    response.cookies.set(adminSessionCookie, session.token, {
      expires: session.expiresAt,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not log in"
      },
      { status: 500 }
    );
  }
}
