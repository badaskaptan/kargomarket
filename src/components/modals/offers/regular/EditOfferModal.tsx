import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Check,
  AlertCircle
} from 'lucide-react';
import type { ExtendedOffer } from '../../../../services/offerService';
import type { Database } from '../../../../types/database-types';

type OfferUpdate = Database['public']['Tables']['offers']['Update'];

interface EditOfferModalProps {
  offer: ExtendedOffer;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerId: string, updates: OfferUpdate) => Promise<void>;
}

interface FormData {
  price: string;
  currency: 'TRY' | 'USD' | 'EUR';
  message: string;
  estimated_delivery_time: string;
  expires_at: string;
  terms_conditions: {
    insurance_included: boolean;
    loading_assistance: boolean;
    unloading_assistance: boolean;
    tracking_available: boolean;
    payment_terms: string;
  };
  additional_services: {
    express_delivery: boolean;
    weekend_delivery: boolean;
    special_handling: boolean;
    customs_clearance: boolean;
  };
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({
  offer,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<FormData>({
    price: '',
    currency: 'TRY',
    message: '',
    estimated_delivery_time: '',
    expires_at: '',
    terms_conditions: {
      insurance_included: false,
      loading_assistance: false,
      unloading_assistance: false,
      tracking_available: true,
      payment_terms: 'after_delivery'
    },
    additional_services: {
      express_delivery: false,
      weekend_delivery: false,
      special_handling: false,
      customs_clearance: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Offer verisi değiştiğinde form'u güncelle
  useEffect(() => {
    if (offer && isOpen) {
      setFormData({
        price: offer.price_amount?.toString() || '',
        currency: (offer.price_currency as 'TRY' | 'USD' | 'EUR') || 'TRY',
        message: offer.message || '',
        estimated_delivery_time: offer.service_description || '',
        expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().split('T')[0] : '',
        terms_conditions: {
          insurance_included: Boolean(offer.additional_terms?.insurance_included) || false,
          loading_assistance: Boolean(offer.additional_terms?.loading_assistance) || false,
          unloading_assistance: Boolean(offer.additional_terms?.unloading_assistance) || false,
          tracking_available: Boolean(offer.additional_terms?.tracking_available) || true,
          payment_terms: String(offer.additional_terms?.payment_terms) || 'after_delivery'
        },
        additional_services: {
          express_delivery: Boolean(offer.additional_services?.express_delivery) || false,
          weekend_delivery: Boolean(offer.additional_services?.weekend_delivery) || false,
          special_handling: Boolean(offer.additional_services?.special_handling) || false,
          customs_clearance: Boolean(offer.additional_services?.customs_clearance) || false
        }
      });
    }
  }, [offer, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Teklif mesajı giriniz';
    }

    if (!formData.estimated_delivery_time.trim()) {
      newErrors.estimated_delivery_time = 'Tahmini teslimat süresi giriniz';
    }

    if (!formData.expires_at) {
      newErrors.expires_at = 'Teklifin geçerlilik tarihi giriniz';
    } else {
      const expiryDate = new Date(formData.expires_at);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expires_at = 'Geçerlilik tarihi gelecekte olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updates: OfferUpdate = {
        price_amount: parseFloat(formData.price),
        price_currency: formData.currency,
        message: formData.message.trim(),
        service_description: formData.estimated_delivery_time.trim(),
        expires_at: formData.expires_at,
        additional_terms: formData.terms_conditions,
        additional_services: formData.additional_services,
        updated_at: new Date().toISOString()
      };

      await onSubmit(offer.id, updates);
      onClose();
    } catch (error) {
      console.error('Offer update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNestedFormData = (section: 'terms_conditions' | 'additional_services', field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMinExpiryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Teklif süresi dolmuşsa uyarı göster
  const isExpired = offer.expires_at && new Date(offer.expires_at) <= new Date();
  const canEdit = offer.status === 'pending' && !isExpired;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Teklif Düzenlenemez</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
              aria-label="Modalı kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-orange-800 font-medium">
                {isExpired ? 'Teklif süresi dolmuş' : 'Teklif artık düzenlenemez'}
              </p>
              <p className="text-orange-700 text-sm mt-1">
                {isExpired 
                  ? 'Süresi dolan teklifler düzenlenemez.'
                  : 'Sadece beklemede olan teklifler düzenlenebilir.'
                }
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Teklifi Düzenle</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
              aria-label="Modalı kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* İlan Özeti */}
          {offer.listing && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Detayları</h3>
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
                      <span>{formatDate(offer.listing.loading_date)}</span>
                    </div>
                  )}
                  {offer.listing.transport_mode && (
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="capitalize">{offer.listing.transport_mode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol Taraf - Ana Teklif Bilgileri */}
              <div className="space-y-6">
                {/* Fiyat ve Para Birimi */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Detayları</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklif Tutarı *
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => updateFormData('price', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.price ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0,00"
                          />
                          {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                          )}
                        </div>
                        <select
                          value={formData.currency}
                          onChange={(e) => updateFormData('currency', e.target.value as 'TRY' | 'USD' | 'EUR')}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          title="Para birimi seçin"
                          aria-label="Para birimi"
                        >
                          <option value="TRY">₺ TRY</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahmini Teslimat Süresi *
                      </label>
                      <input
                        type="text"
                        value={formData.estimated_delivery_time}
                        onChange={(e) => updateFormData('estimated_delivery_time', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.estimated_delivery_time ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="örn: 2-3 gün, 1 hafta"
                      />
                      {errors.estimated_delivery_time && (
                        <p className="mt-1 text-sm text-red-600">{errors.estimated_delivery_time}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklifin Geçerlilik Tarihi *
                      </label>
                      <input
                        type="date"
                        min={getMinExpiryDate()}
                        value={formData.expires_at}
                        onChange={(e) => updateFormData('expires_at', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expires_at ? 'border-red-300' : 'border-gray-300'
                        }`}
                        title="Teklifin geçerlilik tarihini seçin"
                        aria-label="Geçerlilik tarihi"
                      />
                      {errors.expires_at && (
                        <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teklif Mesajı */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Mesajı</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      rows={6}
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Teklifinizle ilgili detayları, özel durumları ve size ait avantajları belirtiniz..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Profesyonel bir mesaj, teklif kabul oranınızı artırır.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf - Şartlar ve Ek Hizmetler */}
              <div className="space-y-6">
                {/* Şartlar ve Koşullar */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Şartlar ve Koşullar</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Sigorta Dahil</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.terms_conditions.insurance_included}
                          onChange={(e) => updateNestedFormData('terms_conditions', 'insurance_included', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Sigorta dahil seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Yükleme Yardımı</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.terms_conditions.loading_assistance}
                          onChange={(e) => updateNestedFormData('terms_conditions', 'loading_assistance', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Yükleme yardımı seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Boşaltma Yardımı</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.terms_conditions.unloading_assistance}
                          onChange={(e) => updateNestedFormData('terms_conditions', 'unloading_assistance', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Boşaltma yardımı seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Takip Hizmeti</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.terms_conditions.tracking_available}
                          onChange={(e) => updateNestedFormData('terms_conditions', 'tracking_available', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Takip hizmeti seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Şartları
                      </label>
                      <select
                        value={formData.terms_conditions.payment_terms}
                        onChange={(e) => updateNestedFormData('terms_conditions', 'payment_terms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Ödeme şartlarını seçin"
                        aria-label="Ödeme şartları"
                      >
                        <option value="before_loading">Yükleme Öncesi</option>
                        <option value="after_loading">Yükleme Sonrası</option>
                        <option value="after_delivery">Teslimat Sonrası</option>
                        <option value="50_50">%50 Peşin - %50 Teslimat</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ek Hizmetler */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ek Hizmetler</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Express Teslimat</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additional_services.express_delivery}
                          onChange={(e) => updateNestedFormData('additional_services', 'express_delivery', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Express teslimat seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Hafta Sonu Teslimat</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additional_services.weekend_delivery}
                          onChange={(e) => updateNestedFormData('additional_services', 'weekend_delivery', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Hafta sonu teslimat seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Özel Elleçleme</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additional_services.special_handling}
                          onChange={(e) => updateNestedFormData('additional_services', 'special_handling', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Özel elleçleme seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Gümrük İşlemleri</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additional_services.customs_clearance}
                          onChange={(e) => updateNestedFormData('additional_services', 'customs_clearance', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Gümrük işlemleri seçeneği"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOfferModal;
