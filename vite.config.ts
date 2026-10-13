import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build also works when opened from any static folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache separately from app code.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          map: ['leaflet'],
          icons: ['lucide-react'],
          qr: ['qrcode'],
        },
      },
    },
  },
});
