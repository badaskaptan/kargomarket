// Debug script for listings vs view
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvlyhdcnkjldcqwfgzvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bHloZGNua2psZGNxd2ZnenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2ODE5ODYsImV4cCI6MjA0NzI1Nzk4Nn0.5r3Rn8xaupAqKCr5WnQ9aCWJ95WOq7v3J1KeEgqYxaY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugView() {
  console.log('🔍 Testing listings vs view...');
  
  try {
    // 1. Önce direkt listings tablosunu kontrol et
    console.log('\n📋 DIRECT LISTINGS TABLE:');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, listing_type, user_id, status')
      .eq('status', 'active')
      .limit(10);
      
    console.log('Count:', listings?.length);
    console.log('Listing Types:', listings?.map(l => l.listing_type));
    console.log('User IDs:', listings?.map(l => l.user_id));
    if (listingsError) console.log('Error:', listingsError);
    
    // 2. Şimdi view'i kontrol et
    console.log('\n👁️ LISTINGS_WITH_PROFILES VIEW:');
    const { data: viewData, error: viewError } = await supabase
      .from('listings_with_profiles')
      .select('id, title, listing_type, user_id, status, full_name, company_name')
      .eq('status', 'active')
      .limit(10);
      
    console.log('Count:', viewData?.length);
    console.log('Listing Types:', viewData?.map(l => l.listing_type));
    console.log('User IDs:', viewData?.map(l => l.user_id));
    console.log('Profile Names:', viewData?.map(l => l.full_name));
    if (viewError) console.log('Error:', viewError);
    
    // 3. Profiles tablosunu kontrol et
    console.log('\n👤 PROFILES TABLE:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, company_name')
      .limit(10);
      
    console.log('Profiles count:', profiles?.length);
    console.log('Profile IDs:', profiles?.map(p => p.id));
    if (profilesError) console.log('Error:', profilesError);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugView();
