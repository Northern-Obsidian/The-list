import { describe, it, expect } from 'vitest';
import { fuzzySearch } from '../fuzzy-search';

const items = [
  { id: '1', title: 'The Matrix', genres: 'Sci-Fi Action' },
  { id: '2', title: 'Inception', genres: 'Sci-Fi Thriller' },
  { id: '3', title: 'The Dark Knight', genres: 'Action Crime' },
  { id: '4', title: 'Interstellar', genres: 'Sci-Fi Drama' },
  { id: '5', title: 'Pulp Fiction', genres: 'Crime Drama' },
];

describe('fuzzySearch', () => {
  it('returns all items for empty query', () => {
    const results = fuzzySearch(items, '');
    expect(results.length).toBe(items.length);
  });

  it('finds items by title match', () => {
    const results = fuzzySearch(items, 'matrix');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('1');
  });

  it('sorts by relevance', () => {
    const results = fuzzySearch(items, 'the');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].title).toBe('The Matrix');
    expect(results[1].title).toBe('The Dark Knight');
  });

  it('searches across multiple keys', () => {
    const results = fuzzySearch(items, 'action', { keys: ['title', 'genres'] });
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.title === 'The Matrix')).toBe(true);
    expect(results.some((r) => r.title === 'The Dark Knight')).toBe(true);
  });

  it('returns empty for no match', () => {
    const results = fuzzySearch(items, 'zzzzzxxx');
    expect(results.length).toBe(0);
  });

  it('is case insensitive', () => {
    const results = fuzzySearch(items, 'MATRIX');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('1');
  });

  it('handles partial matching', () => {
    const results = fuzzySearch(items, 'dark');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('The Dark Knight');
  });
});
