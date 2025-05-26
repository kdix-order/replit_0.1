/**
 * paypay.success.test.ts
 * PayPay決済API成功フローのテスト
 * 
 * このテストファイルでは、Nockを使用してPayPay APIをモックし、
 * 成功シナリオをテストします。
 */

import nock from 'nock';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPayment, getPaymentDetails } from '../paypay';

const API = 'https://api-sandbox.paypay.ne.jp';

describe('PayPay API 成功フロー', () => {
  beforeEach(() => {
    nock.cleanAll();
    delete process.env.PAYPAY_API_KEY;
    delete process.env.PAYPAY_API_SECRET;
    delete process.env.PAYPAY_MERCHANT_ID;
  });
  
  afterEach(() => {
    nock.restore();
    delete process.env.PAYPAY_API_KEY;
    delete process.env.PAYPAY_API_SECRET;
    delete process.env.PAYPAY_MERCHANT_ID;
  });

  it('デモモード: createPayment が SUCCESS を返す', async () => {
    const result = await createPayment('demo_order_123', 1500, 'デモ注文', 'http://localhost:3000');

    expect(result).toBeTruthy();
    expect(result).toHaveProperty('status', 'SUCCESS');
    
    const demoResult = result as any;
    expect(demoResult.data.paymentId).toMatch(/^demo-/);
    expect(demoResult.data.merchantPaymentId).toBe('demo_order_123');
    expect(demoResult.data.url).toBe('https://raw.githubusercontent.com/PayPay/paypayopa-sdk-node/master/resources/default_qrcode.png');
  });

  it('デモモード: getPaymentDetails が COMPLETED を返す', async () => {
    const result = await getPaymentDetails('demo_order_123');

    expect(result).toBeTruthy();
    expect(result).toHaveProperty('status', 'SUCCESS');
    
    const detailsResult = result as any;
    expect(detailsResult.data.status).toBe('COMPLETED');
    expect(detailsResult.data.merchantPaymentId).toBe('demo_order_123');
  });
});
