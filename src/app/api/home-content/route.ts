import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { adminSessionCookie, getAdminSession } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const content = await getSiteContent();

  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession(request.cookies.get(adminSessionCookie)?.value);

  if (!session) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const content = await saveSiteContent(payload);

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not update home content"
      },
      { status: 400 }
    );
  }
}
