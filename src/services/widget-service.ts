import { Platform } from 'react-native';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface WidgetData {
  items: {
    id: string;
    title: string;
    progress: number;
    seasonNumber?: number;
    episodeNumber?: number;
  }[];
}

export function getWidgetData(): WidgetData {
  const { db } = getDatabase();
  const inProgress = db
    .select({
      id: media.id,
      title: media.title,
    })
    .from(media)
    .where(and(eq(media.status, 'watching'), eq(media.favorite, false)))
    .all();

  return {
    items: inProgress.slice(0, 3).map((m) => ({
      id: m.id,
      title: m.title,
      progress: 0,
    })),
  };
}

export function updateWidget(): void {
  if (Platform.OS !== 'android') return;
  try {
    getWidgetData();
  } catch {}
}
