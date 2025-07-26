-- Test verisi oluşturma script'i
-- Bu script'i geliştirme aşamasında test verisi oluşturmak için kullanabilirsiniz

-- 1. Mevcut kullanıcı ID'sini al (manuel olarak değiştirin)
-- Supabase Dashboard > Authentication > Users'dan bir kullanıcı ID'si kopyalayın
-- Örnek: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

-- 2. Test kullanıcısı için bakiye oluştur
INSERT INTO user_balances (user_id, current_balance, total_spent, currency)
VALUES (
    'BURAYA_USER_ID_YAZIN', -- ← Gerçek kullanıcı ID'si yazın
    500.00,  -- 500 TL hediye bakiye
    0.00,    -- Henüz harcama yok
    'TRY'
) ON CONFLICT (user_id) DO UPDATE SET
    current_balance = EXCLUDED.current_balance,
    last_updated = NOW();

-- 3. Hoş geldin bonusu transaction'ı ekle
INSERT INTO billing_transactions (user_id, amount, type, description, reference_id, status)
VALUES (
    'BURAYA_USER_ID_YAZIN', -- ← Aynı kullanıcı ID'si
    500.00,
    'credit',
    'Hoş geldin hediyesi - Ücretsiz reklam bakiyesi',
    'welcome_bonus',
    'completed'
);

-- 4. Örnek reklam transaction'ları (test için)
INSERT INTO billing_transactions (user_id, amount, type, description, reference_id, status)
VALUES 
(
    'BURAYA_USER_ID_YAZIN', -- ← Aynı kullanıcı ID'si
    -50.00,
    'debit',
    'Banner reklamı oluşturma (Ücretsiz mod)',
    'ad_001',
    'completed'
),
(
    'BURAYA_USER_ID_YAZIN', -- ← Aynı kullanıcı ID'si
    -100.00,
    'debit',
    'Video reklamı oluşturma (Ücretsiz mod)',
    'ad_002',
    'completed'
);

-- 5. Verileri kontrol et
SELECT 
    ub.user_id,
    ub.current_balance,
    ub.total_spent,
    ub.currency,
    ub.last_updated
FROM user_balances ub
WHERE ub.user_id = 'BURAYA_USER_ID_YAZIN';

-- 6. Transaction geçmişini kontrol et
SELECT 
    bt.amount,
    bt.type,
    bt.description,
    bt.reference_id,
    bt.status,
    bt.created_at
FROM billing_transactions bt
WHERE bt.user_id = 'BURAYA_USER_ID_YAZIN'
ORDER BY bt.created_at DESC;
