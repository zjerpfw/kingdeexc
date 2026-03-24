import { describe, expect, it } from 'vitest';
import { normalizeToBase } from './index';

describe('unit-conversion', () => {
  it('prefers base quantity', () => {
    expect(normalizeToBase({ qty: 1, baseQty: 180, unit: '箱', baseUnit: '副', conversionRate: '1 箱 = 180 副' }).value).toBe(180);
  });

  it('handles approximate conversion', () => {
    expect(normalizeToBase({ qty: 2, unit: '箱', baseUnit: '副', conversionRate: '1 箱 ≈ 480 副' }).value).toBe(960);
  });
});
