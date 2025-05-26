/**
 * callNumber.concurrent.test.ts
 * 呼出番号の並列競合テスト
 * 
 * インスタンスベースのアプローチとモジュールリセットを使用して
 * 複数の並列リクエストで getNextCallNumber() を呼び出しても
 * 重複が発生しないことを検証します。
 */

import { beforeEach, it, expect, vi } from 'vitest';
import type { IStorage } from '../storage';

let storage: IStorage;

beforeEach(async () => {
  vi.resetModules();
  const { createStorage } = await import('../storage');
  storage = createStorage();
});

it.concurrent('50 並列取得で重複ゼロ', async () => {
  const results = await Promise.all(
    Array.from({ length: 50 }).map(() => storage.getNextCallNumber())
  );
  
  expect(new Set(results).size).toBe(results.length);
  expect(results.length).toBe(50);
});
