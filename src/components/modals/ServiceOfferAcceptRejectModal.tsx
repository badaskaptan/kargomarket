import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Truck } from 'lucide-react';
import type { ExtendedServiceOffer } from '../../types/service-offer-types';

interface ServiceOfferAcceptRejectModalProps {
    offer: ExtendedServiceOffer;
    isOpen: boolean;
    onClose: () => void;
    onAccept: (offerId: string) => void;
    onReject: (offerId: string) => void;
}

const ServiceOfferAcceptRejectModal: React.FC<ServiceOfferAcceptRejectModalProps> = ({
    offer,
    isOpen,
    onClose,
    onAccept,
    onReject
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const formatPrice = (amount: number | null, currency: string | null) => {
        if (!amount) return 'Belirtilmemiş';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
        }).format(amount);
    };

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            await onAccept(offer.id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await onReject(offer.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 rounded-xl">
                                <Truck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Nakliye Hizmeti Teklifi</h2>
                                <p className="text-gray-600 mt-1">Teklifi değerlendirin</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                            title="Kapat"
                            aria-label="Modalı kapat"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Offer Summary */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {offer.transport_service?.title || 'Nakliye Hizmeti'}
                                    </h3>
                                    {offer.transport_service?.origin && offer.transport_service?.destination && (
                                        <p className="text-gray-700">
                                            {offer.transport_service.origin} → {offer.transport_service.destination}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Teklif Tutarı</div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {formatPrice(offer.price_amount, offer.price_currency)}
                                    </div>
                                </div>
                            </div>

                            {offer.message && (
                                <div className="bg-white/70 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Teklif Mesajı</div>
                                    <p className="text-gray-900 font-medium">{offer.message}</p>
                                </div>
                            )}

                            {offer.sender && (
                                <div className="bg-white/70 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-2">Teklif Veren</div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {offer.sender.full_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{offer.sender.full_name}</div>
                                            {offer.sender.company_name && (
                                                <div className="text-sm text-gray-600">{offer.sender.company_name}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Dikkat!</p>
                            <p>Bu kararınızı geri alamazsınız. Teklifi kabul etmeden önce tüm detayları gözden geçirdiğinizden emin olun.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50"
                        >
                            İptal
                        </button>

                        <button
                            onClick={handleReject}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg disabled:opacity-50 flex items-center"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            {isLoading ? 'Reddediliyor...' : 'Reddet'}
                        </button>

                        <button
                            onClick={handleAccept}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg disabled:opacity-50 flex items-center"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {isLoading ? 'Kabul Ediliyor...' : 'Kabul Et'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOfferAcceptRejectModal;
