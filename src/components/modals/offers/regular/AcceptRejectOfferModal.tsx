import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  MapPin,
  Package,
  Calendar,
  Truck,
  User,
  Star
} from 'lucide-react';
import type { ExtendedOffer } from '../../../../services/offerService';

interface AcceptRejectOfferModalProps {
  offer: ExtendedOffer;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (offerId: string, reason?: string) => Promise<void>;
  onReject: (offerId: string, reason?: string) => Promise<void>;
}

const AcceptRejectOfferModal: React.FC<AcceptRejectOfferModalProps> = ({
  offer,
  isOpen,
  onClose,
  onAccept,
  onReject
}) => {
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!action) return;

    setIsSubmitting(true);
    try {
      if (action === 'accept') {
        await onAccept(offer.id, reason.trim() || undefined);
      } else {
        await onReject(offer.id, reason.trim() || undefined);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error(`Offer ${action} failed:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAction(null);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
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
      day: 'numeric'
    });
  };

  if (!action) {
    // İlk adım - Karar verme ekranı
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Teklif Değerlendirme</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Kapat"
                aria-label="Modalı kapat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Teklif Özeti */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Teklif Detayları</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(offer.price_amount, offer.price_currency)}
                </div>
              </div>

              {/* İlan Bilgileri */}
              {offer.listing && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">{offer.listing.title}</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{offer.listing.origin} → {offer.listing.destination}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {offer.listing.weight_value && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{offer.listing.weight_value} {offer.listing.weight_unit || 'kg'}</span>
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
                        <span>{formatDate(offer.listing.loading_date)}</span>
                      </div>
                    )}
                    {offer.listing.transport_mode && (
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">
                          {offer.listing.transport_mode === 'road' ? 'Karayolu' :
                            offer.listing.transport_mode === 'sea' ? 'Deniz' :
                              offer.listing.transport_mode === 'air' ? 'Hava' :
                                offer.listing.transport_mode === 'rail' ? 'Demir Yolu' :
                                  offer.listing.transport_mode === 'multimodal' ? 'Çok Modlu' :
                                    offer.listing.transport_mode === 'negotiable' ? 'Görüşülecek' :
                                      offer.listing.transport_mode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Teklif Veren Bilgileri */}
            {offer.carrier && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Veren</h3>
                <div className="flex items-center space-x-4">
                  {offer.carrier.avatar_url ? (
                    <img
                      src={offer.carrier.avatar_url}
                      alt={offer.carrier.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{offer.carrier.full_name}</h4>
                    {offer.carrier.company_name && (
                      <p className="text-gray-600">{offer.carrier.company_name}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{offer.carrier.rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teklif Detayları */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Özellikleri</h3>
              <div className="space-y-3">
                {offer.service_description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hizmet Açıklaması:</span>
                    <span className="font-medium">{offer.service_description}</span>
                  </div>
                )}
                {offer.message && (
                  <div>
                    <span className="text-gray-600 block mb-2">Mesaj:</span>
                    <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                      {offer.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Karar Butonları */}
            <div className="flex gap-4">
              <button
                onClick={() => setAction('reject')}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <XCircle className="w-5 h-5" />
                <span>Reddet</span>
              </button>
              <button
                onClick={() => setAction('accept')}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Kabul Et</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // İkinci adım - Onay ekranı
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {action === 'accept' ? 'Teklifi Kabul Et' : 'Teklifi Reddet'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
              aria-label="Modalı kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* İkon ve Mesaj */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              action === 'accept' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {action === 'accept' ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {action === 'accept' 
                ? 'Teklifi kabul etmek istediğinizden emin misiniz?' 
                : 'Teklifi reddetmek istediğinizden emin misiniz?'
              }
            </h3>
            
            <p className="text-gray-600 text-sm">
              {formatPrice(offer.price_amount, offer.price_currency)} tutarındaki bu teklif{' '}
              {action === 'accept' ? 'kabul edilecek' : 'reddedilecek'}.
            </p>
          </div>

          {/* Sebep (İsteğe bağlı) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'accept' ? 'Kabul Notu (İsteğe bağlı)' : 'Red Sebebi (İsteğe bağlı)'}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder={action === 'accept' 
                ? 'Kabul nedeninizi belirtebilirsiniz...' 
                : 'Red sebebinizi belirtebilirsiniz...'
              }
            />
          </div>

          {/* Uyarı */}
          {action === 'accept' && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Dikkat!</p>
                <p className="text-yellow-700 mt-1">
                  Teklifi kabul ettikten sonra bu karar geri alınamaz. 
                  Nakliyeci ile iletişime geçerek detayları görüşebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                action === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>İşleniyor...</span>
                </div>
              ) : (
                action === 'accept' ? 'Kabul Et' : 'Reddet'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptRejectOfferModal;
