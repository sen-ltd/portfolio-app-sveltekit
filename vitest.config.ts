import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// The filter tests are pure-function tests and don't need a DOM.
// Overriding to 'node' avoids pulling in jsdom and matches how the
// React/Vue/Svelte siblings run their equivalent suites.
export default defineConfig({
  resolve: {
    alias: {
      // Ensure TypeScript can resolve src/* paths for tests
      '~': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        noEmit: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
