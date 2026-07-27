export const RULE_FIELDS = [
  'mediaType', 'status', 'year', 'rating', 'genre', 'director', 'studio',
] as const;

export type RuleField = (typeof RULE_FIELDS)[number];

export const RULE_OPERATORS = [
  'equals', 'not_equals', 'greater_than', 'less_than',
  'contains', 'not_contains', 'between', 'is_empty', 'is_not_empty',
] as const;

export type RuleOperator = (typeof RULE_OPERATORS)[number];

export const RULE_GROUP = ['all', 'any'] as const;

export type RuleGroup = (typeof RULE_GROUP)[number];

export interface SmartRule {
  field: RuleField;
  operator: RuleOperator;
  value: string;
  value2?: string;
}

export interface SmartRules {
  group: RuleGroup;
  rules: SmartRule[];
}

export const FIELD_LABELS: Record<RuleField, string> = {
  mediaType: 'Media Type',
  status: 'Status',
  year: 'Year',
  rating: 'Rating',
  genre: 'Genre',
  director: 'Director',
  studio: 'Studio',
};

export const OPERATOR_LABELS: Record<RuleOperator, string> = {
  equals: 'is',
  not_equals: 'is not',
  greater_than: 'greater than',
  less_than: 'less than',
  contains: 'contains',
  not_contains: 'does not contain',
  between: 'between',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

export const MEDIA_TYPE_OPTIONS = [
  { value: 'movie', label: 'Movie' },
  { value: 'tv_show', label: 'TV Show' },
  { value: 'anime', label: 'Anime' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'book', label: 'Book' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'game', label: 'Game' },
];

export const STATUS_OPTIONS = [
  { value: 'plan_to_watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'rewatching', label: 'Rewatching' },
];
