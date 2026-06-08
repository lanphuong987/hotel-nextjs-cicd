import crypto from "crypto";
import type { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { getDatabase, initializeDatabase } from "@/lib/db";

export const adminSessionCookie = "change_hotel_admin_session";

const passwordIterations = 210000;
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;

type AdminUserRow = RowDataPacket & {
  id: number;
  username: string;
  password_hash: string;
};

type AdminSessionRow = RowDataPacket & {
  id: number;
  username: string;
};

export type AdminSession = {
  userId: number;
  username: string;
};

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, passwordIterations, 32, "sha256")
    .toString("hex");

  return `pbkdf2_sha256$${passwordIterations}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, salt, hash] = storedHash.split("$");
  const iterations = Number(iterationsText);

  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !hash) {
    return false;
  }

  const candidate = crypto
    .pbkdf2Sync(password, salt, iterations, 32, "sha256")
    .toString("hex");

  const candidateBuffer = Buffer.from(candidate, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (candidateBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, hashBuffer);
}

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return;
  }

  const db = getDatabase();
  await db.execute(
    "INSERT IGNORE INTO admin_users (username, password_hash) VALUES (:username, :passwordHash)",
    {
      username,
      passwordHash: hashPassword(password)
    }
  );
}

export async function createAdminSession(username: string, password: string) {
  await initializeDatabase();
  await seedAdminUser();

  const db = getDatabase();
  const [rows] = await db.execute<AdminUserRow[]>(
    "SELECT id, username, password_hash FROM admin_users WHERE username = :username LIMIT 1",
    { username }
  );
  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionTtlMs);

  await db.execute("DELETE FROM admin_sessions WHERE expires_at <= NOW()");
  await db.execute(
    "INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (:id, :userId, :expiresAt)",
    {
      id: hashSessionToken(token),
      userId: user.id,
      expiresAt
    }
  );

  return {
    token,
    expiresAt,
    user: {
      userId: user.id,
      username: user.username
    }
  };
}

export async function getAdminSession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) {
    return null;
  }

  try {
    await initializeDatabase();
    await seedAdminUser();

    const db = getDatabase();
    const [rows] = await db.execute<AdminSessionRow[]>(
      `SELECT admin_users.id, admin_users.username
       FROM admin_sessions
       INNER JOIN admin_users ON admin_users.id = admin_sessions.user_id
       WHERE admin_sessions.id = :id AND admin_sessions.expires_at > NOW()
       LIMIT 1`,
      { id: hashSessionToken(token) }
    );
    const session = rows[0];

    if (!session) {
      return null;
    }

    return {
      userId: session.id,
      username: session.username
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession() {
  return getAdminSession(cookies().get(adminSessionCookie)?.value);
}

export async function deleteAdminSession(token: string | undefined) {
  if (!token) {
    return;
  }

  await initializeDatabase();
  await getDatabase().execute("DELETE FROM admin_sessions WHERE id = :id", {
    id: hashSessionToken(token)
  });
}
