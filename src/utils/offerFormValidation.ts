// Offer form validation utilities based on listing type
// Bu utility, aynı formu farklı ilan türleri için uygun şekilde validate eder

export type ListingType = 'load_listing' | 'shipment_request' | 'transport_service';
export type OfferFormStep = 1 | 2 | 3 | 4;

// Her ilan türü için hangi alanların zorunlu olduğunu tanımla
export const getRequiredFields = (listingType: ListingType, step: OfferFormStep): string[] => {
    const commonFields = {
        1: ['offer_type', 'price_amount', 'price_currency', 'price_per'],
        2: [], // Step 2'de zorunlu alan yok (tarihleri opsiyonel yaptık)
        3: [],
        4: ['contact_person', 'expires_at']
    };

    const loadListingSpecificFields = {
        1: [],
        2: ['cargo_type', 'service_scope'], // Tarihler opsiyonel, transit_time_estimate opsiyonel
        3: ['customs_handling_included', 'documentation_handling_included', 'loading_unloading_included'],
        4: ['payment_terms', 'payment_method']
    };

    const shipmentRequestSpecificFields = {
        1: [],
        2: ['transport_mode'], // Sadece transport_mode zorunlu
        3: [], // Hizmet detayları opsiyonel
        4: ['message'] // Sadece mesaj zorunlu
    };

    const transportServiceSpecificFields = {
        1: [],
        2: ['transport_mode'], // Sadece transport_mode zorunlu
        3: [], // Hizmet detayları opsiyonel
        4: ['message'] // Sadece mesaj zorunlu
    };

    // Ortak alanları al
    const required = [...commonFields[step]];

    // Ilan türüne göre ek alanları ekle
    if (listingType === 'load_listing') {
        required.push(...loadListingSpecificFields[step]);
    } else if (listingType === 'shipment_request') {
        required.push(...shipmentRequestSpecificFields[step]);
    } else if (listingType === 'transport_service') {
        required.push(...transportServiceSpecificFields[step]);
    }

    return required;
};

// Alan görünürlüğünü kontrol et (bazı alanları gizle/göster)
export const getVisibleFields = (listingType: ListingType, step: OfferFormStep): string[] => {
    const allFields = {
        1: ['offer_type', 'price_amount', 'price_currency', 'price_per'],
        2: ['transport_mode', 'cargo_type', 'service_scope', 'pickup_date_preferred', 'delivery_date_preferred', 'transit_time_estimate'],
        3: ['customs_handling_included', 'documentation_handling_included', 'loading_unloading_included', 'tracking_system_provided', 'express_service', 'weekend_service', 'fuel_surcharge_included', 'toll_fees_included'],
        4: ['contact_person', 'contact_phone', 'payment_terms', 'payment_method', 'special_conditions', 'message', 'expires_at']
    };

    // Load listing için gizlenecek alanlar
    const hiddenForLoadListing = {
        2: ['transport_mode', 'transit_time_estimate'], // Yük ilanı için taşıma modu ve transit süresi gizle
        3: ['customs_handling_included', 'documentation_handling_included', 'loading_unloading_included', 'fuel_surcharge_included', 'toll_fees_included'], // Detaylı hizmet seçeneklerini gizle
        4: ['payment_terms', 'payment_method', 'special_conditions'] // Ödeme detaylarını gizle
    };

    const hiddenForShipmentRequest = {
        2: ['cargo_type', 'service_scope', 'transit_time_estimate'], // Bu alanları shipment request için gizle
        3: ['customs_handling_included', 'documentation_handling_included', 'loading_unloading_included', 'fuel_surcharge_included', 'toll_fees_included'], // Detaylı hizmet seçeneklerini gizle
        4: ['payment_terms', 'payment_method', 'special_conditions'] // Ödeme detaylarını gizle
    };

    const hiddenForTransportService = {
        2: ['cargo_type', 'service_scope', 'transit_time_estimate'], // Bu alanları transport service için gizle
        3: ['customs_handling_included', 'documentation_handling_included', 'loading_unloading_included', 'fuel_surcharge_included', 'toll_fees_included'], // Detaylı hizmet seçeneklerini gizle
        4: ['payment_terms', 'payment_method', 'special_conditions'] // Ödeme detaylarını gizle
    };

    let visible = [...allFields[step]];

    if (listingType === 'load_listing' && hiddenForLoadListing[step as keyof typeof hiddenForLoadListing]) {
        visible = visible.filter(field => !hiddenForLoadListing[step as keyof typeof hiddenForLoadListing].includes(field));
    }

    if (listingType === 'shipment_request' && hiddenForShipmentRequest[step as keyof typeof hiddenForShipmentRequest]) {
        visible = visible.filter(field => !hiddenForShipmentRequest[step as keyof typeof hiddenForShipmentRequest].includes(field));
    }

    if (listingType === 'transport_service' && hiddenForTransportService[step as keyof typeof hiddenForTransportService]) {
        visible = visible.filter(field => !hiddenForTransportService[step as keyof typeof hiddenForTransportService].includes(field));
    }

    return visible;
};

