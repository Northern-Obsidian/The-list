import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';

export const backups = sqliteTable('backups', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  fileSize: integer('file_size'),
  checksum: text('checksum'),
  driveFileId: text('drive_file_id'),
  createdAt: text('created_at').notNull(),
  restoredAt: text('restored_at'),
});
