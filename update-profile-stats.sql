-- ========================================
-- DEPRECATED: PROFILE STATS UPDATE FUNCTIONS
-- ⚠️  Bu dosya artık kullanılmıyor - ProfileSection hook'larla güncellendi
-- ProfileSection artık useUserListingStats ve useUserOfferStats kullanıyor
-- Canlı veriler Overview bölümü gibi real-time hesaplanıyor
-- ========================================

-- ❌ ARTIK GEREKSİZ: Profile tablosundaki istatistik alanları kullanılmıyor
-- ✅ YENİ YAKLAŞIM: Hook-based live data calculation
-- 
-- Profiles tablosunda şu kolonlar mevcut ama artık kullanılmıyor:
-- - total_listings (→ useUserListingStats.totalListings)
-- - total_offers (→ useUserOfferStats hook'ları)
-- - total_completed_transactions (→ useUserOfferStats.acceptedOffers)
-- - rating (→ reviews tablosundan direkt hesaplanacak)
--
-- Avatar sistemi için avatar_url kolonu aktif ve 'avatars' bucket kullanılıyor

-- 1. Profile stats'larını güncelleyen ana fonksiyon
CREATE OR REPLACE FUNCTION update_profile_stats(user_id UUID)
RETURNS VOID AS $$
DECLARE
    listings_count INT := 0;
    offers_count INT := 0;
    completed_count INT := 0;
    avg_rating DECIMAL := 0.0;
BEGIN
    -- Total listings count
    SELECT COUNT(*) INTO listings_count
    FROM cargo_listings 
    WHERE user_id = $1 AND status != 'deleted';
    
    -- Total offers count (hem verilen hem alınan teklifler)
    SELECT COUNT(*) INTO offers_count
    FROM service_offers 
    WHERE user_id = $1 OR listing_id IN (
        SELECT id FROM cargo_listings WHERE user_id = $1
    );
    
    -- Completed transactions count (başarılı tamamlanan işlemler)
    SELECT COUNT(*) INTO completed_count
    FROM service_offers 
    WHERE (user_id = $1 OR listing_id IN (
        SELECT id FROM cargo_listings WHERE user_id = $1
    )) AND status = 'completed';
    
    -- Average rating (alınan yorumların ortalaması)
    SELECT COALESCE(AVG(rating), 0.0) INTO avg_rating
    FROM reviews 
    WHERE reviewed_user_id = $1;
    
    -- Profile tablosunu güncelle
    UPDATE profiles 
    SET 
        total_listings = listings_count,
        total_offers = offers_count,
        total_completed_transactions = completed_count,
        rating = avg_rating,
        updated_at = NOW()
    WHERE id = $1;
    
    RAISE NOTICE 'Profile stats updated for user %: listings=%, offers=%, completed=%, rating=%', 
        $1, listings_count, offers_count, completed_count, avg_rating;
END;
$$ LANGUAGE plpgsql;

-- 2. Tüm kullanıcıların stats'larını toplu güncelleme
CREATE OR REPLACE FUNCTION update_all_profile_stats()
RETURNS INT AS $$
DECLARE
    user_record RECORD;
    updated_count INT := 0;
BEGIN
    FOR user_record IN 
        SELECT id FROM profiles WHERE status = 'active'
    LOOP
        PERFORM update_profile_stats(user_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated profile stats for % users', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger fonksiyonu - Otomatik stats güncellemesi
CREATE OR REPLACE FUNCTION trigger_update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Etkilenen kullanıcı ID'lerini belirle
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Yeni veya güncellenen kayıt
        IF TG_TABLE_NAME = 'cargo_listings' THEN
            PERFORM update_profile_stats(NEW.user_id);
        ELSIF TG_TABLE_NAME = 'service_offers' THEN
            PERFORM update_profile_stats(NEW.user_id);
            -- Listing sahibinin de stats'ını güncelle
            PERFORM update_profile_stats((
                SELECT user_id FROM cargo_listings WHERE id = NEW.listing_id
            ));
        ELSIF TG_TABLE_NAME = 'reviews' THEN
            PERFORM update_profile_stats(NEW.reviewed_user_id);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Silinen kayıt
        IF TG_TABLE_NAME = 'cargo_listings' THEN
            PERFORM update_profile_stats(OLD.user_id);
        ELSIF TG_TABLE_NAME = 'service_offers' THEN
            PERFORM update_profile_stats(OLD.user_id);
            PERFORM update_profile_stats((
                SELECT user_id FROM cargo_listings WHERE id = OLD.listing_id
            ));
        ELSIF TG_TABLE_NAME = 'reviews' THEN
            PERFORM update_profile_stats(OLD.reviewed_user_id);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger'ları oluştur
DROP TRIGGER IF EXISTS update_profile_stats_on_listings ON cargo_listings;
CREATE TRIGGER update_profile_stats_on_listings
    AFTER INSERT OR UPDATE OR DELETE ON cargo_listings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_stats();

DROP TRIGGER IF EXISTS update_profile_stats_on_offers ON service_offers;
CREATE TRIGGER update_profile_stats_on_offers
    AFTER INSERT OR UPDATE OR DELETE ON service_offers
    FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_stats();

DROP TRIGGER IF EXISTS update_profile_stats_on_reviews ON reviews;
CREATE TRIGGER update_profile_stats_on_reviews
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_stats();

-- 5. Test verisi ekle (mevcut kullanıcılar için)
DO $$
DECLARE
    test_user_id UUID;
    test_listing_id UUID;
BEGIN
    -- İlk aktif kullanıcıyı bul
    SELECT id INTO test_user_id 
    FROM profiles 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test cargo listing ekle
        INSERT INTO cargo_listings (
            user_id, 
            title, 
            description, 
            pickup_location, 
            delivery_location, 
            cargo_type, 
            weight, 
            status
        ) VALUES (
            test_user_id,
            'Test Kargo - İstanbul-Ankara',
            'Avatar test için oluşturulan test kargo ilanı',
            'İstanbul, Türkiye',
            'Ankara, Türkiye',
            'genel',
            100,
            'active'
        ) RETURNING id INTO test_listing_id;
        
        -- Test service offer ekle
        INSERT INTO service_offers (
            listing_id,
            user_id,
            price,
            currency,
            delivery_time,
            description,
            status
        ) VALUES (
            test_listing_id,
            test_user_id,
            500.00,
            'TRY',
            '2 gün',
            'Test teklif - Avatar yükleme testi için',
            'pending'
        );
        
        -- Test review ekle
        INSERT INTO reviews (
            reviewer_id,
            reviewed_user_id,
            listing_id,
            rating,
            review_text,
            review_type
        ) VALUES (
            test_user_id,
            test_user_id,
            test_listing_id,
            4.5,
            'Test değerlendirme - Avatar testi için',
            'seller'
        );
        
        RAISE NOTICE 'Test verileri eklendi - User ID: %', test_user_id;
    END IF;
END $$;

-- 6. Tüm profillerin stats'larını güncelle
SELECT update_all_profile_stats();

-- 7. Sonuçları kontrol et
SELECT 
    id,
    full_name,
    total_listings,
    total_offers,
    total_completed_transactions,
    rating,
    updated_at
FROM profiles 
WHERE total_listings > 0 OR total_offers > 0
ORDER BY total_listings DESC, total_offers DESC
LIMIT 10;
