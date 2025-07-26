import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class AdMediaService {
  private static readonly BUCKET_NAME = 'advertisements';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

  /**
   * Reklam medya dosyası yükler (resim veya video)
   * Policy: advertisements bucket'ına sadece authenticated users upload yapabilir
   * Dosya yolu: /{user_id}/ad_{adId}_{timestamp}.{ext}
   */
  static async uploadMedia(file: File, adId: string): Promise<UploadResult> {
    try {
      // Dosya boyutu kontrolü
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.'
        };
      }

      // Dosya türü kontrolü
      const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.type);
      
      if (!isImage && !isVideo) {
        return {
          success: false,
          error: 'Desteklenmeyen dosya türü. Sadece resim (JPEG, PNG, GIF, WebP) ve video (MP4, WebM, OGG) dosyaları yüklenebilir.'
        };
      }

      // Kullanıcı bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Dosya yüklemek için giriş yapmanız gerekiyor.'
        };
      }

      // Dosya adını oluştur (policy'ye uygun: user_id/ad_id/filename)
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `ad_${adId}_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${adId}/${fileName}`;

      // Dosyayı bucket'a yükle
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: `Dosya yükleme hatası: ${error.message}`
        };
      }

      // Public URL'i al
      const { data: publicData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicData.publicUrl
      };

    } catch (error) {
      console.error('Media upload error:', error);
      return {
        success: false,
        error: 'Dosya yüklenirken beklenmeyen bir hata oluştu.'
      };
    }
  }

  /**
   * Eski medya dosyasını siler
   */
  static async deleteMedia(url: string): Promise<boolean> {
    try {
      // URL'den dosya yolunu çıkar
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (bucketIndex === -1 || bucketIndex >= urlParts.length - 1) {
        console.error('Invalid media URL:', url);
        return false;
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Media delete error:', error);
      return false;
    }
  }

  /**
   * Dosya türünü kontrol eder
   */
  static isImageFile(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  static isVideoFile(file: File): boolean {
    return this.ALLOWED_VIDEO_TYPES.includes(file.type);
  }

  /**
   * Dosya boyutunu formatlar
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
