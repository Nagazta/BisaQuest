import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 75, compressionLevel: 9 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
    }),
  ],
})
