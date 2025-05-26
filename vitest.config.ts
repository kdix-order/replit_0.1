import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',          // ブラウザ環境をエミュレート
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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
});
