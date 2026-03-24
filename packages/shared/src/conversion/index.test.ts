import { describe, expect, it } from 'vitest';
import { convertQuantity, parseConversionFactor } from './index';

describe('conversion', () => {
  it('parses exact and approx conversion', () => {
    expect(parseConversionFactor('1 箱 = 180 副').factor).toBe(180);
    expect(parseConversionFactor('1 箱 ≈ 480 副').factor).toBe(480);
  });

  it('converts with baseqty first', () => {
    expect(convertQuantity({ qty: 1, baseqty: 50 }).value).toBe(50);
  });

  it('marks manual review for bad text', () => {
    expect(convertQuantity({ qty: 1, conversionRate: 'abc' }).manualReviewRequired).toBe(true);
  });
});
