import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import TransportServiceDetailSection from './TransportServiceDetailSection';
import Modal from '../common/Modal'; // Modal component
import { ArrowLeft, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2, Loader2, MapPin, Package, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService'; // ListingService'i kullanacağız
import toast from 'react-hot-toast';
// Vehicle types for select options
const vehicleTypes = {
    road: [
        {
            group: 'Kamyonlar',
            vehicles: [
                { value: 'truck_3_5_open', label: 'Kamyon - 3.5 Ton (Açık Kasa)' },
                { value: 'truck_3_5_closed', label: 'Kamyon - 3.5 Ton (Kapalı Kasa)' },
                { value: 'truck_5_open', label: 'Kamyon - 5 Ton (Açık Kasa)' },
                { value: 'truck_5_closed', label: 'Kamyon - 5 Ton (Kapalı Kasa)' },
                { value: 'truck_10_open', label: 'Kamyon - 10 Ton (Açık Kasa)' },
                { value: 'truck_10_closed', label: 'Kamyon - 10 Ton (Kapalı Kasa)' },
                { value: 'truck_10_tent', label: 'Kamyon - 10 Ton (Tenteli)' },
                { value: 'truck_15_open', label: 'Kamyon - 15 Ton (Açık Kasa)' },
                { value: 'truck_15_closed', label: 'Kamyon - 15 Ton (Kapalı Kasa)' },
                { value: 'truck_15_tent', label: 'Kamyon - 15 Ton (Tenteli)' }
            ]
        },
        {
            group: 'Tır ve Çekiciler (40 Tona Kadar)',
            vehicles: [
                { value: 'tir_standard', label: 'Tır (Standart Dorse) - 90m³ / 40t' },
                { value: 'tir_mega', label: 'Tır (Mega Dorse) - 100m³ / 40t' },
                { value: 'tir_jumbo', label: 'Tır (Jumbo Dorse) - 120m³ / 40t' },
                { value: 'tir_tent', label: 'Tır (Tenteli Dorse) - 40t' },
                { value: 'tir_frigo', label: 'Tır (Frigorifik Dorse - Isı Kontrollü) - 40t' },
                { value: 'tir_container', label: 'Tır (Konteyner Taşıyıcı) - 40t' },
                { value: 'tir_platform', label: 'Tır (Platform) - 40t' },
                { value: 'tir_frigo_dual', label: 'Tır (Frigorifik Çift Isı) - 40t' }
            ]
        },
        {
            group: 'Kargo Araçları (Hafif Yükler)',
            vehicles: [
                { value: 'van_3', label: 'Kargo Van - 3m³ (1000kg)' },
                { value: 'van_6', label: 'Kargo Van - 6m³ (1500kg)' },
                { value: 'van_10', label: 'Kargo Van - 10m³ (2000kg)' },
                { value: 'van_15', label: 'Kargo Van - 15m³ (2500kg)' }
            ]
        }
    ],
    sea: [
        {
            group: 'Konteyner Gemisi',
            vehicles: [
                { value: 'container_20dc', label: "20' Standart (20DC) - 33m³ / 28t" },
                { value: 'container_40dc', label: "40' Standart (40DC) - 67m³ / 28t" },
                { value: 'container_40hc', label: "40' Yüksek (40HC) - 76m³ / 28t" },
                { value: 'container_20ot', label: "20' Open Top - 32m³ / 28t" },
                { value: 'container_40ot', label: "40' Open Top - 66m³ / 28t" },
                { value: 'container_20fr', label: "20' Flat Rack - 28t" },
                { value: 'container_40fr', label: "40' Flat Rack - 40t" },
                { value: 'container_20rf', label: "20' Reefer - 28m³ / 25t" },
                { value: 'container_40rf', label: "40' Reefer - 60m³ / 25t" }
            ]
        },
        {
            group: 'Dökme Yük Gemisi',
            vehicles: [
                { value: 'bulk_handysize', label: 'Handysize (10,000-35,000 DWT)' },
                { value: 'bulk_handymax', label: 'Handymax (35,000-60,000 DWT)' },
                { value: 'bulk_panamax', label: 'Panamax (60,000-80,000 DWT)' },
                { value: 'bulk_capesize', label: 'Capesize (80,000+ DWT)' }
            ]
        },
        {
            group: 'Genel Kargo Gemisi',
            vehicles: [
                { value: 'general_small', label: 'Küçük Tonaj (1,000-5,000 DWT)' },
                { value: 'general_medium', label: 'Orta Tonaj (5,000-15,000 DWT)' },
                { value: 'general_large', label: 'Büyük Tonaj (15,000+ DWT)' }
            ]
        },
        {
            group: 'Tanker',
            vehicles: [
                { value: 'tanker_product', label: 'Ürün Tankeri (10,000-60,000 DWT)' },
                { value: 'tanker_chemical', label: 'Kimyasal Tanker (5,000-40,000 DWT)' },
                { value: 'tanker_crude', label: 'Ham Petrol Tankeri (60,000+ DWT)' },
                { value: 'tanker_lpg', label: 'LPG Tankeri (5,000-80,000 m³)' },
                { value: 'tanker_lng', label: 'LNG Tankeri (150,000-180,000 m³)' }
            ]
        },
        {
            group: 'RO-RO',
            vehicles: [
                { value: 'roro_small', label: 'Küçük RO-RO (100-200 araç)' },
                { value: 'roro_medium', label: 'Orta RO-RO (200-500 araç)' },
                { value: 'roro_large', label: 'Büyük RO-RO (500+ araç)' }
            ]
        },
        {
            group: 'Feribot ve Yük Teknesi',
            vehicles: [
                { value: 'ferry_cargo', label: 'Kargo Feribotu' },
                { value: 'ferry_mixed', label: 'Karma Feribot (Yolcu+Yük)' },
                { value: 'cargo_small', label: 'Küçük Yük Teknesi (500-1,000 DWT)' },
                { value: 'cargo_large', label: 'Büyük Yük Teknesi (1,000+ DWT)' }
            ]
        }
    ],
    air: [
        {
            group: 'Kargo Tipleri',
            vehicles: [
                { value: 'standard_cargo', label: 'Standart Kargo' },
                { value: 'large_cargo', label: 'Büyük Hacimli Kargo' },
                { value: 'special_cargo', label: 'Özel Kargo' }
            ]
        }
    ],
    rail: [
        {
            group: 'Vagon Tipleri',
            vehicles: [
                { value: 'open_wagon', label: 'Açık Yük Vagonu' },
                { value: 'closed_wagon', label: 'Kapalı Yük Vagonu' },
                { value: 'container_wagon', label: 'Konteyner Vagonu' },
                { value: 'tanker_wagon', label: 'Tanker Vagonu' }
            ]
        }
    ]
};
// NK + YYMMDDHHMMSS formatında ilan numarası üretici
const generateServiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    return `NK${year}${month}${day}${hour}${minute}${second}`;
};
const CreateTransportServiceSection = ({ initialData, onClose }) => {
    // State ve context
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const safeMetadata = initialData?.metadata ?? {};
    const safeContactInfo = (safeMetadata.contact_info ?? {});
    const safeTransportDetails = (safeMetadata.transport_details ?? {});
    const safeRequiredDocuments = Array.isArray(safeMetadata.required_documents) ? safeMetadata.required_documents : [];
    const [formData, setFormData] = useState({
        serviceNumber: initialData?.listing_number || generateServiceNumber(),
        serviceTitle: initialData?.title || '',
        serviceTransportMode: initialData?.transport_mode || '',
        serviceDescription: initialData?.description || '',
        serviceOrigin: initialData?.origin ?? '',
        serviceDestination: initialData?.destination ?? '',
        serviceVehicleType: Array.isArray(initialData?.vehicle_types) ? initialData.vehicle_types.join(', ') : '',
        serviceAvailableDate: initialData?.available_from_date ?? '',
        serviceCapacity: initialData?.capacity ?? '',
        serviceCompanyName: safeContactInfo.company_name ?? '',
        serviceContact: safeContactInfo.contact ?? '',
        plateNumber: safeTransportDetails.plate_number ?? '',
        shipName: safeTransportDetails.ship_name ?? '',
        imoNumber: safeTransportDetails.imo_number ?? '',
        mmsiNumber: safeTransportDetails.mmsi_number ?? '',
        dwt: safeTransportDetails.dwt ?? '',
        shipDimensions: safeTransportDetails.ship_dimensions ?? '',
        laycanStart: safeTransportDetails.laycan_start ?? '',
        laycanEnd: safeTransportDetails.laycan_end ?? '',
        freightType: safeTransportDetails.freight_type ?? '',
        chartererInfo: safeTransportDetails.charterer_info ?? '',
        flightNumber: safeTransportDetails.flight_number ?? '',
        trainNumber: safeTransportDetails.train_number ?? ''
    });
    const [transportMode, setTransportMode] = useState(initialData?.transport_mode || '');
    const [selectedDocuments, setSelectedDocuments] = useState(safeRequiredDocuments);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    // Modal state for preview
    const [detailOpen, setDetailOpen] = useState(false);
    const [lastCreatedListing, setLastCreatedListing] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [debugOpen, setDebugOpen] = useState(false);
    const [debugData, setDebugData] = useState(null);
    // Input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'serviceTransportMode') {
            setTransportMode(value);
            setFormData((prev) => ({ ...prev, serviceVehicleType: '' }));
        }
    };
    // Document select handler
    const handleDocumentSelect = (document) => {
        setSelectedDocuments((prev) => prev.includes(document)
            ? prev.filter((doc) => doc !== document)
            : [...prev, document]);
    };
    // File upload handler
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (!files)
            return;
        const newDocs = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            file,
            url: URL.createObjectURL(file),
            type: file.type,
            size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : undefined
        }));
        setUploadedDocuments((prev) => [...prev, ...newDocs]);
    };
    // Document preview handler
    const handleDocumentPreview = (document) => {
        window.open(document.url, '_blank');
    };
    // Document download handler
    const handleDocumentDownload = (document) => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        link.click();
    };
    // Document delete handler
    const handleDocumentDelete = (id) => {
        setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));
    };
    // File icon helper
    const getFileIcon = (type = '') => {
        if (type.includes('pdf'))
            return '📄';
        if (type.includes('excel') || type.includes('spreadsheet'))
            return '📊';
        if (type.includes('word') || type.includes('document'))
            return '📝';
        if (type.includes('image'))
            return '🖼️';
        return '📎';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 Form submit started!');
        console.log('📋 Form Data:', formData);
        console.log('👤 User:', user);
        // Kullanıcı kontrolü
        if (!user) {
            console.log('❌ No user found');
            toast.error('Giriş yapmanız gerekiyor!');
            return;
        }
        // Form validasyonu
        console.log('🔍 Validation check:');
        console.log('- serviceTitle:', formData.serviceTitle);
        console.log('- serviceDescription:', formData.serviceDescription);
        console.log('- serviceTransportMode:', formData.serviceTransportMode);
        console.log('- serviceVehicleType:', formData.serviceVehicleType);
        console.log('- serviceContact:', formData.serviceContact);
        if (!formData.serviceTitle || !formData.serviceDescription || !formData.serviceTransportMode) {
            console.log('❌ Validation failed: Missing required fields');
            toast.error('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }
        if (!formData.serviceVehicleType) {
            console.log('❌ Validation failed: Missing vehicle type');
            toast.error('Lütfen araç tipini seçin!');
            return;
        }
        if (!formData.serviceContact) {
            console.log('❌ Validation failed: Missing contact info');
            toast.error('Lütfen iletişim bilgilerini girin!');
            return;
        }
        console.log('✅ All validations passed!');
        setIsSubmitting(true);
        try {
            console.log('📝 Creating listing data...');
            // Nakliye hizmetini listings tablosuna kaydet
            const listingData = {
                user_id: user.id,
                listing_type: 'transport_service',
                title: formData.serviceTitle,
                description: formData.serviceDescription,
                origin: formData.serviceOrigin,
                destination: formData.serviceDestination,
                transport_mode: formData.serviceTransportMode,
                vehicle_types: formData.serviceVehicleType ? [formData.serviceVehicleType] : [],
                capacity: formData.serviceCapacity,
                offer_type: 'negotiable',
                price_currency: 'TRY',
                available_from_date: formData.serviceAvailableDate,
                status: 'active',
                listing_number: formData.serviceNumber,
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : [],
                metadata: {
                    contact_info: {
                        contact: formData.serviceContact,
                        company_name: formData.serviceCompanyName
                    },
                    transport_details: {
                        plate_number: formData.serviceTransportMode === 'road' ? formData.plateNumber : '',
                        ship_name: formData.serviceTransportMode === 'sea' ? formData.shipName : '',
                        imo_number: formData.serviceTransportMode === 'sea' ? formData.imoNumber : '',
                        mmsi_number: formData.serviceTransportMode === 'sea' ? formData.mmsiNumber : '',
                        dwt: formData.serviceTransportMode === 'sea' ? formData.dwt : '',
                        ship_dimensions: formData.serviceTransportMode === 'sea' ? formData.shipDimensions : '',
                        laycan_start: formData.serviceTransportMode === 'sea' ? formData.laycanStart : '',
                        laycan_end: formData.serviceTransportMode === 'sea' ? formData.laycanEnd : '',
                        freight_type: formData.serviceTransportMode === 'sea' ? formData.freightType : '',
                        charterer_info: formData.serviceTransportMode === 'sea' ? formData.chartererInfo : '',
                        flight_number: formData.serviceTransportMode === 'air' ? formData.flightNumber : '',
                        train_number: formData.serviceTransportMode === 'rail' ? formData.trainNumber : ''
                    },
                    required_documents: selectedDocuments.length > 0 ? selectedDocuments : []
                }
            };
            // DEBUG: Show modal with all data before submit
            setDebugData({
                formData,
                listingData,
                uploadedDocuments,
                user
            });
            setDebugOpen(true);
            // If you want to block submit until debug modal is closed, return here
            // return;
            console.log('Creating transport service listing with data:', listingData);
            const listing = await ListingService.createListing(listingData);
            // Son oluşturulan ilanı state'e kaydet (vehicle_types always string[])
            setLastCreatedListing({
                ...listingData,
                vehicle_types: listingData.vehicle_types ?? [],
                capacity: listingData.capacity ?? ''
            });
            setDetailOpen(true);
            // Yüklenen evrakları topla (zaten Supabase'de yüklü)
            console.log('📋 Collecting uploaded document URLs:', uploadedDocuments.length);
            const documentUrls = uploadedDocuments
                .filter(doc => doc.url !== 'uploading...' && doc.url.startsWith('http'))
                .map(doc => doc.url);
            console.log('✅ Valid document URLs:', documentUrls.length);
            // Eğer evrak URL'leri varsa, listing'i güncelle
            if (documentUrls.length > 0) {
                await ListingService.updateListing(listing.id, {
                    document_urls: documentUrls
                });
                console.log('✅ Transport service listing updated with document URLs');
            }
            toast.success('Nakliye hizmeti ilanı başarıyla oluşturuldu!');
            setActiveSection('my-listings');
        }
        catch (error) {
            console.error('❌ Error creating transport service:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            toast.error('Nakliye hizmeti oluşturulurken bir hata oluştu.');
        }
        finally {
            console.log('🏁 Form submission finished');
            setIsSubmitting(false);
        }
    };
    // Helper fonksiyonlar dinamik alan isimleri ve görseller için
    const getDynamicFieldLabels = () => {
        const mode = formData.serviceTransportMode;
        return {
            origin: mode === 'sea' ? 'Kalkış Limanı / Bölgesi'
                : mode === 'air' ? 'Kalkış Havalimanı'
                    : mode === 'rail' ? 'Kalkış İstasyonu / Bölgesi'
                        : 'Kalkış Bölgesi/Noktası',
            destination: mode === 'sea' ? 'Varış Limanı / Bölgesi'
                : mode === 'air' ? 'Varış Havalimanı'
                    : mode === 'rail' ? 'Varış İstasyonu / Bölgesi'
                        : 'Varış Bölgesi/Noktası',
            availableDate: mode === 'sea' ? 'Laycan (Başlangıç)' : 'Boşta Olma Tarihi',
            capacity: mode === 'air' ? 'Kargo Kapasitesi (kg/m³)'
                : mode === 'sea' ? 'DWT / Kapasite'
                    : 'Kapasite (ton/m³)'
        };
    };
    // Taşıma moduna göre arka plan rengi
    function getTransportBackground() {
        switch (formData.serviceTransportMode) {
            case 'road':
                return 'bg-yellow-50 border-yellow-200';
            case 'sea':
                return 'bg-blue-50 border-blue-200';
            case 'air':
                return 'bg-cyan-50 border-cyan-200';
            case 'rail':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-white border-gray-200';
        }
    }
    // Taşıma moduna göre SVG arka plan
    function getTransportBackgroundImage() {
        switch (formData.serviceTransportMode) {
            case 'road':
                return `<svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="200" fill="#FEF3C7"/><text x="50%" y="50%" text-anchor="middle" fill="#F59E42" font-size="48" font-family="Arial" dy=".3em" opacity="0.2">🚚</text></svg>`;
            case 'sea':
                return `<svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="200" fill="#DBEAFE"/><text x="50%" y="50%" text-anchor="middle" fill="#2563EB" font-size="48" font-family="Arial" dy=".3em" opacity="0.2">🚢</text></svg>`;
            case 'air':
                return `<svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="200" fill="#ECFEFF"/><text x="50%" y="50%" text-anchor="middle" fill="#06B6D4" font-size="48" font-family="Arial" dy=".3em" opacity="0.2">✈️</text></svg>`;
            case 'rail':
                return `<svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="200" fill="#F3F4F6"/><text x="50%" y="50%" text-anchor="middle" fill="#6B7280" font-size="48" font-family="Arial" dy=".3em" opacity="0.2">🚂</text></svg>`;
            default:
                return '';
        }
    }
    // Taşıma moduna göre ikon
    function getTransportIcon() {
        switch (formData.serviceTransportMode) {
            case 'road':
                return _jsx(Truck, { className: "w-12 h-12 text-yellow-500" });
            case 'sea':
                return _jsx(Ship, { className: "w-12 h-12 text-blue-500" });
            case 'air':
                return _jsx(Plane, { className: "w-12 h-12 text-cyan-500" });
            case 'rail':
                return _jsx(Train, { className: "w-12 h-12 text-gray-500" });
            default:
                return null;
        }
    }
    // Dinamik placeholderlar
    function getDynamicPlaceholders() {
        const mode = formData.serviceTransportMode;
        return {
            origin: mode === 'sea' ? 'Örn: İstanbul Limanı'
                : mode === 'air' ? 'Örn: İstanbul Havalimanı'
                    : mode === 'rail' ? 'Örn: Halkalı İstasyonu'
                        : 'Örn: İstanbul',
            destination: mode === 'sea' ? 'Örn: İzmir Limanı'
                : mode === 'air' ? 'Örn: Ankara Esenboğa'
                    : mode === 'rail' ? 'Örn: Ankara Garı'
                        : 'Örn: Ankara',
            capacity: mode === 'air' ? 'Örn: 5000 kg'
                : mode === 'sea' ? 'Örn: 25000 DWT'
                    : 'Örn: 20 ton'
        };
    }
    // ...existing code...
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { open: debugOpen, onClose: () => setDebugOpen(false), title: "Debug: G\u00F6nderilecek Veri", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("strong", { children: "Form Data:" }), _jsx("pre", { className: "bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40", children: JSON.stringify(debugData?.formData, null, 2) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Listing Data (Supabase'e gidecek):" }), _jsx("pre", { className: "bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40", children: JSON.stringify(debugData?.listingData, null, 2) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Y\u00FCklenen Evraklar:" }), _jsx("pre", { className: "bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40", children: JSON.stringify(debugData?.uploadedDocuments, null, 2) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Kullan\u0131c\u0131:" }), _jsx("pre", { className: "bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40", children: JSON.stringify(debugData?.user, null, 2) })] })] }) }), _jsx(Modal, { open: detailOpen, onClose: () => setDetailOpen(false), title: "Olu\u015Fturulan \u0130lan Detay\u0131", children: lastCreatedListing && (_jsx("div", { className: "max-h-[70vh] overflow-auto", children: _jsx(TransportServiceDetailSection, { listing: {
                            listing_number: lastCreatedListing.listing_number,
                            title: lastCreatedListing.title,
                            description: lastCreatedListing.description,
                            origin: lastCreatedListing.origin,
                            destination: lastCreatedListing.destination,
                            transport_mode: lastCreatedListing.transport_mode,
                            vehicle_types: lastCreatedListing.vehicle_types ?? [],
                            capacity: lastCreatedListing.capacity ?? '',
                            available_from_date: lastCreatedListing.available_from_date ?? '',
                            status: lastCreatedListing.status,
                            metadata: lastCreatedListing.metadata ?? {}
                        } }) })) }), _jsx("div", { className: "space-y-6 animate-fade-in", children: _jsxs("div", { className: `rounded-3xl shadow-lg p-6 transition-all duration-300 ${getTransportBackground()}`, children: [transportMode && (_jsx("div", { className: "absolute inset-0 opacity-5 pointer-events-none", dangerouslySetInnerHTML: { __html: getTransportBackgroundImage() } })), _jsxs("div", { className: "flex items-center mb-8 relative z-10", children: [_jsx("button", { onClick: () => setActiveSection('my-listings'), className: "mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full", title: "Geri", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Yeni Nakliye \u0130lan\u0131 Olu\u015Ftur" }), transportMode && (_jsx("div", { className: "ml-auto hidden md:block", children: getTransportIcon() }))] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "serviceNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye \u0130lan\u0131 No" }), _jsx("input", { type: "text", id: "serviceNumber", name: "serviceNumber", value: formData.serviceNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "serviceTitle", name: "serviceTitle", value: formData.serviceTitle, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara G\u00FCzergah\u0131 Nakliye Hizmeti" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTransportMode", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ta\u015F\u0131ma Modu *" }), _jsxs("select", { id: "serviceTransportMode", name: "serviceTransportMode", value: formData.serviceTransportMode, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "road", children: "\uD83D\uDE9B Karayolu" }), _jsx("option", { value: "sea", children: "\uD83D\uDEA2 Denizyolu" }), _jsx("option", { value: "air", children: "\u2708\uFE0F Havayolu" }), _jsx("option", { value: "rail", children: "\uD83D\uDE82 Demiryolu" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceOrigin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().origin, " *"] }), _jsx("input", { type: "text", id: "serviceOrigin", name: "serviceOrigin", value: formData.serviceOrigin, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().origin })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceDestination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().destination, " *"] }), _jsx("input", { type: "text", id: "serviceDestination", name: "serviceDestination", value: formData.serviceDestination, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().destination })] }), transportMode && (_jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceVehicleType", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Truck, { className: "inline w-4 h-4 mr-1" }), "Ara\u00E7 Tipi *"] }), _jsxs("select", { id: "serviceVehicleType", name: "serviceVehicleType", value: formData.serviceVehicleType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Ara\u00E7 tipi se\u00E7iniz..." }), vehicleTypes[transportMode]?.map((group, groupIndex) => (_jsx("optgroup", { label: group.group, children: group.vehicles.map((vehicle) => (_jsx("option", { value: vehicle.value, children: vehicle.label }, vehicle.value))) }, groupIndex)))] })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceAvailableDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().availableDate, " *"] }), _jsx("input", { type: "date", id: "serviceAvailableDate", name: "serviceAvailableDate", value: formData.serviceAvailableDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), formData.serviceTransportMode === 'sea' && (_jsxs("div", { children: [_jsxs("label", { htmlFor: "laycanEnd", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Laycan (Biti\u015F) *"] }), _jsx("input", { type: "date", id: "laycanEnd", name: "laycanEnd", value: formData.laycanEnd, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceCapacity", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().capacity, " *"] }), _jsx("input", { type: "number", id: "serviceCapacity", name: "serviceCapacity", value: formData.serviceCapacity, onChange: handleInputChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().capacity })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceCompanyName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Firma Ad\u0131 (Opsiyonel)" }), _jsx("input", { type: "text", id: "serviceCompanyName", name: "serviceCompanyName", value: formData.serviceCompanyName, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: ABC Lojistik A.\u015E." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceContact", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130leti\u015Fim Bilgileri (E-posta/Telefon) *" }), _jsx("input", { type: "text", id: "serviceContact", name: "serviceContact", value: formData.serviceContact, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: info@abclojistik.com veya +90 555 123 4567" })] }), formData.serviceTransportMode === 'road' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "plateNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE9B Plaka / \u015Easi Numaras\u0131" }), _jsx("input", { type: "text", id: "plateNumber", name: "plateNumber", value: formData.plateNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 34 ABC 123 veya WJMM62AUZ7C123456" })] })), formData.serviceTransportMode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "shipName", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDEA2 Gemi Ad\u0131 *" }), _jsx("input", { type: "text", id: "shipName", name: "shipName", value: formData.shipName, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: MV KARGO EXPRESS" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "imoNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDD94 IMO No *" }), _jsx("input", { type: "text", id: "imoNumber", name: "imoNumber", value: formData.imoNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: IMO 1234567" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "mmsiNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCE1 MMSI No *" }), _jsx("input", { type: "text", id: "mmsiNumber", name: "mmsiNumber", value: formData.mmsiNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 271234567" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "dwt", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2696\uFE0F DWT / Tonaj *" }), _jsx("input", { type: "text", id: "dwt", name: "dwt", value: formData.dwt, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 25000 DWT" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shipDimensions", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCF Boyutlar (LOA, Beam) *" }), _jsx("input", { type: "text", id: "shipDimensions", name: "shipDimensions", value: formData.shipDimensions, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: LOA: 180m, Beam: 28m" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "freightType", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCB0 Navlun Tipi *" }), _jsx("input", { type: "text", id: "freightType", name: "freightType", value: formData.freightType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: Lump sum, USD/ton, Time charter" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "chartererInfo", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDFE2 Charterer / Broker Bilgisi" }), _jsx("input", { type: "text", id: "chartererInfo", name: "chartererInfo", value: formData.chartererInfo, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: ABC Shipping & Brokerage" })] })] })), formData.serviceTransportMode === 'air' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "flightNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2708\uFE0F U\u00E7u\u015F Numaras\u0131" }), _jsx("input", { type: "text", id: "flightNumber", name: "flightNumber", value: formData.flightNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TK123 veya CRG456" })] })), formData.serviceTransportMode === 'rail' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "trainNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE82 Tren/Kompozisyon No" }), _jsx("input", { type: "text", id: "trainNumber", name: "trainNumber", value: formData.trainNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TR-12345 veya K-KARGO-67" })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "serviceDescription", name: "serviceDescription", value: formData.serviceDescription, onChange: handleInputChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Nakliye hizmetiniz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), formData.serviceTransportMode && (_jsxs("div", { className: "bg-white/50 rounded-3xl p-6 border border-gray-200", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "\uD83D\uDCCB Gerekli Evraklar (", formData.serviceTransportMode === 'road' ? 'Karayolu' : formData.serviceTransportMode === 'sea' ? 'Denizyolu' : formData.serviceTransportMode === 'air' ? 'Havayolu' : 'Demiryolu', ")"] }), formData.serviceTransportMode === 'sea' ? (_jsx(_Fragment, { children: [
                                                {
                                                    group: 'GEMİ OPERASYONEL & UYGUNLUK BELGELERİ (Vetting/Yeterlilik)',
                                                    documents: [
                                                        'Q88 Formu (Tanker teknik bilgi formu)',
                                                        'SIRE Inspection Report (Son, temiz)',
                                                        'CDI Certificate (Kimyasal taşımada)',
                                                        'PSC Inspection Records (Son liman devleti kontrolü)',
                                                        'Vetting Approval Record / Broker Questionnaire',
                                                        'DOC/SMC/ISPS Sertifikaları',
                                                        'Class Certificate / Class Status Report',
                                                        'P&I Insurance Certificate (Sorumluluk sigortası)',
                                                        'Hull & Machinery Insurance (Gövde/Makina Sigortası)',
                                                        'Last Drydock/Special Survey Report',
                                                        'Vessel Particulars / Registration Certificate'
                                                    ]
                                                },
                                                {
                                                    group: 'STANDART DENİZYOLU TAŞIMA BELGELERİ',
                                                    documents: [
                                                        'Bill of Lading (B/L) – Konşimento / Sea Waybill',
                                                        'Charter Party / Fixture Note (Varsa, kiralama)',
                                                        'Yükleme Listesi / Manifesto',
                                                        'Loading Certificate / Yükleme Sertifikası',
                                                        'Yükleme Planı (Loading Plan)',
                                                        'Mate’s Receipt',
                                                        'Surveyor Raporları (Ullage, Draft, SGS, Intertek)',
                                                        'IMO Deklarasyonu (Tehlikeli yük için)',
                                                        'Arrival Notice / Delivery Order',
                                                        'Liman Belgeleri (Tally Sheet, EIR)',
                                                        'Tank/Ambar Temizlik Sertifikası',
                                                        'Fumigasyon Sertifikası (gerekiyorsa)',
                                                        'Crew List / Personel Sertifikaları',
                                                        'ISM/ISPS Belgeleri',
                                                        'Gemi Fotoğrafları',
                                                        'Son 3 Yük (Last 3 Cargo)',
                                                        'Diğer (Belirtiniz): __________'
                                                    ]
                                                }
                                            ].map((group, groupIdx) => (_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "font-semibold text-primary-700 mb-2", children: group.group }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: group.documents.map((document, idx) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `sea_doc_${groupIdx}_${idx}`, checked: selectedDocuments.includes(document), onChange: () => handleDocumentSelect(document), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: `sea_doc_${groupIdx}_${idx}`, className: "ml-3 text-sm text-gray-700", children: document })] }, idx))) })] }, groupIdx))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: safeRequiredDocuments.map((document, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `document-${index}`, checked: selectedDocuments.includes(document), onChange: () => handleDocumentSelect(document), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsxs("label", { htmlFor: `document-${index}`, className: "ml-2 text-sm text-gray-700", children: ["\uD83D\uDCC4 ", document] })] }, index))) })), selectedDocuments.length > 0 && (_jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200", children: [_jsxs("p", { className: "text-sm text-blue-800 font-medium", children: ["Se\u00E7ilen Evraklar (", selectedDocuments.length, ")"] }), _jsx("div", { className: "mt-2 text-xs text-blue-600", children: selectedDocuments.join(', ') })] }))] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "Evrak Y\u00FCkleme Alan\u0131"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: handleFileUpload, className: "hidden" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" }), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((document) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(document.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: document.name }), _jsx("p", { className: "text-sm text-gray-500", children: document.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDocumentPreview(document), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDownload(document), className: "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDelete(document.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, document.id))) })] }))] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm", disabled: isSubmitting, children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed", children: [isSubmitting && _jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }), isSubmitting ? 'Oluşturuluyor...' : 'İlanı Oluştur'] })] })] })] }) })] }));
};
export default CreateTransportServiceSection;
