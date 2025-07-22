-- service_offers tablosuna RLS Policies ekle
-- Mevcut tabloya policies eklemek için

-- RLS'yi aktif et (zaten aktif olabilir)
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
