/**
 * setup.ts
 * テスト環境のセットアップファイル
 * 
 * このファイルは、テスト実行前に環境変数を設定し、
 * テスト用のデータベース接続などを初期化します。
 */

import { afterAll } from 'vitest';
import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

dotenv.config();

afterAll(() => {
});
