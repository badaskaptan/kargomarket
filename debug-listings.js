// Debug script to check listings in the database
import { supabase } from './src/lib/supabase.ts';

const debugListings = async () => {
  console.log('🔍 Debugging listings...');
  
  try {
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', user?.id || 'Not authenticated');
    
    // Get all listings
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, user_id, status, created_at')
      .limit(10);
      
    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      return;
    }
    
    console.log('📋 Found listings:', listings?.length || 0);
    listings?.forEach((listing, index) => {
      console.log(`${index + 1}. ID: ${listing.id} (${typeof listing.id})`);
      console.log(`   Title: ${listing.title}`);
      console.log(`   User ID: ${listing.user_id}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Created: ${listing.created_at}`);
      console.log('   ---');
    });
    
    // Check if we can use these IDs in offers table
    if (listings && listings.length > 0) {
      const testListingId = listings[0].id;
      console.log(`🧪 Testing listing ID: ${testListingId}`);
      
      // Try to query offers with this listing_id
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('id, listing_id')
        .eq('listing_id', testListingId);
        
      if (offersError) {
        console.error('❌ Error querying offers:', offersError);
      } else {
        console.log('✅ Found offers for this listing:', offers?.length || 0);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

debugListings();
