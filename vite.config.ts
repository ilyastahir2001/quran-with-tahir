import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // VitePWA temporarily disabled - enable after installing workbox dependencies
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: false
    //   },
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.svg', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'Digital Quran Academy',
    //     short_name: 'QuranAcademy',
    //     description: 'Premium Online Quran Education Platform',
    //     theme_color: '#ffffff',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     scope: '/',
    //     start_url: '/',
    //     orientation: 'portrait',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: 'pwa-512x512.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: 'pwa-512x512.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   }
    // })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
