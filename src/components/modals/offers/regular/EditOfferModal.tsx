import React, { useState, useEffect } from 'react';
import {
    X,
    Truck,
    Check,
    ArrowLeft,
    ArrowRight,
    DollarSign,
    Settings,
    MessageSquare
} from 'lucide-react';
import type { ExtendedOffer } from '../../../../services/offerService';
import type { Database } from '../../../../types/database-types';

type OfferUpdate = Database['public']['Tables']['offers']['Update'] & {
  transport_mode?: string | null;
  cargo_type?: string | null;
  service_scope?: string | null;
  pickup_date_preferred?: string | null;
  delivery_date_preferred?: string | null;
  transit_time_estimate?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  customs_handling_included?: boolean | null;
  documentation_handling_included?: boolean | null;
  loading_unloading_included?: boolean | null;
  tracking_system_provided?: boolean | null;
  express_service?: boolean | null;
  weekend_service?: boolean | null;
  fuel_surcharge_included?: boolean | null;
  toll_fees_included?: boolean | null;
  documents_description?: string | null;
};

interface EditOfferModalProps {
    offer: ExtendedOffer;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (offerId: string, updates: OfferUpdate) => Promise<void>;
}

interface FormData {
    // Step 1: Temel Teklif Bilgileri
    offer_type: 'bid' | 'quote' | 'direct_offer';
    price_amount: string;
    price_currency: 'TRY' | 'USD' | 'EUR';
    price_per: 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle';

    // Step 2: Nakliye Detayları  
    transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal' | 'negotiable';
    cargo_type: string;
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
    
    // Evrak Yükleme (Opsiyonel)
    documents_description: string;
    uploaded_documents: File[];

