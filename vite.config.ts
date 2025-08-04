import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Chunk boyut uyarısını artır
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manuel chunk ayırma - en etkili çözüm
        manualChunks: {
          // Vendor libraries - büyük kütüphaneleri ayır
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'date-vendor': ['date-fns'],
          // Sayfa grupları
          'pages': [
            './src/components/pages/HomePage.tsx',
            './src/components/pages/ListingsPage.tsx',
            './src/components/pages/AdsPage.tsx',
            './src/components/pages/ReviewsPage.tsx'
          ],
          // Modal grupları 
          'modals': [
            './src/components/modals/CreateOfferModal.tsx',
            './src/components/modals/EnhancedServiceOfferModal.tsx',
            './src/components/modals/MessageModal.tsx'
          ],
          // Services
          'services': [
            './src/services/listingService.ts',
            './src/services/offerService.ts',
            './src/services/adsService.ts',
            './src/services/messageService.ts'
          ]
        }
      }
    },
    // Build optimizasyonları
    minify: true
  },
  // Development optimizasyonları
  server: {
    hmr: {
      overlay: false // Hata overlay'ini kapat (performans)
    }
  }
})
