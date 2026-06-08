import mysql, { type Pool } from "mysql2/promise";
import { siteConfig } from "@/data/siteConfig";

type GlobalWithMysql = typeof globalThis & {
  mysqlPool?: Pool;
  mysqlReady?: Promise<void>;
};

const globalForMysql = globalThis as GlobalWithMysql;

function getPool(): Pool {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT || 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }

  return globalForMysql.mysqlPool;
}

export function getDatabase(): Pool {
  if (!process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
    throw new Error("Missing MySQL configuration");
  }

  return getPool();
}

export async function initializeDatabase() {
  if (!globalForMysql.mysqlReady) {
    globalForMysql.mysqlReady = setupDatabase();
  }

  return globalForMysql.mysqlReady;
}

async function setupDatabase() {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS homepage_content (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      content JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id CHAR(64) NOT NULL PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX admin_sessions_expires_at_idx (expires_at),
      CONSTRAINT admin_sessions_user_id_fk
        FOREIGN KEY (user_id) REFERENCES admin_users(id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(
    "INSERT IGNORE INTO homepage_content (id, content) VALUES (1, :content)",
    { content: JSON.stringify(siteConfig) }
  );
}
