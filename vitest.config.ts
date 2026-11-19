import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@tests': resolve(import.meta.dirname, 'tests'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: [
        'src/domain/**/*.ts',
        'src/utils/**/*.ts',
        'src/services/**/*.ts',
        'src/components/**/*.tsx',
      ],
      exclude: [
        'src/domain/index.ts',
        'src/domain/types.ts',
        'src/**/index.ts',
        'src/services/gemini/client.ts',
      ],
      thresholds: {
        branches: 65,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
});
