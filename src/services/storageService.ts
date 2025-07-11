import { supabase } from '../lib/supabase';

/**
 * Dosya yükleme servisi
 * @param file - Yüklenecek dosya
 * @param bucket - Storage bucket adı (default: 'documents')
 * @param folder - Klasör adı (opsiyonel)
 * @returns Promise<string> - Yüklenen dosyanın public URL'i
 */
export async function uploadFile(
  file: File, 
  bucket: string = 'documents', 
  folder?: string
): Promise<string> {
  try {
    // Dosya adını temizle ve benzersiz yap
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log('Uploading file:', { 
      originalName: file.name, 
      newPath: filePath, 
      bucket,
      size: file.size 
    });

    // Dosyayı Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Dosya yüklenirken hata oluştu: ${error.message}`);
    }

    console.log('File uploaded successfully:', data);

    // Public URL'i al
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Public URL alınamadı');
    }

    console.log('File public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

/**
 * Dosyayı Supabase Storage'dan sil
 * @param filePath - Silinecek dosyanın path'i
 * @param bucket - Storage bucket adı (default: 'documents')
 * @returns Promise<void>
 */
export async function deleteFile(
  filePath: string, 
  bucket: string = 'documents'
): Promise<void> {
  try {
    console.log('Deleting file:', { filePath, bucket });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Dosya silinirken hata oluştu: ${error.message}`);
    }

    console.log('File deleted successfully');

  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}

/**
 * Bucket'daki dosyaları listele
 * @param bucket - Storage bucket adı
 * @param folder - Klasör adı (opsiyonel)
 * @param limit - Maksimum dosya sayısı (default: 100)
 * @returns Promise<Array> - Dosya listesi
 */
export async function listFiles(
  bucket: string, 
  folder?: string, 
  limit: number = 100
) {
  try {
    console.log('Listing files:', { bucket, folder, limit });

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      throw new Error(`Dosyalar listelenirken hata oluştu: ${error.message}`);
    }

    console.log('Files listed successfully:', data?.length);
    return data || [];

  } catch (error) {
    console.error('Error in listFiles:', error);
    throw error;
  }
}

/**
 * Dosya boyutu formatlama yardımcı fonksiyonu
 * @param bytes - Byte cinsinden dosya boyutu
 * @returns string - Formatlanmış dosya boyutu
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Dosya tipine göre icon döndürme yardımcı fonksiyonu
 * @param fileName - Dosya adı
 * @returns string - Icon emoji
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️';
    case 'zip':
    case 'rar':
      return '📦';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎥';
    case 'mp3':
    case 'wav':
      return '🎵';
    default:
      return '📎';
  }
}
