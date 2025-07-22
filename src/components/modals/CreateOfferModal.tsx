import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Check,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Settings,
  MessageSquare
} from 'lucide-react';
import type { Database } from '../../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];

interface CreateOfferModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: Omit<OfferInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  currentUserId: string;
}

interface FormData {
  // Step 1: Temel Teklif Bilgileri
  offer_type: 'bid' | 'quote' | 'direct_offer';
  price_amount: string;
  price_currency: 'TRY' | 'USD' | 'EUR';
  price_per: 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle';
  
  // Step 2: Nakliye Detayları  
  transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal';
  cargo_type: 'general_cargo' | 'bulk_cargo' | 'container' | 'liquid' | 'dry_bulk' | 'refrigerated' | 'hazardous' | 'oversized' | 'project_cargo' | 'livestock' | 'vehicles' | 'machinery';
  service_scope: 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only';
  pickup_date_preferred: string;
  delivery_date_preferred: string;
  transit_time_estimate: string;
  
  // Step 3: Hizmet Detayları
  customs_handling_included: boolean;
  documentation_handling_included: boolean;
  loading_unloading_included: boolean;
  tracking_system_provided: boolean;
  express_service: boolean;
  weekend_service: boolean;
  fuel_surcharge_included: boolean;
  toll_fees_included: boolean;
  
  // Step 4: İletişim ve Şartlar
  contact_person: string;
  contact_phone: string;
  payment_terms: string;
  payment_method: string;
  special_conditions: string;
  message: string;
  
  // Geçerlilik
  expires_at: string;
  valid_until: string;
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSubmit,
  currentUserId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Temel Teklif Bilgileri
    offer_type: 'bid',
    price_amount: '',
    price_currency: 'TRY',
    price_per: 'total',
    
    // Step 2: Nakliye Detayları
    transport_mode: 'road',
    cargo_type: 'general_cargo',
    service_scope: 'door_to_door',
    pickup_date_preferred: '',
    delivery_date_preferred: '',
    transit_time_estimate: '',
    
    // Step 3: Hizmet Detayları
    customs_handling_included: false,
    documentation_handling_included: false,
    loading_unloading_included: false,
    tracking_system_provided: true,
    express_service: false,
    weekend_service: false,
    fuel_surcharge_included: false,
    toll_fees_included: false,
    
    // Step 4: İletişim ve Şartlar
    contact_person: '',
    contact_phone: '',
    payment_terms: '',
    payment_method: '',
    special_conditions: '',
    message: '',
    
