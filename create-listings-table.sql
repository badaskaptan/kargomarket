-- ===============================================
-- LISTINGS TABLE CREATION SCRIPT
-- KargoMarket Yük ve Hizmet İlanları için ana tablo
-- ===============================================

CREATE TABLE public.listings (
  id uuid not null default extensions.uuid_generate_v4 (),
  listing_number text not null,
  user_id uuid null,
  listing_type text not null,
  role_type text null,
  title text not null,
  description text null,
  category text null,
  subcategory text null,
  origin text not null,
  destination text not null,
  origin_coordinates geography null,
  destination_coordinates geography null,
  origin_details jsonb null default '{}'::jsonb,
  destination_details jsonb null default '{}'::jsonb,
  route_waypoints jsonb null default '[]'::jsonb,
  load_type text null,
  load_category text null,
  weight_value numeric(10, 3) null,
  weight_unit text null default 'ton'::text,
  volume_value numeric(10, 3) null,
  volume_unit text null default 'm3'::text,
  dimensions jsonb null,
  quantity integer null,
  packaging_type text null,
  special_handling_requirements text[] null,
  loading_date date null,
  loading_time time without time zone null,
  delivery_date date null,
  delivery_time time without time zone null,
  available_from_date date null,
  available_until_date date null,
  flexible_dates boolean null default false,
  transport_mode text null,
  vehicle_types text[] null,
  transport_responsible text null,
  special_requirements text null,
  temperature_controlled boolean null default false,
  temperature_range jsonb null,
  humidity_controlled boolean null default false,
  hazardous_materials boolean null default false,
  fragile_cargo boolean null default false,
  offer_type text null,
  price_amount numeric(12, 2) null,
  price_currency text null default 'TRY'::text,
  price_per text null,
  budget_min numeric(12, 2) null,
  budget_max numeric(12, 2) null,
  required_documents text[] null,
  insurance_required boolean null default false,
  insurance_value numeric(12, 2) null,
  customs_clearance_required boolean null default false,
  status text null default 'active'::text,
  is_urgent boolean null default false,
  priority_level integer null default 0,
  visibility text null default 'public'::text,
  view_count integer null default 0,
  offer_count integer null default 0,
  favorite_count integer null default 0,
  search_tags text[] null,
  seo_keywords text[] null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  published_at timestamp with time zone null,
  expires_at timestamp with time zone null,
  document_urls text[] null,
  image_urls text[] null,
  related_load_listing_id uuid null,
  cargo_details jsonb null default '{}'::jsonb,
  transport_details jsonb null default '{}'::jsonb,
  additional_requirements jsonb null default '{}'::jsonb,
  capacity text null,
  contact_info jsonb null default '{}'::jsonb,
  service_number text null,
  metadata jsonb null default '{}'::jsonb,
  constraint listings_pkey primary key (id),
  constraint listings_listing_number_key unique (listing_number),
  constraint listings_related_load_listing_id_fkey foreign KEY (related_load_listing_id) references listings (id) on delete set null,
  constraint listings_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint listings_role_type_check check (
    (
      role_type = any (array['buyer'::text, 'seller'::text])
    )
  ),
  constraint listings_status_check check (
    (
      status = any (
        array[
          'draft'::text,
          'active'::text,
          'paused'::text,
          'completed'::text,
          'cancelled'::text,
          'expired'::text
        ]
      )
    )
  ),
  constraint listings_transport_mode_check check (
    (
      transport_mode = any (
        array[
          'road'::text,
          'sea'::text,
          'air'::text,
          'rail'::text,
          'multimodal'::text
        ]
      )
    )
  ),
  constraint listings_transport_responsible_check check (
    (
      transport_responsible = any (
        array[
          'buyer'::text,
          'seller'::text,
          'carrier'::text,
          'negotiable'::text
        ]
      )
    )
  ),
  constraint listings_visibility_check check (
    (
      visibility = any (
        array['public'::text, 'private'::text, 'premium'::text]
      )
    )
  ),
  constraint listings_listing_type_check check (
    (
      listing_type = any (
        array[
          'load_listing'::text,
          'shipment_request'::text,
          'transport_service'::text
        ]
      )
    )
  ),
  constraint listings_offer_type_check check (
    (
      offer_type = any (
        array[
          'fixed_price'::text,
          'negotiable'::text,
          'auction'::text,
          'free_quote'::text
        ]
      )
    )
  ),
  constraint listings_price_per_check check (
    (
      price_per = any (
        array[
          'total'::text,
          'ton'::text,
          'km'::text,
          'day'::text,
          'hour'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_listings_related_load_listing_id on public.listings using btree (related_load_listing_id) TABLESPACE pg_default;
create index IF not exists idx_listings_user_id on public.listings using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_listings_type_status on public.listings using btree (listing_type, status) TABLESPACE pg_default;
create index IF not exists idx_listings_location on public.listings using btree (origin, destination) TABLESPACE pg_default;
create index IF not exists idx_listings_transport_mode on public.listings using btree (transport_mode) TABLESPACE pg_default;
create index IF not exists idx_listings_created_at on public.listings using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_listings_geography on public.listings using gist (origin_coordinates, destination_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_origin_geo on public.listings using gist (origin_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_destination_geo on public.listings using gist (destination_coordinates) TABLESPACE pg_default;
create index IF not exists idx_listings_search on public.listings using gin (
  to_tsvector(
    'turkish'::regconfig,
    (
      (title || ' '::text) || COALESCE(description, ''::text)
    )
  )
) TABLESPACE pg_default;
create index IF not exists idx_listings_type_status_created on public.listings using btree (listing_type, status, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_listings_vehicle_types on public.listings using gin (vehicle_types) TABLESPACE pg_default;
create index IF not exists idx_listings_capacity on public.listings using btree (capacity) TABLESPACE pg_default;
create index IF not exists idx_listings_service_number on public.listings using btree (service_number) TABLESPACE pg_default;
create index IF not exists idx_listings_metadata on public.listings using gin (metadata) TABLESPACE pg_default;
create index IF not exists idx_listings_contact_info on public.listings using gin (contact_info) TABLESPACE pg_default;

create trigger trigger_auto_listing_number BEFORE INSERT on listings for EACH row
execute FUNCTION auto_generate_listing_number ();

create trigger update_listings_updated_at BEFORE
update on listings for EACH row
execute FUNCTION update_updated_at_column ();
