# Changelog

Tüm önemli değişiklikler bu dosyada dokumentlanmıştır.

## [2.0.0] - 2025-07-26

### 🎉 Yeni Özellikler

#### Reklam Sistemi
- **Çoklu Reklam Türleri**: Banner, Video, Metin reklamları desteği
- **Medya Upload**: Supabase advertisements bucket entegrasyonu
- **Hedefleme**: Rol bazlı hedef kitle seçimi
- **Performans Takibi**: Gerçek zamanlı impression ve click metrikleri
- **CTR Hesaplama**: Otomatik Click-Through Rate hesaplaması

#### Billing ve Ödeme Sistemi
- **Kullanıcı Bakiye Sistemi**: Otomatik bakiye yönetimi
- **Transaction Geçmişi**: Detaylı ödeme ve harcama kayıtları
- **Esnek Fiyatlandırma**: 
  - Banner: 50 TL/gün
  - Video: 100 TL/gün
  - Metin: 25 TL/gün
- **Ücretsiz Beta Modu**: 500 TL hediye bakiye ile sınırsız kullanım
- **Kredi Kartı Interface**: Hazır ödeme arayüzü

#### Database Güncellemeleri
- **user_balances** tablosu: Kullanıcı bakiye bilgileri
- **billing_transactions** tablosu: Para işlem geçmişi
- **ads** tablosu: Reklam yönetimi için genişletildi
- **ad_clicks** tablosu: Tıklama analytics
- **RLS Politikaları**: Güvenlik için Row Level Security

### 🔧 Teknik İyileştirmeler

#### Frontend
- **TypeScript Interface'ler**: Tam type safety
- **Component Refactoring**: MyAdsSection tam yeniden yazıldı
- **Service Layer**: AdsService ve BillingService eklendi
- **Error Handling**: Kapsamlı hata yönetimi
- **Form Validation**: Real-time form doğrulama

#### Backend Integration
- **Supabase Functions**: update_user_balance, update_ad_metrics
- **Triggers**: Otomatik metrik güncellemeleri
- **Storage Policies**: Güvenli medya upload
- **Generated Columns**: CTR otomatik hesaplaması

### 🐛 Düzeltilen Hatalar
- **CTR Column Error**: Generated column sorunu çözüldü
- **Media Upload**: File upload policy düzeltmeleri
- **Type Mismatches**: TypeScript uyumluluk sorunları
- **RLS Security**: Row Level Security politika düzeltmeleri

### 🔄 Database Migrations

```sql
-- Yeni tablolar
CREATE TABLE user_balances (...);
CREATE TABLE billing_transactions (...);

-- Mevcut ads tablosu güncellemeleri
ALTER TABLE ads ADD COLUMN daily_budget NUMERIC;
ALTER TABLE ads ADD COLUMN total_cost NUMERIC;
ALTER TABLE ads ADD COLUMN billing_status TEXT;

-- Yeni fonksiyonlar
CREATE FUNCTION update_user_balance(...);
CREATE FUNCTION update_ad_metrics(...);
```

### 📦 Dependencies
- Supabase client güncellemeleri
- TypeScript strict mode desteği
- Yeni icon'lar ve UI bileşenleri

## [1.0.0] - 2025-07-20

### İlk Sürüm
- **Nakliye Sistemi**: Temel yük ilan yönetimi
- **Kullanıcı Yönetimi**: Authentication ve profiller
- **Mesajlaşma**: Temel chat functionality
- **Dashboard**: Ana kontrol paneli
- **Responsive Design**: Mobil uyumlu arayüz

---

## 🚀 Gelecek Sürümler

### [2.1.0] - Planlanan
- **Payment Gateway**: İyzico/PayTR entegrasyonu
- **Advanced Analytics**: Detaylı raporlama
- **A/B Testing**: Reklam performans testi
- **Mobile App**: React Native versiyonu

### [2.2.0] - Planlanan  
- **AI Targeting**: Makine öğrenmesi ile hedefleme
- **Video Analytics**: Video reklam metrikleri
- **Multi-language**: Çoklu dil desteği
- **API Marketplace**: Üçüncü parti entegrasyonlar

---

## 📝 Notlar

- **Ücretsiz Mod**: Şu anda tüm özellikler ücretsiz kullanılabilir
- **Database**: PostgreSQL + Supabase altyapısı
- **Security**: RLS ile enterprise seviye güvenlik
- **Performance**: Optimized queries ve caching

---

**⚠️ Breaking Changes**: v2.0.0'da database schema değişiklikleri var. Migration scripti çalıştırılması gerekli.
