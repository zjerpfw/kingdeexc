import { describe, expect, it } from 'vitest';
import { evaluateGapFormula, shouldTriggerReplacement } from './index';

describe('formula', () => {
  it('evaluates default gap', () => {
    const gap = evaluateGapFormula(
      { demandFieldKey: 'd', executedFieldKey: 'e', purchaseInboundFieldKey: 'p', instantInventoryFieldKey: 'i', compareUnit: 'base_unit', threshold: 0 },
      { d: 100, e: 20, p: 10, i: 30 },
    );
    expect(gap).toBe(40);
    expect(shouldTriggerReplacement(gap, 0)).toBe(true);
  });
});
