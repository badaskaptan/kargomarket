-- ===============================================
-- TRANSPORT SERVICES TABLE CREATION SCRIPT
-- KargoMarket Nakliye İlanları için ana tablo
-- ===============================================

-- Transport services tablosunu oluştur
CREATE TABLE IF NOT EXISTS transport_services (
    -- Temel kimlik alanları
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- İlan temel bilgileri
    service_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'completed', 'suspended')) DEFAULT 'active',
    
    -- Taşımacılık bilgileri
    transport_mode TEXT CHECK (transport_mode IN ('road', 'sea', 'air', 'rail')) NOT NULL,
    vehicle_type TEXT,
    origin TEXT,
    destination TEXT,
    
    -- Tarih bilgileri
    available_from_date DATE,
    available_until_date DATE,
    
    -- Kapasite bilgileri
    capacity_value NUMERIC,
    capacity_unit TEXT DEFAULT 'kg',
    
    -- İletişim bilgileri
    contact_info TEXT,
    company_name TEXT,
    
    -- ===============================================
    -- KARAYOLU ÖZEL ALANLARI
    -- ===============================================
    plate_number TEXT,
    
    -- ===============================================
    -- DENİZYOLU ÖZEL ALANLARI
    -- ===============================================
    ship_name TEXT,
    imo_number TEXT,
    mmsi_number TEXT,
    dwt NUMERIC,
    gross_tonnage NUMERIC,
    net_tonnage NUMERIC,
    ship_dimensions TEXT,
    freight_type TEXT,
    charterer_info TEXT,
    ship_flag TEXT,
    home_port TEXT,
    year_built INTEGER,
    speed_knots NUMERIC,
    fuel_consumption TEXT,
    ballast_capacity NUMERIC,
    
    -- ===============================================
    -- HAVAYOLU ÖZEL ALANLARI
    -- ===============================================
    flight_number TEXT,
    aircraft_type TEXT,
    max_payload NUMERIC,
    cargo_volume NUMERIC,
    
    -- ===============================================
    -- DEMİRYOLU ÖZEL ALANLARI
    -- ===============================================
    train_number TEXT,
    wagon_count INTEGER,
    wagon_types TEXT[],
    
    -- ===============================================
    -- EVRAK VE BELGELER
    -- ===============================================
    required_documents TEXT[],
    document_urls TEXT[],
    
    -- ===============================================
    -- RATING VE İSTATİSTİKLER
    -- ===============================================
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- ===============================================
    -- METADATA
    -- ===============================================
    last_updated_by UUID REFERENCES auth.users(id),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    created_by_user_type TEXT,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXLER VE PERFORMANS OPTİMİZASYONU
-- ===============================================

-- Temel sorgular için indexler
CREATE INDEX IF NOT EXISTS idx_transport_services_user_id ON transport_services(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_services_transport_mode ON transport_services(transport_mode);
CREATE INDEX IF NOT EXISTS idx_transport_services_status ON transport_services(status);
CREATE INDEX IF NOT EXISTS idx_transport_services_created_at ON transport_services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transport_services_available_from ON transport_services(available_from_date);

-- Arama için composite indexler
CREATE INDEX IF NOT EXISTS idx_transport_services_search ON transport_services(transport_mode, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transport_services_location ON transport_services(origin, destination);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_transport_services_service_number ON transport_services(service_number);

-- ===============================================
-- RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ===============================================

-- RLS'yi etkinleştir
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

-- Herkes aktif ilanları görüntüleyebilir
CREATE POLICY "Public transport services are viewable by everyone"
ON transport_services FOR SELECT
USING (status = 'active');

-- Kullanıcılar kendi ilanlarını görebilir
CREATE POLICY "Users can view own transport services"
ON transport_services FOR SELECT
USING (auth.uid() = user_id);

-- Kullanıcılar ilan oluşturabilir
CREATE POLICY "Users can insert their own transport services"
ON transport_services FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi ilanlarını güncelleyebilir
CREATE POLICY "Users can update own transport services"
ON transport_services FOR UPDATE
USING (auth.uid() = user_id);

-- Kullanıcılar kendi ilanlarını silebilir
CREATE POLICY "Users can delete own transport services"
ON transport_services FOR DELETE
USING (auth.uid() = user_id);

-- ===============================================
-- TRİGGER FUNCTIONS
-- ===============================================

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
CREATE TRIGGER handle_transport_services_updated_at
    BEFORE UPDATE ON transport_services
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ===============================================
-- ÖRNEK VERİ (TEST İÇİN)
-- ===============================================

-- Test verisi ekle (isteğe bağlı)
-- INSERT INTO transport_services (
--     user_id,
--     service_number,
--     title,
--     description,
--     transport_mode,
--     vehicle_type,
--     origin,
--     destination,
--     available_from_date,
--     capacity_value,
--     contact_info,
--     company_name,
--     ship_name,
--     imo_number,
--     mmsi_number
-- ) VALUES (
--     auth.uid(),
--     'TS-2025-001',
--     'İstanbul-İzmir Konteyner Taşımacılığı',
--     'Düzenli konteyner seferleri',
--     'sea',
--     'container_40dc',
--     'İstanbul Limanı',
--     'İzmir Limanı',
--     '2025-07-20',
--     25000,
--     'info@example.com',
--     'Example Shipping',
--     'MV EXAMPLE',
--     'IMO 1234567',
--     '271234567'
-- );

-- ===============================================
-- YETKI VE İZİNLER
-- ===============================================

-- Authenticated kullanıcılar için izinler
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_services TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Public kullanıcılar sadece aktif ilanları görebilir
GRANT SELECT ON transport_services TO anon;

COMMENT ON TABLE transport_services IS 'Nakliye hizmeti ilanları - Karayolu, Denizyolu, Havayolu ve Demiryolu taşımacılığı için unified tablo';
