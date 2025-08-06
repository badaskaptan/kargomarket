-- Bilgi Merkezi için gerekli tabloları oluştur
-- Market Data Cache Tablosu
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Data Cache için indeks
CREATE INDEX IF NOT EXISTS idx_market_data_cache_item_id ON market_data_cache(item_id);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_last_update ON market_data_cache(last_update);

-- News Cache Tablosu
CREATE TABLE IF NOT EXISTS news_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('turkiye', 'dunya', 'teknoloji', 'mevzuat', 'yatirim')),
  tags TEXT[],
  publish_date DATE,
  source TEXT,
  source_url TEXT,
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Cache için indeksler
CREATE INDEX IF NOT EXISTS idx_news_cache_category ON news_cache(category);
CREATE INDEX IF NOT EXISTS idx_news_cache_publish_date ON news_cache(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_cache_featured ON news_cache(featured);

-- Freight Rates Tablosu (Navlun Oranları)
CREATE TABLE IF NOT EXISTS freight_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('road', 'sea', 'air', 'rail')),
  rate TEXT NOT NULL,
  unit TEXT NOT NULL,
  change DECIMAL,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freight Rates için indeksler
CREATE INDEX IF NOT EXISTS idx_freight_rates_mode ON freight_rates(mode);
CREATE INDEX IF NOT EXISTS idx_freight_rates_route ON freight_rates(route);
CREATE INDEX IF NOT EXISTS idx_freight_rates_last_update ON freight_rates(last_update DESC);

-- Logistics Dictionary Tablosu
CREATE TABLE IF NOT EXISTS logistics_dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category TEXT CHECK (category IN ('road', 'sea', 'air', 'rail', 'trade', 'insurance', 'customs', 'general')),
  examples TEXT[],
  synonyms TEXT[],
  related_terms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dictionary için indeksler
CREATE INDEX IF NOT EXISTS idx_logistics_dictionary_term ON logistics_dictionary(term);
CREATE INDEX IF NOT EXISTS idx_logistics_dictionary_category ON logistics_dictionary(category);

-- Legal Guides Tablosu
CREATE TABLE IF NOT EXISTS legal_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('trade_law', 'insurance', 'contracts', 'customs', 'international')),
  content TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  tags TEXT[],
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Guides için indeksler
CREATE INDEX IF NOT EXISTS idx_legal_guides_category ON legal_guides(category);
CREATE INDEX IF NOT EXISTS idx_legal_guides_importance ON legal_guides(importance);

-- Market Statistics Tablosu
CREATE TABLE IF NOT EXISTS market_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type TEXT NOT NULL,
  stat_category TEXT NOT NULL,
  stat_name TEXT NOT NULL,
  stat_value DECIMAL NOT NULL,
  stat_unit TEXT,
  stat_period TEXT,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Statistics için indeksler
CREATE INDEX IF NOT EXISTS idx_market_statistics_type ON market_statistics(stat_type);
CREATE INDEX IF NOT EXISTS idx_market_statistics_category ON market_statistics(stat_category);

-- RLS Policies (Herkese okuma izni)
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_statistics ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "market_data_cache_read" ON market_data_cache FOR SELECT USING (true);
CREATE POLICY "news_cache_read" ON news_cache FOR SELECT USING (true);
CREATE POLICY "freight_rates_read" ON freight_rates FOR SELECT USING (true);
CREATE POLICY "logistics_dictionary_read" ON logistics_dictionary FOR SELECT USING (true);
CREATE POLICY "legal_guides_read" ON legal_guides FOR SELECT USING (true);
CREATE POLICY "market_statistics_read" ON market_statistics FOR SELECT USING (true);

-- Insert example data
INSERT INTO freight_rates (route, origin, destination, mode, rate, unit, change, last_update) VALUES
('İstanbul - Hamburg', 'İstanbul, TR', 'Hamburg, DE', 'road', '€2,450', 'per truck', 5.2, NOW()),
('İzmir - Rotterdam', 'İzmir, TR', 'Rotterdam, NL', 'sea', '$1,850', 'per TEU', -2.1, NOW()),
('İstanbul - Dubai', 'İstanbul, TR', 'Dubai, AE', 'air', '$4.50', 'per kg', 1.8, NOW()),
('Mersin - Trieste', 'Mersin, TR', 'Trieste, IT', 'sea', '$1,920', 'per TEU', 3.4, NOW()),
('Ankara - Munich', 'Ankara, TR', 'Munich, DE', 'road', '€2,680', 'per truck', -1.2, NOW()),
('İzmir - Barcelona', 'İzmir, TR', 'Barcelona, ES', 'sea', '$1,780', 'per TEU', 0.8, NOW())
ON CONFLICT (route) DO NOTHING;

