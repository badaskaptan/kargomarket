import React from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  Truck, 
  Weight, 
  Ruler, 
  FileText, 
  Shield, 
  DollarSign,
  Clock,
  Eye,
  Download,
  File,
  Image,
  ExternalLink
} from 'lucide-react';
import type { ExtendedListing } from '../../../../types/database-types';
import { translateLoadType, translateDocument, translateVehicleType } from '../../../../utils/translationUtils';

interface LoadListingDetailModalProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Yük İlanı Detay Modal'ı
 * Load Listing tipindeki ilanların tüm detaylarını gösterir
 */
const LoadListingDetailModal: React.FC<LoadListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Tarih formatlama
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Saat formatlama
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'Belirtilmemiş';
    return timeString.slice(0, 5); // HH:MM formatında
  };

  // Durum badge'i
  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' },
      'draft': { label: 'Taslak', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Dosya tipi kontrolü
  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';
    return 'file';
  };

  // Dosya adı çıkarma
  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'Dosya';
  };

  // Dosya indirme
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Yük İlanı Detayı</h2>
                  <p className="text-blue-100 text-sm mt-1">İlan No: {listing.listing_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(listing.status)}
                <button
                  onClick={onClose}
                  title="Kapat"
                  className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Temel Bilgiler */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Temel Bilgiler
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h4>
                {listing.description && (
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700 mb-1">Kategori</div>
                  <div className="text-gray-900">{listing.category || 'Belirtilmemiş'}</div>
                  {listing.subcategory && (
                    <div className="text-sm text-gray-600 mt-1">{listing.subcategory}</div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700 mb-1">Yük Tipi</div>
                  <div className="text-gray-900">{listing.load_type ? translateLoadType(listing.load_type) : 'Genel Kargo'}</div>
                  {listing.load_category && (
                    <div className="text-sm text-gray-600 mt-1">{listing.load_category}</div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700 mb-1">Rol</div>
                  <div className="text-gray-900">
                    {listing.role_type === 'buyer' ? 'Alıcı' : 
                     listing.role_type === 'seller' ? 'Satıcı' : 'Belirtilmemiş'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rota Bilgileri */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
              <MapPin className="h-6 w-6 mr-3" />
              Rota Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <div className="text-sm font-medium text-green-700">Yükleme Noktası</div>
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{listing.origin}</div>
                {listing.origin_details && Object.keys(listing.origin_details).length > 0 && (
                  <div className="text-sm text-gray-600">
                    Detaylar: {JSON.stringify(listing.origin_details)}
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <div className="text-sm font-medium text-green-700">Teslimat Noktası</div>
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{listing.destination}</div>
                {listing.destination_details && Object.keys(listing.destination_details).length > 0 && (
                  <div className="text-sm text-gray-600">
                    Detaylar: {JSON.stringify(listing.destination_details)}
                  </div>
                )}
              </div>
            </div>

            {listing.route_waypoints && Array.isArray(listing.route_waypoints) && listing.route_waypoints.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-green-100">
                <div className="text-sm font-medium text-green-700 mb-2">Ara Duraklar</div>
                <div className="space-y-1">
                  {listing.route_waypoints.map((waypoint, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {index + 1}. {String(waypoint)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Yük Özellikleri */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <Weight className="h-6 w-6 mr-3" />
              Yük Özellikleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-1">Ağırlık</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.weight_value ? `${listing.weight_value} ${listing.weight_unit || 'ton'}` : 'Belirtilmemiş'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-1">Hacim</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.volume_value ? `${listing.volume_value} ${listing.volume_unit || 'm³'}` : 'Belirtilmemiş'}
                </div>
              </div>
            </div>

            {listing.dimensions && Object.keys(listing.dimensions).length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                  <Ruler className="h-4 w-4 mr-2" />
                  Boyutlar
                </div>
                <div className="text-gray-900">
                  {JSON.stringify(listing.dimensions)}
                </div>
              </div>
            )}
          </section>

          {/* Tarih ve Zaman Bilgileri */}
          <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-3" />
              Tarih ve Zaman Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="text-sm font-medium text-orange-700 mb-2">Yükleme</div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="font-semibold">{formatDate(listing.loading_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-orange-500 mr-2" />
                    <span>{formatTime(listing.loading_time)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="text-sm font-medium text-orange-700 mb-2">Teslimat</div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="font-semibold">{formatDate(listing.delivery_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-orange-500 mr-2" />
                    <span>{formatTime(listing.delivery_time)}</span>
                  </div>
                </div>
              </div>
            </div>

            {listing.flexible_dates && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-orange-100">
                <div className="flex items-center text-orange-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Esnek tarihler kabul edilir</span>
                </div>
              </div>
            )}
          </section>

          {/* Taşıma Gereksinimleri */}
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="text-xl font-semibold text-cyan-900 mb-4 flex items-center">
              <Truck className="h-6 w-6 mr-3" />
              Taşıma Gereksinimleri
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-4 border border-cyan-100">
                <div className="text-sm font-medium text-cyan-700 mb-1">Taşıma Sorumluluğu</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.transport_responsible === 'buyer' ? 'Alıcı' :
                   listing.transport_responsible === 'seller' ? 'Satıcı' :
                   listing.transport_responsible === 'carrier' ? 'Taşıyıcı' :
                   listing.transport_responsible === 'negotiable' ? 'Pazarlıklı' :
                   'Belirtilmemiş'}
                </div>
              </div>
            </div>

            {listing.vehicle_types && listing.vehicle_types.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-cyan-100">
                <div className="text-sm font-medium text-cyan-700 mb-2">Araç Tipleri</div>
                <div className="flex flex-wrap gap-2">
                  {listing.vehicle_types.map((vehicleType, index) => (
                    <span key={index} className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                      {translateVehicleType(vehicleType)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.special_requirements && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-cyan-100">
                <div className="text-sm font-medium text-cyan-700 mb-2">Özel Gereksinimler</div>
                <div className="text-gray-900">{listing.special_requirements}</div>
              </div>
            )}
          </section>

          {/* Fiyat Bilgileri */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
              <DollarSign className="h-6 w-6 mr-3" />
              Fiyat Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-sm font-medium text-green-700 mb-1">Teklif Tipi</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.offer_type === 'fixed_price' ? '💰 Sabit Fiyat' :
                   listing.offer_type === 'negotiable' ? '💬 Pazarlıklı' :
                   listing.offer_type === 'auction' ? '🏷️ Müzayede' :
                   listing.offer_type === 'free_quote' ? '📝 Doğrudan Teklif' :
                   'Belirtilmemiş'}
                </div>
              </div>
              
              {listing.price_amount && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="text-sm font-medium text-green-700 mb-1">Fiyat</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {listing.price_amount.toLocaleString('tr-TR')} {listing.price_currency || 'TRY'}
                    {listing.price_per && <span className="text-sm text-gray-600 ml-1">/ {listing.price_per}</span>}
                  </div>
                </div>
              )}
              
              {(listing.budget_min || listing.budget_max) && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="text-sm font-medium text-green-700 mb-1">Bütçe Aralığı</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {listing.budget_min?.toLocaleString('tr-TR')} - {listing.budget_max?.toLocaleString('tr-TR')} {listing.price_currency || 'TRY'}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sigorta */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-3" />
              Sigorta
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className={`bg-white rounded-lg p-4 border ${listing.insurance_required ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                <div className="text-sm font-medium text-indigo-700 mb-1">Sigorta</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.insurance_required ? 'Gerekli' : 'Geliştirme aşamasında'}
                </div>
                {listing.insurance_required && listing.insurance_value && (
                  <div className="text-sm text-indigo-600 mt-1">
                    Değer: {listing.insurance_value.toLocaleString('tr-TR')} {listing.price_currency || 'TRY'}
                  </div>
                )}
              </div>
            </div>

            {listing.required_documents && listing.required_documents.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-100">
                <div className="text-sm font-medium text-indigo-700 mb-2">Gerekli Evraklar</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listing.required_documents.map((doc, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-indigo-500 mr-2" />
                      {translateDocument(doc)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Yüklenen Dosyalar ve Resimler */}
          {((listing.document_urls && listing.document_urls.length > 0) || 
            (listing.image_urls && listing.image_urls.length > 0)) && (
            <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Yüklenen Dosyalar ve Resimler
              </h3>
              
              {/* Resimler */}
              {listing.image_urls && listing.image_urls.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Resimler ({listing.image_urls.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listing.image_urls.map((imageUrl, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <img
                            src={imageUrl}
                            alt={`İlan resmi ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdWMTdBMiAyIDAgMCAwIDUgMTlIMTVNMjEgMTVMMTggMTJMMTUgMTVNMjEgMTlMMTggMTZMMTUgMTkiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate flex-1">
                            {getFileName(imageUrl)}
                          </p>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => window.open(imageUrl, '_blank')}
                              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                              title="Büyük boyutta görüntüle"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDownload(imageUrl, getFileName(imageUrl))}
                              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                              title="İndir"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dökümanlar */}
              {listing.document_urls && listing.document_urls.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <File className="h-5 w-5 mr-2" />
                    Dökümanlar ({listing.document_urls.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {listing.document_urls.map((docUrl, index) => {
                      const fileName = getFileName(docUrl);
                      const fileType = getFileType(docUrl);
                      
                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-purple-100 group hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {fileType === 'document' ? (
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-red-600" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <File className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fileType === 'document' ? 'Döküman' : 'Dosya'}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-3">
                              <button
                                onClick={() => window.open(docUrl, '_blank')}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Görüntüle"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(docUrl, fileName)}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                title="İndir"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* İstatistikler */}
          <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-3" />
              İlan İstatistikleri
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-blue-600">{listing.view_count || 0}</div>
                <div className="text-sm text-gray-600">Görüntülenme</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-green-600">{listing.offer_count || 0}</div>
                <div className="text-sm text-gray-600">Teklif</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-red-600">{listing.favorite_count || 0}</div>
                <div className="text-sm text-gray-600">Favori</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-purple-600">{listing.priority_level || 0}</div>
                <div className="text-sm text-gray-600">Öncelik</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-1">Oluşturulma</div>
                <div className="text-gray-900">{formatDate(listing.created_at)}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-1">Son Güncelleme</div>
                <div className="text-gray-900">{formatDate(listing.updated_at)}</div>
              </div>
            </div>

            {(listing.is_urgent || listing.visibility !== 'public') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.is_urgent && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    🚨 Acil
                  </span>
                )}
                {listing.visibility === 'private' && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    🔒 Özel
                  </span>
                )}
                {listing.visibility === 'premium' && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Premium
                  </span>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoadListingDetailModal;