    // Geçerlilik
    expires_at: '',
    valid_until: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.price_amount || parseFloat(formData.price_amount) <= 0) {
        newErrors.price_amount = 'Geçerli bir fiyat giriniz';
      }
      if (!formData.offer_type) {
        newErrors.offer_type = 'Teklif türünü seçiniz';
      }
    }

    if (step === 2) {
      if (!formData.transit_time_estimate.trim()) {
        newErrors.transit_time_estimate = 'Tahmini teslimat süresi giriniz';
      }
      if (!formData.pickup_date_preferred) {
        newErrors.pickup_date_preferred = 'Tercih edilen alış tarihi giriniz';
      }
    }

    if (step === 4) {
      if (!formData.message.trim()) {
        newErrors.message = 'Teklif mesajı giriniz';
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const offerData: Omit<OfferInsert, 'id' | 'created_at' | 'updated_at'> = {
        listing_id: listing.id,
        user_id: currentUserId,
        offer_type: formData.offer_type,
        price_amount: parseFloat(formData.price_amount),
        price_currency: formData.price_currency,
        price_per: formData.price_per,
        message: formData.message.trim(),
        transport_mode: formData.transport_mode,
        cargo_type: formData.cargo_type,
        service_scope: formData.service_scope,
        pickup_date_preferred: formData.pickup_date_preferred || null,
        delivery_date_preferred: formData.delivery_date_preferred || null,
        transit_time_estimate: formData.transit_time_estimate.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        payment_terms: formData.payment_terms || null,
        payment_method: formData.payment_method || null,
        special_conditions: formData.special_conditions.trim() || null,
        expires_at: formData.expires_at || null,
        valid_until: formData.valid_until || null,
        customs_handling_included: formData.customs_handling_included,
        documentation_handling_included: formData.documentation_handling_included,
        loading_unloading_included: formData.loading_unloading_included,
        tracking_system_provided: formData.tracking_system_provided,
        express_service: formData.express_service,
        weekend_service: formData.weekend_service,
        fuel_surcharge_included: formData.fuel_surcharge_included,
        toll_fees_included: formData.toll_fees_included,
        status: 'pending'
      };

      await onSubmit(offerData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Offer submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      // Step 1: Temel Teklif Bilgileri
      offer_type: 'bid',
      price_amount: '',
      price_currency: 'TRY',
      price_per: 'total',
      
      // Step 2: Nakliye Detayları
      transport_mode: 'road',
      cargo_type: 'general_cargo',
      service_scope: 'door_to_door',
      pickup_date_preferred: '',
      delivery_date_preferred: '',
      transit_time_estimate: '',
      
      // Step 3: Hizmet Detayları
      customs_handling_included: false,
      documentation_handling_included: false,
      loading_unloading_included: false,
      tracking_system_provided: true,
      express_service: false,
      weekend_service: false,
      fuel_surcharge_included: false,
      toll_fees_included: false,
      
      // Step 4: İletişim ve Şartlar
      contact_person: '',
      contact_phone: '',
      payment_terms: '',
      payment_method: '',
      special_conditions: '',
      message: '',
      
      // Geçerlilik
      expires_at: '',
      valid_until: ''
    });
    setErrors({});
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Temel Teklif Bilgileri';
      case 2: return 'Nakliye Detayları';
      case 3: return 'Hizmet Detayları';
      case 4: return 'İletişim ve Şartlar';
      default: return '';
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <DollarSign className="w-5 h-5" />;
      case 2: return <Truck className="w-5 h-5" />;
      case 3: return <Settings className="w-5 h-5" />;
      case 4: return <MessageSquare className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultExpiryDate = () => {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return weekFromNow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Teklif Ver</h2>
              <p className="text-gray-500">Adım {currentStep} / {totalSteps} - {getStepTitle(currentStep)}</p>
            </div>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step <= currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < totalSteps && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-colors ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* İlan Özeti */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Detayları</h3>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">{listing.title}</h4>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{listing.origin} → {listing.destination}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {listing.weight_value && (
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{listing.weight_value} kg</span>
                  </div>
                )}
                {listing.volume_value && (
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{listing.volume_value} m³</span>
                  </div>
                )}
                {listing.loading_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(listing.loading_date)}</span>
                  </div>
                )}
                {listing.transport_mode && (
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{listing.transport_mode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Steps */}
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            
            {/* Step 1: Temel Teklif Bilgileri */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {getStepIcon(1)}
                    <h3 className="text-lg font-semibold text-gray-900">Temel Teklif Bilgileri</h3>
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
                        title="Teklif türünü seçin"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="bid">Teklif (Bid)</option>
                        <option value="quote">Fiyat Teklifi (Quote)</option>
                        <option value="direct_offer">Doğrudan Teklif</option>
                      </select>
                      {errors.offer_type && <p className="mt-1 text-sm text-red-600">{errors.offer_type}</p>}
                    </div>

                    {/* Fiyat Türü */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiyat Türü
                      </label>
                      <select
                        value={formData.price_per}
                        onChange={(e) => updateFormData('price_per', e.target.value as 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_container' | 'per_day')}
                        title="Fiyat türünü seçin"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="total">Toplam Fiyat</option>
                        <option value="per_km">Kilometre Başı</option>
                        <option value="per_ton">Ton Başı</option>
                        <option value="per_ton_km">Ton-Kilometre</option>
                        <option value="per_pallet">Palet Başı</option>
                        <option value="per_container">Konteyner Başı</option>
                        <option value="per_day">Gün Başı</option>
                      </select>
                    </div>

                    {/* Fiyat */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklif Tutarı *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={formData.price_amount}
                          onChange={(e) => updateFormData('price_amount', e.target.value)}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.price_amount ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0,00"
                        />
                        <select
                          value={formData.price_currency}
                          onChange={(e) => updateFormData('price_currency', e.target.value as any)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="TRY">₺ TRY</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                        </select>
                      </div>
                      {errors.price_amount && <p className="mt-1 text-sm text-red-600">{errors.price_amount}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Nakliye Detayları */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {getStepIcon(2)}
                    <h3 className="text-lg font-semibold text-gray-900">Nakliye Detayları</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Taşıma Türü */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taşıma Türü
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
                      </select>
                    </div>

                    {/* Kargo Türü */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kargo Türü
                      </label>
                      <select
                        value={formData.cargo_type}
                        onChange={(e) => updateFormData('cargo_type', e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general_cargo">Genel Kargo</option>
                        <option value="bulk_cargo">Dökme Kargo</option>
                        <option value="container">Konteyner</option>
                        <option value="liquid">Sıvı</option>
                        <option value="refrigerated">Soğutmalı</option>
                        <option value="hazardous">Tehlikeli Madde</option>
                        <option value="oversized">Büyük Boy</option>
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
                        Tercih Edilen Alış Tarihi *
                      </label>
                      <input
                        type="date"
                        min={getMinDate()}
                        value={formData.pickup_date_preferred}
                        onChange={(e) => updateFormData('pickup_date_preferred', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.pickup_date_preferred ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pickup_date_preferred && <p className="mt-1 text-sm text-red-600">{errors.pickup_date_preferred}</p>}
                    </div>

                    {/* Tercih Edilen Teslimat Tarihi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tercih Edilen Teslimat Tarihi
                      </label>
                      <input
                        type="date"
                        min={formData.pickup_date_preferred || getMinDate()}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.transit_time_estimate ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="örn: 2-3 gün, 1 hafta"
                      />
                      {errors.transit_time_estimate && <p className="mt-1 text-sm text-red-600">{errors.transit_time_estimate}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Hizmet Detayları */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {getStepIcon(3)}
                    <h3 className="text-lg font-semibold text-gray-900">Dahil Edilen Hizmetler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gümrük İşlemleri */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Gümrük İşlemleri</span>
                        <p className="text-sm text-gray-500">Gümrük işlemleri dahil</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.customs_handling_included}
                          onChange={(e) => updateFormData('customs_handling_included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Döküman İşlemleri */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Döküman İşlemleri</span>
                        <p className="text-sm text-gray-500">Döküman hazırlama ve takip</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.documentation_handling_included}
                          onChange={(e) => updateFormData('documentation_handling_included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Yükleme/Boşaltma */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Yükleme/Boşaltma</span>
                        <p className="text-sm text-gray-500">Manuel yükleme ve boşaltma</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.loading_unloading_included}
                          onChange={(e) => updateFormData('loading_unloading_included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Takip Sistemi */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Takip Sistemi</span>
                        <p className="text-sm text-gray-500">Canlı kargo takip hizmeti</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tracking_system_provided}
                          onChange={(e) => updateFormData('tracking_system_provided', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Express Hizmet */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Express Hizmet</span>
                        <p className="text-sm text-gray-500">Öncelikli ve hızlı teslimat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.express_service}
                          onChange={(e) => updateFormData('express_service', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Hafta Sonu Hizmeti */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Hafta Sonu Hizmeti</span>
                        <p className="text-sm text-gray-500">Cumartesi-Pazar teslimat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.weekend_service}
                          onChange={(e) => updateFormData('weekend_service', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Yakıt Ek Ücreti */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Yakıt Ek Ücreti</span>
                        <p className="text-sm text-gray-500">Yakıt ek ücreti dahil</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.fuel_surcharge_included}
                          onChange={(e) => updateFormData('fuel_surcharge_included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Geçiş Ücretleri */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">Geçiş Ücretleri</span>
                        <p className="text-sm text-gray-500">Köprü, otoyol ücretleri dahil</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.toll_fees_included}
                          onChange={(e) => updateFormData('toll_fees_included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: İletişim ve Şartlar */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {getStepIcon(4)}
                    <h3 className="text-lg font-semibold text-gray-900">İletişim ve Şartlar</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* İletişim Kişisi */}
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

                    {/* İletişim Telefonu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İletişim Telefonu
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => updateFormData('contact_phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+90 (xxx) xxx xx xx"
                      />
                    </div>

                    {/* Ödeme Şartları */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Şartları
                      </label>
                      <input
                        type="text"
                        value={formData.payment_terms}
                        onChange={(e) => updateFormData('payment_terms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="örn: Teslimat sonrası 30 gün"
                      />
                    </div>

                    {/* Ödeme Yöntemi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Yöntemi
                      </label>
                      <input
                        type="text"
                        value={formData.payment_method}
                        onChange={(e) => updateFormData('payment_method', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="örn: Banka havalesi, Nakit"
                      />
                    </div>

                    {/* Geçerlilik Tarihi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklifin Geçerlilik Tarihi *
                      </label>
                      <input
                        type="date"
                        min={getMinDate()}
                        value={formData.expires_at || getDefaultExpiryDate()}
                        onChange={(e) => updateFormData('expires_at', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expires_at ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.expires_at && <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>}
                    </div>

                    {/* Valid Until */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklifin Son Geçerli Tarihi
                      </label>
                      <input
                        type="date"
                        min={formData.expires_at || getMinDate()}
                        value={formData.valid_until}
                        onChange={(e) => updateFormData('valid_until', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Özel Koşullar */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Özel Koşullar
                      </label>
                      <textarea
                        rows={3}
                        value={formData.special_conditions}
                        onChange={(e) => updateFormData('special_conditions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Özel şartlarınızı belirtiniz..."
                      />
                    </div>

                    {/* Teklif Mesajı */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklif Mesajı *
                      </label>
                      <textarea
                        rows={6}
                        value={formData.message}
                        onChange={(e) => updateFormData('message', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                          errors.message ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Teklifinizle ilgili detayları, özel durumları ve avantajlarınızı belirtiniz..."
                      />
                      {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Önceki</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { onClose(); resetForm(); }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  İptal
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>Devam Et</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Teklif Gönder</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal;
