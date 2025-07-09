-- Supabase listings tablosuna related_load_listing_id kolonu ekleme
-- Nakliye Talebi (shipment_request) ilanlarının hangi yük ilanına (load_listing) bağlı olduğunu saklamak için

ALTER TABLE public.listings 
ADD COLUMN related_load_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL;

-- Index ekleme (performans için)
CREATE INDEX idx_listings_related_load_listing_id ON public.listings(related_load_listing_id);

-- Açıklama ekleme
COMMENT ON COLUMN public.listings.related_load_listing_id IS 'Nakliye Talebi ilanlarının bağlı olduğu yük ilanının ID''si. Sadece shipment_request tipi ilanlar için kullanılır.';

-- Kontrol fonksiyonu (opsiyonel) - Sadece shipment_request tipinde ilanlar için related_load_listing_id atanmasını sağlar
CREATE OR REPLACE FUNCTION check_related_load_listing() 
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer related_load_listing_id dolu ise, listing_type'ın shipment_request olması gerekir
  IF NEW.related_load_listing_id IS NOT NULL AND NEW.listing_type != 'shipment_request' THEN
    RAISE EXCEPTION 'related_load_listing_id can only be set for shipment_request listing type';
  END IF;
  
  -- Eğer related_load_listing_id dolu ise, referans verilen ilanın load_listing tipinde olması gerekir
  IF NEW.related_load_listing_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = NEW.related_load_listing_id 
      AND listing_type = 'load_listing'
    ) THEN
      RAISE EXCEPTION 'related_load_listing_id must reference a load_listing type listing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluşturma
CREATE TRIGGER trigger_check_related_load_listing
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION check_related_load_listing();
