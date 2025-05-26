import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { MockMenu } from './mocks/MockComponents';

/**
 * ホームページのアクセシビリティテスト
 * 重大なアクセシビリティ違反がないことを確認します
 */
describe('ホームページのアクセシビリティ', () => {
  it('ホームページに重大なアクセシビリティ違反がない', async () => {
    const { container } = render(<MockMenu />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
