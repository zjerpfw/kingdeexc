import type { NormalizedInventoryRow } from '@kingdee/shared';

const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : Number(v));

export function parseInventoryRows(payload: any): { rows: NormalizedInventoryRow[]; warnings: string[] } {
  const list = payload?.data?.rows || payload?.rows || payload?.data || [];
  const warnings: string[] = [];
  const rows: NormalizedInventoryRow[] = (Array.isArray(list) ? list : []).map((r: any) => ({
    productCode: r.materialid_number || '',
    productName: r.materialid_name || '',
    warehouseCode: r.stockid_number,
    warehouseName: r.stockid_name,
    baseUnit: r.baseunit_id,
    auxUnit: r.auxunitid_id,
    floatBaseUnit: r.deffloatunit_id,
    conversionRate: r.conversionrate,
    instantQtyBase: toNum(r.qty),
    validQtyBase: toNum(r.validqty),
    auxQty: toNum(r.auxqty),
    validAuxQty: toNum(r.validauxqty),
  }));

  rows.forEach((row, i) => {
    if (!row.productCode) warnings.push(`inventory[${i}] 缺少商品编码 materialid_number`);
  });
  return { rows, warnings };
}
