import { LandingPage } from "@/components/LandingPage";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteConfig = await getSiteContent();

  return <LandingPage config={siteConfig} />;
}
