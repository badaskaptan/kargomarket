import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Truck, Ship, Plane, Train, MapPin, Calendar, Package, Building, Phone, FileText } from 'lucide-react';
const TransportServiceDetailSection = ({ listing }) => {
    const { metadata } = listing;
    const transportDetails = metadata?.transport_details;
    const contactInfo = metadata?.contact_info;
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
        // 1. Önce legacy capacity alanını kontrol et (mevcut veriler için)
        const legacyCapacity = listing.capacity;
        if (legacyCapacity && legacyCapacity !== null && legacyCapacity !== '') {
            return String(legacyCapacity);
        }
        // 2. Ana listing alanlarını kontrol et (yeni veriler için)
        if (listing.weight_value && listing.weight_value > 0) {
            const unit = listing.weight_unit || 'kg';
            return `${listing.weight_value} ${unit}`;
        }
        if (listing.volume_value && listing.volume_value > 0) {
            const unit = listing.volume_unit || 'm³';
            return `${listing.volume_value} ${unit}`;
        }
        // 3. Metadata'daki genel capacity kontrolü
        if (transportDetails?.capacity) {
            return String(transportDetails.capacity);
        }
        // 4. Taşıma moduna özel alanları kontrol et (son çare)
        switch (listing.transport_mode) {
            case 'road':
                if (transportDetails?.truck_capacity) {
                    return String(transportDetails.truck_capacity);
                }
                if (transportDetails?.load_capacity) {
                    return String(transportDetails.load_capacity);
                }
                break;
            case 'rail':
                if (transportDetails?.wagon_capacity) {
                    return String(transportDetails.wagon_capacity);
                }
                if (transportDetails?.train_capacity) {
                    return String(transportDetails.train_capacity);
                }
                break;
            case 'sea':
                if (transportDetails?.ship_capacity) {
                    return String(transportDetails.ship_capacity);
                }
                if (transportDetails?.cargo_capacity) {
                    return String(transportDetails.cargo_capacity);
                }
                break;
            case 'air':
                if (transportDetails?.payload) {
                    return String(transportDetails.payload);
                }
                if (transportDetails?.cargo_weight) {
                    return String(transportDetails.cargo_weight);
                }
                break;
        }
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
    return (_jsxs("div", { className: "bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "bg-white/20 p-3 rounded-xl backdrop-blur-sm", children: [listing.transport_mode === 'road' && _jsx(Truck, { className: "w-6 h-6" }), listing.transport_mode === 'sea' && _jsx(Ship, { className: "w-6 h-6" }), listing.transport_mode === 'air' && _jsx(Plane, { className: "w-6 h-6" }), listing.transport_mode === 'rail' && _jsx(Train, { className: "w-6 h-6" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: listing.title }), _jsxs("p", { className: "text-white/80 text-sm mt-1", children: ["\u0130lan No: ", listing.listing_number] })] })] }), _jsx("div", { className: "bg-green-500/20 px-4 py-2 rounded-xl backdrop-blur-sm", children: _jsx("span", { className: "text-white font-medium capitalize", children: listing.status }) })] }) }), _jsxs("div", { className: "p-8 space-y-8", children: [listing.description && (_jsxs("div", { className: "bg-blue-50 rounded-xl p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-3 flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "A\u00E7\u0131klama"] }), _jsx("p", { className: "text-blue-800 leading-relaxed", children: listing.description })] })), _jsxs("div", { className: "bg-indigo-50 rounded-xl p-6 border border-indigo-200", children: [_jsx("h3", { className: "text-lg font-semibold text-indigo-900 mb-3", children: "Ta\u015F\u0131ma Modu" }), _jsx("div", { children: getTransportModeDisplay(listing.transport_mode) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-green-50 rounded-xl p-6 border border-green-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-green-900 mb-4 flex items-center", children: [_jsx(MapPin, { className: "w-5 h-5 mr-2" }), "Kalk\u0131\u015F B\u00F6lgesi"] }), _jsx("p", { className: "text-green-800 text-lg font-medium", children: listing.origin })] }), _jsxs("div", { className: "bg-orange-50 rounded-xl p-6 border border-orange-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-orange-900 mb-4 flex items-center", children: [_jsx(MapPin, { className: "w-5 h-5 mr-2" }), "Var\u0131\u015F B\u00F6lgesi"] }), _jsx("p", { className: "text-orange-800 text-lg font-medium", children: listing.destination })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-purple-50 rounded-xl p-6 border border-purple-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-purple-900 mb-4 flex items-center", children: [_jsx(Truck, { className: "w-5 h-5 mr-2" }), "Ara\u00E7 Tipi"] }), _jsx("p", { className: "text-purple-800 font-medium", children: listing.vehicle_types && listing.vehicle_types.length > 0
                                            ? listing.vehicle_types.map(vehicleCode => getVehicleTypeLabel(vehicleCode)).join(', ')
                                            : 'Belirtilmemiş' })] }), _jsxs("div", { className: "bg-cyan-50 rounded-xl p-6 border border-cyan-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-cyan-900 mb-4 flex items-center", children: [_jsx(Package, { className: "w-5 h-5 mr-2" }), listing.transport_mode === 'sea' ? 'Gross Tonnage' : 'Kapasite'] }), _jsx("p", { className: "text-cyan-800 text-lg font-medium", children: getCapacityInfo() })] })] }), listing.transport_mode !== 'sea' ? (_jsxs("div", { className: "bg-yellow-50 rounded-xl p-6 border border-yellow-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-yellow-900 mb-4 flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Bo\u015Fta Olma Tarihi"] }), _jsx("p", { className: "text-yellow-800 font-medium", children: formatDate(listing.available_from_date) })] })) : null, _jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Building, { className: "w-5 h-5 mr-2" }), "\u0130leti\u015Fim Bilgileri"] }), _jsxs("div", { className: "space-y-3", children: [contactInfo?.contact_info ? (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Phone, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-800", children: String(contactInfo.contact_info) })] })) : null, contactInfo?.company_name ? (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Building, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-800 font-medium", children: String(contactInfo.company_name) })] })) : null] })] }), listing.required_documents && listing.required_documents.length > 0 && (_jsxs("div", { className: "bg-amber-50 rounded-xl p-6 border border-amber-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-amber-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Gerekli Evraklar"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: listing.required_documents.map((doc, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-amber-500 rounded-full" }), _jsx("span", { className: "text-amber-800 text-sm", children: doc })] }, index))) })] })), (listing.transport_mode === 'road' && transportDetails?.plate_number) ? (_jsxs("div", { className: "bg-yellow-50 rounded-xl p-6 border border-yellow-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-yellow-900 mb-4 flex items-center", children: [_jsx(Truck, { className: "w-5 h-5 mr-2" }), "Karayolu Detaylar\u0131"] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm font-medium text-yellow-700", children: "Plaka:" }), _jsx("span", { className: "text-yellow-800 font-medium", children: String(transportDetails.plate_number) })] })] })) : null, listing.transport_mode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-blue-50 rounded-xl p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Laycan Ba\u015Flang\u0131\u00E7"] }), _jsx("p", { className: "text-blue-800 font-medium", children: transportDetails?.laycan_start
                                                    ? formatDate(String(transportDetails.laycan_start))
                                                    : formatDate(listing.available_from_date) })] }), _jsxs("div", { className: "bg-blue-50 rounded-xl p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Laycan Biti\u015F"] }), _jsx("p", { className: "text-blue-800 font-medium", children: transportDetails?.laycan_end
                                                    ? formatDate(String(transportDetails.laycan_end))
                                                    : 'Belirtilmemiş' })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-xl p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx(Ship, { className: "w-5 h-5 mr-2" }), "Denizyolu Detaylar\u0131"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [transportDetails?.ship_name ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "Gemi Ad\u0131:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.ship_name) })] })) : null, transportDetails?.imo_number ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "IMO No:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.imo_number) })] })) : null, transportDetails?.mmsi_number ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "MMSI No:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.mmsi_number) })] })) : null, transportDetails?.dwt ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "DWT:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.dwt) })] })) : null, transportDetails?.ship_dimensions ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "Boyutlar:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.ship_dimensions) })] })) : null, transportDetails?.freight_type ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "Navlun Tipi:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.freight_type) })] })) : null, transportDetails?.charterer_info ? (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-700", children: "Charterer:" }), _jsx("span", { className: "text-blue-800 font-medium", children: String(transportDetails.charterer_info) })] })) : null] })] })] })), (listing.transport_mode === 'air' && transportDetails?.flight_number) ? (_jsxs("div", { className: "bg-cyan-50 rounded-xl p-6 border border-cyan-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-cyan-900 mb-4 flex items-center", children: [_jsx(Plane, { className: "w-5 h-5 mr-2" }), "Havayolu Detaylar\u0131"] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm font-medium text-cyan-700", children: "U\u00E7u\u015F Numaras\u0131:" }), _jsx("span", { className: "text-cyan-800 font-medium", children: String(transportDetails.flight_number) })] })] })) : null, (listing.transport_mode === 'rail' && transportDetails?.train_number) ? (_jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Train, { className: "w-5 h-5 mr-2" }), "Demiryolu Detaylar\u0131"] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Tren/Kompozisyon No:" }), _jsx("span", { className: "text-gray-800 font-medium", children: String(transportDetails.train_number) })] })] })) : null] })] }));
};
export default TransportServiceDetailSection;
