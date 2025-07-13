import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Package, MapPin, Truck, Ship, Plane, Train, ChevronDown, FileText, Upload, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import { storage } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
const CreateShipmentRequestSection = () => {
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const [transportMode, setTransportMode] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [offerType, setOfferType] = useState('direct');
    const [selectedLoadListing, setSelectedLoadListing] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadListings, setLoadListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [formData, setFormData] = useState({
        requestNumber: `NT${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}`,
        requestTitle: '',
        requestLoadType: '',
        requestDescription: '',
        requestOrigin: '',
        requestDestination: '',
        requestLoadingDate: '',
        requestDeliveryDate: '',
        requestWeight: '',
        requestVolume: '',
        requestSetPrice: ''
    });
    // Örnek yük ilanları listesi - Artık Supabase'den çekilecek
    // const loadListings = [...] kaldırıldı
    // Aktif yük ilanlarını Supabase'den çek
    useEffect(() => {
        const fetchLoadListings = async () => {
            try {
                setLoadingListings(true);
                // Tüm aktif load_listing tipindeki ilanları getir (kendi ilanları dahil)
                const listings = await ListingService.searchListings({
                    listingType: 'load_listing',
                    limit: 50
                });
                setLoadListings(listings);
                console.log('✅ Load listings fetched:', listings.length, '(including own listings)');
            }
            catch (error) {
                console.error('❌ Error fetching load listings:', error);
                toast.error('Yük ilanları yüklenirken hata oluştu.');
                setLoadListings([]);
            }
            finally {
                setLoadingListings(false);
            }
        };
        fetchLoadListings();
    }, []);
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
        ],
        air: [
            'Air Waybill (AWB)',
            'Booking Confirmation / Reservation',
            'Yükleme Listesi / Packing List',
            'Dangerous Goods Declaration (DGD) – Tehlikeli Yük Sertifikası',
            'Uçak Uygunluk Belgeleri (Airworthiness)',
            'Aircraft Registration Certificate',
            'Operator’s Certificate (AOC)',
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleLoadListingSelect = (listingId) => {
        const selectedListing = loadListings.find(listing => listing.id === listingId);
        if (selectedListing) {
            setSelectedLoadListing(listingId);
            // Seçilen yük ilanından bilgileri otomatik doldur
            setFormData(prev => ({
                ...prev,
                requestTitle: `${selectedListing.title} - Nakliye Talebi`,
                requestLoadType: selectedListing.load_type || '',
                requestOrigin: selectedListing.origin,
                requestDestination: selectedListing.destination
            }));
        }
    };
    const handleTransportModeChange = (mode) => {
        setTransportMode(mode);
        setVehicleType(''); // Araç tipini sıfırla
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
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                // Dosya türü kontrolü
                const allowedTypes = [
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/png',
                    'image/jpeg',
                    'image/jpg'
                ];
                // Dosya boyutu kontrolü (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 10MB'dir.`);
                    return;
                }
                if (allowedTypes.includes(file.type)) {
                    const newDocument = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        type: file.type,
                        url: URL.createObjectURL(file),
                        file: file,
                        documentType: 'request_document'
                    };
                    setUploadedDocuments(prev => [...prev, newDocument]);
                }
                else {
                    toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
                }
            });
        }
    };
    const handleDocumentDelete = (id) => {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
    };
    const handleDocumentPreview = (doc) => {
        window.open(doc.url, '_blank');
    };
    const handleDocumentDownload = (doc) => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        link.click();
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kullanıcı kontrolü
        if (!user) {
            toast.error('Giriş yapmanız gerekiyor!');
            return;
        }
        // Form validasyonu
        if (!formData.requestTitle || !formData.requestDescription || !formData.requestOrigin || !formData.requestDestination || !transportMode) {
            toast.error('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }
        setIsSubmitting(true);
        try {
            // Sayısal değerlerin validasyonu
            const weightValue = formData.requestWeight ? parseFloat(formData.requestWeight) : null;
            const volumeValue = formData.requestVolume ? parseFloat(formData.requestVolume) : null;
            const priceAmount = formData.requestSetPrice ? parseFloat(formData.requestSetPrice) : null;
            // Sayısal sınır kontrolleri
            if (weightValue && (weightValue > 999999 || weightValue < 0)) {
                toast.error('Ağırlık değeri 0-999999 ton arasında olmalıdır!');
                return;
            }
            if (volumeValue && (volumeValue > 999999 || volumeValue < 0)) {
                toast.error('Hacim değeri 0-999999 m³ arasında olmalıdır!');
                return;
            }
            if (priceAmount && (priceAmount > 999999999 || priceAmount < 0)) {
                toast.error('Fiyat değeri 0-999,999,999 TL arasında olmalıdır!');
                return;
            }
            // Önce nakliye talebini oluşturalım
            const listingData = {
                user_id: user.id,
                listing_type: 'shipment_request',
                title: formData.requestTitle,
                description: formData.requestDescription,
                origin: formData.requestOrigin,
                destination: formData.requestDestination,
                transport_mode: transportMode,
                vehicle_types: vehicleType ? [vehicleType] : null, // Convert single vehicle type to array
                role_type: null, // Nakliye talebinde genellikle role_type yok
                load_type: formData.requestLoadType || null,
                weight_value: weightValue,
                weight_unit: 'ton',
                volume_value: volumeValue,
                volume_unit: 'm3',
                loading_date: formData.requestLoadingDate || null,
                delivery_date: formData.requestDeliveryDate || null,
                price_amount: priceAmount,
                price_currency: 'TRY',
                offer_type: offerType === 'price' ? 'fixed_price' : 'negotiable',
                transport_responsible: null, // Nakliye talebinde genellikle transport_responsible yok
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : null,
                listing_number: formData.requestNumber,
                related_load_listing_id: selectedLoadListing || null, // Seçilen yük ilanının ID'si
                status: 'active'
            };
            console.log('Creating shipment request with data:', listingData);
            console.log('🚗 Vehicle Type Debug:', { vehicleType, vehicle_types: vehicleType ? [vehicleType] : null });
            const listing = await ListingService.createListing(listingData);
            const listingId = listing.id;
            // Yüklenen evrakları Supabase Storage'a yükle
            console.log('📋 Uploading documents:', uploadedDocuments.length);
            const documentUrls = [];
            for (const doc of uploadedDocuments) {
                if (doc.file && doc.documentType) {
                    try {
                        const { data: uploadData, error: uploadError } = await storage.uploadListingDocument(listingId, doc.file, doc.documentType);
                        if (uploadError) {
                            console.error('Document upload error:', uploadError);
                            toast.error(`${doc.name} dosyası yüklenirken hata oluştu.`);
                            continue;
                        }
                        if (uploadData) {
                            documentUrls.push(uploadData.publicUrl);
                            console.log(`✅ Document uploaded: ${doc.name} -> ${uploadData.publicUrl}`);
                        }
                    }
                    catch (error) {
                        console.error('Document upload error:', error);
                        toast.error(`${doc.name} dosyası yüklenirken hata oluştu.`);
                    }
                }
            }
            // Nakliye talebini document URL'leri ile güncelle
            if (documentUrls.length > 0) {
                await ListingService.updateListing(listingId, {
                    document_urls: documentUrls
                });
                console.log('✅ Shipment request updated with document URLs');
            }
            toast.success('Nakliye talebi başarıyla oluşturuldu!');
            setActiveSection('my-listings');
        }
        catch (error) {
            console.error('Error creating shipment request:', error);
            toast.error('Nakliye talebi oluşturulurken bir hata oluştu.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getTransportBackground = () => {
        const backgrounds = {
            road: 'bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden',
            sea: 'bg-gradient-to-br from-cyan-50 to-cyan-100 relative overflow-hidden',
            air: 'bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden',
            rail: 'bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden'
        };
        return backgrounds[transportMode] || 'bg-white relative overflow-hidden';
    };
    const getTransportIcon = () => {
        const icons = {
            road: Truck,
            sea: Ship,
            air: Plane,
            rail: Train
        };
        const IconComponent = icons[transportMode];
        return IconComponent ? _jsx(IconComponent, { className: "w-16 h-16 text-gray-400" }) : null;
    };
    const getTransportBackgroundImage = () => {
        if (!transportMode)
            return '';
        const backgroundImages = {
            road: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 50 L90 50 M20 40 L80 40 M20 60 L80 60" stroke="currentColor" stroke-width="2" fill="none"/>
            <rect x="30" y="35" width="20" height="15" rx="2" fill="currentColor"/>
            <circle cx="35" cy="52" r="3" fill="currentColor"/>
            <circle cx="45" cy="52" r="3" fill="currentColor"/>
          </svg>
        </div>
      `,
            sea: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 60 Q30 55 50 60 T90 60" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M30 40 L70 40 L65 55 L35 55 Z" fill="currentColor"/>
            <rect x="45" y="25" width="3" height="15" fill="currentColor"/>
            <path d="M48 25 L60 35 L48 30 Z" fill="currentColor"/>
          </svg>
        </div>
      `,
            air: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M20 50 L80 50" stroke="currentColor" stroke-width="3" fill="none"/>
            <path d="M30 45 L70 45 L75 50 L70 55 L30 55 Z" fill="currentColor"/>
            <path d="M35 40 L45 30 L55 40" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M35 60 L45 70 L55 60" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
      `,
            rail: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 55 L90 55 M10 45 L90 45" stroke="currentColor" stroke-width="2" fill="none"/>
            <rect x="25" y="35" width="50" height="20" rx="3" fill="currentColor"/>
            <circle cx="35" cy="58" r="2" fill="currentColor"/>
            <circle cx="45" cy="58" r="2" fill="currentColor"/>
            <circle cx="55" cy="58" r="2" fill="currentColor"/>
            <circle cx="65" cy="58" r="2" fill="currentColor"/>
          </svg>
        </div>
      `
        };
        return backgroundImages[transportMode] || '';
    };
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { className: `rounded-3xl shadow-lg p-6 transition-all duration-300 ${getTransportBackground()}`, children: [transportMode && (_jsx("div", { className: "absolute inset-0 opacity-5 pointer-events-none", dangerouslySetInnerHTML: { __html: getTransportBackgroundImage() } })), _jsxs("div", { className: "flex items-center justify-between mb-8 relative z-10", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => setActiveSection('my-listings'), className: "mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full", title: "Geri", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Yeni Nakliye Talebi \u0130lan\u0131 Olu\u015Ftur" })] }), transportMode && (_jsx("div", { className: "hidden md:block", children: getTransportIcon() }))] }), _jsxs("div", { className: "mb-8 p-6 bg-white/70 rounded-3xl border border-gray-200 relative z-10", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Package, { className: "mr-2 text-primary-600", size: 20 }), "Hangi Y\u00FCk \u0130lan\u0131 \u0130\u00E7in Nakliye Talebi Olu\u015Fturuyorsunuz?"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "loadListingSelect", className: "block text-sm font-medium text-gray-700 mb-2", children: "Y\u00FCk \u0130lan\u0131 Se\u00E7in *" }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "loadListingSelect", value: selectedLoadListing, onChange: (e) => handleLoadListingSelect(e.target.value), className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white shadow-sm", required: true, disabled: loadingListings, children: [_jsx("option", { value: "", children: loadingListings ? 'Yük ilanları yükleniyor...' : 'Yük ilanı seçiniz...' }), loadListings.map((listing) => (_jsxs("option", { value: listing.id, children: [listing.listing_number, " - ", listing.title] }, listing.id)))] }), _jsx(ChevronDown, { className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none", size: 20 })] }), loadingListings && (_jsxs("div", { className: "mt-2 flex items-center text-sm text-gray-600", children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Aktif y\u00FCk ilanlar\u0131 y\u00FCkleniyor..."] })), !loadingListings && loadListings.length === 0 && (_jsx("div", { className: "mt-2 text-sm text-amber-600", children: "\u26A0\uFE0F Hen\u00FCz aktif y\u00FCk ilan\u0131 bulunmuyor." }))] }), selectedLoadListing && (_jsxs("div", { className: "bg-primary-50 p-4 rounded-3xl border border-primary-200", children: [_jsx("h4", { className: "font-medium text-primary-900 mb-2", children: "Se\u00E7ilen \u0130lan Detaylar\u0131" }), (() => {
                                                const listing = loadListings.find(l => l.id === selectedLoadListing);
                                                return listing ? (_jsxs("div", { className: "text-sm text-primary-800", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u0130lan No:" }), " ", listing.listing_number] }), _jsxs("p", { children: [_jsx("strong", { children: "Ba\u015Fl\u0131k:" }), " ", listing.title] }), _jsxs("p", { children: [_jsx("strong", { children: "G\u00FCzergah:" }), " ", listing.origin, " \u2192 ", listing.destination] }), _jsxs("p", { children: [_jsx("strong", { children: "Y\u00FCk Tipi:" }), " ", listing.load_type || 'Belirtilmemiş'] }), listing.weight_value && (_jsxs("p", { children: [_jsx("strong", { children: "A\u011F\u0131rl\u0131k:" }), " ", listing.weight_value, " ", listing.weight_unit] })), listing.volume_value && (_jsxs("p", { children: [_jsx("strong", { children: "Hacim:" }), " ", listing.volume_value, " ", listing.volume_unit] }))] })) : null;
                                            })()] }))] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "requestNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye Talebi No" }), _jsx("input", { type: "text", id: "requestNumber", name: "requestNumber", value: formData.requestNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "requestTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "requestTitle", name: "requestTitle", value: formData.requestTitle, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara Nakliye Talebi" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "requestLoadType", className: "block text-sm font-medium text-gray-700 mb-2", children: "Y\u00FCk Tipi *" }), _jsxs("select", { id: "requestLoadType", name: "requestLoadType", value: formData.requestLoadType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsxs("optgroup", { label: "Genel Kargo / Paletli \u00DCr\u00FCnler", children: [_jsx("option", { value: "box_package", children: "Koli / Paket" }), _jsx("option", { value: "pallet_standard", children: "Paletli Y\u00FCkler - Standart Palet" }), _jsx("option", { value: "pallet_euro", children: "Paletli Y\u00FCkler - Euro Palet" }), _jsx("option", { value: "pallet_industrial", children: "Paletli Y\u00FCkler - End\u00FCstriyel Palet" }), _jsx("option", { value: "sack_bigbag", children: "\u00C7uval / Bigbag (D\u00F6kme Olmayan)" }), _jsx("option", { value: "barrel_drum", children: "Varil / F\u0131\u00E7\u0131" }), _jsx("option", { value: "appliances_electronics", children: "Beyaz E\u015Fya / Elektronik" }), _jsx("option", { value: "furniture_decor", children: "Mobilya / Dekorasyon \u00DCr\u00FCnleri" }), _jsx("option", { value: "textile_products", children: "Tekstil \u00DCr\u00FCnleri" }), _jsx("option", { value: "automotive_parts", children: "Otomotiv Par\u00E7alar\u0131 / Yedek Par\u00E7a" }), _jsx("option", { value: "machinery_parts", children: "Makine / Ekipman Par\u00E7alar\u0131 (B\u00FCy\u00FCk Olmayan)" }), _jsx("option", { value: "construction_materials", children: "\u0130n\u015Faat Malzemeleri (Torbal\u0131 \u00C7imento, Demir Ba\u011Flar vb.)" }), _jsx("option", { value: "packaged_food", children: "Ambalajl\u0131 G\u0131da \u00DCr\u00FCnleri (Kuru G\u0131da, Konserve vb.)" }), _jsx("option", { value: "consumer_goods", children: "T\u00FCketim \u00DCr\u00FCnleri (Market \u00DCr\u00FCnleri)" }), _jsx("option", { value: "ecommerce_cargo", children: "E-ticaret Kargo" }), _jsx("option", { value: "other_general", children: "Di\u011Fer Genel Kargo" })] }), _jsxs("optgroup", { label: "D\u00F6kme Y\u00FCkler", children: [_jsx("option", { value: "grain", children: "Tah\u0131l (Bu\u011Fday, M\u0131s\u0131r, Arpa, Pirin\u00E7 vb.)" }), _jsx("option", { value: "ore", children: "Maden Cevheri (Demir, Bak\u0131r, Boksit vb.)" }), _jsx("option", { value: "coal", children: "K\u00F6m\u00FCr" }), _jsx("option", { value: "cement_bulk", children: "\u00C7imento (D\u00F6kme)" }), _jsx("option", { value: "sand_gravel", children: "Kum / \u00C7ak\u0131l" }), _jsx("option", { value: "fertilizer_bulk", children: "G\u00FCbre (D\u00F6kme)" }), _jsx("option", { value: "soil_excavation", children: "Toprak / Hafriyat" }), _jsx("option", { value: "scrap_metal", children: "Hurda Metal" }), _jsx("option", { value: "other_bulk", children: "Di\u011Fer D\u00F6kme Y\u00FCkler" })] }), _jsxs("optgroup", { label: "S\u0131v\u0131 Y\u00FCkler (D\u00F6kme S\u0131v\u0131)", children: [_jsx("option", { value: "crude_oil", children: "Ham Petrol / Petrol \u00DCr\u00FCnleri" }), _jsx("option", { value: "chemical_liquids", children: "Kimyasal S\u0131v\u0131lar (Asit, Baz, Solvent vb.)" }), _jsx("option", { value: "vegetable_oils", children: "Bitkisel Ya\u011Flar (Ay\u00E7i\u00E7ek Ya\u011F\u0131, Zeytinya\u011F\u0131 vb.)" }), _jsx("option", { value: "fuel", children: "Yak\u0131t (Dizel, Benzin vb.)" }), _jsx("option", { value: "lpg_lng", children: "LPG / LNG (S\u0131v\u0131la\u015Ft\u0131r\u0131lm\u0131\u015F Gazlar)" }), _jsx("option", { value: "water", children: "Su (\u0130\u00E7me Suyu, End\u00FCstriyel Su)" }), _jsx("option", { value: "milk_dairy", children: "S\u00FCt / S\u00FCt \u00DCr\u00FCnleri (D\u00F6kme)" }), _jsx("option", { value: "wine_concentrate", children: "\u015Earap / \u0130\u00E7ecek Konsantresi" }), _jsx("option", { value: "other_liquid", children: "Di\u011Fer S\u0131v\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "A\u011F\u0131r Y\u00FCk / Gabari D\u0131\u015F\u0131 Y\u00FCk", children: [_jsx("option", { value: "tbm", children: "T\u00FCnel A\u00E7ma Makinesi (TBM)" }), _jsx("option", { value: "transformer_generator", children: "Trafo / Jenerat\u00F6r" }), _jsx("option", { value: "heavy_machinery", children: "B\u00FCy\u00FCk \u0130\u015F Makineleri (Ekskavat\u00F6r, Vin\u00E7 vb.)" }), _jsx("option", { value: "boat_yacht", children: "Tekne / Yat" }), _jsx("option", { value: "industrial_parts", children: "B\u00FCy\u00FCk End\u00FCstriyel Par\u00E7alar" }), _jsx("option", { value: "prefab_elements", children: "Prefabrik Yap\u0131 Elemanlar\u0131" }), _jsx("option", { value: "wind_turbine", children: "R\u00FCzgar T\u00FCrbini Kanatlar\u0131 / Kuleleri" }), _jsx("option", { value: "other_oversized", children: "Di\u011Fer Gabari D\u0131\u015F\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "Hassas / K\u0131r\u0131labilir Kargo", children: [_jsx("option", { value: "art_antiques", children: "Sanat Eserleri / Antikalar" }), _jsx("option", { value: "glass_ceramic", children: "Cam / Seramik \u00DCr\u00FCnler" }), _jsx("option", { value: "electronic_devices", children: "Elektronik Cihaz" }), _jsx("option", { value: "medical_devices", children: "T\u0131bbi Cihazlar" }), _jsx("option", { value: "lab_equipment", children: "Laboratuvar Ekipmanlar\u0131" }), _jsx("option", { value: "flowers_plants", children: "\u00C7i\u00E7ek / Canl\u0131 Bitki" }), _jsx("option", { value: "other_sensitive", children: "Di\u011Fer Hassas Kargo" })] }), _jsxs("optgroup", { label: "Tehlikeli Madde (ADR / IMDG / IATA S\u0131n\u0131fland\u0131rmas\u0131)", children: [_jsx("option", { value: "dangerous_class1", children: "Patlay\u0131c\u0131lar (S\u0131n\u0131f 1)" }), _jsx("option", { value: "dangerous_class2", children: "Gazlar (S\u0131n\u0131f 2)" }), _jsx("option", { value: "dangerous_class3", children: "Yan\u0131c\u0131 S\u0131v\u0131lar (S\u0131n\u0131f 3)" }), _jsx("option", { value: "dangerous_class4", children: "Yan\u0131c\u0131 Kat\u0131lar (S\u0131n\u0131f 4)" }), _jsx("option", { value: "dangerous_class5", children: "Oksitleyici Maddeler (S\u0131n\u0131f 5)" }), _jsx("option", { value: "dangerous_class6", children: "Zehirli ve Bula\u015F\u0131c\u0131 Maddeler (S\u0131n\u0131f 6)" }), _jsx("option", { value: "dangerous_class7", children: "Radyoaktif Maddeler (S\u0131n\u0131f 7)" }), _jsx("option", { value: "dangerous_class8", children: "A\u015F\u0131nd\u0131r\u0131c\u0131 Maddeler (S\u0131n\u0131f 8)" }), _jsx("option", { value: "dangerous_class9", children: "Di\u011Fer Tehlikeli Maddeler (S\u0131n\u0131f 9)" })] }), _jsxs("optgroup", { label: "So\u011Fuk Zincir / Is\u0131 Kontroll\u00FC Y\u00FCk", children: [_jsx("option", { value: "frozen_food", children: "Donmu\u015F G\u0131da" }), _jsx("option", { value: "fresh_produce", children: "Taze Meyve / Sebze" }), _jsx("option", { value: "meat_dairy", children: "Et / S\u00FCt \u00DCr\u00FCnleri" }), _jsx("option", { value: "pharma_vaccine", children: "\u0130la\u00E7 / A\u015F\u0131" }), _jsx("option", { value: "chemical_temp", children: "Kimyasal Maddeler (Is\u0131 Kontroll\u00FC)" }), _jsx("option", { value: "other_cold_chain", children: "Di\u011Fer So\u011Fuk Zincir Kargo" })] }), _jsxs("optgroup", { label: "Canl\u0131 Hayvan", children: [_jsx("option", { value: "small_livestock", children: "K\u00FC\u00E7\u00FCk Ba\u015F Hayvan (Koyun, Ke\u00E7i vb.)" }), _jsx("option", { value: "large_livestock", children: "B\u00FCy\u00FCk Ba\u015F Hayvan (S\u0131\u011F\u0131r, At vb.)" }), _jsx("option", { value: "poultry", children: "Kanatl\u0131 Hayvan" }), _jsx("option", { value: "pets", children: "Evcil Hayvan" }), _jsx("option", { value: "other_livestock", children: "Di\u011Fer Canl\u0131 Hayvanlar" })] }), _jsxs("optgroup", { label: "Proje Y\u00FCkleri", children: [_jsx("option", { value: "factory_setup", children: "Fabrika Kurulumu" }), _jsx("option", { value: "power_plant", children: "Enerji Santrali Ekipmanlar\u0131" }), _jsx("option", { value: "infrastructure", children: "Altyap\u0131 Proje Malzemeleri" }), _jsx("option", { value: "other_project", children: "Di\u011Fer Proje Y\u00FCkleri" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "transportationModeRequest", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ta\u015F\u0131ma Modu *" }), _jsxs("select", { id: "transportationModeRequest", name: "transportationModeRequest", value: transportMode, onChange: (e) => handleTransportModeChange(e.target.value), className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "road", children: "\uD83D\uDE9B Karayolu" }), _jsx("option", { value: "sea", children: "\uD83D\uDEA2 Denizyolu" }), _jsx("option", { value: "air", children: "\u2708\uFE0F Havayolu" }), _jsx("option", { value: "rail", children: "\uD83D\uDE82 Demiryolu" })] })] }), transportMode && (_jsxs("div", { children: [_jsx("label", { htmlFor: "vehicleType", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ara\u00E7 Tipi *" }), _jsxs("select", { id: "vehicleType", name: "vehicleType", value: vehicleType, onChange: (e) => setVehicleType(e.target.value), className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Ara\u00E7 tipi se\u00E7iniz..." }), vehicleTypes[transportMode]?.map((group, groupIndex) => (_jsx("optgroup", { label: group.group, children: group.vehicles.map((vehicle) => (_jsx("option", { value: vehicle.value, children: vehicle.label }, vehicle.value))) }, groupIndex)))] })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestOrigin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Kalk\u0131\u015F Noktas\u0131 (Opsiyonel)"] }), _jsx("input", { type: "text", id: "requestOrigin", name: "requestOrigin", value: formData.requestOrigin, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: \u0130stanbul, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestDestination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Var\u0131\u015F Noktas\u0131 (Opsiyonel)"] }), _jsx("input", { type: "text", id: "requestDestination", name: "requestDestination", value: formData.requestDestination, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: Ankara, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestLoadingDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Y\u00FCkleme Tarihi *"] }), _jsx("input", { type: "date", id: "requestLoadingDate", name: "requestLoadingDate", value: formData.requestLoadingDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestDeliveryDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Teslimat Tarihi *"] }), _jsx("input", { type: "date", id: "requestDeliveryDate", name: "requestDeliveryDate", value: formData.requestDeliveryDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestWeight", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "A\u011F\u0131rl\u0131k (ton) *"] }), _jsx("input", { type: "number", id: "requestWeight", name: "requestWeight", value: formData.requestWeight, onChange: handleInputChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 10.5" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "requestVolume", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "Hacim (m\u00B3) *"] }), _jsx("input", { type: "number", id: "requestVolume", name: "requestVolume", value: formData.requestVolume, onChange: handleInputChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 25.0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Teklif Alma \u015Eekli" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "requestOfferTypeDirect", name: "requestOfferType", value: "direct", checked: offerType === 'direct', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" }), _jsx("label", { htmlFor: "requestOfferTypeDirect", className: "ml-2 text-sm text-gray-700", children: "Do\u011Frudan Teklif" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "requestOfferTypePrice", name: "requestOfferType", value: "price", checked: offerType === 'price', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" }), _jsx("label", { htmlFor: "requestOfferTypePrice", className: "ml-2 text-sm text-gray-700", children: "Fiyat Belirleyerek" })] })] })] }), offerType === 'price' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "requestSetPrice", className: "block text-sm font-medium text-gray-700 mb-2", children: "Belirlenen Fiyat (TL) *" }), _jsx("input", { type: "number", id: "requestSetPrice", name: "requestSetPrice", value: formData.requestSetPrice, onChange: handleInputChange, min: "1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 5000" })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "requestDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "requestDescription", name: "requestDescription", value: formData.requestDescription, onChange: handleInputChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Nakliye talebiniz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), transportMode && (_jsxs("div", { className: "bg-white/50 rounded-3xl p-6 border border-gray-200", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "Gerekli Evraklar (", transportMode === 'road' ? 'Karayolu' : transportMode === 'sea' ? 'Denizyolu' : transportMode === 'air' ? 'Havayolu' : 'Demiryolu', ")"] }), transportMode === 'sea' ? (_jsx(_Fragment, { children: requiredDocuments.sea.map((group, groupIdx) => (_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "font-semibold text-primary-700 mb-2", children: group.group }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: group.documents.map((document, idx) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `sea_doc_${groupIdx}_${idx}`, checked: selectedDocuments.includes(document), onChange: (e) => handleDocumentChange(document, e.target.checked), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: `sea_doc_${groupIdx}_${idx}`, className: "ml-3 text-sm text-gray-700", children: document })] }, idx))) })] }, groupIdx))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: requiredDocuments[transportMode].map((document, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `doc_${index}`, checked: selectedDocuments.includes(document), onChange: (e) => handleDocumentChange(document, e.target.checked), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: `doc_${index}`, className: "ml-3 text-sm text-gray-700", children: document })] }, index))) })), selectedDocuments.length > 0 && (_jsx("div", { className: "mt-4 p-3 bg-primary-50 rounded-3xl border border-primary-200", children: _jsxs("p", { className: "text-sm text-primary-800", children: [_jsxs("strong", { children: ["Se\u00E7ilen Evraklar (", selectedDocuments.length, "):"] }), " ", selectedDocuments.join(', ')] }) }))] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Upload, { className: "mr-2 text-primary-600", size: 20 }), "Evrak Y\u00FCkleme & Dosya Ekleme"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: handleFileUpload, className: "hidden" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" }), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((document) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(document.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: document.name }), _jsx("p", { className: "text-sm text-gray-500", children: document.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDocumentPreview(document), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDownload(document), className: "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDelete(document.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, document.id))) })] }))] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setActiveSection('my-listings'), className: "px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm", disabled: isSubmitting, children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed", children: [isSubmitting && _jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }), isSubmitting ? 'Oluşturuluyor...' : 'İlanı Oluştur'] })] })] })] }), _jsx(Toaster, { position: "top-right" })] }));
};
export default CreateShipmentRequestSection;
