// vite.config.ts
import { defineConfig } from "file:///C:/Users/FCC/Downloads/warm-web-core-main/warm-web-core-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/FCC/Downloads/warm-web-core-main/warm-web-core-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/FCC/Downloads/warm-web-core-main/warm-web-core-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\FCC\\Downloads\\warm-web-core-main\\warm-web-core-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
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
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxGQ0NcXFxcRG93bmxvYWRzXFxcXHdhcm0td2ViLWNvcmUtbWFpblxcXFx3YXJtLXdlYi1jb3JlLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEZDQ1xcXFxEb3dubG9hZHNcXFxcd2FybS13ZWItY29yZS1tYWluXFxcXHdhcm0td2ViLWNvcmUtbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRkNDL0Rvd25sb2Fkcy93YXJtLXdlYi1jb3JlLW1haW4vd2FybS13ZWItY29yZS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIC8vIFZpdGVQV0EgdGVtcG9yYXJpbHkgZGlzYWJsZWQgLSBlbmFibGUgYWZ0ZXIgaW5zdGFsbGluZyB3b3JrYm94IGRlcGVuZGVuY2llc1xuICAgIC8vIFZpdGVQV0Eoe1xuICAgIC8vICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgLy8gICBkZXZPcHRpb25zOiB7XG4gICAgLy8gICAgIGVuYWJsZWQ6IGZhbHNlXG4gICAgLy8gICB9LFxuICAgIC8vICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnN2ZycsICdtYXNrZWQtaWNvbi5zdmcnXSxcbiAgICAvLyAgIG1hbmlmZXN0OiB7XG4gICAgLy8gICAgIG5hbWU6ICdEaWdpdGFsIFF1cmFuIEFjYWRlbXknLFxuICAgIC8vICAgICBzaG9ydF9uYW1lOiAnUXVyYW5BY2FkZW15JyxcbiAgICAvLyAgICAgZGVzY3JpcHRpb246ICdQcmVtaXVtIE9ubGluZSBRdXJhbiBFZHVjYXRpb24gUGxhdGZvcm0nLFxuICAgIC8vICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgIC8vICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgLy8gICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAvLyAgICAgc2NvcGU6ICcvJyxcbiAgICAvLyAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgLy8gICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgIC8vICAgICBpY29uczogW1xuICAgIC8vICAgICAgIHtcbiAgICAvLyAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnN2ZycsXG4gICAgLy8gICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgIC8vICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5zdmcnLFxuICAgIC8vICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAvLyAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJ1xuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIuc3ZnJyxcbiAgICAvLyAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgLy8gICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgLy8gICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgXVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtYLFNBQVMsb0JBQW9CO0FBQy9ZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFzQzVDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
