import { Text } from 'react-native';
import {
  IconMovie,
  IconDeviceDesktop,
  IconBook,
  IconCamera,
  IconPlayerPlay,
  IconStack2,
  IconDisc,
  IconPalette,
  IconVideo,
  IconMicrophone,
  IconHeadphones,
  IconDeviceGamepad2,
  IconTheater,
  IconFolder,
  IconStar,
  IconHeart,
  IconTrash,
  IconPencil,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconArrowDown,
  IconX,
  IconCheck,
  IconPlus,
  IconMinus,
  IconLayoutGrid,
  IconList,
  IconUser,
  IconSettings,
  IconSettings2,
  IconHome,
  IconSearch,
  IconChartBar,
  IconUpload,
  IconFileText,
  IconChevronRight,
  IconChevronLeft,
  IconDots,
  IconSparkles,
  IconWand,
  IconCrown,
  IconTrophy,
  IconCalendar,
  IconClock,
  IconEye,
  IconPlayerPause,
  IconPlayerStop,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconMusic,
  IconDice3,
  IconPackage,
  IconBell,
  IconLock,
  IconLockOpen,
  IconAlertTriangle,
  IconInfoCircle,
  IconThumbUp,
  IconRefresh,
  IconEdit,
  IconMenu,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native';

const ICON_MAP: Record<string, TablerIcon> = {
  movie: IconMovie,
  tv: IconDeviceDesktop,
  book: IconBook,
  camera: IconCamera,
  'player-play': IconPlayerPlay,
  'stack-2': IconStack2,
  disc: IconDisc,
  palette: IconPalette,
  video: IconVideo,
  microphone: IconMicrophone,
  headphones: IconHeadphones,
  'device-gamepad-2': IconDeviceGamepad2,
  theater: IconTheater,
  folder: IconFolder,
  star: IconStar,
  heart: IconHeart,
  trash: IconTrash,
  pencil: IconPencil,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  'arrow-up': IconArrowUp,
  'arrow-down': IconArrowDown,
  x: IconX,
  check: IconCheck,
  plus: IconPlus,
  minus: IconMinus,
  'layout-grid': IconLayoutGrid,
  list: IconList,
  user: IconUser,
  settings: IconSettings,
  'settings-2': IconSettings2,
  home: IconHome,
  search: IconSearch,
  'chart-bar': IconChartBar,
  upload: IconUpload,
  'file-text': IconFileText,
  'chevron-right': IconChevronRight,
  'chevron-left': IconChevronLeft,
  dots: IconDots,
  sparkles: IconSparkles,
  wand: IconWand,
  crown: IconCrown,
  trophy: IconTrophy,
  calendar: IconCalendar,
  clock: IconClock,
  eye: IconEye,
  'eye-slash': IconEye,
  'player-pause': IconPlayerPause,
  'player-stop': IconPlayerStop,
  'player-track-next': IconPlayerTrackNext,
  'player-track-prev': IconPlayerTrackPrev,
  music: IconMusic,
  'dice-3': IconDice3,
  package: IconPackage,
  bell: IconBell,
  lock: IconLock,
  'lock-open': IconLockOpen,
  'alert-triangle': IconAlertTriangle,
  'info-circle': IconInfoCircle,
  'thumb-up': IconThumbUp,
  refresh: IconRefresh,
  edit: IconEdit,
  menu: IconMenu,
};

export type IconName = keyof typeof ICON_MAP;

export const MEDIA_TYPE_ICONS: Record<string, IconName> = {
  movie: 'movie',
  tv_show: 'tv',
  anime: 'sparkles',
  documentary: 'camera',
  web_series: 'player-play',
  mini_series: 'stack-2',
  ova: 'disc',
  cartoon: 'palette',
  reality_show: 'video',
  podcast: 'microphone',
  audiobook: 'headphones',
  book: 'book',
  game: 'device-gamepad-2',
  drama: 'theater',
};

export const COLLECTION_ICONS: IconName[] = [
  'folder', 'movie', 'tv', 'book', 'device-gamepad-2', 'music', 'star', 'heart',
];

const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

type IconProps = {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: Record<string, unknown>;
};

export function Icon({ name, size = 24, color, style }: IconProps) {
  if (EMOJI_RE.test(name)) {
    return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
  }

  const IconComponent = ICON_MAP[name];
  if (IconComponent) {
    return <IconComponent size={size} color={color} style={style} />;
  }

  return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
}

export function iconForMediaType(type: string, fallback: IconName = 'movie'): IconName {
  return MEDIA_TYPE_ICONS[type] || fallback;
}
