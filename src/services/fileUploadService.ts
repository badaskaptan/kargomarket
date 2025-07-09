// ====================================
// FILE UPLOAD SERVICE
// Dosya yükleme işlemlerini yönetir
// ====================================

import { supabase } from '../lib/supabase';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  bucket: string;
  path: string;
}

export class FileUploadService {
  /**
   * Dosyayı Supabase Storage'a yükler
   */
  static async uploadFile(
    file: File, 
    bucket: string = 'documents',
    folder: string = 'general'
  ): Promise<UploadedFile> {
    try {
      // Dosya adını temizle ve benzersiz yap
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log(`📤 Uploading file: ${file.name} to ${bucket}/${filePath}`);

      // Dosyayı yükle
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        
        // Daha spesifik hata mesajları
        if (error.message.includes('Bucket not found')) {
          throw new Error(`Storage bucket "${bucket}" bulunamadı. Lütfen Supabase Dashboard'dan bucket'ı oluşturun.`);
        } else if (error.message.includes('row-level security') || error.message.includes('policy')) {
          throw new Error(`Storage izin hatası. RLS politikaları ayarlanmamış olabilir.`);
        } else if (error.message.includes('not allowed') || error.message.includes('MIME')) {
          throw new Error(`Bu dosya türü desteklenmiyor: ${file.type}`);
        } else if (error.message.includes('size') || error.message.includes('large')) {
          throw new Error(`Dosya çok büyük: ${file.name}`);
        } else {
          throw new Error(`Dosya yüklenirken hata oluştu: ${error.message}`);
        }
      }

      // Public URL'yi al
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Dosya boyutunu formatla
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const uploadedFile: UploadedFile = {
        id: fileName,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url: publicData.publicUrl,
        bucket: bucket,
        path: filePath
      };

      console.log('✅ File uploaded successfully:', uploadedFile);
      return uploadedFile;

    } catch (error) {
      console.error('❌ FileUploadService.uploadFile error:', error);
      throw error;
    }
  }

  /**
   * Birden fazla dosyayı yükler
   */
  static async uploadMultipleFiles(
    files: File[], 
    bucket: string = 'documents',
    folder: string = 'general'
  ): Promise<UploadedFile[]> {
    try {
      console.log(`📤 Uploading ${files.length} files...`);
      
      const uploadPromises = files.map(file => 
        this.uploadFile(file, bucket, folder)
      );
      
      const results = await Promise.all(uploadPromises);
      console.log(`✅ Successfully uploaded ${results.length} files`);
      
      return results;
    } catch (error) {
      console.error('❌ FileUploadService.uploadMultipleFiles error:', error);
      throw error;
    }
  }

  /**
   * Dosyayı siler
   */
  static async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting file: ${bucket}/${filePath}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Dosya silinirken hata oluştu: ${error.message}`);
      }

      console.log('✅ File deleted successfully');
    } catch (error) {
      console.error('❌ FileUploadService.deleteFile error:', error);
      throw error;
    }
  }

  /**
   * Birden fazla dosyayı siler
   */
  static async deleteMultipleFiles(bucket: string, filePaths: string[]): Promise<void> {
    try {
      console.log(`🗑️ Deleting ${filePaths.length} files...`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove(filePaths);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Dosyalar silinirken hata oluştu: ${error.message}`);
      }

      console.log('✅ Files deleted successfully');
    } catch (error) {
      console.error('❌ FileUploadService.deleteMultipleFiles error:', error);
      throw error;
    }
  }

  /**
   * Desteklenen dosya tiplerini kontrol eder
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Dosya boyutunu kontrol eder (bytes cinsinden)
   */
  static validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
  }

  /**
   * Dosya validasyonu yapar
   */
  static validateFile(
    file: File, 
    allowedTypes: string[] = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ],
    maxSizeBytes: number = 10485760 // 10MB
  ): { isValid: boolean; error?: string } {
    if (!this.validateFileType(file, allowedTypes)) {
      return {
        isValid: false,
        error: 'Desteklenmeyen dosya formatı. Lütfen PDF, Excel, Word veya resim dosyası seçin.'
      };
    }

    if (!this.validateFileSize(file, maxSizeBytes)) {
      return {
        isValid: false,
        error: `Dosya boyutu çok büyük. Maksimum ${Math.round(maxSizeBytes / 1024 / 1024)}MB olmalıdır.`
      };
    }

    return { isValid: true };
  }
}
