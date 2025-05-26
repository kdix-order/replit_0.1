import { test, expect } from '@playwright/test';

test('顧客が商品を購入し、呼出番号が表示されるまでの幸福パス', async ({ page }) => {
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
  
  await expect(page.getByRole('heading', { name: '注文完了' })).toBeVisible({ timeout: 30000 });
  
  await expect(page.getByText('お呼び出し番号をご確認ください')).toBeVisible({ timeout: 5000 });
});
