/**
 * テスト関連ライブラリの型宣言
 * CI/CDパイプラインの型チェックエラーを解決するための型定義
 */

import { AxeResults } from 'axe-core';

declare global {
  namespace Vi {
    interface Assertion {
      toHaveNoViolations(): void;
    }
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): void;
    }
  }
  
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';
  
  export interface JestAxeConfigureOptions {
    rules?: Record<string, { enabled: boolean }>;
    checks?: Record<string, { enabled: boolean }>;
  }
  
  export function configureAxe(options: JestAxeConfigureOptions): void;
  export function axe(html: Element | string, options?: JestAxeConfigureOptions): Promise<AxeResults>;
}
