-- ====================================
-- TRANSPORT SERVICES TABLE - NAKLİYE HİZMETLERİ TABLOSU
-- Tüm taşıma modları için birleşik tablo
-- ====================================

CREATE TABLE IF NOT EXISTS transport_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Kullanıcı bilgisi
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Temel ilan bilgileri
  service_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'completed', 'suspended')) DEFAULT 'active',
  
  -- Taşıma bilgileri
  transport_mode TEXT CHECK (transport_mode IN ('road', 'sea', 'air', 'rail')) NOT NULL,
  vehicle_type TEXT,
  origin TEXT,
  destination TEXT,
  
  -- Tarih bilgileri
  available_from_date DATE,
  available_until_date DATE,
  
  -- Kapasite bilgileri
  capacity_value DECIMAL(10,2),
  capacity_unit TEXT,
  
  -- İletişim bilgileri
  contact_info TEXT,
  company_name TEXT,
  
  -- KARAYOLU ÖZEL ALANLARI
  plate_number TEXT,
  
  -- DENİZYOLU ÖZEL ALANLARI
  ship_name TEXT,
  imo_number TEXT,
  mmsi_number TEXT,
  dwt DECIMAL(10,2),
  gross_tonnage DECIMAL(10,2),
  net_tonnage DECIMAL(10,2),
  ship_dimensions TEXT,
  laycan_start DATE,
  laycan_end DATE,
  freight_type TEXT,
  charterer_info TEXT,
  ship_flag TEXT,
  home_port TEXT,
  year_built INTEGER,
  speed_knots DECIMAL(5,2),
  fuel_consumption TEXT,
  ballast_capacity DECIMAL(10,2),
  
  -- HAVAYOLU ÖZEL ALANLARI
  flight_number TEXT,
  aircraft_type TEXT,
  max_payload DECIMAL(10,2),
  cargo_volume DECIMAL(10,2),
  
  -- DEMİRYOLU ÖZEL ALANLARI
  train_number TEXT,
  wagon_count INTEGER,
  wagon_types TEXT[],
  
  -- Evrak ve belgeler
  required_documents TEXT[],
  document_urls TEXT[],
  
  -- Rating ve görüntülenme
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Metadata
  last_updated_by UUID REFERENCES profiles(id),
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  -- İndeksler için sık kullanılan alanlar
  created_by_user_type TEXT,
  
  -- Timestamps
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_transport_services_user_id ON transport_services(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_services_transport_mode ON transport_services(transport_mode);
CREATE INDEX IF NOT EXISTS idx_transport_services_status ON transport_services(status);
CREATE INDEX IF NOT EXISTS idx_transport_services_available_from ON transport_services(available_from_date);
CREATE INDEX IF NOT EXISTS idx_transport_services_created_at ON transport_services(created_at);
CREATE INDEX IF NOT EXISTS idx_transport_services_rating ON transport_services(rating);
CREATE INDEX IF NOT EXISTS idx_transport_services_featured ON transport_services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_transport_services_vehicle_type ON transport_services(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_transport_services_origin ON transport_services(origin);
CREATE INDEX IF NOT EXISTS idx_transport_services_destination ON transport_services(destination);

-- GIN indeksleri array alanları için
CREATE INDEX IF NOT EXISTS idx_transport_services_required_documents ON transport_services USING GIN(required_documents);
CREATE INDEX IF NOT EXISTS idx_transport_services_wagon_types ON transport_services USING GIN(wagon_types);

-- RLS Politikaları
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

-- Herkes aktif servisleri görebilir
CREATE POLICY "Transport services are viewable by all" ON transport_services
  FOR SELECT USING (status = 'active');

-- Kullanıcılar kendi servislerini yönetebilir
CREATE POLICY "Users can manage own transport services" ON transport_services
  FOR ALL USING (auth.uid() = user_id);

-- Kullanıcılar yeni servis oluşturabilir
CREATE POLICY "Users can create transport services" ON transport_services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_transport_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transport_services_updated_at
  BEFORE UPDATE ON transport_services
  FOR EACH ROW
  EXECUTE FUNCTION update_transport_services_updated_at();

-- Trigger: view_count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_transport_service_views(service_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE transport_services 
  SET view_count = view_count + 1,
      last_activity_at = NOW()
  WHERE id = service_id;
END;
$$ LANGUAGE plpgsql;

-- Yorum: Bu tablo artık tüm transport service ilanlarını tek tabloda tutuyor
-- Her transport mode için özel alanlar var, kullanılmayanlar NULL kalıyor
-- Bu sayede metadata karmaşıklığından kurtuluyoruz
