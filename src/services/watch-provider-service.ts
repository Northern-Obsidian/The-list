import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getProvider } from '@/constants/watch-providers';

export interface WatchLink {
  providerId: string;
  url: string;
  label?: string;
}

export function getWatchLinks(mediaItem: { customFields?: string | null }): WatchLink[] {
  try {
    const fields = mediaItem.customFields ? JSON.parse(mediaItem.customFields) : {};
    return fields.watchLinks || [];
  } catch {
    return [];
  }
}

export function setWatchLinksInFields(links: WatchLink[], existingFields?: string | null): string {
  let fields: Record<string, unknown>;
  try {
    fields = existingFields ? JSON.parse(existingFields) : {};
  } catch {
    fields = {};
  }
  fields.watchLinks = links;
  return JSON.stringify(fields);
}

export async function saveWatchLinks(mediaId: string, links: WatchLink[]): Promise<void> {
  const { db } = getDatabase();
  const existing = db.select().from(media).where(eq(media.id, mediaId)).get();
  if (!existing) return;
  const updated = setWatchLinksInFields(links, existing.customFields);
  db.update(media)
    .set({ customFields: updated, updatedAt: new Date().toISOString() })
    .where(eq(media.id, mediaId))
    .run();
}

export async function openWatchLink(link: WatchLink): Promise<void> {
  const provider = getProvider(link.providerId);
  if (!provider || !link.url) return;

  if (Platform.OS === 'web') {
    window.open(link.url, '_blank');
    return;
  }

  if (provider.deepLinkScheme) {
    const canOpen = await Linking.canOpenURL(provider.deepLinkScheme);
    if (canOpen) {
      await Linking.openURL(link.url);
      return;
    }
  }

  await WebBrowser.openBrowserAsync(link.url);
}
