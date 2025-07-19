// Translation utilities for converting raw data to Turkish

// Yük tipi çevirisi
export const translateLoadType = (loadType: string): string => {
    if (!loadType) return 'Genel Kargo';

    // Debug log
    console.log('translateLoadType called with:', loadType);

    const translations: { [key: string]: string } = {
        'dangerous_class1': 'Tehlikeli Madde Sınıf 1 (Patlayıcılar)',
        'dangerous_class2': 'Tehlikeli Madde Sınıf 2 (Gazlar)',
        'dangerous_class3': 'Tehlikeli Madde Sınıf 3 (Yanıcı Sıvılar)',
        'dangerous_class4': 'Tehlikeli Madde Sınıf 4 (Yanıcı Katılar)',
        'dangerous_class5': 'Tehlikeli Madde Sınıf 5 (Oksitleyici Maddeler)',
        'dangerous_class6': 'Tehlikeli Madde Sınıf 6 (Zehirli Maddeler)',
        'dangerous_class7': 'Tehlikeli Madde Sınıf 7 (Radyoaktif Maddeler)',
        'dangerous_class8': 'Tehlikeli Madde Sınıf 8 (Aşındırıcı Maddeler)',
        'dangerous_class9': 'Tehlikeli Madde Sınıf 9 (Çeşitli Tehlikeli Maddeler)',
        'general_cargo': 'Genel Kargo',
        'refrigerated': 'Soğutmalı Kargo',
        'hazmat': 'Tehlikeli Madde',
        'oversized': 'Yüksek/Geniş Yük',
        'liquid': 'Sıvı Yük',
        'bulk': 'Dökme Yük',
        'container': 'Konteyner',
        'automotive': 'Otomotiv',
        'machinery': 'Makine/Ekipman',
        'machinery_parts': 'Makine Parçaları',
        'textile': 'Tekstil',
        'textile_products': 'Tekstil Ürünleri',
        'food': 'Gıda',
        'food_products': 'Gıda Ürünleri',
        'chemical': 'Kimyasal',
        'pharmaceutical': 'İlaç/Tıbbi',
        'electronics': 'Elektronik',
        'construction': 'İnşaat Malzemesi',
        'agricultural': 'Tarım Ürünleri',
        'ecommerce_cargo': 'E-Ticaret Kargos',

        // Türkçe değerler de çevirisiz geçsin (eğer database'de Türkçe kaydedilmişse)
        'tekstil': 'Tekstil',
        'elektronik': 'Elektronik',
        'gıda': 'Gıda',
        'genel kargo': 'Genel Kargo',
        'inşaat': 'İnşaat Malzemesi',
        'otomotiv': 'Otomotiv',
        'kimyasal': 'Kimyasal',
        'makine': 'Makine/Ekipman',
        'tarım': 'Tarım Ürünleri',
        'soğutmalı': 'Soğutmalı Kargo',

        // Büyük harf ile de gelirse çevirisiz geçsin
        'Tekstil': 'Tekstil',
        'Elektronik': 'Elektronik',
        'Gıda': 'Gıda',
        'Genel Kargo': 'Genel Kargo',
        'İnşaat': 'İnşaat'
    };

    // Case-insensitive arama yap
    const lowercaseLoadType = loadType.toLowerCase();
    const directMatch = translations[loadType] || translations[lowercaseLoadType];

    console.log('  - Original value:', `'${loadType}'`);
    console.log('  - Lowercase value:', `'${lowercaseLoadType}'`);
    console.log('  - Direct match found:', directMatch);

    if (directMatch) {
        console.log('  - ✅ Returning:', directMatch);
        return directMatch;
    }

    // Eğer çeviri bulunamazsa, debug için konsola yazdır
    console.log('  - ❌ No translation found for:', loadType);
    console.log('  - Available translations:', Object.keys(translations));

    return loadType;
};

