-- Offers tablosunu CreateOfferModal ile uyumlu hale getirmek için güncelleme
-- Listings ve Messages tablolarındaki pattern'i takip ederek clean bir yapı oluşturuyoruz

-- 1. documents_description kolonu ekle
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS documents_description TEXT;

-- 2. document_urls kolonu ekle (listings/messages pattern'i gibi)
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS document_urls text[] NULL;

-- 3. image_urls kolonu ekle (listings pattern'i gibi)  
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS image_urls text[] NULL;

-- 4. transport_mode constraint'ini güncelle - 'negotiable' ekle
ALTER TABLE public.offers 
DROP CONSTRAINT IF EXISTS offers_transport_mode_check;

ALTER TABLE public.offers 
ADD CONSTRAINT offers_transport_mode_check CHECK (
    (transport_mode IS NULL) OR 
    (transport_mode::text = ANY (
        ARRAY[
            'road'::character varying,
            'sea'::character varying, 
            'air'::character varying,
            'rail'::character varying,
            'multimodal'::character varying,
            'negotiable'::character varying
        ]::text[]
    ))
);

-- 3. cargo_type constraint'ini güncelle - tüm yeni kategorileri ekle
ALTER TABLE public.offers 
DROP CONSTRAINT IF EXISTS offers_cargo_type_check;

ALTER TABLE public.offers 
ADD CONSTRAINT offers_cargo_type_check CHECK (
    (cargo_type IS NULL) OR 
    (cargo_type::text = ANY (
        ARRAY[
            -- Temel kategoriler
            'general_cargo'::character varying,
            'bulk_cargo'::character varying,
            'container'::character varying,
            'liquid'::character varying,
            'dry_bulk'::character varying,
            'refrigerated'::character varying,
            'hazardous'::character varying,
            'oversized'::character varying,
            'project_cargo'::character varying,
            'livestock'::character varying,
            'vehicles'::character varying,
            'machinery'::character varying,
            
            -- Genel Kargo / Paletli Ürünler
            'box_package'::character varying,
            'pallet_standard'::character varying,
            'pallet_euro'::character varying,
            'pallet_industrial'::character varying,
            'sack_bigbag'::character varying,
            'barrel_drum'::character varying,
            'appliances_electronics'::character varying,
            'furniture_decor'::character varying,
            'textile_products'::character varying,
            'automotive_parts'::character varying,
            'machinery_parts'::character varying,
            'construction_materials'::character varying,
            'packaged_food'::character varying,
            'consumer_goods'::character varying,
            'ecommerce_cargo'::character varying,
            'other_general'::character varying,
            
            -- Dökme Yükler
            'grain'::character varying,
            'ore'::character varying,
            'coal'::character varying,
            'cement_bulk'::character varying,
            'sand_gravel'::character varying,
            'fertilizer_bulk'::character varying,
            'soil_excavation'::character varying,
            'scrap_metal'::character varying,
            'other_bulk'::character varying,
            
            -- Sıvı Yükler
            'crude_oil'::character varying,
            'chemical_liquids'::character varying,
            'vegetable_oils'::character varying,
            'fuel'::character varying,
            'lpg_lng'::character varying,
            'water'::character varying,
            'milk_dairy'::character varying,
            'wine_concentrate'::character varying,
            'other_liquid'::character varying,
            
            -- Ağır Yük / Gabari Dışı
            'tbm'::character varying,
            'transformer_generator'::character varying,
            'heavy_machinery'::character varying,
            'boat_yacht'::character varying,
            'industrial_parts'::character varying,
            'prefab_elements'::character varying,
            'wind_turbine'::character varying,
            'other_oversized'::character varying,
            
            -- Hassas / Kırılabilir
            'art_antiques'::character varying,
            'glass_ceramic'::character varying,
            'electronic_devices'::character varying,
            'medical_devices'::character varying,
            'lab_equipment'::character varying,
            'flowers_plants'::character varying,
            'other_sensitive'::character varying,
            
            -- Tehlikeli Madde
            'dangerous_class1'::character varying,
            'dangerous_class2'::character varying,
            'dangerous_class3'::character varying,
            'dangerous_class4'::character varying,
            'dangerous_class5'::character varying,
            'dangerous_class6'::character varying,
            'dangerous_class7'::character varying,
            'dangerous_class8'::character varying,
            'dangerous_class9'::character varying,
            
            -- Soğuk Zincir
            'frozen_food'::character varying,
            'fresh_produce'::character varying,
            'meat_dairy'::character varying,
            'pharma_vaccine'::character varying,
            'chemical_temp'::character varying,
            'other_cold_chain'::character varying,
            
            -- Canlı Hayvan
            'small_livestock'::character varying,
            'large_livestock'::character varying,
            'poultry'::character varying,
            'pets'::character varying,
            'other_livestock'::character varying,
            
            -- Proje Yükleri
            'factory_setup'::character varying,
            'power_plant'::character varying,
            'infrastructure'::character varying,
            'other_project'::character varying
        ]::text[]
    ))
);

-- 6. Index'leri ekle (listings/messages pattern'i gibi)
CREATE INDEX IF NOT EXISTS idx_offers_documents_description 
ON public.offers USING btree (documents_description) 
WHERE documents_description IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_document_urls 
ON public.offers USING gin(document_urls) 
WHERE document_urls IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_image_urls 
ON public.offers USING gin(image_urls) 
WHERE image_urls IS NOT NULL;

-- 7. Yorumlar ekle
COMMENT ON COLUMN public.offers.documents_description IS 'Kullanıcının yüklediği evrakların açıklaması (opsiyonel)';

COMMENT ON COLUMN public.offers.document_urls IS 'Yüklenen evrak dosyalarının URL listesi (verification-documents bucket)';

COMMENT ON COLUMN public.offers.image_urls IS 'Yüklenen resim dosyalarının URL listesi (verification-documents bucket)';

/*
DOSYA SAKLAMA YAPISI (listings pattern'i takip ederek):

verification-documents/
├── offers/
│   ├── documents/
│   │   ├── {user_id}/
│   │   │   ├── {offer_id}/
│   │   │   │   ├── {timestamp}-{filename}.pdf
│   │   │   │   └── {timestamp}-{filename}.docx
│   └── images/
│       ├── {user_id}/
│       │   ├── {offer_id}/
│       │   │   ├── {timestamp}-{filename}.jpg
│       │   │   └── {timestamp}-{filename}.png

ÖRNEK URL'LER:
- document_urls: ['offers/documents/user-id/offer-id/1691234567890-sigorta.pdf']
- image_urls: ['offers/images/user-id/offer-id/1691234567891-foto.jpg']
*/
