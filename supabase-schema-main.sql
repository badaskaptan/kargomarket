-- ===============================================
-- KargoMarket Supabase Ana Şema ve Kurulum Dosyası
-- Tüm ana tablolar, indexler, policy ve test verileri tek dosyada
-- ===============================================

-- 1. TRANSPORT_SERVICES TABLOSU
-- Güncel transport_services tablo şeması
CREATE TABLE public.transport_services (
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

-- Transport Services İndexleri
create index IF not exists idx_transport_services_user_id on public.transport_services using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_transport_services_mode on public.transport_services using btree (transport_mode) TABLESPACE pg_default;
create index IF not exists idx_transport_services_status on public.transport_services using btree (status) TABLESPACE pg_default;

-- 2. LISTINGS TABLOSU
-- Güncel listings tablo şeması
CREATE TABLE public.listings (
  id uuid not null default extensions.uuid_generate_v4 (),
  listing_number text not null,
  user_id uuid null,
  listing_type text not null,
  role_type text null,
  title text not null,
  description text null,
  category text null,
  subcategory text null,
  origin text not null,
  destination text not null,
  origin_coordinates geography null,
  destination_coordinates geography null,
  origin_details jsonb null default '{}'::jsonb,
  destination_details jsonb null default '{}'::jsonb,
  route_waypoints jsonb null default '[]'::jsonb,
  load_type text null,
  load_category text null,
  weight_value numeric(10, 3) null,
  weight_unit text null default 'ton'::text,
  volume_value numeric(10, 3) null,
  volume_unit text null default 'm3'::text,
  dimensions jsonb null,
  quantity integer null,
  packaging_type text null,
  special_handling_requirements text[] null,
  loading_date date null,
  loading_time time without time zone null,
  delivery_date date null,
  delivery_time time without time zone null,
  available_from_date date null,
  available_until_date date null,
  flexible_dates boolean null default false,
  transport_mode text null,
  vehicle_types text[] null,
  transport_responsible text null,
  special_requirements text null,
  temperature_controlled boolean null default false,
  temperature_range jsonb null,
  humidity_controlled boolean null default false,
  hazardous_materials boolean null default false,
  fragile_cargo boolean null default false,
  offer_type text null,
  price_amount numeric(12, 2) null,
  price_currency text null default 'TRY'::text,
  price_per text null,
  budget_min numeric(12, 2) null,
  budget_max numeric(12, 2) null,
  required_documents text[] null,
  insurance_required boolean null default false,
  insurance_value numeric(12, 2) null,
  customs_clearance_required boolean null default false,
  status text null default 'active'::text,
  is_urgent boolean null default false,
  priority_level integer null default 0,
  visibility text null default 'public'::text,
  view_count integer null default 0,
  offer_count integer null default 0,
  favorite_count integer null default 0,
  search_tags text[] null,
  seo_keywords text[] null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  published_at timestamp with time zone null,
  expires_at timestamp with time zone null,
  document_urls text[] null,
  image_urls text[] null,
  related_load_listing_id uuid null,
  cargo_details jsonb null default '{}'::jsonb,
  transport_details jsonb null default '{}'::jsonb,
  additional_requirements jsonb null default '{}'::jsonb,
  capacity text null,
  contact_info jsonb null default '{}'::jsonb,
  service_number text null,
  metadata jsonb null default '{}'::jsonb,
  constraint listings_pkey primary key (id),
  constraint listings_listing_number_key unique (listing_number),
  constraint listings_related_load_listing_id_fkey foreign KEY (related_load_listing_id) references listings (id) on delete set null,
  constraint listings_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint listings_role_type_check check (
    (
      role_type = any (array['buyer'::text, 'seller'::text])
    )
  ),
  constraint listings_status_check check (
    (
      status = any (
        array[
          'draft'::text,
          'active'::text,
          'paused'::text,
          'completed'::text,
          'cancelled'::text,
          'expired'::text
        ]
      )
    )
  ),
  constraint listings_transport_mode_check check (
    (
      transport_mode = any (
        array[
          'road'::text,
          'sea'::text,
          'air'::text,
          'rail'::text,
          'multimodal'::text
        ]
      )
    )
  ),
  constraint listings_transport_responsible_check check (
    (
      transport_responsible = any (
        array[
          'buyer'::text,
          'seller'::text,
          'carrier'::text,
          'negotiable'::text
        ]
      )
    )
  ),
  constraint listings_visibility_check check (
    (
      visibility = any (
        array['public'::text, 'private'::text, 'premium'::text]
      )
    )
  ),
  constraint listings_listing_type_check check (
    (
      listing_type = any (
        array[
          'load_listing'::text,
          'shipment_request'::text,
          'transport_service'::text
        ]
      )
    )
  ),
  constraint listings_offer_type_check check (
    (
      offer_type = any (
        array[
          'fixed_price'::text,
          'negotiable'::text,
          'auction'::text,
          'free_quote'::text
        ]
      )
    )
  ),
  constraint listings_price_per_check check (
    (
      price_per = any (
        array[
          'total'::text,
          'ton'::text,
          'km'::text,
          'day'::text,
          'hour'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Listings İndexleri
create index IF not exists idx_listings_related_load_listing_id on public.listings using btree (related_load_listing_id) TABLESPACE pg_default;
create index IF not exists idx_listings_user_id on public.listings using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_listings_type_status on public.listings using btree (listing_type, status) TABLESPACE pg_default;
create index IF not exists idx_listings_location on public.listings using btree (origin, destination) TABLESPACE pg_default;
create index IF not exists idx_listings_transport_mode on public.listings using btree (transport_mode) TABLESPACE pg_default;
create index IF not exists idx_listings_created_at on public.listings using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_listings_geography on public.listings using gist (origin_coordinates, destination_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_origin_geo on public.listings using gist (origin_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_destination_geo on public.listings using gist (destination_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_search on public.listings using gin (
  to_tsvector(
    'turkish'::regconfig,
    (
      (title || ' '::text) || COALESCE(description, ''::text)
    )
  )
) TABLESPACE pg_default;
create index IF not exists idx_listings_type_status_created on public.listings using btree (listing_type, status, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_listings_vehicle_types on public.listings using gin (vehicle_types) TABLESPACE pg_default;
create index IF not exists idx_listings_capacity on public.listings using btree (capacity) TABLESPACE pg_default;
create index IF not exists idx_listings_service_number on public.listings using btree (service_number) TABLESPACE pg_default;
create index IF not exists idx_listings_metadata on public.listings using gin (metadata) TABLESPACE pg_default;
create index IF not exists idx_listings_contact_info on public.listings using gin (contact_info) TABLESPACE pg_default;

-- 3. REVIEWS TABLOSU
-- Değerlendirme sistemi için kritik tablo
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('buyer_to_carrier', 'carrier_to_buyer', 'general')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'hidden', 'reported')) DEFAULT 'active',
  
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- 4. STORAGE BUCKETLARI
-- Storage bucket'larını oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Avatar resimleri için
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    '{"image/jpeg","image/png","image/gif","image/webp"}'
  ),
  -- İlan resimleri için
  (
    'listing_images',
    'Listing Images',
    true,
    null,
    null
  ),
  -- Belgeler için
  (
    'documents',
    'documents', 
    true,
    20971520, -- 20MB
    '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. TRİGGERLAR
-- Listings için trigger'lar
create trigger trigger_auto_listing_number BEFORE INSERT on listings for EACH row
execute FUNCTION auto_generate_listing_number ();

create trigger update_listings_updated_at BEFORE
update on listings for EACH row
execute FUNCTION update_updated_at_column ();

-- Transport Services için trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_transport_services_updated_at
    BEFORE UPDATE ON transport_services
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 6. RLS POLİTİKALARI
-- Transport Services RLS
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public transport services are viewable by everyone"
ON transport_services FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can view own transport services"
ON transport_services FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transport services"
ON transport_services FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transport services"
ON transport_services FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transport services"
ON transport_services FOR DELETE
USING (auth.uid() = user_id);

-- 7. YETKİLER
-- Authenticated kullanıcılar için izinler
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Public kullanıcılar sadece aktif ilanları görebilir
GRANT SELECT ON transport_services TO anon;
GRANT SELECT ON listings TO anon;

-- 8. TEST VERİLERİ
-- Transport Services test verisi
INSERT INTO transport_services
    (
    service_number,
    title,
    description,
    transport_mode,
    vehicle_type,
    origin,
    destination,
    available_from_date,
    available_until_date,
    capacity_value,
    capacity_unit,
    company_name,
    contact_info,
    status,
    user_id
    )
VALUES
    (
        'TS202507220001',
        'İstanbul-Ankara Karayolu Nakliye Hizmeti',
        'Güvenilir ve hızlı karayolu taşımacılığı. 7/24 hizmet.',
        'road',
        'Kamyon',
        'İstanbul',
        'Ankara',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        25000,
        'kg',
        'Test Nakliye A.Ş.',
        'Telefon: +90 212 555 0123',
        'active',
        '1cc5549f-2826-43f9-b378-a3861b5af9e7'  -- Test user ID
    ),
    (
        'TS202507220002', 
        'Denizli-Bursa Tekstil Taşımacılığı',
        'Tekstil ürünleri için özel paketleme ve nakliye.',
        'road',
        'Kapalı Kasa',
        'Denizli',
        'Bursa',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days',
        15000,
        'kg',
        'Tekstil Lojistik Ltd.',
        'info@tekstillojistik.com',
        'active',
        '1cc5549f-2826-43f9-b378-a3861b5af9e7'  -- Test user ID
    )
ON CONFLICT (service_number) DO NOTHING;

-- KONTROL SORGUSU
-- Eklenen verileri kontrol et
SELECT
    id,
    service_number,
    title,
    transport_mode,
    origin,
    destination,
    status,
    user_id,
    created_at
FROM transport_services
WHERE user_id = '1cc5549f-2826-43f9-b378-a3861b5af9e7'
ORDER BY created_at DESC;
