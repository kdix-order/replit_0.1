/**
 * orders.test.ts
 * 注文エンドポイントのインテグレーションテスト
 * 
 * このテストファイルでは、Supertestを使用して
 * POST /api/ordersエンドポイントの動作を検証します。
 * 認証が必要なエンドポイントのテスト方法も示しています。
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, initializeApp } from '../index';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-order-jwt-secret';

describe('注文API', () => {
  let server: Server;
  let authToken: string;
  let testUserId: string;
  let testTimeSlotId: string;

  beforeAll(async () => {
    const result = await initializeApp();
    server = result.server;

    const testUser = await storage.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      isAdmin: false
    });
    testUserId = testUser.id;

    authToken = jwt.sign({ userId: testUserId }, JWT_SECRET);

    const timeSlots = await storage.getTimeSlots();
    if (timeSlots.length > 0) {
      testTimeSlotId = timeSlots[0].id;
    } else {
      const newTimeSlot = await storage.addTimeSlot({
        time: '12:00',
        capacity: 10,
        available: 10
      });
      testTimeSlotId = newTimeSlot.id;
    }
  });

  beforeEach(async () => {
    await storage.clearCart(testUserId);
  });

  afterAll(() => {
    server.close();
  });

  it('POST /api/orders は認証なしで401を返す', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        timeSlotId: testTimeSlotId,
        paymentMethod: 'paypay'
      });
    
    expect(response.status).toBe(401);
  });

  it('POST /api/orders は空のカートで400を返す', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        timeSlotId: testTimeSlotId,
        paymentMethod: 'paypay'
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Cart is empty');
  });

  it('POST /api/orders はカートに商品があれば201を返す', async () => {
    const products = await storage.getProducts();
    if (products.length === 0) {
      throw new Error('テスト用の商品がありません');
    }

    await storage.addToCart({
      userId: testUserId,
      productId: products[0].id,
      quantity: 1,
      size: '並',
      customizations: []
    });

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        timeSlotId: testTimeSlotId,
        paymentMethod: 'paypay'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('callNumber');
    expect(response.body).toHaveProperty('status', 'new');
  });
});
