import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from '@/utils/result';

describe('Result utility', () => {
  it('creates success Result with ok()', () => {
    const res = ok(42);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(42);
    }
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
  });

  it('creates error Result with err()', () => {
    const errorObj = new Error('test failure');
    const res = err(errorObj);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe(errorObj);
    }
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
  });
});
