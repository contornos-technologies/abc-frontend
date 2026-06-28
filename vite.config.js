import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 78 },
      jpg: { quality: 78 },
      webp: { lossless: false, quality: 80 },
      svg: {
        multipass: true,
        plugins: [{ name: 'preset-default' }],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — carregado em todas as páginas, faz sentido ser separado
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animações — framer-motion é pesado (~140kB gzip)
          'vendor-motion': ['framer-motion'],
          // Mapa — leaflet só é usado na página de contacto
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Matemática — katex só é usado nas simulações
          'vendor-katex': ['katex'],
          // Admin/charts — recharts só é usado no painel admin
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
