// ====================================
// STORAGE DIAGNOSTICS
// Storage sorunlarını teşhis etmeye yardımcı olur
// ====================================

import { supabase } from './supabase';

export interface StorageDiagnostic {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

export class StorageDiagnostics {
  static async runDiagnostics(): Promise<StorageDiagnostic[]> {
    const results: StorageDiagnostic[] = [];

    // 1. Supabase bağlantısını test et
    try {
      const { data: user } = await supabase.auth.getUser();
      results.push({
        test: 'Supabase Connection',
        status: 'pass',
        message: 'Supabase bağlantısı başarılı',
        details: { hasUser: !!user.user }
      });
    } catch (error) {
      results.push({
        test: 'Supabase Connection',
        status: 'fail',
        message: 'Supabase bağlantısında hata',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // 2. Storage bucket'larını listele
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        results.push({
          test: 'Storage Access',
          status: 'fail',
          message: `Storage'a erişim hatası: ${error.message}`,
          details: { errorMessage: error.message }
        });
      } else {
        const bucketNames = buckets.map(b => b.name);
        const requiredBuckets = ['documents', 'listings', 'avatars'];
        const missingBuckets = requiredBuckets.filter(b => !bucketNames.includes(b));
        
        if (missingBuckets.length > 0) {
          results.push({
            test: 'Required Buckets',
            status: 'fail',
            message: `Eksik bucket'lar: ${missingBuckets.join(', ')}`,
            details: { existing: bucketNames, missing: missingBuckets }
          });
        } else {
          results.push({
            test: 'Required Buckets',
            status: 'pass',
            message: 'Tüm gerekli bucket\'lar mevcut',
            details: { buckets: bucketNames }
          });
        }
      }
    } catch (error) {
      results.push({
        test: 'Storage Access',
        status: 'fail',
        message: 'Storage erişim hatası',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // 3. Test dosyası yükleme (documents bucket kontrolü)
    try {
      const { data: files, error } = await supabase.storage
        .from('documents')
        .list('', { limit: 1 });
        
      if (error) {
        if (error.message.includes('not found')) {
          results.push({
            test: 'Documents Bucket Access',
            status: 'fail',
            message: 'documents bucket\'ı bulunamadı',
            details: { errorMessage: error.message }
          });
        } else {
          results.push({
            test: 'Documents Bucket Access',
            status: 'warning',
            message: `Documents bucket erişim sorunu: ${error.message}`,
            details: { errorMessage: error.message }
          });
        }
      } else {
        results.push({
          test: 'Documents Bucket Access',
          status: 'pass',
          message: 'documents bucket\'ına erişim başarılı',
          details: { fileCount: files?.length || 0 }
        });
      }
    } catch (error) {
      results.push({
        test: 'Documents Bucket Access',
        status: 'fail',
        message: 'Documents bucket erişim testi başarısız',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // 4. Test listings bucket (resimler için)
    try {
      const { data: files, error } = await supabase.storage
        .from('listings')
        .list('', { limit: 1 });
        
      if (error) {
        if (error.message.includes('not found')) {
          results.push({
            test: 'Listings Bucket Access',
            status: 'fail',
            message: 'listings bucket\'ı bulunamadı',
            details: { errorMessage: error.message }
          });
        } else {
          results.push({
            test: 'Listings Bucket Access',
            status: 'warning',
            message: `Listings bucket erişim sorunu: ${error.message}`,
            details: { errorMessage: error.message }
          });
        }
      } else {
        results.push({
          test: 'Listings Bucket Access',
          status: 'pass',
          message: 'listings bucket\'ına erişim başarılı',
          details: { fileCount: files?.length || 0 }
        });
      }
    } catch (error) {
      results.push({
        test: 'Listings Bucket Access',
        status: 'fail',
        message: 'Listings bucket erişim testi başarısız',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return results;
  }

  static printDiagnostics(results: StorageDiagnostic[]): void {
    console.log('\n🔍 === STORAGE DIAGNOSTICS ===');
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      if (result.details && typeof result.details === 'object') {
        console.log('   Details:', result.details);
      }
    });
    console.log('🔍 === END DIAGNOSTICS ===\n');
  }

  static async runAndPrint(): Promise<StorageDiagnostic[]> {
    const results = await this.runDiagnostics();
    this.printDiagnostics(results);
    return results;
  }
}
