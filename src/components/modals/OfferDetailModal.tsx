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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl">
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
                        <div className="xl:col-span-2 space-y-8">
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
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                                                <span className="text-gray-700 font-medium">Teklif Tarihi</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{formatDate(offer.created_at)}</span>
                                        </div>

                                        {offer.expires_at && (
                                            <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                                                <div className="flex items-center">
                                                    <Clock className="w-5 h-5 text-orange-600 mr-3" />
                                                    <span className="text-gray-700 font-medium">Son Geçerlilik</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">{formatDate(offer.expires_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {offer.service_description && (
                                            <div className="bg-white/60 rounded-xl p-4">
                                                <div className="flex items-center mb-2">
                                                    <Truck className="w-5 h-5 text-green-600 mr-3" />
                                                    <span className="text-gray-700 font-medium">Hizmet Açıklaması</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{offer.service_description}</p>
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

                            {/* Şartlar ve Koşullar */}
                            {offer.additional_terms && Object.keys(offer.additional_terms).length > 0 && (
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-purple-600 p-2 rounded-lg mr-3">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Şartlar ve Koşullar</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(offer.additional_terms).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                                <span className="text-gray-700 font-medium capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-semibold text-gray-900">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ek Hizmetler */}
                            {offer.additional_services && Object.keys(offer.additional_services).length > 0 && (
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-orange-600 p-2 rounded-lg mr-3">
                                            <Star className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Ek Hizmetler</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(offer.additional_services).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                                <span className="text-gray-700 font-medium capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-semibold text-gray-900">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sağ Taraf - İlan ve Kullanıcı Bilgileri */}
                        <div className="space-y-8">
                            {/* İlan Bilgileri */}
                            {offer.listing && (
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                                            <Truck className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">İlan Bilgileri</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                                            <h4 className="font-bold text-lg text-gray-900 mb-3">{offer.listing.title}</h4>
                                            <div className="flex items-center text-indigo-700 font-semibold">
                                                <MapPin className="w-5 h-5 mr-2" />
                                                <span>{offer.listing.origin} → {offer.listing.destination}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {offer.listing.weight_value && (
                                                <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                                                    <Package className="w-5 h-5 mr-3 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Ağırlık</div>
                                                        <div className="font-semibold text-gray-900">{offer.listing.weight_value} kg</div>
                                                    </div>
                                                </div>
                                            )}

                                            {offer.listing.volume_value && (
                                                <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                                                    <Package className="w-5 h-5 mr-3 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Hacim</div>
                                                        <div className="font-semibold text-gray-900">{offer.listing.volume_value} m³</div>
                                                    </div>
                                                </div>
                                            )}

                                            {offer.listing.loading_date && (
                                                <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                                                    <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Yükleme Tarihi</div>
                                                        <div className="font-semibold text-gray-900">
                                                            {new Date(offer.listing.loading_date).toLocaleDateString('tr-TR')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {offer.listing.transport_mode && (
                                                <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                                                    <Truck className="w-5 h-5 mr-3 text-purple-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Taşıma Modu</div>
                                                        <div className="font-semibold text-gray-900 capitalize">{offer.listing.transport_mode}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {offer.listing.load_type && (
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                                                <div className="text-sm text-gray-600 mb-1">Yük Tipi</div>
                                                <div className="font-semibold text-gray-900 text-lg">{offer.listing.load_type}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Teklif Veren Bilgileri */}
                            {offer.carrier && (
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
                                        {/* Kullanıcı Profil Kartı */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                            <div className="flex items-center space-x-4 mb-4">
                                                {offer.carrier.avatar_url ? (
                                                    <img
                                                        src={offer.carrier.avatar_url}
                                                        alt={offer.carrier.full_name}
                                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                                        <User className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-xl text-gray-900">{offer.carrier.full_name}</h4>
                                                    {offer.carrier.company_name && (
                                                        <p className="text-lg text-gray-700 font-medium">{offer.carrier.company_name}</p>
                                                    )}
                                                    <div className="flex items-center mt-2">
                                                        <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                                            <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                                                            <span className="font-bold text-yellow-700">{offer.carrier.rating}/5</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* İletişim Bilgileri */}
                                        <div className="space-y-3">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-4">
                                                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                                                <div>
                                                    <div className="text-sm text-gray-600">E-posta</div>
                                                    <div className="font-semibold text-gray-900">{offer.carrier.email}</div>
                                                </div>
                                            </div>
                                            {offer.carrier.phone && (
                                                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                                                    <Phone className="w-5 h-5 mr-3 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Telefon</div>
                                                        <div className="font-semibold text-gray-900">{offer.carrier.phone}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* İlan Sahibi Bilgileri (sadece teklif verense görür) */}
                            {isOfferOwner && offer.listing_owner && (
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-amber-600 p-2 rounded-lg mr-3">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">İlan Sahibi</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {/* İlan Sahibi Profil Kartı */}
                                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6">
                                            <div className="flex items-center space-x-4 mb-4">
                                                {offer.listing_owner.avatar_url ? (
                                                    <img
                                                        src={offer.listing_owner.avatar_url}
                                                        alt={offer.listing_owner.full_name}
                                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                                                        <User className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-xl text-gray-900">{offer.listing_owner.full_name}</h4>
                                                    {offer.listing_owner.company_name && (
                                                        <p className="text-lg text-gray-700 font-medium">{offer.listing_owner.company_name}</p>
                                                    )}
                                                    <div className="flex items-center mt-2">
                                                        <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                                            <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                                                            <span className="font-bold text-yellow-700">{offer.listing_owner.rating}/5</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* İletişim Bilgileri */}
                                        <div className="space-y-3">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-4">
                                                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                                                <div>
                                                    <div className="text-sm text-gray-600">E-posta</div>
                                                    <div className="font-semibold text-gray-900">{offer.listing_owner.email}</div>
                                                </div>
                                            </div>
                                            {offer.listing_owner.phone && (
                                                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                                                    <Phone className="w-5 h-5 mr-3 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Telefon</div>
                                                        <div className="font-semibold text-gray-900">{offer.listing_owner.phone}</div>
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
