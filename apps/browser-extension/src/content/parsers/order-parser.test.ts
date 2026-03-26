import { describe, expect, it } from 'vitest';
import { parseOrderRows } from './order-parser';

describe('order-parser', () => {
  it('parses order keys', () => {
    const { rows } = parseOrderRows({ rows: [{ materialid: 'A1', material_name: '测试', qty: '2', baseqty: '360' }] });
    expect(rows[0].productCode).toBe('A1');
    expect(rows[0].baseQty).toBe(360);
  });
});
