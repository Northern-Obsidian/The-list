import { describe, it, expect } from 'vitest';
import { validateMediaForm, validateCollectionForm, validateReviewForm, validateProfileForm } from '../validation';

describe('validateMediaForm', () => {
  it('returns valid for a complete form', () => {
    const result = validateMediaForm({ title: 'Inception', mediaType: 'movie' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('fails when title is empty', () => {
    const result = validateMediaForm({ title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('fails when title exceeds 500 chars', () => {
    const result = validateMediaForm({ title: 'a'.repeat(501) });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toContain('500');
  });

  it('fails when runtime is less than 1', () => {
    const result = validateMediaForm({ title: 'Test', runtime: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.runtime).toBeDefined();
  });

  it('fails when year is less than 1800', () => {
    const result = validateMediaForm({ title: 'Test', year: 1700 });
    expect(result.valid).toBe(false);
    expect(result.errors.year).toBeDefined();
  });

  it('fails when rating is out of range', () => {
    const result = validateMediaForm({ title: 'Test', personalRating: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors.personalRating).toBeDefined();
  });

  it('accepts valid rating', () => {
    const result = validateMediaForm({ title: 'Test', personalRating: 7.5 });
    expect(result.valid).toBe(true);
  });
});

describe('validateCollectionForm', () => {
  it('validates name is required', () => {
    expect(validateCollectionForm({ name: '' }).valid).toBe(false);
    expect(validateCollectionForm({ name: 'Favorites' }).valid).toBe(true);
  });
});

describe('validateReviewForm', () => {
  it('validates content is required', () => {
    expect(validateReviewForm({ content: '' }).valid).toBe(false);
    expect(validateReviewForm({ content: 'Great!' }).valid).toBe(true);
  });
});

describe('validateProfileForm', () => {
  it('validates name is required', () => {
    expect(validateProfileForm({ name: '' }).valid).toBe(false);
    expect(validateProfileForm({ name: 'Alice' }).valid).toBe(true);
  });
});
