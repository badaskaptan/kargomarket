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
  FileText,
  Shield,
  DollarSign,
  Zap,
  Timer
} from 'lucide-react';
import type { ExtendedServiceOffer } from '../../../../types/service-offer-types';

interface ServiceOfferDetailModalProps {
  offer: ExtendedServiceOffer;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onWithdraw?: (offerId: string) => Promise<void>;
}

const ServiceOfferDetailModal: React.FC<ServiceOfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  currentUserId,
  onWithdraw
}) => {
  if (!isOpen) return null;

  // Kullanıcının rolünü belirle
  const isOfferOwner = offer.user_id === currentUserId;

  const handleWithdraw = async () => {
    if (!onWithdraw || !isOfferOwner) return;
    
    const confirmed = window.confirm(
      'Teklifinizi geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    );
    
    if (confirmed) {
      try {
        await onWithdraw(offer.id);
        onClose();
      } catch (error) {
        console.error('Teklif geri çekme hatası:', error);
        alert('Teklif geri çekilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'withdrawn':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      case 'countered':
        return <Timer className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Bilinmiyor';
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      case 'withdrawn':
        return 'Geri Çekildi';
      case 'countered':
        return 'Karşı Teklif';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'border-gray-300 bg-gray-50 text-gray-600';
    switch (status) {
      case 'pending':
        return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      case 'accepted':
        return 'border-green-300 bg-green-50 text-green-700';
      case 'rejected':
        return 'border-red-300 bg-red-50 text-red-700';
      case 'withdrawn':
        return 'border-gray-300 bg-gray-50 text-gray-600';
      case 'countered':
        return 'border-blue-300 bg-blue-50 text-blue-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-600';
    }
  };

  const formatPrice = (amount?: number | null, currency?: string | null) => {
    if (!amount) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Belirtilmemiş';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJSON = (data: Record<string, unknown> | null | undefined) => {
    if (!data || Object.keys(data).length === 0) return 'Belirtilmemiş';
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-auto shadow-2xl">
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
            <div className="flex items-center space-x-4">
              {/* Teklifi Geri Çek Butonu - Sadece teklif sahibi için ve pending durumda */}
              {isOfferOwner && offer.status === 'pending' && onWithdraw && (
                <button
                  onClick={handleWithdraw}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  title="Teklifi geri çek"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Teklifi Geri Çek</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                title="Kapat"
                aria-label="Modalı kapat"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Sol Taraf - Teklif Bilgileri */}
            <div className="xl:col-span-2 space-y-8">
              {/* Teklif Özeti ve Temel Bilgiler */}
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
                    <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-gray-700 font-medium">Geçerlilik Süresi</span>
                      </div>
                      <span className="font-semibold text-gray-900">{offer.validity_period ? `${offer.validity_period} gün` : 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-red-600 mr-3" />
                        <span className="text-gray-700 font-medium">Son Geçerlilik Tarihi</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatDate(offer.expires_at)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 rounded-xl p-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 mr-3" />
                        <span className="text-gray-700 font-medium">Durum</span>
                      </div>
                      <span className="font-semibold text-gray-900">{getStatusLabel(offer.status)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {offer.message && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <Mail className="w-5 h-5 text-green-600 mr-3" />
                          <span className="text-gray-700 font-medium">Teklif Mesajı</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{offer.message}</p>
                      </div>
                    )}
                    {offer.service_description && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <Truck className="w-5 h-5 text-indigo-600 mr-3" />
                          <span className="text-gray-700 font-medium">Hizmet Açıklaması</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{offer.service_description}</p>
                      </div>
                    )}
                    {offer.special_conditions && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                          <span className="text-gray-700 font-medium">Özel Koşullar</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{offer.special_conditions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Finansal Bilgiler */}
              <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="bg-green-600 p-2 rounded-lg mr-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  Finansal Detaylar
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Ödeme Şartları</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.payment_terms || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Ödeme Yöntemi</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.payment_method || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Fiyatlandırma Tipi</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.price_per || 'Belirtilmemiş'}</div>
                  </div>
                  {offer.price_breakdown && (
                    <div className="bg-white/60 rounded-xl p-4 md:col-span-2">
                      <span className="text-gray-700 font-medium">Fiyat Dağılımı</span>
                      <div className="font-semibold text-gray-900 mt-1 text-sm">
                        <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{formatJSON(offer.price_breakdown)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lojistik Detaylar */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  Lojistik Bilgileri
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Taşıma Modu</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.transport_mode || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Yük Tipi</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.cargo_type || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Hizmet Kapsamı</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.service_scope || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Tahmini Transit Süre</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.transit_time_estimate || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Ağırlık Kapasitesi (kg)</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.weight_capacity_kg || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Hacim Kapasitesi (m³)</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.volume_capacity_m3 || 'Belirtilmemiş'}</div>
                  </div>
                </div>
              </div>

              {/* Tarih Bilgileri */}
              <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="bg-purple-600 p-2 rounded-lg mr-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  Tarih Planlaması
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Alım Tarihi (Tercih)</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.pickup_date_preferred)}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Teslim Tarihi (Tercih)</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.delivery_date_preferred)}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Alım Son Tarih</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.pickup_date_latest)}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Teslim Son Tarih</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.delivery_date_latest)}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Yanıtlanan Tarih</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.responded_at)}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Geçerli Olacağı Son Tarih</span>
                    <div className="font-semibold text-gray-900 mt-1">{formatDate(offer.valid_until)}</div>
                  </div>
                  {offer.proposed_dates && (
                    <div className="bg-white/60 rounded-xl p-4 md:col-span-2">
                      <span className="text-gray-700 font-medium">Önerilen Tarihler</span>
                      <div className="font-semibold text-gray-900 mt-1 text-sm">
                        <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{formatJSON(offer.proposed_dates)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sigorta ve Güvenlik */}
              <div className="bg-gradient-to-br from-yellow-50 via-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="bg-yellow-600 p-2 rounded-lg mr-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  Sigorta ve Güvenlik
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Sigorta Tutarı</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.insurance_coverage_amount || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Sigorta Sağlayıcı</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.insurance_provider || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Acil Durum İletişim</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.emergency_contact || 'Belirtilmemiş'}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <span className="text-gray-700 font-medium">Acil Durum Planı</span>
                    <div className="font-semibold text-gray-900 mt-1">{offer.contingency_plan || 'Belirtilmemiş'}</div>
                  </div>
                </div>

                {/* Güvenlik Garantileri */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.on_time_guarantee} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Zamanında Teslim Garantisi</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.damage_free_guarantee} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Hasarsız Teslim Garantisi</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.temperature_guarantee} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Sıcaklık Garantisi</span>
                  </label>
                </div>
              </div>

              {/* Dahil Edilen Hizmetler */}
              <div className="bg-gradient-to-br from-teal-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="bg-teal-600 p-2 rounded-lg mr-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  Dahil Edilen Hizmetler
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.customs_handling_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Gümrük İşlemleri</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.documentation_handling_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Evrak İşlemleri</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.loading_unloading_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Yükleme/Boşaltma</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.tracking_system_provided} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Canlı Takip</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.express_service} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Ekspres Servis</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.weekend_service} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Hafta Sonu Servisi</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.fuel_surcharge_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Yakıt Dahil</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.toll_fees_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Köprü/Otoyol Dahil</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.port_charges_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Liman Ücretleri</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white/60 rounded-lg p-3 cursor-default">
                    <input type="checkbox" checked={!!offer.airport_charges_included} readOnly className="pointer-events-none" />
                    <span className="text-sm font-medium">Havalimanı Ücretleri</span>
                  </label>
                </div>

                {/* Ekstra Hizmetler ve Şartlar */}
                {(offer.additional_services || offer.additional_terms) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {offer.additional_services && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">Ekstra Hizmetler</span>
                        <div className="font-semibold text-gray-900 mt-1 text-sm">
                          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{formatJSON(offer.additional_services)}</pre>
                        </div>
                      </div>
                    )}
                    {offer.additional_terms && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">Ekstra Şartlar</span>
                        <div className="font-semibold text-gray-900 mt-1 text-sm">
                          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{formatJSON(offer.additional_terms)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ek Bilgiler */}
              {(offer.attachments || offer.rejection_reason || offer.contact_person || offer.contact_phone) && (
                <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                    <div className="bg-gray-600 p-2 rounded-lg mr-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    Ek Bilgiler
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offer.contact_person && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">İletişim Kişisi</span>
                        <div className="font-semibold text-gray-900 mt-1">{offer.contact_person}</div>
                      </div>
                    )}
                    {offer.contact_phone && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">İletişim Telefonu</span>
                        <div className="font-semibold text-gray-900 mt-1">{offer.contact_phone}</div>
                      </div>
                    )}
                    {offer.rejection_reason && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">Reddetme Sebebi</span>
                        <div className="font-semibold text-gray-900 mt-1">{offer.rejection_reason}</div>
                      </div>
                    )}
                    {offer.attachments && Array.isArray(offer.attachments) && offer.attachments.length > 0 && (
                      <div className="bg-white/60 rounded-xl p-4">
                        <span className="text-gray-700 font-medium">Ekli Dosyalar</span>
                        <div className="font-semibold text-gray-900 mt-1">
                          {offer.attachments.map((attachment: string, index: number) => (
                            <div key={index} className="mb-1">
                              <a 
                                href={attachment} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                Dosya {index + 1}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <div className="flex items-center text-indigo-700 font-semibold mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{offer.transport_service.origin} → {offer.transport_service.destination}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {offer.transport_service.vehicle_type && (
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Araç Tipi</div>
                            <div className="font-semibold text-gray-900">{offer.transport_service.vehicle_type}</div>
                          </div>
                        )}
                        {offer.transport_service.capacity_value && (
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Kapasite</div>
                            <div className="font-semibold text-gray-900">
                              {offer.transport_service.capacity_value} {offer.transport_service.capacity_unit}
                            </div>
                          </div>
                        )}
                        {offer.transport_service.service_number && (
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Hizmet Numarası</div>
                            <div className="font-semibold text-gray-900">{offer.transport_service.service_number}</div>
                          </div>
                        )}
                        {offer.transport_service.company_name && (
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Şirket</div>
                            <div className="font-semibold text-gray-900">{offer.transport_service.company_name}</div>
                          </div>
                        )}
                      </div>
                    </div>
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
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{offer.sender.full_name}</h4>
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

              {/* Hizmet Sahibi Bilgileri (Eğer farklıysa) */}
              {offer.service_owner && offer.service_owner.id !== offer.sender?.id && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-600 p-2 rounded-lg mr-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Hizmet Sahibi</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        {offer.service_owner.avatar_url ? (
                          <img
                            src={offer.service_owner.avatar_url}
                            alt={offer.service_owner.full_name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{offer.service_owner.full_name}</h4>
                          {offer.service_owner.company_name && (
                            <p className="text-lg text-gray-700 font-medium">{offer.service_owner.company_name}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                              <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                              <span className="font-bold text-yellow-700">{offer.service_owner.rating || 0}/5</span>
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
                          <div className="font-semibold text-gray-900">{offer.service_owner.email}</div>
                        </div>
                      </div>
                      {offer.service_owner.phone && (
                        <div className="flex items-center bg-gray-50 rounded-xl p-4">
                          <Phone className="w-5 h-5 mr-3 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Telefon</div>
                            <div className="font-semibold text-gray-900">{offer.service_owner.phone}</div>
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
