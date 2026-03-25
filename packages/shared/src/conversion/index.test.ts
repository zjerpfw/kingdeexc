import { describe, expect, it } from 'vitest';
import { convertQuantity, parseConversionFactor } from './index';

describe('conversion', () => {
  it('parses exact and approx conversion', () => {
    expect(parseConversionFactor('1 箱 = 180 副').factor).toBe(180);
    expect(parseConversionFactor('1 箱 ≈ 480 副').factor).toBe(480);
  });

  it('supports symbol variants and chinese approx text', () => {
    expect(parseConversionFactor('1箱＝180副').factor).toBe(180);
    expect(parseConversionFactor('1 箱 约 480 副').factor).toBe(480);
  });

  it('uses baseqty first and same-unit direct', () => {
    expect(convertQuantity({ qty: 1, baseqty: 50 }).value).toBe(50);
    expect(convertQuantity({ qty: 3, fromUnit: '副', baseUnit: '副' }).value).toBe(3);
  });

  it('converts order unit fields and flags invalid approx', () => {
    expect(convertQuantity({ qty: 2, conversionRate: '1 箱 = 180 副' }).value).toBe(360);
    expect(convertQuantity({ qty: 1, conversionRate: '约等于很多' }).manualReviewRequired).toBe(true);
  });
});
