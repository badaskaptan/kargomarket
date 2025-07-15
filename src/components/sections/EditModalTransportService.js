import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import { UploadService } from '../../services/uploadService';
const EditModalTransportService = ({ listing, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        serviceNumber: '',
        serviceTitle: '',
        serviceTransportMode: '',
        serviceDescription: '',
        serviceOrigin: '',
        serviceDestination: '',
        serviceVehicleType: '',
        serviceAvailableDate: '',
        serviceCapacity: '',
        serviceCompanyName: '',
        serviceContact: '',
        // Karayolu için ek alanlar
        plateNumber: '',
        // Denizyolu için ek alanlar
        shipName: '',
        imoNumber: '',
        mmsiNumber: '',
        dwt: '',
        shipDimensions: '',
        laycanStart: '',
        laycanEnd: '',
        freightType: '',
        chartererInfo: '',
        // Havayolu için ek alanlar
        flightNumber: '',
        // Demiryolu için ek alanlar
        trainNumber: ''
    });
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
            'Konşimento (B/L)',
            'P&I Sigorta Sertifikası',
            'IMO Deklarasyonu (Tehlikeli Yük İçin)',
            'Gemici Belgeleri',
            'Gemi Uygunluk Sertifikası',
            'Son 3 kargo',
            'Yükleme Planı',
            'Tank/Ambar Temizlik sertifikası',
            'Sörvey Raporu',
            'Yükleme Manifestosu',
            'SOPEP (Petrol Kirliliği Önleme Planı – Tankerler için)',
            'SIRE Raporu (Tankerler için)',
            'DWT / Draft Survey Raporu',
            'CDI Raporu'
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
            'CIM Belgesi',
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
            console.log('🔍 EDIT MODAL LOADING DATA:');
            console.log('- listing.metadata:', JSON.stringify(listing.metadata, null, 2));
            console.log('- listing.required_documents:', listing.required_documents);
            // Extract metadata for transport service
            const metadata = listing.metadata;
            const contactInfo = metadata?.contact_info || {};
            const transportDetails = metadata?.transport_details || {};
            console.log('- contactInfo extracted:', contactInfo);
            console.log('- transportDetails extracted:', transportDetails);
            // Metadata'dan required_documents okuma - sadece ana kolondan oku
            console.log('- Required documents source: MAIN COLUMN ONLY');
            console.log('- listing.required_documents (main):', listing.required_documents);
            // Metadata'da required_documents varsa uyar
            if (metadata && 'required_documents' in metadata) {
                console.warn('⚠️ FOUND required_documents in metadata - this should be cleaned!');
            }
            setFormData({
                serviceNumber: listing.listing_number || '',
                serviceTitle: listing.title || '',
                serviceTransportMode: listing.transport_mode || '',
                serviceDescription: listing.description || '',
                serviceOrigin: listing.origin || '',
                serviceDestination: listing.destination || '',
                serviceVehicleType: listing.vehicle_types?.[0] || '',
                serviceAvailableDate: listing.available_from_date || '',
                serviceCapacity: transportDetails.capacity || listing.weight_value?.toString() || '',
                serviceCompanyName: contactInfo.company_name || '',
                serviceContact: contactInfo.contact || '',
                // Transport mode specific fields
                plateNumber: transportDetails.plate_number || '',
                shipName: transportDetails.ship_name || '',
                imoNumber: transportDetails.imo_number || '',
                mmsiNumber: transportDetails.mmsi_number || '',
                dwt: transportDetails.dwt || '',
                shipDimensions: transportDetails.ship_dimensions || '',
                laycanStart: listing.available_from_date || '',
                laycanEnd: transportDetails.laycan_end || '',
                freightType: transportDetails.freight_type || '',
                chartererInfo: transportDetails.charterer_info || '',
                flightNumber: transportDetails.flight_number || '',
                trainNumber: transportDetails.train_number || ''
            });
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
                title: formData.serviceTitle,
                description: formData.serviceDescription,
                origin: formData.serviceOrigin,
                destination: formData.serviceDestination,
                transport_mode: formData.serviceTransportMode,
                vehicle_types: formData.serviceVehicleType ? [formData.serviceVehicleType] : null,
                weight_value: formData.serviceCapacity ? parseFloat(formData.serviceCapacity) : null,
                weight_unit: 'ton',
                available_from_date: formData.serviceAvailableDate || null,
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : null,
                document_urls: uploadedDocuments.map(doc => doc.url),
                metadata: {
                    contact_info: {
                        contact: formData.serviceContact,
                        company_name: formData.serviceCompanyName || null
                    },
                    transport_details: {
                        capacity: formData.serviceCapacity || null,
                        plate_number: formData.serviceTransportMode === 'road' ? formData.plateNumber : null,
                        ship_name: formData.serviceTransportMode === 'sea' ? formData.shipName : null,
                        imo_number: formData.serviceTransportMode === 'sea' ? formData.imoNumber : null,
                        mmsi_number: formData.serviceTransportMode === 'sea' ? formData.mmsiNumber : null,
                        dwt: formData.serviceTransportMode === 'sea' ? formData.dwt : null,
                        ship_dimensions: formData.serviceTransportMode === 'sea' ? formData.shipDimensions : null,
                        laycan_start: formData.serviceTransportMode === 'sea' ? formData.laycanStart : null,
                        laycan_end: formData.serviceTransportMode === 'sea' ? formData.laycanEnd : null,
                        freight_type: formData.serviceTransportMode === 'sea' ? formData.freightType : null,
                        charterer_info: formData.serviceTransportMode === 'sea' ? formData.chartererInfo : null,
                        flight_number: formData.serviceTransportMode === 'air' ? formData.flightNumber : null,
                        train_number: formData.serviceTransportMode === 'rail' ? formData.trainNumber : null
                    }
                },
                updated_at: new Date().toISOString()
            };
            console.log('🔍 FORM DATA ANALYSIS:');
            console.log('- selectedDocuments:', selectedDocuments);
            console.log('- required_documents (main column):', updateData.required_documents);
            console.log('- metadata structure:', JSON.stringify(updateData.metadata, null, 2));
            console.log('- metadata contains required_documents?:', 'required_documents' in (updateData.metadata || {}));
            // Metadata temizlik kontrolü
            if (updateData.metadata && 'required_documents' in updateData.metadata) {
                console.error('🚨 ERROR: required_documents found in metadata! This should not happen!');
            }
            else {
                console.log('✅ CLEAN: No required_documents in metadata - only in main column');
            }
            console.log('- Full updateData keys:', Object.keys(updateData));
            console.log('- Metadata keys:', Object.keys(updateData.metadata || {}));
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
            serviceTransportMode: mode,
            serviceVehicleType: '', // Araç tipini sıfırla
            // Modlara özel alanları sıfırla
            plateNumber: '',
            shipName: '',
            imoNumber: '',
            mmsiNumber: '',
            dwt: '',
            shipDimensions: '',
            laycanEnd: '',
            freightType: '',
            chartererInfo: '',
            flightNumber: '',
            trainNumber: ''
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
        const IconComponent = icons[formData.serviceTransportMode];
        return IconComponent ? _jsx(IconComponent, { className: "h-7 w-7 text-white" }) : _jsx(Truck, { className: "h-7 w-7 text-white" });
    };
    // Helper fonksiyonlar dinamik alan isimleri için
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
    // Dinamik placeholderlar
    const getDynamicPlaceholders = () => {
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
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-200", children: [_jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-6 rounded-t-2xl relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10" }) }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 p-3 rounded-xl backdrop-blur-sm", children: getTransportIcon() }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Nakliye \u0130lan\u0131n\u0131 D\u00FCzenle" }), _jsx("p", { className: "text-white/80 text-sm mt-1", children: "\u0130lan bilgilerini g\u00FCncelleyin" })] })] }), _jsx("button", { onClick: onClose, className: "text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm", title: "Kapat", "aria-label": "D\u00FCzenleme modal\u0131n\u0131 kapat", children: _jsx(X, { className: "h-6 w-6" }) })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white", children: [error && (_jsxs("div", { className: "bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx(AlertCircle, { className: "h-6 w-6 text-red-600 flex-shrink-0" }), _jsx("span", { className: "text-red-800 font-medium", children: error })] })), success && (_jsxs("div", { className: "bg-green-50 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx("div", { className: "h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-sm", children: "\u2713" }) }), _jsx("span", { className: "text-green-800 font-medium", children: "\u0130lan ba\u015Far\u0131yla g\u00FCncellendi!" })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "serviceNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye \u0130lan\u0131 No" }), _jsx("input", { type: "text", id: "serviceNumber", name: "serviceNumber", value: formData.serviceNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "serviceTitle", name: "serviceTitle", value: formData.serviceTitle, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara G\u00FCzergah\u0131 Nakliye Hizmeti" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTransportMode", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ta\u015F\u0131ma Modu *" }), _jsxs("select", { id: "serviceTransportMode", name: "serviceTransportMode", value: formData.serviceTransportMode, onChange: (e) => handleTransportModeChange(e.target.value), className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "road", children: "\uD83D\uDE9B Karayolu" }), _jsx("option", { value: "sea", children: "\uD83D\uDEA2 Denizyolu" }), _jsx("option", { value: "air", children: "\u2708\uFE0F Havayolu" }), _jsx("option", { value: "rail", children: "\uD83D\uDE82 Demiryolu" })] })] }), formData.serviceTransportMode && (_jsxs("div", { children: [_jsx("label", { htmlFor: "serviceVehicleType", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ara\u00E7 Tipi *" }), _jsxs("select", { id: "serviceVehicleType", name: "serviceVehicleType", value: formData.serviceVehicleType, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Ara\u00E7 tipi se\u00E7iniz..." }), vehicleTypes[formData.serviceTransportMode]?.map((group, groupIndex) => (_jsx("optgroup", { label: group.group, children: group.vehicles.map((vehicle) => (_jsx("option", { value: vehicle.value, children: vehicle.label }, vehicle.value))) }, groupIndex)))] })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceOrigin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().origin] }), _jsx("input", { type: "text", id: "serviceOrigin", name: "serviceOrigin", value: formData.serviceOrigin, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: getDynamicPlaceholders().origin })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceDestination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().destination] }), _jsx("input", { type: "text", id: "serviceDestination", name: "serviceDestination", value: formData.serviceDestination, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: getDynamicPlaceholders().destination })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceAvailableDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().availableDate] }), _jsx("input", { type: "date", id: "serviceAvailableDate", name: "serviceAvailableDate", value: formData.serviceAvailableDate, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm" })] }), formData.serviceTransportMode === 'sea' && (_jsxs("div", { children: [_jsxs("label", { htmlFor: "laycanEnd", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Laycan (Biti\u015F)"] }), _jsx("input", { type: "date", id: "laycanEnd", name: "laycanEnd", value: formData.laycanEnd, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm" })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceCapacity", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().capacity] }), _jsx("input", { type: "text", id: "serviceCapacity", name: "serviceCapacity", value: formData.serviceCapacity, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: getDynamicPlaceholders().capacity })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceCompanyName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Firma Ad\u0131 (Opsiyonel)" }), _jsx("input", { type: "text", id: "serviceCompanyName", name: "serviceCompanyName", value: formData.serviceCompanyName, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: ABC Lojistik A.\u015E." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceContact", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130leti\u015Fim Bilgileri (E-posta/Telefon) *" }), _jsx("input", { type: "text", id: "serviceContact", name: "serviceContact", value: formData.serviceContact, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: info@abclojistik.com veya +90 555 123 4567" })] }), formData.serviceTransportMode === 'road' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "plateNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE9B Plaka / \u015Easi Numaras\u0131" }), _jsx("input", { type: "text", id: "plateNumber", name: "plateNumber", value: formData.plateNumber, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 34 ABC 123 veya WJMM62AUZ7C123456" })] })), formData.serviceTransportMode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "shipName", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDEA2 Gemi Ad\u0131" }), _jsx("input", { type: "text", id: "shipName", name: "shipName", value: formData.shipName, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: M/V ISTANBUL" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "imoNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDD94 IMO Numaras\u0131" }), _jsx("input", { type: "text", id: "imoNumber", name: "imoNumber", value: formData.imoNumber, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 9123456" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "mmsiNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCE1 MMSI Numaras\u0131" }), _jsx("input", { type: "text", id: "mmsiNumber", name: "mmsiNumber", value: formData.mmsiNumber, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 271000000" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "dwt", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2696\uFE0F DWT (Deadweight Tonnage)" }), _jsx("input", { type: "text", id: "dwt", name: "dwt", value: formData.dwt, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 25000 MT" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shipDimensions", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCF Gemi Boyutlar\u0131 (LOA x Beam x Draft)" }), _jsx("input", { type: "text", id: "shipDimensions", name: "shipDimensions", value: formData.shipDimensions, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 180m x 28m x 10m" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "freightType", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCB0 Navlun Tipi" }), _jsxs("select", { id: "freightType", name: "freightType", value: formData.freightType, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "lumpsum", children: "Lump Sum (G\u00F6t\u00FCr\u00FC)" }), _jsx("option", { value: "daily", children: "Daily (G\u00FCnl\u00FCk)" }), _jsx("option", { value: "per_ton", children: "Per Ton (Ton Ba\u015F\u0131na)" }), _jsx("option", { value: "percentage", children: "Percentage (Y\u00FCzde)" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "chartererInfo", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDFE2 Charterer / Kiralayan Bilgisi" }), _jsx("input", { type: "text", id: "chartererInfo", name: "chartererInfo", value: formData.chartererInfo, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: XYZ Shipping Co." })] })] })), formData.serviceTransportMode === 'air' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "flightNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2708\uFE0F U\u00E7u\u015F Numaras\u0131 / U\u00E7ak Tipi" }), _jsx("input", { type: "text", id: "flightNumber", name: "flightNumber", value: formData.flightNumber, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TK123 veya Boeing 747 Freighter" })] })), formData.serviceTransportMode === 'rail' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "trainNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE82 Tren Numaras\u0131 / Hat Bilgisi" }), _jsx("input", { type: "text", id: "trainNumber", name: "trainNumber", value: formData.trainNumber, onChange: handleChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TR456 veya Halkal\u0131-Kap\u0131kule Hatt\u0131" })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "serviceDescription", name: "serviceDescription", value: formData.serviceDescription, onChange: handleChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm", required: true, placeholder: "Nakliye hizmetiniz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), formData.serviceTransportMode && (_jsxs("div", { className: "bg-white/50 rounded-3xl p-6 border border-gray-200", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-purple-600", size: 20 }), "Gerekli Evraklar (", formData.serviceTransportMode === 'road' ? 'Karayolu' : formData.serviceTransportMode === 'sea' ? 'Denizyolu' : formData.serviceTransportMode === 'air' ? 'Havayolu' : 'Demiryolu', ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: requiredDocuments[formData.serviceTransportMode].map((document, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `doc_${index}`, checked: selectedDocuments.includes(document), onChange: (e) => handleDocumentChange(document, e.target.checked), className: "w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" }), _jsx("label", { htmlFor: `doc_${index}`, className: "ml-3 text-sm text-gray-700", children: document })] }, index))) }), selectedDocuments.length > 0 && (_jsx("div", { className: "mt-4 p-3 bg-purple-50 rounded-3xl border border-purple-200", children: _jsxs("p", { className: "text-sm text-purple-800", children: [_jsxs("strong", { children: ["Se\u00E7ilen Evraklar (", selectedDocuments.length, "):"] }), " ", selectedDocuments.join(', ')] }) }))] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Upload, { className: "mr-2 text-purple-600", size: 20 }), "Evrak Y\u00FCkleme & Dosya Ekleme"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-purple-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: (e) => {
                                                    if (e.target.files) {
                                                        handleDocumentUpload(e.target.files);
                                                    }
                                                }, className: "hidden" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [documentUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar y\u00FCkleniyor..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" })] })), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(doc.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: doc.name }), _jsx("p", { className: "text-sm text-gray-500", children: doc.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => window.open(doc.url, '_blank'), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => {
                                                                    const link = document.createElement('a');
                                                                    link.href = doc.url;
                                                                    link.download = doc.name;
                                                                    link.click();
                                                                }, className: "p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentRemove(index), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, index))) })] }))] }), _jsxs("div", { className: "flex justify-end gap-4 pt-8 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium transform hover:scale-105", title: "\u0130ptal et", children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: loading, className: "px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg", title: "De\u011Fi\u015Fiklikleri kaydet", children: [loading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "G\u00FCncelle"] })] })] })] }) }));
};
export default EditModalTransportService;
