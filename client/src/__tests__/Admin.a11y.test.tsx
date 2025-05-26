import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import Admin from '../pages/admin';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

/**
 * 管理者ページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('管理者ページのアクセシビリティ', () => {
  it('管理者ページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Admin />
      </QueryClientProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
