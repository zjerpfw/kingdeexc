import { describe, expect, it } from 'vitest';
import { buildDecisions } from './decision-engine';

const pkg = {
  version: 'v1',
  releasedAt: '2026-01-01',
  checksum: 'x',
  fieldDictionary: [],
  formulaProfiles: [{ id: 'f1', name: '默认', configJson: { demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', purchaseInboundFieldKey: 'purordinqty', purchaseTransitFieldKey: 'purtransitqty', instantInventoryFieldKey: 'instantqty', threshold: 0 } }],
  replacementRules: [{ sourceProductCode: 'A1', targetProductCode: 'B1', targetProductName: '替代商品', priority: 1, enabled: true }],
  productSnapshot: [{ productCode: 'B1', productName: '替代商品', latestInventory: 500, warehouseName: '主仓' }],
};

describe('decision-engine', () => {
  it('returns suggestion when gap > 0', () => {
    const decisions = buildDecisions({
      orders: [{ productCode: 'A1', productName: '源商品', unit: '箱', qty: 2, baseUnit: '副', baseQty: 360, outQty: 0, purOrdInQty: 0, purTransitQty: 0, instantQty: 100, conversionRate: '1 箱 = 180 副' }],
      inventoryPool: {},
      settings: { autoPopup: true, onlyFullyCover: false, showWhenConversionFailed: true },
      rulePackage: pkg,
    });
    expect(decisions.length).toBe(1);
    expect(decisions[0].suggestions[0].targetProductCode).toBe('B1');
  });

  it('converts out_qty and purordinqty from order unit when no base fields', () => {
    const decisions = buildDecisions({
      orders: [{ productCode: 'A1', productName: '源商品', unit: '箱', qty: 3, baseUnit: '副', outQty: 1, purOrdInQty: 1, purTransitQty: 0.5, instantQty: 100, conversionRate: '1 箱 = 180 副' }],
      inventoryPool: {},
      settings: { autoPopup: true, onlyFullyCover: false, showWhenConversionFailed: true },
      rulePackage: pkg,
    });
    expect(decisions[0].executedBase).toBe(180);
    expect(decisions[0].demandBase).toBe(540);
  });

  it('shows warning when approx parse fails', () => {
    const decisions = buildDecisions({
      orders: [{ productCode: 'A1', productName: '源商品', unit: '箱', qty: 1, baseUnit: '副', outQty: 0, purOrdInQty: 0, purTransitQty: 0, instantQty: 0, conversionRate: '约很多' }],
      inventoryPool: {},
      settings: { autoPopup: true, onlyFullyCover: false, showWhenConversionFailed: true },
      rulePackage: pkg,
    });
    expect(decisions[0].warnings[0]).toContain('换算公式需人工确认');
  });
});
