# BACKEND OFFERS TABLOSU GÜNCELLEMESİ

Bu README, frontend CreateOfferModal ile tam uyumlu offers tablosu güncellemelerini içerir.

## 🔧 KURULUM TALİMATLARI

### 1. Supabase Dashboard'a gidin
- Projenizin Supabase Dashboard'unu açın
- Sol menüden **SQL Editor**'ı seçin

### 2. Aşağıdaki SQL script'ini çalıştırın:

```sql
-- ==== OFFERS TABLOSU GENİŞLETME ====

-- 1. Temel taşıma bilgileri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(50);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS service_scope VARCHAR(20);

-- 2. Tarih ve süre bilgileri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS pickup_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transit_time_estimate VARCHAR(100);

-- 3. İletişim bilgileri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- 4. Hizmet özellikleri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS customs_handling_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS documentation_handling_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS loading_unloading_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tracking_system_provided BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS weekend_service BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS fuel_surcharge_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS toll_fees_included BOOLEAN DEFAULT false;

-- 5. JSON alanları
ALTER TABLE offers ADD COLUMN IF NOT EXISTS additional_terms JSONB;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS additional_services JSONB;

-- 6. Constraints
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_transport_mode_check;
ALTER TABLE offers ADD CONSTRAINT offers_transport_mode_check 
CHECK (transport_mode IS NULL OR transport_mode IN ('road', 'sea', 'air', 'rail', 'multimodal'));

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_cargo_type_check;
ALTER TABLE offers ADD CONSTRAINT offers_cargo_type_check 
CHECK (cargo_type IS NULL OR cargo_type IN (
    'general_cargo', 'bulk_cargo', 'container', 'liquid', 
    'dry_bulk', 'refrigerated', 'hazardous', 'oversized',
    'project_cargo', 'livestock', 'vehicles', 'machinery'
));

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_service_scope_check;
ALTER TABLE offers ADD CONSTRAINT offers_service_scope_check 
CHECK (service_scope IS NULL OR service_scope IN (
    'door_to_door', 'port_to_port', 'terminal_to_terminal', 
    'warehouse_to_warehouse', 'pickup_only', 'delivery_only'
));

-- 7. Price per constraint güncellemesi
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_price_per_check;
ALTER TABLE offers ADD CONSTRAINT offers_price_per_enhanced_check 
CHECK (price_per IN (
    'total', 'per_km', 'per_ton', 'per_ton_km', 
    'per_pallet', 'per_hour', 'per_day', 'per_container',
    'per_teu', 'per_cbm', 'per_piece', 'per_vehicle'
));

-- 8. İndeksler
CREATE INDEX IF NOT EXISTS idx_offers_transport_mode ON offers(transport_mode);
CREATE INDEX IF NOT EXISTS idx_offers_cargo_type ON offers(cargo_type);
CREATE INDEX IF NOT EXISTS idx_offers_service_scope ON offers(service_scope);
CREATE INDEX IF NOT EXISTS idx_offers_pickup_date ON offers(pickup_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_delivery_date ON offers(delivery_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_additional_terms_gin ON offers USING GIN (additional_terms);
CREATE INDEX IF NOT EXISTS idx_offers_additional_services_gin ON offers USING GIN (additional_services);

-- 9. Mevcut verileri güncelle
UPDATE offers SET 
    transport_mode = COALESCE(transport_mode, 'road'),
    cargo_type = COALESCE(cargo_type, 'general_cargo'),
    service_scope = COALESCE(service_scope, 'door_to_door'),
    tracking_system_provided = COALESCE(tracking_system_provided, true)
WHERE transport_mode IS NULL;
```

## 📊 ALAN AÇIKLAMALARI

### ✅ Yeni Eklenen Alanlar:

