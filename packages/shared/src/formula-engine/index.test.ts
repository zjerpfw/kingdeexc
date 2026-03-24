import { describe, expect, it } from 'vitest';
import { evalGap, readNumber } from './index';

describe('formula-engine fallback', () => {
  it('uses fallback values when primary missing', () => {
    expect(readNumber({ row: { a: undefined, b: 10 } }, 'a', ['b'])).toBe(10);
  });

  it('evaluates gap with fallback inventory', () => {
    const result = evalGap({ demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', instantInventoryFieldKey: 'instantqty' }, { baseqty: 100, out_qty: 20, instantqty: undefined, inv_qty: 30 });
    expect(result.gap).toBe(50);
  });
});
