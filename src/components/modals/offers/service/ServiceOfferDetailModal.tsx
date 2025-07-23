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
import type { ExtendedServiceOffer } from '../../../../types/service-offer-types';

interface ServiceOfferDetailModalProps {
  offer: ExtendedServiceOffer;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const ServiceOfferDetailModal: React.FC<ServiceOfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  currentUserId
}) => {
  if (!isOpen) return null;

  // Kullanıcının rolünü belirle
  const isOfferOwner = offer.user_id === currentUserId;

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatPrice = (amount: number | null, currency: string | null) => {
    if (!amount) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Belirtilmemiş';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 rounded-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Nakliye Hizmeti Teklifi</h2>
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
            <div className="xl:col-span-2 space-y-8">
              {/* Teklif Özeti */}
              <div className="bg-gradient-to-br from-orange-50 via-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-orange-600 p-2 rounded-lg mr-3">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    Teklif Özeti
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Toplam Tutar</div>
                    <div className="text-4xl font-bold text-orange-600">
                      {formatPrice(offer.price_amount, offer.price_currency)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                        <span className="text-gray-700 font-medium">Teklif Tarihi</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatDate(offer.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {offer.message && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <Truck className="w-5 h-5 text-green-600 mr-3" />
                          <span className="text-gray-700 font-medium">Teklif Mesajı</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{offer.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Teklif Mesajı */}
              {offer.message && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Teklif Mesajı</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">{offer.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Taraf - Nakliye Hizmeti ve Kullanıcı Bilgileri */}
            <div className="space-y-8">
              {/* Nakliye Hizmeti Bilgileri */}
              {offer.transport_service && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Nakliye Hizmeti</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg text-gray-900 mb-3">{offer.transport_service.title}</h4>
                      <div className="flex items-center text-indigo-700 font-semibold">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{offer.transport_service.origin} → {offer.transport_service.destination}</span>
                      </div>
                    </div>

                    {offer.transport_service.vehicle_type && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Araç Tipi</div>
                        <div className="font-semibold text-gray-900">{offer.transport_service.vehicle_type}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teklif Veren Bilgileri */}
              {offer.sender && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isOfferOwner ? 'Sizin Bilgileriniz' : 'Teklif Veren'}
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        {offer.sender.avatar_url ? (
                          <img
                            src={offer.sender.avatar_url}
                            alt={offer.sender.full_name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-xl text-gray-900">{offer.sender.full_name}</h4>
                          {offer.sender.company_name && (
                            <p className="text-lg text-gray-700 font-medium">{offer.sender.company_name}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                              <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                              <span className="font-bold text-yellow-700">{offer.sender.rating || 0}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center bg-gray-50 rounded-xl p-4">
                        <Mail className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-600">E-posta</div>
                          <div className="font-semibold text-gray-900">{offer.sender.email}</div>
                        </div>
                      </div>
                      {offer.sender.phone && (
                        <div className="flex items-center bg-gray-50 rounded-xl p-4">
                          <Phone className="w-5 h-5 mr-3 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Telefon</div>
                            <div className="font-semibold text-gray-900">{offer.sender.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOfferDetailModal;
