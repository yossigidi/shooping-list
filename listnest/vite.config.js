import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'splash.png'],
      manifest: {
        id: '/',
        name: 'ListNest - Smart Family Shopping List',
        short_name: 'ListNest',
        description: 'Smart family shopping list with real-time sharing, price comparison, and promotions.',
        start_url: '/',
        scope: '/',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#F0FDFA',
        theme_color: '#14B8A6',
        orientation: 'portrait',
        prefer_related_applications: false,
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        handle_links: 'preferred',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Add Product',
            short_name: 'Add',
            description: 'Add a new product to the list',
            url: '/?action=add',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Family Chat',
            short_name: 'Chat',
            description: 'Open family chat',
            url: '/?action=chat',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Scan Product',
            short_name: 'Scan',
            description: 'Scan barcode or product',
            url: '/?action=scan',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }]
          }
        ],
        share_target: {
          action: '/',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        categories: ['shopping', 'utilities', 'lifestyle', 'food'],
        protocol_handlers: [
          {
            protocol: 'web+listnest',
            url: '/?item=%s'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  server: {
    port: 3000
  }
});
