import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: 'manifest.json',
    rollupOptions: {
      input: ['/client-entry.tsx'],
    },
  },
});
