import { normalizeSiteConfig, siteConfig, type SiteConfig } from "@/data/siteConfig";
import { getDatabase, initializeDatabase } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type HomepageContentRow = RowDataPacket & {
  content: unknown;
};

function hasLegacyRooms(value: unknown) {
  if (typeof value !== "object" || value === null || !("rooms" in value)) {
    return false;
  }

  const rooms = (value as { rooms?: unknown }).rooms;

  return (
    Array.isArray(rooms) &&
    rooms.some(
      (room) =>
        typeof room === "object" &&
        room !== null &&
        (!("url" in room) || !("images" in room))
    )
  );
}

function migrateRoomDefaults(content: SiteConfig): SiteConfig {
  const currentRoomNames = new Set(content.rooms.map((room) => room.name));
  const missingDefaultRooms = siteConfig.rooms.filter(
    (room) => !currentRoomNames.has(room.name)
  );
  const defaultRoomsByName = new Map(siteConfig.rooms.map((room) => [room.name, room]));
  const migratedRooms = content.rooms.map((room) => {
    const defaultRoom = defaultRoomsByName.get(room.name);
    const images =
      room.images.length > 0
        ? room.images
        : defaultRoom?.images.length
          ? defaultRoom.images
          : [room.image];

    return {
      ...room,
      image: images[0],
      images
    };
  });

  return {
    ...content,
    rooms: [...migratedRooms, ...missingDefaultRooms]
  };
}

async function persistSiteContent(content: SiteConfig) {
  await getDatabase().execute(
    `INSERT INTO homepage_content (id, content)
     VALUES (1, :content)
     ON DUPLICATE KEY UPDATE content = VALUES(content)`,
    { content: JSON.stringify(content) }
  );
}

export async function getSiteContent(): Promise<SiteConfig> {
  try {
    await initializeDatabase();

    const [rows] = await getDatabase().execute<HomepageContentRow[]>(
      "SELECT content FROM homepage_content WHERE id = 1 LIMIT 1"
    );
    const content = rows[0]?.content;
    const rawContent = typeof content === "string" ? JSON.parse(content) : content;
    const normalizedContent = normalizeSiteConfig(rawContent);

    if (hasLegacyRooms(rawContent)) {
      const migratedContent = migrateRoomDefaults(normalizedContent);

      await persistSiteContent(migratedContent);

      return migratedContent;
    }

    return normalizedContent;
  } catch (error) {
    console.error("Could not read home content from MySQL, using defaults.", error);

    return siteConfig;
  }
}

export async function saveSiteContent(value: unknown): Promise<SiteConfig> {
  const content = normalizeSiteConfig(value);

  await initializeDatabase();
  await persistSiteContent(content);

  return content;
}
