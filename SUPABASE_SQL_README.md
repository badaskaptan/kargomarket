# Supabase SQL Dosyaları Kılavuzu

Bu klasörde bulunan SQL dosyalarının açıklamaları ve kullanım sırası:

## 🎯 Çalıştırma Sırası

### 1. `critical-tables.sql` (İLK ÖNCE ÇALIŞTIRIN)
- **Amaç:** Kritik eksik tabloları oluşturur
- **İçerik:** 
  - `reviews` tablosu (değerlendirme sistemi)
  - `transport_services` tablosu (taşımacı hizmetleri)
  - `transactions` tablosu (işlem takibi)
  - Eksik kolonları ekler (rating, sayaçlar vb.)
  - RLS politikaları ve indexler
  - Utility fonksiyonları

### 2. `supabase-fix-compatibility.sql` (İKİNCİ)
- **Amaç:** Mevcut schema ile kod arasındaki uyumsuzlukları giderir
- **İçerik:**
  - `vehicle_types` array kolonu ekleme
  - Eksik JSONB kolonları
  - Enum değer güncellemeleri

### 3. `supabase-storage-setup.sql` (ÜÇÜNCÜ)
- **Amaç:** Storage bucket'larını ve RLS politikalarını ayarlar
- **İçerik:**
  - Bucket oluşturma (avatars, documents, listings vb.)
  - Storage RLS politikaları
  - File upload/download izinleri

## ⚠️ Önemli Notlar

- SQL dosyalarını **Supabase Dashboard > SQL Editor**'da çalıştırın
- Hata alırsanız dosyayı parça parça çalıştırabilirsiniz
- `critical-tables.sql` en önemli dosya, mutlaka çalıştırın
- Storage bucket'ları zaten varsa `supabase-storage-setup.sql` hata verebilir (normal)

## 🗂️ Silinen Dosyalar

Bu dosyalar gereksizdi ve kaldırıldı:
- ❌ `supabase-missing-tables.sql` (critical-tables.sql ile aynı içerik)
- ❌ `supabase-missing-features.sql` (critical-tables.sql ile aynı içerik)  
- ❌ `supabase-schema-alignment.sql` (boş dosya)

## 📋 Kontrol Listesi

- [ ] critical-tables.sql çalıştırıldı
- [ ] supabase-fix-compatibility.sql çalıştırıldı  
- [ ] supabase-storage-setup.sql çalıştırıldı
- [ ] File upload test edildi
- [ ] Listing oluşturma test edildi
