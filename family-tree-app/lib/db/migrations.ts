import type * as SQLite from "expo-sqlite";

const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: "20260924_person_is_fixture",
    sql: "ALTER TABLE persons ADD COLUMN is_fixture INTEGER NOT NULL DEFAULT 0",
  },
];

export function runSqliteMigrations(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  for (const migration of MIGRATIONS) {
    const applied = db.getFirstSync<{ id: string }>(
      "SELECT id FROM schema_migrations WHERE id = ?",
      [migration.id],
    );
    if (applied) continue;
    try {
      db.execSync(migration.sql);
      db.runSync(
        "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
        [migration.id, new Date().toISOString()],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("duplicate column")) {
        db.runSync(
          "INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES (?, ?)",
          [migration.id, new Date().toISOString()],
        );
      } else {
        throw error;
      }
    }
  }
}
