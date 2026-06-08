import { redirect } from "next/navigation";
import { HomeContentEditor } from "@/components/HomeContentEditor";
import { getCurrentAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();

  return <HomeContentEditor initialContent={content} username={session.username} />;
}
