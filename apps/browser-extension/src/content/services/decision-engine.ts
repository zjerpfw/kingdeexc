import { evalGap, getFieldLabel, getFieldTooltip, normalizeToBase } from '@kingdee/shared';
import type { GapDecision, NormalizedInventoryRow, NormalizedOrderRow, PluginSettings, RulePackage } from '@kingdee/shared';

function toBaseFromOrder(row: NormalizedOrderRow, fieldValue?: number, fieldBaseValue?: number) {
  return normalizeToBase({ qty: fieldValue, baseQty: fieldBaseValue, unit: row.unit, baseUnit: row.baseUnit, conversionRate: row.conversionRate });
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

    const inventoryFromPool = input.inventoryPool[row.productCode];
    const instantBase = row.instantQty ?? row.invQty ?? inventoryFromPool?.instantQtyBase ?? inventoryFromPool?.validQtyBase ?? 0;

    const partsRow: Record<string, number> = {
      [formula.configJson.demandFieldKey]: demand.value || 0,
      [formula.configJson.executedFieldKey]: executed.value || 0,
      [formula.configJson.purchaseInboundFieldKey || 'purordinqty']: purchaseIn.value || 0,
      [formula.configJson.purchaseTransitFieldKey || 'purtransitqty']: purchaseTransit.value || 0,
      [formula.configJson.salesOccupyFieldKey || 'saloccupyqty']: row.salOccupyQty || 0,
      [formula.configJson.instantInventoryFieldKey || 'instantqty']: instantBase,
      inv_qty: row.invQty || 0,
      instantqty: row.instantQty || 0,
    };

    const result = evalGap(formula.configJson, partsRow);
    const threshold = Number(formula.configJson.threshold ?? 0);
    if (result.gap <= threshold) return [];

    const suggestions = rules
      .filter((r) => r.sourceProductCode === row.productCode)
      .sort((a, b) => a.priority - b.priority)
      .map((r) => {
        const product = input.rulePackage.productSnapshot.find((p) => p.productCode === r.targetProductCode);
        const baseInventory = Number(product?.latestInventory || 0);
        const factor = normalizeToBase({ qty: 1, unit: row.unit, baseUnit: row.baseUnit, conversionRate: row.conversionRate });
        const coverageInOrderUnit = factor.value ? baseInventory / factor.value : undefined;
        return {
          targetProductCode: r.targetProductCode,
          targetProductName: r.targetProductName,
          warehouseName: product?.warehouseName,
          baseInventory,
          coverageInOrderUnit,
          canFullyCover: baseInventory >= result.gap,
        };
      })
      .filter((s) => (input.settings.onlyFullyCover ? s.canFullyCover : true));

    const formulaExpr = `${result.parts.demand} - ${result.parts.executed} - ${result.parts.purchaseIn} - ${result.parts.purchaseTransit} + ${result.parts.occupy} - ${result.parts.instant}`;

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
        { key: formula.configJson.purchaseInboundFieldKey || 'purordinqty', label: getFieldLabel('sales_order_detail', formula.configJson.purchaseInboundFieldKey || 'purordinqty'), rawValue: row.purOrdInQty, unit: row.unit, normalizedValue: result.parts.purchaseIn },
        { key: formula.configJson.purchaseTransitFieldKey || 'purtransitqty', label: getFieldLabel('sales_order_detail', formula.configJson.purchaseTransitFieldKey || 'purtransitqty'), rawValue: row.purTransitQty, unit: row.unit, normalizedValue: result.parts.purchaseTransit },
        { key: formula.configJson.instantInventoryFieldKey, label: getFieldLabel('sales_order_detail', formula.configJson.instantInventoryFieldKey), rawValue: instantBase, unit: row.baseUnit, normalizedValue: result.parts.instant },
        { key: 'formula_result', label: `最终公式（gap）`, rawValue: `${formulaExpr} = ${result.gap}`, unit: '', normalizedValue: result.gap },
        { key: 'formula_desc', label: `公式说明`, rawValue: getFieldTooltip('sales_order_detail', formula.configJson.demandFieldKey), unit: '', normalizedValue: result.gap },
      ],
    } satisfies GapDecision];
  });
}
