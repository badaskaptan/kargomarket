-- Güncellenmiş profiles tablosu (website alanı dahil)

create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text not null,
  avatar_url text null,
  phone text null,
  phone_verified boolean null default false,
  company_name text null,
  company_type text null,
  tax_office text null,
  tax_number text null,
  trade_registry_number text null,
  address text null,
  city text null,
  district text null,
  postal_code text null,
  country text null default 'Turkey'::text,
  user_roles text[] null default array['alici-satici'::text],
  active_role text null default 'alici-satici'::text,
  permissions text[] null default array[]::text[],
  is_verified boolean null default false,
  verification_documents jsonb null default '[]'::jsonb,
  account_status text null default 'active'::text,
  business_license text null,
  insurance_info jsonb null,
  certifications text[] null,
  total_listings integer null default 0,
  total_offers integer null default 0,
  successful_transactions integer null default 0,
  avg_rating numeric(3, 2) null default 0.00,
  notification_preferences jsonb null default '{"sms": false, "push": true, "email": true}'::jsonb,
  language_preference text null default 'tr'::text,
  currency_preference text null default 'TRY'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  user_role text not null default 'alici-satici'::text,
  rating numeric null default 0,
  rating_count integer null default 0,
  total_completed_transactions integer null default 0,
  preferences jsonb null default '{}'::jsonb,
  settings jsonb null default '{"theme": "light", "privacy": {"show_email": false, "show_phone": false, "show_location": true}, "currency": "TRY", "language": "tr", "notifications": {"sms": false, "push": true, "email": true}}'::jsonb,
  metadata jsonb null default '{}'::jsonb,
  website text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_user_role_check check (
    (
      user_role = any (
        array[
          'alici-satici'::text,
          'nakliyeci'::text,
          'admin'::text
        ]
      )
    )
  ),
  constraint valid_email check (
    (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
    )
  ),
  constraint valid_roles check ((array_length(user_roles, 1) > 0))
) TABLESPACE pg_default;

create index IF not exists idx_profiles_search on public.profiles using gin (
  to_tsvector(
    'turkish'::regconfig,
    (
      (full_name || ' '::text) || COALESCE(company_name, ''::text)
    )
  )
) TABLESPACE pg_default;

create trigger on_profile_delete
after DELETE on profiles for EACH row when (old.avatar_url is not null)
execute FUNCTION handle_storage_file_deletion ();

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();
