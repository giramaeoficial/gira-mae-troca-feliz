
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Chunks por funcionalidade
          'pages-auth': [
            './src/pages/Login.tsx',
            './src/pages/Cadastro.tsx', 
            './src/pages/Auth.tsx'
          ],
          'pages-main': [
            './src/pages/Feed.tsx',
            './src/pages/Perfil.tsx'
          ],
          'pages-commerce': [
            './src/pages/SistemaGirinhas.tsx',
            './src/pages/Carteira.tsx',
            './src/pages/MinhasReservas.tsx'
          ],
          'components-shared': [
            './src/components/shared/Header.tsx',
            './src/components/shared/QuickNav.tsx'
          ],
          'hooks': [
            './src/hooks/useAuth.tsx',
            './src/hooks/useCarteira.ts',
            './src/hooks/useItens.ts'
          ]
        }
      }
    },
    // Otimizações adicionais
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Code splitting mais agressivo
    cssCodeSplit: true,
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
}));
