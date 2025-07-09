// ====================================
// STORAGE TEST UTILITY
// Hızlı storage testi için
// ====================================

import { supabase } from '../lib/supabase';

export const testStorageConnection = async () => {
  console.log('🔍 Testing storage connection...');
  
  try {
    // Temel bağlantı testi
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 User check:', { hasUser: !!user, userError: userError?.message });
    
    // Bucket'ları listele
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('🗂️ Buckets check:', { 
      bucketCount: buckets?.length || 0,
      bucketNames: buckets?.map(b => b.name) || [],
      bucketError: bucketError?.message 
    });
    
    if (bucketError) {
      console.error('❌ Bucket listing failed:', bucketError);
      return false;
    }
    
    // documents bucket test
    const { data: docsFiles, error: docsError } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });
      
    console.log('📄 Documents bucket test:', {
      canAccess: !docsError,
      fileCount: docsFiles?.length || 0,
      error: docsError?.message
    });
    
    // listings bucket test  
    const { data: listingsFiles, error: listingsError } = await supabase.storage
      .from('listings')
      .list('', { limit: 1 });
      
    console.log('🖼️ Listings bucket test:', {
      canAccess: !listingsError,
      fileCount: listingsFiles?.length || 0,
      error: listingsError?.message
    });
    
    const hasRequiredBuckets = !docsError && !listingsError;
    console.log('✅ Final result:', { hasRequiredBuckets });
    
    return hasRequiredBuckets;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
};

// Global debug function
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testStorage = testStorageConnection;
}
