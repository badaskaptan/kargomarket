-- Kimyasal ve Petrol Ürünleri Navlun Fiyatları Tabloları
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. Kimyasal Navlun Oranları Tablosu
CREATE TABLE chemical_freight_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_type VARCHAR(50) NOT NULL, -- 'tanker-aframax', 'tanker-suezmax', 'chemical-parcel'
  route_name VARCHAR(100) NOT NULL,
  origin_port VARCHAR(100),
  destination_port VARCHAR(100),
  worldscale_rate DECIMAL(10,2), -- Worldscale tanker oranları için
  freight_rate DECIMAL(10,2), -- USD/MT cinsinden oran
  currency VARCHAR(3) DEFAULT 'USD',
  unit VARCHAR(20) DEFAULT 'USD/MT',
  daily_change DECIMAL(5,2),
  daily_change_percent DECIMAL(5,2),
  vessel_type VARCHAR(50), -- 'Aframax', 'Suezmax', 'VLCC', 'Chemical Tanker'
  cargo_type VARCHAR(100), -- 'Crude Oil', 'Clean Products', 'Chemicals'
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100), -- 'Trading Economics', 'Platts', 'Baltic Exchange'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Kimyasal Ürün Fiyatları Tablosu
CREATE TABLE chemical_product_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  product_code VARCHAR(20), -- 'ETH', 'PROP', 'BENZ' vb.
  category VARCHAR(50) NOT NULL, -- 'Petrokimya', 'Aromatik', 'Alkol', 'Polimer'
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  unit VARCHAR(20) DEFAULT 'USD/MT',
  daily_change DECIMAL(5,2),
  daily_change_percent DECIMAL(5,2),
  trend VARCHAR(10), -- 'up', 'down', 'stable'
  trading_center VARCHAR(50), -- 'Rotterdam', 'Singapore', 'Houston'
  quality_spec TEXT, -- Kalite özellikleri
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100), -- 'ICIS', 'Platts', 'Trading Economics'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tanker Navlun Endeksleri Tablosu
CREATE TABLE tanker_freight_indices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  index_name VARCHAR(100) NOT NULL,
  index_code VARCHAR(20) NOT NULL, -- 'BDTI', 'BCTI', 'WS-TD3' vb.
  index_value DECIMAL(10,2) NOT NULL,
  worldscale_equivalent DECIMAL(10,2), -- Worldscale karşılığı
  daily_change DECIMAL(5,2),
  daily_change_percent DECIMAL(5,2),
  trend VARCHAR(10),
  description TEXT,
  calculation_method TEXT,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Navlun Rota Tanımları Tablosu
CREATE TABLE freight_route_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_code VARCHAR(20) NOT NULL UNIQUE,
  route_name VARCHAR(100) NOT NULL,
  origin_port VARCHAR(100) NOT NULL,
  destination_port VARCHAR(100) NOT NULL,
  distance_nm INTEGER, -- Deniz mili cinsinden mesafe
  transit_time_days INTEGER, -- Ortalama transit süresi
  vessel_types VARCHAR(200)[], -- Uygun gemi tipleri
  cargo_types VARCHAR(200)[], -- Uygun kargo tipleri
  seasonal_factors JSONB, -- Mevsimsel faktörler
  port_restrictions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Örnek veri eklemeleri

-- Kimyasal navlun oranları
INSERT INTO chemical_freight_rates (route_type, route_name, origin_port, destination_port, worldscale_rate, freight_rate, vessel_type, cargo_type, source) VALUES
('tanker-aframax', 'Aframax Tanker - Akdeniz/Karadeniz', 'Ceyhan', 'Augusta', 65.5, NULL, 'Aframax', 'Crude Oil', 'Trading Economics'),
('tanker-suezmax', 'Suezmax Tanker - Karadeniz/Uzakdoğu', 'Novorossiysk', 'Singapore', 50.2, NULL, 'Suezmax', 'Crude Oil', 'Baltic Exchange'),
('chemical-parcel', 'Kimyasal Tanker - Avrupa', 'Rotterdam', 'Hamburg', NULL, 24.50, 'Chemical Tanker', 'Chemicals', 'Platts'),
('chemical-parcel', 'Kimyasal Tanker - Akdeniz', 'İzmir', 'Genova', NULL, 28.75, 'Chemical Tanker', 'Chemicals', 'ICIS'),
('tanker-vlcc', 'VLCC Tanker - Körfez/Uzakdoğu', 'Ras Tanura', 'Ningbo', 45.0, NULL, 'VLCC', 'Crude Oil', 'Trading Economics');

