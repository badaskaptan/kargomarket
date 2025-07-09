// Profiles tablosunun gerçek kolon adlarını kontrol et
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rmqwrdeaecjyyalbnvbq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcXdyZGVhZWNqeXlhbGJudmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzM3MzUsImV4cCI6MjA2NzQwOTczNX0.L4vYHbdMKHaSw_NrMTcAwEPjs2MI-OqH6BeFtbSVHy0'
);

async function checkProfilesSchema() {
  try {
    console.log('🔍 Checking profiles table schema...');
    
    // Profiles tablosundan bir kayıt al
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Profiles hatası:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Profiles columns:', Object.keys(data[0]));
      console.log('✅ Sample profile:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('📝 No profiles found');
    }
  } catch (err) {
    console.error('❌ Test hatası:', err);
  }
}

checkProfilesSchema();
