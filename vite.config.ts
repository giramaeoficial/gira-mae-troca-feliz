import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // CONFIGURAÇÃO CRÍTICA: Fallback para SPA routing
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/[^.]*$/, to: '/index.html' }
      ]
    }
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
  // CONFIGURAÇÃO CRÍTICA: Garantir SPA routing em produção
  publicDir: 'public',
  base: './', // URLs relativas para compatibilidade Lovable
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks básicos
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react'],
        }
      },
    },
    // Otimizações para Lovable
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
    // IMPORTANTE: Garantir que _redirects seja copiado
    assetsDir: 'assets',
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
  },
  // CONFIGURAÇÃO CRÍTICA: Preview mode para SPA
  preview: {
    port: 8080,
    host: "::",
    // Fallback para SPA em preview
    open: false,
  }
}));
