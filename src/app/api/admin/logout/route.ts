import { type NextRequest, NextResponse } from "next/server";
import { adminSessionCookie, deleteAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await deleteAdminSession(request.cookies.get(adminSessionCookie)?.value);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie, "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}
