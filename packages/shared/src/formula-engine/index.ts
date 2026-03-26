export interface FormulaFallbackContext {
  row: Record<string, number | undefined | null>;
}

export function readNumber(ctx: FormulaFallbackContext, primary: string, fallbackKeys: string[] = []): number {
  const val = ctx.row[primary];
  if (typeof val === 'number') return val;
  for (const k of fallbackKeys) {
    const item = ctx.row[k];
    if (typeof item === 'number') return item;
  }
  return 0;
}

export function evalGap(config: any, row: Record<string, number | undefined | null>) {
  const ctx = { row };
  const demand = readNumber(ctx, config.demandFieldKey, ['qty']);
  const executed = readNumber(ctx, config.executedFieldKey, ['pick_out_baseqty', 'pick_out_qty']);
  const purchaseIn = config.purchaseInboundFieldKey ? readNumber(ctx, config.purchaseInboundFieldKey) : 0;
  const purchaseTransit = config.purchaseTransitFieldKey ? readNumber(ctx, config.purchaseTransitFieldKey) : 0;
  const occupy = config.salesOccupyFieldKey ? readNumber(ctx, config.salesOccupyFieldKey) : 0;
  const instant = readNumber(ctx, config.instantInventoryFieldKey, ['instantqty', 'inv_qty']);
  const gap = demand - executed - purchaseIn - purchaseTransit + occupy - instant;
  return { gap, parts: { demand, executed, purchaseIn, purchaseTransit, occupy, instant } };
}
