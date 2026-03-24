import { convertQuantity, parseConversionFactor } from '../conversion';

export { parseConversionFactor };

export function normalizeToBase(params: {
  qty?: number | null;
  baseQty?: number | null;
  unit?: string | null;
  baseUnit?: string | null;
  conversionRate?: string | null;
}) {
  return convertQuantity({
    qty: params.qty,
    baseqty: params.baseQty,
    fromUnit: params.unit,
    baseUnit: params.baseUnit,
    conversionRate: params.conversionRate,
  });
}
