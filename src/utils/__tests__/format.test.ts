import { describe, it, expect } from 'vitest';
import { formatDate, formatRuntime, formatPercentage, formatRating } from '../format';

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRuntime', () => {
  it('formats minutes only', () => {
    expect(formatRuntime(45)).toBe('45m');
  });

  it('formats hours only', () => {
    expect(formatRuntime(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatRuntime(142)).toBe('2h 22m');
  });

  it('handles zero', () => {
    expect(formatRuntime(0)).toBe('0m');
  });
});

describe('formatPercentage', () => {
  it('formats decimal to percentage', () => {
    expect(formatPercentage(0.5)).toBe('50%');
    expect(formatPercentage(1)).toBe('100%');
    expect(formatPercentage(0.123)).toBe('12%');
  });
});

describe('formatRating', () => {
  it('formats rating to one decimal', () => {
    expect(formatRating(7.5)).toBe('7.5');
    expect(formatRating(8)).toBe('8.0');
  });
});
