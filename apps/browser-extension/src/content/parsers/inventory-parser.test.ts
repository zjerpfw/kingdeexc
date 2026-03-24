import { describe, expect, it } from 'vitest';
import { parseInventoryRows } from './inventory-parser';

describe('inventory-parser', () => {
  it('parses inventory keys', () => {
    const { rows } = parseInventoryRows({ rows: [{ materialid_number: 'A1', materialid_name: '测试', qty: '10' }] });
    expect(rows[0].productCode).toBe('A1');
    expect(rows[0].instantQtyBase).toBe(10);
  });
});
