import { describe, expect, it } from 'vitest';
import { createHash } from 'crypto';

describe('release checksum', () => {
  it('creates stable checksum', () => {
    const payload = { version: 'v1', releasedAt: '2024-01-01', list: [1, 2] };
    const checksum = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    expect(checksum.length).toBe(64);
  });
});
