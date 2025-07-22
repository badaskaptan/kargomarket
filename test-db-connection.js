// Test database connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test listings table
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .limit(5);
    
    if (listingsError) {
      console.error('❌ Listings error:', listingsError);
    } else {
      console.log('✅ Listings found:', listings?.length || 0);
      console.log('📋 Sample listings:', listings);
    }
    
    // Test offers table
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .limit(5);
    
    if (offersError) {
      console.error('❌ Offers error:', offersError);
    } else {
      console.log('✅ Offers found:', offers?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
