// Supabase'de related_load_listing_id kolonunu ekle
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rmqwrdeaecjyyalbnvbq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcXdyZGVhZWNqeXlhbGJudmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzM3MzUsImV4cCI6MjA2NzQwOTczNX0.L4vYHbdMKHaSw_NrMTcAwEPjs2MI-OqH6BeFtbSVHy0'
);

async function addRelatedLoadListingColumn() {
  try {
    console.log('🔄 Adding related_load_listing_id column to listings table...');
    
    // Execute the SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add the related_load_listing_id column
        ALTER TABLE public.listings 
        ADD COLUMN IF NOT EXISTS related_load_listing_id UUID 
        REFERENCES public.listings(id) ON DELETE SET NULL;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_listings_related_load_listing_id 
        ON public.listings(related_load_listing_id);
        
        -- Add comment
        COMMENT ON COLUMN public.listings.related_load_listing_id IS 'Nakliye Talebi ilanlarının bağlı olduğu yük ilanının ID''si. Sadece shipment_request tipi ilanlar için kullanılır.';
      `
    });

    if (error) {
      console.error('❌ Error adding column:', error);
    } else {
      console.log('✅ Column added successfully:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

addRelatedLoadListingColumn();
