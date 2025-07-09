# Supabase Storage Bucket Oluşturma Rehberi

## Problem
Console loglarına göre, Supabase projesinde hiç storage bucket yok:
- `📋 All existing buckets: []`
- `📊 Total buckets found: 0`
- `StorageApiError: Bucket not found`

## Çözüm: Manuel Bucket Oluşturma

### 1. Supabase Dashboard'a Git
1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. Projenizi seçin (`rmqwrdeaecjyyalbnvbq`)
3. Sol menüden **Storage** bölümüne gidin

### 2. Documents Bucket Oluştur
1. **"New bucket"** butonuna tıklayın
2. Bucket bilgilerini girin:
   - **Name**: `documents`
   - **Public bucket**: ✅ **Açık** (önemli!)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     image/jpeg
     image/png
     ```
3. **Save** tıklayın

### 3. Listings Bucket Oluştur
1. **"New bucket"** butonuna tekrar tıklayın
2. Bucket bilgilerini girin:
   - **Name**: `listings`
   - **Public bucket**: ✅ **Açık** (önemli!)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**:
     ```
     image/jpeg
     image/png
     image/gif
     ```
3. **Save** tıklayın

### 4. Avatars Bucket Oluştur (Opsiyonel)
1. **"New bucket"** butonuna tekrar tıklayın
2. Bucket bilgilerini girin:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Açık**
   - **File size limit**: `2097152` (2MB)
   - **Allowed MIME types**:
     ```
     image/jpeg
     image/png
     image/jpg
     ```
3. **Save** tıklayın

### 5. Bucket'ları Kontrol Et
Bucket'lar oluştuktan sonra Storage bölümünde şunları görmelisiniz:
- ✅ `documents` bucket
- ✅ `listings` bucket
- ✅ `avatars` bucket (opsiyonel)

### 6. RLS Politikalarını Ayarla (Önemli!)
Bucket'lar oluştuktan sonra, her bucket için RLS politikaları ayarlamak gerekebilir:

1. Bucket'a tıklayın
2. **"Policies"** tab'ına gidin
3. Aşağıdaki politikaları ekleyin:

#### SELECT (Okuma) Politikası:
```sql
-- Public okuma için
SELECT true
```

#### INSERT (Yükleme) Politikası:
```sql
-- Authenticated kullanıcılar için
auth.uid() IS NOT NULL
```

#### UPDATE (Güncelleme) Politikası:
```sql
-- Dosya sahibi için
auth.uid()::text = (storage.foldername(name))[1]
```

#### DELETE (Silme) Politikası:
```sql
-- Dosya sahibi için
auth.uid()::text = (storage.foldername(name))[1]
```

### 7. Uygulamayı Test Et
1. Bucket'ları oluşturduktan sonra **sayfayı yenileyin** (F5)
2. "Yeni Nakliye Talebi İlanı Oluştur" formuna gidin
3. Evrak yükleme alanında artık "Storage Kurulum Gerekli" mesajı gözükmemelidir
4. Dosya yükleme işlevi aktif olmalıdır

### 8. Debug Komutları (Console'da Test İçin)
Bucket'ları oluşturduktan sonra şu komutları çalıştırabilirsiniz:

```javascript
// Connectivity test
await testStorageConnectivity()

// Bucket kontrolü
await debugBuckets()

// Storage diagnostics
await debugStorage()
```

## Alternatif: Otomatik Bucket Oluşturma
Eğer manuel oluşturma işe yaramazsa, console'da şu komutu çalıştırabilirsiniz:

```javascript
const { initializeStorageBuckets } = await import('./src/lib/storage-setup.ts')
await initializeStorageBuckets()
```

## Sorun Giderme
- Bucket'lar oluşmazsa **RLS politikalarını** kontrol edin
- **Public bucket** seçeneğinin açık olduğundan emin olun
- MIME type'ların doğru yazıldığından emin olun
- Sayfayı yenilemeyi unutmayın
