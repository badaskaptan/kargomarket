-- KİMYASAL NAVlUN VERİLERİ - SUPABASE SQL EDITOR'DE ÇALIŞTIRIN

-- Kimyasal navlun oranları güncel test verisi
INSERT INTO chemical_freight_rates (route_type, route_name, origin_port, destination_port, worldscale_rate, freight_rate, vessel_type, cargo_type, source, daily_change, daily_change_percent) VALUES
('tanker-aframax', 'Akdeniz - Karadeniz Aframax', 'Ceyhan', 'Constanta', 67.8, NULL, 'Aframax', 'Crude Oil', 'Trading Economics', 2.3, 3.5),
('tanker-suezmax', 'Karadeniz - Uzakdoğu Suezmax', 'Novorossiysk', 'Ningbo', 52.1, NULL, 'Suezmax', 'Crude Oil', 'Baltic Exchange', -1.8, -3.3),
('tanker-vlcc', 'Körfez - Uzakdoğu VLCC', 'Ras Tanura', 'Singapore', 47.5, NULL, 'VLCC', 'Crude Oil', 'Trading Economics', 0.8, 1.7),
('chemical-parcel', 'Avrupa Kimyasal Parcel', 'Rotterdam', 'Antwerp', NULL, 26.75, 'Chemical Tanker', 'Chemicals', 'Platts', 1.2, 4.7),
('chemical-parcel', 'Akdeniz Kimyasal', 'İzmir', 'Genova', NULL, 32.80, 'Chemical Tanker', 'Chemicals', 'ICIS', 0.5, 1.5),
('chemical-parcel', 'Uzakdoğu Kimyasal', 'Singapore', 'Osaka', NULL, 28.90, 'Chemical Tanker', 'Chemicals', 'Platts', -0.3, -1.0);

-- Kimyasal ürün güncel fiyatları
INSERT INTO chemical_product_prices (product_name, product_code, category, price, trading_center, source, daily_change, daily_change_percent, trend) VALUES
('Etilen', 'ETH', 'Petrokimya', 1267.50, 'Rotterdam', 'ICIS', 1.8, 1.4, 'up'),
('Propilen', 'PROP', 'Petrokimya', 1095.30, 'Singapore', 'ICIS', -1.2, -1.1, 'down'),
('Benzol', 'BENZ', 'Aromatik', 943.20, 'Rotterdam', 'Platts', 2.5, 2.7, 'up'),
('Toluen', 'TOL', 'Aromatik', 827.80, 'Houston', 'ICIS', 1.1, 1.4, 'up'),
('Metanol', 'METH', 'Alkol', 442.10, 'Rotterdam', 'Platts', -0.8, -1.8, 'down'),
('Etanol', 'ETHA', 'Alkol', 668.90, 'São Paulo', 'Trading Economics', 0.3, 0.4, 'stable'),
('Polietilen (LDPE)', 'LDPE', 'Polimer', 1683.00, 'Singapore', 'ICIS', 1.5, 0.9, 'up'),
('Polipropilen', 'PP', 'Polimer', 1545.60, 'Rotterdam', 'ICIS', 0.7, 0.5, 'up'),
('Asetik Asit', 'AA', 'Kimyasal', 748.30, 'Singapore', 'Platts', -1.1, -1.4, 'down'),
('Formaldehit', 'FORM', 'Kimyasal', 495.80, 'Houston', 'ICIS', 0.9, 1.8, 'up'),
('PVC', 'PVC', 'Polimer', 1234.50, 'Rotterdam', 'ICIS', -0.5, -0.4, 'down'),
('Stiren', 'STY', 'Aromatik', 1156.70, 'Singapore', 'Platts', 1.8, 1.6, 'up');

-- Tanker navlun endeksleri
INSERT INTO tanker_freight_indices (index_name, index_code, index_value, worldscale_equivalent, description, source, daily_change, daily_change_percent, trend) VALUES
('Baltic Dirty Tanker Index', 'BDTI', 863, 67.8, 'Ham petrol tanker navlun endeksi - güncel değer', 'Baltic Exchange', 15, 1.8, 'up'),
('Baltic Clean Tanker Index', 'BCTI', 634, 53.2, 'Rafine ürün tanker navlun endeksi - güncel değer', 'Baltic Exchange', -11, -1.7, 'down'),
('TD3 Route (Middle East/Far East)', 'TD3', 47.5, 47.5, 'VLCC ham petrol rotası - Körfez/Uzakdoğu', 'Baltic Exchange', 1.2, 2.6, 'up'),
('TD1 Route (Middle East/US Gulf)', 'TD1', 39.8, 39.8, 'VLCC ham petrol rotası - Körfez/ABD Körfezi', 'Baltic Exchange', -0.8, -2.0, 'down'),
('TC2 Route (Middle East/Japan)', 'TC2', 52.1, 52.1, 'Suezmax ham petrol rotası - Körfez/Japonya', 'Baltic Exchange', 0.5, 1.0, 'up');

