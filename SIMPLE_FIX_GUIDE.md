# 🚀 KargoMarket Mesajlaşma FK Düzeltme - BASİT ADIMLAR

## Sorun
- RLS policy'leri `receiver_id` kolonuna bağımlı
- `creator_id does not exist` hatası alıyorsunuz

## Çözüm - Bu SQL dosyalarını Supabase'de SIRASI İLE çalıştırın:

### 1. RLS Policy'leri Kaldır
```sql
-- step1-remove-policies.sql dosyasını çalıştır
-- Tüm mesajlaşma policy'lerini kaldırır
```

### 2. conversations Tablosunu Düzelt  
```sql
-- step2-fix-conversations.sql dosyasını çalıştır
-- sender_id → creator_id (rename)
-- receiver_id'yi kaldırır (CASCADE ile)
```

### 3. FK Constraint'leri Düzelt
```sql
-- step3-fix-foreign-keys.sql dosyasını çalıştır
-- Tüm FK'ları profiles tablosuna yönlendirir
```

### 4. Değişiklikleri Kontrol Et
```sql
-- step4-verify-changes.sql dosyasını çalıştır
-- Tablo yapısını ve FK'ları kontrol eder
```

### 5. RLS Policy'leri Yeniden Oluştur
```sql
-- fix-messaging-rls-policies.sql dosyasını çalıştır
-- Yeni yapıya uygun policy'leri oluşturur
```

## Beklenen Sonuç

**conversations tablosu:**
- ✅ `creator_id` kolonu var (eski sender_id)
- ❌ `receiver_id` kolonu yok
- ✅ FK: `creator_id` → `profiles(id)`

**messages tablosu:**
- ✅ FK: `sender_id` → `profiles(id)`

**conversation_participants tablosu:**
- ✅ FK: `user_id` → `profiles(id)`

## Test
Bu işlemlerden sonra:
1. Frontend'te http://localhost:5178 adresine git
2. Messages bölümünde yeni konuşma oluştur
3. Mesaj gönder
4. Supabase Table Editor'da verileri kontrol et

## Notlar
- CASCADE seçeneği bağımlı policy'leri otomatik kaldırır
- SQL dosyalarını sırasıyla çalıştırmak önemli
- Her adımdan sonra hata var mı kontrol edin
