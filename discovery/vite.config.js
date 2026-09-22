import { defineConfig } from 'vite';

// Keep the two development servers from invalidating each other's React cache.
export default defineConfig({
  cacheDir: '../node_modules/.vite-discovery',
  resolve: { dedupe: ['react', 'react-dom'] },
});
