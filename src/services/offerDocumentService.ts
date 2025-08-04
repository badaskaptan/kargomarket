// Offer Documents Upload Service - Listings pattern'ini takip eder
import { supabase } from '../lib/supabase';

export interface DocumentUploadResult {
  documentUrls: string[];
  imageUrls: string[];
}

export class OfferDocumentService {
  private static readonly BUCKET_NAME = 'verification-documents';
  
  /**
   * Bir teklif için birden fazla dosya yükler (listings pattern'ini takip eder)
   * Dosya yapısı: 
   * - Documents: verification-documents/offers/documents/{userId}/{offerId}/{timestamp}-{fileName}
   * - Images: verification-documents/offers/images/{userId}/{offerId}/{timestamp}-{fileName}
   */
  static async uploadOfferDocuments(
    files: File[], 
    userId: string, 
    offerId: string
  ): Promise<DocumentUploadResult> {
    const documentUrls: string[] = [];
    const imageUrls: string[] = [];
    
    for (const file of files) {
      try {
        const filePath = await this.uploadSingleFile(file, userId, offerId);
        
        if (this.isImageFile(file)) {
          imageUrls.push(filePath);
        } else {
          documentUrls.push(filePath);
        }
      } catch (error) {
        console.error(`Dosya yükleme hatası: ${file.name}`, error);
        // Başarısız dosyaları atla, başarılı olanları kaydet
      }
    }
    
    return { documentUrls, imageUrls };
  }
  
  /**
   * Tek bir dosya yükler
   */
  private static async uploadSingleFile(
    file: File, 
    userId: string, 
    offerId: string
  ): Promise<string> {
    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`Dosya çok büyük: ${file.name}. Maksimum 10MB olmalıdır.`);
    }
    
    // Dosya türü kontrolü
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Desteklenmeyen dosya türü: ${file.name}`);
    }
    
    // Dosya adını temizle ve benzersiz yap
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanFileName}`;
    
    // Dosya tipine göre klasör belirle (listings pattern'i)
    const fileCategory = this.isImageFile(file) ? 'images' : 'documents';
    const filePath = `offers/${fileCategory}/${userId}/${offerId}/${fileName}`;
    
    // Supabase Storage'a yükle
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Dosya yükleme hatası: ${error.message}`);
    }
    
    return filePath;
  }
  
  /**
   * Dosyanın resim olup olmadığını kontrol eder
   */
  private static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }
  
  /**
   * Teklif için yüklenen dosyaları sil
   */
  static async deleteOfferDocuments(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return;
    
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove(filePaths);
    
    if (error) {
      console.error('Dosya silme hatası:', error);
      throw new Error(`Dosyalar silinirken hata oluştu: ${error.message}`);
    }
  }
  
  /**
   * Dosya URL'si ile dosyayı indir
   */
  static async downloadDocument(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      throw new Error(`Dosya indirme hatası: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Public URL al
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
  
  /**
   * Storage bucket'ının var olup olmadığını kontrol et, yoksa oluştur
   */
  static async ensureBucketExists(): Promise<void> {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Bucket listesi alınamadı:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/jpg',
          'image/png'
        ],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('Bucket oluşturulamadı:', createError);
      }
    }
  }
}

export default OfferDocumentService;
