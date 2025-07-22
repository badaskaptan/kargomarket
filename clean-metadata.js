// Metadata temizleme scripti
import { ListingService } from './src/services/listingService.js';

async function cleanMetadata() {
  console.log('🧹 Metadata temizleme işlemi başlatılıyor...');
  
  try {
    await ListingService.cleanAllListingsMetadata();
    console.log('✅ Metadata temizleme tamamlandı!');
  } catch (error) {
    console.error('❌ Metadata temizleme sırasında hata:', error);
  }
  
  process.exit(0);
}

cleanMetadata();
