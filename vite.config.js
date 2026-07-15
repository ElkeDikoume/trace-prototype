import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        version: '0.2.0',
        name: 'TRACE — Caseworker Assistant',
        short_name: 'TRACE',
        description: 'Offline-first case intake, risk flagging, and AI assistant for anti-trafficking caseworkers',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // The v2 shell pulls in Supabase + MSAL + i18next, pushing the main
        // bundle just past Workbox's default 2 MiB precache ceiling. Raise the
        // limit so the service worker can precache it (build otherwise fails).
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});
