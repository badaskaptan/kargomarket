-- Reklam metriklerini otomatik güncelleyen fonksiyonlar
-- ad_impressions ve ad_clicks tablosuna insert olduğunda ads tablosunu günceller

-- 1. Metrik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_ad_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Impression eklendiğinde
    IF TG_TABLE_NAME = 'ad_impressions' THEN
        UPDATE ads 
        SET 
            impressions = (
                SELECT COUNT(*) 
                FROM ad_impressions 
                WHERE ad_id = NEW.ad_id
            ),
            updated_at = NOW()
        WHERE id = NEW.ad_id;
    END IF;
    
    -- Click eklendiğinde
    IF TG_TABLE_NAME = 'ad_clicks' THEN
        UPDATE ads 
        SET 
            clicks = (
                SELECT COUNT(*) 
                FROM ad_clicks 
                WHERE ad_id = NEW.ad_id
            ),
            updated_at = NOW()
        WHERE id = NEW.ad_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Mevcut trigger'ları güncelle
DROP TRIGGER IF EXISTS update_ad_impressions ON ad_impressions;
DROP TRIGGER IF EXISTS update_ad_clicks ON ad_clicks;

-- Yeni trigger'ları oluştur
CREATE TRIGGER update_ad_impressions
    AFTER INSERT ON ad_impressions 
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_metrics();

CREATE TRIGGER update_ad_clicks
    AFTER INSERT ON ad_clicks 
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_metrics();

-- 3. CTR hesaplama güncellemesi (ads tablosunda zaten var)
-- ads tablosundaki CTR kolonu GENERATED ALWAYS AS olduğu için otomatik hesaplanır

-- 4. Bakiye düşürme fonksiyonu (reklam başladığında)
CREATE OR REPLACE FUNCTION deduct_ad_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Reklam aktif duruma geçtiğinde günlük bütçeyi düş
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
        -- Billing service üzerinden yapılacak, burada sadece log
        INSERT INTO billing_transactions (
            user_id, 
            amount, 
            type, 
            description, 
            reference_id, 
            status
        ) VALUES (
            NEW.user_id,
            -NEW.daily_budget,
            'debit',
            'Reklam aktivasyonu - ' || NEW.title,
            'ad_' || NEW.id,
            'completed'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Reklam durumu değişim trigger'ı
CREATE TRIGGER on_ad_status_change
    AFTER UPDATE ON ads 
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION deduct_ad_budget();
