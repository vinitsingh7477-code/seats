import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedPath = id.replace(/\\/g, '/');
          if (normalizedPath.includes('/node_modules/@supabase/')) return 'supabase';
          if (normalizedPath.includes('/node_modules/zod/')) return 'validation';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    clearMocks: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