    // Geçerlilik
    expires_at: string;
    valid_until: string;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({
    offer,
    isOpen,
    onClose,
    onSubmit
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
        transport_mode: 'negotiable',
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
        
        // Evrak Yükleme (Opsiyonel)
        documents_description: '',
        uploaded_documents: [],

        // Geçerlilik
        expires_at: '',
        valid_until: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form verilerini offer'dan doldur
    useEffect(() => {
        if (offer && isOpen) {
            const expiresDate = offer.expires_at ? new Date(offer.expires_at).toISOString().split('T')[0] : '';
            const validDate = offer.valid_until ? new Date(offer.valid_until).toISOString().split('T')[0] : '';
            const pickupDate = offer.pickup_date_preferred ? new Date(offer.pickup_date_preferred).toISOString().split('T')[0] : '';
            const deliveryDate = offer.delivery_date_preferred ? new Date(offer.delivery_date_preferred).toISOString().split('T')[0] : '';

            setFormData({
                offer_type: (offer.offer_type as 'bid' | 'quote' | 'direct_offer') || 'bid',
                price_amount: offer.price_amount?.toString() || '',
                price_currency: (offer.price_currency as 'TRY' | 'USD' | 'EUR') || 'TRY',
                price_per: (offer.price_per as 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle') || 'total',
                
                transport_mode: (offer.transport_mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal' | 'negotiable') || 'negotiable',
                cargo_type: offer.cargo_type || 'general_cargo',
                service_scope: (offer.service_scope as 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only') || 'door_to_door',
                pickup_date_preferred: pickupDate,
                delivery_date_preferred: deliveryDate,
                transit_time_estimate: offer.transit_time_estimate || '',

                customs_handling_included: offer.customs_handling_included || false,
                documentation_handling_included: offer.documentation_handling_included || false,
                loading_unloading_included: offer.loading_unloading_included || false,
                tracking_system_provided: offer.tracking_system_provided || false,
                express_service: offer.express_service || false,
                weekend_service: offer.weekend_service || false,
                fuel_surcharge_included: offer.fuel_surcharge_included || false,
                toll_fees_included: offer.toll_fees_included || false,

                contact_person: offer.contact_person || '',
                contact_phone: offer.contact_phone || '',
                payment_terms: offer.payment_terms || '',
                payment_method: offer.payment_method || '',
                special_conditions: offer.special_conditions || '',
                message: offer.message || '',
                documents_description: offer.documents_description || '',
                uploaded_documents: [],
                expires_at: expiresDate,
                valid_until: validDate
            });
        }
    }, [offer, isOpen]);

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
            if (!formData.expires_at) {
                newErrors.expires_at = 'Teklifin geçerlilik tarihi giriniz';
            } else {
                const expiryDate = new Date(formData.expires_at);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (expiryDate < today) {
                    newErrors.expires_at = 'Geçerlilik tarihi bugünden sonra olmalıdır';
                }
            }
            if (!formData.message.trim()) {
                newErrors.message = 'Mesaj alanı zorunludur';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(Math.min(currentStep + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(Math.max(currentStep - 1, 1));
    };

    const updateFormData = (field: keyof FormData, value: string | number | boolean | File[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getDefaultExpiryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // 30 gün sonra
        return date.toISOString().split('T')[0];
    };

    const getStepIcon = (step: number) => {
        const iconProps = { className: "w-6 h-6" };
        switch (step) {
            case 1: return <DollarSign {...iconProps} />;
            case 2: return <Truck {...iconProps} />;
            case 3: return <Settings {...iconProps} />;
            case 4: return <MessageSquare {...iconProps} />;
            default: return <Check {...iconProps} />;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateStep(4)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const updates: OfferUpdate = {
                offer_type: formData.offer_type,
                price_amount: parseFloat(formData.price_amount) || undefined,
                price_currency: formData.price_currency || undefined,
                price_per: formData.price_per,
                transport_mode: formData.transport_mode,
                cargo_type: formData.cargo_type,
                service_scope: formData.service_scope,
                pickup_date_preferred: formData.pickup_date_preferred || null,
                delivery_date_preferred: formData.delivery_date_preferred || null,
                transit_time_estimate: formData.transit_time_estimate || null,
                customs_handling_included: formData.customs_handling_included,
                documentation_handling_included: formData.documentation_handling_included,
                loading_unloading_included: formData.loading_unloading_included,
                tracking_system_provided: formData.tracking_system_provided,
                express_service: formData.express_service,
                weekend_service: formData.weekend_service,
                fuel_surcharge_included: formData.fuel_surcharge_included,
                toll_fees_included: formData.toll_fees_included,
                contact_person: formData.contact_person || null,
                contact_phone: formData.contact_phone || null,
                payment_terms: formData.payment_terms || null,
                payment_method: formData.payment_method || null,
                special_conditions: formData.special_conditions || null,
                message: formData.message || null,
                documents_description: formData.documents_description || null,
                expires_at: formData.expires_at || null,
                valid_until: formData.valid_until || null,
                updated_at: new Date().toISOString()
            };

            await onSubmit(offer.id, updates);
            onClose();
        } catch (error) {
            console.error('Error updating offer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Teklifi Düzenle</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    İlan: {offer.listing?.title || 'Bilinmeyen İlan'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={isSubmitting}
                                title="Modalı kapat"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                            ${currentStep >= step 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'bg-gray-200 text-gray-600'
                                            }
                                        `}>
                                            {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                        </div>
                                        {step < 4 && (
                                            <div className={`h-1 w-20 mx-2 transition-all ${
                                                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-sm text-gray-500">
                                Adım {currentStep} / {totalSteps}
                            </div>
                        </div>
                    </div>

                    {/* Form Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <form onSubmit={handleSubmit} className="p-3 h-full">
                            {/* Step 1: Temel Teklif Bilgileri */}
                            {currentStep === 1 && (
                                <div className="space-y-2">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <div className="flex items-center space-x-3 mb-1">
                                            {getStepIcon(1)}
                                            <h3 className="text-base font-semibold text-gray-900">Temel Teklif Bilgileri</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {/* Teklif Türü */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Teklif Türü *
                                                </label>
                                                <select
                                                    value={formData.offer_type}
                                                    onChange={(e) => updateFormData('offer_type', e.target.value as 'bid' | 'quote' | 'direct_offer')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.offer_type ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    title="Teklif türü seçimi"
                                                >
                                                    <option value="bid">Teklif (Bid)</option>
                                                    <option value="quote">Fiyat Teklifi (Quote)</option>
                                                    <option value="direct_offer">Direkt Teklif</option>
                                                </select>
                                                {errors.offer_type && <p className="mt-1 text-sm text-red-600">{errors.offer_type}</p>}
                                            </div>

                                            {/* Fiyat Tutarı */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Teklif Tutarı *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.price_amount}
                                                    onChange={(e) => updateFormData('price_amount', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.price_amount ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="0.00"
                                                    title="Teklif tutarı"
                                                />
                                                {errors.price_amount && <p className="mt-1 text-sm text-red-600">{errors.price_amount}</p>}
                                            </div>

                                            {/* Para Birimi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Para Birimi *
                                                </label>
                                                <select
                                                    value={formData.price_currency}
                                                    onChange={(e) => updateFormData('price_currency', e.target.value as 'TRY' | 'USD' | 'EUR')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Para birimi seçimi"
                                                >
                                                    <option value="TRY">TRY (₺)</option>
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                </select>
                                            </div>

                                            {/* Fiyat Birimi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Fiyat Birimi *
                                                </label>
                                                <select
                                                    value={formData.price_per}
                                                    onChange={(e) => updateFormData('price_per', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Fiyat birimi seçimi"
                                                >
                                                    <option value="total">Toplam</option>
                                                    <option value="per_km">Kilometre Başına</option>
                                                    <option value="per_ton">Ton Başına</option>
                                                    <option value="per_ton_km">Ton-Km Başına</option>
                                                    <option value="per_pallet">Palet Başına</option>
                                                    <option value="per_hour">Saat Başına</option>
                                                    <option value="per_day">Gün Başına</option>
                                                    <option value="per_container">Konteyner Başına</option>
                                                    <option value="per_teu">TEU Başına</option>
                                                    <option value="per_cbm">M³ Başına</option>
                                                    <option value="per_piece">Parça Başına</option>
                                                    <option value="per_vehicle">Araç Başına</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Nakliye Detayları */}
                            {currentStep === 2 && (
                                <div className="space-y-2">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <div className="flex items-center space-x-3 mb-1">
                                            {getStepIcon(2)}
                                            <h3 className="text-base font-semibold text-gray-900">Nakliye Detayları</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {/* Taşıma Modu */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Taşıma Modu *
                                                </label>
                                                <select
                                                    value={formData.transport_mode}
                                                    onChange={(e) => updateFormData('transport_mode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Taşıma modu seçimi"
                                                >
                                                    <option value="road">Karayolu</option>
                                                    <option value="sea">Denizyolu</option>
                                                    <option value="air">Havayolu</option>
                                                    <option value="rail">Demiryolu</option>
                                                    <option value="multimodal">Çoklu Taşımacılık</option>
                                                    <option value="negotiable">Görüşülecek</option>
                                                </select>
                                            </div>

                                            {/* Kargo Türü */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Kargo Türü
                                                </label>
                                                <select
                                                    value={formData.cargo_type}
                                                    onChange={(e) => updateFormData('cargo_type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Kargo türü seçimi"
                                                >
                                                    <option value="">Seçiniz</option>
                                                    <optgroup label="Genel Kargo / Paletli Ürünler">
                                                      <option value="box_package">📦 Koli / Paket</option>
                                                      <option value="pallet_standard">🏗️ Paletli Yükler - Standart Palet</option>
                                                      <option value="pallet_euro">🇪🇺 Paletli Yükler - Euro Palet</option>
                                                      <option value="pallet_industrial">🏭 Paletli Yükler - Endüstriyel Palet</option>
                                                      <option value="sack_bigbag">🛍️ Çuval / Bigbag (Dökme Olmayan)</option>
                                                      <option value="barrel_drum">🛢️ Varil / Fıçı</option>
                                                      <option value="appliances_electronics">📱 Beyaz Eşya / Elektronik</option>
                                                      <option value="furniture_decor">🪑 Mobilya / Dekorasyon Ürünleri</option>
                                                      <option value="textile_products">👕 Tekstil Ürünleri</option>
                                                      <option value="automotive_parts">🚗 Otomotiv Parçaları / Yedek Parça</option>
                                                      <option value="machinery_parts">⚙️ Makine / Ekipman Parçaları (Büyük Olmayan)</option>
                                                      <option value="construction_materials">🏗️ İnşaat Malzemeleri (Torbalı Çimento, Demir Bağlar vb.)</option>
                                                      <option value="packaged_food">🥫 Ambalajlı Gıda Ürünleri (Kuru Gıda, Konserve vb.)</option>
                                                      <option value="consumer_goods">🛒 Tüketim Ürünleri (Market Ürünleri)</option>
                                                      <option value="ecommerce_cargo">📱 E-ticaret Kargo</option>
                                                      <option value="other_general">📋 Diğer Genel Kargo</option>
                                                    </optgroup>
                                                    <optgroup label="Dökme Yükler">
                                                      <option value="grain">🌾 Tahıl (Buğday, Mısır, Arpa, Pirinç vb.)</option>
                                                      <option value="ore">⛏️ Maden Cevheri (Demir, Bakır, Boksit vb.)</option>
                                                      <option value="coal">⚫ Kömür</option>
                                                      <option value="cement_bulk">🏗️ Çimento (Dökme)</option>
                                                      <option value="sand_gravel">🏖️ Kum / Çakıl</option>
                                                      <option value="fertilizer_bulk">🌱 Gübre (Dökme)</option>
                                                      <option value="soil_excavation">🏗️ Toprak / Hafriyat</option>
                                                      <option value="scrap_metal">♻️ Hurda Metal</option>
                                                      <option value="other_bulk">📋 Diğer Dökme Yükler</option>
                                                    </optgroup>
                                                    <optgroup label="Sıvı Yükler (Dökme Sıvı)">
                                                      <option value="crude_oil">🛢️ Ham Petrol / Petrol Ürünleri</option>
                                                      <option value="chemical_liquids">🧪 Kimyasal Sıvılar (Asit, Baz, Solvent vb.)</option>
                                                      <option value="vegetable_oils">🌻 Bitkisel Yağlar (Ayçiçek Yağı, Zeytinyağı vb.)</option>
                                                      <option value="fuel">⛽ Yakıt (Dizel, Benzin vb.)</option>
                                                      <option value="lpg_lng">🔥 LPG / LNG (Sıvılaştırılmış Gazlar)</option>
                                                      <option value="water">💧 Su (İçme Suyu, Endüstriyel Su)</option>
                                                      <option value="milk_dairy">🥛 Süt / Süt Ürünleri (Dökme)</option>
                                                      <option value="wine_concentrate">🍷 Şarap / İçecek Konsantresi</option>
                                                      <option value="other_liquid">💧 Diğer Sıvı Yükler</option>
                                                    </optgroup>
                                                    <optgroup label="Ağır Yük / Gabari Dışı Yük">
                                                      <option value="tbm">🚇 Tünel Açma Makinesi (TBM)</option>
                                                      <option value="transformer_generator">⚡ Trafo / Jeneratör</option>
                                                      <option value="heavy_machinery">🏗️ Büyük İş Makineleri (Ekskavatör, Vinç vb.)</option>
                                                      <option value="boat_yacht">⛵ Tekne / Yat</option>
                                                      <option value="industrial_parts">🏭 Büyük Endüstriyel Parçalar</option>
                                                      <option value="prefab_elements">🏗️ Prefabrik Yapı Elemanları</option>
                                                      <option value="wind_turbine">💨 Rüzgar Türbini Kanatları / Kuleleri</option>
                                                      <option value="other_oversized">📏 Diğer Gabari Dışı Yükler</option>
                                                    </optgroup>
                                                    <optgroup label="Hassas / Kırılabilir Kargo">
                                                      <option value="art_antiques">🎨 Sanat Eserleri / Antikalar</option>
                                                      <option value="glass_ceramic">🏺 Cam / Seramik Ürünler</option>
                                                      <option value="electronic_devices">💻 Elektronik Cihaz</option>
                                                      <option value="medical_devices">🏥 Tıbbi Cihazlar</option>
                                                      <option value="lab_equipment">🔬 Laboratuvar Ekipmanları</option>
                                                      <option value="flowers_plants">🌸 Çiçek / Canlı Bitki</option>
                                                      <option value="other_sensitive">🔒 Diğer Hassas Kargo</option>
                                                    </optgroup>
                                                    <optgroup label="Tehlikeli Madde (ADR / IMDG / IATA Sınıflandırması)">
                                                      <option value="dangerous_class1">💥 Patlayıcılar (Sınıf 1)</option>
                                                      <option value="dangerous_class2">💨 Gazlar (Sınıf 2)</option>
                                                      <option value="dangerous_class3">🔥 Yanıcı Sıvılar (Sınıf 3)</option>
                                                      <option value="dangerous_class4">🔥 Yanıcı Katılar (Sınıf 4)</option>
                                                      <option value="dangerous_class5">⚗️ Oksitleyici Maddeler (Sınıf 5)</option>
                                                      <option value="dangerous_class6">☠️ Zehirli ve Bulaşıcı Maddeler (Sınıf 6)</option>
                                                      <option value="dangerous_class7">☢️ Radyoaktif Maddeler (Sınıf 7)</option>
                                                      <option value="dangerous_class8">🧪 Aşındırıcı Maddeler (Sınıf 8)</option>
                                                      <option value="dangerous_class9">⚠️ Diğer Tehlikeli Maddeler (Sınıf 9)</option>
                                                    </optgroup>
                                                    <optgroup label="Soğuk Zincir / Isı Kontrollü Yük">
                                                      <option value="frozen_food">🧊 Donmuş Gıda</option>
                                                      <option value="fresh_produce">🥬 Taze Meyve / Sebze</option>
                                                      <option value="meat_dairy">🥩 Et / Süt Ürünleri</option>
                                                      <option value="pharma_vaccine">💊 İlaç / Aşı</option>
                                                      <option value="chemical_temp">🌡️ Kimyasal Maddeler (Isı Kontrollü)</option>
                                                      <option value="other_cold_chain">❄️ Diğer Soğuk Zincir Kargo</option>
                                                    </optgroup>
                                                    <optgroup label="Canlı Hayvan">
                                                      <option value="small_livestock">🐑 Küçük Baş Hayvan (Koyun, Keçi vb.)</option>
                                                      <option value="large_livestock">🐄 Büyük Baş Hayvan (Sığır, At vb.)</option>
                                                      <option value="poultry">🐔 Kanatlı Hayvan</option>
                                                      <option value="pets">🐕 Evcil Hayvan</option>
                                                      <option value="other_livestock">🐾 Diğer Canlı Hayvanlar</option>
                                                    </optgroup>
                                                    <optgroup label="Proje Yükleri">
                                                      <option value="factory_setup">🏭 Fabrika Kurulumu</option>
                                                      <option value="power_plant">⚡ Enerji Santrali Ekipmanları</option>
                                                      <option value="infrastructure">🏗️ Altyapı Proje Malzemeleri</option>
                                                      <option value="other_project">📋 Diğer Proje Yükleri</option>
                                                    </optgroup>
                                                </select>
                                            </div>

                                            {/* Hizmet Kapsamı */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hizmet Kapsamı *
                                                </label>
                                                <select
                                                    value={formData.service_scope}
                                                    onChange={(e) => updateFormData('service_scope', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Hizmet kapsamı seçimi"
                                                >
                                                    <option value="door_to_door">Kapıdan Kapıya</option>
                                                    <option value="port_to_port">Limandan Limana</option>
                                                    <option value="terminal_to_terminal">Terminalden Terminale</option>
                                                    <option value="warehouse_to_warehouse">Depodan Depoya</option>
                                                    <option value="pickup_only">Sadece Toplama</option>
                                                    <option value="delivery_only">Sadece Teslimat</option>
                                                </select>
                                            </div>

                                            {/* Transit Süre Tahmini */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Transit Süre Tahmini *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.transit_time_estimate}
                                                    onChange={(e) => updateFormData('transit_time_estimate', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.transit_time_estimate ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="örn: 2-3 gün, 1 hafta"
                                                    title="Transit süre tahmini"
                                                />
                                                {errors.transit_time_estimate && <p className="mt-1 text-sm text-red-600">{errors.transit_time_estimate}</p>}
                                            </div>

                                            {/* Tercih Edilen Toplama Tarihi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tercih Edilen Toplama Tarihi *
                                                </label>
                                                <input
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={formData.pickup_date_preferred}
                                                    onChange={(e) => updateFormData('pickup_date_preferred', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.pickup_date_preferred ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    title="Tercih edilen toplama tarihi"
                                                />
                                                {errors.pickup_date_preferred && <p className="mt-1 text-sm text-red-600">{errors.pickup_date_preferred}</p>}
                                            </div>

                                            {/* Tercih Edilen Teslimat Tarihi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tercih Edilen Teslimat Tarihi
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.delivery_date_preferred}
                                                    onChange={(e) => updateFormData('delivery_date_preferred', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Tercih edilen teslimat tarihi"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Hizmet Detayları */}
                            {currentStep === 3 && (
                                <div className="space-y-2">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <div className="flex items-center space-x-3 mb-1">
                                            {getStepIcon(3)}
                                            <h3 className="text-base font-semibold text-gray-900">Hizmet Detayları</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Sol Kolon - Temel Hizmetler */}
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-900 text-base border-b border-gray-200 pb-2">Temel Hizmetler</h4>
                                                
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.customs_handling_included}
                                                                onChange={(e) => updateFormData('customs_handling_included', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Gümrük işlemleri seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Gümrük işlemleri dahil</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.documentation_handling_included}
                                                                onChange={(e) => updateFormData('documentation_handling_included', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Dokümantasyon işlemleri seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Dokümantasyon işlemleri dahil</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.loading_unloading_included}
                                                                onChange={(e) => updateFormData('loading_unloading_included', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Yükleme/boşaltma seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Yükleme/boşaltma dahil</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.tracking_system_provided}
                                                                onChange={(e) => updateFormData('tracking_system_provided', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Takip sistemi seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Takip sistemi sağlanır</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Sağ Kolon - Ek Hizmetler */}
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-900 text-base border-b border-gray-200 pb-2">Ek Hizmetler</h4>
                                                
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.express_service}
                                                                onChange={(e) => updateFormData('express_service', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Ekspres hizmet seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Ekspres hizmet</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.weekend_service}
                                                                onChange={(e) => updateFormData('weekend_service', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Hafta sonu hizmeti seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Hafta sonu hizmeti</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.fuel_surcharge_included}
                                                                onChange={(e) => updateFormData('fuel_surcharge_included', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Yakıt ek ücreti seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Yakıt ek ücreti dahil</span>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.toll_fees_included}
                                                                onChange={(e) => updateFormData('toll_fees_included', e.target.checked)}
                                                                className="sr-only peer"
                                                                title="Geçiş ücretleri seçeneği"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">Geçiş ücretleri dahil</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: İletişim ve Şartlar */}
                            {currentStep === 4 && (
                                <div className="space-y-2">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <div className="flex items-center space-x-3 mb-1">
                                            {getStepIcon(4)}
                                            <h3 className="text-base font-semibold text-gray-900">İletişim ve Şartlar</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {/* İletişim Kişisi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    İletişim Kişisi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.contact_person}
                                                    onChange={(e) => updateFormData('contact_person', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Ad Soyad"
                                                    title="İletişim kişisi"
                                                />
                                            </div>

                                            {/* İletişim Telefonu */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    İletişim Telefonu
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.contact_phone}
                                                    onChange={(e) => updateFormData('contact_phone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="+90 (xxx) xxx xx xx"
                                                    title="İletişim telefonu"
                                                />
                                            </div>

                                            {/* Ödeme Şartları */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ödeme Şartları
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.payment_terms}
                                                    onChange={(e) => updateFormData('payment_terms', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="örn: Teslimat sonrası 30 gün"
                                                    title="Ödeme şartları"
                                                />
                                            </div>

                                            {/* Ödeme Yöntemi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ödeme Yöntemi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.payment_method}
                                                    onChange={(e) => updateFormData('payment_method', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="örn: Banka havalesi, Nakit"
                                                    title="Ödeme yöntemi"
                                                />
                                            </div>

                                            {/* Geçerlilik Tarihi */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Teklifin Geçerlilik Tarihi *
                                                </label>
                                                <input
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={formData.expires_at || getDefaultExpiryDate()}
                                                    onChange={(e) => updateFormData('expires_at', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.expires_at ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    title="Teklifin geçerlilik tarihi"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Herhangi bir gelecek tarih seçebilirsiniz</p>
                                                {errors.expires_at && <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>}
                                            </div>

                                            {/* Valid Until */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Teklifin Son Geçerli Tarihi
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.valid_until}
                                                    onChange={(e) => updateFormData('valid_until', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Teklifin son geçerli tarihi"
                                                />
                                            </div>

                                            {/* Özel Şartlar */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Özel Şartlar
                                                </label>
                                                <textarea
                                                    value={formData.special_conditions}
                                                    onChange={(e) => updateFormData('special_conditions', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    placeholder="Özel şartlar ve koşullar..."
                                                />
                                            </div>

                                            {/* Mesaj */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mesaj *
                                                </label>
                                                <textarea
                                                    value={formData.message}
                                                    onChange={(e) => updateFormData('message', e.target.value)}
                                                    rows={3}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                                        errors.message ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Teklifinizle ilgili detayları, özel durumları ve avantajlarınızı belirtiniz..."
                                                />
                                                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                            </div>

                                            {/* Evrak Açıklaması */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Yüklenen Evrakların Açıklaması (Opsiyonel)
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.documents_description}
                                                    onChange={(e) => updateFormData('documents_description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    placeholder="Lütfen yüklenen evrakları yazınız (örn: Sigorta belgesi, Yetki belgesi, İş sözleşmesi vb.)"
                                                />
                                            </div>

                                            {/* Evrak Yükleme */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Evrak Yükleme (Opsiyonel)
                                                </label>
                                                <div className="mt-1 flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                    <div className="space-y-1 text-center">
                                                        <svg
                                                            className="mx-auto h-12 w-12 text-gray-400"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            viewBox="0 0 48 48"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                                strokeWidth={2}
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="edit-file-upload"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                            >
                                                                <span>Dosya yükleyin</span>
                                                                <input
                                                                    id="edit-file-upload"
                                                                    name="edit-file-upload"
                                                                    type="file"
                                                                    multiple
                                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                    className="sr-only"
                                                                    onChange={(e) => {
                                                                        const files = Array.from(e.target.files || []);
                                                                        updateFormData('uploaded_documents', [...formData.uploaded_documents, ...files]);
                                                                    }}
                                                                />
                                                            </label>
                                                            <p className="pl-1">veya sürükleyip bırakın</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PDF, DOC, DOCX, JPG, JPEG, PNG dosyaları kabul edilir
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Yüklenen Dosyalar Listesi */}
                                                {formData.uploaded_documents.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Yüklenen Dosyalar:</h4>
                                                        <div className="space-y-2">
                                                            {formData.uploaded_documents.map((file, index) => (
                                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center">
                                                                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                                        <span className="text-xs text-gray-500 ml-2">({Math.round(file.size / 1024)} KB)</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newFiles = formData.uploaded_documents.filter((_, i) => i !== index);
                                                                            updateFormData('uploaded_documents', newFiles);
                                                                        }}
                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                        title="Dosyayı kaldır"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer with Navigation */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-3">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={isSubmitting}
                                        className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Önceki
                                    </button>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    İptal
                                </button>

                                {currentStep < totalSteps ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={isSubmitting}
                                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Sonraki
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Teklifi Güncelle
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditOfferModal;
