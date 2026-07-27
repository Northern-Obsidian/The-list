import { getDatabase } from '@/db';

export function useDrizzle() {
  const { db } = getDatabase();
  return db;
}