// Araç tipi çevirisi
export const translateVehicleType = (vehicleType: string): string => {
    const translations: { [key: string]: string } = {
        // Kamyonlar
        'truck': 'Kamyon',
        'truck_3_5_open': 'Kamyon - 3.5 Ton (Açık Kasa)',
        'truck_3_5_closed': 'Kamyon - 3.5 Ton (Kapalı Kasa)',
        'truck_5_open': 'Kamyon - 5 Ton (Açık Kasa)',
        'truck_5_closed': 'Kamyon - 5 Ton (Kapalı Kasa)',
        'truck_10_open': 'Kamyon - 10 Ton (Açık Kasa)',
        'truck_10_closed': 'Kamyon - 10 Ton (Kapalı Kasa)',
        'truck_10_tent': 'Kamyon - 10 Ton (Tenteli)',
        'truck_15_open': 'Kamyon - 15 Ton (Açık Kasa)',
        'truck_15_closed': 'Kamyon - 15 Ton (Kapalı Kasa)',
        'truck_15_tent': 'Kamyon - 15 Ton (Tenteli)',

        // Tır ve Çekiciler
        'tir_standard': 'Tır (Standart Dorse) - 90m³ / 40t',
        'tir_mega': 'Tır (Mega Dorse) - 100m³ / 40t',
        'tir_jumbo': 'Tır (Jumbo Dorse) - 120m³ / 40t',
        'tir_tent': 'Tır (Tenteli Dorse) - 40t',
        'tir_frigo': 'Tır (Frigorifik Dorse - Isı Kontrollü) - 40t',
        'tir_container': 'Tır (Konteyner Taşıyıcı) - 40t',
        'tir_platform': 'Tır (Platform) - 40t',
        'tir_frigo_dual': 'Tır (Frigorifik Çift Isı) - 40t',

        // Kargo Araçları
        'van': 'Van',
        'van_3': 'Kargo Van - 3m³ (1000kg)',
        'van_6': 'Kargo Van - 6m³ (1500kg)',
        'van_10': 'Kargo Van - 10m³ (2000kg)',
        'van_15': 'Kargo Van - 15m³ (2500kg)',

        // Konteyner Gemisi
        'container_20dc': '20\' Standart (20DC) - 33m³ / 28t',
        'container_40dc': '40\' Standart (40DC) - 67m³ / 28t',
        'container_40hc': '40\' Yüksek (40HC) - 76m³ / 28t',
        'container_20ot': '20\' Open Top - 32m³ / 28t',
        'container_40ot': '40\' Open Top - 66m³ / 28t',
        'container_20fr': '20\' Flat Rack - 28t',
        'container_40fr': '40\' Flat Rack - 40t',
        'container_20rf': '20\' Reefer - 28m³ / 25t',
        'container_40rf': '40\' Reefer - 60m³ / 25t',

        // Dökme Yük Gemisi
        'bulk_handysize': 'Handysize (10,000-35,000 DWT)',
        'bulk_handymax': 'Handymax (35,000-60,000 DWT)',
        'bulk_panamax': 'Panamax (60,000-80,000 DWT)',
        'bulk_capesize': 'Capesize (80,000+ DWT)',

        // Genel Kargo Gemisi
        'general_small': 'Küçük Tonaj (1,000-5,000 DWT)',
        'general_medium': 'Orta Tonaj (5,000-15,000 DWT)',
        'general_large': 'Büyük Tonaj (15,000+ DWT)',

        // Tanker
        'tanker_product': 'Ürün Tankeri (10,000-60,000 DWT)',
        'tanker_chemical': 'Kimyasal Tanker (5,000-40,000 DWT)',
        'tanker_crude': 'Ham Petrol Tankeri (60,000+ DWT)',
        'tanker_lpg': 'LPG Tankeri (5,000-80,000 m³)',
        'tanker_lng': 'LNG Tankeri (150,000-180,000 m³)',

        // RO-RO
        'roro_small': 'Küçük RO-RO (100-200 araç)',
        'roro_medium': 'Orta RO-RO (200-500 araç)',
        'roro_large': 'Büyük RO-RO (500+ araç)',

        // Feribot ve Yük Teknesi
        'ferry_cargo': 'Kargo Feribotu',
        'ferry_mixed': 'Karma Feribot (Yolcu+Yük)',
        'cargo_small': 'Küçük Yük Teknesi (500-1,000 DWT)',
        'cargo_large': 'Büyük Yük Teknesi (1,000+ DWT)',

        // Hava Kargo
        'standard_cargo': 'Standart Kargo',
        'large_cargo': 'Büyük Hacimli Kargo',
        'special_cargo': 'Özel Kargo',

        // Demiryolu
        'open_wagon': 'Açık Yük Vagonu',
        'closed_wagon': 'Kapalı Yük Vagonu',
        'container_wagon': 'Konteyner Vagonu',
        'tanker_wagon': 'Tanker Vagonu',
        'refrigerated_wagon': 'Soğutmalı Vagon',
        'flatbed_wagon': 'Platform Vagonu',

        // Genel Terimler
        'trailer': 'Treyler',
        'semi_trailer': 'Yarı Treyler',
        'container_truck': 'Konteyner Taşıyıcı',
        'refrigerated_truck': 'Soğutmalı Kamyon',
        'tanker': 'Tanker',
        'flatbed': 'Açık Kasa',
        'closed_truck': 'Kapalı Kasa',
        'pickup': 'Pickup',
        'lorry': 'Kamyonet',
        'heavy_truck': 'Ağır Vasıta',
        'light_truck': 'Hafif Ticari',
        'articulated_truck': 'Çekici',
        'lowloader': 'Lowboy',
        'car_carrier': 'Araç Taşıyıcı',
        'concrete_mixer': 'Beton Mikseri',
        'dump_truck': 'Damperli',
        'cargo_ship': 'Kargo Gemisi',
        'container_ship': 'Konteyner Gemisi',
        'bulk_carrier': 'Dökme Yük Gemisi',
        'tanker_ship': 'Tanker Gemisi',
        'aircraft': 'Uçak',
        'cargo_plane': 'Kargo Uçağı',
        'train': 'Tren',
        'freight_train': 'Yük Treni'
    };

    return translations[vehicleType] || vehicleType;
};

