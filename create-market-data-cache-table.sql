-- Market Data Cache Tablosu
-- Piyasa verilerini cache'lemek için

CREATE TABLE IF NOT EXISTS market_data_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    last_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_market_data_cache_item_id ON market_data_cache(item_id);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_cached_at ON market_data_cache(cached_at);

-- RLS politikaları (herkese okuma izni)
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market data is publicly readable" ON market_data_cache
    FOR SELECT USING (true);

-- Admin kullanıcılar için yazma izni (gelecekte kullanılacak)
CREATE POLICY "Authenticated users can insert market data" ON market_data_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update market data" ON market_data_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_data_cache_updated_at 
    BEFORE UPDATE ON market_data_cache 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Eski cache verilerini temizlemek için fonksiyon
CREATE OR REPLACE FUNCTION cleanup_old_market_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM market_data_cache 
    WHERE cached_at < NOW() - INTERVAL '1 day';
    
    RAISE NOTICE 'Cleaned up old market data cache entries';
END;
$$ LANGUAGE plpgsql;

-- Demo veriler (opsiyonel)
INSERT INTO market_data_cache (item_id, data) VALUES 
('baltic-dry-index', '{
    "id": "baltic-dry-index",
    "name": "Baltic Dry Index",
    "category": "freight",
    "value": "1247",
    "change": 15,
    "changePercent": "+1.2%",
    "unit": "Points",
    "lastUpdate": "2025-08-07T20:42:13",
    "trend": "up",
    "source": "Cached Data"
}')
ON CONFLICT (item_id) DO NOTHING;
