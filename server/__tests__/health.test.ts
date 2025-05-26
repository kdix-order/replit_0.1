/**
 * health.test.ts
 * ヘルスチェックエンドポイントのインテグレーションテスト
 * 
 * このテストファイルでは、Supertestを使用して
 * GET /healthエンドポイントの動作を検証します。
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, initializeApp } from '../index';
import { Server } from 'http';

describe('ヘルスチェックAPI', () => {
  let server: Server;

  beforeAll(async () => {
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(() => {
    server.close();
  });

  it('GET /health は200ステータスコードを返す', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
