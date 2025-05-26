import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '@/components/ui/provider';

/**
 * テスト用のラッパーコンポーネント
 * テスト対象のコンポーネントに必要なプロバイダーを提供します
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

/**
 * カスタムレンダー関数
 * テスト対象のコンポーネントを必要なプロバイダーでラップしてレンダリングします
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
