// Simple file upload service for messages
// Listings'teki mantığı takip ederek basit approach

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class MessageFileService {
  // File upload for messages - images go to 'messages' bucket, documents to 'message_attachments' bucket
  static async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    try {
      // File validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { 
          success: false, 
          error: 'Dosya boyutu 10MB\'dan büyük olamaz.' 
        };
      }

      // Determine bucket based on file type
      const bucket = this.getBucketForFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', {
          error: uploadError,
          bucket,
          filePath,
          fileSize: file.size,
          fileType: file.type
        });
        return { 
          success: false, 
          error: `Dosya yüklenirken hata oluştu: ${uploadError.message}` 
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl
      };

    } catch (error) {
      console.error('File upload error:', error);
      return { 
        success: false, 
        error: 'Dosya yüklenirken beklenmeyen bir hata oluştu.' 
      };
    }
  }

  // Check if file is image
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is document
  static isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed'
    ];
    return documentTypes.includes(file.type);
  }

  // Get appropriate bucket for file type
  static getBucketForFile(file: File): 'messages' | 'message_attachments' {
    return this.isImageFile(file) ? 'messages' : 'message_attachments';
  }
}
