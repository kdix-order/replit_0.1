/**
 * orders.test.ts
 * 注文エンドポイントのインテグレーションテスト
 * 
 * このテストファイルでは、Supertestを使用して
 * POST /api/ordersエンドポイントの動作を検証します。
 * 認証が必要なエンドポイントのテスト方法も示しています。
 * 
 * 注意: テスト環境では同一のストレージインスタンスを使用するため、
 * モジュールのリセットとインポートの順序が重要です。
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { IStorage } from '../storage';
import { Server } from 'http';

process.env.NODE_ENV = 'test';
const JWT_SECRET = process.env.JWT_SECRET || 'campus-order-jwt-secret';

describe('注文API', () => {
  let server: Server;
  let authToken: string;
  let testUserId: string;
  let testTimeSlotId: string;
  let storage: IStorage;
  let app: any;

  beforeAll(async () => {
    vi.resetModules();
    
    const { createStorage } = await import('../storage');
    storage = createStorage();
    
    const { app: expressApp, initializeApp } = await import('../index');
    app = expressApp;
    
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
    
    const products = await storage.getProducts();
    if (products.length === 0) {
      await storage.addProduct({
        id: 'test-product-1',
        name: 'テスト商品',
        description: 'テスト用の商品です',
        price: 500,
        image: 'test.jpg',
        category: 'test'
      });
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

    const cartItem = await storage.addToCart({
      userId: testUserId,
      productId: products[0].id,
      quantity: 1,
      size: '並',
      customizations: []
    });
    
    const cartItems = await storage.getCartItems(testUserId);
    expect(cartItems.length).toBe(1);
    
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
