-- ===============================================
-- TRANSPORT SERVICES TABLE - GÜVENLİK VE PERFORMANS AYARLARI
-- RLS Politikaları, Indexler ve Triggerlar
-- ===============================================

-- ===============================================
-- RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ===============================================

-- RLS'yi etkinleştir
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

-- 1. Herkes aktif ilanları görüntüleyebilir (public read)
CREATE POLICY "Public can view active transport services"
ON transport_services FOR SELECT
USING (status = 'active');

-- 2. Kullanıcılar kendi ilanlarını görebilir (owner read)
CREATE POLICY "Users can view own transport services"
ON transport_services FOR SELECT
USING (auth.uid() = user_id);

-- 3. Kullanıcılar ilan oluşturabilir (insert)
CREATE POLICY "Users can insert their own transport services"
ON transport_services FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Kullanıcılar kendi ilanlarını güncelleyebilir (update)
CREATE POLICY "Users can update own transport services"
ON transport_services FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Kullanıcılar kendi ilanlarını silebilir (delete)
CREATE POLICY "Users can delete own transport services"
ON transport_services FOR DELETE
USING (auth.uid() = user_id);

-- ===============================================
-- PERFORMANS İNDEXLERİ (Eksik olanlar)
-- ===============================================

-- Tarih bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_transport_services_available_from 
ON transport_services(available_from_date);

CREATE INDEX IF NOT EXISTS idx_transport_services_available_until 
ON transport_services(available_until_date);

-- Composite index - aktif ilanları hızlı getirme
CREATE INDEX IF NOT EXISTS idx_transport_services_active_listing 
ON transport_services(status, transport_mode, created_at DESC)
WHERE status = 'active';

-- Arama için location index
CREATE INDEX IF NOT EXISTS idx_transport_services_origin_destination 
ON transport_services(origin, destination);

-- Rating ve featured için
CREATE INDEX IF NOT EXISTS idx_transport_services_featured 
ON transport_services(is_featured, featured_until)
WHERE is_featured = true;

-- Service number için (unique constraint zaten var ama arama için)
CREATE INDEX IF NOT EXISTS idx_transport_services_service_number_search 
ON transport_services(service_number);

-- ===============================================
-- TRİGGER FUNCTIONS
-- ===============================================

-- Updated_at ve last_activity_at otomatik güncelleme
CREATE OR REPLACE FUNCTION handle_transport_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS handle_transport_services_updated_at ON transport_services;
CREATE TRIGGER handle_transport_services_updated_at
    BEFORE UPDATE ON transport_services
    FOR EACH ROW
    EXECUTE FUNCTION handle_transport_services_updated_at();

-- ===============================================
-- YETKI VE İZİNLER
-- ===============================================

-- Authenticated kullanıcılar için full access
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_services TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Anonymous kullanıcılar sadece aktif ilanları görebilir
GRANT SELECT ON transport_services TO anon;

-- ===============================================
-- VALIDATION FUNCTIONS (İSTEĞE BAĞLI)
-- ===============================================

-- IMO numarası validasyonu (Lühn algoritması)
CREATE OR REPLACE FUNCTION validate_imo(imo_num TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    clean_imo TEXT;
    digit_sum INTEGER := 0;
    i INTEGER;
    check_digit INTEGER;
    calculated_check INTEGER;
BEGIN
    -- IMO formatını temizle (IMO prefix'i kaldır)
    clean_imo := UPPER(TRIM(imo_num));
    clean_imo := REPLACE(clean_imo, 'IMO', '');
    clean_imo := TRIM(clean_imo);
    
    -- 7 hane kontrolü
    IF LENGTH(clean_imo) != 7 THEN
        RETURN FALSE;
    END IF;
    
    -- Sayısal olma kontrolü
    IF clean_imo !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Lühn algoritması ile check digit kontrolü
    FOR i IN 1..6 LOOP
        digit_sum := digit_sum + (CAST(SUBSTR(clean_imo, i, 1) AS INTEGER) * (8 - i));
    END LOOP;
    
    calculated_check := digit_sum % 10;
    check_digit := CAST(SUBSTR(clean_imo, 7, 1) AS INTEGER);
    
    RETURN calculated_check = check_digit;
END;
$$ LANGUAGE plpgsql;

-- MMSI numarası validasyonu (9 hane)
CREATE OR REPLACE FUNCTION validate_mmsi(mmsi_num TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    clean_mmsi TEXT;
BEGIN
    clean_mmsi := TRIM(mmsi_num);
    
    -- 9 hane kontrolü
    IF LENGTH(clean_mmsi) != 9 THEN
        RETURN FALSE;
    END IF;
    
    -- Sayısal olma kontrolü
    IF clean_mmsi !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- İlk hane 0 olamaz
    IF SUBSTR(clean_mmsi, 1, 1) = '0' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TABLO COMMENTS
-- ===============================================

COMMENT ON TABLE transport_services IS 'KargoMarket nakliye hizmeti ilanları - Karayolu, Denizyolu, Havayolu ve Demiryolu taşımacılığı için unified tablo';

COMMENT ON COLUMN transport_services.service_number IS 'Otomatik oluşturulan benzersiz servis numarası (TS-YYYY-XXX formatında)';
COMMENT ON COLUMN transport_services.transport_mode IS 'Taşıma modu: road, sea, air, rail';
COMMENT ON COLUMN transport_services.status IS 'İlan durumu: active, inactive, completed, suspended';
COMMENT ON COLUMN transport_services.imo_number IS 'IMO numarası (Lühn algoritması ile validate edilir)';
COMMENT ON COLUMN transport_services.mmsi_number IS 'MMSI numarası (9 haneli, ilk hane 0 olamaz)';

-- ===============================================
-- ÖRNEK SORGULAR VE KULLANIM
-- ===============================================

/*
-- Aktif deniz taşımacılığı ilanları
SELECT * FROM transport_services 
WHERE transport_mode = 'sea' 
  AND status = 'active' 
  AND available_from_date >= CURRENT_DATE
ORDER BY created_at DESC;

-- Belirli route için arama
SELECT * FROM transport_services 
WHERE transport_mode = 'road'
  AND status = 'active'
  AND origin ILIKE '%istanbul%'
  AND destination ILIKE '%ankara%';

-- Featured ilanlar
SELECT * FROM transport_services 
WHERE is_featured = true 
  AND featured_until > NOW()
  AND status = 'active'
ORDER BY featured_until DESC;

-- IMO validasyonu
SELECT validate_imo('IMO 1234567'); -- true/false döner

-- MMSI validasyonu  
SELECT validate_mmsi('271234567'); -- true/false döner
*/
