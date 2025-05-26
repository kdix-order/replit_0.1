/**
 * callNumber.concurrent.test.ts
 * 呼出番号の並列競合テスト
 * 
 * 複数の並列リクエストで getNextCallNumber() を呼び出しても
 * 重複が発生しないことを検証します。
 */

import { it, expect, beforeEach } from 'vitest';
import { storage } from '../storage';

beforeEach(() => {
  storage.resetCallNumber(300);
});

it.concurrent('50 並列取得で重複ゼロ', async () => {
  const results = await Promise.all(
    Array.from({ length: 50 }).map(() => storage.getNextCallNumber())
  );
  
  expect(new Set(results).size).toBe(results.length);
  expect(results.length).toBe(50);
});
