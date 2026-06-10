import { notFound, redirect } from "next/navigation";
import {
  HomeContentEditor,
  isAdminContentSection
} from "@/components/HomeContentEditor";
import { getCurrentAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

type AdminSectionPageProps = {
  params: {
    section: string;
  };
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!isAdminContentSection(params.section)) {
    notFound();
  }

  const content = await getSiteContent();

  return (
    <HomeContentEditor
      initialContent={content}
      section={params.section}
      username={session.username}
    />
  );
}
