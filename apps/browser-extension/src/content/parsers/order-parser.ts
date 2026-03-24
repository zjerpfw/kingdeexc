import type { NormalizedOrderRow } from '@kingdee/shared';

const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : Number(v));

export function parseOrderRows(payload: any): { rows: NormalizedOrderRow[]; warnings: string[] } {
  const list = payload?.data?.rows || payload?.rows || payload?.data || [];
  const warnings: string[] = [];
  const rows: NormalizedOrderRow[] = (Array.isArray(list) ? list : []).map((r: any) => ({
    productCode: r.materialid || '',
    productName: r.material_name || '',
    warehouse: r.stockid,
    unit: r.unit,
    qty: toNum(r.qty),
    baseUnit: r.baseunit,
    baseQty: toNum(r.baseqty),
    auxUnit: r.auxunitid,
    auxQty: toNum(r.auxqty),
    conversionRate: r.conversionrate,
    invQty: toNum(r.inv_qty),
    instantQty: toNum(r.instantqty),
    expValidQty: toNum(r.expvalidqty),
    salOccupyQty: toNum(r.saloccupyqty),
    outQty: toNum(r.out_qty),
    pickQty: toNum(r.pick_qty),
    pickOutQty: toNum(r.pick_out_qty),
    pickBaseQty: toNum(r.pick_baseqty),
    pickOutBaseQty: toNum(r.pick_out_baseqty),
    purRequestQty: toNum(r.purrequestqty),
    purOrdQty: toNum(r.purordqty),
    purOrdInQty: toNum(r.purordinqty),
    purTransitQty: toNum(r.purtransitqty),
  }));

  rows.forEach((row, i) => {
    if (!row.productCode) warnings.push(`order[${i}] 缺少商品编码 materialid`);
  });
  return { rows, warnings };
}
