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
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  user_id uuid null,
  service_number text not null,
  title text not null,
  description text null,
  status text null default 'active'::text,
  transport_mode text not null,
  vehicle_type text null,
  origin text null,
  destination text null,
  available_from_date date null,
  available_until_date date null,
  capacity_value numeric null,
  capacity_unit text null default 'kg'::text,
  contact_info text null,
  company_name text null,
  plate_number text null,
  ship_name text null,
  imo_number text null,
  mmsi_number text null,
  dwt numeric null,
  gross_tonnage numeric null,
  net_tonnage numeric null,
  ship_dimensions text null,
  freight_type text null,
  charterer_info text null,
  ship_flag text null,
  home_port text null,
  year_built integer null,
  speed_knots numeric null,
  fuel_consumption text null,
  ballast_capacity numeric null,
  flight_number text null,
  aircraft_type text null,
  max_payload numeric null,
  cargo_volume numeric null,
  train_number text null,
  wagon_count integer null,
  wagon_types text[] null,
  required_documents text[] null,
  document_urls text[] null,
  rating numeric null default 0,
  rating_count integer null default 0,
  view_count integer null default 0,
  last_updated_by uuid null,
  is_featured boolean null default false,
  featured_until timestamp with time zone null,
  created_by_user_type text null,
  last_activity_at timestamp with time zone null default now(),
  constraint transport_services_pkey primary key (id),
  constraint transport_services_service_number_key unique (service_number),
  constraint transport_services_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint transport_services_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'inactive'::text,
          'completed'::text,
          'suspended'::text
        ]
      )
    )
  ),
  constraint transport_services_transport_mode_check check (
    (
      transport_mode = any (
        array[
          'road'::text,
          'sea'::text,
          'air'::text,
          'rail'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_transport_services_user_id on public.transport_services using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_transport_services_mode on public.transport_services using btree (transport_mode) TABLESPACE pg_default;
create index IF not exists idx_transport_services_status on public.transport_services using btree (status) TABLESPACE pg_default;
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
