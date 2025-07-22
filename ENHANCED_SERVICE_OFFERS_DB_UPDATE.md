# Enhanced Service Offers - Supabase Veritabanı Güncellemesi

## 📋 Özet
EnhancedServiceOfferModal'ımız 4-adımlı profesyonel teklif sistemi için Supabase'deki `service_offers` tablosuna eksik alanları ekledik.

## 🚀 Çalıştırılacak Adımlar

### 1. Mevcut Schema Güncellemesini Uygula
```bash
# Önce mevcut enhanced schema'yı çalıştır (eğer daha önce çalıştırılmadıysa)
psql -h your-db-host -U your-username -d your-database -f enhance-service-offers-table.sql

# Ardından yeni eksik alanları ekle
psql -h your-db-host -U your-username -d your-database -f enhanced-service-offers-missing-fields.sql
```

### 2. Supabase Dashboard'dan Çalıştırma
Alternatif olarak, Supabase Dashboard > SQL Editor'dan şu dosyaları sırayla çalıştır:
1. `enhance-service-offers-table.sql`
2. `enhanced-service-offers-missing-fields.sql`

## 📊 Eklenen Yeni Alanlar

### Tarih Alanları
- `pickup_date_latest` - En geç pickup tarihi
- `delivery_date_latest` - En geç teslimat tarihi

### Kapasite Bilgileri
- `weight_capacity_kg` - Ağırlık kapasitesi (kg) - DECIMAL(10,2)
- `volume_capacity_m3` - Hacim kapasitesi (m³) - DECIMAL(10,3)

### Sigorta Bilgileri
- `insurance_coverage_amount` - Sigorta kapsama tutarı - DECIMAL(15,2)
- `insurance_provider` - Sigorta sağlayıcısı - VARCHAR(100)

### Ek Ücret Dahil Edilenler
- `port_charges_included` - Liman ücretleri dahil mi - BOOLEAN
- `airport_charges_included` - Havaalanı ücretleri dahil mi - BOOLEAN

### Garantiler
- `on_time_guarantee` - Zamanında teslimat garantisi - BOOLEAN
- `damage_free_guarantee` - Hasarsız teslimat garantisi - BOOLEAN
- `temperature_guarantee` - Sıcaklık garantisi - BOOLEAN

### Ek İletişim
- `emergency_contact` - Acil durum iletişim - VARCHAR(100)

### Risk Yönetimi
- `contingency_plan` - Acil durum planı - TEXT

## 🔍 Eklenen Indexler
- `idx_service_offers_pickup_date_latest` - pickup_date_latest için
- `idx_service_offers_delivery_date_latest` - delivery_date_latest için
- `idx_service_offers_weight_capacity` - weight_capacity_kg için
- `idx_service_offers_volume_capacity` - volume_capacity_m3 için
- `idx_service_offers_insurance_amount` - insurance_coverage_amount için

## ✅ Güncellenen Dosyalar
1. **Database Schema**: `enhanced-service-offers-missing-fields.sql`
2. **TypeScript Types**: `src/types/database-types.ts`

## 🎯 Sonuç
Bu güncellemelerden sonra EnhancedServiceOfferModal'daki tüm form alanları Supabase'deki `service_offers` tablosunda desteklenecek ve veri kaybı olmayacak.

## ⚠️ Önemli Notlar
- Tüm yeni alanlar `NULL` değer alabilir, bu nedenle mevcut veriler etkilenmez
- İndexler performans için eklenmiş, isteğe bağlı olarak kaldırılabilir
- Sigorta tutarı ve kapasite alanları için ondalık sayı desteği eklenmiş
