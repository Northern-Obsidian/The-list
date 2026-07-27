import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import migrations from './migrations/migrations';

const DB_NAME = 'the_list.db';

let _db: ReturnType<typeof drizzle> | null = null;
let _expoDb: SQLiteDatabase | null = null;

export function getDatabase() {
  if (!_expoDb) {
    _expoDb = openDatabaseSync(DB_NAME);
    _expoDb.execSync('PRAGMA journal_mode = WAL');
    _expoDb.execSync('PRAGMA foreign_keys = ON');
    runMigrations(_expoDb);
  }
  if (!_db) {
    _db = drizzle(_expoDb);
  }
  return { db: _db, expoDb: _expoDb };
}

function runMigrations(expoDb: SQLiteDatabase) {
  const result = expoDb.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const version = result?.user_version ?? 0;

  for (let i = version; i < migrations.length; i++) {
    const migration = migrations[i];
    if (migration) {
      expoDb.execSync(migration.sql);
    }
  }

  expoDb.execSync(`PRAGMA user_version = ${migrations.length}`);
}

let _activeProfileId: string | null = null;

export function getActiveProfileId(): string {
  if (_activeProfileId) return _activeProfileId;
  try {
    const { db } = getDatabase();
    const active = db.select({ id: schema.profiles.id }).from(schema.profiles).where(eq(schema.profiles.isActive, true)).get();
    if (active) {
      _activeProfileId = active.id;
      return active.id;
    }
  } catch {}
  return 'default';
}

export function setActiveProfileId(id: string): void {
  _activeProfileId = id;
}

export function clearActiveProfileCache(): void {
  _activeProfileId = null;
}

export function useDatabaseMigrations() {
  getDatabase();
  return { success: true, error: null };
}

export { schema };
