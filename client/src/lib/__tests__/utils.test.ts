import { describe, it, expect } from 'vitest';
import { cn, getCustomizationLabel } from '../utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });
});

describe('getCustomizationLabel', () => {
  it('should return correct Japanese labels for known customization IDs', () => {
    expect(getCustomizationLabel('no_egg')).toBe('玉子抜き');
    expect(getCustomizationLabel('no_onion')).toBe('玉ねぎ抜き');
    expect(getCustomizationLabel('extra_sauce')).toBe('ソース増量');
    expect(getCustomizationLabel('less_sauce')).toBe('ソース少なめ');
    expect(getCustomizationLabel('extra_spicy')).toBe('辛さ増し');
    expect(getCustomizationLabel('less_spicy')).toBe('辛さ控えめ');
  });

  it('should return the original ID for unknown customization IDs', () => {
    expect(getCustomizationLabel('unknown_id')).toBe('unknown_id');
    expect(getCustomizationLabel('')).toBe('');
  });
});