-- Insert sample logistics dictionary terms
INSERT INTO logistics_dictionary (term, definition, category, examples, synonyms, related_terms) VALUES
('FCL', 'Full Container Load - Tam konteyner yük. Bir konteynerin tek bir göndericiye ait yüklerle tamamen doldurulması.', 'sea', ARRAY['20 ft FCL', '40 ft FCL'], ARRAY['Full Container Load'], ARRAY['LCL', 'Container', 'TEU']),
('LCL', 'Less than Container Load - Konteyner altı yük. Birden fazla göndericinin yüklerinin aynı konteynerde taşınması.', 'sea', ARRAY['LCL shipment', 'Groupage'], ARRAY['Less Container Load'], ARRAY['FCL', 'Consolidation']),
('FOB', 'Free on Board - Gemide teslim. Satıcının malları gemiye yüklemesiyle risk ve sorumluluk alıcıya geçer.', 'trade', ARRAY['FOB İstanbul', 'FOB terms'], ARRAY['Free on Board'], ARRAY['CIF', 'CFR', 'Incoterms']),
('CIF', 'Cost, Insurance and Freight - Maliyet, sigorta ve navlun dahil. Satıcı navlun ve sigortayı karşılar.', 'trade', ARRAY['CIF Hamburg', 'CIF terms'], ARRAY['Cost Insurance Freight'], ARRAY['FOB', 'CFR', 'Incoterms']),
('TEU', 'Twenty-foot Equivalent Unit - Yirmi fitlik eşdeğer birim. Konteyner kapasitesi ölçü birimi.', 'sea', ARRAY['1000 TEU', 'TEU capacity'], ARRAY['Twenty-foot Equivalent'], ARRAY['FEU', 'Container'])
ON CONFLICT (term) DO NOTHING;

-- Insert sample legal guides
INSERT INTO legal_guides (title, category, content, importance, tags) VALUES
('Uluslararası Ticaret Hukuku Temelleri', 'trade_law', 'Uluslararası ticaret hukukunun temel prensipleri ve uygulamaları...', 'high', ARRAY['ticaret', 'hukuk', 'uluslararası']),
('Kargo Sigortası ve Kapsamı', 'insurance', 'Kargo sigortası türleri, kapsamı ve hasar durumlarında yapılacaklar...', 'high', ARRAY['sigorta', 'kargo', 'hasar']),
('Taşıma Sözleşmeleri', 'contracts', 'Kara, deniz ve hava taşıma sözleşmelerinin hukuki çerçevesi...', 'medium', ARRAY['sözleşme', 'taşıma', 'hukuk']),
('Gümrük Mevzuatı', 'customs', 'Gümrük işlemleri, vergilendirme ve mevzuat değişiklikleri...', 'high', ARRAY['gümrük', 'mevzuat', 'vergi']),
('Milletlerarası Hukuk', 'international', 'Uluslararası taşımacılıkta geçerli hukuki düzenlemeler...', 'medium', ARRAY['milletlerarası', 'taşımacılık', 'hukuk'])
ON CONFLICT (title) DO NOTHING;

-- Insert sample market statistics
INSERT INTO market_statistics (stat_type, stat_category, stat_name, stat_value, stat_unit, stat_period) VALUES
('transport_mode', 'distribution', 'Karayolu Taşımacılığı', 65.2, 'percent', '2024-Q3'),
('transport_mode', 'distribution', 'Denizyolu Taşımacılığı', 23.8, 'percent', '2024-Q3'),
('transport_mode', 'distribution', 'Havayolu Taşımacılığı', 8.5, 'percent', '2024-Q3'),
('transport_mode', 'distribution', 'Demiryolu Taşımacılığı', 2.5, 'percent', '2024-Q3'),
('regional', 'performance', 'Marmara Bölgesi', 42.3, 'percent', '2024-Q3'),
('regional', 'performance', 'Akdeniz Bölgesi', 18.7, 'percent', '2024-Q3'),
('regional', 'performance', 'Ege Bölgesi', 15.2, 'percent', '2024-Q3'),
('regional', 'performance', 'İç Anadolu', 12.1, 'percent', '2024-Q3'),
('cargo_type', 'volume', 'Genel Kargo', 35.8, 'percent', '2024-Q3'),
('cargo_type', 'volume', 'Konteyner', 28.4, 'percent', '2024-Q3'),
('cargo_type', 'volume', 'Araç Taşıma', 15.6, 'percent', '2024-Q3'),
('cargo_type', 'volume', 'Proje Kargo', 12.3, 'percent', '2024-Q3'),
('cargo_type', 'volume', 'Tehlikeli Madde', 7.9, 'percent', '2024-Q3')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE market_data_cache IS 'Gerçek zamanlı market verilerinin önbelleği';
COMMENT ON TABLE news_cache IS 'Haber makalelerinin önbelleği';
COMMENT ON TABLE freight_rates IS 'Navlun oranları ve fiyat bilgileri';
COMMENT ON TABLE logistics_dictionary IS 'Lojistik terimleri sözlüğü';
COMMENT ON TABLE legal_guides IS 'Hukuki rehberler ve yasal bilgiler';
COMMENT ON TABLE market_statistics IS 'Pazar istatistikleri ve analiz verileri';
