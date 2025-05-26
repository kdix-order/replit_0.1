/**
 * paypay.failure.test.ts
 * PayPay決済API失敗フローのテスト
 * 
 * このテストファイルでは、PayPayのデモモードでのエラー処理をテストします。
 * 実際のAPIはモックせず、デモモードの動作を検証します。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPayment, getPaymentDetails } from '../paypay';

describe('PayPay API 失敗フロー', () => {
  beforeEach(() => {
    delete process.env.PAYPAY_API_KEY;
    delete process.env.PAYPAY_API_SECRET;
    delete process.env.PAYPAY_MERCHANT_ID;
  });
  
  afterEach(() => {
    delete process.env.PAYPAY_API_KEY;
    delete process.env.PAYPAY_API_SECRET;
    delete process.env.PAYPAY_MERCHANT_ID;
  });

  it('デモモード: 無効な注文IDでもエラーにならない', async () => {
    const result = await createPayment('', 0, '', '');
    
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('status', 'SUCCESS');
    
    const demoResult = result as any;
    expect(demoResult.data.paymentId).toMatch(/^demo-/);
    expect(demoResult.data.merchantPaymentId).toBe('');
  });

  it('デモモード: 負の金額でもエラーにならない', async () => {
    const result = await createPayment('test_order', -100, 'テスト注文', 'http://localhost:3000');
    
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('status', 'SUCCESS');
  });

  it('デモモード: 存在しない注文IDでも支払い詳細が取得できる', async () => {
    const result = await getPaymentDetails('non_existent_order_id');
    
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('status', 'SUCCESS');
    
    const detailsResult = result as any;
    expect(detailsResult.data.status).toBe('COMPLETED');
    expect(detailsResult.data.merchantPaymentId).toBe('non_existent_order_id');
  });
});
