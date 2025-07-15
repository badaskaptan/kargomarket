import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Pause, Play, Trash2, Eye, MapPin, Package, Calendar, Loader2, FileText, Image as ImageIcon, ExternalLink, X, BarChart3, Truck, Ship, Plane, Train, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import { TransportServiceService } from '../../services/transportServiceNew';
import EditModalLoadListing from './EditModalLoadListing';
import EditModalShipmentRequest from './EditModalShipmentRequest';
import EditModalTransportService from './EditModalTransportService';
import TransportServiceDetailSection from './TransportServiceDetailSection';
const MyListingsSection = () => {
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [transportServices, setTransportServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [editListing, setEditListing] = useState(null);
    const [relatedLoadListing, setRelatedLoadListing] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');
    // Kullanıcının ilanlarını ve nakliye hizmetlerini yükle
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) {
                console.log('❌ No user found');
                return;
            }
            try {
                console.log('🔄 Loading data for user:', user.id);
                setLoading(true);
                // Paralel olarak her ikisini de yükle
                const [userListings, userTransportServices] = await Promise.all([
                    ListingService.getUserListings(user.id),
                    TransportServiceService.getUserServices(user.id)
                ]);
                console.log('✅ User listings loaded:', userListings);
                console.log('✅ User transport services loaded:', userTransportServices);
                setListings(userListings);
                setTransportServices(userTransportServices);
            }
            catch (error) {
                console.error('❌ Error loading user data:', error);
                // Hata durumunda da loading'i false yap
                setListings([]);
                setTransportServices([]);
            }
            finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [user]);
    // Arama filtreleri
    const filteredListings = listings.filter(listing => listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.load_type?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTransportServices = transportServices.filter(service => service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.ship_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleTogglePause = async (listing) => {
        try {
            const newStatus = listing.status === 'active' ? 'paused' : 'active';
            await ListingService.updateListing(listing.id, { status: newStatus });
            setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
            console.log(`✅ Listing ${newStatus === 'active' ? 'activated' : 'paused'}`);
        }
        catch (error) {
            console.error('Error toggling listing status:', error);
        }
    };
    const handleDeleteListing = async (listing) => {
        if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?'))
            return;
        try {
            await ListingService.deleteListing(listing.id);
            setListings(prev => prev.filter(l => l.id !== listing.id));
            console.log('✅ Listing deleted');
        }
        catch (error) {
            console.error('Error deleting listing:', error);
        }
    };
    const handleUpdateListing = (updatedListing) => {
        setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
        console.log('✅ Listing updated');
    };
    // Fetch related load listing details
    const fetchRelatedLoadListing = async (relatedLoadListingId) => {
        try {
            const relatedListing = await ListingService.getListingById(relatedLoadListingId);
            setRelatedLoadListing(relatedListing);
        }
        catch (error) {
            console.error('Error fetching related load listing:', error);
            setRelatedLoadListing(null);
        }
    };
    // Effect to fetch related load listing when selectedListing changes
    useEffect(() => {
        if (selectedListing?.related_load_listing_id) {
            fetchRelatedLoadListing(selectedListing.related_load_listing_id);
        }
        else {
            setRelatedLoadListing(null);
        }
    }, [selectedListing?.related_load_listing_id]);
    // Transport Service Handler Functions
    const handleTransportServiceStatusUpdate = async (transportServiceId, newStatus) => {
        try {
            console.log('Updating transport service status...');
            await TransportServiceService.updateService(transportServiceId, { status: newStatus });
            // Update the local state
            setTransportServices(prev => prev.map(ts => ts.id === transportServiceId ? { ...ts, status: newStatus } : ts));
            console.log('✅ Transport service status updated');
        }
        catch (error) {
            console.error('Error updating transport service status:', error);
        }
    };
    const handleTransportServiceEdit = (transportService) => {
        // TODO: Implement edit functionality
        console.log('Edit transport service:', transportService);
    };
    const handleTransportServiceView = (transportService) => {
        // TODO: Implement view functionality  
        console.log('View transport service:', transportService);
    };
    const handleTransportServiceDelete = async (transportServiceId) => {
        if (window.confirm('Bu nakliye hizmetini silmek istediğinizden emin misiniz?')) {
            try {
                console.log('Deleting transport service...');
                await TransportServiceService.deleteService(transportServiceId);
                // Remove from local state
                setTransportServices(prev => prev.filter(ts => ts.id !== transportServiceId));
                console.log('✅ Transport service deleted');
            }
            catch (error) {
                console.error('Error deleting transport service:', error);
            }
        }
    };
    // Yardımcı fonksiyonlar
    const getListingTypeBadge = (type) => {
        const config = {
            'load_listing': { label: 'Yük İlanı', color: 'bg-blue-100 text-blue-800' },
            'shipment_request': { label: 'Nakliye Talebi', color: 'bg-green-100 text-green-800' },
            'transport_service': { label: 'Taşıma Hizmeti', color: 'bg-purple-100 text-purple-800' }
        };
        const { label, color } = config[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
        return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`, children: label }));
    };
    const getStatusBadge = (status) => {
        const config = {
            'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
            'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
            'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
            'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
            'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' },
            'inactive': { label: 'Pasif', color: 'bg-gray-100 text-gray-800' },
            'suspended': { label: 'Askıya Alındı', color: 'bg-red-100 text-red-800' }
        };
        const { label, color } = config[status] || { label: 'Taslak', color: 'bg-gray-100 text-gray-800' };
        return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`, children: label }));
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
        const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateString.match(datePattern);
        if (match) {
            const [, year, month, day] = match;
            return `${day}-${month}-${year}`;
        }
        // Eğer ISO tarih formatındaysa (YYYY-MM-DDTHH:mm:ss), sadece tarih kısmını al
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return `${day}-${month}-${year}`;
        }
        // Fallback: Date objesini kullan
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        catch {
            return dateString;
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u0130lanlar y\u00FCkleniyor..." })] }));
    }
    // Debug bilgileri
    console.log('🔍 Debug Info:', {
        user: user ? { id: user.id, email: user.email } : null,
        loading,
        listingsCount: listings.length,
        listings: listings.slice(0, 2) // İlk 2 ilanı log'la
    });
    // Eğer user yoksa hata mesajı göster
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Oturumunuz Bulunamad\u0131" }), _jsx("p", { className: "text-gray-600", children: "L\u00FCtfen giri\u015F yap\u0131n\u0131z." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u0130lanlar\u0131m" }), _jsxs("p", { className: "mt-1 text-sm text-gray-600", children: [listings.length, " Y\u00FCk \u0130lan\u0131 \u2022 ", transportServices.length, " Nakliye Hizmeti"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setActiveSection('create-load-listing'), className: "inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Y\u00FCk \u0130lan\u0131"] }), _jsxs("button", { onClick: () => setActiveSection('create-transport-service'), className: "inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Nakliye Hizmeti"] })] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("button", { onClick: () => setActiveTab('listings'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'listings'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Package, { className: "h-4 w-4 inline mr-2" }), "Y\u00FCk \u0130lanlar\u0131 (", listings.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('transport_services'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'transport_services'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Truck, { className: "h-4 w-4 inline mr-2" }), "Nakliye Hizmetleri (", transportServices.length, ")"] })] }) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "\u0130lan ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500" })] }), activeTab === 'listings' ? (filteredListings.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }), searchTerm ? (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Arama sonucu bulunamad\u0131" }), _jsxs("p", { className: "text-gray-600", children: ["\"", searchTerm, "\" i\u00E7in hi\u00E7bir ilan bulunamad\u0131."] })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: listings.length === 0 ? 'Henüz hiç ilanınız yok' : 'İlan bulunamadı' }), _jsx("p", { className: "text-gray-600 mb-2", children: listings.length === 0
                                    ? 'İlk ilanınızı oluşturarak başlayın!'
                                    : `Toplam ${listings.length} ilanınız var ama filtreye uygun olan bulunamadı.` }), _jsxs("div", { className: "text-xs text-gray-400 mb-6", children: ["Debug: user_id=", user?.id, ", total_listings=", listings.length, ", loading=", loading.toString()] }), _jsxs("button", { onClick: () => setActiveSection('create-load-listing'), className: "inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "\u0130lan Olu\u015Ftur"] })] }))] })) : (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130lan Bilgisi" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Rota" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tarih" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Durum" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130\u015Flemler" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredListings.map((listing) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: listing.title }), _jsx("div", { className: "text-sm text-gray-500", children: listing.listing_type === 'transport_service'
                                                            ? (() => {
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
                                                                // Use vehicle_types if available, otherwise use load_type
                                                                const vehicleType = listing.vehicle_types && listing.vehicle_types.length > 0
                                                                    ? listing.vehicle_types[0]
                                                                    : listing.load_type;
                                                                console.log('🚛 VEHICLE TYPE DEBUG:', {
                                                                    listing_id: listing.id,
                                                                    listing_type: listing.listing_type,
                                                                    transport_mode: listing.transport_mode,
                                                                    vehicle_types: listing.vehicle_types,
                                                                    load_type: listing.load_type,
                                                                    selected_vehicleType: vehicleType,
                                                                    mapping_result: vehicleType ? vehicleTypeMapping[vehicleType] : null
                                                                });
                                                                return vehicleType ? (vehicleTypeMapping[vehicleType] || `🚛 ${vehicleType}`) : '🚛 Araç Tipi Belirtilmemiş';
                                                            })()
                                                            : listing.load_type })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-900", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 text-gray-400 mr-1" }), listing.origin] }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx(MapPin, { className: "h-4 w-4 text-gray-400 mr-1" }), listing.destination] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400 mr-1" }), _jsxs("div", { children: [_jsxs("div", { children: ["Y\u00FCkleme: ", formatDate(listing.loading_date)] }), _jsxs("div", { children: ["Teslimat: ", formatDate(listing.delivery_date)] })] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(listing.status) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900", title: "\u0130lan Detay\u0131n\u0131 G\u00F6r\u00FCnt\u00FCle", "aria-label": "\u0130lan Detay\u0131n\u0131 G\u00F6r\u00FCnt\u00FCle", onClick: () => setSelectedListing(listing), children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx("button", { className: "text-indigo-600 hover:text-indigo-900", title: "\u0130lan\u0131 D\u00FCzenle", "aria-label": "\u0130lan\u0131 D\u00FCzenle", onClick: () => setEditListing(listing), children: _jsx(Edit, { className: "h-4 w-4" }) }), listing.status === 'active' ? (_jsx("button", { className: "text-orange-600 hover:text-orange-900", title: "\u0130lan\u0131 Duraklat", "aria-label": "\u0130lan\u0131 Duraklat", onClick: () => handleTogglePause(listing), children: _jsx(Pause, { className: "h-4 w-4" }) })) : (_jsx("button", { className: "text-green-600 hover:text-green-900", title: "\u0130lan\u0131 Etkinle\u015Ftir", "aria-label": "\u0130lan\u0131 Etkinle\u015Ftir", onClick: () => handleTogglePause(listing), children: _jsx(Play, { className: "h-4 w-4" }) })), _jsx("button", { className: "text-red-600 hover:text-red-900", title: "\u0130lan\u0131 Sil", "aria-label": "\u0130lan\u0131 Sil", onClick: () => handleDeleteListing(listing), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, listing.id))) })] }) }) }))) : (
            // Transport Services Tab
            filteredTransportServices.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Truck, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }), searchTerm ? (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Arama sonucu bulunamad\u0131" }), _jsxs("p", { className: "text-gray-600", children: ["\"", searchTerm, "\" i\u00E7in hi\u00E7bir nakliye hizmeti bulunamad\u0131."] })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: transportServices.length === 0 ? 'Henüz hiç nakliye hizmetiniz yok' : 'Nakliye hizmeti bulunamadı' }), _jsx("p", { className: "text-gray-600 mb-2", children: transportServices.length === 0
                                    ? 'İlk nakliye hizmetinizi oluşturarak başlayın!'
                                    : `Toplam ${transportServices.length} nakliye hizmetiniz var ama filtreye uygun olan bulunamadı.` }), _jsxs("button", { onClick: () => setActiveSection('create-transport-service'), className: "inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Nakliye Hizmeti Olu\u015Ftur"] })] }))] })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: filteredTransportServices.map((service) => (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-purple-100 p-2 rounded-lg", children: _jsx(Truck, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: service.title }), _jsxs("p", { className: "text-sm text-gray-500", children: ["#", service.service_number] })] })] }), getStatusBadge(service.status)] }), service.description && (_jsx("p", { className: "text-sm text-gray-600 mb-4 line-clamp-2", children: service.description })), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "flex items-center space-x-2 mb-2", children: _jsxs("div", { className: "flex items-center space-x-1", children: [service.transport_mode === 'road' && _jsx(Truck, { className: "h-4 w-4 text-blue-500" }), service.transport_mode === 'sea' && _jsx(Ship, { className: "h-4 w-4 text-blue-500" }), service.transport_mode === 'air' && _jsx(Plane, { className: "h-4 w-4 text-blue-500" }), service.transport_mode === 'rail' && _jsx(Train, { className: "h-4 w-4 text-blue-500" }), _jsxs("span", { className: "text-sm font-medium text-gray-700 capitalize", children: [service.transport_mode === 'road' && 'Karayolu', service.transport_mode === 'sea' && 'Denizyolu', service.transport_mode === 'air' && 'Havayolu', service.transport_mode === 'rail' && 'Demiryolu'] })] }) }), service.vehicle_type && (_jsx("div", { className: "flex flex-wrap gap-1", children: _jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: service.vehicle_type }) }))] }), (service.origin || service.destination) && (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(MapPin, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { children: service.origin || 'Başlangıç' }), _jsx(ArrowRight, { className: "h-3 w-3 text-gray-400" }), _jsx("span", { children: service.destination || 'Varış' })] }) })), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4 text-sm", children: [(service.capacity_value || service.dwt) && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Kapasite:" }), _jsx("p", { className: "font-medium text-gray-900", children: service.capacity_value ? `${service.capacity_value} ${service.capacity_unit || 'kg'}` :
                                                    service.dwt ? `${service.dwt} DWT` : 'Belirtilmemiş' })] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Tip:" }), _jsx("p", { className: "font-medium text-gray-900", children: service.transport_mode === 'sea' ? 'Denizyolu' :
                                                    service.transport_mode === 'road' ? 'Karayolu' :
                                                        service.transport_mode === 'air' ? 'Havayolu' :
                                                            service.transport_mode === 'rail' ? 'Demiryolu' : 'Taşıma' })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4 text-center", children: [_jsxs("div", { className: "bg-gray-50 p-2 rounded", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: service.rating || '0.0' }), _jsx("div", { className: "text-xs text-gray-500", children: "Puan" })] }), _jsxs("div", { className: "bg-gray-50 p-2 rounded", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: service.view_count || '0' }), _jsx("div", { className: "text-xs text-gray-500", children: "G\u00F6r\u00FCnt\u00FClenme" })] }), _jsxs("div", { className: "bg-gray-50 p-2 rounded", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: service.rating_count || '0' }), _jsx("div", { className: "text-xs text-gray-500", children: "De\u011F." })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: () => handleTransportServiceView(service), className: "flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "G\u00F6r\u00FCnt\u00FCle"] }), _jsxs("button", { onClick: () => handleTransportServiceEdit(service), className: "flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors duration-200", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "D\u00FCzenle"] }), _jsx("div", { className: "relative", children: _jsx("button", { onClick: () => {
                                                const newStatus = service.status === 'active' ? 'inactive' : 'active';
                                                handleTransportServiceStatusUpdate(service.id, newStatus);
                                            }, title: service.status === 'active' ? 'Hizmeti Duraklatın' : 'Hizmeti Aktif Yapın', className: `inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${service.status === 'active'
                                                ? 'border border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                                                : 'border border-green-300 text-green-700 bg-green-50 hover:bg-green-100'}`, children: service.status === 'active' ? _jsx(Pause, { className: "h-4 w-4" }) : _jsx(Play, { className: "h-4 w-4" }) }) }), _jsx("button", { onClick: () => handleTransportServiceDelete(service.id), title: "Hizmeti Sil", className: "inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }, service.id))) }))), selectedListing && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-100", children: [_jsxs("div", { className: "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-6 rounded-t-2xl relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10" }) }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 p-3 rounded-xl backdrop-blur-sm", children: _jsx(Package, { className: "h-7 w-7 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "\u0130lan Detay\u0131" }), _jsx("p", { className: "text-white/80 text-sm mt-1", children: "Detayl\u0131 ilan bilgileri ve dosyalar" })] }), _jsx("div", { className: "transform scale-110", children: getListingTypeBadge(selectedListing.listing_type) })] }), _jsx("button", { onClick: () => setSelectedListing(null), className: "text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm", title: "Modal\u0131 Kapat", "aria-label": "Modal\u0131 Kapat", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-white/90 text-sm font-medium", children: "\u0130lan No:" }), _jsx("span", { className: "text-white font-bold text-lg", children: selectedListing.listing_number })] }) }), _jsx("div", { className: "transform scale-110", children: getStatusBadge(selectedListing.status) })] }), _jsx("div", { className: "text-white/80 text-sm bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), formatDate(selectedListing.created_at), " tarihinde olu\u015Fturuldu"] }) })] })] })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm", children: [selectedListing.owner_name && (_jsxs("div", { className: "mb-6 pb-6 border-b border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center", children: [_jsx("div", { className: "bg-indigo-100 p-2 rounded-lg mr-3", children: _jsx("span", { className: "text-xl", children: "\uD83D\uDC64" }) }), "\u0130lan Sahibi"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white rounded-lg p-4 border border-indigo-100", children: [_jsx("h4", { className: "text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide", children: "Ki\u015Fisel Bilgiler" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Ad Soyad" }), _jsx("div", { className: "text-gray-900 font-medium", children: selectedListing.owner_name })] }), selectedListing.owner_phone && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Telefon" }), _jsxs("div", { className: "text-gray-900 font-medium flex items-center", children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDCDE" }), selectedListing.owner_phone] })] })), selectedListing.owner_email && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "E-posta" }), _jsxs("div", { className: "text-gray-900 font-medium flex items-center", children: [_jsx("span", { className: "mr-2", children: "\u2709\uFE0F" }), selectedListing.owner_email] })] }))] })] }), (selectedListing.owner_company || selectedListing.owner_city || selectedListing.owner_address) && (_jsxs("div", { className: "bg-white rounded-lg p-4 border border-green-100", children: [_jsx("h4", { className: "text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide", children: "Firma Bilgileri" }), _jsxs("div", { className: "space-y-2", children: [selectedListing.owner_company && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "\u015Eirket Ad\u0131" }), _jsxs("div", { className: "text-gray-900 font-medium flex items-center", children: [_jsx("span", { className: "mr-2", children: "\uD83C\uDFE2" }), selectedListing.owner_company] })] })), selectedListing.owner_city && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "\u015Eehir" }), _jsxs("div", { className: "text-gray-900 font-medium flex items-center", children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDCCD" }), selectedListing.owner_city] })] })), selectedListing.owner_address && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Adres" }), _jsx("div", { className: "text-gray-900 font-medium text-sm", children: selectedListing.owner_address })] })), (selectedListing.owner_tax_office || selectedListing.owner_tax_number) && (_jsxs("div", { className: "pt-2 border-t border-gray-100", children: [selectedListing.owner_tax_office && (_jsxs("div", { className: "mb-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Vergi Dairesi:" }), _jsx("span", { className: "text-gray-700 text-sm ml-1", children: selectedListing.owner_tax_office })] })), selectedListing.owner_tax_number && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500", children: "Vergi No:" }), _jsx("span", { className: "text-gray-700 text-sm ml-1", children: selectedListing.owner_tax_number })] }))] }))] })] })), _jsxs("div", { className: "bg-white rounded-lg p-4 border border-orange-100", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide", children: "\u0130statistikler" }), _jsxs("div", { className: "space-y-2", children: [selectedListing.owner_rating && selectedListing.owner_rating > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "De\u011Ferlendirme" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-yellow-400 mr-1", children: "\u2B50" }), _jsxs("span", { className: "text-gray-900 font-medium", children: [selectedListing.owner_rating, "/5"] }), selectedListing.owner_rating_count && (_jsxs("span", { className: "text-xs text-gray-500 ml-1", children: ["(", selectedListing.owner_rating_count, ")"] }))] })] })), selectedListing.owner_total_listings && selectedListing.owner_total_listings > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Toplam \u0130lan" }), _jsx("div", { className: "text-gray-900 font-medium", children: selectedListing.owner_total_listings })] })), selectedListing.owner_total_completed_transactions && selectedListing.owner_total_completed_transactions > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Tamamlanan \u0130\u015Flem" }), _jsx("div", { className: "text-gray-900 font-medium", children: selectedListing.owner_total_completed_transactions })] })), selectedListing.owner_user_type && (_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Kullan\u0131c\u0131 Tipi" }), _jsx("div", { className: "text-gray-900 font-medium", children: selectedListing.owner_user_type === 'buyer_seller' ? '🛒 Alıcı/Satıcı' :
                                                                                                selectedListing.owner_user_type === 'carrier' ? '🚛 Taşıyıcı' :
                                                                                                    selectedListing.owner_user_type === 'both' ? '🔄 Karma' :
                                                                                                        selectedListing.owner_user_type })] }))] })] })] })] })), _jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-primary-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-6 w-6 text-primary-600" }) }), "\u0130lan Bilgileri"] }), _jsxs("div", { className: "bg-white rounded-xl p-6 border border-gray-200 shadow-sm", children: [_jsx("h4", { className: "text-xl font-semibold text-gray-900 mb-4 leading-relaxed", children: selectedListing.title }), selectedListing.description && (_jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400", children: _jsx("p", { className: "text-gray-700 leading-relaxed", children: selectedListing.description }) }))] })] }), selectedListing.listing_type === 'shipment_request' && (_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-green-100 p-2 rounded-lg mr-3", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDE9B" }) }), "Nakliye Talebi Detaylar\u0131"] }), _jsxs("div", { className: "space-y-4", children: [selectedListing.transport_mode && (_jsxs("div", { className: "bg-white rounded-xl p-4 border border-green-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide", children: "Ta\u015F\u0131ma Modu" }), _jsxs("div", { className: "text-gray-900 font-semibold text-lg flex items-center", children: [selectedListing.transport_mode === 'road' && '🚛 Karayolu', selectedListing.transport_mode === 'sea' && '🚢 Denizyolu', selectedListing.transport_mode === 'air' && '✈️ Havayolu', selectedListing.transport_mode === 'rail' && '🚂 Demiryolu', selectedListing.transport_mode === 'multimodal' && '🔄 Karma Taşımacılık'] })] })), selectedListing.vehicle_types && selectedListing.vehicle_types.length > 0 && (_jsxs("div", { className: "bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide", children: "Ara\u00E7 Tipi" }), _jsx("div", { className: "text-gray-900 font-semibold text-lg", children: (() => {
                                                                                const vehicleType = selectedListing.vehicle_types[0];
                                                                                // Araç tipi çeviri mapping'i
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
                                                                                return vehicleTypeMapping[vehicleType] || `🚛 ${vehicleType}`;
                                                                            })() }), selectedListing.vehicle_types.length > 1 && (_jsxs("div", { className: "text-sm text-blue-600 mt-1", children: ["+", selectedListing.vehicle_types.length - 1, " di\u011Fer ara\u00E7 tipi"] }))] })), selectedListing.related_load_listing_id && (_jsxs("div", { className: "bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide", children: "\u0130lgili Y\u00FCk \u0130lan\u0131" }), _jsx("div", { className: "text-gray-900 font-medium", children: relatedLoadListing ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-lg mr-2", children: "\uD83D\uDCE6" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-amber-900", children: relatedLoadListing.title }), _jsxs("div", { className: "text-sm text-amber-600", children: ["\u0130lan No: ", relatedLoadListing.listing_number] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "G\u00FCzergah:" }), " ", relatedLoadListing.origin, " \u2192 ", relatedLoadListing.destination] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Y\u00FCk Tipi:" }), " ", relatedLoadListing.load_type || 'Belirtilmemiş'] }), relatedLoadListing.weight_value && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "A\u011F\u0131rl\u0131k:" }), " ", relatedLoadListing.weight_value, " ", relatedLoadListing.weight_unit] })), relatedLoadListing.volume_value && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Hacim:" }), " ", relatedLoadListing.volume_value, " ", relatedLoadListing.volume_unit] }))] }), _jsx("div", { className: "text-xs text-amber-600 mt-2 italic", children: "Bu nakliye talebi yukar\u0131daki y\u00FCk ilan\u0131 i\u00E7in olu\u015Fturulmu\u015Ftur" })] })) : (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-lg mr-2", children: "\uD83D\uDCE6" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-gray-500", children: "Y\u00FCk ilan\u0131 y\u00FCkleniyor..." }), _jsxs("div", { className: "text-xs text-amber-600", children: ["ID: ", selectedListing.related_load_listing_id] })] })] })) })] })), selectedListing.offer_type && (_jsxs("div", { className: "bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide", children: "Teklif Alma \u015Eekli" }), _jsxs("div", { className: "text-gray-900 font-medium", children: [selectedListing.offer_type === 'fixed_price' && '💰 Sabit Fiyat', selectedListing.offer_type === 'negotiable' && '💬 Pazarlıklı', selectedListing.offer_type === 'auction' && '🏷️ Müzayede', selectedListing.offer_type === 'free_quote' && '📝 Doğrudan Teklif'] })] }))] })] })), selectedListing.listing_type === 'transport_service' && (_jsx("div", { children: _jsx(TransportServiceDetailSection, { listing: prepareTransportServiceDetail(selectedListing) }) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-sm", children: [_jsxs("h3", { className: "text-xl font-semibold text-purple-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-purple-100 p-2 rounded-lg mr-3", children: _jsx(MapPin, { className: "h-6 w-6 text-purple-600" }) }), "Rota Bilgileri"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-xl p-4 border border-purple-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide", children: "Y\u00FCkleme Noktas\u0131" }), _jsxs("div", { className: "text-gray-900 font-semibold flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-green-500 rounded-full mr-3 shadow-sm" }), selectedListing.origin] })] }), _jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "w-px h-8 bg-gradient-to-b from-purple-300 to-purple-400" }) }), _jsxs("div", { className: "bg-white rounded-xl p-4 border border-purple-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide", children: "Teslimat Noktas\u0131" }), _jsxs("div", { className: "text-gray-900 font-semibold flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-red-500 rounded-full mr-3 shadow-sm" }), selectedListing.destination] })] })] })] }), (selectedListing.listing_type === 'load_listing' || selectedListing.listing_type === 'shipment_request') && (_jsxs("div", { className: "bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 shadow-sm", children: [_jsxs("h3", { className: "text-xl font-semibold text-orange-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-orange-100 p-2 rounded-lg mr-3", children: _jsx(Calendar, { className: "h-6 w-6 text-orange-600" }) }), "Tarih Bilgileri"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-xl p-4 border border-orange-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide", children: "Y\u00FCkleme Tarihi" }), _jsx("div", { className: "text-gray-900 font-semibold", children: formatDate(selectedListing.loading_date) })] }), _jsxs("div", { className: "bg-white rounded-xl p-4 border border-orange-200 shadow-sm", children: [_jsx("div", { className: "text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide", children: "Teslimat Tarihi" }), _jsx("div", { className: "text-gray-900 font-semibold", children: formatDate(selectedListing.delivery_date) })] })] })] })), selectedListing.required_documents && selectedListing.required_documents.length > 0 && (_jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-blue-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-5 w-5 text-blue-600" }) }), "Gerekli Evraklar"] }), _jsx("div", { className: "bg-white rounded-xl p-4 border border-blue-200 shadow-sm", children: _jsx("div", { className: "space-y-2", children: selectedListing.required_documents.map((doc, index) => (_jsxs("div", { className: "flex items-center text-sm text-gray-700", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0" }), _jsx("span", { children: doc })] }, index))) }) })] })), _jsxs("div", { className: "bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-sm", children: [_jsxs("h3", { className: "text-lg font-semibold text-amber-900 mb-4 flex items-center", children: [_jsx("div", { className: "bg-amber-100 p-2 rounded-lg mr-3", children: _jsx(BarChart3, { className: "h-5 w-5 text-amber-600" }) }), "\u0130lan \u0130statistikleri"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white rounded-xl p-4 border border-amber-200 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: "0" }), _jsx("div", { className: "text-sm text-amber-700", children: "G\u00F6r\u00FCnt\u00FCleme" })] }), _jsxs("div", { className: "bg-white rounded-xl p-4 border border-amber-200 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: "0" }), _jsx("div", { className: "text-sm text-amber-700", children: "Teklif" })] })] }), _jsxs("div", { className: "mt-4 text-xs text-amber-600 text-center", children: ["Son g\u00FCncelleme: ", formatDate(selectedListing.updated_at || selectedListing.created_at)] })] })] })] }), (selectedListing.document_urls && selectedListing.document_urls.length > 0) ||
                                    (selectedListing.image_urls && selectedListing.image_urls.length > 0) ? (_jsx("div", { className: "mt-8 border-t border-gray-200 pt-6", children: _jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6", children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: "\uD83D\uDCCE" }), "Ekli Dosyalar"] }), selectedListing.document_urls && selectedListing.document_urls.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "bg-blue-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("h4", { className: "text-lg font-medium text-gray-800", children: ["Evraklar (", selectedListing.document_urls.length, ")"] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: selectedListing.document_urls.map((url, index) => {
                                                            const fileName = url.split('/').pop() || `Evrak ${index + 1}`;
                                                            const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'DOC';
                                                            return (_jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg transition-colors", children: _jsx(FileText, { className: "h-6 w-6 text-blue-600" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h5", { className: "text-sm font-medium text-gray-900 truncate", children: ["Evrak ", index + 1] }), _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium", children: fileExtension })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1 truncate", children: fileName }), _jsxs("div", { className: "flex items-center mt-2 text-blue-600 group-hover:text-blue-700", children: [_jsx("span", { className: "text-xs font-medium", children: "\u0130ndir" }), _jsx(ExternalLink, { className: "h-3 w-3 ml-1" })] })] })] }) }, index));
                                                        }) })] })), selectedListing.image_urls && selectedListing.image_urls.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "bg-green-100 p-2 rounded-lg mr-3", children: _jsx(ImageIcon, { className: "h-5 w-5 text-green-600" }) }), _jsxs("h4", { className: "text-lg font-medium text-gray-800", children: ["G\u00F6rseller (", selectedListing.image_urls.length, ")"] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: selectedListing.image_urls.map((url, index) => {
                                                            const fileName = url.split('/').pop() || `Görsel ${index + 1}`;
                                                            return (_jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1", children: [_jsx("div", { className: "aspect-w-16 aspect-h-12 bg-gradient-to-br from-gray-100 to-gray-200", children: _jsx("div", { className: "flex items-center justify-center", children: _jsx("div", { className: "bg-green-100 group-hover:bg-green-200 p-4 rounded-full transition-colors", children: _jsx(ImageIcon, { className: "h-8 w-8 text-green-600" }) }) }) }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("h5", { className: "text-sm font-medium text-gray-900 truncate", children: ["G\u00F6rsel ", index + 1] }), _jsx("span", { className: "text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium", children: "IMG" })] }), _jsx("p", { className: "text-xs text-gray-500 truncate mb-2", children: fileName }), _jsxs("div", { className: "flex items-center text-green-600 group-hover:text-green-700", children: [_jsx("span", { className: "text-xs font-medium", children: "G\u00F6r\u00FCnt\u00FCle" }), _jsx(ExternalLink, { className: "h-3 w-3 ml-1" })] })] })] }, index));
                                                        }) })] }))] }) })) : null] })] }) })), editListing && editListing.listing_type === 'load_listing' && (_jsx(EditModalLoadListing, { listing: editListing, isOpen: true, onClose: () => setEditListing(null), onSave: handleUpdateListing })), editListing && editListing.listing_type === 'shipment_request' && (_jsx(EditModalShipmentRequest, { listing: editListing, isOpen: true, onClose: () => setEditListing(null), onSave: handleUpdateListing })), editListing && editListing.listing_type === 'transport_service' && (_jsx(EditModalTransportService, { listing: editListing, isOpen: true, onClose: () => setEditListing(null), onSave: handleUpdateListing }))] }));
};
// TransportServiceDetailSection için veri hazırlama fonksiyonu
function prepareTransportServiceDetail(listing) {
    console.log('🔍 PREPARING TRANSPORT SERVICE DETAIL:');
    console.log('- Original listing.metadata:', JSON.stringify(listing.metadata, null, 2));
    console.log('- Original listing.required_documents:', listing.required_documents);
    // Metadata'dan required_documents'ı temizle (eğer varsa)
    const cleanMetadata = listing.metadata && typeof listing.metadata === 'object'
        ? { ...listing.metadata }
        : { contact_info: {}, transport_details: {} };
    // required_documents varsa metadata'dan kaldır
    if (cleanMetadata && 'required_documents' in cleanMetadata) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { required_documents, ...rest } = cleanMetadata;
        Object.assign(cleanMetadata, rest);
        console.log('🧹 CLEANED required_documents from metadata');
    }
    const result = {
        ...listing, // Tüm ExtendedListing properties'ini spread et
        metadata: cleanMetadata,
    };
    console.log('- Cleaned metadata:', JSON.stringify(result.metadata, null, 2));
    console.log('- Prepared required_documents (main column only):', result.required_documents);
    return result;
}
export default MyListingsSection;
