import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    setupFiles: [
      './server/__tests__/setup.ts', // サーバーテストセットアップファイル
      './vitest.setup.ts',           // アクセシビリティテストセットアップファイル
    ],
    include: [
      'server/**/*.{test,spec}.{ts,tsx}',
      'client/src/**/*.{test,spec}.{ts,tsx}',
      'client/src/__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    environmentMatchGlobs: [
      ['client/**/*.{test,spec}.{ts,tsx}', 'jsdom'],
      ['client/__tests__/**/*.{test,spec}.{ts,tsx}', 'jsdom'],
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
});
