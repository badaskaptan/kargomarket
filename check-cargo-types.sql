-- Geçerli cargo_type değerlerini kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
AND column_name = 'cargo_type';

-- Check constraint'leri kontrol et
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'service_offers'::regclass
AND conname LIKE '%cargo_type%';