| Alan Adı | Tip | Açıklama |
|----------|-----|----------|
| `transport_mode` | VARCHAR(20) | Taşıma modu (road, sea, air, rail, multimodal) |
| `cargo_type` | VARCHAR(50) | Kargo türü (12 farklı seçenek) |
| `service_scope` | VARCHAR(20) | Hizmet kapsamı (6 farklı seçenek) |
| `pickup_date_preferred` | TIMESTAMP | Tercih edilen toplama tarihi |
| `delivery_date_preferred` | TIMESTAMP | Tercih edilen teslimat tarihi |
| `transit_time_estimate` | VARCHAR(100) | Tahmini teslimat süresi |
| `contact_person` | VARCHAR(100) | İletişim kişisi |
| `contact_phone` | VARCHAR(20) | İletişim telefonu |
| `customs_handling_included` | BOOLEAN | Gümrük işlemleri dahil mi? |
| `documentation_handling_included` | BOOLEAN | Dokümantasyon dahil mi? |
| `loading_unloading_included` | BOOLEAN | Yükleme/boşaltma dahil mi? |
| `tracking_system_provided` | BOOLEAN | Takip sistemi var mı? |
| `express_service` | BOOLEAN | Express servis var mı? |
| `weekend_service` | BOOLEAN | Hafta sonu servisi var mı? |
| `fuel_surcharge_included` | BOOLEAN | Yakıt ek ücreti dahil mi? |
| `toll_fees_included` | BOOLEAN | Geçiş ücretleri dahil mi? |
| `additional_terms` | JSONB | Ek şartlar ve koşullar |
| `additional_services` | JSONB | Ek hizmetler |

## 🎯 FRONTEND UYUMLULUK

CreateOfferModal'dan gelen veriler şu şekilde eşleşir:

### Frontend → Database Mapping:
```javascript
// Frontend form data
const offerData = {
  transport_mode: formData.transport_mode,           // → transport_mode
  cargo_type: formData.cargo_type,                   // → cargo_type  
  service_scope: formData.service_scope,             // → service_scope
  pickup_date_preferred: formData.pickup_date_preferred,     // → pickup_date_preferred
  delivery_date_preferred: formData.delivery_date_preferred, // → delivery_date_preferred
  transit_time_estimate: formData.estimated_delivery_time,   // → transit_time_estimate
  contact_person: formData.contact_person,           // → contact_person
  contact_phone: formData.contact_phone,             // → contact_phone
  
  // Boolean alanlar
  customs_handling_included: formData.terms_conditions.customs_handling,
  documentation_handling_included: formData.terms_conditions.documentation_handling,
  loading_unloading_included: formData.terms_conditions.loading_assistance,
  tracking_system_provided: formData.terms_conditions.tracking_available,
  express_service: formData.terms_conditions.express_service,
  weekend_service: formData.terms_conditions.weekend_service,
  fuel_surcharge_included: formData.additional_services.fuel_surcharge_included,
  toll_fees_included: formData.additional_services.toll_fees_included,
  
  // JSON alanlar
  additional_terms: formData.terms_conditions,       // → additional_terms (JSONB)
  additional_services: formData.additional_services  // → additional_services (JSONB)
};
```

## 📋 DOĞRULAMA

Güncelleme sonrası kontrol sorgusu:

```sql
-- Tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'offers' 
ORDER BY ordinal_position;

-- Yeni constraint'leri kontrol et
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'offers';
```

## 🚀 ÖRNEK KULLANIM

### Insert örneği:
```sql
INSERT INTO offers (
    listing_id, user_id, price_amount, price_currency, price_per,
    message, expires_at, status,
    transport_mode, cargo_type, service_scope,
    pickup_date_preferred, delivery_date_preferred, transit_time_estimate,
    contact_person, contact_phone,
    customs_handling_included, tracking_system_provided,
    additional_terms, additional_services
) VALUES (
    1, 'user123', 5000.00, 'TRY', 'total',
    'Profesyonel taşıma hizmeti', '2025-08-01', 'pending',
    'road', 'general_cargo', 'door_to_door',
    '2025-07-25 10:00:00+03', '2025-07-27 16:00:00+03', '2-3 gün',
    'Ahmet Yılmaz', '+90 555 123 4567',
    true, true,
    '{"insurance_included": true, "payment_terms": "after_delivery"}',
    '{"express_delivery": false, "weekend_delivery": true}'
);
```

### Select örnekleri:
```sql
-- Deniz taşımacılığı teklifleri
SELECT * FROM offers WHERE transport_mode = 'sea';

-- Express servis veren teklifler
SELECT * FROM offers WHERE express_service = true;

-- JSON sorgulama
SELECT * FROM offers WHERE additional_terms->>'insurance_included' = 'true';
```

## ✅ SON KONTROL LİSTESİ

- [ ] SQL script'i Supabase'de çalıştırıldı
- [ ] Tüm yeni alanlar eklendi
- [ ] Constraint'ler doğru şekilde uygulandı
- [ ] İndeksler oluşturuldu
- [ ] Mevcut veriler güncellendi
- [ ] Frontend ile uyumluluk test edildi

Bu güncelleme sonrası offers tablosu, tüm taşıma modlarında ve cargo senaryolarında çalışabilen kapsamlı bir teklif sistemi sağlayacaktır.
