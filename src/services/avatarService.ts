import { supabase } from '../lib/supabase';

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class AvatarService {
  private static readonly BUCKET_NAME = 'avatars';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Avatar resmi yükler ve profil tablosunu günceller
   */
  static async uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
    try {
      console.log('📸 Avatar yükleme işlemi başlatılıyor...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });

      // Dosya validasyonu
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Eski avatar'ı sil (varsa)
      await this.deleteExistingAvatar(userId);

      // Yeni dosya adı oluştur
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      console.log('📁 Dosya yükleniyor:', filePath);

      // Dosyayı Supabase Storage'a yükle
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Aynı isimli dosya varsa üzerine yaz
        });

      if (uploadError) {
        console.error('❌ Avatar yükleme hatası:', uploadError);
        return { success: false, error: 'Dosya yükleme hatası: ' + uploadError.message };
      }

      console.log('✅ Dosya başarıyla yüklendi:', uploadData);

      // Public URL'i al
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return { success: false, error: 'Avatar URL alınamadı' };
      }

      // Profil tablosunu güncelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Profil güncelleme hatası:', updateError);
        // Yüklenen dosyayı sil
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        return { success: false, error: 'Profil güncelleme hatası: ' + updateError.message };
      }

      console.log('✅ Avatar başarıyla güncellendi:', urlData.publicUrl);

      return { 
        success: true, 
        url: urlData.publicUrl 
      };

    } catch (error) {
      console.error('❌ Avatar yükleme genel hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      };
    }
  }

  /**
   * Mevcut avatar'ı siler
   */
  static async deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Avatar silme işlemi başlatılıyor...', userId);

      // Mevcut avatar'ı sil
      await this.deleteExistingAvatar(userId);

      // Profil tablosunu güncelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Profil güncelleme hatası:', updateError);
        return { success: false, error: 'Profil güncelleme hatası: ' + updateError.message };
      }

      console.log('✅ Avatar başarıyla silindi');
      return { success: true };

    } catch (error) {
      console.error('❌ Avatar silme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      };
    }
  }

  /**
   * Kullanıcının mevcut avatar dosyalarını siler
   */
  private static async deleteExistingAvatar(userId: string): Promise<void> {
    try {
      const { data: files } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`);
        console.log('🗑️ Eski avatar dosyaları siliniyor:', filePaths);
        
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths);
      }
    } catch (error) {
      console.warn('⚠️ Eski avatar silme uyarısı:', error);
      // Bu hata kritik değil, devam et
    }
  }

  /**
   * Dosya validasyonu yapar
   */
  private static validateFile(file: File): { isValid: boolean; error?: string } {
    // Dosya boyutu kontrolü
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `Dosya boyutu çok büyük. Maximum ${this.MAX_FILE_SIZE / (1024 * 1024)}MB olmalıdır.` 
      };
    }

    // Dosya tipi kontrolü
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Desteklenen format: JPEG, PNG, WebP, GIF' 
      };
    }

    return { isValid: true };
  }

  /**
   * Avatar URL'ini döndürür
   */
  static getAvatarUrl(userId: string, fileName: string): string {
    const filePath = `${userId}/${fileName}`;
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}
