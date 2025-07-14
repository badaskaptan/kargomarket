// Metadata temizleme scripti - dev mode
// Bu scripti dev server çalışırken browser console'da çalıştırabilirsin

// Browser console'da şunu çalıştır:
// await window.ListingService.cleanAllListingsMetadata();

console.log(`
🧹 METADATA TEMİZLEME TALİMATI:

1. Tarayıcıda uygulamanı aç (http://localhost:5173)
2. F12 ile developer tools'u aç  
3. Console sekmesine git
4. Şu komutu çalıştır:

   // ListingService'i global yapma:
   import { ListingService } from './src/services/listingService.ts';
   window.ListingService = ListingService;
   
   // Sonra temizleme fonksiyonunu çalıştır:
   await window.ListingService.cleanAllListingsMetadata();

5. Veya otomatik temizleme için uygulama başlangıcında çalıştır

Bu script metadata'dan şunları temizleyecek:
- required_documents (root level'da zaten var)  
- vehicle_types (duplicate entry)
- transport_details içindeki required_documents
`);

export const cleanupInstructions = true;
