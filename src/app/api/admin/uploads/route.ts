import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { type NextRequest, NextResponse } from "next/server";
import { adminSessionCookie, getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), "public", "uploads", "rooms");
const maxUploadSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request.cookies.get(adminSessionCookie)?.value);

  if (!session) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { message: "Only JPG, PNG, WebP, and GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json(
      { message: "Image must be 5MB or smaller" },
      { status: 400 }
    );
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), bytes);

  return NextResponse.json({
    url: `/uploads/rooms/${filename}`
  });
}
