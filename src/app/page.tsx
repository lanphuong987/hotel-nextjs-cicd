import { LandingPage } from "@/components/LandingPage";
import { siteConfig } from "@/data/siteConfig";

export default function Home() {
  return <LandingPage config={siteConfig} />;
}
