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
  // Temel Teklif Bilgileri
  offer_type: 'bid' | 'quote' | 'direct_offer';
  price: string;
  currency: 'TRY' | 'USD' | 'EUR';
  price_per: 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle';
  
  // Nakliye Detayları  
  transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal' | 'negotiable';
  cargo_type: string;
  service_scope: 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only';
  pickup_date_preferred: string;
  delivery_date_preferred: string;
  transit_time_estimate: string;

  // Hizmet Detayları
  customs_handling_included: boolean;
  documentation_handling_included: boolean;
  loading_unloading_included: boolean;
  tracking_system_provided: boolean;
  express_service: boolean;
  weekend_service: boolean;
  fuel_surcharge_included: boolean;
  toll_fees_included: boolean;

  // İletişim ve Şartlar
  contact_person: string;
  contact_phone: string;
  payment_terms: string;
  payment_method: string;
  special_conditions: string;
  message: string;
  
  // Geçerlilik
  expires_at: string;
  valid_until: string;
  
  // Eski alanlar uyumluluk için
  estimated_delivery_time: string;
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
    // Temel Teklif Bilgileri
    offer_type: 'bid',
    price: '',
    currency: 'TRY',
    price_per: 'total',
    
    // Nakliye Detayları
    transport_mode: 'negotiable',
    cargo_type: 'general_cargo',
    service_scope: 'door_to_door',
    pickup_date_preferred: '',
    delivery_date_preferred: '',
    transit_time_estimate: '',

    // Hizmet Detayları
    customs_handling_included: false,
    documentation_handling_included: false,
    loading_unloading_included: false,
    tracking_system_provided: true,
    express_service: false,
    weekend_service: false,
    fuel_surcharge_included: false,
    toll_fees_included: false,

    // İletişim ve Şartlar
    contact_person: '',
    contact_phone: '',
    payment_terms: '',
    payment_method: '',
    special_conditions: '',
    message: '',
    
    // Geçerlilik
    expires_at: '',
    valid_until: '',
    
    // Eski alanlar uyumluluk için
    estimated_delivery_time: '',
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
        // Temel Teklif Bilgileri
        offer_type: 'bid', // Varsayılan değer - gerçek veri yoksa
        price: offer.price_amount?.toString() || '',
        currency: (offer.price_currency as 'TRY' | 'USD' | 'EUR') || 'TRY',
        price_per: 'total', // Varsayılan değer
        
        // Nakliye Detayları
        transport_mode: 'negotiable', // Varsayılan değer
        cargo_type: 'general_cargo', // Varsayılan değer
        service_scope: 'door_to_door', // Varsayılan değer
        pickup_date_preferred: '',
        delivery_date_preferred: '',
        transit_time_estimate: offer.service_description || '',

        // Hizmet Detayları
        customs_handling_included: false,
        documentation_handling_included: false,
        loading_unloading_included: false,
        tracking_system_provided: true,
        express_service: false,
        weekend_service: false,
        fuel_surcharge_included: false,
        toll_fees_included: false,

        // İletişim ve Şartlar
        contact_person: '',
        contact_phone: '',
        payment_terms: '',
        payment_method: '',
        special_conditions: '',
        message: offer.message || '',
        
        // Geçerlilik
        expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().split('T')[0] : '',
        valid_until: '',
        
        // Eski alanlar uyumluluk için
        estimated_delivery_time: offer.service_description || '',
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
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Temel Teklif Bilgileri */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Temel Teklif Bilgileri</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teklif Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Türü *
                  </label>
                  <select
                    value={formData.offer_type}
                    onChange={(e) => updateFormData('offer_type', e.target.value as 'bid' | 'quote' | 'direct_offer')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bid">Teklif (Bid)</option>
                    <option value="quote">Fiyat Teklifi (Quote)</option>
                    <option value="direct_offer">Direkt Teklif</option>
                  </select>
                </div>

                {/* Fiyat Tutarı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Tutarı *
                  </label>
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

                {/* Para Birimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Para Birimi *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateFormData('currency', e.target.value as 'TRY' | 'USD' | 'EUR')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TRY">₺ Türk Lirası (TRY)</option>
                    <option value="USD">$ Amerikan Doları (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>

                {/* Fiyat Birimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat Birimi
                  </label>
                  <select
                    value={formData.price_per}
                    onChange={(e) => updateFormData('price_per', e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="total">Toplam Fiyat</option>
                    <option value="per_km">Kilometreye Göre</option>
                    <option value="per_ton">Tona Göre</option>
                    <option value="per_ton_km">Ton-Kilometreye Göre</option>
                    <option value="per_pallet">Palet Başına</option>
                    <option value="per_hour">Saatlik</option>
                    <option value="per_day">Günlük</option>
                    <option value="per_container">Konteyner Başına</option>
                    <option value="per_teu">TEU Başına</option>
                    <option value="per_cbm">m³ Başına</option>
                    <option value="per_piece">Adet Başına</option>
                    <option value="per_vehicle">Araç Başına</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Nakliye Detayları */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Nakliye Detayları</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Taşıma Modu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taşıma Modu
                  </label>
                  <select
                    value={formData.transport_mode}
                    onChange={(e) => updateFormData('transport_mode', e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="road">Karayolu</option>
                    <option value="sea">Deniz</option>
                    <option value="air">Hava</option>
                    <option value="rail">Demir Yolu</option>
                    <option value="multimodal">Çok Modlu</option>
                    <option value="negotiable">Görüşülecek</option>
                  </select>
                </div>

                {/* Hizmet Kapsamı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Kapsamı
                  </label>
                  <select
                    value={formData.service_scope}
                    onChange={(e) => updateFormData('service_scope', e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="door_to_door">Kapıdan Kapıya</option>
                    <option value="port_to_port">Limanlar Arası</option>
                    <option value="terminal_to_terminal">Terminal Arası</option>
                    <option value="warehouse_to_warehouse">Depo Arası</option>
                    <option value="pickup_only">Sadece Alış</option>
                    <option value="delivery_only">Sadece Teslimat</option>
                  </select>
                </div>

                {/* Tercih Edilen Alış Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen Alış Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.pickup_date_preferred}
                    onChange={(e) => updateFormData('pickup_date_preferred', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tercih Edilen Teslimat Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen Teslimat Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date_preferred}
                    onChange={(e) => updateFormData('delivery_date_preferred', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tahmini Transit Süresi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahmini Transit Süresi *
                  </label>
                  <input
                    type="text"
                    value={formData.transit_time_estimate}
                    onChange={(e) => updateFormData('transit_time_estimate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="örn: 2-3 gün, 1 hafta"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Hizmet Detayları */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-semibold text-gray-900">Hizmet Detayları</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dahil Edilen Hizmetler */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Dahil Edilen Hizmetler</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.customs_handling_included}
                        onChange={(e) => updateFormData('customs_handling_included', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Gümrük İşlemleri</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.documentation_handling_included}
                        onChange={(e) => updateFormData('documentation_handling_included', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Dokümantasyon</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.loading_unloading_included}
                        onChange={(e) => updateFormData('loading_unloading_included', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yükleme/Boşaltma</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.tracking_system_provided}
                        onChange={(e) => updateFormData('tracking_system_provided', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Takip Sistemi</span>
                    </label>
                  </div>
                </div>

                {/* Ek Hizmetler */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Ek Hizmetler</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.express_service}
                        onChange={(e) => updateFormData('express_service', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Ekspres Hizmet</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.weekend_service}
                        onChange={(e) => updateFormData('weekend_service', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Hafta Sonu Hizmeti</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.fuel_surcharge_included}
                        onChange={(e) => updateFormData('fuel_surcharge_included', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yakıt Ek Ücreti Dahil</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.toll_fees_included}
                        onChange={(e) => updateFormData('toll_fees_included', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Geçiş Ücretleri Dahil</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: İletişim ve Şartlar */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-semibold text-gray-900">İletişim ve Şartlar</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İletişim Bilgileri */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">İletişim Bilgileri</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim Kişisi
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => updateFormData('contact_person', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ad Soyad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim Telefonu
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => updateFormData('contact_phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>
                </div>

                {/* Ödeme Şartları */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Ödeme Şartları</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Şartları
                    </label>
                    <select
                      value={formData.payment_terms}
                      onChange={(e) => updateFormData('payment_terms', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="before_loading">Yükleme Öncesi</option>
                      <option value="after_loading">Yükleme Sonrası</option>
                      <option value="after_delivery">Teslimat Sonrası</option>
                      <option value="50_50">%50 Peşin - %50 Teslimat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Yöntemi
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => updateFormData('payment_method', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="cash">Nakit</option>
                      <option value="bank_transfer">Banka Havalesi</option>
                      <option value="credit_card">Kredi Kartı</option>
                      <option value="check">Çek</option>
                    </select>
                  </div>
                </div>

                {/* Teklif Mesajı */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Mesajı *
                  </label>
                  <textarea
                    rows={4}
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
                </div>

                {/* Geçerlilik Tarihleri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklifin Geçerlilik Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => updateFormData('expires_at', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.expires_at ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.expires_at && (
                    <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Geçerlilik Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => updateFormData('valid_until', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Özel Şartlar */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Şartlar ve Notlar
                  </label>
                  <textarea
                    rows={3}
                    value={formData.special_conditions}
                    onChange={(e) => updateFormData('special_conditions', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Ek şartlar, özel durumlar veya notlarınızı buraya yazabilirsiniz..."
                  />
                </div>
              </div>
            </div>
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
