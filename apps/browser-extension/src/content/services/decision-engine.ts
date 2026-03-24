import { evalGap, getFieldLabel, normalizeToBase } from '@kingdee/shared';
import type { GapDecision, NormalizedInventoryRow, NormalizedOrderRow, PluginSettings, RulePackage } from '@kingdee/shared';

function toBaseFromOrder(row: NormalizedOrderRow, fieldValue?: number, fieldBaseValue?: number) {
  const result = normalizeToBase({ qty: fieldValue, baseQty: fieldBaseValue, unit: row.unit, baseUnit: row.baseUnit, conversionRate: row.conversionRate });
  return result;
}

export function buildDecisions(input: {
  orders: NormalizedOrderRow[];
  inventoryPool: Record<string, NormalizedInventoryRow>;
  rulePackage: RulePackage;
  settings: PluginSettings;
}): GapDecision[] {
  const formula = input.rulePackage.formulaProfiles[0];
  if (!formula) return [];
  const rules = input.rulePackage.replacementRules.filter((r) => r.enabled);

  return input.orders.flatMap((row) => {
    const warnings: string[] = [];
    const demand = toBaseFromOrder(row, row.qty, row.baseQty);
    const executed = toBaseFromOrder(row, row.outQty, row.pickOutBaseQty);
    const purchaseIn = toBaseFromOrder(row, row.purOrdInQty);
    const purchaseTransit = toBaseFromOrder(row, row.purTransitQty);
    if (demand.manualReviewRequired || executed.manualReviewRequired || purchaseIn.manualReviewRequired || purchaseTransit.manualReviewRequired) {
      warnings.push('换算公式需人工确认');
      if (!input.settings.showWhenConversionFailed) return [];
    }

    const partsRow: any = {
      [formula.configJson.demandFieldKey]: demand.value || 0,
      [formula.configJson.executedFieldKey]: executed.value || 0,
      [formula.configJson.purchaseInboundFieldKey || 'purordinqty']: purchaseIn.value || 0,
      [formula.configJson.purchaseTransitFieldKey || 'purtransitqty']: purchaseTransit.value || 0,
      [formula.configJson.salesOccupyFieldKey || 'saloccupyqty']: row.salOccupyQty || 0,
      [formula.configJson.instantInventoryFieldKey || 'instantqty']: row.instantQty ?? row.invQty ?? 0,
      inv_qty: row.invQty,
      instantqty: row.instantQty,
    };

    const result = evalGap(formula.configJson, partsRow);
    if (result.gap <= (formula.configJson.threshold ?? 0)) return [];

    const suggestions = rules
      .filter((r) => r.sourceProductCode === row.productCode)
      .sort((a, b) => a.priority - b.priority)
      .map((r) => {
        const product = input.rulePackage.productSnapshot.find((p) => p.productCode === r.targetProductCode);
        const baseInventory = product?.latestInventory || 0;
        const cover = demand.value && demand.value > 0 ? baseInventory / demand.value * (row.qty || 1) : undefined;
        return {
          targetProductCode: r.targetProductCode,
          targetProductName: r.targetProductName,
          warehouseName: product?.warehouseName,
          baseInventory,
          coverageInOrderUnit: cover,
          canFullyCover: baseInventory >= result.gap,
        };
      })
      .filter((s) => (input.settings.onlyFullyCover ? s.canFullyCover : true));

    return [{
      productCode: row.productCode,
      productName: row.productName,
      orderUnit: row.unit,
      baseUnit: row.baseUnit,
      demandBase: result.parts.demand,
      executedBase: result.parts.executed,
      inventoryBase: result.parts.instant,
      gapBase: result.gap,
      formulaName: formula.name,
      warnings,
      suggestions,
      calculationSteps: [
        { key: formula.configJson.demandFieldKey, label: getFieldLabel('sales_order_detail', formula.configJson.demandFieldKey), rawValue: row.qty, unit: row.unit, normalizedValue: result.parts.demand },
        { key: formula.configJson.executedFieldKey, label: getFieldLabel('sales_order_detail', formula.configJson.executedFieldKey), rawValue: row.outQty, unit: row.unit, normalizedValue: result.parts.executed },
        { key: formula.configJson.instantInventoryFieldKey, label: getFieldLabel('sales_order_detail', formula.configJson.instantInventoryFieldKey), rawValue: row.instantQty ?? row.invQty, unit: row.baseUnit, normalizedValue: result.parts.instant },
      ],
    } satisfies GapDecision];
  });
}
