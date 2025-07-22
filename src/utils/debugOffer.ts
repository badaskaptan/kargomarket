// Simplified offer creation test for debugging
import { supabase } from '../lib/supabase';

export const debugOfferIssue = async () => {
  console.log('🔍 Debugging offer creation issue...');

  try {
    // 1. Check user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return;
    }
    console.log('✅ User authenticated:', user.id);

    // 2. Check listings in database
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, user_id, status, created_at')
      .limit(10);
      
    console.log('📋 Database listings query result:');
    console.log('📋 Error:', listingsError);
    console.log('📋 Data:', listings);
    console.log('📋 Count:', listings?.length || 0);

    if (listings && listings.length > 0) {
      listings.forEach((listing, index) => {
        console.log(`${index + 1}. ID: ${listing.id}`);
        console.log(`   Title: ${listing.title}`);
        console.log(`   User: ${listing.user_id}`);
        console.log(`   Status: ${listing.status}`);
        console.log('   ---');
      });
    }

    // 3. Try to query offers table structure
    const { data: offerSample, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .limit(1);
      
    console.log('🎯 Offers table query result:');
    console.log('🎯 Error:', offerError);
    console.log('🎯 Sample data:', offerSample);

    // 4. Check if we can access both tables
    const { data: transportServices, error: tsError } = await supabase
      .from('transport_services')
      .select('id, title, user_id, status')
      .limit(5);
      
    console.log('🚛 Transport services query result:');
    console.log('🚛 Error:', tsError);
    console.log('🚛 Data:', transportServices);
    console.log('🚛 Count:', transportServices?.length || 0);

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugOfferIssue = debugOfferIssue;
  console.log('🧪 Debug function loaded. Run debugOfferIssue() in console to debug.');
}
