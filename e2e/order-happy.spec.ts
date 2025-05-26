import { test, expect } from '@playwright/test';

/**
 * 顧客が商品を購入し、決済処理が開始されるまでのE2Eテスト
 * 
 * テストシナリオ:
 * 1. デモログイン
 * 2. 商品を注文（「並を注文」ボタン）
 * 3. カートページに遷移
 * 4. 時間枠を選択
 * 5. 注文を確定
 * 6. 支払いを確定
 * 7. 決済処理が開始されることを確認
 */
test('顧客が商品を購入し、決済処理が開始されるまでの幸福パス', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByRole('button', { name: 'デモログイン' }).click();
  await page.getByText('お客様としてログイン').click();
  
  await page.waitForSelector('text=デモアカウントでログインしました');

  await page.getByRole('button', { name: /並を注文/i }).first().click();

  const cartIcon = page.locator('a[href="/cart"]').first();
  await cartIcon.click();

  await page.waitForURL('**/cart*');

  await page.getByRole('button', { name: /注文へ進む/i }).click();

  await page.getByRole('button', { name: /残\d+枠/ }).first().click();

  await page.getByRole('button', { name: /注文を確定する/i }).click();

  await page.getByRole('button', { name: /支払いを確定する/i }).click();
  
  await expect(page.getByText('決済処理中...')).toBeVisible({ timeout: 5000 });
  
  await page.screenshot({ path: 'test-results/order-started.png' });
  
});