-- Navlun rota tanımları güncel veriler
INSERT INTO freight_route_definitions (route_code, route_name, origin_port, destination_port, distance_nm, transit_time_days, vessel_types, cargo_types, seasonal_factors) VALUES
('CEY-CON', 'Ceyhan - Constanta', 'Ceyhan', 'Constanta', 750, 3, ARRAY['Aframax'], ARRAY['Crude Oil'], '{"winter_factor": 1.1, "summer_factor": 0.95}'),
('NOV-NIN', 'Novorossiysk - Ningbo', 'Novorossiysk', 'Ningbo', 8200, 24, ARRAY['Suezmax', 'VLCC'], ARRAY['Crude Oil'], '{"monsoon_factor": 1.15}'),
('ROT-ANT', 'Rotterdam - Antwerp', 'Rotterdam', 'Antwerp', 180, 1, ARRAY['Chemical Tanker'], ARRAY['Chemicals', 'Clean Products'], '{"canal_factor": 1.05}'),
('IZM-GEN', 'İzmir - Genova', 'İzmir', 'Genova', 980, 4, ARRAY['Chemical Tanker', 'Product Tanker'], ARRAY['Chemicals', 'Clean Products'], '{"mediterranean_factor": 1.02}'),
('SIN-OSA', 'Singapore - Osaka', 'Singapore', 'Osaka', 2850, 8, ARRAY['Chemical Tanker'], ARRAY['Chemicals'], '{"typhoon_factor": 1.2}'),
('RAT-SIN', 'Ras Tanura - Singapore', 'Ras Tanura', 'Singapore', 3400, 12, ARRAY['VLCC', 'Suezmax'], ARRAY['Crude Oil'], '{"strait_factor": 1.08}');

-- Cache tablosuna örnek kimyasal veri
INSERT INTO chemical_data_cache (data_type, cache_key, data_json, expires_at) VALUES
('freight_rates', 'chemical_tanker_rates_2025_08_06', '{
  "aframax": {"rate": 67.8, "change": 2.3},
  "suezmax": {"rate": 52.1, "change": -1.8},
  "chemical_parcel": {"rate": 26.75, "change": 1.2}
}', NOW() + INTERVAL '6 hours'),
('product_prices', 'chemical_prices_2025_08_06', '{
  "ethylene": {"price": 1267.50, "change": 1.4},
  "propylene": {"price": 1095.30, "change": -1.1},
  "benzene": {"price": 943.20, "change": 2.7}
}', NOW() + INTERVAL '6 hours');

-- Görünüm (View) oluştur - hızlı veri erişimi için
CREATE OR REPLACE VIEW chemical_freight_summary AS
SELECT 
  cfr.route_name,
  cfr.vessel_type,
  cfr.cargo_type,
  COALESCE(cfr.worldscale_rate::text, cfr.freight_rate::text || ' USD/MT') as rate_display,
  cfr.daily_change,
  cfr.daily_change_percent,
  CASE 
    WHEN cfr.daily_change > 0 THEN 'up'
    WHEN cfr.daily_change < 0 THEN 'down'
    ELSE 'stable'
  END as trend,
  cfr.source,
  cfr.last_update
FROM chemical_freight_rates cfr
WHERE cfr.is_active = true
ORDER BY cfr.last_update DESC;

CREATE OR REPLACE VIEW chemical_product_summary AS
SELECT 
  cpp.product_name,
  cpp.product_code,
  cpp.category,
  cpp.price,
  cpp.currency || '/' || cpp.unit as price_display,
  cpp.daily_change,
  cpp.daily_change_percent,
  cpp.trend,
  cpp.trading_center,
  cpp.source,
  cpp.last_update
FROM chemical_product_prices cpp
WHERE cpp.is_active = true
ORDER BY cpp.category, cpp.product_name;

-- Yetkilendirme: view'lar için RLS
ALTER VIEW chemical_freight_summary OWNER TO postgres;
ALTER VIEW chemical_product_summary OWNER TO postgres;

-- İstatistik fonksiyonu
CREATE OR REPLACE FUNCTION get_chemical_market_stats()
RETURNS TABLE(
  total_products INTEGER,
  avg_daily_change DECIMAL,
  top_gainer TEXT,
  top_loser TEXT,
  last_update TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_products,
    AVG(daily_change_percent) as avg_daily_change,
    (SELECT product_name FROM chemical_product_prices WHERE daily_change_percent = (SELECT MAX(daily_change_percent) FROM chemical_product_prices WHERE is_active = true) AND is_active = true LIMIT 1) as top_gainer,
    (SELECT product_name FROM chemical_product_prices WHERE daily_change_percent = (SELECT MIN(daily_change_percent) FROM chemical_product_prices WHERE is_active = true) AND is_active = true LIMIT 1) as top_loser,
    MAX(last_update) as last_update
  FROM chemical_product_prices 
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Test sorguları (opsiyonel - çalıştırarak test edebilirsiniz)
/*
-- Tüm kimyasal navlun oranları
SELECT * FROM chemical_freight_summary;

-- Tüm kimyasal ürün fiyatları
SELECT * FROM chemical_product_summary;

-- Market istatistikleri
SELECT * FROM get_chemical_market_stats();

-- Tanker endeksleri
SELECT index_name, index_value, daily_change_percent, trend 
FROM tanker_freight_indices 
WHERE is_active = true 
ORDER BY index_value DESC;
*/

COMMENT ON VIEW chemical_freight_summary IS 'Kimyasal navlun oranlarının özet görünümü';
COMMENT ON VIEW chemical_product_summary IS 'Kimyasal ürün fiyatlarının özet görünümü';
COMMENT ON FUNCTION get_chemical_market_stats() IS 'Kimyasal piyasa istatistikleri';
