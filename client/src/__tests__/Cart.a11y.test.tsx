import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { MockCart } from './mocks/MockComponents';

/**
 * カートページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('カートページのアクセシビリティ', () => {
  it('カートページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(<MockCart />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
