import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import { UploadService } from '../../services/uploadService';
const EditModalShipmentRequest = ({ listing, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        listing_number: '',
        title: '',
        description: '',
        origin: '',
        destination: '',
        load_type: '',
        weight_value: '',
        weight_unit: 'ton',
        volume_value: '',
        volume_unit: 'm³',
        loading_date: '',
        delivery_date: '',
        price_amount: '',
        price_currency: 'TRY',
        transport_mode: '',
        vehicle_type: '',
        budget_min: '',
        budget_max: ''
    });
    const [offerType, setOfferType] = useState('direct');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [documentUploading, setDocumentUploading] = useState(false);
    // Araç tipleri taşıma moduna göre - Grup başlıkları ile organize edilmiş
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
                    { value: 'container_20dc', label: '20\' Standart (20DC) - 33m³ / 28t' },
                    { value: 'container_40dc', label: '40\' Standart (40DC) - 67m³ / 28t' },
                    { value: 'container_40hc', label: '40\' Yüksek (40HC) - 76m³ / 28t' },
                    { value: 'container_20ot', label: '20\' Open Top - 32m³ / 28t' },
                    { value: 'container_40ot', label: '40\' Open Top - 66m³ / 28t' },
                    { value: 'container_20fr', label: '20\' Flat Rack - 28t' },
                    { value: 'container_40fr', label: '40\' Flat Rack - 40t' },
                    { value: 'container_20rf', label: '20\' Reefer - 28m³ / 25t' },
                    { value: 'container_40rf', label: '40\' Reefer - 60m³ / 25t' }
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
    // Gerekli evraklar taşıma moduna göre
    const requiredDocuments = {
        road: [
            'SRC Belgesi',
            'Yetki Belgesi (K1/K2/L vs.)',
            'Taşıma Sözleşmesi',
            'Araç Ruhsatı',
            'Zorunlu Trafik Sigortası',
            'Taşıyıcı Sorumluluk Sigortası',
            'İrsaliye / Sevk Fişi',
            'ADR Belgesi (Tehlikeli madde için)',
            'Frigo Sertifikası (Soğutmalı araçlar için)',
            'Ağırlık ve Ölçüm Raporu (Low-bed için)',
            'Hamule Senedi / CMR Waybill (Consignment Note)',
            'Araç Takip Sistemi Kaydı / Sefer Defteri',
            'Araç Fotoğrafı',
            'Şoför Kimlik ve Ehliyet Fotokopisi',
            'Araç Muayene Belgesi',
            'Teslimat Tutanakları / Tesellüm/Kabul Belgesi',
            'Karayolu Taşıyıcı Yetki Belgesi (Bakanlık onayı)',
            'ISO/Kalite Belgesi (varsa)',
            'Kaza Geçmişi / Track Record (isteğe bağlı, büyük projelerde)',
            'Diğer (Belirtiniz): __________'
        ],
        sea: [
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
                    'Mate\'s Receipt',
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
        ],
        air: [
            'Air Waybill (AWB)',
            'Booking Confirmation / Reservation',
            'Yükleme Listesi / Packing List',
            'Dangerous Goods Declaration (DGD) – Tehlikeli Yük Sertifikası',
            'Uçak Uygunluk Belgeleri (Airworthiness)',
            'Aircraft Registration Certificate',
            'Operator\'s Certificate (AOC)',
            'Crew License ve Personel Belgeleri',
            'Sigorta Poliçeleri (P&I, H&M)',
            'Arrival Notice',
            'Cargo Manifest',
            'Teslimat Tutanakları / Teslim Tesellüm Belgesi',
            'MSDS',
            'Fumigasyon Sertifikası (gerekiyorsa)',
            'Havayolu ISO/Kalite Belgesi (varsa)',
            'Diğer (Belirtiniz): __________'
        ],
        rail: [
            'Hamule Senedi / Railway Consignment Note (CIM)',
            'Taşıma Sözleşmesi',
            'Vagon Sertifikası / Vagon Muayene Belgesi',
            'Vagon Numarası / Tipi',
            'Demiryolu İşletme Yetki Belgesi',
            'Yükleme Talimatı',
            'Yükleme Listesi',
            'Yük Manifestosu',
            'Sevk ve Teslim Belgesi',
            'Vagon Takip/Teslim Formu',
            'Tesellüm/Teslimat Tutanakları',
            'Sigorta Poliçesi',
            'Fumigasyon Sertifikası (gerekiyorsa)',
            'Demiryolu Kaza/Kusur Kayıtları (büyük projelerde)',
            'ISO/Kalite Belgesi (varsa)',
            'Diğer (Belirtiniz): __________'
        ]
    };
    useEffect(() => {
        if (listing) {
            setFormData({
                listing_number: listing.listing_number || '',
                title: listing.title || '',
                description: listing.description || '',
                origin: listing.origin || '',
                destination: listing.destination || '',
                load_type: listing.load_type || '',
                weight_value: listing.weight_value?.toString() || '',
                weight_unit: listing.weight_unit || 'ton',
                volume_value: listing.volume_value?.toString() || '',
                volume_unit: listing.volume_unit || 'm³',
                loading_date: listing.loading_date || '',
                delivery_date: listing.delivery_date || '',
                price_amount: listing.price_amount?.toString() || '',
                price_currency: listing.price_currency || 'TRY',
                transport_mode: listing.transport_mode || '',
                vehicle_type: listing.vehicle_types?.[0] || '',
                budget_min: listing.budget_min?.toString() || '',
                budget_max: listing.budget_max?.toString() || ''
            });
            // Set offer type based on database value
            if (listing.offer_type === 'fixed_price') {
                setOfferType('price');
            }
            else {
                setOfferType('direct');
            }
            // Set required documents
            setSelectedDocuments(listing.required_documents || []);
            // Set existing documents (if any)
            if (listing.document_urls && listing.document_urls.length > 0) {
                const existingDocs = listing.document_urls.map((url, index) => ({
                    name: `Evrak ${index + 1}`,
                    url: url,
                    type: 'application/pdf', // Default type
                    size: 'Bilinmiyor'
                }));
                setUploadedDocuments(existingDocs);
            }
        }
    }, [listing]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                origin: formData.origin,
                destination: formData.destination,
                load_type: formData.load_type,
                weight_value: formData.weight_value ? parseFloat(formData.weight_value) : null,
                weight_unit: formData.weight_unit,
                volume_value: formData.volume_value ? parseFloat(formData.volume_value) : null,
                volume_unit: formData.volume_unit,
                loading_date: formData.loading_date,
                delivery_date: formData.delivery_date,
                price_amount: formData.price_amount ? parseFloat(formData.price_amount) : null,
                price_currency: formData.price_currency,
                transport_mode: formData.transport_mode,
                vehicle_types: formData.vehicle_type ? [formData.vehicle_type] : null, // Convert single vehicle_type to array
                budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
                budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
                offer_type: (offerType === 'price' ? 'fixed_price' : 'negotiable'),
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : null,
                document_urls: uploadedDocuments.map(doc => doc.url), // Yüklenen evrak URL'leri
                updated_at: new Date().toISOString()
            };
            console.log('Updating shipment request with data:', updateData);
            const updatedListing = await ListingService.updateListing(listing.id, updateData);
            setSuccess(true);
            onSave(updatedListing);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        }
        catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Güncelleme sırasında hata oluştu');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleTransportModeChange = (mode) => {
        setFormData(prev => ({
            ...prev,
            transport_mode: mode,
            vehicle_type: '' // Araç tipini sıfırla
        }));
        setSelectedDocuments([]); // Seçili evrakları sıfırla
    };
    const handleDocumentChange = (document, checked) => {
        if (checked) {
            setSelectedDocuments(prev => [...prev, document]);
        }
        else {
            setSelectedDocuments(prev => prev.filter(doc => doc !== document));
        }
    };
    // Evrak yükleme fonksiyonu
    const handleDocumentUpload = async (files) => {
        if (!files || files.length === 0)
            return;
        setDocumentUploading(true);
        const successfulUploads = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Dosya validasyonu
                const validation = UploadService.validateFile(file, false);
                if (!validation.valid) {
                    alert(`${file.name}: ${validation.error}`);
                    continue;
                }
                try {
                    const result = await UploadService.uploadDocument(file, listing.id, 'general');
                    successfulUploads.push({
                        name: file.name,
                        url: result.url,
                        type: file.type,
                        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    });
                }
                catch (error) {
                    console.error(`Failed to upload ${file.name}:`, error);
                    alert(`${file.name} yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                }
            }
            if (successfulUploads.length > 0) {
                setUploadedDocuments(prev => [...prev, ...successfulUploads]);
                console.log('✅ Documents uploaded successfully:', successfulUploads);
            }
        }
        finally {
            setDocumentUploading(false);
        }
    };
    // Evrak silme fonksiyonu
    const handleDocumentRemove = (index) => {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
    };
    const getFileIcon = (type) => {
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
    const getTransportIcon = () => {
        const icons = {
            road: Truck,
            sea: Ship,
            air: Plane,
            rail: Train
        };
        const IconComponent = icons[formData.transport_mode];
        return IconComponent ? _jsx(IconComponent, { className: "h-7 w-7 text-white" }) : _jsx(Truck, { className: "h-7 w-7 text-white" });
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-200", children: [_jsxs("div", { className: "bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 rounded-t-2xl relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10" }) }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 p-3 rounded-xl backdrop-blur-sm", children: getTransportIcon() }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Nakliye Talebini D\u00FCzenle" }), _jsx("p", { className: "text-white/80 text-sm mt-1", children: "Talep bilgilerini g\u00FCncelleyin" })] })] }), _jsx("button", { onClick: onClose, className: "text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm", title: "Kapat", "aria-label": "D\u00FCzenleme modal\u0131n\u0131 kapat", children: _jsx(X, { className: "h-6 w-6" }) })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white", children: [error && (_jsxs("div", { className: "bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx(AlertCircle, { className: "h-6 w-6 text-red-600 flex-shrink-0" }), _jsx("span", { className: "text-red-800 font-medium", children: error })] })), success && (_jsxs("div", { className: "bg-green-50 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx("div", { className: "h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-sm", children: "\u2713" }) }), _jsx("span", { className: "text-green-800 font-medium", children: "Talep ba\u015Far\u0131yla g\u00FCncellendi!" })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "listing_number", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye Talebi No" }), _jsx("input", { type: "text", id: "listing_number", name: "listing_number", value: formData.listing_number, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "title", name: "title", value: formData.title, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara Nakliye Talebi" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "load_type", className: "block text-sm font-medium text-gray-700 mb-2", children: "Y\u00FCk Tipi *" }), _jsxs("select", { id: "load_type", name: "load_type", value: formData.load_type, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsxs("optgroup", { label: "Genel Kargo / Paletli \u00DCr\u00FCnler", children: [_jsx("option", { value: "box_package", children: "\uD83D\uDCE6 Koli / Paket" }), _jsx("option", { value: "pallet_standard", children: "\uD83C\uDFD7\uFE0F Paletli Y\u00FCkler - Standart Palet" }), _jsx("option", { value: "pallet_euro", children: "\uD83C\uDDEA\uD83C\uDDFA Paletli Y\u00FCkler - Euro Palet" }), _jsx("option", { value: "pallet_industrial", children: "\uD83C\uDFED Paletli Y\u00FCkler - End\u00FCstriyel Palet" }), _jsx("option", { value: "sack_bigbag", children: "\uD83D\uDECD\uFE0F \u00C7uval / Bigbag (D\u00F6kme Olmayan)" }), _jsx("option", { value: "barrel_drum", children: "\uD83D\uDEE2\uFE0F Varil / F\u0131\u00E7\u0131" }), _jsx("option", { value: "appliances_electronics", children: "\uD83D\uDCF1 Beyaz E\u015Fya / Elektronik" }), _jsx("option", { value: "furniture_decor", children: "\uD83E\uDE91 Mobilya / Dekorasyon \u00DCr\u00FCnleri" }), _jsx("option", { value: "textile_products", children: "\uD83D\uDC55 Tekstil \u00DCr\u00FCnleri" }), _jsx("option", { value: "automotive_parts", children: "\uD83D\uDE97 Otomotiv Par\u00E7alar\u0131 / Yedek Par\u00E7a" }), _jsx("option", { value: "machinery_parts", children: "\u2699\uFE0F Makine / Ekipman Par\u00E7alar\u0131 (B\u00FCy\u00FCk Olmayan)" }), _jsx("option", { value: "construction_materials", children: "\uD83C\uDFD7\uFE0F \u0130n\u015Faat Malzemeleri (Torbal\u0131 \u00C7imento, Demir Ba\u011Flar vb.)" }), _jsx("option", { value: "packaged_food", children: "\uD83E\uDD6B Ambalajl\u0131 G\u0131da \u00DCr\u00FCnleri (Kuru G\u0131da, Konserve vb.)" }), _jsx("option", { value: "consumer_goods", children: "\uD83D\uDED2 T\u00FCketim \u00DCr\u00FCnleri (Market \u00DCr\u00FCnleri)" }), _jsx("option", { value: "ecommerce_cargo", children: "\uD83D\uDCF1 E-ticaret Kargo" }), _jsx("option", { value: "other_general", children: "\uD83D\uDCCB Di\u011Fer Genel Kargo" })] }), _jsxs("optgroup", { label: "D\u00F6kme Y\u00FCkler", children: [_jsx("option", { value: "grain", children: "\uD83C\uDF3E Tah\u0131l (Bu\u011Fday, M\u0131s\u0131r, Arpa, Pirin\u00E7 vb.)" }), _jsx("option", { value: "ore", children: "\u26CF\uFE0F Maden Cevheri (Demir, Bak\u0131r, Boksit vb.)" }), _jsx("option", { value: "coal", children: "\u26AB K\u00F6m\u00FCr" }), _jsx("option", { value: "cement_bulk", children: "\uD83C\uDFD7\uFE0F \u00C7imento (D\u00F6kme)" }), _jsx("option", { value: "sand_gravel", children: "\uD83C\uDFD6\uFE0F Kum / \u00C7ak\u0131l" }), _jsx("option", { value: "fertilizer_bulk", children: "\uD83C\uDF31 G\u00FCbre (D\u00F6kme)" }), _jsx("option", { value: "soil_excavation", children: "\uD83C\uDFD7\uFE0F Toprak / Hafriyat" }), _jsx("option", { value: "scrap_metal", children: "\u267B\uFE0F Hurda Metal" }), _jsx("option", { value: "other_bulk", children: "\uD83D\uDCCB Di\u011Fer D\u00F6kme Y\u00FCkler" })] }), _jsxs("optgroup", { label: "S\u0131v\u0131 Y\u00FCkler (D\u00F6kme S\u0131v\u0131)", children: [_jsx("option", { value: "crude_oil", children: "\uD83D\uDEE2\uFE0F Ham Petrol / Petrol \u00DCr\u00FCnleri" }), _jsx("option", { value: "chemical_liquids", children: "\uD83E\uDDEA Kimyasal S\u0131v\u0131lar (Asit, Baz, Solvent vb.)" }), _jsx("option", { value: "vegetable_oils", children: "\uD83C\uDF3B Bitkisel Ya\u011Flar (Ay\u00E7i\u00E7ek Ya\u011F\u0131, Zeytinya\u011F\u0131 vb.)" }), _jsx("option", { value: "fuel", children: "\u26FD Yak\u0131t (Dizel, Benzin vb.)" }), _jsx("option", { value: "lpg_lng", children: "\uD83D\uDD25 LPG / LNG (S\u0131v\u0131la\u015Ft\u0131r\u0131lm\u0131\u015F Gazlar)" }), _jsx("option", { value: "water", children: "\uD83D\uDCA7 Su (\u0130\u00E7me Suyu, End\u00FCstriyel Su)" }), _jsx("option", { value: "milk_dairy", children: "\uD83E\uDD5B S\u00FCt / S\u00FCt \u00DCr\u00FCnleri (D\u00F6kme)" }), _jsx("option", { value: "wine_concentrate", children: "\uD83C\uDF77 \u015Earap / \u0130\u00E7ecek Konsantresi" }), _jsx("option", { value: "other_liquid", children: "\uD83D\uDCA7 Di\u011Fer S\u0131v\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "A\u011F\u0131r Y\u00FCk / Gabari D\u0131\u015F\u0131 Y\u00FCk", children: [_jsx("option", { value: "tbm", children: "\uD83D\uDE87 T\u00FCnel A\u00E7ma Makinesi (TBM)" }), _jsx("option", { value: "transformer_generator", children: "\u26A1 Trafo / Jenerat\u00F6r" }), _jsx("option", { value: "heavy_machinery", children: "\uD83C\uDFD7\uFE0F B\u00FCy\u00FCk \u0130\u015F Makineleri (Ekskavat\u00F6r, Vin\u00E7 vb.)" }), _jsx("option", { value: "boat_yacht", children: "\u26F5 Tekne / Yat" }), _jsx("option", { value: "industrial_parts", children: "\uD83C\uDFED B\u00FCy\u00FCk End\u00FCstriyel Par\u00E7alar" }), _jsx("option", { value: "prefab_elements", children: "\uD83C\uDFD7\uFE0F Prefabrik Yap\u0131 Elemanlar\u0131" }), _jsx("option", { value: "wind_turbine", children: "\uD83D\uDCA8 R\u00FCzgar T\u00FCrbini Kanatlar\u0131 / Kuleleri" }), _jsx("option", { value: "other_oversized", children: "\uD83D\uDCCF Di\u011Fer Gabari D\u0131\u015F\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "Hassas / K\u0131r\u0131labilir Kargo", children: [_jsx("option", { value: "art_antiques", children: "\uD83C\uDFA8 Sanat Eserleri / Antikalar" }), _jsx("option", { value: "glass_ceramic", children: "\uD83C\uDFFA Cam / Seramik \u00DCr\u00FCnler" }), _jsx("option", { value: "electronic_devices", children: "\uD83D\uDCBB Elektronik Cihaz" }), _jsx("option", { value: "medical_devices", children: "\uD83C\uDFE5 T\u0131bbi Cihazlar" }), _jsx("option", { value: "lab_equipment", children: "\uD83D\uDD2C Laboratuvar Ekipmanlar\u0131" }), _jsx("option", { value: "flowers_plants", children: "\uD83C\uDF38 \u00C7i\u00E7ek / Canl\u0131 Bitki" }), _jsx("option", { value: "other_sensitive", children: "\uD83D\uDD12 Di\u011Fer Hassas Kargo" })] }), _jsxs("optgroup", { label: "Tehlikeli Madde (ADR / IMDG / IATA S\u0131n\u0131fland\u0131rmas\u0131)", children: [_jsx("option", { value: "dangerous_class1", children: "\uD83D\uDCA5 Patlay\u0131c\u0131lar (S\u0131n\u0131f 1)" }), _jsx("option", { value: "dangerous_class2", children: "\uD83D\uDCA8 Gazlar (S\u0131n\u0131f 2)" }), _jsx("option", { value: "dangerous_class3", children: "\uD83D\uDD25 Yan\u0131c\u0131 S\u0131v\u0131lar (S\u0131n\u0131f 3)" }), _jsx("option", { value: "dangerous_class4", children: "\uD83D\uDD25 Yan\u0131c\u0131 Kat\u0131lar (S\u0131n\u0131f 4)" }), _jsx("option", { value: "dangerous_class5", children: "\u2697\uFE0F Oksitleyici Maddeler (S\u0131n\u0131f 5)" }), _jsx("option", { value: "dangerous_class6", children: "\u2620\uFE0F Zehirli ve Bula\u015F\u0131c\u0131 Maddeler (S\u0131n\u0131f 6)" }), _jsx("option", { value: "dangerous_class7", children: "\u2622\uFE0F Radyoaktif Maddeler (S\u0131n\u0131f 7)" }), _jsx("option", { value: "dangerous_class8", children: "\uD83E\uDDEA A\u015F\u0131nd\u0131r\u0131c\u0131 Maddeler (S\u0131n\u0131f 8)" }), _jsx("option", { value: "dangerous_class9", children: "\u26A0\uFE0F Di\u011Fer Tehlikeli Maddeler (S\u0131n\u0131f 9)" })] }), _jsxs("optgroup", { label: "So\u011Fuk Zincir / Is\u0131 Kontroll\u00FC Y\u00FCk", children: [_jsx("option", { value: "frozen_food", children: "\uD83E\uDDCA Donmu\u015F G\u0131da" }), _jsx("option", { value: "fresh_produce", children: "\uD83E\uDD6C Taze Meyve / Sebze" }), _jsx("option", { value: "meat_dairy", children: "\uD83E\uDD69 Et / S\u00FCt \u00DCr\u00FCnleri" }), _jsx("option", { value: "pharma_vaccine", children: "\uD83D\uDC8A \u0130la\u00E7 / A\u015F\u0131" }), _jsx("option", { value: "chemical_temp", children: "\uD83C\uDF21\uFE0F Kimyasal Maddeler (Is\u0131 Kontroll\u00FC)" }), _jsx("option", { value: "other_cold_chain", children: "\u2744\uFE0F Di\u011Fer So\u011Fuk Zincir Kargo" })] }), _jsxs("optgroup", { label: "Canl\u0131 Hayvan", children: [_jsx("option", { value: "small_livestock", children: "\uD83D\uDC11 K\u00FC\u00E7\u00FCk Ba\u015F Hayvan (Koyun, Ke\u00E7i vb.)" }), _jsx("option", { value: "large_livestock", children: "\uD83D\uDC04 B\u00FCy\u00FCk Ba\u015F Hayvan (S\u0131\u011F\u0131r, At vb.)" }), _jsx("option", { value: "poultry", children: "\uD83D\uDC14 Kanatl\u0131 Hayvan" }), _jsx("option", { value: "pets", children: "\uD83D\uDC15 Evcil Hayvan" }), _jsx("option", { value: "other_livestock", children: "\uD83D\uDC3E Di\u011Fer Canl\u0131 Hayvanlar" })] }), _jsxs("optgroup", { label: "Proje Y\u00FCkleri", children: [_jsx("option", { value: "factory_setup", children: "\uD83C\uDFED Fabrika Kurulumu" }), _jsx("option", { value: "power_plant", children: "\u26A1 Enerji Santrali Ekipmanlar\u0131" }), _jsx("option", { value: "infrastructure", children: "\uD83C\uDFD7\uFE0F Altyap\u0131 Proje Malzemeleri" }), _jsx("option", { value: "other_project", children: "\uD83D\uDCCB Di\u011Fer Proje Y\u00FCkleri" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "transport_mode", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ta\u015F\u0131ma Modu *" }), _jsxs("select", { id: "transport_mode", name: "transport_mode", value: formData.transport_mode, onChange: (e) => handleTransportModeChange(e.target.value), className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "road", children: "\uD83D\uDE9B Karayolu" }), _jsx("option", { value: "sea", children: "\uD83D\uDEA2 Denizyolu" }), _jsx("option", { value: "air", children: "\u2708\uFE0F Havayolu" }), _jsx("option", { value: "rail", children: "\uD83D\uDE82 Demiryolu" })] })] }), formData.transport_mode && (_jsxs("div", { children: [_jsx("label", { htmlFor: "vehicle_type", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ara\u00E7 Tipi *" }), _jsxs("select", { id: "vehicle_type", name: "vehicle_type", value: formData.vehicle_type, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Ara\u00E7 tipi se\u00E7iniz..." }), vehicleTypes[formData.transport_mode]?.map((group, groupIndex) => (_jsx("optgroup", { label: group.group, children: group.vehicles.map((vehicle) => (_jsx("option", { value: vehicle.value, children: vehicle.label }, vehicle.value))) }, groupIndex)))] })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "origin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Kalk\u0131\u015F Noktas\u0131"] }), _jsx("input", { type: "text", id: "origin", name: "origin", value: formData.origin, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", placeholder: "\u00D6rn: \u0130stanbul, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "destination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Var\u0131\u015F Noktas\u0131"] }), _jsx("input", { type: "text", id: "destination", name: "destination", value: formData.destination, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", placeholder: "\u00D6rn: Ankara, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loading_date", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Y\u00FCkleme Tarihi *"] }), _jsx("input", { type: "date", id: "loading_date", name: "loading_date", value: formData.loading_date, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "delivery_date", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Teslimat Tarihi *"] }), _jsx("input", { type: "date", id: "delivery_date", name: "delivery_date", value: formData.delivery_date, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "weight_value", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "A\u011F\u0131rl\u0131k (ton) *"] }), _jsx("input", { type: "number", id: "weight_value", name: "weight_value", value: formData.weight_value, onChange: handleChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 10.5" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "volume_value", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "Hacim (m\u00B3) *"] }), _jsx("input", { type: "number", id: "volume_value", name: "volume_value", value: formData.volume_value, onChange: handleChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 25.0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Teklif Alma \u015Eekli" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypeDirect", name: "offerType", value: "direct", checked: offerType === 'direct', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" }), _jsx("label", { htmlFor: "offerTypeDirect", className: "ml-2 text-sm text-gray-700", children: "Do\u011Frudan Teklif" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypePrice", name: "offerType", value: "price", checked: offerType === 'price', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" }), _jsx("label", { htmlFor: "offerTypePrice", className: "ml-2 text-sm text-gray-700", children: "Fiyat Belirleyerek" })] })] })] }), offerType === 'price' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "price_amount", className: "block text-sm font-medium text-gray-700 mb-2", children: "Belirlenen Fiyat (TL) *" }), _jsx("input", { type: "number", id: "price_amount", name: "price_amount", value: formData.price_amount, onChange: handleChange, min: "1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 5000" })] })), offerType === 'direct' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "budget_min", className: "block text-sm font-medium text-gray-700 mb-2", children: "Minimum B\u00FCt\u00E7e (TL)" }), _jsx("input", { type: "number", id: "budget_min", name: "budget_min", value: formData.budget_min, onChange: handleChange, min: "0", step: "0.01", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", placeholder: "Minimum b\u00FCt\u00E7e" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "budget_max", className: "block text-sm font-medium text-gray-700 mb-2", children: "Maksimum B\u00FCt\u00E7e (TL)" }), _jsx("input", { type: "number", id: "budget_max", name: "budget_max", value: formData.budget_max, onChange: handleChange, min: "0", step: "0.01", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", placeholder: "Maksimum b\u00FCt\u00E7e" })] })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "description", name: "description", value: formData.description, onChange: handleChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm", required: true, placeholder: "Nakliye talebiniz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), formData.transport_mode && (_jsxs("div", { className: "bg-white/50 rounded-3xl p-6 border border-gray-200", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-green-600", size: 20 }), "Gerekli Evraklar (", formData.transport_mode === 'road' ? 'Karayolu' : formData.transport_mode === 'sea' ? 'Denizyolu' : formData.transport_mode === 'air' ? 'Havayolu' : 'Demiryolu', ")"] }), formData.transport_mode === 'sea' ? (_jsx(_Fragment, { children: requiredDocuments.sea.map((group, groupIdx) => (_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "font-semibold text-green-700 mb-2", children: group.group }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: group.documents.map((document, idx) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `sea_doc_${groupIdx}_${idx}`, checked: selectedDocuments.includes(document), onChange: (e) => handleDocumentChange(document, e.target.checked), className: "w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" }), _jsx("label", { htmlFor: `sea_doc_${groupIdx}_${idx}`, className: "ml-3 text-sm text-gray-700", children: document })] }, idx))) })] }, groupIdx))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: requiredDocuments[formData.transport_mode].map((document, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `doc_${index}`, checked: selectedDocuments.includes(document), onChange: (e) => handleDocumentChange(document, e.target.checked), className: "w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" }), _jsx("label", { htmlFor: `doc_${index}`, className: "ml-3 text-sm text-gray-700", children: document })] }, index))) })), selectedDocuments.length > 0 && (_jsx("div", { className: "mt-4 p-3 bg-green-50 rounded-3xl border border-green-200", children: _jsxs("p", { className: "text-sm text-green-800", children: [_jsxs("strong", { children: ["Se\u00E7ilen Evraklar (", selectedDocuments.length, "):"] }), " ", selectedDocuments.join(', ')] }) }))] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Upload, { className: "mr-2 text-green-600", size: 20 }), "Evrak Y\u00FCkleme & Dosya Ekleme"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-green-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: (e) => {
                                                    if (e.target.files) {
                                                        handleDocumentUpload(e.target.files);
                                                    }
                                                }, className: "hidden" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [documentUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-12 h-12 text-green-500 mx-auto mb-4 animate-spin" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar y\u00FCkleniyor..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" })] })), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(doc.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: doc.name }), _jsx("p", { className: "text-sm text-gray-500", children: doc.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => window.open(doc.url, '_blank'), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => {
                                                                    const link = document.createElement('a');
                                                                    link.href = doc.url;
                                                                    link.download = doc.name;
                                                                    link.click();
                                                                }, className: "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentRemove(index), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, index))) })] }))] }), _jsxs("div", { className: "flex justify-end gap-4 pt-8 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium transform hover:scale-105", title: "\u0130ptal et", children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: loading, className: "px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg", title: "De\u011Fi\u015Fiklikleri kaydet", children: [loading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "G\u00FCncelle"] })] })] })] }) }));
};
export default EditModalShipmentRequest;
