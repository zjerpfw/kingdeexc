import { ConversionResult } from '../types';

const normalizeFormulaText = (text: string) =>
  text
    .replace(/[：:]/g, '=')
    .replace(/[＝]/g, '=')
    .replace(/[∼〜~]/g, '≈')
    .replace(/约|大约/g, '≈')
    .replace(/\s+/g, '');

export function parseConversionFactor(conversionRate: string): ConversionResult {
  const cleaned = normalizeFormulaText(conversionRate || '');
  if (!cleaned) return { value: null, factor: null, manualReviewRequired: true, parsedFrom: conversionRate };

  const exact = cleaned.match(/1[^=≈]*=([\d.]+)/);
  if (exact) return { value: null, factor: Number(exact[1]), manualReviewRequired: false, parsedFrom: conversionRate };

  const approx = cleaned.match(/1[^=≈]*≈([\d.]+)/);
  if (approx) return { value: null, factor: Number(approx[1]), manualReviewRequired: false, parsedFrom: conversionRate };

  return { value: null, factor: null, manualReviewRequired: true, parsedFrom: conversionRate };
}

export function convertQuantity(params: {
  qty?: number | null;
  baseqty?: number | null;
  fromUnit?: string | null;
  baseUnit?: string | null;
  conversionRate?: string | null;
}): ConversionResult {
  const { qty, baseqty, fromUnit, baseUnit, conversionRate } = params;
  if (typeof baseqty === 'number') return { value: baseqty, factor: null, manualReviewRequired: false };
  if (fromUnit && baseUnit && fromUnit === baseUnit && typeof qty === 'number') return { value: qty, factor: 1, manualReviewRequired: false };
  if (typeof qty === 'number' && conversionRate) {
    const factor = parseConversionFactor(conversionRate);
    if (factor.factor !== null) return { value: qty * factor.factor, factor: factor.factor, manualReviewRequired: false, parsedFrom: conversionRate };
    return { value: null, factor: null, manualReviewRequired: true, parsedFrom: conversionRate };
  }
  return { value: null, factor: null, manualReviewRequired: true };
}
