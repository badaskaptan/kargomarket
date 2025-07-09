# 🗄️ Supabase Storage Bucket Kurulum Rehberi

## ❌ Problem
RLS (Row Level Security) politikaları nedeniyle storage bucket'ları otomatik oluşturulamıyor.

```
❌ Error creating documents bucket: StorageApiError: new row violates row-level security policy
❌ Error creating listings bucket: StorageApiError: new row violates row-level security policy
❌ Error creating avatars bucket: StorageApiError: new row violates row-level security policy
```

## ✅ Çözüm: Manuel Bucket Oluşturma

### 1️⃣ Supabase Dashboard'a Git
1. [Supabase Dashboard](https://app.supabase.com) açın
2. Projenizi seçin (`kargomarkettt`)
3. Sol menüden **Storage** sekmesine tıklayın

### 2️⃣ Bucket'ları Oluşturun

#### � **documents** Bucket'ı (Evraklar için)
1. **"New bucket"** butonuna tıklayın
2. **Bucket name:** `documents`
3. **Public bucket:** ✅ (İşaretli)
4. **File size limit:** `10 MB`
5. **Allowed MIME types:** `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png`
6. **Create bucket** butonuna tıklayın

#### 🖼️ **listings** Bucket'ı (Resimler için)
1. **"New bucket"** butonuna tıklayın
2. **Bucket name:** `listings`
3. **Public bucket:** ✅ (İşaretli)
4. **File size limit:** `10 MB`
5. **Allowed MIME types:** `image/jpeg,image/png,image/gif`
6. **Create bucket** butonuna tıklayın

#### 👤 **avatars** Bucket'ı
1. **"New bucket"** butonuna tıklayın
2. **Bucket name:** `avatars`
3. **Public bucket:** ✅ (İşaretli)
4. **File size limit:** `5 MB`
5. **Allowed MIME types:** `image/jpeg,image/png,image/webp`
6. **Create bucket** butonuna tıklayın

### 3️⃣ RLS Politikalarını Ayarlayın

Her bucket için aşağıdaki politikaları ekleyin:

#### **listings** için:
```sql
-- Herkes okuyabilir
CREATE POLICY "Anyone can view listing images" ON storage.objects
FOR SELECT USING (bucket_id = 'listing-images');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own listing images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own listing images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **listing-documents** için:
```sql
-- Herkes okuyabilir
CREATE POLICY "Anyone can view listing documents" ON storage.objects
FOR SELECT USING (bucket_id = 'listing-documents');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload listing documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listing-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own listing documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'listing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own listing documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'listing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **avatars** için:
```sql
-- Herkes okuyabilir
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4️⃣ Doğrulama

Bucket'lar oluşturulduktan sonra:

1. **Storage** sekmesinde 3 bucket'ın da listelendiğini kontrol edin
2. Her bucket'a tıklayarak ayarlarını kontrol edin
3. **Policies** sekmesinden RLS politikalarının aktif olduğunu doğrulayın

### 5️⃣ Uygulamayı Yeniden Başlatın

Bucket'lar oluşturulduktan sonra uygulamayı yeniden başlatın:

```bash
npm run dev
```

## 🎯 Sonuç

Bu adımları tamamladıktan sonra:
- ✅ Dosya yükleme işlemleri çalışacak
- ✅ İlan oluşturma formunda evrak yüklemesi aktif olacak
- ✅ Storage hataları ortadan kalkacak

## 🔧 Alternatif: RLS'yi Geçici Devre Dışı Bırakma (Önerilmez)

Eğer yukarıdaki yöntem çalışmazsa, geçici olarak RLS'yi devre dışı bırakabilirsiniz:

```sql
-- ⚠️ GÜVENLİK RİSKİ: Yalnızca geliştirme ortamında kullanın
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Not:** Bu yöntem güvenlik riskleri oluşturur ve production ortamında kullanılmamalıdır.

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Supabase Dashboard'da bucket'ların oluştuğunu kontrol edin
2. Browser console'unda storage hatalarının kaybolduğunu doğrulayın
3. Dosya yükleme işlemini test edin
