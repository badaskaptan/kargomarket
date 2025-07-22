-- Service Offers Table for Transport Services
-- Bu tablo nakliye hizmetlerine gönderilen teklifleri tutar

CREATE TABLE IF NOT EXISTS service_offers (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign Keys
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transport_service_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  
  -- Offer Details
  price_amount DECIMAL(10,2),
  price_currency TEXT DEFAULT 'TRY' CHECK (price_currency IN ('TRY', 'USD', 'EUR')),
  message TEXT,
  
  -- Status Management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_user_service_offer UNIQUE(user_id, transport_service_id),
  CONSTRAINT positive_price CHECK (price_amount > 0)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_service_offers_user_id ON service_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_offers_transport_service_id ON service_offers(transport_service_id);
CREATE INDEX IF NOT EXISTS idx_service_offers_status ON service_offers(status);
CREATE INDEX IF NOT EXISTS idx_service_offers_created_at ON service_offers(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE service_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sent offers
CREATE POLICY "Users can view their own sent service offers" ON service_offers
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can view offers received on their transport services
CREATE POLICY "Users can view offers on their transport services" ON service_offers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM listings 
            WHERE id = service_offers.transport_service_id 
            AND listing_type = 'transport_service'
        )
    );

-- Policy: Users can insert their own offers
CREATE POLICY "Users can create service offers" ON service_offers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own offers
CREATE POLICY "Users can update their own service offers" ON service_offers
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service owners can update offer status (accept/reject)
CREATE POLICY "Service owners can update offer status" ON service_offers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM listings 
            WHERE id = service_offers.transport_service_id 
            AND listing_type = 'transport_service'
        )
    );

-- Policy: Users can delete their own offers
CREATE POLICY "Users can delete their own service offers" ON service_offers
    FOR DELETE USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE service_offers IS 'Nakliye hizmetlerine gönderilen teklifler';
COMMENT ON COLUMN service_offers.user_id IS 'Teklifi gönderen kullanıcı';
COMMENT ON COLUMN service_offers.transport_service_id IS 'Teklif gönderilen nakliye hizmeti';
COMMENT ON COLUMN service_offers.price_amount IS 'Teklif edilen fiyat';
COMMENT ON COLUMN service_offers.message IS 'Teklif mesajı';
COMMENT ON COLUMN service_offers.status IS 'Teklif durumu: pending, accepted, rejected, withdrawn';
