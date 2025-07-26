-- Billing System Debug ve Monitoring
-- Geliştirme sırasında sistem durumunu kontrol etmek için

-- 1. Sistem tabloları durum kontrolü
SELECT 
    'user_balances' as table_name,
    COUNT(*) as record_count,
    AVG(current_balance) as avg_balance,
    SUM(current_balance) as total_balance,
    MAX(last_updated) as latest_update
FROM user_balances
UNION ALL
SELECT 
    'billing_transactions' as table_name,
    COUNT(*) as record_count,
    AVG(amount) as avg_amount,
    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
    MAX(created_at) as latest_transaction
FROM billing_transactions;

-- 2. Kullanıcı bazlı özet rapor
SELECT 
    ub.user_id,
    ub.current_balance,
    ub.total_spent,
    COUNT(bt.id) as transaction_count,
    SUM(CASE WHEN bt.type = 'credit' THEN bt.amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN bt.type = 'debit' THEN ABS(bt.amount) ELSE 0 END) as total_debits,
    ub.last_updated
FROM user_balances ub
LEFT JOIN billing_transactions bt ON ub.user_id = bt.user_id
GROUP BY ub.user_id, ub.current_balance, ub.total_spent, ub.last_updated
ORDER BY ub.last_updated DESC;

-- 3. Son 24 saatin transaction'ları
SELECT 
    bt.user_id,
    bt.amount,
    bt.type,
    bt.description,
    bt.reference_id,
    bt.status,
    bt.created_at
FROM billing_transactions bt
WHERE bt.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day'
ORDER BY bt.created_at DESC;

-- 4. Hoş geldin bonusu alan kullanıcılar
SELECT 
    bt.user_id,
    bt.amount,
    bt.created_at,
    ub.current_balance
FROM billing_transactions bt
JOIN user_balances ub ON bt.user_id = ub.user_id
WHERE bt.reference_id = 'welcome_bonus'
ORDER BY bt.created_at DESC;

-- 5. Reklam ödemeleri (Ücretsiz mod)
SELECT 
    bt.user_id,
    bt.amount,
    bt.description,
    bt.reference_id,
    bt.created_at
FROM billing_transactions bt
WHERE bt.description LIKE '%(Ücretsiz mod)%'
ORDER BY bt.created_at DESC;

-- 6. Bakiye uyumsuzluğu kontrolü (veri bütünlüğü)
SELECT 
    ub.user_id,
    ub.current_balance,
    ub.total_spent,
    COALESCE(SUM(CASE WHEN bt.type = 'credit' THEN bt.amount ELSE -bt.amount END), 0) as calculated_balance,
    COALESCE(SUM(CASE WHEN bt.type = 'debit' THEN ABS(bt.amount) ELSE 0 END), 0) as calculated_spent,
    -- Farkları hesapla
    ub.current_balance - COALESCE(SUM(CASE WHEN bt.type = 'credit' THEN bt.amount ELSE -bt.amount END), 0) as balance_diff,
    ub.total_spent - COALESCE(SUM(CASE WHEN bt.type = 'debit' THEN ABS(bt.amount) ELSE 0 END), 0) as spent_diff
FROM user_balances ub
LEFT JOIN billing_transactions bt ON ub.user_id = bt.user_id
GROUP BY ub.user_id, ub.current_balance, ub.total_spent
HAVING 
    ABS(ub.current_balance - COALESCE(SUM(CASE WHEN bt.type = 'credit' THEN bt.amount ELSE -bt.amount END), 0)) > 0.01
    OR ABS(ub.total_spent - COALESCE(SUM(CASE WHEN bt.type = 'debit' THEN ABS(bt.amount) ELSE 0 END), 0)) > 0.01;

-- 7. Fonksiyon çalışma testi
SELECT update_user_balance(
    (SELECT user_id FROM user_balances LIMIT 1), 
    0.01, 
    'add'
) as test_function;

-- Bu test sonrası bakiyeyi geri al
UPDATE user_balances 
SET current_balance = current_balance - 0.01, 
    last_updated = NOW() 
WHERE user_id = (SELECT user_id FROM user_balances LIMIT 1);

-- 8. RLS politika kontrolü
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    SUBSTRING(qual, 1, 100) as condition_preview
FROM pg_policies 
WHERE tablename IN ('user_balances', 'billing_transactions')
ORDER BY tablename, policyname;
