// ====================================
// STORAGE CONNECTIVITY TEST
// Quick test for Supabase storage without authentication
// ====================================

import { supabase } from './supabase';

export const testStorageConnectivity = async () => {
  console.log('🧪 Testing basic storage connectivity...');
  
  try {
    // Try to list buckets - this should work without authentication for public buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage connectivity test FAILED:', error);
      return {
        success: false,
        error: error.message,
        details: 'Could not list storage buckets. This might indicate connection issues or RLS problems.'
      };
    }

    if (!buckets) {
      console.error('❌ Storage connectivity test FAILED: No buckets data returned');
      return {
        success: false,
        error: 'No buckets data returned',
        details: 'listBuckets() returned null/undefined data.'
      };
    }

    console.log('✅ Storage connectivity test PASSED');
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    return {
      success: true,
      buckets: buckets.map(b => ({
        name: b.name,
        public: b.public,
        id: b.id
      })),
      message: `Found ${buckets.length} storage bucket(s)`
    };
    
  } catch (error) {
    console.error('❌ Storage connectivity test ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Exception thrown during storage test.'
    };
  }
};

// Test if specific buckets exist
export const testSpecificBuckets = async (bucketNames: string[] = ['documents', 'listings', 'avatars']) => {
  console.log('🎯 Testing specific buckets:', bucketNames);
  
  const results: Record<string, { exists: boolean; details?: unknown; error?: unknown }> = {};
  
  for (const bucketName of bucketNames) {
    try {
      const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
      
      if (error) {
        console.error(`❌ ${bucketName}: Error -`, error);
        results[bucketName] = { exists: false, error: error.message };
      } else if (bucket) {
        console.log(`✅ ${bucketName}: Found -`, { id: bucket.id, public: bucket.public });
        results[bucketName] = { exists: true, details: bucket };
      } else {
        console.warn(`⚠️ ${bucketName}: Not found`);
        results[bucketName] = { exists: false, error: 'Bucket not found' };
      }
    } catch (error) {
      console.error(`❌ ${bucketName}: Exception -`, error);
      results[bucketName] = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  return results;
};

// Test file upload permissions (requires auth)
export const testUploadPermissions = async (bucketName: string = 'documents') => {
  console.log(`🔐 Testing upload permissions for bucket: ${bucketName}`);
  
  try {
    // Create a small test file
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    const testPath = `test/${Date.now()}-test.txt`;
    
    console.log(`📤 Attempting upload to ${bucketName}/${testPath}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testFile);
    
    if (error) {
      console.error(`❌ Upload test FAILED for ${bucketName}:`, error);
      return {
        success: false,
        error: error.message,
        details: 'Upload permission test failed. This might indicate RLS policy issues.'
      };
    }
    
    console.log(`✅ Upload test PASSED for ${bucketName}:`, data);
    
    // Clean up test file
    console.log(`🧹 Cleaning up test file: ${testPath}`);
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn(`⚠️ Could not clean up test file:`, deleteError);
    } else {
      console.log(`✅ Test file cleaned up successfully`);
    }
    
    return {
      success: true,
      path: data.path,
      message: 'Upload and delete permissions working correctly'
    };
    
  } catch (error) {
    console.error(`❌ Upload test ERROR for ${bucketName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Exception thrown during upload test.'
    };
  }
};
