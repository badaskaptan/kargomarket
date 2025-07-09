# 📁 Dosya Yükleme Bucket Yapısı Güncellendi

## 🔄 Önemli Değişiklik

Supabase Storage yapısı **2 ayrı bucket** sistemine güncellendi:

### 📂 **Bucket Yapısı**
- **`documents`** - PDF, Word, Excel dosyaları için
- **`listings`** - Resimler (JPG, PNG, GIF) için  
- **`avatars`** - Kullanıcı profil resimleri için

### 🗃️ **Database Kolonları**
`listings` tablosunda 2 ayrı kolon:
- **`document_urls`** (text[]) - Evrak URL'leri 
- **`image_urls`** (text[]) - Resim URL'leri

## ✅ Yapılan Güncellemeler

### 1. **FileUploadService.ts**
- Default bucket: `'documents'` (evraklar için)
- Resimler için ayrı bucket kullanımı: `'listings'`

### 2. **CreateShipmentRequestSection.tsx**
- Evrak yükleme: `documents` bucket'ı kullanıyor
- Hata mesajları güncellendi

### 3. **CreateLoadListingSection.tsx** 
- `storage.uploadListingDocument()` → `documents` bucket
- `storage.uploadListingImage()` → `listings` bucket

### 4. **supabase.ts Storage Helper**
- `uploadListingDocument()` → `documents` bucket
- `uploadListingImage()` → `listings` bucket (zaten doğruydu)

### 5. **storage-setup.ts**
- 2 ayrı bucket kontrolü ve oluşturma
- `documents`, `listings`, `avatars` bucket'ları

### 6. **storage-diagnostics.ts**
- Her bucket için ayrı test
- Daha detaylı bucket erişim kontrolü

### 7. **STORAGE_SETUP_GUIDE.md**
- 2 bucket için ayrı kurulum talimatları
- MIME type spesifikasyonları güncellendi

## 🎯 **Kullanım Senaryoları**

### Evrak Yükleme:
```typescript
FileUploadService.uploadMultipleFiles(files, 'documents', 'folder')
```

### Resim Yükleme:
```typescript  
FileUploadService.uploadMultipleFiles(files, 'listings', 'folder')
```

### Storage Helper ile:
```typescript
// Evrak
storage.uploadListingDocument(listingId, file, documentType)
// Resim  
storage.uploadListingImage(listingId, file, index)
```

## 📋 **Manuel Kurulum Gerekli**

Supabase Dashboard'dan oluşturulmalı:

1. **documents** bucket (10MB, PDF/Word/Excel/JPG/PNG)
2. **listings** bucket (10MB, JPG/PNG/GIF)  
3. **avatars** bucket (5MB, JPG/PNG)

## 🚀 **Test Adımları**

1. Supabase'de bucket'ları oluşturun
2. Geliştirme sunucusunu başlatın: `npm run dev`
3. "Yeni Nakliye Talebi" formunda dosya yüklemeyi test edin
4. Console'da debug: `await debugStorage()`
5. Bucket'ların doğru kullanıldığını kontrol edin

---

**✨ Sonuç:** Bucket yapısı Supabase'deki gerçek yapıya uygun şekilde güncellendi!
