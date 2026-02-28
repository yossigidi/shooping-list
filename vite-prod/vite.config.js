import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    logOverride: {
      'duplicate-object-key': 'silent'
    },
    drop: ['console', 'debugger']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://listnest.co.il',
        changeOrigin: true
      }
    }
  }
});
