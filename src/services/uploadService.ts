import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

export class UploadService {
  // Görsel yükleme için bucket
  private static readonly IMAGES_BUCKET = 'listings';
  // Evrak yükleme için bucket  
  private static readonly DOCUMENTS_BUCKET = 'documents';

  /**
   * Yük görseli yükle
   */
  static async uploadImage(file: File, listingId: string, index: number): Promise<UploadResult> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${listingId}/image-${index}.${fileExt}`;
      
      console.log('📸 Uploading image:', { fileName, size: file.size, userId: user.id });

      const { error } = await supabase.storage
        .from(this.IMAGES_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Aynı dosya varsa üzerine yaz
        });

      if (error) {
        console.error('❌ Image upload error:', error);
        throw new Error(`Görsel yüklenemedi: ${error.message}`);
      }

      // Public URL al
      const { data: urlData } = supabase.storage
        .from(this.IMAGES_BUCKET)
        .getPublicUrl(fileName);

      console.log('✅ Image uploaded successfully:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: fileName,
        fileName: file.name
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Evrak yükle
   */
  static async uploadDocument(file: File, listingId: string, documentType: string): Promise<UploadResult> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${user.id}/${listingId}/${documentType}_${Date.now()}_${sanitizedFileName}`;
      
      console.log('📄 Uploading document:', { fileName, size: file.size, type: file.type, userId: user.id });

      const { error } = await supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // Evraklar için her zaman yeni dosya oluştur
        });

      if (error) {
        console.error('❌ Document upload error:', error);
        throw new Error(`Evrak yüklenemedi: ${error.message}`);
      }

      // Public URL al
      const { data: urlData } = supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .getPublicUrl(fileName);

      console.log('✅ Document uploaded successfully:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: fileName,
        fileName: file.name
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Dosya sil
   */
  static async deleteFile(path: string, isImage: boolean = true): Promise<void> {
    try {
      const bucket = isImage ? this.IMAGES_BUCKET : this.DOCUMENTS_BUCKET;
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('❌ File delete error:', error);
        throw new Error(`Dosya silinemedi: ${error.message}`);
      }

      console.log('🗑️ File deleted successfully:', path);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Çoklu dosya yükle
   */
  static async uploadMultipleDocuments(
    files: File[], 
    listingId: string
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadDocument(file, listingId, 'general');
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Hata olsa bile diğer dosyaları yüklemeye devam et
      }
    }
    
    return results;
  }

  /**
   * Dosya boyutu ve tip kontrolü
   */
  static validateFile(file: File, isImage: boolean = true): { valid: boolean; error?: string } {
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for documents
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Dosya boyutu ${isImage ? '5MB' : '10MB'} geçemez`
      };
    }

    if (isImage) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: 'Sadece JPEG ve PNG formatları desteklenir'
        };
      }
    } else {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
      ];
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: 'Desteklenmeyen dosya formatı'
        };
      }
    }

    return { valid: true };
  }
}
