import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import Menu from '../pages/menu';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

/**
 * メニューページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('メニューページのアクセシビリティ', () => {
  it('メニューページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Menu />
      </QueryClientProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
