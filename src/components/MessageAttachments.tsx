import React, { useState, useEffect, useCallback } from 'react';
import { MessageAttachmentService, MessageAttachment } from '../services/messageAttachmentService';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';

interface MessageAttachmentsProps {
    messageId: string;
}

const MessageAttachments: React.FC<MessageAttachmentsProps> = ({ messageId }) => {
    const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAttachments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await MessageAttachmentService.getMessageAttachments(messageId);

            if (fetchError) {
                setError(fetchError);
            } else {
                setAttachments(data || []);
            }
        } catch (err) {
            setError('Dosyalar yüklenirken hata oluştu.');
            console.error('Load attachments error:', err);
        } finally {
            setLoading(false);
        }
    }, [messageId]);

    useEffect(() => {
        loadAttachments();
    }, [loadAttachments]);

    const handleDownload = async (attachment: MessageAttachment) => {
        try {
            await MessageAttachmentService.downloadFile(attachment);
        } catch (err) {
            console.error('Download error:', err);
            alert('Dosya indirilemedi.');
        }
    };

    if (loading) {
        return (
            <div className="mt-2 flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="ml-2 text-xs text-gray-400">Dosyalar yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded">
                {error}
            </div>
        );
    }

    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2">
            {attachments.map((attachment) => {
                const isImage = attachment.file_type.startsWith('image/');
                const icon = MessageAttachmentService.getFileIcon(attachment.file_type);
                const fileSize = MessageAttachmentService.formatFileSize(attachment.file_size);

                return (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded text-xs">
                        {/* Dosya Icon/Önizleme */}
                        <div className="flex-shrink-0">
                            {isImage ? (
                                <div className="relative">
                                    <img
                                        src={MessageAttachmentService.getImagePreviewUrl(attachment, 40) || attachment.file_url}
                                        alt={attachment.file_name}
                                        className="w-8 h-8 object-cover rounded"
                                        onError={(e) => {
                                            // Resim yüklenemezse icon göster
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <ImageIcon className="h-8 w-8 text-gray-400 hidden" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-lg">
                                    {icon}
                                </div>
                            )}
                        </div>

                        {/* Dosya Bilgileri */}
                        <div className="flex-1 min-w-0">
                            <div className="truncate font-medium text-gray-900">
                                {attachment.file_name}
                            </div>
                            <div className="text-gray-500">
                                {fileSize}
                            </div>
                        </div>

                        {/* İndirme Butonu */}
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                            title="İndir"
                        >
                            <Download className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageAttachments;
