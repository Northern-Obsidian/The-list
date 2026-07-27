import * as Print from 'expo-print';
import { getDatabase } from '@/db';
import { media, watchHistory, episodes } from '@/db/schema';

export type ExportFormat = 'json' | 'csv' | 'md' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeHistory?: boolean;
  includeEpisodes?: boolean;
  typeFilter?: string;
  statusFilter?: string;
}

export type ExportResult = string | { uri: string };

export async function exportData(options: ExportOptions): Promise<ExportResult> {
  const { db } = getDatabase();

  let items = db.select().from(media).all();

  if (options.typeFilter) {
    items = items.filter((i) => i.mediaType === options.typeFilter);
  }
  if (options.statusFilter) {
    items = items.filter((i) => i.status === options.statusFilter);
  }

  const extra: Record<string, unknown> = {};
  if (options.includeHistory) {
    extra.history = db.select().from(watchHistory).all();
  }
  if (options.includeEpisodes) {
    extra.episodes = db.select().from(episodes).all();
  }

  switch (options.format) {
    case 'json':
      return exportJSON(items, extra);
    case 'csv':
      return exportCSV(items);
    case 'md':
      return exportMarkdown(items);
    case 'pdf': {
      const html = generatePDFHtml(items);
      try {
        const result = await Print.printToFileAsync({ html, base64: false });
        return { uri: result.uri };
      } catch {
        return '';
      }
    }
  }
}

export async function exportPDFAsync(options: Omit<ExportOptions, 'format'>): Promise<string | null> {
  const { db } = getDatabase();
  let items = db.select().from(media).all();
  if (options.typeFilter) items = items.filter((i) => i.mediaType === options.typeFilter);
  if (options.statusFilter) items = items.filter((i) => i.status === options.statusFilter);

  const html = generatePDFHtml(items);
  try {
    const result = await Print.printToFileAsync({ html, base64: false });
    return result.uri;
  } catch {
    return null;
  }
}

function generatePDFHtml(items: typeof media.$inferSelect[]): string {
  const rows = items.map((item) => {
    const rating = item.personalRating ? `${item.personalRating}/10` : '-';
    const genres = item.genres ? JSON.parse(item.genres).join(', ') : '';
    return `<tr>
      <td>${escapeHtml(item.title)}</td>
      <td>${item.mediaType?.replace(/_/g, ' ') || ''}</td>
      <td>${item.status?.replace(/_/g, ' ') || ''}</td>
      <td>${item.year || '-'}</td>
      <td>${rating}</td>
      <td>${escapeHtml(genres)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>The_List Export</title>
    <style>
      body { font-family: -apple-system, sans-serif; padding: 24px; color: #333; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; }
      td { padding: 6px 8px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) { background: #fafafa; }
    </style>
  </head><body>
    <h1>The_List Export</h1>
    <div class="meta">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; ${items.length} items</div>
    <table>
      <tr><th>Title</th><th>Type</th><th>Status</th><th>Year</th><th>Rating</th><th>Genres</th></tr>
      ${rows}
    </table>
  </body></html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportJSON(items: typeof media.$inferSelect[], extra: Record<string, unknown>): string {
  return JSON.stringify({ items, ...extra, exportedAt: new Date().toISOString() }, null, 2);
}

function exportCSV(items: typeof media.$inferSelect[]): string {
  const headers = ['id', 'mediaType', 'title', 'status', 'year', 'runtime', 'personalRating', 'favorite', 'genres', 'createdAt'];
  const rows = items.map((item) =>
    headers
      .map((h) => {
        const val = (item as Record<string, unknown>)[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

function exportMarkdown(items: typeof media.$inferSelect[]): string {
  let md = '# The_List Export\n\n';
  md += `Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  md += `Total items: ${items.length}\n\n`;
  md += '| Title | Type | Status | Year | Rating |\n';
  md += '|-------|------|--------|------|--------|\n';

  for (const item of items) {
    const rating = item.personalRating ? `${item.personalRating}/10` : '-';
    md += `| ${item.title} | ${item.mediaType.replace(/_/g, ' ')} | ${item.status.replace(/_/g, ' ')} | ${item.year || '-'} | ${rating} |\n`;
  }

  return md;
}
