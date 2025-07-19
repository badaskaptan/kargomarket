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
  AlertCircle
} from 'lucide-react';
import type { ExtendedOffer } from '../../services/offerService';

interface OfferDetailModalProps {
  offer: ExtendedOffer;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
  onEdit?: (offer: ExtendedOffer) => void;
}

const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  currentUserId,
  onAccept,
  onReject,
  onWithdraw,
  onEdit
}) => {
  if (!isOpen) return null;

  // Kullanıcının rolünü belirle
  const isOfferOwner = offer.user_id === currentUserId;
  const isListingOwner = offer.listing?.user_id === currentUserId;
  const canAcceptReject = isListingOwner && offer.status === 'pending';
  const canWithdraw = isOfferOwner && offer.status === 'pending';
  const canEdit = isOfferOwner && offer.status === 'pending';

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Teklif Detayları</h2>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(offer.status)}`}>
                {getStatusIcon(offer.status)}
                <span className="text-sm font-medium">{getStatusLabel(offer.status)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
              aria-label="Modalı kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Taraf - Teklif Bilgileri */}
            <div className="space-y-6">
              {/* Teklif Özeti */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Özeti</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Teklif Tutarı:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(offer.price_amount, offer.price_currency)}
                    </span>
                  </div>
                  {offer.service_description && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hizmet Açıklaması:</span>
                      <span className="font-medium">{offer.service_description}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Teklif Tarihi:</span>
                    <span className="font-medium">{formatDate(offer.created_at)}</span>
                  </div>
                  {offer.expires_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Son Geçerlilik:</span>
                      <span className="font-medium">{formatDate(offer.expires_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teklif Mesajı */}
              {offer.message && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Teklif Mesajı</h3>
                  <p className="text-gray-700 leading-relaxed">{offer.message}</p>
                </div>
              )}

              {/* Şartlar ve Koşullar */}
              {offer.additional_terms && Object.keys(offer.additional_terms).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Şartlar ve Koşullar</h3>
                  <div className="space-y-2">
                    {Object.entries(offer.additional_terms).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ek Hizmetler */}
              {offer.additional_services && Object.keys(offer.additional_services).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ek Hizmetler</h3>
                  <div className="space-y-2">
                    {Object.entries(offer.additional_services).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{String(value)}</span>
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
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Bilgileri</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{offer.listing.title}</h4>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{offer.listing.origin} → {offer.listing.destination}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {offer.listing.weight_value && (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{offer.listing.weight_value} kg</span>
                        </div>
                      )}
                      {offer.listing.volume_value && (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{offer.listing.volume_value} m³</span>
                        </div>
                      )}
                      {offer.listing.loading_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{new Date(offer.listing.loading_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                      {offer.listing.transport_mode && (
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="capitalize">{offer.listing.transport_mode}</span>
                        </div>
                      )}
                    </div>

                    {offer.listing.load_type && (
                      <div className="text-sm">
                        <span className="text-gray-600">Yük Tipi: </span>
                        <span className="font-medium">{offer.listing.load_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teklif Veren Bilgileri */}
              {offer.carrier && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isOfferOwner ? 'Sizin Bilgileriniz' : 'Teklif Veren'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {offer.carrier.avatar_url ? (
                        <img
                          src={offer.carrier.avatar_url}
                          alt={offer.carrier.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{offer.carrier.full_name}</h4>
                        {offer.carrier.company_name && (
                          <p className="text-sm text-gray-600">{offer.carrier.company_name}</p>
                        )}
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{offer.carrier.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{offer.carrier.email}</span>
                      </div>
                      {offer.carrier.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{offer.carrier.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* İlan Sahibi Bilgileri (sadece teklif verense görür) */}
              {isOfferOwner && offer.listing_owner && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Sahibi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {offer.listing_owner.avatar_url ? (
                        <img
                          src={offer.listing_owner.avatar_url}
                          alt={offer.listing_owner.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{offer.listing_owner.full_name}</h4>
                        {offer.listing_owner.company_name && (
                          <p className="text-sm text-gray-600">{offer.listing_owner.company_name}</p>
                        )}
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{offer.listing_owner.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{offer.listing_owner.email}</span>
                      </div>
                      {offer.listing_owner.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{offer.listing_owner.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(canAcceptReject || canWithdraw || canEdit) && (
            <div className="flex justify-end gap-4 pt-6 border-t">
              {canWithdraw && (
                <button
                  onClick={() => onWithdraw?.(offer.id)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Geri Çek
                </button>
              )}
              
              {canEdit && (
                <button
                  onClick={() => onEdit?.(offer)}
                  className="px-6 py-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors font-medium"
                >
                  Düzenle
                </button>
              )}

              {canAcceptReject && (
                <>
                  <button
                    onClick={() => onReject?.(offer.id)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => onAccept?.(offer.id)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Kabul Et
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetailModal;
