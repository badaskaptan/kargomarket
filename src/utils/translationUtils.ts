// Translation utilities for converting raw data to Turkish

// Yük tipi çevirisi
export const translateLoadType = (loadType: string): string => {
    if (!loadType) return 'Genel Kargo';

    // Debug log
    console.log('translateLoadType called with:', loadType);

    const translations: { [key: string]: string } = {
        // Genel Kargo / Paletli Ürünler
        'box_package': 'Koli / Paket',
        'pallet_standard': 'Paletli Yükler - Standart Palet',
        'pallet_euro': 'Paletli Yükler - Euro Palet',
        'pallet_industrial': 'Paletli Yükler - Endüstriyel Palet',
        'sack_bigbag': 'Çuval / Bigbag (Dökme Olmayan)',
        'barrel_drum': 'Varil / Fıçı',
        'appliances_electronics': 'Beyaz Eşya / Elektronik',
        'furniture_decor': 'Mobilya / Dekorasyon Ürünleri',
        'textile_products': 'Tekstil Ürünleri',
        'automotive_parts': 'Otomotiv Parçaları / Yedek Parça',
        'machinery_parts': 'Makine / Ekipman Parçaları (Büyük Olmayan)',
        'construction_materials': 'İnşaat Malzemeleri (Torbalı Çimento, Demir Bağlar vb.)',
        'packaged_food': 'Ambalajlı Gıda Ürünleri (Kuru Gıda, Konserve vb.)',
        'consumer_goods': 'Tüketim Ürünleri (Market Ürünleri)',
        'ecommerce_cargo': 'E-ticaret Kargo',
        'other_general': 'Diğer Genel Kargo',

        // Dökme Yükler
        'grain': 'Tahıl (Buğday, Mısır, Arpa, Pirinç vb.)',
        'ore': 'Maden Cevheri (Demir, Bakır, Boksit vb.)',
        'coal': 'Kömür',
        'cement_bulk': 'Çimento (Dökme)',
        'sand_gravel': 'Kum / Çakıl',
        'fertilizer_bulk': 'Gübre (Dökme)',
        'soil_excavation': 'Toprak / Hafriyat',
        'scrap_metal': 'Hurda Metal',
        'other_bulk': 'Diğer Dökme Yükler',

        // Sıvı Yükler (Dökme Sıvı)
        'crude_oil': 'Ham Petrol / Petrol Ürünleri',
        'chemical_liquids': 'Kimyasal Sıvılar (Asit, Baz, Solvent vb.)',
        'vegetable_oils': 'Bitkisel Yağlar (Ayçiçek Yağı, Zeytinyağı vb.)',
        'fuel': 'Yakıt (Dizel, Benzin vb.)',
        'lpg_lng': 'LPG / LNG (Sıvılaştırılmış Gazlar)',
        'water': 'Su (İçme Suyu, Endüstriyel Su)',
        'milk_dairy': 'Süt / Süt Ürünleri (Dökme)',
        'wine_concentrate': 'Şarap / İçecek Konsantresi',
        'other_liquid': 'Diğer Sıvı Yükler',

        // Ağır Yük / Gabari Dışı Yük
        'tbm': 'Tünel Açma Makinesi (TBM)',
        'transformer_generator': 'Trafo / Jeneratör',
        'heavy_machinery': 'Büyük İş Makineleri (Ekskavatör, Vinç vb.)',
        'boat_yacht': 'Tekne / Yat',
        'industrial_parts': 'Büyük Endüstriyel Parçalar',
        'prefab_elements': 'Prefabrik Yapı Elemanları',
        'wind_turbine': 'Rüzgar Türbini Kanatları / Kuleleri',
        'other_oversized': 'Diğer Gabari Dışı Yükler',

        // Hassas / Kırılabilir Kargo
        'art_antiques': 'Sanat Eserleri / Antikalar',
        'glass_ceramic': 'Cam / Seramik Ürünler',
        'electronic_devices': 'Elektronik Cihaz',
        'medical_devices': 'Tıbbi Cihazlar',
        'lab_equipment': 'Laboratuvar Ekipmanları',
        'flowers_plants': 'Çiçek / Canlı Bitki',
        'other_sensitive': 'Diğer Hassas Kargo',

        // Tehlikeli Madde (ADR / IMDG / IATA Sınıflandırması)
        'dangerous_class1': 'Patlayıcılar (Sınıf 1)',
        'dangerous_class2': 'Gazlar (Sınıf 2)',
        'dangerous_class3': 'Yanıcı Sıvılar (Sınıf 3)',
        'dangerous_class4': 'Yanıcı Katılar (Sınıf 4)',
        'dangerous_class5': 'Oksitleyici Maddeler (Sınıf 5)',
        'dangerous_class6': 'Zehirli ve Bulaşıcı Maddeler (Sınıf 6)',
        'dangerous_class7': 'Radyoaktif Maddeler (Sınıf 7)',
        'dangerous_class8': 'Aşındırıcı Maddeler (Sınıf 8)',
        'dangerous_class9': 'Diğer Tehlikeli Maddeler (Sınıf 9)',

        // Soğuk Zincir / Isı Kontrollü Yük
        'frozen_food': 'Donmuş Gıda',
        'fresh_produce': 'Taze Meyve / Sebze',
        'meat_dairy': 'Et / Süt Ürünleri',
        'pharma_vaccine': 'İlaç / Aşı',
        'chemical_temp': 'Kimyasal Maddeler (Isı Kontrollü)',
        'other_cold_chain': 'Diğer Soğuk Zincir Kargo',

        // Canlı Hayvan
        'small_livestock': 'Küçük Baş Hayvan (Koyun, Keçi vb.)',
        'large_livestock': 'Büyük Baş Hayvan (Sığır, At vb.)',
        'poultry': 'Kanatlı Hayvan',
        'pets': 'Evcil Hayvan',
        'other_livestock': 'Diğer Canlı Hayvanlar',

        // Proje Yükleri
        'factory_setup': 'Fabrika Kurulumu',
        'power_plant': 'Enerji Santrali Ekipmanları',
        'infrastructure': 'Altyapı Proje Malzemeleri',
        'other_project': 'Diğer Proje Yükleri',

        // Eski ve genel anahtarlar (geriye dönük uyumluluk için)
        // 'general_cargo': 'Genel Kargo', // duplicate removed
        'refrigerated': 'Soğutmalı Kargo',
        'hazmat': 'Tehlikeli Madde',
        'oversized': 'Yüksek/Geniş Yük',
        'liquid': 'Sıvı Yük',
        'bulk': 'Dökme Yük',
        'container': 'Konteyner',
        'automotive': 'Otomotiv',
        // 'machinery': 'Makine/Ekipman', // duplicate removed
        // 'machinery_parts': 'Makine Parçaları', // duplicate removed
        // 'textile': 'Tekstil', // duplicate removed
        // 'food': 'Gıda', // duplicate removed
        'food_products': 'Gıda Ürünleri',
        // 'chemical': 'Kimyasal', // duplicate removed
        'pharmaceutical': 'İlaç/Tıbbi',
        // 'electronics': 'Elektronik', // duplicate removed
        // 'construction': 'İnşaat Malzemesi', // duplicate removed
        // 'agricultural': 'Tarım Ürünleri', // duplicate removed

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
