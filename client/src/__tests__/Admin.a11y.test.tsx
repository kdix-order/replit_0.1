import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { MockAdmin } from './mocks/MockComponents';

/**
 * 管理者ページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('管理者ページのアクセシビリティ', () => {
  it('管理者ページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(<MockAdmin />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
