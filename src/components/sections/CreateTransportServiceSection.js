import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import Modal from '../common/Modal'; // Modal component
import { ArrowLeft, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2, Loader2, MapPin, Package, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { TransportServiceService, generateServiceNumber, validateIMO, validateMMSI } from '../../services/transportServiceNew';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
const CreateTransportServiceSection = () => {
    // İlan detayı modalı için state
    const [detailOpen, setDetailOpen] = useState(false);
    const [lastCreatedService, setLastCreatedService] = useState(null);
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const [transportMode, setTransportMode] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Test için global erişim (development only)
    if (import.meta.env.DEV) {
        globalThis.testTransportForm = () => {
            console.log('🧪 Test form data:', formData);
            console.log('👤 Current user:', user);
            console.log('🚚 Transport mode:', transportMode);
        };
    }
    // Inline uploadFile function to avoid import issues
    const uploadFile = async (file, bucket = 'documents', folder) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });
        if (error) {
            throw new Error(`Dosya yüklenirken hata oluştu: ${error.message}`);
        }
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        if (!publicUrlData?.publicUrl) {
            throw new Error('Public URL alınamadı');
        }
        return publicUrlData.publicUrl;
    };
    const [formData, setFormData] = useState({
        serviceNumber: generateServiceNumber(),
        serviceTitle: '',
        serviceTransportMode: '',
        serviceDescription: '',
        serviceOrigin: '',
        serviceDestination: '',
        serviceVehicleType: '',
        serviceAvailableDate: '',
        serviceAvailableUntilDate: '',
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
        grossTonnage: '',
        netTonnage: '',
        shipDimensions: '',
        freightType: '',
        chartererInfo: '',
        shipFlag: '',
        homePort: '',
        yearBuilt: '',
        speedKnots: '',
        fuelConsumption: '',
        ballastCapacity: '',
        // Havayolu için ek alanlar
        flightNumber: '',
        aircraftType: '',
        maxPayload: '',
        cargoVolume: '',
        // Demiryolu için ek alanlar
        trainNumber: '',
        wagonCount: '',
        wagonTypes: ''
    });
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Taşıma modu değiştiğinde state'i güncelle ve araç tipini sıfırla
        if (name === 'serviceTransportMode') {
            setTransportMode(value);
            setSelectedDocuments([]); // Seçili evrakları sıfırla
            setFormData(prev => ({
                ...prev,
                serviceVehicleType: '', // Araç tipini sıfırla
                // Modlara özel alanları sıfırla
                plateNumber: '',
                shipName: '',
                imoNumber: '',
                mmsiNumber: '',
                dwt: '',
                grossTonnage: '',
                netTonnage: '',
                shipDimensions: '',
                freightType: '',
                chartererInfo: '',
                shipFlag: '',
                homePort: '',
                yearBuilt: '',
                speedKnots: '',
                fuelConsumption: '',
                ballastCapacity: '',
                flightNumber: '',
                aircraftType: '',
                maxPayload: '',
                cargoVolume: '',
                trainNumber: '',
                wagonCount: '',
                wagonTypes: ''
            }));
        }
    };
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (files && user) {
            Array.from(files).forEach(async (file) => {
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
                    // Önce local olarak listeye ekle (loading state ile)
                    const tempDocument = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        type: file.type,
                        url: 'uploading...' // Yükleniyor durumu
                    };
                    setUploadedDocuments(prev => [...prev, tempDocument]);
                    try {
                        // Dosyayı Supabase'e yükle
                        const fileUrl = await uploadFile(file, 'documents', user.id);
                        // Başarılı yükleme sonrası URL'i güncelle
                        setUploadedDocuments(prev => prev.map(doc => doc.id === tempDocument.id
                            ? { ...doc, url: fileUrl }
                            : doc));
                        toast.success(`${file.name} başarıyla yüklendi.`);
                    }
                    catch (error) {
                        console.error('File upload error:', error);
                        toast.error(`${file.name} yüklenirken hata oluştu.`);
                        // Hatalı dosyayı listeden kaldır
                        setUploadedDocuments(prev => prev.filter(doc => doc.id !== tempDocument.id));
                    }
                }
                else {
                    toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
                }
            });
        }
        else if (!user) {
            toast.error('Dosya yüklemek için giriş yapmanız gerekiyor.');
        }
    };
    const handleDocumentSelect = (document) => {
        setSelectedDocuments(prev => {
            if (prev.includes(document)) {
                return prev.filter(doc => doc !== document);
            }
            else {
                return [...prev, document];
            }
        });
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
        // Denizyolu özel validasyonları
        if (formData.serviceTransportMode === 'sea') {
            if (!formData.shipName || !formData.imoNumber || !formData.mmsiNumber) {
                toast.error('Denizyolu için gemi adı, IMO ve MMSI numaraları zorunludur!');
                return;
            }
            if (!validateIMO(formData.imoNumber)) {
                toast.error('IMO numarası geçersiz! (Örn: IMO 1234567)');
                return;
            }
            if (!validateMMSI(formData.mmsiNumber)) {
                toast.error('MMSI numarası geçersiz! (9 haneli sayı olmalı)');
                return;
            }
            // Tarih validasyonu
            if (formData.serviceAvailableDate && formData.serviceAvailableUntilDate) {
                const startDate = new Date(formData.serviceAvailableDate);
                const endDate = new Date(formData.serviceAvailableUntilDate);
                if (startDate >= endDate) {
                    toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalı!');
                    return;
                }
            }
        }
        console.log('✅ All validations passed!');
        setIsSubmitting(true);
        try {
            console.log('📝 Creating transport service data...');
            // Yeni TransportService verisini hazırla
            const serviceData = {
                user_id: user.id,
                service_number: formData.serviceNumber,
                title: formData.serviceTitle,
                description: formData.serviceDescription,
                transport_mode: formData.serviceTransportMode,
                vehicle_type: formData.serviceVehicleType,
                origin: formData.serviceOrigin,
                destination: formData.serviceDestination,
                available_from_date: formData.serviceAvailableDate || undefined,
                available_until_date: formData.serviceAvailableUntilDate || undefined,
                capacity_value: formData.serviceCapacity ? parseFloat(formData.serviceCapacity) : undefined,
                capacity_unit: 'kg',
                contact_info: formData.serviceContact,
                company_name: formData.serviceCompanyName || undefined,
                status: 'active',
                // Karayolu alanları
                plate_number: formData.serviceTransportMode === 'road' ? formData.plateNumber : undefined,
                // Denizyolu alanları
                ship_name: formData.serviceTransportMode === 'sea' ? formData.shipName : undefined,
                imo_number: formData.serviceTransportMode === 'sea' ? formData.imoNumber : undefined,
                mmsi_number: formData.serviceTransportMode === 'sea' ? formData.mmsiNumber : undefined,
                dwt: formData.serviceTransportMode === 'sea' && formData.dwt ? parseFloat(formData.dwt) : undefined,
                gross_tonnage: formData.serviceTransportMode === 'sea' && formData.grossTonnage ? parseFloat(formData.grossTonnage) : undefined,
                net_tonnage: formData.serviceTransportMode === 'sea' && formData.netTonnage ? parseFloat(formData.netTonnage) : undefined,
                ship_dimensions: formData.serviceTransportMode === 'sea' ? formData.shipDimensions : undefined,
                freight_type: formData.serviceTransportMode === 'sea' ? formData.freightType : undefined,
                charterer_info: formData.serviceTransportMode === 'sea' ? formData.chartererInfo : undefined,
                ship_flag: formData.serviceTransportMode === 'sea' ? formData.shipFlag : undefined,
                home_port: formData.serviceTransportMode === 'sea' ? formData.homePort : undefined,
                year_built: formData.serviceTransportMode === 'sea' && formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
                speed_knots: formData.serviceTransportMode === 'sea' && formData.speedKnots ? parseFloat(formData.speedKnots) : undefined,
                fuel_consumption: formData.serviceTransportMode === 'sea' ? formData.fuelConsumption : undefined,
                ballast_capacity: formData.serviceTransportMode === 'sea' && formData.ballastCapacity ? parseFloat(formData.ballastCapacity) : undefined,
                // Havayolu alanları
                flight_number: formData.serviceTransportMode === 'air' ? formData.flightNumber : undefined,
                aircraft_type: formData.serviceTransportMode === 'air' ? formData.aircraftType : undefined,
                max_payload: formData.serviceTransportMode === 'air' && formData.maxPayload ? parseFloat(formData.maxPayload) : undefined,
                cargo_volume: formData.serviceTransportMode === 'air' && formData.cargoVolume ? parseFloat(formData.cargoVolume) : undefined,
                // Demiryolu alanları
                train_number: formData.serviceTransportMode === 'rail' ? formData.trainNumber : undefined,
                wagon_count: formData.serviceTransportMode === 'rail' && formData.wagonCount ? parseInt(formData.wagonCount) : undefined,
                wagon_types: formData.serviceTransportMode === 'rail' && formData.wagonTypes ? formData.wagonTypes.split(',').map(t => t.trim()) : undefined,
                // Evraklar
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : undefined,
                document_urls: uploadedDocuments
                    .filter(doc => doc.url !== 'uploading...' && doc.url.startsWith('http'))
                    .map(doc => doc.url)
            };
            console.log('🚀 Creating transport service with data:', serviceData);
            // TransportService oluştur
            const newService = await TransportServiceService.createTransportService(serviceData);
            console.log('✅ Transport service created successfully:', newService);
            // Son oluşturulan servisi state'e kaydet
            setLastCreatedService(newService);
            setDetailOpen(true);
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
            availableDate: 'Müsaitlik Başlangıç Tarihi',
            capacity: mode === 'air' ? 'Kargo Kapasitesi (kg/m³)'
                : mode === 'sea' ? 'Yük Kapasitesi (DWT) *'
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
                : mode === 'sea' ? 'Örn: 25000 GT'
                    : 'Örn: 20 ton'
        };
    }
    // ...existing code...
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { open: detailOpen, onClose: () => setDetailOpen(false), title: "Olu\u015Fturulan Nakliye Hizmeti Detay\u0131", children: lastCreatedService && (_jsx("div", { className: "max-h-[70vh] overflow-auto", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("strong", { children: "Servis No:" }), " ", lastCreatedService.service_number] }), _jsxs("div", { children: [_jsx("strong", { children: "Ba\u015Fl\u0131k:" }), " ", lastCreatedService.title] }), _jsxs("div", { children: [_jsx("strong", { children: "Ta\u015F\u0131ma Modu:" }), " ", lastCreatedService.transport_mode] }), _jsxs("div", { children: [_jsx("strong", { children: "Ara\u00E7 Tipi:" }), " ", lastCreatedService.vehicle_type] }), _jsxs("div", { children: [_jsx("strong", { children: "Kalk\u0131\u015F:" }), " ", lastCreatedService.origin] }), _jsxs("div", { children: [_jsx("strong", { children: "Var\u0131\u015F:" }), " ", lastCreatedService.destination] }), lastCreatedService.transport_mode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("strong", { children: "Gemi Ad\u0131:" }), " ", lastCreatedService.ship_name] }), _jsxs("div", { children: [_jsx("strong", { children: "IMO:" }), " ", lastCreatedService.imo_number] }), _jsxs("div", { children: [_jsx("strong", { children: "MMSI:" }), " ", lastCreatedService.mmsi_number] }), _jsxs("div", { children: [_jsx("strong", { children: "DWT:" }), " ", lastCreatedService.dwt] })] })), _jsxs("div", { children: [_jsx("strong", { children: "A\u00E7\u0131klama:" }), " ", lastCreatedService.description] })] }) })) }), _jsx("div", { className: "space-y-6 animate-fade-in", children: _jsxs("div", { className: `rounded-3xl shadow-lg p-6 transition-all duration-300 ${getTransportBackground()}`, children: [transportMode && (_jsx("div", { className: "absolute inset-0 opacity-5 pointer-events-none", dangerouslySetInnerHTML: { __html: getTransportBackgroundImage() } })), _jsxs("div", { className: "flex items-center mb-8 relative z-10", children: [_jsx("button", { onClick: () => setActiveSection('my-listings'), className: "mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full", title: "Geri", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Yeni Nakliye \u0130lan\u0131 Olu\u015Ftur" }), transportMode && (_jsx("div", { className: "ml-auto hidden md:block", children: getTransportIcon() }))] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 relative z-10", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "serviceNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye \u0130lan\u0131 No" }), _jsx("input", { type: "text", id: "serviceNumber", name: "serviceNumber", value: formData.serviceNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "serviceTitle", name: "serviceTitle", value: formData.serviceTitle, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara G\u00FCzergah\u0131 Nakliye Hizmeti" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceTransportMode", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ta\u015F\u0131ma Modu *" }), _jsxs("select", { id: "serviceTransportMode", name: "serviceTransportMode", value: formData.serviceTransportMode, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "road", children: "\uD83D\uDE9B Karayolu" }), _jsx("option", { value: "sea", children: "\uD83D\uDEA2 Denizyolu" }), _jsx("option", { value: "air", children: "\u2708\uFE0F Havayolu" }), _jsx("option", { value: "rail", children: "\uD83D\uDE82 Demiryolu" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceOrigin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().origin, " *"] }), _jsx("input", { type: "text", id: "serviceOrigin", name: "serviceOrigin", value: formData.serviceOrigin, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().origin })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceDestination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().destination, " *"] }), _jsx("input", { type: "text", id: "serviceDestination", name: "serviceDestination", value: formData.serviceDestination, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().destination })] }), transportMode && (_jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceVehicleType", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Truck, { className: "inline w-4 h-4 mr-1" }), "Ara\u00E7 Tipi *"] }), _jsxs("select", { id: "serviceVehicleType", name: "serviceVehicleType", value: formData.serviceVehicleType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Ara\u00E7 tipi se\u00E7iniz..." }), vehicleTypes[transportMode]?.map((group, groupIndex) => (_jsx("optgroup", { label: group.group, children: group.vehicles.map((vehicle) => (_jsx("option", { value: vehicle.value, children: vehicle.label }, vehicle.value))) }, groupIndex)))] })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceAvailableDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().availableDate, " *"] }), _jsx("input", { type: "date", id: "serviceAvailableDate", name: "serviceAvailableDate", value: formData.serviceAvailableDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), formData.serviceTransportMode && (_jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceAvailableUntilDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "M\u00FCsaitlik Biti\u015F Tarihi"] }), _jsx("input", { type: "date", id: "serviceAvailableUntilDate", name: "serviceAvailableUntilDate", value: formData.serviceAvailableUntilDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm" })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "serviceCapacity", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), getDynamicFieldLabels().capacity, " *"] }), _jsx("input", { type: "number", id: "serviceCapacity", name: "serviceCapacity", value: formData.serviceCapacity, onChange: handleInputChange, min: "0.1", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: getDynamicPlaceholders().capacity })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceCompanyName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Firma Ad\u0131 (Opsiyonel)" }), _jsx("input", { type: "text", id: "serviceCompanyName", name: "serviceCompanyName", value: formData.serviceCompanyName, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: ABC Lojistik A.\u015E." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceContact", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130leti\u015Fim Bilgileri (E-posta/Telefon) *" }), _jsx("input", { type: "text", id: "serviceContact", name: "serviceContact", value: formData.serviceContact, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: info@abclojistik.com veya +90 555 123 4567" })] }), formData.serviceTransportMode === 'road' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "plateNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE9B Plaka / \u015Easi Numaras\u0131" }), _jsx("input", { type: "text", id: "plateNumber", name: "plateNumber", value: formData.plateNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 34 ABC 123 veya WJMM62AUZ7C123456" })] })), formData.serviceTransportMode === 'sea' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "shipName", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDEA2 Gemi Ad\u0131 *" }), _jsx("input", { type: "text", id: "shipName", name: "shipName", value: formData.shipName, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: MV KARGO EXPRESS" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "imoNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDD94 IMO No *" }), _jsx("input", { type: "text", id: "imoNumber", name: "imoNumber", value: formData.imoNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: IMO 1234567" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "mmsiNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCE1 MMSI No *" }), _jsx("input", { type: "text", id: "mmsiNumber", name: "mmsiNumber", value: formData.mmsiNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 271234567" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shipDimensions", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCF Boyutlar (LOA, Beam) *" }), _jsx("input", { type: "text", id: "shipDimensions", name: "shipDimensions", value: formData.shipDimensions, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: LOA: 180m, Beam: 28m" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "freightType", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCB0 Navlun Tipi *" }), _jsx("input", { type: "text", id: "freightType", name: "freightType", value: formData.freightType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: Lump sum, USD/ton, Time charter" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "chartererInfo", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDFE2 Charterer / Broker Bilgisi" }), _jsx("input", { type: "text", id: "chartererInfo", name: "chartererInfo", value: formData.chartererInfo, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: ABC Shipping & Brokerage" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "grossTonnage", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCA Gross Tonnage (GT)" }), _jsx("input", { type: "text", id: "grossTonnage", name: "grossTonnage", value: formData.grossTonnage, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 15000 GT" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "netTonnage", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCA Net Tonnage (NT)" }), _jsx("input", { type: "text", id: "netTonnage", name: "netTonnage", value: formData.netTonnage, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 8000 NT" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shipFlag", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDFF4 Bayrak Devleti" }), _jsx("input", { type: "text", id: "shipFlag", name: "shipFlag", value: formData.shipFlag, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: Turkey, Malta, Panama" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "homePort", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDFE0 Ba\u011Flama Liman\u0131" }), _jsx("input", { type: "text", id: "homePort", name: "homePort", value: formData.homePort, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: \u0130stanbul" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "yearBuilt", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDD28 \u0130n\u015Fa Y\u0131l\u0131" }), _jsx("input", { type: "text", id: "yearBuilt", name: "yearBuilt", value: formData.yearBuilt, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 2018" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "speedKnots", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u26A1 H\u0131z (Knot)" }), _jsx("input", { type: "text", id: "speedKnots", name: "speedKnots", value: formData.speedKnots, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 14.5 knot" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "fuelConsumption", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u26FD Yak\u0131t T\u00FCketimi" }), _jsx("input", { type: "text", id: "fuelConsumption", name: "fuelConsumption", value: formData.fuelConsumption, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 25 MT/day" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "ballastCapacity", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83C\uDF0A Balast Kapasitesi" }), _jsx("input", { type: "text", id: "ballastCapacity", name: "ballastCapacity", value: formData.ballastCapacity, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 8000 MT" })] })] })), formData.serviceTransportMode === 'air' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "flightNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2708\uFE0F U\u00E7u\u015F Numaras\u0131" }), _jsx("input", { type: "text", id: "flightNumber", name: "flightNumber", value: formData.flightNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TK123 veya CRG456" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "aircraftType", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u2708\uFE0F U\u00E7ak Tipi" }), _jsx("input", { type: "text", id: "aircraftType", name: "aircraftType", value: formData.aircraftType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: Boeing 747F, Airbus A330F" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "maxPayload", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCE6 Maksimum Payload (kg)" }), _jsx("input", { type: "text", id: "maxPayload", name: "maxPayload", value: formData.maxPayload, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 134000" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "cargoVolume", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDCCF Kargo Hacmi (m\u00B3)" }), _jsx("input", { type: "text", id: "cargoVolume", name: "cargoVolume", value: formData.cargoVolume, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 858" })] })] })), formData.serviceTransportMode === 'rail' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "trainNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE82 Tren/Kompozisyon No" }), _jsx("input", { type: "text", id: "trainNumber", name: "trainNumber", value: formData.trainNumber, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: TR-12345 veya K-KARGO-67" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "wagonCount", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE83 Vagon Say\u0131s\u0131" }), _jsx("input", { type: "text", id: "wagonCount", name: "wagonCount", value: formData.wagonCount, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 25" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "wagonTypes", className: "block text-sm font-medium text-gray-700 mb-2", children: "\uD83D\uDE83 Vagon Tipleri (virg\u00FClle ay\u0131r\u0131n)" }), _jsx("input", { type: "text", id: "wagonTypes", name: "wagonTypes", value: formData.wagonTypes, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: A\u00E7\u0131k Y\u00FCk Vagonu, Kapal\u0131 Y\u00FCk Vagonu" })] })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "serviceDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "serviceDescription", name: "serviceDescription", value: formData.serviceDescription, onChange: handleInputChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Nakliye hizmetiniz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), formData.serviceTransportMode && (_jsxs("div", { className: "bg-white/50 rounded-3xl p-6 border border-gray-200", children: [_jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "\uD83D\uDCCB Gerekli Evraklar (", formData.serviceTransportMode === 'road' ? 'Karayolu' : formData.serviceTransportMode === 'sea' ? 'Denizyolu' : formData.serviceTransportMode === 'air' ? 'Havayolu' : 'Demiryolu', ")"] }), formData.serviceTransportMode === 'sea' ? (_jsx(_Fragment, { children: [
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
                                            ].map((group, groupIdx) => (_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "font-semibold text-primary-700 mb-2", children: group.group }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: group.documents.map((document, idx) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `sea_doc_${groupIdx}_${idx}`, checked: selectedDocuments.includes(document), onChange: () => handleDocumentSelect(document), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: `sea_doc_${groupIdx}_${idx}`, className: "ml-3 text-sm text-gray-700", children: document })] }, idx))) })] }, groupIdx))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: requiredDocuments[formData.serviceTransportMode]?.map((document, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: `document-${index}`, checked: selectedDocuments.includes(document), onChange: () => handleDocumentSelect(document), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsxs("label", { htmlFor: `document-${index}`, className: "ml-2 text-sm text-gray-700", children: ["\uD83D\uDCC4 ", document] })] }, index))) })), selectedDocuments.length > 0 && (_jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200", children: [_jsxs("p", { className: "text-sm text-blue-800 font-medium", children: ["Se\u00E7ilen Evraklar (", selectedDocuments.length, ")"] }), _jsx("div", { className: "mt-2 text-xs text-blue-600", children: selectedDocuments.join(', ') })] }))] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "Evrak Y\u00FCkleme Alan\u0131"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: handleFileUpload, className: "hidden" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" }), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((document) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(document.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: document.name }), _jsx("p", { className: "text-sm text-gray-500", children: document.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDocumentPreview(document), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDownload(document), className: "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDelete(document.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, document.id))) })] }))] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setActiveSection('my-listings'), className: "px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm", disabled: isSubmitting, children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed", children: [isSubmitting && _jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }), isSubmitting ? 'Oluşturuluyor...' : 'İlanı Oluştur'] })] })] })] }) })] }));
};
export default CreateTransportServiceSection;
