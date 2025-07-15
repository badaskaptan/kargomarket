import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Truck, Ship, Plane, Train } from 'lucide-react';
const TransportServiceDetailSection = ({ listing }) => {
    const { metadata } = listing;
    const transportDetails = metadata?.transport_details || {};
    const contactInfo = metadata?.contact_info || {};
    // Debug: Kapasite verilerini konsola yazdır
    console.log('🔍 KAPASITE DEBUG - Transport Mode:', listing.transport_mode);
    console.log('🔍 KAPASITE DEBUG - transportDetails:', transportDetails);
    console.log('🔍 KAPASITE DEBUG - transportDetails.capacity:', transportDetails?.capacity);
    console.log('🔍 KAPASITE DEBUG - listing.weight_value:', listing.weight_value);
    console.log('🔍 KAPASITE DEBUG - listing.volume_value:', listing.volume_value);
    console.log('🔍 KAPASITE DEBUG - metadata:', metadata);
    console.log('🏷️ LABEL DEBUG - Transport mode:', listing.transport_mode, 'Label will be:', listing.transport_mode === 'sea' ? 'Gross Tonnage' : 'Kapasite');
    // Taşıma moduna göre ikon ve Türkçe metin
    function getTransportModeDisplay(mode) {
        switch (mode) {
            case 'road':
                return _jsxs("span", { className: "flex items-center gap-2 font-semibold text-yellow-700", children: [_jsx(Truck, { className: "w-6 h-6 text-yellow-500" }), "Karayolu"] });
            case 'sea':
                return _jsxs("span", { className: "flex items-center gap-2 font-semibold text-blue-700", children: [_jsx(Ship, { className: "w-6 h-6 text-blue-500" }), "Denizyolu"] });
            case 'air':
                return _jsxs("span", { className: "flex items-center gap-2 font-semibold text-cyan-700", children: [_jsx(Plane, { className: "w-6 h-6 text-cyan-500" }), "Havayolu"] });
            case 'rail':
                return _jsxs("span", { className: "flex items-center gap-2 font-semibold text-gray-700", children: [_jsx(Train, { className: "w-6 h-6 text-gray-500" }), "Demiryolu"] });
            default:
                return _jsx("span", { className: "text-gray-500", children: "Bilinmiyor" });
        }
    }
    // Kapasite bilgisini taşıma moduna göre akıllı şekilde getir
    function getCapacityInfo() {
        console.log('🎯 getCapacityInfo called for mode:', listing.transport_mode);
        console.log('🎯 Checking weight_value:', listing.weight_value, 'type:', typeof listing.weight_value);
        console.log('🎯 Checking volume_value:', listing.volume_value, 'type:', typeof listing.volume_value);
        console.log('🎯 Checking legacy capacity field:', listing.capacity, 'type:', typeof listing.capacity);
        console.log('🎯 Checking transportDetails.capacity:', transportDetails?.capacity);
        // 1. Önce legacy capacity alanını kontrol et (mevcut veriler için)
        if (listing.capacity && listing.capacity !== null && listing.capacity !== '') {
            console.log('✅ Found legacy capacity:', listing.capacity);
            return String(listing.capacity);
        }
        // 2. Ana listing alanlarını kontrol et (yeni veriler için)
        if (listing.weight_value && listing.weight_value > 0) {
            const unit = listing.weight_unit || 'kg';
            console.log('✅ Found weight_value:', listing.weight_value, unit);
            return `${listing.weight_value} ${unit}`;
        }
        if (listing.volume_value && listing.volume_value > 0) {
            const unit = listing.volume_unit || 'm³';
            console.log('✅ Found volume_value:', listing.volume_value, unit);
            return `${listing.volume_value} ${unit}`;
        }
        // 3. Metadata'daki genel capacity kontrolü
        if (transportDetails?.capacity) {
            console.log('✅ Found transportDetails.capacity:', transportDetails.capacity);
            return transportDetails.capacity;
        }
        // 4. Taşıma moduna özel alanları kontrol et (son çare)
        switch (listing.transport_mode) {
            case 'road':
                // Karayolu için metadata'da özel alanlar olabilir
                if (transportDetails?.truck_capacity) {
                    console.log('✅ Found truck_capacity:', transportDetails.truck_capacity);
                    return transportDetails.truck_capacity;
                }
                if (transportDetails?.load_capacity) {
                    console.log('✅ Found load_capacity:', transportDetails.load_capacity);
                    return transportDetails.load_capacity;
                }
                break;
            case 'rail':
                // Trenyolu için metadata'da özel alanlar olabilir
                if (transportDetails?.wagon_capacity) {
                    console.log('✅ Found wagon_capacity:', transportDetails.wagon_capacity);
                    return transportDetails.wagon_capacity;
                }
                if (transportDetails?.train_capacity) {
                    console.log('✅ Found train_capacity:', transportDetails.train_capacity);
                    return transportDetails.train_capacity;
                }
                break;
            case 'sea':
                // Denizyolu için DWT'yi kapasite olarak kullanmayalım (duplikasyon önlemek için)
                // Sadece ship_capacity gibi alanları kontrol edelim
                if (transportDetails?.ship_capacity) {
                    console.log('✅ Found ship_capacity:', transportDetails.ship_capacity);
                    return transportDetails.ship_capacity;
                }
                if (transportDetails?.cargo_capacity) {
                    console.log('✅ Found cargo_capacity:', transportDetails.cargo_capacity);
                    return transportDetails.cargo_capacity;
                }
                // DWT'yi kapasite olarak göstermeyelim, ayrı alanı var
                break;
            case 'air':
                if (transportDetails?.payload) {
                    console.log('✅ Found payload:', transportDetails.payload);
                    return transportDetails.payload;
                }
                if (transportDetails?.cargo_weight) {
                    console.log('✅ Found cargo_weight:', transportDetails.cargo_weight);
                    return transportDetails.cargo_weight;
                }
                break;
        }
        console.log('❌ No capacity found, showing default');
        return 'Belirtilmemiş';
    }
    // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD-MM-YYYY)
    function formatDate(dateString) {
        if (!dateString)
            return 'Belirtilmemiş';
        // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
        const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateString.match(datePattern);
        if (match) {
            const [, year, month, day] = match;
            return `${day}-${month}-${year}`;
        }
        // Eğer farklı bir formatta gelirse, olduğu gibi döndür
        return dateString;
    }
    // Araç tipi kodunu Türkçe'ye çevir (emoji ile)
    function getVehicleTypeLabel(vehicleCode) {
        const vehicleTypeMapping = {
            // Road vehicles
            'truck_3_5_open': '🚚 Kamyon - 3.5 Ton (Açık Kasa)',
            'truck_3_5_closed': '🚚 Kamyon - 3.5 Ton (Kapalı Kasa)',
            'truck_5_open': '🚚 Kamyon - 5 Ton (Açık Kasa)',
            'truck_5_closed': '🚚 Kamyon - 5 Ton (Kapalı Kasa)',
            'truck_10_open': '🚛 Kamyon - 10 Ton (Açık Kasa)',
            'truck_10_closed': '🚛 Kamyon - 10 Ton (Kapalı Kasa)',
            'truck_10_tent': '🚛 Kamyon - 10 Ton (Tenteli)',
            'truck_15_open': '🚛 Kamyon - 15 Ton (Açık Kasa)',
            'truck_15_closed': '🚛 Kamyon - 15 Ton (Kapalı Kasa)',
            'truck_15_tent': '🚛 Kamyon - 15 Ton (Tenteli)',
            'tir_standard': '🚛 Tır (Standart Dorse) - 90m³ / 40t',
            'tir_mega': '🚛 Tır (Mega Dorse) - 100m³ / 40t',
            'tir_jumbo': '🚛 Tır (Jumbo Dorse) - 120m³ / 40t',
            'tir_tent': '🚛 Tır (Tenteli Dorse) - 40t',
            'tir_frigo': '🧊 Tır (Frigorifik Dorse - Isı Kontrollü) - 40t',
            'tir_container': '📦 Tır (Konteyner Taşıyıcı) - 40t',
            'tir_platform': '🏗️ Tır (Platform) - 40t',
            'tir_frigo_dual': '🧊 Tır (Frigorifik Çift Isı) - 40t',
            'van_3': '🚐 Kargo Van - 3m³ (1000kg)',
            'van_6': '🚐 Kargo Van - 6m³ (1500kg)',
            'van_10': '🚐 Kargo Van - 10m³ (2000kg)',
            'van_15': '🚐 Kargo Van - 15m³ (2500kg)',
            // Sea vehicles
            'container_20dc': '🚢 20\' Standart (20DC) - 33m³ / 28t',
            'container_40dc': '🚢 40\' Standart (40DC) - 67m³ / 28t',
            'container_40hc': '🚢 40\' Yüksek (40HC) - 76m³ / 28t',
            'container_20ot': '🚢 20\' Open Top - 32m³ / 28t',
            'container_40ot': '🚢 40\' Open Top - 66m³ / 28t',
            'container_20fr': '🚢 20\' Flat Rack - 28t',
            'container_40fr': '🚢 40\' Flat Rack - 40t',
            'container_20rf': '❄️ 20\' Reefer - 28m³ / 25t',
            'container_40rf': '❄️ 40\' Reefer - 60m³ / 25t',
            'bulk_handysize': '🚢 Handysize (10,000-35,000 DWT)',
            'bulk_handymax': '🚢 Handymax (35,000-60,000 DWT)',
            'bulk_panamax': '🚢 Panamax (60,000-80,000 DWT)',
            'bulk_capesize': '🚢 Capesize (80,000+ DWT)',
            'general_small': '🚢 Küçük Tonaj (1,000-5,000 DWT)',
            'general_medium': '🚢 Orta Tonaj (5,000-15,000 DWT)',
            'general_large': '🚢 Büyük Tonaj (15,000+ DWT)',
            'tanker_product': '🛢️ Ürün Tankeri (10,000-60,000 DWT)',
            'tanker_chemical': '🛢️ Kimyasal Tanker (5,000-40,000 DWT)',
            'tanker_crude': '🛢️ Ham Petrol Tankeri (60,000+ DWT)',
            'tanker_lpg': '🛢️ LPG Tankeri (5,000-80,000 m³)',
            'tanker_lng': '🛢️ LNG Tankeri (150,000-180,000 m³)',
            'roro_small': '🚗 Küçük RO-RO (100-200 araç)',
            'roro_medium': '🚗 Orta RO-RO (200-500 araç)',
            'roro_large': '🚗 Büyük RO-RO (500+ araç)',
            'ferry_cargo': '⛴️ Kargo Feribotu',
            'ferry_mixed': '⛴️ Karma Feribot (Yolcu+Yük)',
            'cargo_small': '🚤 Küçük Yük Teknesi (500-1,000 DWT)',
            'cargo_large': '🚤 Büyük Yük Teknesi (1,000+ DWT)',
            // Air vehicles
            'standard_cargo': '✈️ Standart Kargo',
            'large_cargo': '✈️ Büyük Hacimli Kargo',
            'special_cargo': '✈️ Özel Kargo',
            // Rail vehicles
            'open_wagon': '🚂 Açık Yük Vagonu',
            'closed_wagon': '🚂 Kapalı Yük Vagonu',
            'container_wagon': '🚂 Konteyner Vagonu',
            'tanker_wagon': '🚂 Tanker Vagonu'
        };
        return vehicleTypeMapping[vehicleCode] || `🚛 ${vehicleCode}`;
    }
    return (_jsxs("div", { className: "rounded-3xl shadow-lg p-8 bg-white border border-gray-200 space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("span", { className: "text-lg font-bold text-gray-900", children: listing.listing_number }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: listing.title }), _jsx("span", { className: "ml-auto px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-semibold", children: listing.status })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "A\u00E7\u0131klama" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.description })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ta\u015F\u0131ma Modu" }), _jsx("div", { className: "mb-2", children: getTransportModeDisplay(listing.transport_mode) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kalk\u0131\u015F B\u00F6lgesi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.origin })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Var\u0131\u015F B\u00F6lgesi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.destination })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ara\u00E7 Tipi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.vehicle_types && listing.vehicle_types.length > 0
                                    ? listing.vehicle_types.map(vehicleCode => getVehicleTypeLabel(vehicleCode)).join(', ')
                                    : 'Belirtilmemiş' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: listing.transport_mode === 'sea' ? 'Gross Tonnage' : 'Kapasite' }), _jsx("div", { className: "text-gray-800 mb-2", children: getCapacityInfo() })] }), listing.transport_mode !== 'sea' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bo\u015Fta Olma Tarihi" }), _jsx("div", { className: "text-gray-800 mb-2", children: formatDate(listing.available_from_date) })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0130leti\u015Fim Bilgileri" }), _jsx("div", { className: "text-gray-800 mb-2", children: contactInfo?.contact }), contactInfo?.company_name && (_jsxs("div", { className: "text-gray-600 text-xs", children: ["Firma: ", contactInfo?.company_name] }))] }), listing.required_documents && listing.required_documents.length > 0 && (_jsxs("div", { className: "col-span-1 md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Gerekli Evraklar" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("ul", { className: "list-disc list-inside space-y-1", children: listing.required_documents.map((doc, index) => (_jsx("li", { className: "text-gray-700 text-sm", children: doc }, index))) }) })] })), listing.transport_mode === 'road' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Plaka / \u015Easi No" }), transportDetails?.plate_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Plaka/\u015Easi: ", transportDetails.plate_number] }))] })), listing.transport_mode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Gemi Ad\u0131" }), transportDetails?.ship_name && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Gemi Ad\u0131: ", transportDetails.ship_name] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "IMO No" }), transportDetails?.imo_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["IMO No: ", transportDetails.imo_number] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "MMSI No" }), transportDetails?.mmsi_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["MMSI No: ", transportDetails.mmsi_number] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "DWT / Tonaj" }), transportDetails?.dwt && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["DWT/Tonaj: ", transportDetails.dwt] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Boyutlar" }), transportDetails?.ship_dimensions && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Boyutlar: ", transportDetails.ship_dimensions] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Laycan Ba\u015Flang\u0131\u00E7" }), _jsx("div", { className: "text-gray-800 mb-2", children: transportDetails?.laycan_start
                                            ? formatDate(transportDetails.laycan_start)
                                            : formatDate(listing.available_from_date) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Laycan Biti\u015F" }), _jsx("div", { className: "text-gray-800 mb-2", children: transportDetails?.laycan_end
                                            ? formatDate(transportDetails.laycan_end)
                                            : 'Belirtilmemiş' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Navlun Tipi" }), transportDetails?.freight_type && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Navlun Tipi: ", transportDetails.freight_type] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Charterer / Broker" }), transportDetails?.charterer_info && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Charterer/Broker: ", transportDetails.charterer_info] }))] })] })), listing.transport_mode === 'air' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "U\u00E7u\u015F Numaras\u0131" }), transportDetails?.flight_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["U\u00E7u\u015F Numaras\u0131: ", transportDetails.flight_number] }))] })), listing.transport_mode === 'rail' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tren/Kompozisyon No" }), transportDetails?.train_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Tren/Kompozisyon No: ", transportDetails.train_number] }))] }))] })] }));
};
export default TransportServiceDetailSection;