-- Kimyasal ürün fiyatları
INSERT INTO chemical_product_prices (product_name, product_code, category, price, trading_center, source) VALUES
('Etilen', 'ETH', 'Petrokimya', 1245.00, 'Rotterdam', 'ICIS'),
('Propilen', 'PROP', 'Petrokimya', 1108.00, 'Singapore', 'ICIS'),
('Benzol', 'BENZ', 'Aromatik', 925.00, 'Rotterdam', 'Platts'),
('Toluen', 'TOL', 'Aromatik', 815.00, 'Houston', 'ICIS'),
('Metanol', 'METH', 'Alkol', 425.00, 'Rotterdam', 'Platts'),
('Etanol', 'ETHA', 'Alkol', 650.00, 'São Paulo', 'Trading Economics'),
('Polietilen (LDPE)', 'LDPE', 'Polimer', 1650.00, 'Singapore', 'ICIS'),
('Polipropilen', 'PP', 'Polimer', 1520.00, 'Rotterdam', 'ICIS'),
('Asetik Asit', 'AA', 'Kimyasal', 735.00, 'Singapore', 'Platts'),
('Formaldehit', 'FORM', 'Kimyasal', 480.00, 'Houston', 'ICIS');

-- Tanker navlun endeksleri
INSERT INTO tanker_freight_indices (index_name, index_code, index_value, worldscale_equivalent, description, source) VALUES
('Baltic Dirty Tanker Index', 'BDTI', 847, 65.5, 'Ham petrol tanker navlun endeksi', 'Baltic Exchange'),
('Baltic Clean Tanker Index', 'BCTI', 623, 52.3, 'Rafine ürün tanker navlun endeksi', 'Baltic Exchange'),
('TD3 Route (Middle East/Far East)', 'TD3', 45.0, 45.0, 'VLCC ham petrol rotası - Körfez/Uzakdoğu', 'Baltic Exchange'),
('TD1 Route (Middle East/US Gulf)', 'TD1', 38.2, 38.2, 'VLCC ham petrol rotası - Körfez/ABD Körfezi', 'Baltic Exchange');

-- Navlun rota tanımları
INSERT INTO freight_route_definitions (route_code, route_name, origin_port, destination_port, distance_nm, transit_time_days, vessel_types, cargo_types) VALUES
('TR-CEY-AUG', 'Ceyhan - Augusta', 'Ceyhan', 'Augusta', 850, 3, ARRAY['Aframax', 'Suezmax'], ARRAY['Crude Oil', 'Fuel Oil']),
('TR-IZM-GEN', 'İzmir - Genova', 'İzmir', 'Genova', 980, 4, ARRAY['Chemical Tanker', 'Product Tanker'], ARRAY['Chemicals', 'Clean Products']),
('TR-TUP-ROT', 'Tüpraş - Rotterdam', 'İzmit', 'Rotterdam', 1650, 7, ARRAY['Product Tanker'], ARRAY['Clean Products']),
('BSS-SIN', 'Karadeniz - Singapur', 'Novorossiysk', 'Singapore', 8500, 25, ARRAY['Suezmax', 'VLCC'], ARRAY['Crude Oil']);

-- RLS (Row Level Security) politikaları
ALTER TABLE chemical_freight_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanker_freight_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_route_definitions ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir politikası
CREATE POLICY "Anyone can read chemical freight rates" ON chemical_freight_rates FOR SELECT USING (true);
CREATE POLICY "Anyone can read chemical product prices" ON chemical_product_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can read tanker freight indices" ON tanker_freight_indices FOR SELECT USING (true);
CREATE POLICY "Anyone can read freight route definitions" ON freight_route_definitions FOR SELECT USING (true);

-- Güncelleme fonksiyonları
CREATE OR REPLACE FUNCTION update_chemical_freight_data()
RETURNS void AS $$
BEGIN
  -- API'den gelen verileri güncelle
  UPDATE chemical_freight_rates 
  SET updated_at = NOW(), 
      last_update = NOW()
  WHERE is_active = true;
  
  UPDATE chemical_product_prices 
  SET updated_at = NOW(), 
      last_update = NOW()
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Kimyasal navlun verilerini önbelleğe alma tablosu
CREATE TABLE chemical_data_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_type VARCHAR(50) NOT NULL, -- 'freight_rates', 'product_prices', 'indices'
  cache_key VARCHAR(100) NOT NULL,
  data_json JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chemical_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chemical cache" ON chemical_data_cache FOR SELECT USING (true);

-- Cache temizleme fonksiyonu
CREATE OR REPLACE FUNCTION clean_expired_chemical_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM chemical_data_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Otomatik cache temizleme (her gün çalıştır)
-- Bu kısmı Supabase Dashboard > Database > Cron Jobs bölümünde manuel olarak ekleyebilirsiniz
-- SELECT cron.schedule('clean-chemical-cache', '0 2 * * *', 'SELECT clean_expired_chemical_cache();');

COMMENT ON TABLE chemical_freight_rates IS 'Kimyasal ve petrol ürünleri navlun oranları - tanker ve özel navlun fiyatları';
COMMENT ON TABLE chemical_product_prices IS 'Kimyasal ürün spot fiyatları - petrokimya, aromatik, polimer fiyatları';
COMMENT ON TABLE tanker_freight_indices IS 'Tanker navlun endeksleri - BDTI, BCTI ve route-specific endeksler';
COMMENT ON TABLE freight_route_definitions IS 'Navlun rota tanımları - mesafe, süre ve özellikler';
