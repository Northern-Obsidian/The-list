export interface WatchProvider {
  id: string;
  name: string;
  icon: string;
  webUrl: string;
  deepLinkScheme?: string;
  itemUrlTemplate?: string;
}

export const WATCH_PROVIDERS: WatchProvider[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🎬',
    webUrl: 'https://www.netflix.com',
    deepLinkScheme: 'nflx://',
    itemUrlTemplate: 'https://www.netflix.com/title/',
  },
  {
    id: 'prime_video',
    name: 'Prime Video',
    icon: '📦',
    webUrl: 'https://www.amazon.com/Prime-Video',
    deepLinkScheme: 'primevideo://',
    itemUrlTemplate: 'https://www.amazon.com/dp/',
  },
  {
    id: 'disney_plus',
    name: 'Disney+',
    icon: '✨',
    webUrl: 'https://www.disneyplus.com',
    deepLinkScheme: 'disneyplus://',
  },
  {
    id: 'hbo_max',
    name: 'HBO Max',
    icon: '🔴',
    webUrl: 'https://www.hbomax.com',
    deepLinkScheme: 'hbomax://',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    icon: '📺',
    webUrl: 'https://www.hulu.com',
    deepLinkScheme: 'hulu://',
  },
  {
    id: 'apple_tv',
    name: 'Apple TV+',
    icon: '🍎',
    webUrl: 'https://tv.apple.com',
    deepLinkScheme: 'itmss://tv.apple.com',
  },
  {
    id: 'paramount_plus',
    name: 'Paramount+',
    icon: '🌟',
    webUrl: 'https://www.paramountplus.com',
    deepLinkScheme: 'paramountplus://',
  },
  {
    id: 'peacock',
    name: 'Peacock',
    icon: '🦚',
    webUrl: 'https://www.peacocktv.com',
    deepLinkScheme: 'peacock://',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    icon: '🍿',
    webUrl: 'https://www.crunchyroll.com',
    deepLinkScheme: 'crunchyroll://',
  },
  {
    id: 'funimation',
    name: 'Funimation',
    icon: '🎯',
    webUrl: 'https://www.funimation.com',
    deepLinkScheme: 'funimation://',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    webUrl: 'https://www.youtube.com',
    deepLinkScheme: 'youtube://',
  },
  {
    id: 'tubi',
    name: 'Tubi',
    icon: '📀',
    webUrl: 'https://tubitv.com',
    deepLinkScheme: 'tubi://',
  },
  {
    id: 'plex',
    name: 'Plex',
    icon: '📺',
    webUrl: 'https://app.plex.tv',
    deepLinkScheme: 'plex://',
  },
  {
    id: 'vudu',
    name: 'Vudu',
    icon: '💿',
    webUrl: 'https://www.vudu.com',
    deepLinkScheme: 'vudu://',
  },
  {
    id: 'other',
    name: 'Other',
    icon: '🔗',
    webUrl: '',
  },
];

export function getProvider(id: string): WatchProvider | undefined {
  return WATCH_PROVIDERS.find((p) => p.id === id);
}

export function getProviderIcon(id: string): string {
  return getProvider(id)?.icon || '🔗';
}

export function getProviderName(id: string): string {
  return getProvider(id)?.name || id;
}
