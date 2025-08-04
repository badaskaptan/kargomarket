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
import { OfferDocumentService } from '../../services/offerDocumentService';

type Listing = Database['public']['Tables']['listings']['Row'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];

type CargoType = 'general_cargo' | 'bulk_cargo' | 'container' | 'liquid' | 'dry_bulk' | 'refrigerated' | 'hazardous' | 'oversized' | 'project_cargo' | 'livestock' | 'vehicles' | 'machinery' | 'box_package' | 'pallet_standard' | 'pallet_euro' | 'pallet_industrial' | 'sack_bigbag' | 'barrel_drum' | 'appliances_electronics' | 'furniture_decor' | 'textile_products' | 'automotive_parts' | 'machinery_parts' | 'construction_materials' | 'packaged_food' | 'consumer_goods' | 'ecommerce_cargo' | 'other_general' | 'grain' | 'ore' | 'coal' | 'cement_bulk' | 'sand_gravel' | 'fertilizer_bulk' | 'soil_excavation' | 'scrap_metal' | 'other_bulk' | 'crude_oil' | 'chemical_liquids' | 'vegetable_oils' | 'fuel' | 'lpg_lng' | 'water' | 'milk_dairy' | 'wine_concentrate' | 'other_liquid' | 'tbm' | 'transformer_generator' | 'heavy_machinery' | 'boat_yacht' | 'industrial_parts' | 'prefab_elements' | 'wind_turbine' | 'other_oversized' | 'art_antiques' | 'glass_ceramic' | 'electronic_devices' | 'medical_devices' | 'lab_equipment' | 'flowers_plants' | 'other_sensitive' | 'dangerous_class1' | 'dangerous_class2' | 'dangerous_class3' | 'dangerous_class4' | 'dangerous_class5' | 'dangerous_class6' | 'dangerous_class7' | 'dangerous_class8' | 'dangerous_class9' | 'frozen_food' | 'fresh_produce' | 'meat_dairy' | 'pharma_vaccine' | 'chemical_temp' | 'other_cold_chain' | 'small_livestock' | 'large_livestock' | 'poultry' | 'pets' | 'other_livestock' | 'factory_setup' | 'power_plant' | 'infrastructure' | 'other_project';

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
    transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal' | 'negotiable';
    cargo_type: CargoType;
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
                // Sadece geçmiş tarih kontrolü - gelecekteki herhangi bir tarih kabul edilir
                if (expiryDate <= now) {
                    newErrors.expires_at = 'Geçerlilik tarihi gelecekte olmalıdır';
                }
            }
            // valid_until için herhangi bir zaman sınırlaması yok - isteğe bağlı alan
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
            // Önce teklifin ID'sini oluşturalım (geçici - gerçekte backend'den gelecek)
            const tempOfferId = crypto.randomUUID();
            
            // Dosyaları yükleyelim (listings pattern'i takip ederek)
            const documentUrls: string[] = [];
            const imageUrls: string[] = [];
            
            if (formData.uploaded_documents.length > 0) {
                try {
                    const uploadResults = await OfferDocumentService.uploadOfferDocuments(
                        formData.uploaded_documents, 
                        currentUserId, 
                        tempOfferId
                    );
                    documentUrls.push(...uploadResults.documentUrls);
                    imageUrls.push(...uploadResults.imageUrls);
                } catch (error) {
                    console.error('Dosya yükleme hatası:', error);
                    // Hata durumunda da teklifi gönderebiliriz, sadece dosyalar olmaz
                }
            }

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
                // Evrak bilgileri (listings pattern'i takip ederek)
                documents_description: formData.documents_description.trim() || null,  
                document_urls: documentUrls.length > 0 ? documentUrls : null,
                image_urls: imageUrls.length > 0 ? imageUrls : null,
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
            
            // Evrak Yükleme (Opsiyonel)
            documents_description: '',
            uploaded_documents: [],

            // Geçerlilik
            expires_at: '',
            valid_until: ''
        });
        setErrors({});
    };

    const updateFormData = (field: keyof FormData, value: string | boolean | File[]) => {
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
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${step <= currentStep
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                                </div>
                                {step < totalSteps && (
                                    <div className={`h-1 flex-1 mx-2 rounded transition-colors ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* İlan Özeti */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">İlan Detayları</h3>
                            {/* İlan Tipi İşareti */}
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                listing.listing_type === 'load_listing' ? 'bg-blue-100 text-blue-800' :
                                listing.listing_type === 'shipment_request' ? 'bg-green-100 text-green-800' :
                                listing.listing_type === 'transport_service' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {listing.listing_type === 'load_listing' ? 'Yük İlanı' :
                                 listing.listing_type === 'shipment_request' ? 'Nakliye Talebi' :
                                 listing.listing_type === 'transport_service' ? 'Nakliye Hizmeti' :
                                 'İlan'}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* İlan No */}
                            {listing.listing_number && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">İlan No:</span>
                                    <span className="text-sm font-semibold text-blue-600">{listing.listing_number}</span>
                                </div>
                            )}

                            {/* Başlık */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Başlık:</span>
                                <span className="text-sm font-semibold text-gray-900">{listing.title}</span>
                            </div>

                            {/* Güzergah */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Güzergah:</span>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">{listing.origin} → {listing.destination}</span>
                                </div>
                            </div>

                            {/* Yük Tipi */}
                            {listing.load_category && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Yük Tipi:</span>
                                    <span className="text-sm font-medium text-gray-900">{listing.load_category}</span>
                                </div>
                            )}

                            {/* Ağırlık */}
                            {listing.weight_value && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Ağırlık:</span>
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-1 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {listing.weight_value >= 1000 
                                                ? `${(listing.weight_value / 1000).toFixed(0)} ton`
                                                : `${listing.weight_value} kg`
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Hacim */}
                            {listing.volume_value && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Hacim:</span>
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-1 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{listing.volume_value} m³</span>
                                    </div>
                                </div>
                            )}

                            {/* Yükleme Tarihi */}
                            {listing.loading_date && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Yükleme Tarihi:</span>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{formatDate(listing.loading_date)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Taşıma Modu - Sadece nakliye talebi ve nakliye hizmeti için göster */}
                            {listing.transport_mode && listing.listing_type !== 'load_listing' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Taşıma Modu:</span>
                                    <div className="flex items-center">
                                        <Truck className="w-4 h-4 mr-1 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 capitalize">{listing.transport_mode}</span>
                                    </div>
                                </div>
                            )}
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
                                                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price_amount ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="0,00"
                                                />
                                                <select
                                                    value={formData.price_currency}
                                                    onChange={(e) => updateFormData('price_currency', e.target.value as 'TRY' | 'USD' | 'EUR')}
                                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    title="Para birimi seçin"
                                                    aria-label="Para birimi seçin"
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
                                                onChange={(e) => updateFormData('transport_mode', e.target.value as 'road' | 'sea' | 'air' | 'rail' | 'multimodal' | 'negotiable')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                title="Taşıma türü seçin"
                                                aria-label="Taşıma türü seçin"
                                            >
                                                <option value="road">Karayolu</option>
                                                <option value="sea">Deniz</option>
                                                <option value="air">Hava</option>
                                                <option value="rail">Demir Yolu</option>
                                                <option value="multimodal">Çok Modlu</option>
                                                <option value="negotiable">Görüşülecek</option>
                                            </select>
                                        </div>

                                        {/* Kargo Türü */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kargo Türü
                                            </label>
                                            <select
                                                value={formData.cargo_type}
                                                onChange={(e) => updateFormData('cargo_type', e.target.value as CargoType)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                title="Kargo türü seçin"
                                                aria-label="Kargo türü seçin"
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hizmet Kapsamı
                                            </label>
                                            <select
                                                value={formData.service_scope}
                                                onChange={(e) => updateFormData('service_scope', e.target.value as 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                title="Hizmet kapsamı seçin"
                                                aria-label="Hizmet kapsamı seçin"
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
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pickup_date_preferred ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                title="Tercih edilen alış tarihini seçin"
                                                aria-label="Tercih edilen alış tarihini seçin"
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
                                                title="Tercih edilen teslimat tarihini seçin"
                                                aria-label="Tercih edilen teslimat tarihini seçin"
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
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.transit_time_estimate ? 'border-red-300' : 'border-gray-300'
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
                                                    title="Gümrük işlemleri dahil"
                                                    aria-label="Gümrük işlemleri dahil"
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
                                                    title="Döküman işlemleri dahil"
                                                    aria-label="Döküman işlemleri dahil"
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
                                                    title="Yükleme/Boşaltma dahil"
                                                    aria-label="Yükleme/Boşaltma dahil"
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
                                                    title="Takip sistemi dahil"
                                                    aria-label="Takip sistemi dahil"
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
                                                    title="Express hizmet dahil"
                                                    aria-label="Express hizmet dahil"
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
                                                    title="Hafta sonu hizmeti dahil"
                                                    aria-label="Hafta sonu hizmeti dahil"
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
                                                    title="Yakıt surcharj dahil"
                                                    aria-label="Yakıt surcharj dahil"
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
                                                    title="Geçiş ücretleri dahil"
                                                    aria-label="Geçiş ücretleri dahil"
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
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.expires_at ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                title="Teklifin geçerlilik tarihi - herhangi bir gelecek tarih seçilebilir"
                                                aria-label="Teklifin geçerlilik tarihi"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Herhangi bir gelecek tarih seçebilirsiniz</p>
                                            {errors.expires_at && <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>}
                                        </div>

                                        {/* Valid Until */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Teklifin Son Geçerli Tarihi
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.valid_until}
                                                onChange={(e) => updateFormData('valid_until', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                title="Teklifin son geçerli tarihi - opsiyonel, süre sınırlaması yok"
                                                aria-label="Teklifin son geçerli tarihi"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Opsiyonel - Süre sınırlaması yoktur</p>
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
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.message ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="Teklifinizle ilgili detayları, özel durumları ve avantajlarınızı belirtiniz..."
                                            />
                                            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                        </div>

                                        {/* Evrak Açıklaması */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Yüklenen Evrakların Açıklaması (Opsiyonel)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.documents_description}
                                                onChange={(e) => updateFormData('documents_description', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder="Lütfen yüklenen evrakları yazınız (örn: Sigorta belgesi, Yetki belgesi, İş sözleşmesi vb.)"
                                            />
                                        </div>

                                        {/* Evrak Yükleme */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Evrak Yükleme (Opsiyonel)
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
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
                                                            htmlFor="file-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                        >
                                                            <span>Dosya yükleyin</span>
                                                            <input
                                                                id="file-upload"
                                                                name="file-upload"
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
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Yüklenen Dosyalar:</h4>
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
