import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rmqwrdeaecjyyalbnvbq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcXdyZGVhZWNqeXlhbGJudmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzM3MzUsImV4cCI6MjA2NzQwOTczNX0.L4vYHbdMKHaSw_NrMTcAwEPjs2MI-OqH6BeFtbSVHy0'
);

async function checkSchema() {
  try {
    console.log('🔍 Checking actual database schema...');
    
    // Try to fetch an existing listing to see the actual schema
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }

    if (listings && listings.length > 0) {
      console.log('✅ Actual database columns:', Object.keys(listings[0]));
      console.log('✅ Sample listing:', JSON.stringify(listings[0], null, 2));
    } else {
      console.log('📝 No listings found. Let\'s check what columns exist by trying a minimal insert...');
      
      // Try a minimal insert to see what fields are required
      const { data, error: insertError } = await supabase
        .from('listings')
        .insert([{
          user_id: '1cc5549f-2826-43f9-b378-a3861b5af9e7',
          listing_type: 'load_listing',
          title: 'Test',
          pickup_location: 'Test',
          delivery_location: 'Test'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
      } else {
        console.log('✅ Test listing created, actual columns:', Object.keys(data));
        
        // Clean up the test listing
        await supabase.from('listings').delete().eq('id', data.id);
        console.log('🧹 Test listing cleaned up');
      }
    }

  } catch (err) {
    console.error('Connection error:', err);
  }
}

checkSchema();
