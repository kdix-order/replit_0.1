import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import Cart from '../pages/cart';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

/**
 * カートページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('カートページのアクセシビリティ', () => {
  it('カートページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Cart />
      </QueryClientProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