// Alan etiketlerini ilan türüne göre özelleştir
export const getFieldLabel = (fieldName: string, listingType: ListingType): string => {
    const commonLabels: { [key: string]: string } = {
        'offer_type': 'Teklif Türü',
        'price_amount': 'Fiyat',
        'price_currency': 'Para Birimi',
        'price_per': 'Fiyatlandırma Birimi',
        'transport_mode': 'Taşıma Yöntemi',
        'cargo_type': 'Yük Türü',
        'service_scope': 'Hizmet Kapsamı',
        'pickup_date_preferred': 'Tercih Edilen Alış Tarihi (Opsiyonel)',
        'delivery_date_preferred': 'Tercih Edilen Teslim Tarihi (Opsiyonel)',
        'transit_time_estimate': 'Tahmini Transit Süresi (Opsiyonel)',
        'contact_person': 'İletişim Kişisi',
        'contact_phone': 'İletişim Telefonu',
        'payment_terms': 'Ödeme Şartları',
        'payment_method': 'Ödeme Yöntemi',
        'message': 'Mesaj',
        'expires_at': 'Geçerlilik Tarihi'
    };

    const loadListingSpecificLabels: { [key: string]: string } = {
        'pickup_date_preferred': 'Yükün Alınacağı Tarih',
        'delivery_date_preferred': 'Yükün Teslim Edileceği Tarih',
        'message': 'Yük Detayları ve Özel İstekler'
    };

    const shipmentRequestSpecificLabels: { [key: string]: string } = {
        'pickup_date_preferred': 'Nakliye Başlangıç Tarihi',
        'delivery_date_preferred': 'Nakliye Bitiş Tarihi',
        'message': 'Nakliye Kapasitesi ve Teklifiniz',
        'price_per': 'Teklif Fiyatlandırması'
    };

    const transportServiceSpecificLabels: { [key: string]: string } = {
        'pickup_date_preferred': 'Hizmet Başlangıç Tarihi',
        'delivery_date_preferred': 'Hizmet Bitiş Tarihi',
        'message': 'Taşıma Kapasitesi ve Hizmet Detayları',
        'price_per': 'Hizmet Fiyatlandırması'
    };

    // Önce özel etiketleri kontrol et
    if (listingType === 'load_listing' && loadListingSpecificLabels[fieldName]) {
        return loadListingSpecificLabels[fieldName];
    }
    
    if (listingType === 'shipment_request' && shipmentRequestSpecificLabels[fieldName]) {
        return shipmentRequestSpecificLabels[fieldName];
    }
    
    if (listingType === 'transport_service' && transportServiceSpecificLabels[fieldName]) {
        return transportServiceSpecificLabels[fieldName];
    }

    // Sonra ortak etiketleri kullan
    return commonLabels[fieldName] || fieldName;
};

// Alan placeholder'larını ilan türüne göre özelleştir
export const getFieldPlaceholder = (fieldName: string, listingType: ListingType): string => {
    const loadListingPlaceholders: { [key: string]: string } = {
        'message': 'Yükünüzün özelliklerini, özel isteklerinizi ve dikkat edilmesi gereken noktaları belirtin...',
        'transit_time_estimate': 'Örn: 2-3 gün',
        'contact_person': 'Yük sahibi veya yetkili kişi'
    };

    const shipmentRequestPlaceholders: { [key: string]: string } = {
        'message': 'Nakliye kapasitenizi, araç tipinizi, deneyiminizi ve teklifinizi belirtin...',
        'contact_person': 'Nakliyeci firma yetkilisi veya sürücü'
    };

    const transportServicePlaceholders: { [key: string]: string } = {
        'message': 'Taşıma kapasitenizi, araç tipinizi, hizmet özelliklerinizi belirtin...',
        'contact_person': 'Sürücü veya taşımacı firma yetkilisi'
    };

    if (listingType === 'load_listing' && loadListingPlaceholders[fieldName]) {
        return loadListingPlaceholders[fieldName];
    }
    
    if (listingType === 'shipment_request' && shipmentRequestPlaceholders[fieldName]) {
        return shipmentRequestPlaceholders[fieldName];
    }
    
    if (listingType === 'transport_service' && transportServicePlaceholders[fieldName]) {
        return transportServicePlaceholders[fieldName];
    }

    return '';
};

// Form validasyonu
export const validateOfferForm = (
    formData: Record<string, unknown>, 
    listingType: ListingType, 
    currentStep: OfferFormStep
): { isValid: boolean; errors: string[] } => {
    const requiredFields = getRequiredFields(listingType, currentStep);
    const errors: string[] = [];

    requiredFields.forEach(field => {
        const value = formData[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            const label = getFieldLabel(field, listingType);
            errors.push(`${label} alanı zorunludur`);
        }
    });

    // Özel validasyonlar
    if (currentStep === 1 && formData.price_amount) {
        const priceValue = formData.price_amount as string;
        const price = parseFloat(priceValue);
        if (isNaN(price) || price <= 0) {
            errors.push('Geçerli bir fiyat giriniz');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Ilan türünü listing'den otomatik belirle
export const determineListingType = (listing: Record<string, unknown>): ListingType => {
    // Eğer listing_type alanı varsa direkt kullan
    if (listing.listing_type && typeof listing.listing_type === 'string') {
        const listingType = listing.listing_type as string;
        if (listingType === 'load_listing' || listingType === 'shipment_request' || listingType === 'transport_service') {
            return listingType as ListingType;
        }
    }

    // Fallback: Diğer alanlara bakarak belirle
    // Eğer transport_services tablosundan geliyorsa
    if (listing.transport_mode || listing.vehicle_types || listing.capacity_kg) {
        return 'transport_service';
    }
    
    // Eğer vehicle_types varsa shipment_request olabilir
    if (listing.vehicle_types && Array.isArray(listing.vehicle_types)) {
        return 'shipment_request';
    }
    
    // Aksi halde load_listing
    return 'load_listing';
};
