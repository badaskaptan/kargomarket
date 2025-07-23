import React, { useState } from 'react';
import { Calendar, Package, MapPin, FileText, Upload, Eye, Download, Trash2, Truck, Ship, Plane, Train } from 'lucide-react';
import type { TransportService, TransportServiceUpdate } from '../../types/database-types';
import { supabase, storage } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface EditTransportServiceModalProps {
    service: TransportService;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: (updated: TransportService) => void;
}

// Transport Service API class
class TransportServiceService {
    static async updateTransportService(id: string, updates: TransportServiceUpdate): Promise<TransportService> {
        console.log('📝 Updating transport service:', id, updates);

        const { data, error } = await supabase
            .from('transport_services')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Transport service update failed:', error);
            throw new Error(`Transport service update failed: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned from transport service update');
        }

        console.log('✅ Transport service updated successfully:', data);
        return data;
    }
}

const EditTransportServiceModal: React.FC<EditTransportServiceModalProps> = ({ service, isOpen, onClose, onUpdated }) => {
    const [formData, setFormData] = useState({
        serviceNumber: service.service_number || '',
        serviceTitle: service.title || '',
        serviceTransportMode: service.transport_mode || '',
        serviceDescription: service.description || '',
        serviceOrigin: service.origin || '',
        serviceDestination: service.destination || '',
        serviceVehicleType: service.vehicle_type || '',
        serviceAvailableDate: service.available_from_date || '',
        serviceAvailableUntilDate: service.available_until_date || '',
        serviceCapacity: service.capacity_value?.toString() || '',
        serviceCompanyName: service.company_name || '',
        serviceContact: service.contact_info || '',
        // Karayolu için ek alanlar
        plateNumber: service.plate_number || '',
        // Denizyolu için ek alanlar
        shipName: service.ship_name || '',
        imoNumber: service.imo_number || '',
        mmsiNumber: service.mmsi_number || '',
        dwt: service.dwt?.toString() || '',
        grossTonnage: service.gross_tonnage?.toString() || '',
        netTonnage: service.net_tonnage?.toString() || '',
        shipDimensions: service.ship_dimensions || '',
        freightType: service.freight_type || '',
        chartererInfo: service.charterer_info || '',
        shipFlag: service.ship_flag || '',
        homePort: service.home_port || '',
        yearBuilt: service.year_built?.toString() || '',
        speedKnots: service.speed_knots?.toString() || '',
        fuelConsumption: service.fuel_consumption || '',
        ballastCapacity: service.ballast_capacity?.toString() || '',
        // Havayolu için ek alanlar
        flightNumber: service.flight_number || '',
        aircraftType: service.aircraft_type || '',
        maxPayload: service.max_payload?.toString() || '',
        cargoVolume: service.cargo_volume?.toString() || '',
        // Demiryolu için ek alanlar
        trainNumber: service.train_number || '',
        wagonCount: service.wagon_count?.toString() || '',
        wagonTypes: service.wagon_types?.join(', ') || ''
    });

    const [transportMode, setTransportMode] = useState(service.transport_mode || '');
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>(service.required_documents || []);
    const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
        id: string;
        name: string;
        size: string;
        type: string;
        url: string;
        file?: File;
        documentType?: string;
    }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Araç tipleri taşıma moduna göre
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
                group: 'Tanker',
                vehicles: [
                    { value: 'tanker_product', label: 'Ürün Tankeri (10,000-60,000 DWT)' },
                    { value: 'tanker_chemical', label: 'Kimyasal Tanker (5,000-40,000 DWT)' },
                    { value: 'tanker_crude', label: 'Ham Petrol Tankeri (60,000+ DWT)' },
                    { value: 'tanker_lpg', label: 'LPG Tankeri (5,000-80,000 m³)' },
                    { value: 'tanker_lng', label: 'LNG Tankeri (150,000-180,000 m³)' }
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
            // GEMİ OPERASYONEL & UYGUNLUK BELGELERİ (Vetting/Yeterlilik)
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
            'Vessel Particulars / Registration Certificate',

            // STANDART DENİZYOLU TAŞIMA BELGELERİ
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Taşıma modu değiştiğinde state'i güncelle
        if (name === 'serviceTransportMode') {
            setTransportMode(value as 'road' | 'sea' | 'air' | 'rail');
            setSelectedDocuments([]);
            setFormData(prev => ({
                ...prev,
                serviceVehicleType: '',
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

    const handleDocumentChange = (document: string, checked: boolean) => {
        if (checked) {
            setSelectedDocuments(prev => [...prev, document]);
        } else {
            setSelectedDocuments(prev => prev.filter(doc => doc !== document));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
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
                        documentType: 'service_document'
                    };
                    setUploadedDocuments(prev => [...prev, newDocument]);
                } else {
                    toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
                }
            });
        }
    };

    const handleDocumentDelete = (id: string) => {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    const handleDocumentPreview = (document: { id: string; name: string; size: string; type: string; url: string }) => {
        window.open(document.url, '_blank');
    };

    const handleDocumentDownload = (document: { id: string; name: string; size: string; type: string; url: string }) => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        link.click();
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('image')) return '🖼️';
        return '📎';
    };

    const getTransportIcon = (mode: string) => {
        switch (mode) {
            case 'road': return <Truck className="w-5 h-5" />;
            case 'sea': return <Ship className="w-5 h-5" />;
            case 'air': return <Plane className="w-5 h-5" />;
            case 'rail': return <Train className="w-5 h-5" />;
            default: return null;
        }
    };

    const validateIMO = (imo: string): boolean => {
        if (!imo) return true; // Opsiyonel alan
        const imoRegex = /^\d{7}$/;
        return imoRegex.test(imo.trim());
    };

    const validateMMSI = (mmsi: string): boolean => {
        if (!mmsi) return true; // Opsiyonel alan
        const mmsiRegex = /^\d{9}$/;
        return mmsiRegex.test(mmsi.trim());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Form validasyonu
        if (!formData.serviceTitle || !transportMode || !formData.serviceVehicleType || !formData.serviceAvailableDate) {
            toast.error('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }

        // Denizyolu için özel validasyonlar
        if (transportMode === 'sea') {
            if (formData.imoNumber && !validateIMO(formData.imoNumber)) {
                toast.error('IMO numarası 7 haneli olmalıdır!');
                return;
            }
            if (formData.mmsiNumber && !validateMMSI(formData.mmsiNumber)) {
                toast.error('MMSI numarası 9 haneli olmalıdır!');
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const capacityValue = formData.serviceCapacity ? parseFloat(formData.serviceCapacity) : null;

            // Araç detaylarını hazırla - artık direkt tabloda
            const updateData: TransportServiceUpdate = {
                title: formData.serviceTitle,
                description: formData.serviceDescription,
                origin: formData.serviceOrigin,
                destination: formData.serviceDestination,
                transport_mode: transportMode as 'road' | 'sea' | 'air' | 'rail',
                vehicle_type: formData.serviceVehicleType,
                capacity_value: capacityValue,
                available_from_date: formData.serviceAvailableDate || null,
                available_until_date: formData.serviceAvailableUntilDate || null,
                company_name: formData.serviceCompanyName,
                contact_info: formData.serviceContact,
                required_documents: selectedDocuments.length > 0 ? selectedDocuments : null,
                service_number: formData.serviceNumber
            };

            // Taşıma moduna göre özel alanları ekle
            if (transportMode === 'road') {
                updateData.plate_number = formData.plateNumber || null;
            } else if (transportMode === 'sea') {
                updateData.ship_name = formData.shipName || null;
                updateData.imo_number = formData.imoNumber || null;
                updateData.mmsi_number = formData.mmsiNumber || null;
                updateData.dwt = formData.dwt ? parseFloat(formData.dwt) : null;
                updateData.gross_tonnage = formData.grossTonnage ? parseFloat(formData.grossTonnage) : null;
                updateData.net_tonnage = formData.netTonnage ? parseFloat(formData.netTonnage) : null;
                updateData.ship_dimensions = formData.shipDimensions || null;
                updateData.freight_type = formData.freightType || null;
                updateData.charterer_info = formData.chartererInfo || null;
                updateData.ship_flag = formData.shipFlag || null;
                updateData.home_port = formData.homePort || null;
                updateData.year_built = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
                updateData.speed_knots = formData.speedKnots ? parseFloat(formData.speedKnots) : null;
                updateData.fuel_consumption = formData.fuelConsumption || null;
                updateData.ballast_capacity = formData.ballastCapacity ? parseFloat(formData.ballastCapacity) : null;
            } else if (transportMode === 'air') {
                updateData.flight_number = formData.flightNumber || null;
                updateData.aircraft_type = formData.aircraftType || null;
                updateData.max_payload = formData.maxPayload ? parseFloat(formData.maxPayload) : null;
                updateData.cargo_volume = formData.cargoVolume ? parseFloat(formData.cargoVolume) : null;
            } else if (transportMode === 'rail') {
                updateData.train_number = formData.trainNumber || null;
                updateData.wagon_count = formData.wagonCount ? parseInt(formData.wagonCount) : null;
                updateData.wagon_types = formData.wagonTypes ? formData.wagonTypes.split(',').map(t => t.trim()) : null;
            }

            // Yeni evrakları yükle
            const documentUrls: string[] = [...(service.document_urls || [])];
            console.log('📋 EditTransportService: Starting document upload process', {
                existingDocuments: service.document_urls || [],
                uploadedDocuments: uploadedDocuments.length,
                documentUrls: documentUrls.length
            });

            for (const doc of uploadedDocuments) {
                if (doc.file && doc.documentType) {
                    try {
                        console.log('📄 EditTransportService: Uploading document', { name: doc.name, type: doc.documentType });
                        const result = await storage.uploadListingDocument(service.id, doc.file, doc.documentType);
                        if (result.data) {
                            documentUrls.push(result.data.publicUrl);
                            console.log('✅ EditTransportService: Document uploaded successfully', { url: result.data.publicUrl });
                        }
                    } catch (docError) {
                        console.warn('❌ EditTransportService: Document upload error:', docError);
                    }
                }
            }

            console.log('📋 EditTransportService: Final document URLs', {
                original: service.document_urls || [],
                final: documentUrls,
                added: documentUrls.length - (service.document_urls?.length || 0)
            });

            // Dosya URL'lerini güncelleme verilerine ekle
            if (documentUrls.length > 0) {
                updateData.document_urls = documentUrls;
                console.log('📋 EditTransportService: Setting document_urls in updateData', {
                    count: documentUrls.length,
                    urls: documentUrls
                });
            }

            console.log('🔄 EditTransportService: Sending update to database', {
                serviceId: service.id,
                updateData: { ...updateData, document_urls: updateData.document_urls?.length || 0 }
            });

            const updated = await TransportServiceService.updateTransportService(service.id, updateData);

            console.log('✅ EditTransportService: Update completed', {
                updatedId: updated.id,
                finalDocuments: updated.document_urls?.length || 0
            });

            toast.success('Nakliye hizmeti başarıyla güncellendi!');

            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (err: unknown) {
            console.error('Update error:', err);
            if (err instanceof Error) {
                setError(err.message);
                toast.error(err.message);
            } else {
                setError('Güncelleme başarısız');
                toast.error('Güncelleme başarısız');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Nakliye Hizmeti Düzenle</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hizmet No */}
                        <div>
                            <label htmlFor="serviceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Hizmet No
                            </label>
                            <input
                                type="text"
                                id="serviceNumber"
                                name="serviceNumber"
                                value={formData.serviceNumber}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed shadow-sm"
                                readOnly
                            />
                        </div>

                        {/* Hizmet Başlığı */}
                        <div>
                            <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                Hizmet Başlığı *
                            </label>
                            <input
                                type="text"
                                id="serviceTitle"
                                name="serviceTitle"
                                value={formData.serviceTitle}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                required
                                placeholder="Örn: İstanbul-Ankara Nakliye Hizmeti"
                            />
                        </div>

                        {/* Taşıma Modu */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Taşıma Modu *</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { value: 'road', label: 'Karayolu', icon: <Truck className="w-6 h-6" /> },
                                    { value: 'sea', label: 'Denizyolu', icon: <Ship className="w-6 h-6" /> },
                                    { value: 'air', label: 'Havayolu', icon: <Plane className="w-6 h-6" /> },
                                    { value: 'rail', label: 'Demiryolu', icon: <Train className="w-6 h-6" /> }
                                ].map((mode) => (
                                    <div
                                        key={mode.value}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, serviceTransportMode: mode.value as 'road' | 'sea' | 'air' | 'rail' }));
                                            handleInputChange({
                                                target: { name: 'serviceTransportMode', value: mode.value }
                                            } as React.ChangeEvent<HTMLSelectElement>);
                                        }}
                                        className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${transportMode === mode.value
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            {mode.icon}
                                            <span className="font-medium">{mode.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Araç Tipi */}
                        {transportMode && (
                            <div className="md:col-span-2">
                                <label htmlFor="serviceVehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                                    {getTransportIcon(transportMode)}
                                    <span className="ml-2">Araç Tipi *</span>
                                </label>
                                <select
                                    id="serviceVehicleType"
                                    name="serviceVehicleType"
                                    value={formData.serviceVehicleType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                    required
                                >
                                    <option value="">Araç Tipi Seçin</option>
                                    {vehicleTypes[transportMode as keyof typeof vehicleTypes]?.map((group) => (
                                        <optgroup key={group.group} label={group.group}>
                                            {group.vehicles.map((vehicle) => (
                                                <option key={vehicle.value} value={vehicle.value}>
                                                    {vehicle.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Kalkış Noktası */}
                        <div>
                            <label htmlFor="serviceOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Kalkış Noktası
                            </label>
                            <input
                                type="text"
                                id="serviceOrigin"
                                name="serviceOrigin"
                                value={formData.serviceOrigin}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                placeholder="Örn: İstanbul, Türkiye"
                            />
                        </div>

                        {/* Varış Noktası */}
                        <div>
                            <label htmlFor="serviceDestination" className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Varış Noktası
                            </label>
                            <input
                                type="text"
                                id="serviceDestination"
                                name="serviceDestination"
                                value={formData.serviceDestination}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                placeholder="Örn: Ankara, Türkiye"
                            />
                        </div>

                        {/* Müsait Tarih */}
                        <div>
                            <label htmlFor="serviceAvailableDate" className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                Müsait Tarih *
                            </label>
                            <input
                                type="date"
                                id="serviceAvailableDate"
                                name="serviceAvailableDate"
                                value={formData.serviceAvailableDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                required
                            />
                        </div>

                        {/* Müsait Son Tarih */}
                        <div>
                            <label htmlFor="serviceAvailableUntilDate" className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                Müsait Son Tarih
                            </label>
                            <input
                                type="date"
                                id="serviceAvailableUntilDate"
                                name="serviceAvailableUntilDate"
                                value={formData.serviceAvailableUntilDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                            />
                        </div>

                        {/* Kapasite */}
                        <div>
                            <label htmlFor="serviceCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                                <Package className="inline w-4 h-4 mr-1" />
                                Kapasite (ton)
                            </label>
                            <input
                                type="number"
                                id="serviceCapacity"
                                name="serviceCapacity"
                                value={formData.serviceCapacity}
                                onChange={handleInputChange}
                                min="0.1"
                                max="999999"
                                step="0.1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                placeholder="Örn: 25.0"
                            />
                        </div>

                        {/* Şirket Adı */}
                        <div>
                            <label htmlFor="serviceCompanyName" className="block text-sm font-medium text-gray-700 mb-2">
                                Şirket Adı
                            </label>
                            <input
                                type="text"
                                id="serviceCompanyName"
                                name="serviceCompanyName"
                                value={formData.serviceCompanyName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                placeholder="Örn: ABC Nakliyat Ltd."
                            />
                        </div>

                        {/* Karayolu için özel alanlar */}
                        {transportMode === 'road' && (
                            <div>
                                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Plaka
                                </label>
                                <input
                                    type="text"
                                    id="plateNumber"
                                    name="plateNumber"
                                    value={formData.plateNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                    placeholder="Örn: 34 ABC 123"
                                />
                            </div>
                        )}

                        {/* Denizyolu için özel alanlar */}
                        {transportMode === 'sea' && (
                            <>
                                <div>
                                    <label htmlFor="shipName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Gemi Adı
                                    </label>
                                    <input
                                        type="text"
                                        id="shipName"
                                        name="shipName"
                                        value={formData.shipName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: MV ISTANBUL"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="imoNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        IMO Numarası
                                    </label>
                                    <input
                                        type="text"
                                        id="imoNumber"
                                        name="imoNumber"
                                        value={formData.imoNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="7 haneli IMO numarası"
                                        maxLength={7}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="mmsiNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        MMSI Numarası
                                    </label>
                                    <input
                                        type="text"
                                        id="mmsiNumber"
                                        name="mmsiNumber"
                                        value={formData.mmsiNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="9 haneli MMSI numarası"
                                        maxLength={9}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dwt" className="block text-sm font-medium text-gray-700 mb-2">
                                        DWT (Deadweight Tonnage)
                                    </label>
                                    <input
                                        type="number"
                                        id="dwt"
                                        name="dwt"
                                        value={formData.dwt}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 75000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="grossTonnage" className="block text-sm font-medium text-gray-700 mb-2">
                                        Gross Tonnage
                                    </label>
                                    <input
                                        type="number"
                                        id="grossTonnage"
                                        name="grossTonnage"
                                        value={formData.grossTonnage}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 40000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="netTonnage" className="block text-sm font-medium text-gray-700 mb-2">
                                        Net Tonnage
                                    </label>
                                    <input
                                        type="number"
                                        id="netTonnage"
                                        name="netTonnage"
                                        value={formData.netTonnage}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 25000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shipDimensions" className="block text-sm font-medium text-gray-700 mb-2">
                                        Gemi Boyutları (LOA x Beam x Draft)
                                    </label>
                                    <input
                                        type="text"
                                        id="shipDimensions"
                                        name="shipDimensions"
                                        value={formData.shipDimensions}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 225m x 32m x 14.5m"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="freightType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Navlun Tipi
                                    </label>
                                    <input
                                        type="text"
                                        id="freightType"
                                        name="freightType"
                                        value={formData.freightType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: Dry Bulk, Container, Tanker"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="chartererInfo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Kiralayan Bilgisi
                                    </label>
                                    <input
                                        type="text"
                                        id="chartererInfo"
                                        name="chartererInfo"
                                        value={formData.chartererInfo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Kiralayan şirket bilgisi"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="homePort" className="block text-sm font-medium text-gray-700 mb-2">
                                        Ana Liman
                                    </label>
                                    <input
                                        type="text"
                                        id="homePort"
                                        name="homePort"
                                        value={formData.homePort}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: Istanbul"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-2">
                                        İnşa Yılı
                                    </label>
                                    <input
                                        type="number"
                                        id="yearBuilt"
                                        name="yearBuilt"
                                        value={formData.yearBuilt}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 2010"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="speedKnots" className="block text-sm font-medium text-gray-700 mb-2">
                                        Hız (Knot)
                                    </label>
                                    <input
                                        type="number"
                                        id="speedKnots"
                                        name="speedKnots"
                                        value={formData.speedKnots}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 14.5"
                                        step="0.1"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fuelConsumption" className="block text-sm font-medium text-gray-700 mb-2">
                                        Yakıt Tüketimi
                                    </label>
                                    <input
                                        type="text"
                                        id="fuelConsumption"
                                        name="fuelConsumption"
                                        value={formData.fuelConsumption}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 35 MT/day at sea"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ballastCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                                        Balast Kapasitesi (MT)
                                    </label>
                                    <input
                                        type="number"
                                        id="ballastCapacity"
                                        name="ballastCapacity"
                                        value={formData.ballastCapacity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 45000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shipFlag" className="block text-sm font-medium text-gray-700 mb-2">
                                        Gemi Bayrağı
                                    </label>
                                    <input
                                        type="text"
                                        id="shipFlag"
                                        name="shipFlag"
                                        value={formData.shipFlag}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: Turkish Flag"
                                    />
                                </div>
                            </>
                        )}

                        {/* Havayolu için özel alanlar */}
                        {transportMode === 'air' && (
                            <>
                                <div>
                                    <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Uçuş Numarası
                                    </label>
                                    <input
                                        type="text"
                                        id="flightNumber"
                                        name="flightNumber"
                                        value={formData.flightNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: TK001"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="aircraftType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Uçak Tipi
                                    </label>
                                    <input
                                        type="text"
                                        id="aircraftType"
                                        name="aircraftType"
                                        value={formData.aircraftType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: Boeing 777F"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="maxPayload" className="block text-sm font-medium text-gray-700 mb-2">
                                        Maksimum Payload (kg)
                                    </label>
                                    <input
                                        type="number"
                                        id="maxPayload"
                                        name="maxPayload"
                                        value={formData.maxPayload}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 103000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cargoVolume" className="block text-sm font-medium text-gray-700 mb-2">
                                        Kargo Hacmi (m³)
                                    </label>
                                    <input
                                        type="number"
                                        id="cargoVolume"
                                        name="cargoVolume"
                                        value={formData.cargoVolume}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 858"
                                        step="0.1"
                                    />
                                </div>
                            </>
                        )}

                        {/* Demiryolu için özel alanlar */}
                        {transportMode === 'rail' && (
                            <>
                                <div>
                                    <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tren Numarası
                                    </label>
                                    <input
                                        type="text"
                                        id="trainNumber"
                                        name="trainNumber"
                                        value={formData.trainNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: TR001"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wagonCount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Vagon Sayısı
                                    </label>
                                    <input
                                        type="number"
                                        id="wagonCount"
                                        name="wagonCount"
                                        value={formData.wagonCount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: 20"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wagonTypes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Vagon Tipleri
                                    </label>
                                    <input
                                        type="text"
                                        id="wagonTypes"
                                        name="wagonTypes"
                                        value={formData.wagonTypes}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                                        placeholder="Örn: Tank Vagonu, Konteyner Vagonu"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline w-4 h-4 mr-1" />
                            Açıklama
                        </label>
                        <textarea
                            id="serviceDescription"
                            name="serviceDescription"
                            value={formData.serviceDescription}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                            placeholder="Nakliye hizmeti detayları, özel özellikler..."
                        />
                    </div>

                    {/* Gerekli Evraklar */}
                    {transportMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Gerekli Evraklar
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                {requiredDocuments[transportMode as keyof typeof requiredDocuments]?.map((doc, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`doc-${index}`}
                                            checked={selectedDocuments.includes(doc)}
                                            onChange={(e) => handleDocumentChange(doc, e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor={`doc-${index}`} className="ml-2 text-sm text-gray-700">
                                            {doc}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dosya Yükleme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Upload className="inline w-4 h-4 mr-1" />
                            Evrak Yükle
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                            onChange={handleFileUpload}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                            title="Evrak dosyalarını seçin"
                            placeholder="Dosya seçin..."
                        />

                        {/* Yüklenen Dosyalar */}
                        {uploadedDocuments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Yüklenen Evraklar:</h4>
                                {uploadedDocuments.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-2">{getFileIcon(doc.type)}</span>
                                            <span className="text-sm font-medium">{doc.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">({doc.size})</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDocumentPreview(doc)}
                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Önizle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDocumentDownload(doc)}
                                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                                title="İndir"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDocumentDelete(doc.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Butonlar */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Güncelleniyor...' : 'Güncelle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransportServiceModal;
