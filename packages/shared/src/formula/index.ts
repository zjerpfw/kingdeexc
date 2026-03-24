import { FormulaProfileConfig } from '../types';

export interface FormulaInputRow { [k: string]: number | undefined }

export function evaluateGapFormula(config: FormulaProfileConfig, row: FormulaInputRow): number {
  const demand = row[config.demandFieldKey] ?? 0;
  const executed = row[config.executedFieldKey] ?? 0;
  const purchaseInbound = config.purchaseInboundFieldKey ? row[config.purchaseInboundFieldKey] ?? 0 : 0;
  const purchaseTransit = config.purchaseTransitFieldKey ? row[config.purchaseTransitFieldKey] ?? 0 : 0;
  const salesOccupy = config.salesOccupyFieldKey ? row[config.salesOccupyFieldKey] ?? 0 : 0;
  const instant = row[config.instantInventoryFieldKey] ?? 0;
  return demand - executed - purchaseInbound - purchaseTransit + salesOccupy - instant;
}

export function shouldTriggerReplacement(gap: number, threshold: number): boolean {
  return gap > threshold;
}

export const BUILTIN_FORMULA_TEMPLATES = [
  { name: '基础缺口', config: { demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', instantInventoryFieldKey: 'instantqty', compareUnit: 'base_unit', threshold: 0 } },
  { name: '考虑采购入库', config: { demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', purchaseInboundFieldKey: 'purordinqty', instantInventoryFieldKey: 'instantqty', compareUnit: 'base_unit', threshold: 0 } },
  { name: '考虑在途与占用', config: { demandFieldKey: 'baseqty', executedFieldKey: 'out_qty', purchaseInboundFieldKey: 'purordinqty', purchaseTransitFieldKey: 'purtransitqty', salesOccupyFieldKey: 'saloccupyqty', instantInventoryFieldKey: 'instantqty', compareUnit: 'base_unit', threshold: 0 } },
] as const;
