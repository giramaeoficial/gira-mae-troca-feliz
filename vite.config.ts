
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Garantir que arquivos públicos sejam servidos corretamente
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks básicos
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react'],
          // Separar páginas pesadas
          'page-perfil': ['src/pages/Perfil.tsx'],
          'page-publicar': ['src/pages/PublicarItem.tsx'],
          'page-feed': ['src/pages/FeedOptimized.tsx']
        }
      },
      // Garantir que service workers sejam copiados
      external: [
        '/OneSignalSDK.sw.js',
        '/OneSignalSDKWorker.js',
        '/sw.js'
      ]
    },
    // Otimizações básicas
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Copiar arquivos públicos
    copyPublicDir: true,
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
  }
}));
