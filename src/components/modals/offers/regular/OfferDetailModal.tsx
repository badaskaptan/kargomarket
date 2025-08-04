import React from 'react';
import { 
  X, 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  User, 
  Phone, 
  Mail,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import type { ExtendedOffer } from '../../../../services/offerService';
import { translateLoadType } from '../../../../utils/translationUtils';
import { supabase } from '../../../../lib/supabase';

interface OfferDetailModalProps {
  offer: ExtendedOffer;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
}

const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  currentUserId,
  onAccept,
  onReject,
  onWithdraw
}) => {
  if (!isOpen) return null;

  // Kullanıcının rolünü belirle
  const isOfferOwner = offer.user_id === currentUserId;
  const isListingOwner = offer.listing?.user_id === currentUserId;
  const canAcceptReject = isListingOwner && offer.status === 'pending';
  const canWithdraw = isOfferOwner && offer.status === 'pending';

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'withdrawn': return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'expired': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Bilinmiyor';
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      case 'withdrawn': return 'Geri Çekildi';
      case 'expired': return 'Süresi Doldu';
      default: return status;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price || !currency) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dosya indirme fonksiyonu
  const downloadFile = async (filePath: string, filename?: string) => {
    try {
      const signedUrl = await getSignedUrl(filePath);
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `document_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      alert('Dosya indirme sırasında bir hata oluştu.');
    }
  };

  // Dosya ismini URL'den çıkarma fonksiyonu
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName.includes('.') ? fileName : `document_${Date.now()}`;
    } catch {
      return `document_${Date.now()}`;
    }
  };

  // Dosya tipini belirleme fonksiyonu
  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'document';
    if (['xls', 'xlsx'].includes(extension || '')) return 'spreadsheet';
    return 'file';
  };

  // Signed URL alma fonksiyonu
  const getSignedUrl = async (filePath: string): Promise<string> => {
    try {
      // Eğer URL tam bir URL ise (http/https ile başlıyorsa) direkt döndür
      if (filePath.startsWith('http')) {
        return filePath;
      }

      // Bucket path'ini parse et (verification-documents/ prefix'ini kaldır)
      let bucketPath = filePath;
      if (filePath.startsWith('verification-documents/')) {
        bucketPath = filePath.replace('verification-documents/', '');
      }

      // Supabase storage'dan signed URL al
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(bucketPath, 3600); // 1 saat geçerli

      if (error) {
        console.error('Signed URL hatası:', error, 'Path:', bucketPath);
        // Hata durumunda public URL dene
        const { data: publicData } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(bucketPath);
        return publicData.publicUrl;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('URL oluşturma hatası:', error);
      return filePath; // Son çare olarak orijinal path'i döndür
    }
  };

  // Dosya önizleme fonksiyonu
  const previewFile = async (filePath: string) => {
    try {
      const signedUrl = await getSignedUrl(filePath);
      
      // Dosya tipini belirle
      const fileType = getFileType(filePath);
      
      if (fileType === 'image') {
        // Resimler için ayrı bir işlem - inline gösterim
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>Resim Önizleme</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    background: #f0f0f0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    min-height: 100vh;
                    font-family: Arial, sans-serif;
                  }
                  img { 
                    max-width: 100%; 
                    max-height: 90vh; 
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    background: white;
                  }
                  .container {
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <img src="${signedUrl}" alt="Dosya Önizleme" onload="document.title='Resim - ' + this.naturalWidth + 'x' + this.naturalHeight" />
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // PDF ve diğer dosyalar için direkt URL'yi aç
        const link = document.createElement('a');
        link.href = signedUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Eğer PDF ise, browser'ın built-in PDF viewer'ını kullan
        if (fileType === 'pdf') {
          link.click();
        } else {
          // Diğer dosya türleri için indirmeyi tetikle
          link.download = getFileNameFromUrl(filePath);
          link.click();
        }
      }
    } catch (error) {
      console.error('Önizleme hatası:', error);
      alert('Dosya önizleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Teklif Detayları</h2>
                <p className="text-gray-600 mt-1">Teklif #{offer.id.slice(0, 8)}</p>
              </div>
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full border-2 ${getStatusColor(offer.status)}`}>
                {getStatusIcon(offer.status)}
                <span className="text-base font-semibold">{getStatusLabel(offer.status)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              title="Kapat"
              aria-label="Modalı kapat"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Sol Taraf - Teklif Bilgileri */}
            <div className="xl:col-span-2 space-y-6">
              {/* Teklif Özeti - Ana Kart */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    Teklif Özeti
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Toplam Tutar</div>
                    <div className="text-4xl font-bold text-blue-600">
                      {formatPrice(offer.price_amount, offer.price_currency)}
                    </div>
                    {offer.price_per && (
                      <div className="text-sm text-gray-500 mt-1">
                        {offer.price_per === 'total' ? 'Toplam' :
                         offer.price_per === 'per_kg' ? 'Kg başına' :
                         offer.price_per === 'per_km' ? 'Km başına' :
                         offer.price_per === 'per_m3' ? 'M³ başına' :
                         offer.price_per}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Teklif Tarihi</div>
                    <div className="font-semibold text-gray-900 text-sm">{formatDate(offer.created_at)}</div>
                  </div>
                  
                  {offer.expires_at && (
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Son Geçerlilik</div>
                      <div className="font-semibold text-gray-900 text-sm">{formatDate(offer.expires_at)}</div>
                    </div>
                  )}
                  
                  {offer.cargo_type && (
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Kargo Tipi</div>
                      <div className="font-semibold text-gray-900 text-sm">{translateLoadType(offer.cargo_type)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 1: Temel Bilgiler */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-600 p-2 rounded-lg mr-3">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">📋 Temel Bilgiler</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Hizmet Açıklaması ve Mesaj */}
                  {(offer.service_description || offer.message) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {offer.service_description && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-2">Hizmet Açıklaması</div>
                          <div className="text-gray-900 leading-relaxed">{offer.service_description}</div>
                        </div>
                      )}
                      
                      {offer.message && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-2">Teklif Mesajı</div>
                          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">{offer.message}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Fiyat ve Ödeme */}
              {(offer.price_breakdown || offer.payment_terms || offer.payment_method) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-emerald-600 p-2 rounded-lg mr-3">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">💰 Fiyat ve Ödeme Detayları</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {offer.price_breakdown && typeof offer.price_breakdown === 'object' && offer.price_breakdown !== null && (
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Fiyat Detayları</div>
                        <div className="space-y-2">
                          {Object.entries(offer.price_breakdown).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="capitalize text-gray-700">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-semibold text-emerald-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(offer.payment_terms || offer.payment_method) && (
                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Ödeme Koşulları</div>
                        <div className="space-y-1">
                          {offer.payment_terms && (
                            <div className="text-gray-900 text-sm">
                              <span className="font-medium">Şartlar:</span> {offer.payment_terms}
                            </div>
                          )}
                          {offer.payment_method && (
                            <div className="text-gray-900 text-sm">
                              <span className="font-medium">Yöntem:</span> {offer.payment_method}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Taşıma ve Zaman */}
              {(offer.transport_mode || offer.pickup_date_preferred || offer.delivery_date_preferred || offer.transit_time_estimate || offer.proposed_dates) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-600 p-2 rounded-lg mr-3">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">🚛 Taşıma ve Zaman Detayları</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Transport Details Grid */}
                    {(offer.transport_mode || offer.pickup_date_preferred || offer.delivery_date_preferred || offer.transit_time_estimate) && (
                      <div className="grid grid-cols-2 gap-3">
                        {offer.transport_mode && (
                          <div className="bg-purple-50 rounded-xl p-3 flex items-center">
                            <Truck className="w-4 h-4 mr-2 text-purple-600" />
                            <div>
                              <div className="text-xs text-gray-600">Taşıma Modu</div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {offer.transport_mode === 'road' ? 'Karayolu' :
                                 offer.transport_mode === 'sea' ? 'Deniz' :
                                 offer.transport_mode === 'air' ? 'Hava' :
                                 offer.transport_mode === 'rail' ? 'Demir Yolu' :
                                 offer.transport_mode === 'multimodal' ? 'Çok Modlu' :
                                 offer.transport_mode}
                              </div>
                            </div>
                          </div>
                        )}

                        {offer.pickup_date_preferred && (
                          <div className="bg-green-50 rounded-xl p-3 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-green-600" />
                            <div>
                              <div className="text-xs text-gray-600">Teslim Alma</div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {new Date(offer.pickup_date_preferred).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        )}

                        {offer.delivery_date_preferred && (
                          <div className="bg-blue-50 rounded-xl p-3 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            <div>
                              <div className="text-xs text-gray-600">Teslimat</div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {new Date(offer.delivery_date_preferred).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        )}

                        {offer.transit_time_estimate && (
                          <div className="bg-orange-50 rounded-xl p-3 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-orange-600" />
                            <div>
                              <div className="text-xs text-gray-600">Transit Süresi</div>
                              <div className="font-semibold text-gray-900 text-sm">{offer.transit_time_estimate}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Önerilen Tarihler */}
                    {offer.proposed_dates && typeof offer.proposed_dates === 'object' && offer.proposed_dates !== null && (
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-3">Önerilen Tarihler</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(offer.proposed_dates).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-gray-700 font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-semibold text-gray-900 text-sm">
                                {typeof value === 'string' && value.includes('T') 
                                  ? new Date(value).toLocaleDateString('tr-TR') 
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Hizmetler ve Özellikler */}
              {(offer.customs_handling_included || offer.documentation_handling_included || 
                offer.loading_unloading_included || offer.tracking_system_provided || 
                offer.express_service || offer.weekend_service) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">✅ Dahil Edilen Hizmetler</h3>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {offer.customs_handling_included && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Gümrük İşlemleri
                        </div>
                      )}
                      {offer.documentation_handling_included && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Evrak İşlemleri
                        </div>
                      )}
                      {offer.loading_unloading_included && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Yükleme/Boşaltma
                        </div>
                      )}
                      {offer.tracking_system_provided && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Takip Sistemi
                        </div>
                      )}
                      {offer.express_service && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ekspres Hizmet
                        </div>
                      )}
                      {offer.weekend_service && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Hafta Sonu Hizmeti
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Şartlar ve Koşullar */}
              {(offer.special_conditions || offer.additional_terms) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-600 p-2 rounded-lg mr-3">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">📋 Şartlar ve Koşullar</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {offer.special_conditions && (
                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Özel Şartlar</div>
                        <div className="text-gray-900 leading-relaxed">{offer.special_conditions}</div>
                      </div>
                    )}
                    
                    {offer.additional_terms && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Ek Şartlar</div>
                        <div className="text-gray-900 leading-relaxed">
                          {typeof offer.additional_terms === 'string' 
                            ? offer.additional_terms
                            : typeof offer.additional_terms === 'object' && offer.additional_terms !== null
                            ? Object.entries(offer.additional_terms).map(([key, value]) => (
                                <div key={key} className="mb-2 flex justify-between">
                                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> 
                                  <span>{typeof value === 'boolean' ? (value ? '✓ Evet' : '✗ Hayır') : String(value)}</span>
                                </div>
                              ))
                            : 'Bilgi bulunamadı'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 6: Belgeler */}
              {(offer.documents_description || (offer.document_urls && offer.document_urls.length > 0) || (offer.image_urls && offer.image_urls.length > 0)) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-600 p-2 rounded-lg mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">📄 Belgeler ve Dokümanlar</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Belge Açıklaması */}
                    {offer.documents_description && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Belge Açıklaması</div>
                        <div className="text-gray-900 leading-relaxed">{offer.documents_description}</div>
                      </div>
                    )}
                    
                    {/* Dokümanlar */}
                    {offer.document_urls && offer.document_urls.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-3">Dokümanlar ({offer.document_urls.length})</div>
                        <div className="grid grid-cols-1 gap-3">
                          {offer.document_urls.map((url, index) => {
                            const fileName = getFileNameFromUrl(url);
                            const fileType = getFileType(url);
                            
                            return (
                              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center flex-1">
                                  <FileText className="w-5 h-5 mr-3 text-blue-600" />
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900 block">
                                      {fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
                                    </span>
                                    <span className="text-xs text-gray-500 capitalize">
                                      {fileType === 'pdf' ? 'PDF Dosyası' :
                                       fileType === 'document' ? 'Word Belgesi' :
                                       fileType === 'spreadsheet' ? 'Excel Dosyası' :
                                       fileType === 'image' ? 'Resim Dosyası' :
                                       'Dosya'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {/* Önizleme Butonu */}
                                  <button
                                    onClick={() => previewFile(url)}
                                    className="bg-blue-500 text-white p-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center"
                                    title="Önizleme"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {/* İndirme Butonu */}
                                  <button
                                    onClick={() => downloadFile(url, fileName)}
                                    className="bg-green-500 text-white p-2 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center"
                                    title="İndir"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {/* Yeni Sekmede Aç */}
                                  <button
                                    onClick={() => previewFile(url)}
                                    className="bg-gray-500 text-white p-2 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center"
                                    title="Yeni sekmede aç"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Resimler */}
                    {offer.image_urls && offer.image_urls.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-3">Resimler ({offer.image_urls.length})</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {offer.image_urls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Resim ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity cursor-pointer"
                                onClick={() => previewFile(url)}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40 rounded-lg">
                                <div className="flex space-x-2">
                                  {/* Önizleme Butonu */}
                                  <button
                                    onClick={() => previewFile(url)}
                                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
                                    title="Büyük göster"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {/* İndirme Butonu */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadFile(url, `resim_${index + 1}_${Date.now()}.jpg`);
                                    }}
                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
                                    title="İndir"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {/* Resim numarası */}
                              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                                {index + 1}/{offer.image_urls?.length || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ek Hizmetler */}
              {offer.additional_services && typeof offer.additional_services === 'object' && offer.additional_services !== null && Object.keys(offer.additional_services).length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-600 p-2 rounded-lg mr-3">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">⭐ Ek Hizmetler</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(offer.additional_services).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-orange-600" />
                          <span className="text-gray-700 font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {typeof value === 'boolean' 
                            ? (value ? '✓ Dahil' : '✗ Dahil Değil')
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Taraf - İlan ve Kullanıcı Bilgileri */}
            <div className="space-y-6">
              {/* İlan Bilgileri */}
              {offer.listing && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">İlan Detayları</h3>
                    </div>
                    {/* İlan Tipi İşareti */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.listing.listing_type === 'load_listing' ? 'bg-blue-100 text-blue-800' :
                      offer.listing.listing_type === 'shipment_request' ? 'bg-green-100 text-green-800' :
                      offer.listing.listing_type === 'transport_service' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.listing.listing_type === 'load_listing' ? 'Yük İlanı' :
                       offer.listing.listing_type === 'shipment_request' ? 'Nakliye Talebi' :
                       offer.listing.listing_type === 'transport_service' ? 'Nakliye Hizmeti' :
                       'İlan'}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Başlık ve Güzergah */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
                      <div className="space-y-2">
                        {/* İlan No */}
                        {offer.listing.listing_number && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">İlan No:</span>
                            <span className="text-xs font-bold text-blue-600">{offer.listing.listing_number}</span>
                          </div>
                        )}
                        
                        {/* Başlık */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Başlık:</span>
                          <span className="text-xs font-bold text-gray-900">{offer.listing.title}</span>
                        </div>
                        
                        {/* Güzergah */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Güzergah:</span>
                          <div className="flex items-center text-indigo-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="font-bold text-xs">{offer.listing.origin} → {offer.listing.destination}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* İlan Detayları Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Yük Bilgileri */}
                      {offer.listing.weight_value && (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-600">Ağırlık</div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {offer.listing.weight_value >= 1000 
                                ? `${(offer.listing.weight_value / 1000).toFixed(0)} ton`
                                : `${offer.listing.weight_value} kg`
                              }
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {offer.listing.volume_value && (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">Hacim</div>
                            <div className="font-semibold text-gray-900 text-sm">{offer.listing.volume_value} m³</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Yükleme Tarihi - Sadece nakliye talebi ve yük ilanı için */}
                      {offer.listing.loading_date && (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                          <div>
                            <div className="text-xs text-gray-600">Yükleme Tarihi</div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {new Date(offer.listing.loading_date).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Taşıma Modu - Sadece nakliye talebi ve nakliye hizmeti için */}
                      {offer.listing.transport_mode && offer.listing.listing_type !== 'load_listing' && (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-purple-600" />
                          <div>
                            <div className="text-xs text-gray-600">Taşıma Modu</div>
                            <div className="font-semibold text-gray-900 text-sm capitalize">
                              {offer.listing.transport_mode === 'road' ? 'Karayolu' :
                               offer.listing.transport_mode === 'sea' ? 'Deniz' :
                               offer.listing.transport_mode === 'air' ? 'Hava' :
                               offer.listing.transport_mode === 'rail' ? 'Demir Yolu' :
                               offer.listing.transport_mode === 'multimodal' ? 'Çok Modlu' :
                               offer.listing.transport_mode === 'negotiable' ? 'Görüşülecek' :
                               offer.listing.transport_mode}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Yük Tipi */}
                    {offer.listing.load_type && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3">
                        <div className="text-xs text-gray-600 mb-1">Yük Tipi</div>
                        <div className="font-semibold text-gray-900 text-sm">{translateLoadType(offer.listing.load_type)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teklif Veren Bilgileri */}
              {offer.carrier && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {isOfferOwner ? 'Sizin Bilgileriniz' : 'Teklif Veren'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Kullanıcı Profil Kartı */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {offer.carrier.avatar_url ? (
                          <img
                            src={offer.carrier.avatar_url}
                            alt={offer.carrier.full_name}
                            className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{offer.carrier.full_name}</h4>
                          {offer.carrier.company_name && (
                            <p className="text-sm text-gray-700 font-medium">{offer.carrier.company_name}</p>
                          )}
                          <div className="flex items-center mt-1">
                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                              <span className="font-bold text-yellow-700 text-sm">{offer.carrier.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="space-y-2">
                      <div className="flex items-center bg-gray-50 rounded-xl p-3">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-600">E-posta</div>
                          <div className="font-semibold text-gray-900 text-sm">{offer.carrier.email}</div>
                        </div>
                      </div>
                      {offer.carrier.phone && (
                        <div className="flex items-center bg-gray-50 rounded-xl p-3">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">Telefon</div>
                            <div className="font-semibold text-gray-900 text-sm">{offer.carrier.phone}</div>
                          </div>
                        </div>
                      )}
                      {/* Teklif için özel iletişim bilgileri */}
                      {offer.contact_person && (
                        <div className="flex items-center bg-blue-50 rounded-xl p-3">
                          <User className="w-4 h-4 mr-2 text-indigo-600" />
                          <div>
                            <div className="text-xs text-gray-600">İletişim Kişisi</div>
                            <div className="font-semibold text-gray-900 text-sm">{offer.contact_person}</div>
                          </div>
                        </div>
                      )}
                      {offer.contact_phone && (
                        <div className="flex items-center bg-green-50 rounded-xl p-3">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">İletişim Telefonu</div>
                            <div className="font-semibold text-gray-900 text-sm">{offer.contact_phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* İlan Sahibi Bilgileri (sadece teklif verense görür) */}
              {isOfferOwner && offer.listing_owner && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-600 p-2 rounded-lg mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">İlan Sahibi</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* İlan Sahibi Profil Kartı */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {offer.listing_owner.avatar_url ? (
                          <img
                            src={offer.listing_owner.avatar_url}
                            alt={offer.listing_owner.full_name}
                            className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{offer.listing_owner.full_name}</h4>
                          {offer.listing_owner.company_name && (
                            <p className="text-sm text-gray-700 font-medium">{offer.listing_owner.company_name}</p>
                          )}
                          <div className="flex items-center mt-1">
                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                              <span className="font-bold text-yellow-700 text-sm">{offer.listing_owner.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="space-y-2">
                      <div className="flex items-center bg-gray-50 rounded-xl p-3">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-600">E-posta</div>
                          <div className="font-semibold text-gray-900 text-sm">{offer.listing_owner.email}</div>
                        </div>
                      </div>
                      {offer.listing_owner.phone && (
                        <div className="flex items-center bg-gray-50 rounded-xl p-3">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">Telefon</div>
                            <div className="font-semibold text-gray-900 text-sm">{offer.listing_owner.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(canAcceptReject || canWithdraw) && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex justify-end gap-4">
                {canWithdraw && (
                  <button
                    onClick={() => onWithdraw?.(offer.id)}
                    className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold flex items-center"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Geri Çek
                  </button>
                )}

                {canAcceptReject && (
                  <>
                    <button
                      onClick={() => onReject?.(offer.id)}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg flex items-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reddet
                    </button>
                    <button
                      onClick={() => onAccept?.(offer.id)}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg flex items-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Kabul Et
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetailModal;
