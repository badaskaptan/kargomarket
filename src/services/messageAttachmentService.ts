import { supabase } from '../lib/supabase';

export interface MessageAttachment {
    id: string;
    message_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    upload_path: string;
    created_at: string;
}

export interface UploadResult {
    success: boolean;
    attachment?: MessageAttachment;
    error?: string;
}

export class MessageAttachmentService {
    private static readonly BUCKET_NAME = 'message-attachments';
    private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Desteklenen dosya türlerini kontrol eder
     */
    static isFileTypeSupported(file: File): boolean {
        const supportedTypes = [
            // Resimler
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            // Dokümanlar
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // Arşiv dosyaları
            'application/zip',
            'application/x-rar-compressed',
            // Metin dosyaları
            'text/plain',
            'text/csv'
        ];

        return supportedTypes.includes(file.type);
    }

    /**
     * Dosya boyut kontrolü
     */
    static isFileSizeValid(file: File): boolean {
        return file.size <= this.MAX_FILE_SIZE;
    }

    /**
     * Dosya tipine göre icon döndürür
     */
    static getFileIcon(fileType: string): string {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
        if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
        if (fileType.startsWith('text/')) return '📄';
        return '📎';
    }

    /**
     * Dosya boyutunu human readable formata çevirir
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Dosyayı Supabase bucket'a yükler
     */
    static async uploadFile(file: File, messageId: string): Promise<UploadResult> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'Kullanıcı girişi gerekli.' };
            }

            // Dosya validasyonları
            if (!this.isFileTypeSupported(file)) {
                return { success: false, error: 'Desteklenmeyen dosya türü.' };
            }

            if (!this.isFileSizeValid(file)) {
                return { success: false, error: `Dosya boyutu ${this.formatFileSize(this.MAX_FILE_SIZE)} limitini aşıyor.` };
            }

            // Unique dosya adı oluştur
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uploadPath = `${user.id}/${messageId}/${timestamp}_${sanitizedFileName}`;

            console.log('Dosya yükleme başladı:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadPath
            });

            // Dosyayı bucket'a yükle
            const { error: uploadError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .upload(uploadPath, file);

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                return { success: false, error: 'Dosya yüklenirken hata oluştu: ' + uploadError.message };
            }

            // Public URL al
            const { data: urlData } = supabase.storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(uploadPath);

            if (!urlData.publicUrl) {
                return { success: false, error: 'Dosya URL\'si alınamadı.' };
            }

            // Attachment kaydını database'e ekle
            const attachmentData = {
                message_id: messageId,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_url: urlData.publicUrl,
                upload_path: uploadPath
            };

            const { data: attachmentRecord, error: dbError } = await supabase
                .from('message_attachments')
                .insert([attachmentData])
                .select()
                .single();

            if (dbError) {
                console.error('Database insert error:', dbError);
                // Başarısız durumda dosyayı temizle
                await supabase.storage.from(this.BUCKET_NAME).remove([uploadPath]);
                return { success: false, error: 'Veritabanı kaydı oluşturulamadı: ' + dbError.message };
            }

            console.log('Dosya başarıyla yüklendi:', attachmentRecord);

            return {
                success: true,
                attachment: attachmentRecord as MessageAttachment
            };

        } catch (error) {
            console.error('Upload file error:', error);
            return { success: false, error: 'Beklenmeyen hata: ' + String(error) };
        }
    }

    /**
     * Mesaja ait tüm attachmentları getirir
     */
    static async getMessageAttachments(messageId: string): Promise<{ data: MessageAttachment[] | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('message_attachments')
                .select('*')
                .eq('message_id', messageId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Get attachments error:', error);
                return { data: null, error: 'Dosyalar yüklenirken hata oluştu.' };
            }

            return { data: data as MessageAttachment[], error: null };
        } catch (error) {
            console.error('Get attachments error:', error);
            return { data: null, error: 'Beklenmeyen hata oluştu.' };
        }
    }

    /**
     * Attachment'ı siler (hem dosyayı hem kaydı)
     */
    static async deleteAttachment(attachmentId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'Kullanıcı girişi gerekli.' };
            }

            // Önce attachment kaydını al
            const { data: attachment, error: fetchError } = await supabase
                .from('message_attachments')
                .select('*')
                .eq('id', attachmentId)
                .single();

            if (fetchError || !attachment) {
                return { success: false, error: 'Dosya kaydı bulunamadı.' };
            }

            // Storage'dan dosyayı sil
            const { error: storageError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove([attachment.upload_path]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Storage hatasında bile devam et
            }

            // Database kaydını sil
            const { error: dbError } = await supabase
                .from('message_attachments')
                .delete()
                .eq('id', attachmentId);

            if (dbError) {
                console.error('Database delete error:', dbError);
                return { success: false, error: 'Dosya kaydı silinemedi.' };
            }

            return { success: true };

        } catch (error) {
            console.error('Delete attachment error:', error);
            return { success: false, error: 'Beklenmeyen hata oluştu.' };
        }
    }

    /**
     * Dosyayı indirir
     */
    static async downloadFile(attachment: MessageAttachment): Promise<void> {
        try {
            // Public URL varsa direkt download et
            if (attachment.file_url) {
                const link = document.createElement('a');
                link.href = attachment.file_url;
                link.download = attachment.file_name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Fallback: Storage'dan signed URL al
                const { data, error } = await supabase.storage
                    .from(this.BUCKET_NAME)
                    .createSignedUrl(attachment.upload_path, 60); // 60 saniye geçerli

                if (error || !data.signedUrl) {
                    throw new Error('Download URL oluşturulamadı.');
                }

                const link = document.createElement('a');
                link.href = data.signedUrl;
                link.download = attachment.file_name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download file error:', error);
            throw new Error('Dosya indirilemedi: ' + String(error));
        }
    }

    /**
     * Resim önizlemesi için optimized URL döndürür
     */
    static getImagePreviewUrl(attachment: MessageAttachment, width: number = 200): string | null {
        if (!attachment.file_type.startsWith('image/')) {
            return null;
        }

        // Supabase Image Transformation kullanabiliriz
        return `${attachment.file_url}?width=${width}&quality=80`;
    }
}
