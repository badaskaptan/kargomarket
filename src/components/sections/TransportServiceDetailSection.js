import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Truck, Ship, Plane, Train } from 'lucide-react';
const TransportServiceDetailSection = ({ listing }) => {
    const { metadata } = listing;
    const transportDetails = metadata?.transport_details || {};
    const contactInfo = metadata?.contact_info || {};
    const requiredDocuments = metadata?.required_documents || [];
    // Araç tipi çevirisi için mapping fonksiyonu
    function getVehicleTypeLabel(vehicleCode) {
        const vehicleTypes = {
            // Karayolu araçları
            'truck_3_5_open': '🚚 Kamyonet Açık (3.5 ton)',
            'truck_3_5_closed': '🚚 Kamyonet Kapalı (3.5 ton)',
            'truck_7_5': '🚛 Kamyon (7.5 ton)',
            'truck_10': '🚛 Kamyon (10 ton)',
            'truck_15': '🚛 Kamyon (15 ton)',
            'truck_20': '🚛 Kamyon (20 ton)',
            'truck_24': '🚛 Kamyon (24 ton)',
            'truck_27': '🚛 Kamyon (27 ton)',
            'truck_30': '🚛 Kamyon (30 ton)',
            'truck_40': '🚛 Kamyon (40 ton)',
            'tir': '🚛 Tır',
            'tir_lowbed': '🚛 Tır Lowbed',
            'tir_mega': '🚛 Tır Mega',
            'tir_jumbo': '🚛 Tır Jumbo',
            'tir_frigo': '❄️ Tır Frigo',
            'tir_tanker': '🛢️ Tır Tanker',
            'tir_container': '📦 Tır Konteyner',
            'van': '🚐 Van',
            'pickup': '🛻 Pickup',
            'refrigerated': '❄️ Soğutuculu Araç',
            'flatbed': '🚛 Açık Platform',
            'box_truck': '📦 Kapalı Kasa',
            'tanker_truck': '🛢️ Tanker Kamyon',
            'car_carrier': '🚗 Araç Taşıyıcı',
            'livestock_carrier': '🐄 Canlı Hayvan Taşıyıcı',
            
            // Denizyolu araçları
            'container_20': '📦 20ft Konteyner',
            'container_40': '📦 40ft Konteyner',
            'container_40hc': '📦 40ft HC Konteyner',
            'container_45': '📦 45ft Konteyner',
            'container_20rf': '❄️ 20ft Reefer Konteyner',
            'container_40rf': '❄️ 40ft Reefer Konteyner',
            'container_20ot': '📦 20ft Open Top Konteyner',
            'container_40ot': '📦 40ft Open Top Konteyner',
            'container_20fr': '📦 20ft Flat Rack Konteyner',
            'container_40fr': '📦 40ft Flat Rack Konteyner',
            'bulk_carrier': '🚢 Dökme Yük Gemisi',
            'general_cargo': '🚢 Genel Kargo Gemisi',
            'tanker_ship': '🛢️ Tanker Gemisi',
            'ro_ro': '🚢 Ro-Ro Gemisi',
            'ferry': '⛴️ Feribot',
            'barge': '🚢 Mavna',
            'breakbulk': '📦 Parça Yük Gemisi',
            'heavy_lift': '🏗️ Ağır Kaldırma Gemisi',
            'project_cargo': '🚢 Proje Yükü Gemisi',
            
            // Havayolu araçları
            'air_cargo': '✈️ Hava Kargo',
            'air_express': '✈️ Hava Ekspres',
            'air_charter': '✈️ Charter Uçak',
            'air_passenger': '✈️ Yolcu Uçağı',
            'air_freighter': '✈️ Kargo Uçağı',
            'helicopter': '🚁 Helikopter',
            
            // Demiryolu araçları
            'container_wagon': '🚂 Konteyner Vagonu',
            'flatcar': '🚂 Düz Vagon',
            'boxcar': '🚂 Kapalı Vagon',
            'tanker_wagon': '🚂 Tanker Vagonu',
            'hopper_wagon': '🚂 Bunker Vagonu',
            'refrigerated_wagon': '❄️ Soğutuculu Vagon',
            'livestock_wagon': '🐄 Hayvan Vagonu',
            'automobile_wagon': '🚗 Otomobil Vagonu',
            'timber_wagon': '🌲 Kereste Vagonu',
            'coal_wagon': '⚫ Kömür Vagonu',
            'grain_wagon': '🌾 Tahıl Vagonu',
            'chemical_wagon': '⚗️ Kimyasal Vagon',
            'open_wagon': '🚂 Açık Yük Vagonu',
            'covered_wagon': '🚂 Kapalı Yük Vagonu',
            'special_wagon': '🚂 Özel Amaçlı Vagon',
            
            // Diğer
            'large_cargo': '📦 Büyük Kargo',
            'oversized': '📏 Geniş/Uzun Yük',
            'dangerous_goods': '⚠️ Tehlikeli Madde',
            'perishable': '🥬 Bozulabilir Ürün',
            'fragile': '🔍 Kırılabilir',
            'valuable': '💎 Değerli Eşya',
            'live_animals': '🐾 Canlı Hayvan',
            'vehicles': '🚗 Araç',
            'machinery': '⚙️ Makine/Ekipman',
            'construction': '🏗️ İnşaat Malzemesi'
        };
        
        return vehicleTypes[vehicleCode] || vehicleCode;
    }
    
    // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD-MM-YYYY)
    function formatDate(dateString) {
        if (!dateString) return 'Belirtilmemiş';
        
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
    
    // Kapasite bilgisini taşıma moduna göre akıllı şekilde getir
    function getCapacityInfo() {
        console.log('🎯 JS getCapacityInfo called for mode:', listing.transport_mode);
        console.log('🎯 JS Checking weight_value:', listing.weight_value, 'type:', typeof listing.weight_value);
        console.log('🎯 JS Checking volume_value:', listing.volume_value, 'type:', typeof listing.volume_value);
        console.log('🎯 JS Checking legacy capacity field:', listing.capacity, 'type:', typeof listing.capacity);
        console.log('🎯 JS Checking transportDetails.capacity:', transportDetails?.capacity);
        
        // 1. Önce legacy capacity alanını kontrol et (mevcut veriler için)
        if (listing.capacity && listing.capacity !== null && listing.capacity !== '') {
            console.log('✅ JS Found legacy capacity:', listing.capacity);
            return String(listing.capacity);
        }

        // 2. Ana listing alanlarını kontrol et (yeni veriler için)
        if (listing.weight_value && listing.weight_value > 0) {
            const unit = listing.weight_unit || 'kg';
            console.log('✅ JS Found weight_value:', listing.weight_value, unit);
            return `${listing.weight_value} ${unit}`;
        }

        if (listing.volume_value && listing.volume_value > 0) {
            const unit = listing.volume_unit || 'm³';
            console.log('✅ JS Found volume_value:', listing.volume_value, unit);
            return `${listing.volume_value} ${unit}`;
        }

        // 3. Metadata'daki genel capacity kontrolü
        if (transportDetails?.capacity) {
            console.log('✅ JS Found transportDetails.capacity:', transportDetails.capacity);
            return transportDetails.capacity;
        }

        // 4. Taşıma moduna özel alanları kontrol et (son çare)
        switch (listing.transport_mode) {
            case 'road':
                if (transportDetails?.truck_capacity) {
                    console.log('✅ JS Found truck_capacity:', transportDetails.truck_capacity);
                    return transportDetails.truck_capacity;
                }
                if (transportDetails?.load_capacity) {
                    console.log('✅ JS Found load_capacity:', transportDetails.load_capacity);
                    return transportDetails.load_capacity;
                }
                break;
                
            case 'rail':
                if (transportDetails?.wagon_capacity) {
                    console.log('✅ JS Found wagon_capacity:', transportDetails.wagon_capacity);
                    return transportDetails.wagon_capacity;
                }
                if (transportDetails?.train_capacity) {
                    console.log('✅ JS Found train_capacity:', transportDetails.train_capacity);
                    return transportDetails.train_capacity;
                }
                break;
                
            case 'sea':
                // Denizyolu için DWT'yi kapasite olarak kullanmayalım (duplikasyon önlemek için)
                if (transportDetails?.ship_capacity) {
                    console.log('✅ JS Found ship_capacity:', transportDetails.ship_capacity);
                    return transportDetails.ship_capacity;
                }
                if (transportDetails?.cargo_capacity) {
                    console.log('✅ JS Found cargo_capacity:', transportDetails.cargo_capacity);
                    return transportDetails.cargo_capacity;
                }
                break;
                
            case 'air':
                if (transportDetails?.payload) {
                    console.log('✅ JS Found payload:', transportDetails.payload);
                    return transportDetails.payload;
                }
                if (transportDetails?.cargo_weight) {
                    console.log('✅ JS Found cargo_weight:', transportDetails.cargo_weight);
                    return transportDetails.cargo_weight;
                }
                break;
        }

        console.log('❌ JS No capacity found, showing default');
        return 'Belirtilmemiş';
    }

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
    return (_jsxs("div", { className: "rounded-3xl shadow-lg p-8 bg-white border border-gray-200 space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("span", { className: "text-lg font-bold text-gray-900", children: listing.listing_number }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: listing.title }), _jsx("span", { className: "ml-auto px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-semibold", children: listing.status })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "A\u00E7\u0131klama" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.description })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ta\u015F\u0131ma Modu" }), _jsx("div", { className: "mb-2", children: getTransportModeDisplay(listing.transport_mode) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kalk\u0131\u015F B\u00F6lgesi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.origin })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Var\u0131\u015F B\u00F6lgesi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.destination })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ara\u00E7 Tipi" }), _jsx("div", { className: "text-gray-800 mb-2", children: listing.vehicle_types ? listing.vehicle_types.map(vehicleCode => getVehicleTypeLabel(vehicleCode)).join(', ') : 'Belirtilmemiş' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kapasite" }), _jsx("div", { className: "text-gray-800 mb-2", children: getCapacityInfo() })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bo\u015Fta Olma Tarihi" }), _jsx("div", { className: "text-gray-800 mb-2", children: formatDate(listing.available_from_date) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0130leti\u015Fim Bilgileri" }), _jsx("div", { className: "text-gray-800 mb-2", children: contactInfo?.contact }), contactInfo?.company_name && (_jsxs("div", { className: "text-gray-600 text-xs", children: ["Firma: ", contactInfo?.company_name] }))] }), listing.transport_mode === 'road' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Plaka / \u015Easi No" }), transportDetails?.plate_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Plaka/\u015Easi: ", transportDetails.plate_number] }))] })), listing.transport_mode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Gemi Ad\u0131" }), transportDetails?.ship_name && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Gemi Ad\u0131: ", transportDetails.ship_name] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "IMO No" }), transportDetails?.imo_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["IMO No: ", transportDetails.imo_number] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "MMSI No" }), transportDetails?.mmsi_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["MMSI No: ", transportDetails.mmsi_number] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "DWT / Tonaj" }), transportDetails?.dwt && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["DWT/Tonaj: ", transportDetails.dwt] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Boyutlar" }), transportDetails?.ship_dimensions && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Boyutlar: ", transportDetails.ship_dimensions] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Laycan Ba\u015Flang\u0131\u00E7" }), transportDetails?.laycan_start && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Laycan Ba\u015Flang\u0131\u00E7: ", transportDetails.laycan_start] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Laycan Biti\u015F" }), transportDetails?.laycan_end && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Laycan Biti\u015F: ", transportDetails.laycan_end] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Navlun Tipi" }), transportDetails?.freight_type && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Navlun Tipi: ", transportDetails.freight_type] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Charterer / Broker" }), transportDetails?.charterer_info && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Charterer/Broker: ", transportDetails.charterer_info] }))] })] })), listing.transport_mode === 'air' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "U\u00E7u\u015F Numaras\u0131" }), transportDetails?.flight_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["U\u00E7u\u015F Numaras\u0131: ", transportDetails.flight_number] }))] })), listing.transport_mode === 'rail' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tren/Kompozisyon No" }), transportDetails?.train_number && (_jsxs("div", { className: "text-gray-800 mb-2", children: ["Tren/Kompozisyon No: ", transportDetails.train_number] }))] }))] }), requiredDocuments?.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Gerekli Evraklar" }), _jsx("div", { className: "text-gray-800 mb-2", children: requiredDocuments.join(', ') })] }))] }));
};
export default TransportServiceDetailSection;
