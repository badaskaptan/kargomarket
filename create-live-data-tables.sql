-- Market Data ve News için Supabase tabloları

-- Market data cache tablosu
CREATE TABLE IF NOT EXISTS market_data_cache (
    id SERIAL PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freight rates tablosu
CREATE TABLE IF NOT EXISTS freight_rates (
    id SERIAL PRIMARY KEY,
    route TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('road', 'sea', 'air')),
    rate TEXT NOT NULL,
    unit TEXT NOT NULL,
    change DECIMAL(5,2) DEFAULT 0,
    last_update DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News cache tablosu
CREATE TABLE IF NOT EXISTS news_cache (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regulation news tablosu (editör tarafından yönetilen)
CREATE TABLE IF NOT EXISTS regulation_news (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    publish_date DATE DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'Mevzuat Takip',
    source_url TEXT,
    view_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulation_news ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON market_data_cache FOR SELECT USING (true);
CREATE POLICY "Public read access" ON freight_rates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news_cache FOR SELECT USING (true);
CREATE POLICY "Public read access" ON regulation_news FOR SELECT USING (true);

-- View count increment function
CREATE OR REPLACE FUNCTION increment_news_view_count(article_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE regulation_news 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for regulation_news
CREATE TRIGGER update_regulation_news_updated_at
    BEFORE UPDATE ON regulation_news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample freight rates
INSERT INTO freight_rates (route, origin, destination, mode, rate, unit, change, last_update) VALUES
('İstanbul - Hamburg', 'İstanbul, TR', 'Hamburg, DE', 'road', '€2,450', 'per truck', 5.2, CURRENT_DATE),
('İzmir - Rotterdam', 'İzmir, TR', 'Rotterdam, NL', 'sea', '$1,850', 'per TEU', -2.1, CURRENT_DATE),
('İstanbul - Dubai', 'İstanbul, TR', 'Dubai, AE', 'air', '$4.50', 'per kg', 1.8, CURRENT_DATE),
('Ankara - Berlin', 'Ankara, TR', 'Berlin, DE', 'road', '€2,200', 'per truck', 3.5, CURRENT_DATE),
('Mersin - Napoli', 'Mersin, TR', 'Napoli, IT', 'sea', '$1,650', 'per TEU', -1.5, CURRENT_DATE)
ON CONFLICT (route) DO NOTHING;

-- Insert sample regulation news
INSERT INTO regulation_news (id, title, summary, content, tags, publish_date, source, view_count, featured) VALUES
('reg-001', 'Yeni Kargo Taşımacılığı Yönetmeliği', 
'Ulaştırma ve Altyapı Bakanlığı tarafından yayınlanan yeni yönetmelik 1 Eylül 2025 tarihinde yürürlüğe girecek.',
'# Yeni Kargo Taşımacılığı Yönetmeliği

## Temel Değişiklikler
- Elektronik beyanname zorunluluğu
- Yeni güvenlik standartları
- Çevre dostu araç teşvikleri

## Sektöre Etkisi
Taşımacılık şirketleri için yeni süreçler ve yükümlülükler belirlendi.',
ARRAY['Yönetmelik', 'Mevzuat', 'Kargo', 'Taşımacılık'],
'2025-08-06', 'Resmi Gazete', 423, true),

('reg-002', 'Gümrük Modernizasyonu Projesi',
'Dijital gümrük sistemine geçiş sürecinde yeni prosedürler ve elektronik işlemler hayata geçiriliyor.',
'# Gümrük Modernizasyonu Projesi

## Dijital Dönüşüm
- Tam elektronik beyanname sistemi
- AI destekli risk analizi
- Blockchain tabanlı belgelendirme

## Faydalar
İşlem süreleri %50 azalacak, maliyet %30 düşecek.',
ARRAY['Gümrük', 'Dijital', 'Modernizasyon'],
'2025-08-05', 'Gümrük ve Ticaret Bakanlığı', 567, false)
ON CONFLICT (id) DO NOTHING;
