-- offers tablosundaki offer_type constraint'ini düzelt
-- Bu script CreateOfferModal'ın gönderdiği değerlerle uyumlu hale getirir

-- Eski constraint'i kaldır (varsa)
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_offer_type_check;

-- Yeni constraint ekle - frontend'le uyumlu değerler
ALTER TABLE offers ADD CONSTRAINT offers_offer_type_check 
CHECK (offer_type IS NULL OR offer_type IN (
  'fixed_price', 'negotiable', 'auction', 'free_quote', 
  'bid', 'quote', 'direct_offer', 'counter_offer'
));

-- Constraint'i kontrol et
SELECT 
  constraint_name, 
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'offers' 
  AND tc.constraint_name = 'offers_offer_type_check';
