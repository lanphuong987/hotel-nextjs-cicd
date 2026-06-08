import { normalizeSiteConfig, siteConfig, type SiteConfig } from "@/data/siteConfig";
import { getDatabase, initializeDatabase } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type HomepageContentRow = RowDataPacket & {
  content: unknown;
};

export async function getSiteContent(): Promise<SiteConfig> {
  try {
    await initializeDatabase();

    const [rows] = await getDatabase().execute<HomepageContentRow[]>(
      "SELECT content FROM homepage_content WHERE id = 1 LIMIT 1"
    );
    const content = rows[0]?.content;

    return normalizeSiteConfig(
      typeof content === "string" ? JSON.parse(content) : content
    );
  } catch (error) {
    console.error("Could not read home content from MySQL, using defaults.", error);

    return siteConfig;
  }
}

export async function saveSiteContent(value: unknown): Promise<SiteConfig> {
  const content = normalizeSiteConfig(value);

  await initializeDatabase();
  await getDatabase().execute(
    `INSERT INTO homepage_content (id, content)
     VALUES (1, :content)
     ON DUPLICATE KEY UPDATE content = VALUES(content)`,
    { content: JSON.stringify(content) }
  );

  return content;
}