// Array halde gelen vehicle types'ları çevir ve birleştir
export const translateVehicleTypes = (vehicleTypes: string[]): string => {
    if (!vehicleTypes || vehicleTypes.length === 0) return '';

    const translatedTypes = vehicleTypes.map(type => translateVehicleType(type));

    if (translatedTypes.length > 3) {
        return `${translatedTypes.slice(0, 3).join(', ')} +${translatedTypes.length - 3} diğer`;
    }

    return translatedTypes.join(', ');
};

// Evrak çevirisi
export const translateDocument = (document: string): string => {
    const translations: { [key: string]: string } = {
        'analysis': 'Analiz Raporu',
        'productPhotos': 'Ürün Fotoğrafları',
        'warehouseReceipt': 'Depo Makbuzu',
        'customsDeclaration': 'Gümrük Beyannamesi',
        'paymentDocuments': 'Ödeme Belgeleri',
        'salesContract': 'Satış Sözleşmesi',
        'originCertificate': 'Menşe Şahadeti',
        'complianceCertificates': 'Uygunluk Sertifikaları',
        'msds': 'Güvenlik Bilgi Formu (MSDS)',
        'importExportLicense': 'İthalat/İhracat Lisansı',
        'invoiceCommercial': 'Ticari Fatura',
        'packingList': 'Ambalaj Listesi',
        'billOfLading': 'Konşimento',
        'airwayBill': 'Hava Yolu Faturası',
        'insurancePolicy': 'Sigorta Poliçesi',
        'healthCertificate': 'Sağlık Sertifikası',
        'qualityCertificate': 'Kalite Sertifikası',
        'weightCertificate': 'Tartı Belgesi',
        'dangerousGoodsDeclaration': 'Tehlikeli Madde Beyanı',
        'exportDeclaration': 'İhracat Beyannamesi',
        'importDeclaration': 'İthalat Beyannamesi',
        'transitDocument': 'Transit Belgesi',
        'carnetDocument': 'Carnet Belgesi',
        'fumigationCertificate': 'Fumigasyon Sertifikası',
        'phytosanitaryCertificate': 'Fitosaniter Sertifika',
        'veterinaryCertificate': 'Veteriner Sertifikası',
        'radiationCertificate': 'Radyasyon Sertifikası',
        'temperatureLog': 'Sıcaklık Kayıt Belgesi'
    };

    return translations[document] || document;
};

// Freight type çevirisi (Nakliye türü)
export const translateFreightType = (freightType: string): string => {
    const translations: { [key: string]: string } = {
        'general': 'Genel Yük',
        'container': 'Konteyner',
        'bulk': 'Dökme Yük',
        'liquid': 'Sıvı Yük',
        'dangerous': 'Tehlikeli Madde',
        'refrigerated': 'Soğutmalı',
        'oversized': 'Yüksek/Geniş Yük',
        'project': 'Proje Yükü',
        'automotive': 'Otomotiv',
        'livestock': 'Canlı Hayvan',
        'timber': 'Kereste',
        'steel': 'Çelik/Metal',
        'machinery': 'Makine/Ekipman',
        'agricultural': 'Tarım Ürünleri',
        'chemicals': 'Kimyasal',
        'foodstuffs': 'Gıda Maddeleri',
        'textiles': 'Tekstil',
        'electronics': 'Elektronik',
        'pharmaceuticals': 'İlaç/Tıbbi'
    };

    return translations[freightType] || freightType;
};

// Transport mode çevirisi
export const translateTransportMode = (mode: string): string => {
    const translations: { [key: string]: string } = {
        'road': 'Karayolu',
        'sea': 'Denizyolu',
        'air': 'Havayolu',
        'rail': 'Demiryolu',
        'multimodal': 'Karma Taşımacılık'
    };

    return translations[mode] || mode;
};
