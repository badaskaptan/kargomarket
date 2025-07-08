// ====================================
// SUPABASE STORAGE SETUP
// Storage bucket'larını oluşturur ve yapılandırır
// ====================================

import { supabase } from './supabase';

export const initializeStorageBuckets = async () => {
  try {
    console.log('🗄️ Initializing Supabase Storage buckets...');

    // 1. listing-images bucket'ını oluştur
    const { data: existingImagesBucket, error: imagesListError } = await supabase.storage.getBucket('listing-images');
    
    if (imagesListError && imagesListError.message.includes('not found')) {
      console.log('📦 Creating listing-images bucket...');
      const { error: imagesCreateError } = await supabase.storage.createBucket('listing-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (imagesCreateError) {
        console.error('❌ Error creating listing-images bucket:', imagesCreateError);
      } else {
        console.log('✅ listing-images bucket created successfully');
      }
    } else if (existingImagesBucket) {
      console.log('✅ listing-images bucket already exists');
    }

    // 2. listing-documents bucket'ını oluştur
    const { data: existingDocsBucket, error: docsListError } = await supabase.storage.getBucket('listing-documents');
    
    if (docsListError && docsListError.message.includes('not found')) {
      console.log('📦 Creating listing-documents bucket...');
      const { error: docsCreateError } = await supabase.storage.createBucket('listing-documents', {
        public: true,
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/png',
          'image/jpeg',
          'image/jpg'
        ],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (docsCreateError) {
        console.error('❌ Error creating listing-documents bucket:', docsCreateError);
      } else {
        console.log('✅ listing-documents bucket created successfully');
      }
    } else if (existingDocsBucket) {
      console.log('✅ listing-documents bucket already exists');
    }

    // 3. avatars bucket'ını oluştur (ProfileSection için)
    const { data: existingAvatarsBucket, error: avatarsListError } = await supabase.storage.getBucket('avatars');
    
    if (avatarsListError && avatarsListError.message.includes('not found')) {
      console.log('📦 Creating avatars bucket...');
      const { error: avatarsCreateError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 2097152 // 2MB
      });
      
      if (avatarsCreateError) {
        console.error('❌ Error creating avatars bucket:', avatarsCreateError);
      } else {
        console.log('✅ avatars bucket created successfully');
      }
    } else if (existingAvatarsBucket) {
      console.log('✅ avatars bucket already exists');
    }

    console.log('🎉 Storage buckets initialization completed');
    return true;
  } catch (error) {
    console.error('❌ Storage initialization error:', error);
    return false;
  }
};

// Bucket'ların varlığını kontrol et
export const checkStorageBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      return false;
    }

    const requiredBuckets = ['listing-images', 'listing-documents', 'avatars'];
    const existingBuckets = buckets.map(bucket => bucket.name);
    
    console.log('📋 Existing buckets:', existingBuckets);
    
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.warn('⚠️ Missing buckets:', missingBuckets);
      return false;
    }

    console.log('✅ All required buckets exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking buckets:', error);
    return false;
  }
};
