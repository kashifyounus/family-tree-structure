import * as SQLite from "expo-sqlite";

const DB_NAME = "mughals_family.db";

let database: SQLite.SQLiteDatabase | null = null;

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY NOT NULL,
  family_code TEXT NOT NULL UNIQUE,
  title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nickname TEXT,
  urdu_first_name TEXT,
  urdu_last_name TEXT,
  gender TEXT NOT NULL,
  birth_date TEXT,
  death_date TEXT,
  photo_url TEXT,
  bio TEXT,
  occupation TEXT,
  mother_tongue TEXT,
  privacy_level TEXT NOT NULL DEFAULT 'MEMBERS_ONLY',
  birth_place TEXT,
  current_city TEXT,
  permanent_city TEXT,
  home_town TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS unions (
  id TEXT PRIMARY KEY NOT NULL,
  partner_1_id TEXT NOT NULL,
  partner_2_id TEXT NOT NULL,
  marriage_date TEXT,
  divorce_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (partner_1_id) REFERENCES persons(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_2_id) REFERENCES persons(id) ON DELETE CASCADE,
  UNIQUE(partner_1_id, partner_2_id)
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY NOT NULL,
  union_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'BIOLOGICAL',
  FOREIGN KEY (union_id) REFERENCES unions(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES persons(id) ON DELETE CASCADE,
  UNIQUE(union_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_persons_family_code ON persons(family_code);
CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(last_name, first_name);
`;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DB_NAME);
    database.execSync(SCHEMA_SQL);
  }
  return database;
}

export function resetLocalDatabase(): void {
  const db = getDatabase();
  db.execSync(`
    DELETE FROM children;
    DELETE FROM unions;
    DELETE FROM persons;
  `);
}
