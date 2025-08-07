-- Embed Sync Log Tablosu
-- Embed verileri ile market data senkronizasyon logları

CREATE TABLE IF NOT EXISTS embed_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    embed_id TEXT NOT NULL,
    updated_items INTEGER DEFAULT 0,
    errors TEXT[] DEFAULT '{}',
    success BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_embed_sync_logs_embed_id ON embed_sync_logs(embed_id);
CREATE INDEX IF NOT EXISTS idx_embed_sync_logs_synced_at ON embed_sync_logs(synced_at);
CREATE INDEX IF NOT EXISTS idx_embed_sync_logs_success ON embed_sync_logs(success);

-- RLS politikaları
ALTER TABLE embed_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync logs are publicly readable" ON embed_sync_logs
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert sync logs" ON embed_sync_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Eski log kayıtlarını temizlemek için fonksiyon
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM embed_sync_logs 
    WHERE synced_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Cleaned up old embed sync logs';
END;
$$ LANGUAGE plpgsql;

-- Embeds tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS embeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embed_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeds için RLS
ALTER TABLE embeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Embeds are publicly readable" ON embeds
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage embeds" ON embeds
    FOR ALL USING (auth.role() = 'authenticated');

-- Updated at trigger for embeds
CREATE TRIGGER update_embeds_updated_at 
    BEFORE UPDATE ON embeds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Demo embed verisi (piyasa verileri ile)
INSERT INTO embeds (title, content, embed_data) VALUES (
    'Güncel Piyasa Durumu',
    'Bugünkü piyasa verileri: USD/TRY 27.48, EUR/TRY 29.85, Brent Petrol $68.39, Altın $1950.00, Baltic Dry Index 1247 points',
    '{
        "market_data": [
            {
                "symbol": "USD/TRY",
                "value": 27.48,
                "change": 0.22,
                "changePercent": "+0.8%",
                "timestamp": "2025-08-07T20:42:14"
            },
            {
                "symbol": "EUR/TRY", 
                "value": 29.85,
                "change": -0.15,
                "changePercent": "-0.5%",
                "timestamp": "2025-08-07T20:42:14"
            },
            {
                "symbol": "BRENT",
                "value": 68.39,
                "change": 0.0,
                "changePercent": "+0.0%",
                "timestamp": "2025-08-07T20:42:14"
            },
            {
                "symbol": "GOLD",
                "value": 1950.00,
                "change": 0.0,
                "changePercent": "0.0%",
                "timestamp": "2025-08-07T20:42:14"
            },
            {
                "symbol": "BDI",
                "value": 1247,
                "change": 15,
                "changePercent": "+1.2%",
                "timestamp": "2025-08-07T20:42:13"
            }
        ],
        "currency_rates": [
            {
                "from": "USD",
                "to": "TRY",
                "rate": 27.48,
                "change": 0.22
            },
            {
                "from": "EUR",
                "to": "TRY", 
                "rate": 29.85,
                "change": -0.15
            }
        ],
        "fuel_prices": [
            {
                "type": "Brent Petrol",
                "price": 68.39,
                "unit": "USD/Varil",
                "change": 0.0
            }
        ]
    }'
) ON CONFLICT DO NOTHING;
