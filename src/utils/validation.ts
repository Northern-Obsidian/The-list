import type { MediaFormData, CollectionFormData, ReviewFormData, ProfileFormData } from '@/types/media';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function required(value: unknown, label: string): string | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${label} is required`;
  }
  return null;
}

function maxLength(value: string, max: number, label: string): string | null {
  if (value && value.length > max) {
    return `${label} must be ${max} characters or less`;
  }
  return null;
}

function min(value: number | undefined, minVal: number, label: string): string | null {
  if (value !== undefined && value < minVal) {
    return `${label} must be at least ${minVal}`;
  }
  return null;
}

export function validateMediaForm(data: Partial<MediaFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const titleErr = required(data.title, 'Title');
  if (titleErr) errors.title = titleErr;

  const maxErr = maxLength(data.title || '', 500, 'Title');
  if (maxErr) errors.title = maxErr;

  if (data.runtime !== undefined) {
    const runtimeErr = min(data.runtime, 1, 'Runtime');
    if (runtimeErr) errors.runtime = runtimeErr;
  }

  if (data.year !== undefined) {
    const yearErr = min(data.year, 1800, 'Year');
    if (yearErr) errors.year = yearErr;
  }

  if (data.personalRating !== undefined) {
    if (data.personalRating < 0 || data.personalRating > 10) {
      errors.personalRating = 'Rating must be between 0 and 10';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCollectionForm(data: Partial<CollectionFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const titleErr = required(data.name, 'Name');
  if (titleErr) errors.name = titleErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateReviewForm(data: Partial<ReviewFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const contentErr = required(data.content, 'Review content');
  if (contentErr) errors.content = contentErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProfileForm(data: Partial<ProfileFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = required(data.name, 'Name');
  if (nameErr) errors.name = nameErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
