import { getDatabase, getActiveProfileId } from '@/db';
import { media } from '@/db/schema';
import { generateId } from '@/utils/generate-id';

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

interface ImportRow {
  title: string;
  mediaType?: string;
  status?: string;
  year?: number;
  runtime?: number;
  genres?: string;
  personalRating?: number;
  overview?: string;
  director?: string;
  actors?: string;
  studio?: string;
  country?: string;
  language?: string;
  notes?: string;
  favorite?: boolean;
  [key: string]: unknown;
}

export function importFromJson(jsonStr: string): ImportResult {
  try {
    const data = JSON.parse(jsonStr);
    const items = data.items || data.media || (Array.isArray(data) ? data : [data]);

    if (!Array.isArray(items)) {
      return { success: false, imported: 0, skipped: 0, errors: ['Invalid format: expected an array of items'] };
    }

    return processItems(items);
  } catch (err) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [err instanceof Error ? err.message : 'Failed to parse JSON'],
    };
  }
}

export function importFromCsv(csvStr: string): ImportResult {
  try {
    const lines = csvStr.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, imported: 0, skipped: 0, errors: ['CSV must have a header row and at least one data row'] };
    }

    const headers = parseCSVLine(lines[0]);
    const items: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      items.push(row as unknown as ImportRow);
    }

    return processItems(items);
  } catch (err) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [err instanceof Error ? err.message : 'Failed to parse CSV'],
    };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const VALID_TYPES = [
  'movie', 'tv_show', 'anime', 'documentary', 'web_series',
  'mini_series', 'ova', 'cartoon', 'reality_show',
  'podcast', 'audiobook', 'book', 'game', 'drama',
];

const VALID_STATUSES = [
  'plan_to_watch', 'watching', 'completed', 'paused', 'dropped', 'rewatching',
];

function processItems(items: ImportRow[]): ImportResult {
  const { db } = getDatabase();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      if (!item.title || !item.title.toString().trim()) {
        skipped++;
        continue;
      }

      const mediaType = item.mediaType && VALID_TYPES.includes(item.mediaType) ? item.mediaType : 'movie';
      const status = item.status && VALID_STATUSES.includes(item.status) ? item.status : 'plan_to_watch';

      const now = new Date().toISOString();
      db.insert(media)
        .values({
          id: generateId(),
          profileId: getActiveProfileId(),
          mediaType: mediaType as typeof media.$inferInsert['mediaType'],
          title: item.title.toString().trim(),
          status: status as typeof media.$inferInsert['status'],
          year: item.year ? parseInt(String(item.year)) || null : null,
          runtime: item.runtime ? parseInt(String(item.runtime)) || null : null,
          genres: item.genres || null,
          personalRating: item.personalRating ? parseFloat(String(item.personalRating)) || null : null,
          overview: item.overview?.toString() || null,
          director: item.director?.toString() || null,
          actors: item.actors?.toString() || null,
          studio: item.studio?.toString() || null,
          country: item.country?.toString() || null,
          language: item.language?.toString() || null,
          notes: item.notes?.toString() || null,
          favorite: !!item.favorite,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      imported++;
    } catch (err) {
      errors.push(`Failed to import "${item.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      skipped++;
    }
  }

  return {
    success: errors.length === 0,
    imported,
    skipped,
    errors,
  };
}
