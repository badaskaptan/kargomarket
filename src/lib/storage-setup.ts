// ====================================
// SUPABASE STORAGE SETUP
// Storage bucket'larını oluşturur ve yapılandırır
// ====================================

import { supabase } from './supabase';

export interface StorageSetupResult {
  success: boolean;
  message: string;
  missingBuckets: string[];
}

export const initializeStorageBuckets = async (): Promise<StorageSetupResult> => {
  const missingBuckets: string[] = [];
  
  try {
    console.log('🗄️ Storage bucketları başlatılıyor...');

    // Önce mevcut bucketları listele
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Bucket listesi alınamadı:', listError);
      return {
        success: false,
        message: `Bucket listesi alınamadı: ${listError.message}`,
        missingBuckets: []
      };
    }

    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    console.log('📋 Mevcut bucketlar:', existingBucketNames);

    // Required bucket'lar
    const requiredBuckets = [
      {
        name: 'documents',
        config: {
          public: true,
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png'
          ],
          fileSizeLimit: 10485760 // 10MB
        }
      },
      {
        name: 'listings',
        config: {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png', 
            'image/gif'
          ],
          fileSizeLimit: 10485760 // 10MB
        }
      }
    ];

    // Her bucket için oluşturma işlemi
    for (const bucket of requiredBuckets) {
      if (!existingBucketNames.includes(bucket.name)) {
        console.log(`📦 ${bucket.name} bucketi oluşturuluyor...`);
        
        const { error: createError } = await supabase.storage.createBucket(bucket.name, bucket.config);
        
        if (createError) {
          console.error(`❌ ${bucket.name} bucket oluşturma hatası:`, createError);
          missingBuckets.push(bucket.name);
          
          // Özel hata mesajları
          if (createError.message.includes('already exists')) {
            console.log(`✅ ${bucket.name} bucket zaten mevcut`);
          } else if (createError.message.includes('permission') || createError.message.includes('RLS')) {
            console.warn(`⚠️ ${bucket.name} için izin hatası - RLS politikaları kontrol edin`);
          }
        } else {
          console.log(`✅ ${bucket.name} bucket başarıyla oluşturuldu`);
        }
      } else {
        console.log(`✅ ${bucket.name} bucket zaten mevcut`);
      }
    }

    // Opsiyonel avatars bucket
    if (!existingBucketNames.includes('avatars')) {
      console.log('📦 avatars bucketi oluşturuluyor (opsiyonel)...');
      const { error: avatarsCreateError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 2097152 // 2MB
      });
      
      if (avatarsCreateError) {
        console.warn('⚠️ avatars bucket oluşturulamadı (opsiyonel):', avatarsCreateError.message);
      } else {
        console.log('✅ avatars bucket oluşturuldu');
      }
    }

    if (missingBuckets.length > 0) {
      return {
        success: false,
        message: `Bazı bucketlar oluşturulamadı: ${missingBuckets.join(', ')}. Bu genellikle RLS izin sorunu nedeniyledir. Manuel oluşturma gerekebilir.`,
        missingBuckets
      };
    }

    // Son kontrol - bucketların gerçekten oluştuğunu doğrula
    const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets();
    if (!finalError && finalBuckets) {
      const finalBucketNames = finalBuckets.map(b => b.name);
      const stillMissing = requiredBuckets.filter(b => !finalBucketNames.includes(b.name));
      
      if (stillMissing.length > 0) {
        return {
          success: false,
          message: `Bucketlar oluşturuldu ama listede görünmüyor: ${stillMissing.map(b => b.name).join(', ')}`,
          missingBuckets: stillMissing.map(b => b.name)
        };
      }
    }

    console.log('🎉 Tüm storage bucketları başarıyla hazırlandı');
    return {
      success: true,
      message: 'Tüm storage bucketları başarıyla kontrol edildi ve oluşturuldu.',
      missingBuckets: []
    };
  } catch (error) {
    console.error('❌ Storage initialization hatası:', error);
    return {
      success: false,
      message: `Storage initialization hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      missingBuckets: []
    };
  }
};

// Bucket'ların varlığını kontrol et
export const checkStorageBuckets = async () => {
  try {
    console.log('🔍 Checking storage buckets...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name
      });
      return false;
    }

    if (!buckets) {
      console.error('❌ No buckets data returned (buckets is null/undefined)');
      return false;
    }

    // Dosya yükleme için asıl gerekli olan bucket'lar (avatars opsiyonel)
    const requiredBuckets = ['documents', 'listings'];
    const optionalBuckets = ['avatars'];
    const existingBuckets = buckets.map(bucket => bucket.name);
    
    console.log('📋 All existing buckets:', existingBuckets);
    console.log('🎯 Required buckets:', requiredBuckets);
    console.log('🔘 Optional buckets:', optionalBuckets);
    console.log('📊 Total buckets found:', buckets.length);
    
    const missingRequired = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));
    const missingOptional = optionalBuckets.filter(bucket => !existingBuckets.includes(bucket));
    
    console.log('❓ Missing required buckets:', missingRequired);
    console.log('❓ Missing optional buckets:', missingOptional);
    
    if (missingRequired.length > 0) {
      console.warn('⚠️ Missing REQUIRED buckets:', missingRequired);
      console.warn('❌ File upload will be disabled until these buckets are created');
      console.warn('🔍 DETAILED BUCKET CHECK:');
      
      // Check each required bucket individually for more details
      for (const bucketName of requiredBuckets) {
        const found = existingBuckets.includes(bucketName);
        console.warn(`  - ${bucketName}: ${found ? '✅ FOUND' : '❌ MISSING'}`);
        if (!found) {
          // Try to get more info about why this bucket is missing
          const { data: specificBucket, error: specificError } = await supabase.storage.getBucket(bucketName);
          console.warn(`    getBucket(${bucketName}) result:`, { data: specificBucket, error: specificError });
        }
      }
      
      return false;
    }

    if (missingOptional.length > 0) {
      console.warn('⚠️ Missing OPTIONAL buckets:', missingOptional);
      console.log('✅ File upload is available (optional buckets can be created later)');
    } else {
      console.log('✅ All required and optional buckets exist');
    }

    console.log('✅ checkStorageBuckets returning TRUE - all required buckets found');
    return true;
  } catch (error) {
    console.error('❌ Error checking buckets:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    return false;
  }
};
