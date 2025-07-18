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
  AlertTriangle,
  Thermometer,
  DollarSign,
  Clock,
  Eye
} from 'lucide-react';
import type { ExtendedListing } from '../../types/database-types';

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
                  <div className="text-gray-900">{listing.load_type || 'Genel Kargo'}</div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-1">Adet</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.quantity || 'Belirtilmemiş'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-1">Ambalaj</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.packaging_type || 'Belirtilmemiş'}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-cyan-100">
                <div className="text-sm font-medium text-cyan-700 mb-1">Taşıma Modu</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.transport_mode === 'road' ? '🚛 Karayolu' :
                   listing.transport_mode === 'sea' ? '🚢 Denizyolu' :
                   listing.transport_mode === 'air' ? '✈️ Havayolu' :
                   listing.transport_mode === 'rail' ? '🚂 Demiryolu' :
                   listing.transport_mode === 'multimodal' ? '🔄 Karma Taşımacılık' :
                   'Belirtilmemiş'}
                </div>
              </div>
              
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
                      {vehicleType}
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

          {/* Özel Koşullar */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
            <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3" />
              Özel Koşullar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`bg-white rounded-lg p-4 border ${listing.temperature_controlled ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <Thermometer className={`h-5 w-5 mr-2 ${listing.temperature_controlled ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${listing.temperature_controlled ? 'text-red-900' : 'text-gray-600'}`}>
                    Sıcaklık Kontrolü
                  </span>
                </div>
                <div className="text-sm mt-1">
                  {listing.temperature_controlled ? 'Gerekli' : 'Gerekli değil'}
                </div>
                {listing.temperature_controlled && listing.temperature_range && (
                  <div className="text-xs text-red-600 mt-1">
                    Aralık: {JSON.stringify(listing.temperature_range)}
                  </div>
                )}
              </div>
              
              <div className={`bg-white rounded-lg p-4 border ${listing.humidity_controlled ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-2 ${listing.humidity_controlled ? 'text-red-600' : 'text-gray-400'}`}>💧</div>
                  <span className={`font-medium ${listing.humidity_controlled ? 'text-red-900' : 'text-gray-600'}`}>
                    Nem Kontrolü
                  </span>
                </div>
                <div className="text-sm mt-1">
                  {listing.humidity_controlled ? 'Gerekli' : 'Gerekli değil'}
                </div>
              </div>
              
              <div className={`bg-white rounded-lg p-4 border ${listing.hazardous_materials ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-2 ${listing.hazardous_materials ? 'text-red-600' : 'text-gray-400'}`}>☢️</div>
                  <span className={`font-medium ${listing.hazardous_materials ? 'text-red-900' : 'text-gray-600'}`}>
                    Tehlikeli Madde
                  </span>
                </div>
                <div className="text-sm mt-1">
                  {listing.hazardous_materials ? 'Var' : 'Yok'}
                </div>
              </div>
              
              <div className={`bg-white rounded-lg p-4 border ${listing.fragile_cargo ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-2 ${listing.fragile_cargo ? 'text-red-600' : 'text-gray-400'}`}>⚠️</div>
                  <span className={`font-medium ${listing.fragile_cargo ? 'text-red-900' : 'text-gray-600'}`}>
                    Kırılabilir
                  </span>
                </div>
                <div className="text-sm mt-1">
                  {listing.fragile_cargo ? 'Evet' : 'Hayır'}
                </div>
              </div>
            </div>

            {listing.special_handling_requirements && listing.special_handling_requirements.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-red-100">
                <div className="text-sm font-medium text-red-700 mb-2">Özel Elleçleme Gereksinimleri</div>
                <div className="space-y-1">
                  {listing.special_handling_requirements.map((requirement, index) => (
                    <div key={index} className="text-sm text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                      {requirement}
                    </div>
                  ))}
                </div>
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

          {/* Sigorta ve Gümrük */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-3" />
              Sigorta ve Gümrük
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`bg-white rounded-lg p-4 border ${listing.insurance_required ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                <div className="text-sm font-medium text-indigo-700 mb-1">Sigorta</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.insurance_required ? 'Gerekli' : 'Gerekli değil'}
                </div>
                {listing.insurance_required && listing.insurance_value && (
                  <div className="text-sm text-indigo-600 mt-1">
                    Değer: {listing.insurance_value.toLocaleString('tr-TR')} {listing.price_currency || 'TRY'}
                  </div>
                )}
              </div>
              
              <div className={`bg-white rounded-lg p-4 border ${listing.customs_clearance_required ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                <div className="text-sm font-medium text-indigo-700 mb-1">Gümrük İşlemleri</div>
                <div className="text-lg font-semibold text-gray-900">
                  {listing.customs_clearance_required ? 'Gerekli' : 'Gerekli değil'}
                </div>
              </div>
            </div>

            {listing.required_documents && listing.required_documents.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-100">
                <div className="text-sm font-medium text-indigo-700 mb-2">Gerekli Evraklar</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listing.required_documents.map((doc, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-indigo-500 mr-2" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

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
