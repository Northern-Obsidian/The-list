export interface SearchableItem {
  id: string;
  title: string;
  [key: string]: unknown;
}

export interface FuzzySearchConfig {
  threshold?: number;
  keys?: string[];
}

function charScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1 + q.length / t.length;
  let qi = 0;
  let score = 0;
  let prevMatch = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += ti === prevMatch + 1 ? 2 : 1;
      if (ti === 0) score += 1;
      prevMatch = ti;
      qi++;
    }
  }
  if (qi < q.length) return 0;
  return score / (t.length + q.length);
}

export function fuzzySearch<T extends SearchableItem>(
  items: T[],
  query: string,
  config: FuzzySearchConfig = {},
): T[] {
  const { threshold = 0.15, keys = ['title'] } = config;
  if (!query.trim()) return items;
  const scored = items
    .map((item) => {
      let maxScore = 0;
      for (const key of keys) {
        const val = item[key];
        if (typeof val === 'string' || typeof val === 'number') {
          const score = charScore(query, String(val));
          if (score > maxScore) maxScore = score;
        }
      }
      return { item, score: maxScore };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
  return scored.map(({ item }) => item);
}
