import React, { useState } from 'react';
import Modal from '../common/Modal'; // Modal component
import { ArrowLeft, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2, Loader2, MapPin, Package, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database-types';
import { translateVehicleType } from '../../utils/translationUtils';

type TransportService = Database['public']['Tables']['transport_services']['Row'];
type TransportServiceInsert = Database['public']['Tables']['transport_services']['Insert'];

// Utility functions
const generateServiceNumber = (): string => {
  const prefix = 'TS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const validateIMO = (imo: string): boolean => {
  if (!imo) return false;
  const imoRegex = /^\d{7}$/;
  return imoRegex.test(imo.trim());
};

const validateMMSI = (mmsi: string): boolean => {
  if (!mmsi) return false;
  const mmsiRegex = /^\d{9}$/;
  return mmsiRegex.test(mmsi.trim());
};

// Transport Service API class
class TransportServiceService {
  static async createTransportService(serviceData: TransportServiceInsert): Promise<TransportService> {
    console.log('🚀 Creating new transport service:', serviceData);

    const { data, error } = await supabase
      .from('transport_services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error('❌ Transport service creation failed:', error);
      throw new Error(`Transport service creation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from transport service creation');
    }

    console.log('✅ Transport service created successfully:', data);
    return data;
  }
}

// Form data tipi (UI için)
interface TransportServiceFormData {
  [key: string]: string | number | boolean | string[] | null | undefined;
}


// Document interface tanımı
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

const CreateTransportServiceSection: React.FC = () => {
  // İlan detayı modalı için state
  const [detailOpen, setDetailOpen] = useState(false);
  const [lastCreatedService, setLastCreatedService] = useState<TransportService | null>(null);
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [transportMode, setTransportMode] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test için global erişim (development only)
  if (import.meta.env.DEV) {
    (globalThis as unknown as { testTransportForm: () => void }).testTransportForm = () => {
      console.log('🧪 Test form data:', formData);
      console.log('👤 Current user:', user);
      console.log('🚚 Transport mode:', transportMode);
    };
  }

  // Inline uploadFile function to avoid import issues
  const uploadFile = async (file: File, bucket: string = 'documents', folder?: string): Promise<string> => {
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
  const [formData, setFormData] = useState<TransportServiceFormData>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setUploadedDocuments(prev =>
              prev.map(doc =>
                doc.id === tempDocument.id
                  ? { ...doc, url: fileUrl }
                  : doc
              )
            );

            toast.success(`${file.name} başarıyla yüklendi.`);
          } catch (error) {
            console.error('File upload error:', error);
            toast.error(`${file.name} yüklenirken hata oluştu.`);

            // Hatalı dosyayı listeden kaldır
            setUploadedDocuments(prev =>
              prev.filter(doc => doc.id !== tempDocument.id)
            );
          }
        } else {
          toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
        }
      });
    } else if (!user) {
      toast.error('Dosya yüklemek için giriş yapmanız gerekiyor.');
    }
  };

  const handleDocumentSelect = (document: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(document)) {
        return prev.filter(doc => doc !== document);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleDocumentDelete = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleDocumentPreview = (doc: Document) => {
    window.open(doc.url, '_blank');
  };

  const handleDocumentDownload = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.click();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // origin, destination, available_from_date, available_until_date artık opsiyonel
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

      if (!validateIMO(String(formData.imoNumber || ''))) {
        toast.error('IMO numarası geçersiz! (Örn: IMO 1234567)');
        return;
      }

      if (!validateMMSI(String(formData.mmsiNumber || ''))) {
        toast.error('MMSI numarası geçersiz! (9 haneli sayı olmalı)');
        return;
      }

      // Tarih validasyonu
      if (formData.serviceAvailableDate && formData.serviceAvailableUntilDate) {
        const startDate = new Date(String(formData.serviceAvailableDate || ''));
        const endDate = new Date(String(formData.serviceAvailableUntilDate || ''));
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
        service_number: String(formData.serviceNumber || ''),
        title: String(formData.serviceTitle || ''),
        description: String(formData.serviceDescription || ''),
        transport_mode: formData.serviceTransportMode as 'road' | 'sea' | 'air' | 'rail',
        vehicle_type: String(formData.serviceVehicleType || ''),
        origin: String(formData.serviceOrigin || ''),
        destination: String(formData.serviceDestination || ''),
        available_from_date: String(formData.serviceAvailableDate || ''),
        available_until_date: String(formData.serviceAvailableUntilDate || ''),
        capacity_value: formData.serviceCapacity ? parseFloat(String(formData.serviceCapacity)) : undefined,
        capacity_unit: 'kg',
        contact_info: String(formData.serviceContact || ''),
        company_name: String(formData.serviceCompanyName || ''),
        status: 'active' as const,

        // Karayolu alanları
        plate_number: formData.serviceTransportMode === 'road' ? String(formData.plateNumber || '') : undefined,

        // Denizyolu alanları
        ship_name: formData.serviceTransportMode === 'sea' ? String(formData.shipName || '') : undefined,
        imo_number: formData.serviceTransportMode === 'sea' ? String(formData.imoNumber || '') : undefined,
        mmsi_number: formData.serviceTransportMode === 'sea' ? String(formData.mmsiNumber || '') : undefined,
        dwt: formData.serviceTransportMode === 'sea' && formData.dwt ? parseFloat(String(formData.dwt)) : undefined,
        gross_tonnage: formData.serviceTransportMode === 'sea' && formData.grossTonnage ? parseFloat(String(formData.grossTonnage)) : undefined,
        net_tonnage: formData.serviceTransportMode === 'sea' && formData.netTonnage ? parseFloat(String(formData.netTonnage)) : undefined,
        ship_dimensions: formData.serviceTransportMode === 'sea' ? String(formData.shipDimensions || '') : undefined,
        freight_type: formData.serviceTransportMode === 'sea' ? String(formData.freightType || '') : undefined,
        charterer_info: formData.serviceTransportMode === 'sea' ? String(formData.chartererInfo || '') : undefined,
        ship_flag: formData.serviceTransportMode === 'sea' ? String(formData.shipFlag || '') : undefined,
        home_port: formData.serviceTransportMode === 'sea' ? String(formData.homePort || '') : undefined,
        year_built: formData.serviceTransportMode === 'sea' && formData.yearBuilt ? parseInt(String(formData.yearBuilt)) : undefined,
        speed_knots: formData.serviceTransportMode === 'sea' && formData.speedKnots ? parseFloat(String(formData.speedKnots)) : undefined,
        fuel_consumption: formData.serviceTransportMode === 'sea' ? String(formData.fuelConsumption || '') : undefined,
        ballast_capacity: formData.serviceTransportMode === 'sea' && formData.ballastCapacity ? parseFloat(String(formData.ballastCapacity)) : undefined,

        // Havayolu alanları
        flight_number: formData.serviceTransportMode === 'air' ? String(formData.flightNumber || '') : undefined,
        aircraft_type: formData.serviceTransportMode === 'air' ? String(formData.aircraftType || '') : undefined,
        max_payload: formData.serviceTransportMode === 'air' && formData.maxPayload ? parseFloat(String(formData.maxPayload)) : undefined,
        cargo_volume: formData.serviceTransportMode === 'air' && formData.cargoVolume ? parseFloat(String(formData.cargoVolume)) : undefined,

        // Demiryolu alanları
        train_number: formData.serviceTransportMode === 'rail' ? String(formData.trainNumber || '') : undefined,
        wagon_count: formData.serviceTransportMode === 'rail' && formData.wagonCount ? parseInt(String(formData.wagonCount)) : undefined,
        wagon_types: formData.serviceTransportMode === 'rail' && formData.wagonTypes ? String(formData.wagonTypes).split(',').map(t => t.trim()) : undefined,

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

    } catch (error) {
      console.error('❌ Error creating transport service:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error('Nakliye hizmeti oluşturulurken bir hata oluştu.');
    } finally {
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
        return <Truck className="w-12 h-12 text-yellow-500" />;
      case 'sea':
        return <Ship className="w-12 h-12 text-blue-500" />;
      case 'air':
        return <Plane className="w-12 h-12 text-cyan-500" />;
      case 'rail':
        return <Train className="w-12 h-12 text-gray-500" />;
      default:
        return null;
    }
  }

  // Dinamik placeholderlar
  function getDynamicPlaceholders() {
    const mode = formData.serviceTransportMode;
    return {
      origin:
        mode === 'sea' ? 'Örn: İstanbul Limanı'
          : mode === 'air' ? 'Örn: İstanbul Havalimanı'
            : mode === 'rail' ? 'Örn: Halkalı İstasyonu'
              : 'Örn: İstanbul',
      destination:
        mode === 'sea' ? 'Örn: İzmir Limanı'
          : mode === 'air' ? 'Örn: Ankara Esenboğa'
            : mode === 'rail' ? 'Örn: Ankara Garı'
              : 'Örn: Ankara',
      capacity:
        mode === 'air' ? 'Örn: 5000 kg'
          : mode === 'sea' ? 'Örn: 25000 GT'
            : 'Örn: 20 ton'
    };
  }
  // ...existing code...

  return (
    <>
      {/* İlan Detay Modalı */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Oluşturulan Nakliye Hizmeti Detayı"
      >
        {lastCreatedService && (
          <div className="max-h-[70vh] overflow-auto">
            <div className="space-y-4">
              <div><strong>Servis No:</strong> {lastCreatedService.service_number}</div>
              <div><strong>Başlık:</strong> {lastCreatedService.title}</div>
              <div><strong>Taşıma Modu:</strong> {lastCreatedService.transport_mode}</div>
              <div><strong>Araç Tipi:</strong> {translateVehicleType(lastCreatedService.vehicle_type || '')}</div>
              <div><strong>Kalkış:</strong> {lastCreatedService.origin}</div>
              <div><strong>Varış:</strong> {lastCreatedService.destination}</div>
              {lastCreatedService.transport_mode === 'sea' && (
                <>
                  <div><strong>Gemi Adı:</strong> {lastCreatedService.ship_name}</div>
                  <div><strong>IMO:</strong> {lastCreatedService.imo_number}</div>
                  <div><strong>MMSI:</strong> {lastCreatedService.mmsi_number}</div>
                  <div><strong>DWT:</strong> {lastCreatedService.dwt}</div>
                </>
              )}
              <div><strong>Açıklama:</strong> {lastCreatedService.description}</div>
            </div>
          </div>
        )}
      </Modal>
      <div className="space-y-6 animate-fade-in">
        <div className={`rounded-3xl shadow-lg p-6 transition-all duration-300 ${getTransportBackground()}`}>
          {/* Background Image */}
          {transportMode && (
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              dangerouslySetInnerHTML={{ __html: getTransportBackgroundImage() }}
            />
          )}

          {/* Header */}
          <div className="flex items-center mb-8 relative z-10">
            <button
              onClick={() => setActiveSection('my-listings')}
              className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full"
              title="Geri"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Nakliye İlanı Oluştur</h1>
            {transportMode && (
              <div className="ml-auto hidden md:block">
                {getTransportIcon()}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nakliye İlanı No */}
              <div>
                <label htmlFor="serviceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Nakliye İlanı No
                </label>
                <input
                  type="text"
                  id="serviceNumber"
                  name="serviceNumber"
                  value={String(formData.serviceNumber || '')}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
                  readOnly
                />
              </div>

              {/* İlan Başlığı */}
              <div>
                <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı *
                </label>
                <input
                  type="text"
                  id="serviceTitle"
                  name="serviceTitle"
                  value={String(formData.serviceTitle || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: İstanbul-Ankara Güzergahı Nakliye Hizmeti"
                />
              </div>

              {/* Taşıma Modu */}
              <div>
                <label htmlFor="serviceTransportMode" className="block text-sm font-medium text-gray-700 mb-2">
                  Taşıma Modu *
                </label>
                <select
                  id="serviceTransportMode"
                  name="serviceTransportMode"
                  value={String(formData.serviceTransportMode || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="road">🚛 Karayolu</option>
                  <option value="sea">🚢 Denizyolu</option>
                  <option value="air">✈️ Havayolu</option>
                  <option value="rail">🚂 Demiryolu</option>
                </select>
              </div>

              {/* Kalkış Bölgesi */}
              <div>
                <label htmlFor="serviceOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {getDynamicFieldLabels().origin} (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="serviceOrigin"
                  name="serviceOrigin"
                  value={String(formData.serviceOrigin || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  // required
                  placeholder={getDynamicPlaceholders().origin}
                />
              </div>

              {/* Varış Bölgesi */}
              <div>
                <label htmlFor="serviceDestination" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {getDynamicFieldLabels().destination} (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="serviceDestination"
                  name="serviceDestination"
                  value={String(formData.serviceDestination || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  // required
                  placeholder={getDynamicPlaceholders().destination}
                />
              </div>

              {/* Araç Tipi - Taşıma modu seçildikten sonra gösterilir */}
              {transportMode && (
                <div>
                  <label htmlFor="serviceVehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="inline w-4 h-4 mr-1" />
                    Araç Tipi *
                  </label>
                  <select
                    id="serviceVehicleType"
                    name="serviceVehicleType"
                    value={String(formData.serviceVehicleType || '')}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                  >
                    <option value="">Araç tipi seçiniz...</option>
                    {vehicleTypes[transportMode as keyof typeof vehicleTypes]?.map((group, groupIndex) => (
                      <optgroup key={groupIndex} label={group.group}>
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

              {/* Boşta Olma Tarihi */}
              <div>
                <label htmlFor="serviceAvailableDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  {getDynamicFieldLabels().availableDate} (Opsiyonel)
                </label>
                <input
                  type="date"
                  id="serviceAvailableDate"
                  name="serviceAvailableDate"
                  value={String(formData.serviceAvailableDate || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  // required
                />
              </div>

              {/* Laycan End (Sadece Denizyolu) - KALDIRILDI: Artık müsaitlik için laycan kullanmıyoruz */}

              {/* Müsaitlik Bitiş Tarihi (Tüm modlar için) */}
              {formData.serviceTransportMode && (
                <div>
                  <label htmlFor="serviceAvailableUntilDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Müsaitlik Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    id="serviceAvailableUntilDate"
                    name="serviceAvailableUntilDate"
                    value={String(formData.serviceAvailableUntilDate || '')}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  />
                </div>
              )}

              {/* Kapasite */}
              <div>
                <label htmlFor="serviceCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  {getDynamicFieldLabels().capacity} *
                </label>
                <input
                  type="number"
                  id="serviceCapacity"
                  name="serviceCapacity"
                  value={String(formData.serviceCapacity || '')}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder={getDynamicPlaceholders().capacity}
                />
              </div>

              {/* Firma Adı */}
              <div>
                <label htmlFor="serviceCompanyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="serviceCompanyName"
                  name="serviceCompanyName"
                  value={String(formData.serviceCompanyName || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: ABC Lojistik A.Ş."
                />
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <label htmlFor="serviceContact" className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Bilgileri (E-posta/Telefon) *
                </label>
                <input
                  type="text"
                  id="serviceContact"
                  name="serviceContact"
                  value={String(formData.serviceContact || '')}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: info@abclojistik.com veya +90 555 123 4567"
                />
              </div>

              {/* ============ TAŞIMA MODUNA GÖRE EK ALANLAR ============ */}

              {/* 🚛 Karayolu Ek Alanları */}
              {formData.serviceTransportMode === 'road' && (
                <div>
                  <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    🚛 Plaka / Şasi Numarası
                  </label>
                  <input
                    type="text"
                    id="plateNumber"
                    name="plateNumber"
                    value={String(formData.plateNumber || '')}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    placeholder="Örn: 34 ABC 123 veya WJMM62AUZ7C123456"
                  />
                </div>
              )}

              {/* 🚢 Denizyolu Ek Alanları */}
              {formData.serviceTransportMode === 'sea' && (
                <>
                  <div>
                    <label htmlFor="shipName" className="block text-sm font-medium text-gray-700 mb-2">
                      🚢 Gemi Adı *
                    </label>
                    <input
                      type="text"
                      id="shipName"
                      name="shipName"
                      value={String(formData.shipName || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      required
                      placeholder="Örn: MV KARGO EXPRESS"
                    />
                  </div>
                  <div>
                    <label htmlFor="imoNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      🆔 IMO No *
                    </label>
                    <input
                      type="text"
                      id="imoNumber"
                      name="imoNumber"
                      value={String(formData.imoNumber || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      required
                      placeholder="Örn: IMO 1234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="mmsiNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      📡 MMSI No *
                    </label>
                    <input
                      type="text"
                      id="mmsiNumber"
                      name="mmsiNumber"
                      value={String(formData.mmsiNumber || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      required
                      placeholder="Örn: 271234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="shipDimensions" className="block text-sm font-medium text-gray-700 mb-2">
                      📏 Boyutlar (LOA, Beam) *
                    </label>
                    <input
                      type="text"
                      id="shipDimensions"
                      name="shipDimensions"
                      value={String(formData.shipDimensions || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      required
                      placeholder="Örn: LOA: 180m, Beam: 28m"
                    />
                  </div>
                  <div>
                    <label htmlFor="freightType" className="block text-sm font-medium text-gray-700 mb-2">
                      💰 Navlun Tipi *
                    </label>
                    <input
                      type="text"
                      id="freightType"
                      name="freightType"
                      value={String(formData.freightType || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      required
                      placeholder="Örn: Lump sum, USD/ton, Time charter"
                    />
                  </div>
                  <div>
                    <label htmlFor="chartererInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      🏢 Charterer / Broker Bilgisi
                    </label>
                    <input
                      type="text"
                      id="chartererInfo"
                      name="chartererInfo"
                      value={String(formData.chartererInfo || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: ABC Shipping & Brokerage"
                    />
                  </div>

                  {/* Ek denizyolu alanları */}
                  <div>
                    <label htmlFor="grossTonnage" className="block text-sm font-medium text-gray-700 mb-2">
                      📊 Gross Tonnage (GT)
                    </label>
                    <input
                      type="text"
                      id="grossTonnage"
                      name="grossTonnage"
                      value={String(formData.grossTonnage || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 15000 GT"
                    />
                  </div>
                  <div>
                    <label htmlFor="netTonnage" className="block text-sm font-medium text-gray-700 mb-2">
                      📊 Net Tonnage (NT)
                    </label>
                    <input
                      type="text"
                      id="netTonnage"
                      name="netTonnage"
                      value={String(formData.netTonnage || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 8000 NT"
                    />
                  </div>
                  <div>
                    <label htmlFor="shipFlag" className="block text-sm font-medium text-gray-700 mb-2">
                      🏴 Bayrak Devleti
                    </label>
                    <input
                      type="text"
                      id="shipFlag"
                      name="shipFlag"
                      value={String(formData.shipFlag || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: Turkey, Malta, Panama"
                    />
                  </div>
                  <div>
                    <label htmlFor="homePort" className="block text-sm font-medium text-gray-700 mb-2">
                      🏠 Bağlama Limanı
                    </label>
                    <input
                      type="text"
                      id="homePort"
                      name="homePort"
                      value={String(formData.homePort || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: İstanbul"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-2">
                      🔨 İnşa Yılı
                    </label>
                    <input
                      type="text"
                      id="yearBuilt"
                      name="yearBuilt"
                      value={String(formData.yearBuilt || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 2018"
                    />
                  </div>
                  <div>
                    <label htmlFor="speedKnots" className="block text-sm font-medium text-gray-700 mb-2">
                      ⚡ Hız (Knot)
                    </label>
                    <input
                      type="text"
                      id="speedKnots"
                      name="speedKnots"
                      value={String(formData.speedKnots || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 14.5 knot"
                    />
                  </div>
                  <div>
                    <label htmlFor="fuelConsumption" className="block text-sm font-medium text-gray-700 mb-2">
                      ⛽ Yakıt Tüketimi
                    </label>
                    <input
                      type="text"
                      id="fuelConsumption"
                      name="fuelConsumption"
                      value={String(formData.fuelConsumption || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 25 MT/day"
                    />
                  </div>
                  <div>
                    <label htmlFor="ballastCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                      🌊 Balast Kapasitesi
                    </label>
                    <input
                      type="text"
                      id="ballastCapacity"
                      name="ballastCapacity"
                      value={String(formData.ballastCapacity || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 8000 MT"
                    />
                  </div>
                </>
              )}

              {/* ✈️ Havayolu Ek Alanları */}
              {formData.serviceTransportMode === 'air' && (
                <>
                  <div>
                    <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      ✈️ Uçuş Numarası
                    </label>
                    <input
                      type="text"
                      id="flightNumber"
                      name="flightNumber"
                      value={String(formData.flightNumber || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: TK123 veya CRG456"
                    />
                  </div>
                  <div>
                    <label htmlFor="aircraftType" className="block text-sm font-medium text-gray-700 mb-2">
                      ✈️ Uçak Tipi
                    </label>
                    <input
                      type="text"
                      id="aircraftType"
                      name="aircraftType"
                      value={String(formData.aircraftType || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: Boeing 747F, Airbus A330F"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPayload" className="block text-sm font-medium text-gray-700 mb-2">
                      📦 Maksimum Payload (kg)
                    </label>
                    <input
                      type="text"
                      id="maxPayload"
                      name="maxPayload"
                      value={String(formData.maxPayload || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 134000"
                    />
                  </div>
                  <div>
                    <label htmlFor="cargoVolume" className="block text-sm font-medium text-gray-700 mb-2">
                      📏 Kargo Hacmi (m³)
                    </label>
                    <input
                      type="text"
                      id="cargoVolume"
                      name="cargoVolume"
                      value={String(formData.cargoVolume || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 858"
                    />
                  </div>
                </>
              )}

              {/* 🚂 Demiryolu Ek Alanları */}
              {formData.serviceTransportMode === 'rail' && (
                <>
                  <div>
                    <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      🚂 Tren/Kompozisyon No
                    </label>
                    <input
                      type="text"
                      id="trainNumber"
                      name="trainNumber"
                      value={String(formData.trainNumber || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: TR-12345 veya K-KARGO-67"
                    />
                  </div>
                  <div>
                    <label htmlFor="wagonCount" className="block text-sm font-medium text-gray-700 mb-2">
                      🚃 Vagon Sayısı
                    </label>
                    <input
                      type="text"
                      id="wagonCount"
                      name="wagonCount"
                      value={String(formData.wagonCount || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: 25"
                    />
                  </div>
                  <div>
                    <label htmlFor="wagonTypes" className="block text-sm font-medium text-gray-700 mb-2">
                      🚃 Vagon Tipleri (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      id="wagonTypes"
                      name="wagonTypes"
                      value={String(formData.wagonTypes || '')}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="Örn: Açık Yük Vagonu, Kapalı Yük Vagonu"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                value={String(formData.serviceDescription || '')}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Nakliye hizmetiniz hakkında detaylı bilgi verin..."
              />
            </div>

            {/* Dynamic Document List */}
            {formData.serviceTransportMode && (
              <div className="bg-white/50 rounded-3xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 text-primary-600" size={20} />
                  📋 Gerekli Evraklar ({formData.serviceTransportMode === 'road' ? 'Karayolu' : formData.serviceTransportMode === 'sea' ? 'Denizyolu' : formData.serviceTransportMode === 'air' ? 'Havayolu' : 'Demiryolu'})
                </h4>
                {formData.serviceTransportMode === 'sea' ? (
                  <>
                    {[
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
                    ].map((group, groupIdx) => (
                      <div key={groupIdx} className="mb-6">
                        <div className="font-semibold text-primary-700 mb-2">{group.group}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.documents.map((document, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`sea_doc_${groupIdx}_${idx}`}
                                checked={selectedDocuments.includes(document)}
                                onChange={() => handleDocumentSelect(document)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <label htmlFor={`sea_doc_${groupIdx}_${idx}`} className="ml-3 text-sm text-gray-700">
                                {document}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiredDocuments[formData.serviceTransportMode as keyof typeof requiredDocuments]?.map((document, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`document-${index}`}
                          checked={selectedDocuments.includes(document)}
                          onChange={() => handleDocumentSelect(document)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={`document-${index}`} className="ml-2 text-sm text-gray-700">
                          📄 {document}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedDocuments.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Seçilen Evraklar ({selectedDocuments.length})
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      {selectedDocuments.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Evrak Yükleme Alanı */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-primary-600" size={20} />
                Evrak Yükleme Alanı
              </h3>

              {/* Dosya Yükleme Alanı */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    id="documentUpload"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="documentUpload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Evrakları buraya sürükleyin veya tıklayın</p>
                    <p className="text-sm text-gray-500">
                      Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Maksimum dosya boyutu: 10MB</p>
                  </label>
                </div>
              </div>

              {/* Yüklenen Dosyalar Listesi */}
              {uploadedDocuments.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Yüklenen Evraklar ({uploadedDocuments.length})</h4>
                  <div className="space-y-3">
                    {uploadedDocuments.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200">
                        <div className="flex items-center flex-1">
                          <span className="text-2xl mr-3">{getFileIcon(document.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 truncate">{document.name}</p>
                            <p className="text-sm text-gray-500">{document.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            type="button"
                            onClick={() => handleDocumentPreview(document)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="Önizleme"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocumentDownload(document)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                            title="İndir"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocumentDelete(document.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveSection('my-listings')}
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {isSubmitting ? 'Oluşturuluyor...' : 'İlanı Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTransportServiceSection;
