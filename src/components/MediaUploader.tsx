import React, { useState, useRef } from 'react';
import { X, FileImage, FileVideo } from 'lucide-react';
import { AdMediaService, UploadResult } from '../services/adMediaService';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
  currentMediaUrl?: string;
  adId: string;
  acceptVideo?: boolean;
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  currentMediaUrl,
  adId,
  acceptVideo = true,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      const result: UploadResult = await AdMediaService.uploadMedia(file, adId);
      
      if (result.success && result.url) {
        onUploadSuccess(result.url);
      } else {
        onUploadError(result.error || 'Dosya yükleme hatası');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError('Beklenmeyen bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveMedia = async () => {
    if (currentMediaUrl) {
      const success = await AdMediaService.deleteMedia(currentMediaUrl);
      if (success) {
        onUploadSuccess(''); // Empty string to remove media
      } else {
        onUploadError('Medya silinirken bir hata oluştu');
      }
    }
  };

  const getAcceptedTypes = () => {
    const imageTypes = 'image/jpeg,image/png,image/gif,image/webp';
    const videoTypes = 'video/mp4,video/webm,video/ogg';
    return acceptVideo ? `${imageTypes},${videoTypes}` : imageTypes;
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  return (
    <div className={`w-full ${className}`}>
      {currentMediaUrl ? (
        <div className="relative group">
          {isVideoUrl(currentMediaUrl) ? (
            <video 
              src={currentMediaUrl} 
              className="w-full h-48 object-cover rounded-lg"
              controls
            />
          ) : (
            <img 
              src={currentMediaUrl} 
              alt="Reklam medyası" 
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          <button
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Medyayı kaldır"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Dosya yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center space-x-2">
                <FileImage className="h-8 w-8 text-gray-400" />
                {acceptVideo && <FileVideo className="h-8 w-8 text-gray-400" />}
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Dosya seç
                </button>
                <span className="text-gray-500"> veya buraya sürükle</span>
              </div>
              
              <p className="text-xs text-gray-500">
                {acceptVideo 
                  ? 'PNG, JPG, GIF, WebP, MP4, WebM, OGG (maks. 10MB)'
                  : 'PNG, JPG, GIF, WebP (maks. 10MB)'
                }
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedTypes()}
            onChange={handleInputChange}
            className="hidden"
            aria-label="Dosya Seç"
            title="Dosya Seç"
          />
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
