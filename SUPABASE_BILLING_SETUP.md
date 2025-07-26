# 🚀 Supabase Billing System Kurulum Rehberi

## 📋 Gerekli Adımlar

### 1. **Ana SQL Script'ini Çalıştırın**
```sql
-- Dosya: create-billing-tables.sql
-- Bu script'i Supabase Dashboard > SQL Editor'de çalıştırın
-- TEK SEFERDE TÜM SİSTEMİ KURAR!
```
1. Supabase Dashboard'a gidin
2. **SQL Editor** sekmesine tıklayın
3. `create-billing-tables.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın ve **Run** butonuna basın

⚠️ **ÖNEMLİ**: Eğer daha önce yanlış `ad_clicks` tablosu oluşturulmuşsa:
```sql
-- Önce bu komutu çalıştırın:
DROP TABLE IF EXISTS public.ad_clicks CASCADE;
-- Sonra ana script'i çalıştırın
```

### 2. **Kurulum Kontrolü**
```sql
-- Tabloların oluştuğunu kontrol edin:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_balances', 'billing_transactions', 'ad_clicks');

-- Ads tablosuna yeni alanlar eklenmiş mi kontrol edin:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'ads' 
AND column_name IN ('daily_budget', 'total_cost', 'billing_status');
```

## 🔧 Yapılan Güncellemeler

### **Yeni Tablolar:**
✅ **`user_balances`** - Kullanıcı bakiye bilgileri  
✅ **`billing_transactions`** - Para işlemleri geçmişi

### **Mevcut `ads` Tablosu Güncellemeleri:**
✅ `daily_budget` - Günlük bütçe  
✅ `total_cost` - Toplam harcama  
✅ `billing_status` - Ödeme durumu  
✅ `ad_type` constraint güncellendi (banner, video, text)

### **`ad_clicks` Tablosu:**
✅ Düzeltildi (önceki duplicate problemi çözüldü)  
✅ `referrer_url` ve `click_position` alanları eklendi  
✅ RLS politikaları eklendi

### **Fonksiyonlar:**
✅ `update_user_balance()` - Güvenli bakiye güncelleme  
✅ `update_ad_metrics()` - Otomatik metrik güncelleme  
✅ Trigger'lar - Otomatik güncellemeler

### **Güvenlik:**
✅ RLS politikaları tüm tablolar için  
✅ Kullanıcılar sadece kendi verilerini görür  
✅ Ad tıklamaları herkese açık (analytics için)

## 📊 Sistem Durumu

### **Ücretsiz Mod Aktif:**
```typescript
// billingService.ts
BILLING_CONFIG = {
  FREE_MODE: true,        // ← Şu anda ÜCRETSIZ
  WELCOME_BONUS: 500,     // 500 TL hediye
}
```

### **TypeScript Interface'ler:**
✅ `Ad` interface'i güncellendi  
✅ `CreateAdData` interface'i güncellendi  
✅ Yeni billing alanları eklendi

## 🎯 Test Senaryosu

1. **Kullanıcı Girişi**: Yeni kullanıcı giriş yaptığında 500 TL hediye bakiye
2. **Reklam Oluşturma**: Ücretsiz modda sınırsız reklam oluşturma
3. **Metrik Takibi**: Impressions/clicks otomatik güncelleme
4. **Transaction Geçmişi**: Tüm işlemler kayıt altında

## ✅ Kurulum Sonrası Kontroller

### 1. Tablo Varlığı:
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_balances', 'billing_transactions', 'ads', 'ad_clicks', 'ad_impressions');
-- Sonuç: 5 olmalı
```

### 2. RLS Politikaları:
```sql
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE tablename IN ('user_balances', 'billing_transactions', 'ad_clicks');
-- Sonuç: 6+ olmalı
```

### 3. Fonksiyonlar:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_user_balance', 'update_ad_metrics');
-- 2 fonksiyon görünmeli
```

## 🚀 Sonuç

✅ **Billing sistemi tamamen hazır**  
✅ **Mevcut ads tabloları uyumlu hale getirildi**  
✅ **Ücretsiz mod aktif** (istediğiniz zaman kapatabilirsiniz)  
✅ **Production'a hazır** (RLS, indeksler, constraint'ler)

Artık kullanıcılar:
- ✅ Otomatik 500 TL hediye bakiye alacak
- ✅ Sınırsız reklam oluşturabilecek
- ✅ Reklam performansını takip edebilecek
- ✅ Transaction geçmişini görebilecek

## 🔧 Ücretli Moda Geçiş

Kullanıcı sayısı arttıktan sonra sadece:
```typescript
FREE_MODE: false  // Bu satırı değiştirin
```

🎯 **SİSTEM HAZIR!** 🎯
