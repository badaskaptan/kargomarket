import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Package, MapPin, Truck, Ship, Plane, Train, ChevronDown, FileText, Upload, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import { storage } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import type { Database } from '../../types/database-types';
import { translateLoadType } from '../../utils/translationUtils';

// Database'den gelen listing tipi
type LoadListing = Database['public']['Tables']['listings']['Row'];

// Document interface tanımı
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

const CreateShipmentRequestSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [transportMode, setTransportMode] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [offerType, setOfferType] = useState('direct');
  const [selectedLoadListing, setSelectedLoadListing] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadListings, setLoadListings] = useState<LoadListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
    file?: File;
    documentType?: string;
  }>>([]);
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
      } catch (error) {
        console.error('❌ Error fetching load listings:', error);
        toast.error('Yük ilanları yüklenirken hata oluştu.');
        setLoadListings([]);
      } finally {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoadListingSelect = (listingId: string) => {
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

  const handleTransportModeChange = (mode: string) => {
    setTransportMode(mode);
    setVehicleType(''); // Araç tipini sıfırla
    setSelectedDocuments([]); // Seçili evrakları sıfırla
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
        } else {
          toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
        }
      });
    }
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
        listing_type: 'shipment_request' as const,
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
      const documentUrls: string[] = [];
      for (const doc of uploadedDocuments) {
        if (doc.file && doc.documentType) {
          try {
            const { data: uploadData, error: uploadError } = await storage.uploadListingDocument(
              listingId,
              doc.file,
              doc.documentType
            );

            if (uploadError) {
              console.error('Document upload error:', uploadError);
              toast.error(`${doc.name} dosyası yüklenirken hata oluştu.`);
              continue;
            }

            if (uploadData) {
              documentUrls.push(uploadData.publicUrl);
              console.log(`✅ Document uploaded: ${doc.name} -> ${uploadData.publicUrl}`);
            }
          } catch (error) {
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

    } catch (error) {
      console.error('Error creating shipment request:', error);
      toast.error('Nakliye talebi oluşturulurken bir hata oluştu.');
    } finally {
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
    return backgrounds[transportMode as keyof typeof backgrounds] || 'bg-white relative overflow-hidden';
  };

  const getTransportIcon = () => {
    const icons = {
      road: Truck,
      sea: Ship,
      air: Plane,
      rail: Train
    };
    const IconComponent = icons[transportMode as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-16 h-16 text-gray-400" /> : null;
  };

  const getTransportBackgroundImage = () => {
    if (!transportMode) return '';

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

    return backgroundImages[transportMode as keyof typeof backgroundImages] || '';
  };

  return (
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
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center">
            <button
              onClick={() => setActiveSection('my-listings')}
              className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full"
              title="Geri"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Nakliye Talebi İlanı Oluştur</h1>
          </div>
          {transportMode && (
            <div className="hidden md:block">
              {getTransportIcon()}
            </div>
          )}
        </div>

        {/* Yük İlanı Seçimi */}
        <div className="mb-8 p-6 bg-white/70 rounded-3xl border border-gray-200 relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="mr-2 text-primary-600" size={20} />
            Hangi Yük İlanı İçin Nakliye Talebi Oluşturuyorsunuz?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loadListingSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Yük İlanı Seçin *
              </label>
              <div className="relative">
                <select
                  id="loadListingSelect"
                  value={selectedLoadListing}
                  onChange={(e) => handleLoadListingSelect(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white shadow-sm"
                  required
                  disabled={loadingListings}
                >
                  <option value="">
                    {loadingListings ? 'Yük ilanları yükleniyor...' : 'Yük ilanı seçiniz...'}
                  </option>
                  {loadListings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.listing_number} - {listing.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
              {loadingListings && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aktif yük ilanları yükleniyor...
                </div>
              )}
              {!loadingListings && loadListings.length === 0 && (
                <div className="mt-2 text-sm text-amber-600">
                  ⚠️ Henüz aktif yük ilanı bulunmuyor.
                </div>
              )}
            </div>
            {selectedLoadListing && (
              <div className="bg-primary-50 p-4 rounded-3xl border border-primary-200">
                <h4 className="font-medium text-primary-900 mb-2">Seçilen İlan Detayları</h4>
                {(() => {
                  const listing = loadListings.find(l => l.id === selectedLoadListing);
                  return listing ? (
                    <div className="text-sm text-primary-800">
                      <p><strong>İlan No:</strong> {listing.listing_number}</p>
                      <p><strong>Başlık:</strong> {listing.title}</p>
                      <p><strong>Güzergah:</strong> {listing.origin} → {listing.destination}</p>
                      <p><strong>Yük Tipi:</strong> {listing.load_type ? translateLoadType(listing.load_type) : 'Belirtilmemiş'}</p>
                      {listing.weight_value && (
                        <p><strong>Ağırlık:</strong> {listing.weight_value} {listing.weight_unit}</p>
                      )}
                      {listing.volume_value && (
                        <p><strong>Hacim:</strong> {listing.volume_value} {listing.volume_unit}</p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nakliye Talebi No */}
            <div>
              <label htmlFor="requestNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye Talebi No
              </label>
              <input
                type="text"
                id="requestNumber"
                name="requestNumber"
                value={formData.requestNumber}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
                readOnly
              />
            </div>

            {/* İlan Başlığı */}
            <div>
              <label htmlFor="requestTitle" className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                id="requestTitle"
                name="requestTitle"
                value={formData.requestTitle}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Nakliye Talebi"
              />
            </div>

            {/* Yük Tipi */}
            <div>
              <label htmlFor="requestLoadType" className="block text-sm font-medium text-gray-700 mb-2">
                Yük Tipi *
              </label>
              <select
                id="requestLoadType"
                name="requestLoadType"
                value={formData.requestLoadType}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              >
                <option value="">Seçiniz</option>
                <optgroup label="Genel Kargo / Paletli Ürünler">
                  <option value="box_package">Koli / Paket</option>
                  <option value="pallet_standard">Paletli Yükler - Standart Palet</option>
                  <option value="pallet_euro">Paletli Yükler - Euro Palet</option>
                  <option value="pallet_industrial">Paletli Yükler - Endüstriyel Palet</option>
                  <option value="sack_bigbag">Çuval / Bigbag (Dökme Olmayan)</option>
                  <option value="barrel_drum">Varil / Fıçı</option>
                  <option value="appliances_electronics">Beyaz Eşya / Elektronik</option>
                  <option value="furniture_decor">Mobilya / Dekorasyon Ürünleri</option>
                  <option value="textile_products">Tekstil Ürünleri</option>
                  <option value="automotive_parts">Otomotiv Parçaları / Yedek Parça</option>
                  <option value="machinery_parts">Makine / Ekipman Parçaları (Büyük Olmayan)</option>
                  <option value="construction_materials">İnşaat Malzemeleri (Torbalı Çimento, Demir Bağlar vb.)</option>
                  <option value="packaged_food">Ambalajlı Gıda Ürünleri (Kuru Gıda, Konserve vb.)</option>
                  <option value="consumer_goods">Tüketim Ürünleri (Market Ürünleri)</option>
                  <option value="ecommerce_cargo">E-ticaret Kargo</option>
                  <option value="other_general">Diğer Genel Kargo</option>
                </optgroup>
                <optgroup label="Dökme Yükler">
                  <option value="grain">Tahıl (Buğday, Mısır, Arpa, Pirinç vb.)</option>
                  <option value="ore">Maden Cevheri (Demir, Bakır, Boksit vb.)</option>
                  <option value="coal">Kömür</option>
                  <option value="cement_bulk">Çimento (Dökme)</option>
                  <option value="sand_gravel">Kum / Çakıl</option>
                  <option value="fertilizer_bulk">Gübre (Dökme)</option>
                  <option value="soil_excavation">Toprak / Hafriyat</option>
                  <option value="scrap_metal">Hurda Metal</option>
                  <option value="other_bulk">Diğer Dökme Yükler</option>
                </optgroup>
                <optgroup label="Sıvı Yükler (Dökme Sıvı)">
                  <option value="crude_oil">Ham Petrol / Petrol Ürünleri</option>
                  <option value="chemical_liquids">Kimyasal Sıvılar (Asit, Baz, Solvent vb.)</option>
                  <option value="vegetable_oils">Bitkisel Yağlar (Ayçiçek Yağı, Zeytinyağı vb.)</option>
                  <option value="fuel">Yakıt (Dizel, Benzin vb.)</option>
                  <option value="lpg_lng">LPG / LNG (Sıvılaştırılmış Gazlar)</option>
                  <option value="water">Su (İçme Suyu, Endüstriyel Su)</option>
                  <option value="milk_dairy">Süt / Süt Ürünleri (Dökme)</option>
                  <option value="wine_concentrate">Şarap / İçecek Konsantresi</option>
                  <option value="other_liquid">Diğer Sıvı Yükler</option>
                </optgroup>
                <optgroup label="Ağır Yük / Gabari Dışı Yük">
                  <option value="tbm">Tünel Açma Makinesi (TBM)</option>
                  <option value="transformer_generator">Trafo / Jeneratör</option>
                  <option value="heavy_machinery">Büyük İş Makineleri (Ekskavatör, Vinç vb.)</option>
                  <option value="boat_yacht">Tekne / Yat</option>
                  <option value="industrial_parts">Büyük Endüstriyel Parçalar</option>
                  <option value="prefab_elements">Prefabrik Yapı Elemanları</option>
                  <option value="wind_turbine">Rüzgar Türbini Kanatları / Kuleleri</option>
                  <option value="other_oversized">Diğer Gabari Dışı Yükler</option>
                </optgroup>
                <optgroup label="Hassas / Kırılabilir Kargo">
                  <option value="art_antiques">Sanat Eserleri / Antikalar</option>
                  <option value="glass_ceramic">Cam / Seramik Ürünler</option>
                  <option value="electronic_devices">Elektronik Cihaz</option>
                  <option value="medical_devices">Tıbbi Cihazlar</option>
                  <option value="lab_equipment">Laboratuvar Ekipmanları</option>
                  <option value="flowers_plants">Çiçek / Canlı Bitki</option>
                  <option value="other_sensitive">Diğer Hassas Kargo</option>
                </optgroup>
                <optgroup label="Tehlikeli Madde (ADR / IMDG / IATA Sınıflandırması)">
                  <option value="dangerous_class1">Patlayıcılar (Sınıf 1)</option>
                  <option value="dangerous_class2">Gazlar (Sınıf 2)</option>
                  <option value="dangerous_class3">Yanıcı Sıvılar (Sınıf 3)</option>
                  <option value="dangerous_class4">Yanıcı Katılar (Sınıf 4)</option>
                  <option value="dangerous_class5">Oksitleyici Maddeler (Sınıf 5)</option>
                  <option value="dangerous_class6">Zehirli ve Bulaşıcı Maddeler (Sınıf 6)</option>
                  <option value="dangerous_class7">Radyoaktif Maddeler (Sınıf 7)</option>
                  <option value="dangerous_class8">Aşındırıcı Maddeler (Sınıf 8)</option>
                  <option value="dangerous_class9">Diğer Tehlikeli Maddeler (Sınıf 9)</option>
                </optgroup>
                <optgroup label="Soğuk Zincir / Isı Kontrollü Yük">
                  <option value="frozen_food">Donmuş Gıda</option>
                  <option value="fresh_produce">Taze Meyve / Sebze</option>
                  <option value="meat_dairy">Et / Süt Ürünleri</option>
                  <option value="pharma_vaccine">İlaç / Aşı</option>
                  <option value="chemical_temp">Kimyasal Maddeler (Isı Kontrollü)</option>
                  <option value="other_cold_chain">Diğer Soğuk Zincir Kargo</option>
                </optgroup>
                <optgroup label="Canlı Hayvan">
                  <option value="small_livestock">Küçük Baş Hayvan (Koyun, Keçi vb.)</option>
                  <option value="large_livestock">Büyük Baş Hayvan (Sığır, At vb.)</option>
                  <option value="poultry">Kanatlı Hayvan</option>
                  <option value="pets">Evcil Hayvan</option>
                  <option value="other_livestock">Diğer Canlı Hayvanlar</option>
                </optgroup>
                <optgroup label="Proje Yükleri">
                  <option value="factory_setup">Fabrika Kurulumu</option>
                  <option value="power_plant">Enerji Santrali Ekipmanları</option>
                  <option value="infrastructure">Altyapı Proje Malzemeleri</option>
                  <option value="other_project">Diğer Proje Yükleri</option>
                </optgroup>
              </select>
            </div>

            {/* Taşıma Modu */}
            <div>
              <label htmlFor="transportationModeRequest" className="block text-sm font-medium text-gray-700 mb-2">
                Taşıma Modu *
              </label>
              <select
                id="transportationModeRequest"
                name="transportationModeRequest"
                value={transportMode}
                onChange={(e) => handleTransportModeChange(e.target.value)}
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

            {/* Araç Tipi - Taşıma modu seçildikten sonra gösterilir */}
            {transportMode && (
              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Tipi *
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
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

            {/* Kalkış Noktası - Artık opsiyonel */}
            <div>
              <label htmlFor="requestOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Kalkış Noktası (Opsiyonel)
              </label>
              <input
                type="text"
                id="requestOrigin"
                name="requestOrigin"
                value={formData.requestOrigin}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: İstanbul, Türkiye"
              />
            </div>

            {/* Varış Noktası - Artık opsiyonel */}
            <div>
              <label htmlFor="requestDestination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Varış Noktası (Opsiyonel)
              </label>
              <input
                type="text"
                id="requestDestination"
                name="requestDestination"
                value={formData.requestDestination}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: Ankara, Türkiye"
              />
            </div>

            {/* Yükleme Tarihi */}
            <div>
              <label htmlFor="requestLoadingDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Yükleme Tarihi
              </label>
              <input
                type="date"
                id="requestLoadingDate"
                name="requestLoadingDate"
                value={formData.requestLoadingDate}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              />
            </div>

            {/* Teslimat Tarihi */}
            <div>
              <label htmlFor="requestDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Teslimat Tarihi
              </label>
              <input
                type="date"
                id="requestDeliveryDate"
                name="requestDeliveryDate"
                value={formData.requestDeliveryDate}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              />
            </div>

            {/* Ağırlık */}
            <div>
              <label htmlFor="requestWeight" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Ağırlık (ton) *
              </label>
              <input
                type="number"
                id="requestWeight"
                name="requestWeight"
                value={formData.requestWeight}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: 10.5"
              />
            </div>

            {/* Hacim */}
            <div>
              <label htmlFor="requestVolume" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Hacim (m³) *
              </label>
              <input
                type="number"
                id="requestVolume"
                name="requestVolume"
                value={formData.requestVolume}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: 25.0"
              />
            </div>

            {/* Teklif Alma Şekli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Teklif Alma Şekli</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="requestOfferTypeDirect"
                    name="requestOfferType"
                    value="direct"
                    checked={offerType === 'direct'}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="requestOfferTypeDirect" className="ml-2 text-sm text-gray-700">
                    Doğrudan Teklif
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="requestOfferTypePrice"
                    name="requestOfferType"
                    value="price"
                    checked={offerType === 'price'}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="requestOfferTypePrice" className="ml-2 text-sm text-gray-700">
                    Fiyat Belirleyerek
                  </label>
                </div>
              </div>
            </div>

            {/* Belirlenen Fiyat */}
            {offerType === 'price' && (
              <div>
                <label htmlFor="requestSetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Belirlenen Fiyat (TL) *
                </label>
                <input
                  type="number"
                  id="requestSetPrice"
                  name="requestSetPrice"
                  value={formData.requestSetPrice}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: 5000"
                />
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="requestDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="requestDescription"
              name="requestDescription"
              value={formData.requestDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              required
              placeholder="Nakliye talebiniz hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Gerekli Evraklar - Taşıma modu seçildikten sonra gösterilir */}
          {transportMode && (
            <div className="bg-white/50 rounded-3xl p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-primary-600" size={20} />
                Gerekli Evraklar ({transportMode === 'road' ? 'Karayolu' : transportMode === 'sea' ? 'Denizyolu' : transportMode === 'air' ? 'Havayolu' : 'Demiryolu'})
              </h4>
              {/* Denizyolu için grup yapısı */}
              {transportMode === 'sea' ? (
                <>
                  {(requiredDocuments.sea as { group: string; documents: string[] }[]).map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                      <div className="font-semibold text-primary-700 mb-2">{group.group}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.documents.map((document, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`sea_doc_${groupIdx}_${idx}`}
                              checked={selectedDocuments.includes(document)}
                              onChange={(e) => handleDocumentChange(document, e.target.checked)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(requiredDocuments[transportMode as keyof typeof requiredDocuments] as string[]).map((document, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doc_${index}`}
                        checked={selectedDocuments.includes(document)}
                        onChange={(e) => handleDocumentChange(document, e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`doc_${index}`} className="ml-3 text-sm text-gray-700">
                        {document}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedDocuments.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-3xl border border-primary-200">
                  <p className="text-sm text-primary-800">
                    <strong>Seçilen Evraklar ({selectedDocuments.length}):</strong> {selectedDocuments.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Evrak Yükleme Alanı */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="mr-2 text-primary-600" size={20} />
              Evrak Yükleme & Dosya Ekleme
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

      {/* Toast Notifikasyonları */}
      <Toaster position="top-right" />
    </div>
  );
};

export default CreateShipmentRequestSection;