// Quick storage debugging script
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmqwrdeaecjyyalbnvbq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcXdyZGVhZWNqeXlhbGJudmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzM3MzUsImV4cCI6MjA2NzQwOTczNX0.L4vYHbdMKHaSw_NrMTcAwEPjs2MI-OqH6BeFtbSVHy0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugStorage() {
  console.log('🔍 Debug: Checking Supabase connection...');
  
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);
    console.log('✅ Supabase connection test:', testError ? 'FAILED' : 'SUCCESS');
    if (testError) console.error('Connection error:', testError);

    // List all buckets
    console.log('\n📋 Listing all storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    console.log('📦 Found buckets:', buckets.map(b => b.name));

    // Check specific buckets
    const requiredBuckets = ['documents', 'listings'];
    const optionalBuckets = ['avatars'];

    for (const bucketName of [...requiredBuckets, ...optionalBuckets]) {
      console.log(`\n🔍 Checking bucket: ${bucketName}`);
      
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
      
      if (bucketError) {
        console.error(`❌ ${bucketName} bucket error:`, bucketError);
        continue;
      }

      if (bucket) {
        console.log(`✅ ${bucketName} bucket exists:`, {
          id: bucket.id,
          name: bucket.name,
          public: bucket.public,
          allowed_mime_types: bucket.allowed_mime_types,
          file_size_limit: bucket.file_size_limit
        });
      } else {
        console.error(`❌ ${bucketName} bucket not found`);
      }
    }

    // Test upload permissions
    console.log('\n🧪 Testing upload permissions...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    for (const bucketName of requiredBuckets) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`test-${Date.now()}.txt`, testFile);

      if (uploadError) {
        console.error(`❌ Upload test failed for ${bucketName}:`, uploadError);
      } else {
        console.log(`✅ Upload test successful for ${bucketName}:`, uploadData);
        
        // Clean up test file
        await supabase.storage.from(bucketName).remove([uploadData.path]);
      }
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugStorage();
