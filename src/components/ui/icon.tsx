import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';

export type IconName =
  | 'film'
  | 'tv'
  | 'book'
  | 'camera.viewfinder'
  | 'play.rectangle'
  | 'rectangle.stack'
  | 'opticaldisc'
  | 'paintpalette'
  | 'livephoto'
  | 'mic'
  | 'headphones'
  | 'gamecontroller'
  | 'theatermasks'
  | 'folder'
  | 'star'
  | 'heart'
  | 'trash'
  | 'pencil'
  | 'arrow.left'
  | 'arrow.right'
  | 'arrow.up'
  | 'arrow.down'
  | 'xmark'
  | 'checkmark'
  | 'plus'
  | 'minus'
  | 'square.grid.2x2'
  | 'list.bullet'
  | 'person'
  | 'person.circle'
  | 'gearshape'
  | 'house'
  | 'magnifyingglass'
  | 'chart.bar'
  | 'square.and.arrow.up'
  | 'doc.on.doc'
  | 'chevron.right'
  | 'chevron.left'
  | 'ellipsis'
  | 'sparkles'
  | 'wand.and.stars'
  | 'crown'
  | 'trophy'
  | 'calendar'
  | 'clock'
  | 'eye'
  | 'eye.slash'
  | 'play'
  | 'pause'
  | 'stop'
  | 'forward'
  | 'backward'
  | 'music.note'
  | 'die.face.3'
  | 'shippingbox'
  | 'bell'
  | 'lock'
  | 'lock.open'
  | 'exclamationmark.triangle'
  | 'info.circle'
  | 'hand.thumbsup'
  | 'arrow.triangle.2.circlepath'
  | 'square.and.pencil'
  | 'sparkles.tv';

export const MEDIA_TYPE_ICONS: Record<string, IconName> = {
  movie: 'film',
  tv_show: 'tv',
  anime: 'sparkles.tv',
  documentary: 'camera.viewfinder',
  web_series: 'play.rectangle',
  mini_series: 'rectangle.stack',
  ova: 'opticaldisc',
  cartoon: 'paintpalette',
  reality_show: 'livephoto',
  podcast: 'mic',
  audiobook: 'headphones',
  book: 'book',
  game: 'gamecontroller',
  drama: 'theatermasks',
};

export const COLLECTION_ICONS: IconName[] = [
  'folder', 'film', 'tv', 'book', 'gamecontroller', 'music.note', 'star', 'heart',
];

const SF_SYMBOLS = new Set<string>([
  'film', 'tv', 'book', 'camera.viewfinder', 'play.rectangle',
  'rectangle.stack', 'opticaldisc', 'paintpalette', 'livephoto',
  'mic', 'headphones', 'gamecontroller', 'theatermasks', 'folder',
  'star', 'heart', 'trash', 'pencil', 'arrow.left', 'arrow.right',
  'xmark', 'checkmark', 'plus', 'minus', 'square.grid.2x2',
  'list.bullet', 'person', 'person.circle', 'gearshape', 'house',
  'magnifyingglass', 'chart.bar', 'square.and.arrow.up', 'doc.on.doc',
  'chevron.right', 'chevron.left', 'ellipsis', 'sparkles',
  'wand.and.stars', 'crown', 'trophy', 'calendar', 'clock', 'eye',
  'eye.slash', 'play', 'pause', 'stop', 'forward', 'backward',
  'music.note', 'die.face.3', 'shippingbox', 'bell', 'lock',
  'lock.open', 'exclamationmark.triangle', 'info.circle',
  'hand.thumbsup', 'arrow.triangle.2.circlepath', 'square.and.pencil',
  'arrow.up', 'arrow.down', 'sparkles.tv',
]);

const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

type IconProps = {
  name: IconName | string;
  size?: number;
  weight?: SymbolViewProps['weight'];
  color?: string;
  style?: Record<string, any>;
};

export function Icon({ name, size = 24, weight, color, style }: IconProps) {
  if (EMOJI_RE.test(name)) {
    return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
  }

  if (SF_SYMBOLS.has(name)) {
    return (
      <SymbolView
        name={name as SymbolViewProps['name']}
        size={size}
        weight={weight ?? 'regular' as any}
        tintColor={color}
        style={style as any}
      />
    );
  }

  return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
}

export function iconForMediaType(type: string, fallback: IconName = 'film'): IconName {
  return MEDIA_TYPE_ICONS[type] || fallback;
}
