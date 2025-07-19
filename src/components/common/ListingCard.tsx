import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  MapPin,
  Package,
  Calendar,
  Truck,
  Ship,
  Plane,
  Train,
  DollarSign,
  Clock
} from 'lucide-react';
import type { ExtendedListing } from '../../types/database-types';
import { translateLoadType, translateVehicleTypes, translateVehicleType, translateTransportMode } from '../../utils/translationUtils';

interface ListingCardProps {
  listing: ExtendedListing;
  onPreview: (listing: ExtendedListing) => void;
  onEdit: (listing: ExtendedListing) => void;
  onDelete: (id: string) => void;
  layout?: 'horizontal' | 'vertical' | 'compact'; // compact layout eklendi
}

/**
 * İlan Kartı Bileşeni
 * Tüm ilan tiplerinde kullanılabilir genel kart yapısı
 */
const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPreview,
  onEdit,
  onDelete,
  layout = 'vertical'
}) => {
  // İlan tipine göre ikon
  const getTypeIcon = () => {
    switch (listing.listing_type) {
      case 'load_listing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipment_request':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'transport_service':
        switch (listing.transport_mode) {
          case 'sea':
            return <Ship className="h-5 w-5 text-blue-500" />;
          case 'air':
            return <Plane className="h-5 w-5 text-sky-500" />;
          case 'rail':
            return <Train className="h-5 w-5 text-purple-500" />;
          default:
            return <Truck className="h-5 w-5 text-orange-500" />;
        }
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  // İlan tipine göre başlık
  const getTypeLabel = () => {
    switch (listing.listing_type) {
      case 'load_listing':
        return 'Yük İlanı';
      case 'shipment_request':
        return 'Nakliye Talebi';
      case 'transport_service':
        return 'Nakliye Hizmeti';
      default:
        return 'İlan';
    }
  };

  // Durum badge
  const getStatusBadge = () => {
    const statusConfig = {
      'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' },
      'draft': { label: 'Taslak', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Tarih formatı
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 ${layout === 'horizontal' ? 'flex items-start gap-6' :
        layout === 'compact' ? 'h-full flex flex-col' : ''
      }`}>

      {/* Sol Taraf - Ana İçerik */}
      <div className={layout === 'horizontal' ? 'flex-1' : ''}>
        {/* Üst Kısım - Tip, Başlık ve Durum */}
        <div className={`${layout === 'compact' ? 'mb-3' : 'mb-4'} flex justify-between items-start`}>
          <div className="flex-1">
            <div className={`flex items-center gap-3 ${layout === 'compact' ? 'mb-1' : 'mb-2'}`}>
              {getTypeIcon()}
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  {getTypeLabel()}
                </div>
                <h3 className={`${layout === 'compact' ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mt-1 line-clamp-2`}>
                  {listing.title}
                </h3>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${layout === 'compact' ? 'mt-1' : 'mt-2'}`}>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block">İlan No</span>
                <p className={`${layout === 'compact' ? 'text-xs' : 'text-sm'} text-gray-600 font-mono`}>
                  {listing.listing_number}
                </p>
              </div>
              {getStatusBadge()}
            </div>
          </div>

          {/* Aksiyon Butonları - Sadece vertical layout'ta görünür */}
          {layout === 'vertical' && (
            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => onPreview(listing)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Önizle"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(listing)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Açıklama */}
        {listing.description && (
          <div className={layout === 'compact' ? 'mb-3' : 'mb-4'}>
            <p className={`${layout === 'compact' ? 'text-xs' : 'text-sm'} text-gray-600 line-clamp-2`}>
              {listing.description}
            </p>
          </div>
        )}

        {/* İlan Detayları */}
        <div className={`${layout === 'horizontal' ? 'grid grid-cols-2 gap-x-6 gap-y-3' :
            layout === 'compact' ? 'space-y-2 flex-1' :
              'space-y-3'
          }`}>
          {/* Rota */}
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
            <div className={layout === 'compact' ? 'text-xs' : 'text-sm'}>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Rota</span>
              <span className="font-medium">{listing.origin}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="font-medium">{listing.destination}</span>
            </div>
          </div>

          {/* Tarih */}
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
            <div className={layout === 'compact' ? 'text-xs' : 'text-sm'}>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">
                {listing.loading_date ? 'Yükleme Tarihi' :
                  listing.available_from_date ? 'Müsait Tarih' : 'Tarih'}
              </span>
              <span>
                {listing.loading_date ? formatDate(listing.loading_date) :
                  listing.available_from_date ? formatDate(listing.available_from_date) :
                    'Belirtilmemiş'}
              </span>
            </div>
          </div>

          {/* Kargo Tipi/Araç Tipi */}
          {(listing.load_type || listing.transport_mode || (listing.listing_type === 'shipment_request' && listing.vehicle_types)) && (
            <div className="flex items-center text-gray-700">
              {listing.listing_type === 'shipment_request' && listing.vehicle_types ?
                <Truck className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" /> :
                <Package className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
              }
              <div className={layout === 'compact' ? 'text-xs' : 'text-sm'}>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">
                  {listing.listing_type === 'shipment_request' && listing.vehicle_types ? 'İstenen Araç Tipleri' :
                    listing.load_type ? 'Yük Tipi' : 'Taşıma Modu'}
                </span>
                <span>
                  {listing.listing_type === 'shipment_request' && listing.vehicle_types ?
                    translateVehicleTypes(listing.vehicle_types) :
                    listing.load_type ? translateLoadType(listing.load_type) :
                      translateTransportMode(listing.transport_mode || 'road')}
                </span>
              </div>
            </div>
          )}

          {/* Kapasite */}
          {(listing.weight_value || listing.volume_value) && (
            <div className="flex items-center text-gray-700">
              <Clock className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
              <div className={layout === 'compact' ? 'text-xs' : 'text-sm'}>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Kapasite</span>
                <div>
                  {listing.weight_value && (
                    <span>{listing.weight_value} {listing.weight_unit}</span>
                  )}
                  {listing.weight_value && listing.volume_value && <span className="mx-2">•</span>}
                  {listing.volume_value && (
                    <span>{listing.volume_value} {listing.volume_unit}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nakliye Hizmeti Ek Bilgileri */}
          {listing.listing_type === 'transport_service' && listing.transport_details && (
            <>
              {/* Araç Tipi */}
              {listing.transport_details.vehicle_type && typeof listing.transport_details.vehicle_type === 'string' && (
                <div className="flex items-center text-gray-700">
                  <Truck className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Araç Tipi</span>
                    <span>{translateVehicleType(listing.transport_details.vehicle_type)}</span>
                  </div>
                </div>
              )}

              {/* Gemi Adı */}
              {listing.transport_details.ship_name && typeof listing.transport_details.ship_name === 'string' && (
                <div className="flex items-center text-gray-700">
                  <Ship className="h-4 w-4 mr-3 text-cyan-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Gemi Adı</span>
                    <span>{listing.transport_details.ship_name}</span>
                  </div>
                </div>
              )}

              {/* IMO Numarası */}
              {listing.transport_details.imo_number && typeof listing.transport_details.imo_number === 'string' && (
                <div className="flex items-center text-gray-700">
                  <Ship className="h-4 w-4 mr-3 text-teal-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">IMO Numarası</span>
                    <span>{listing.transport_details.imo_number}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alt Kısım - Fiyat - Sadece vertical layout'ta */}
        {layout === 'vertical' && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block">Oluşturulma</span>
              <span className="text-xs text-gray-600">{formatDate(listing.created_at)}</span>
            </div>
            <div className="text-right">
              {listing.price_amount ? (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Fiyat</span>
                  <div className="flex items-center text-lg font-semibold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {listing.price_amount.toLocaleString('tr-TR')} {listing.price_currency}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Fiyat</span>
                  <div className="text-sm text-gray-500">Belirtilmemiş</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact Layout Alt Kısmı */}
        {layout === 'compact' && (
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-gray-500">
                <span className="uppercase tracking-wide font-medium block">Oluşturulma</span>
                <span>{formatDate(listing.created_at)}</span>
              </div>
              <div className="text-right">
                {listing.price_amount ? (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block">Fiyat</span>
                    <div className="flex items-center text-sm font-semibold text-green-600">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {listing.price_amount.toLocaleString('tr-TR')} {listing.price_currency}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block">Fiyat</span>
                    <div className="text-xs text-gray-500">Belirtilmemiş</div>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Aksiyon Butonları */}
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => onPreview(listing)}
                className="flex-1 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-center"
                title="Önizle"
              >
                <Eye className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => onEdit(listing)}
                className="flex-1 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-center"
                title="Düzenle"
              >
                <Edit className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className="flex-1 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-center"
                title="Sil"
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sağ Taraf - Sadece horizontal layout'ta */}
      {layout === 'horizontal' && (
        <div className="flex flex-col items-end justify-between min-w-[200px]">
          {/* Fiyat */}
          <div className="text-right mb-4">
            {listing.price_amount ? (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-2">Fiyat</span>
                <div className="flex items-center text-xl font-semibold text-green-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {listing.price_amount.toLocaleString('tr-TR')} {listing.price_currency}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-2">Fiyat</span>
                <div className="text-sm text-gray-500">Belirtilmemiş</div>
              </div>
            )}
            <div className="mt-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Oluşturulma</span>
              <span className="text-xs text-gray-600">{formatDate(listing.created_at)}</span>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPreview(listing)}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Önizle"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEdit(listing)}
              className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(listing.id)}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingCard;
