import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Truck, 
  Check,
  Ship,
  Plane,
  Train,
  DollarSign,
  Shield,
  User
} from 'lucide-react';
import { ServiceOfferService } from '../../../../services/serviceOfferService';
import { useAuth } from '../../../../context/SupabaseAuthContext';
import type { ExtendedListing } from '../../../../types/database-types';

interface EnhancedServiceOfferModalProps {
  transportService: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EnhancedServiceOfferFormData {
  // Temel teklif bilgileri
  price_amount: string;
  price_currency: 'TRY' | 'USD' | 'EUR';
  price_per: 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle';
  message: string;
  
  // Taşıma bilgileri
  transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal';
  cargo_type: 'general_cargo' | 'bulk_cargo' | 'container' | 'liquid' | 'dry_bulk' | 'refrigerated' | 'hazardous' | 'oversized' | 'project_cargo' | 'livestock' | 'vehicles' | 'machinery';
  service_scope: 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only';
  
  // Tarih bilgileri
  pickup_date_preferred: string;
  pickup_date_latest: string;
  delivery_date_preferred: string;
  delivery_date_latest: string;
  transit_time_estimate: string;
  expires_at: string;
  
  // Kapasite bilgileri
  weight_capacity_kg: string;
  volume_capacity_m3: string;
  
  // Sigorta ve güvenceler
  insurance_coverage_amount: string;
  insurance_provider: string;
  
  // Hizmet kapsamı
  customs_handling_included: boolean;
  documentation_handling_included: boolean;
  loading_unloading_included: boolean;
  tracking_system_provided: boolean;
  express_service: boolean;
  weekend_service: boolean;
  
  // Ücret dahil edilenler
  fuel_surcharge_included: boolean;
  toll_fees_included: boolean;
  port_charges_included: boolean;
  airport_charges_included: boolean;
  
  // Garantiler
  on_time_guarantee: boolean;
  damage_free_guarantee: boolean;
  temperature_guarantee: boolean;
  
  // İletişim bilgileri
  contact_person: string;
  contact_phone: string;
  emergency_contact: string;
  
  // Ödeme şartları
  payment_terms: string;
  payment_method: string;
  
  // Risk yönetimi
  contingency_plan: string;
}

const EnhancedServiceOfferModal: React.FC<EnhancedServiceOfferModalProps> = ({
  transportService,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<EnhancedServiceOfferFormData>({
    price_amount: '',
    price_currency: 'TRY',
    price_per: 'total',
    message: '',
    transport_mode: transportService.transport_mode || 'road',
    cargo_type: 'general_cargo',
    service_scope: 'door_to_door',
    pickup_date_preferred: '',
    pickup_date_latest: '',
    delivery_date_preferred: '',
    delivery_date_latest: '',
    transit_time_estimate: '',
    expires_at: '',
    weight_capacity_kg: '',
    volume_capacity_m3: '',
    insurance_coverage_amount: '',
    insurance_provider: '',
    customs_handling_included: false,
    documentation_handling_included: false,
    loading_unloading_included: false,
    tracking_system_provided: true,
    express_service: false,
    weekend_service: false,
    fuel_surcharge_included: false,
    toll_fees_included: false,
    port_charges_included: false,
    airport_charges_included: false,
    on_time_guarantee: false,
    damage_free_guarantee: false,
    temperature_guarantee: false,
    contact_person: '',
    contact_phone: '',
    emergency_contact: '',
    payment_terms: 'after_delivery',
    payment_method: 'bank_transfer',
    contingency_plan: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Taşıma moduna göre price_per seçeneklerini ayarla
  const getPricePerOptions = () => {
    const baseOptions = [
      { value: 'total', label: 'Toplam Fiyat' }
    ];

    switch (formData.transport_mode) {
      case 'road':
        return [
          ...baseOptions,
          { value: 'per_km', label: 'Km Başına' },
          { value: 'per_ton', label: 'Ton Başına' },
          { value: 'per_ton_km', label: 'Ton-Km Başına' },
          { value: 'per_pallet', label: 'Palet Başına' },
          { value: 'per_day', label: 'Gün Başına' }
        ];
      case 'sea':
        return [
          ...baseOptions,
          { value: 'per_container', label: 'Konteyner Başına' },
          { value: 'per_teu', label: 'TEU Başına' },
          { value: 'per_ton', label: 'Ton Başına' },
          { value: 'per_cbm', label: 'CBM Başına' }
        ];
      case 'air':
        return [
          ...baseOptions,
          { value: 'per_kg', label: 'Kg Başına' },
          { value: 'per_cbm', label: 'CBM Başına' },
          { value: 'per_piece', label: 'Parça Başına' }
        ];
      case 'rail':
        return [
          ...baseOptions,
          { value: 'per_ton', label: 'Ton Başına' },
          { value: 'per_container', label: 'Konteyner Başına' },
          { value: 'per_vehicle', label: 'Vagon Başına' }
        ];
      default:
        return baseOptions;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Temel validasyonlar
    if (!formData.price_amount || parseFloat(formData.price_amount) <= 0) {
      newErrors.price_amount = 'Geçerli bir fiyat giriniz';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Teklif mesajı giriniz';
    }

    if (!formData.transit_time_estimate.trim()) {
      newErrors.transit_time_estimate = 'Tahmini transit süresi giriniz';
    }

    if (!formData.expires_at) {
      newErrors.expires_at = 'Teklifin geçerlilik tarihi giriniz';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'İletişim kişisi giriniz';
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'İletişim telefonu giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Teklif verebilmek için giriş yapmalısınız');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // ServiceOfferService'e uygun format
      await ServiceOfferService.createServiceOffer({
        user_id: user.id,
        transport_service_id: transportService.id,
        price_amount: parseFloat(formData.price_amount),
        price_currency: formData.price_currency,
        price_per: formData.price_per,
        message: formData.message.trim(),
        
        // Enhanced fields - service_offers tablosuna eklenecek alanlar
        transport_mode: formData.transport_mode,
        cargo_type: formData.cargo_type,
        service_scope: formData.service_scope,
        pickup_date_preferred: formData.pickup_date_preferred || null,
        pickup_date_latest: formData.pickup_date_latest || null,
        delivery_date_preferred: formData.delivery_date_preferred || null,
        delivery_date_latest: formData.delivery_date_latest || null,
        transit_time_estimate: formData.transit_time_estimate,
        expires_at: formData.expires_at,
        
        weight_capacity_kg: formData.weight_capacity_kg ? parseFloat(formData.weight_capacity_kg) : null,
        volume_capacity_m3: formData.volume_capacity_m3 ? parseFloat(formData.volume_capacity_m3) : null,
        
        insurance_coverage_amount: formData.insurance_coverage_amount ? parseFloat(formData.insurance_coverage_amount) : null,
        insurance_provider: formData.insurance_provider || null,
        
        customs_handling_included: formData.customs_handling_included,
        documentation_handling_included: formData.documentation_handling_included,
        loading_unloading_included: formData.loading_unloading_included,
        tracking_system_provided: formData.tracking_system_provided,
        express_service: formData.express_service,
        weekend_service: formData.weekend_service,
        
        fuel_surcharge_included: formData.fuel_surcharge_included,
        toll_fees_included: formData.toll_fees_included,
        port_charges_included: formData.port_charges_included,
        airport_charges_included: formData.airport_charges_included,
        
        on_time_guarantee: formData.on_time_guarantee,
        damage_free_guarantee: formData.damage_free_guarantee,
        temperature_guarantee: formData.temperature_guarantee,
        
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        emergency_contact: formData.emergency_contact || null,
        
        payment_terms: formData.payment_terms,
        payment_method: formData.payment_method,
        contingency_plan: formData.contingency_plan || null
      });

      console.log('✅ Enhanced service offer created successfully');
      alert('Gelişmiş teklifiniz başarıyla gönderildi!');
      
      onClose();
      onSuccess?.();
      
      // Form'u sıfırla
      setFormData({
        price_amount: '',
        price_currency: 'TRY',
        price_per: 'total',
        message: '',
        transport_mode: transportService.transport_mode || 'road',
        cargo_type: 'general_cargo',
        service_scope: 'door_to_door',
        pickup_date_preferred: '',
        pickup_date_latest: '',
        delivery_date_preferred: '',
        delivery_date_latest: '',
        transit_time_estimate: '',
        expires_at: '',
        weight_capacity_kg: '',
        volume_capacity_m3: '',
        insurance_coverage_amount: '',
        insurance_provider: '',
        customs_handling_included: false,
        documentation_handling_included: false,
        loading_unloading_included: false,
        tracking_system_provided: true,
        express_service: false,
        weekend_service: false,
        fuel_surcharge_included: false,
        toll_fees_included: false,
        port_charges_included: false,
        airport_charges_included: false,
        on_time_guarantee: false,
        damage_free_guarantee: false,
        temperature_guarantee: false,
        contact_person: '',
        contact_phone: '',
        emergency_contact: '',
        payment_terms: 'after_delivery',
        payment_method: 'bank_transfer',
        contingency_plan: ''
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('❌ Enhanced service offer creation failed:', error);
      alert(error instanceof Error ? error.message : 'Teklif gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof EnhancedServiceOfferFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'road': return <Truck className="w-5 h-5" />;
      case 'sea': return <Ship className="w-5 h-5" />;
      case 'air': return <Plane className="w-5 h-5" />;
      case 'rail': return <Train className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDefaultExpiryDate = () => {
    const monthFromNow = new Date();
    monthFromNow.setDate(monthFromNow.getDate() + 30); // 30 gün sonra
    return monthFromNow.toISOString().split('T')[0];
  };

  const getMaxExpiryDate = () => {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6); // 6 ay sonra
    return sixMonthsFromNow.toISOString().split('T')[0];
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-12 h-1 ml-2 ${
                  currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <DollarSign className="w-6 h-6 mr-2 text-orange-600" />
        Fiyat ve Temel Bilgiler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fiyat Bilgileri */}
        <div className="space-y-4">
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
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.price_amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0,00"
              />
              <select
                value={formData.price_currency}
                onChange={(e) => updateFormData('price_currency', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="Para birimi seçin"
              >
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
            {errors.price_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.price_amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyatlandırma Biçimi
            </label>
            <select
              value={formData.price_per}
              onChange={(e) => updateFormData('price_per', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Fiyatlandırma biçimi seçin"
            >
              {getPricePerOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Taşıma Modu */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taşıma Modu
            </label>
            <select
              value={formData.transport_mode}
              onChange={(e) => updateFormData('transport_mode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Taşıma modu seçin"
            >
              <option value="road">🚛 Karayolu</option>
              <option value="sea">🚢 Denizyolu</option>
              <option value="air">✈️ Havayolu</option>
              <option value="rail">🚂 Demiryolu</option>
              <option value="multimodal">🔀 Multimodal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yük Türü
            </label>
            <select
              value={formData.cargo_type}
              onChange={(e) => updateFormData('cargo_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Yük türü seçin"
            >
              <option value="general_cargo">Genel Kargo</option>
              <option value="bulk_cargo">Dökme Yük</option>
              <option value="container">Konteyner</option>
              <option value="liquid">Sıvı Yük</option>
              <option value="dry_bulk">Kuru Dökme</option>
              <option value="refrigerated">Soğuk Zincir</option>
              <option value="hazardous">Tehlikeli Madde</option>
              <option value="oversized">Aşırı Boyutlu</option>
              <option value="project_cargo">Proje Kargo</option>
              <option value="livestock">Canlı Hayvan</option>
              <option value="vehicles">Araç Taşıma</option>
              <option value="machinery">Makine/Ekipman</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-orange-600" />
        Tarih ve Süre Bilgileri
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tercih Edilen Başlama Tarihi
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={formData.pickup_date_preferred}
              onChange={(e) => updateFormData('pickup_date_preferred', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              title="Tercih edilen başlama tarihi seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              En Geç Başlama Tarihi
            </label>
            <input
              type="date"
              min={formData.pickup_date_preferred || getMinDate()}
              value={formData.pickup_date_latest}
              onChange={(e) => updateFormData('pickup_date_latest', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              title="En geç başlama tarihi seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tercih Edilen Bitiş Tarihi
            </label>
            <input
              type="date"
              min={formData.pickup_date_preferred || getMinDate()}
              value={formData.delivery_date_preferred}
              onChange={(e) => updateFormData('delivery_date_preferred', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              title="Tercih edilen bitiş tarihi seçin"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              En Geç Bitiş Tarihi
            </label>
            <input
              type="date"
              min={formData.delivery_date_preferred || getMinDate()}
              value={formData.delivery_date_latest}
              onChange={(e) => updateFormData('delivery_date_latest', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              title="En geç bitiş tarihi seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahmini Hizmet Süresi *
            </label>
            <input
              type="text"
              value={formData.transit_time_estimate}
              onChange={(e) => updateFormData('transit_time_estimate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.transit_time_estimate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="örn: 2-3 gün, 1 hafta, sürekli"
            />
            {errors.transit_time_estimate && (
              <p className="mt-1 text-sm text-red-600">{errors.transit_time_estimate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teklifin Geçerlilik Tarihi * 
              <span className="text-gray-500 font-normal">(maksimum 6 ay)</span>
            </label>
            <input
              type="date"
              min={getMinDate()}
              max={getMaxExpiryDate()}
              value={formData.expires_at || getDefaultExpiryDate()}
              onChange={(e) => updateFormData('expires_at', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.expires_at ? 'border-red-300' : 'border-gray-300'
              }`}
              title="Teklifin geçerlilik tarihi seçin (maksimum 6 ay)"
            />
            {errors.expires_at && (
              <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Shield className="w-6 h-6 mr-2 text-orange-600" />
        Hizmetler ve Garantiler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dahil Edilen Hizmetler */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Dahil Edilen Hizmetler</h4>
          <div className="space-y-3">
            {[
              { key: 'loading_unloading_included', label: 'Yükleme/Boşaltma' },
              { key: 'tracking_system_provided', label: 'Takip Sistemi' },
              { key: 'customs_handling_included', label: 'Gümrük İşlemleri' },
              { key: 'documentation_handling_included', label: 'Evrak İşlemleri' },
              { key: 'express_service', label: 'Express Hizmet' },
              { key: 'weekend_service', label: 'Hafta Sonu Hizmeti' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof EnhancedServiceOfferFormData] as boolean}
                    onChange={(e) => updateFormData(key as keyof EnhancedServiceOfferFormData, e.target.checked)}
                    className="sr-only peer"
                    aria-label={`${label} seçeneği`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Garantiler */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Garantiler</h4>
          <div className="space-y-3">
            {[
              { key: 'on_time_guarantee', label: 'Zamanında Teslimat Garantisi' },
              { key: 'damage_free_guarantee', label: 'Hasarsız Teslimat Garantisi' },
              { key: 'temperature_guarantee', label: 'Sıcaklık Garantisi' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof EnhancedServiceOfferFormData] as boolean}
                    onChange={(e) => updateFormData(key as keyof EnhancedServiceOfferFormData, e.target.checked)}
                    className="sr-only peer"
                    aria-label={`${label} seçeneği`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ücrete Dahil Olanlar */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Ücrete Dahil Olanlar</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'fuel_surcharge_included', label: 'Yakıt Ek Ücreti' },
            { key: 'toll_fees_included', label: 'Geçiş Ücretleri' },
            { key: 'port_charges_included', label: 'Liman Ücretleri' },
            { key: 'airport_charges_included', label: 'Havaalanı Ücretleri' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={key}
                checked={formData[key as keyof EnhancedServiceOfferFormData] as boolean}
                onChange={(e) => updateFormData(key as keyof EnhancedServiceOfferFormData, e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor={key} className="text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <User className="w-6 h-6 mr-2 text-orange-600" />
        İletişim ve Mesaj
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* İletişim Bilgileri */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İletişim Kişisi *
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => updateFormData('contact_person', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.contact_person ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ad Soyad"
            />
            {errors.contact_person && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İletişim Telefonu *
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => updateFormData('contact_phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.contact_phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+90 xxx xxx xx xx"
            />
            {errors.contact_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acil Durum İletişim
            </label>
            <input
              type="tel"
              value={formData.emergency_contact}
              onChange={(e) => updateFormData('emergency_contact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="+90 xxx xxx xx xx"
            />
          </div>
        </div>

        {/* Ödeme Bilgileri */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Şartları
            </label>
            <select
              value={formData.payment_terms}
              onChange={(e) => updateFormData('payment_terms', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Ödeme şartları seçin"
            >
              <option value="before_loading">Hizmet Öncesi</option>
              <option value="after_loading">Hizmet Başında</option>
              <option value="after_delivery">Hizmet Sonrası</option>
              <option value="50_50">%50 Peşin - %50 Bitiş</option>
              <option value="30_days">30 Gün Vadeli</option>
              <option value="60_days">60 Gün Vadeli</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Yöntemi
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => updateFormData('payment_method', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Ödeme yöntemi seçin"
            >
              <option value="bank_transfer">Banka Havalesi</option>
              <option value="cash">Nakit</option>
              <option value="check">Çek</option>
              <option value="credit_card">Kredi Kartı</option>
              <option value="letter_of_credit">Akreditif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hizmet Kapsamı
            </label>
            <select
              value={formData.service_scope}
              onChange={(e) => updateFormData('service_scope', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Hizmet kapsamı seçin"
            >
              <option value="door_to_door">Kapıdan Kapıya</option>
              <option value="port_to_port">Limandan Limana</option>
              <option value="terminal_to_terminal">Terminalden Terminale</option>
              <option value="warehouse_to_warehouse">Depodan Depoya</option>
              <option value="pickup_only">Sadece Alım</option>
              <option value="delivery_only">Sadece Teslimat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teklif Mesajı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teklif Mesajı *
        </label>
        <textarea
          rows={6}
          value={formData.message}
          onChange={(e) => updateFormData('message', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
            errors.message ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Nakliye hizmet teklifinizle ilgili detayları, özel durumları ve avantajlarınızı belirtiniz..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      {/* Acil Durum Planı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Acil Durum / Beklenmedik Durum Planı
        </label>
        <textarea
          rows={3}
          value={formData.contingency_plan}
          onChange={(e) => updateFormData('contingency_plan', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          placeholder="Beklenmedik durumlar (hava koşulları, trafik, arıza vb.) için alternatif planlarınızı belirtiniz..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getTransportIcon(formData.transport_mode)}
                <h2 className="text-2xl font-bold text-gray-900">
                  Gelişmiş Nakliye Hizmet Teklifi
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Hizmet Özeti */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nakliye Hizmeti Detayları</h3>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">{transportService.title}</h4>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{transportService.origin} → {transportService.destination}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  {getTransportIcon(transportService.transport_mode)}
                  <span className="ml-2 capitalize">
                    {transportService.transport_mode === 'road' ? 'Karayolu' :
                     transportService.transport_mode === 'sea' ? 'Denizyolu' :
                     transportService.transport_mode === 'air' ? 'Havayolu' :
                     transportService.transport_mode === 'rail' ? 'Demiryolu' :
                     transportService.transport_mode}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{transportService.owner_name || 'Hizmet Sahibi'}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Content */}
            <div className="min-h-[500px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {currentStep > 1 ? 'Önceki Adım' : 'İptal'}
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Sonraki Adım
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Teklifi Gönder</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedServiceOfferModal;
