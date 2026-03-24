import { describe, expect, it } from 'vitest';
import { evalGap, readNumber } from './index';

describe('formula-engine fallback', () => {
  it('uses fallback values when primary missing', () => {
    expect(readNumber({ row: { a: undefined, b: 10 } }, 'a', ['b'])).toBe(10);
  });

  it('evaluates with baseqty and pick_out_baseqty preferred', () => {
    const result = evalGap(
      { demandFieldKey: 'baseqty', executedFieldKey: 'pick_out_baseqty', purchaseInboundFieldKey: 'purordinqty', purchaseTransitFieldKey: 'purtransitqty', instantInventoryFieldKey: 'instantqty' },
      { baseqty: 540, pick_out_baseqty: 36, purordinqty: 180, purtransitqty: 90, instantqty: 100 },
    );
    expect(result.gap).toBe(134);
  });

  it('falls back to inv_qty when instantqty missing', () => {
    const result = evalGap({ demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', instantInventoryFieldKey: 'instantqty' }, { baseqty: 100, out_qty: 20, instantqty: undefined, inv_qty: 30 });
    expect(result.gap).toBe(50);
  });
});
