import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, Package, MapPin, Truck, Ship, Plane, Train, ChevronDown, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import { FileUploadService } from '../../services/fileUploadService';
import type { UploadedFile } from '../../services/fileUploadService';
import type { ExtendedListing } from '../../types/database-types';
import toast from 'react-hot-toast';

interface CreateShipmentRequestSectionProps {
  editMode?: boolean;
  shipmentRequestId?: string;
}

const CreateShipmentRequestSection: React.FC<CreateShipmentRequestSectionProps> = ({ 
  editMode = false, 
  shipmentRequestId 
}) => {
  const { setActiveSection, setEditingShipmentRequestId } = useDashboard();
  const { user } = useAuth();
  const [transportMode, setTransportMode] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [offerType, setOfferType] = useState('direct');
  const [selectedLoadListing, setSelectedLoadListing] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);
  const [storageReady, setStorageReady] = useState<boolean>(true); // Her zaman true - direkt aktif
  const [loadListings, setLoadListings] = useState<Array<{
    id: string;
    listing_number?: string;
    title: string;
    route: string;
    loadType: string;
    origin: string;
    destination: string;
  }>>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingFilter, setListingFilter] = useState<'my' | 'offered' | 'all'>('my'); // Yeni filtre state'i
  const [formData, setFormData] = useState({
    requestNumber: `NT${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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

  const fetchLoadListings = useCallback(async () => {
    if (!user) return; // Kullanıcı giriş yapmamışsa çekme
    
    setIsLoadingListings(true);
    try {
      let listings: ExtendedListing[] = [];
      
      switch (listingFilter) {
        case 'my': {
          // Kendi yük ilanlarım
          const myListings = await ListingService.getUserListings(user.id);
          listings = myListings.filter(listing => listing.listing_type === 'load_listing');
          break;
        }
          
        case 'offered': {
          // Teklif verdiğim ilanlar (şimdilik boş - offers tablosu gerekli)
          listings = [];
          // TODO: ListingService.getOfferedListings(user.id) eklenecek
          break;
        }
          
        case 'all':
        default: {
          // Tüm aktif yük ilanları
          listings = await ListingService.getListingsByType('load_listing');
          break;
        }
      }
      
      const formattedListings = listings.map(listing => ({
        id: listing.id, // UUID - Supabase için gerekli
        listing_number: listing.listing_number, // Gösterim için ilan numarası
        title: listing.title,
        route: `${listing.origin}${listing.destination ? ` → ${listing.destination}` : ''}`,
        loadType: listing.load_type || 'Belirtilmemiş',
        origin: listing.origin,
        destination: listing.destination || ''
      }));
      setLoadListings(formattedListings);
    } catch (error) {
      console.error('Error fetching load listings:', error);
      toast.error('Yük ilanları yüklenirken hata oluştu');
      // Fallback: Örnek veriler kullan
      setLoadListings([
        {
          id: 'e8f805c2-5d97-4c6e-ad9b-674e6d5fad8a', // Gerçek UUID
          listing_number: 'ILN2507093757',
          title: 'İstanbul-Ankara Tekstil Yükü',
          route: 'İstanbul → Ankara',
          loadType: 'Tekstil Ürünleri',
          origin: 'İstanbul',
          destination: 'Ankara'
        },
        {
          id: 'f9e806d3-6e98-5d7f-be0c-785f7e6gbe9b', // Mock UUID
          listing_number: 'ILN2507093758',
          title: 'Ankara-Konya Gıda Taşıma',
          route: 'Ankara → Konya',
          loadType: 'Ambalajlı Gıda Ürünleri',
          origin: 'Ankara',
          destination: 'Konya'
        }
      ]);
    } finally {
      setIsLoadingListings(false);
    }
  }, [user, listingFilter]);

  // Yük ilanlarını Supabase'den çek
  useEffect(() => {
    fetchLoadListings();
  }, [fetchLoadListings]); // fetchLoadListings değiştiğinde tekrar çek

  // Storage bucket kontrolünü kaldırdık - direkt aktif
  useEffect(() => {
    console.log('� Evrak yükleme alanı aktif');
    console.log('� Current user:', user?.email);
    
    // Storage her zaman hazır olarak işaretle
    setStorageReady(true);
  }, [user]);

  // Edit mode için veri yükleme
  useEffect(() => {
    if (editMode && shipmentRequestId && user) {
      const loadShipmentRequest = async () => {
        try {
          const listing = await ListingService.getListingById(shipmentRequestId);
          
          if (!listing || listing.listing_type !== 'shipment_request') {
            toast.error('Nakliye talebi bulunamadı!');
            setActiveSection('my-listings');
            return;
          }

          // Form verilerini doldur
          setFormData({
            requestNumber: listing.listing_number || '',
            requestTitle: listing.title || '',
            requestLoadType: listing.load_type || '',
            requestDescription: listing.description || '',
            requestOrigin: listing.origin || '',
            requestDestination: listing.destination || '',
            requestLoadingDate: listing.loading_date || '',
            requestDeliveryDate: listing.delivery_date || '',
            requestWeight: listing.weight_value?.toString() || '',
            requestVolume: listing.volume_value?.toString() || '',
            requestSetPrice: listing.price_amount?.toString() || ''
          });

          setTransportMode(listing.transport_mode || 'road');
          
        } catch (error) {
          console.error('Error loading shipment request:', error);
          toast.error('Nakliye talebi yüklenirken hata oluştu!');
          setActiveSection('my-listings');
        }
      };

      loadShipmentRequest();
    }
  }, [editMode, shipmentRequestId, user, setActiveSection]);

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
        requestLoadType: selectedListing.loadType,
        requestOrigin: selectedListing.origin,
        requestDestination: selectedListing.destination
      }));
    } else {
      setSelectedLoadListing(listingId);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error('Dosya yüklemek için giriş yapmalısınız!');
      return;
    }

    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      // Dosya validasyonu
      for (const file of fileArray) {
        const validation = FileUploadService.validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          toast.error(`${file.name}: ${validation.error}`);
        }
      }

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      console.log(`📤 Attempting to upload ${validFiles.length} files to documents bucket...`);

      // Dosyaları Supabase'e yükle
      const uploadedFiles = await FileUploadService.uploadMultipleFiles(
        validFiles,
        'documents',
        `shipment-requests/${user.id}`
      );

      setUploadedDocuments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi!`);

    } catch (error) {
      console.error('❌ File upload error:', error);
      
      // Storage bucket hatası kontrolü
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          toast.error(
            '🗄️ Storage bucket bulunamadı!\n\n' +
            '1. Supabase Dashboard\'ı açın (app.supabase.com)\n' +
            '2. Storage sekmesine gidin\n' +
            '3. "documents" bucket\'ını oluşturun\n' +
            '4. Bucket\'ı public yapın\n\n' +
            'Detaylı rehber: STORAGE_SETUP_GUIDE.md',
            { duration: 10000 }
          );
        } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          toast.error(
            '🔒 Storage izin hatası!\n\n' +
            'Bucket\'lar manuel olarak oluşturulmalı.\n' +
            'STORAGE_SETUP_GUIDE.md dosyasındaki adımları takip edin.',
            { duration: 10000 }
          );
        } else if (error.message.includes('policy')) {
          toast.error(
            '🚫 Storage politika hatası!\n\n' +
            'RLS politikaları ayarlanmamış.\n' +
            'setup-storage-rls-policies.sql dosyasını Supabase\'de çalıştırın.',
            { duration: 10000 }
          );
        } else {
          toast.error(`Dosya yüklenirken hata oluştu: ${error.message}`);
        }
      } else {
        toast.error('Dosya yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsUploading(false);
      // Input'u temizle
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDocumentDelete = async (doc: UploadedFile) => {
    try {
      // Eğer dosya Supabase'e yüklenmişse sil
      if (doc.bucket && doc.path) {
        await FileUploadService.deleteFile(doc.bucket, doc.path);
      }
      setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Dosya silindi');
    } catch (error) {
      console.error('❌ File delete error:', error);
      toast.error('Dosya silinirken hata oluştu');
    }
  };

  const handleDocumentPreview = (doc: UploadedFile) => {
    window.open(doc.url, '_blank');
  };

  const handleDocumentDownload = (doc: UploadedFile) => {
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
      toast.error('Lütfen önce giriş yapın!');
      return;
    }

    // Form validasyonu
    if (!formData.requestTitle.trim()) {
      toast.error('İlan başlığı zorunludur!');
      return;
    }

    if (!formData.requestOrigin.trim()) {
      toast.error('Kalkış noktası zorunludur!');
      return;
    }

    if (!transportMode) {
      toast.error('Taşıma modu seçilmelidir!');
      return;
    }

    if (!formData.requestLoadingDate) {
      toast.error('Yükleme tarihi seçilmelidir!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Fiyat değerini parse et
      const priceAmount = formData.requestSetPrice ? parseFloat(formData.requestSetPrice) : null;
      
      if (priceAmount && (priceAmount < 0 || priceAmount > 999999999)) {
        toast.error('Fiyat değeri 0-999,999,999 TL arasında olmalıdır!');
        return;
      }

      // Ağırlık ve hacim değerlerini parse et
      const weightValue = formData.requestWeight ? parseFloat(formData.requestWeight) : null;
      const volumeValue = formData.requestVolume ? parseFloat(formData.requestVolume) : null;

      // Yüklenen dosyaların URL'lerini al
      const documentUrls = uploadedDocuments.map(doc => doc.url);

      // Nakliye talebi verisini hazırla
      const shipmentRequestData = {
        user_id: user.id,
        listing_type: 'shipment_request' as const,
        title: formData.requestTitle,
        description: formData.requestDescription || undefined,
        origin: formData.requestOrigin,
        destination: formData.requestDestination || undefined,
        transport_mode: transportMode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal',
        role_type: undefined, // Nakliye talebi için role_type undefined
        load_type: formData.requestLoadType || undefined,
        weight_value: weightValue,
        weight_unit: weightValue ? 'ton' : undefined,
        volume_value: volumeValue,
        volume_unit: volumeValue ? 'm3' : undefined,
        loading_date: formData.requestLoadingDate || undefined,
        delivery_date: formData.requestDeliveryDate || undefined,
        price_amount: priceAmount,
        price_currency: priceAmount ? 'TRY' : undefined,
        offer_type: (offerType === 'price' ? 'fixed_price' : 'negotiable') as 'fixed_price' | 'negotiable',
        transport_responsible: undefined, // Nakliye talebi için bu alan kullanılmaz
        required_documents: selectedDocuments.length > 0 ? selectedDocuments : undefined,
        document_urls: documentUrls.length > 0 ? documentUrls : undefined,
        related_load_listing_id: selectedLoadListing || undefined, // Seçilen yük ilanının ID'si
        status: 'active' as const
      };

      console.log('🚚 Processing shipment request:', shipmentRequestData);
      console.log('🔍 Debug - selectedLoadListing value:', selectedLoadListing);
      console.log('🔍 Debug - editMode:', editMode);

      let result;
      if (editMode && shipmentRequestId) {
        // Güncelleme işlemi
        result = await ListingService.updateListing(shipmentRequestId, shipmentRequestData);
        console.log('✅ Shipment request updated successfully:', result);
        toast.success('Nakliye talebi başarıyla güncellendi!');
      } else {
        // Yeni oluşturma işlemi
        result = await ListingService.createListing(shipmentRequestData);
        console.log('✅ Shipment request created successfully:', result);
        toast.success('Nakliye talebi başarıyla oluşturuldu!');
      }
      
      // Formu temizle (sadece create mode'da)
      if (!editMode) {
        resetForm();
      }
      
      // Edit mode'da geri dön
      if (editMode) {
        setEditingShipmentRequestId(null);
      }
      
      // Listeye yönlendir
      setActiveSection('my-listings');
      
    } catch (error) {
      console.error('❌ Error creating shipment request:', error);
      toast.error('Nakliye talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form temizleme fonksiyonu
  const resetForm = () => {
    setFormData({
      requestNumber: `NT${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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
    setTransportMode('');
    setVehicleType('');
    setOfferType('direct');
    setSelectedLoadListing('');
    setSelectedDocuments([]);
    setUploadedDocuments([]);
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
            <h1 className="text-3xl font-bold text-gray-900">
              {editMode ? 'Nakliye Talebini Düzenle' : 'Yeni Nakliye Talebi İlanı Oluştur'}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              <div className="bg-primary-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-primary-800">
                  Nakliye Talebi No: <span className="font-bold">{formData.requestNumber}</span>
                </span>
              </div>
              <div className="text-sm text-gray-600">
                NT ile başlayan numaralar Nakliye Talebi ilanları içindir
              </div>
            </div>
          </div>
          {transportMode && (
            <div className="hidden md:block">
              {getTransportIcon()}
            </div>
          )}
        </div>

        {/* Yük İlanı Seçimi */}
        <div className="mb-8 p-6 bg-white/70 rounded-3xl border border-gray-200 relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <Package className="mr-2 text-primary-600" size={20} />
            Hangi Yük İlanı İçin Nakliye Talebi Oluşturuyorsunuz?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            ILN ile başlayan yük ilanlarından birini seçerek, o ilan için nakliye talebi oluşturabilirsiniz. 
            Bu seçim yalnızca bilgi amaçlıdır ve hangi yük için taşıma hizmeti talep ettiğinizi gösterir.
          </p>
          
          {/* Filtre Butonları */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setListingFilter('my')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                listingFilter === 'my'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kendi İlanlarım
            </button>
            <button
              type="button"
              onClick={() => setListingFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                listingFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tüm İlanlar
            </button>
            <button
              type="button"
              onClick={() => setListingFilter('offered')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                listingFilter === 'offered'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled
              title="Yakında eklenecek"
            >
              Teklif Verdiklerim (Yakında)
            </button>
          </div>
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
                  disabled={isLoadingListings}
                  required
                >
                  <option value="">
                    {isLoadingListings ? 'Yük ilanları yükleniyor...' : 'Yük ilanı seçiniz...'}
                  </option>
                  {loadListings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.listing_number} - {listing.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
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
                      <p><strong>Güzergah:</strong> {listing.route}</p>
                      <p><strong>Yük Tipi:</strong> {listing.loadType}</p>
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
                Yükleme Tarihi *
              </label>
              <input
                type="date"
                id="requestLoadingDate"
                name="requestLoadingDate"
                value={formData.requestLoadingDate}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Teslimat Tarihi */}
            <div>
              <label htmlFor="requestDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Teslimat Tarihi *
              </label>
              <input
                type="date"
                id="requestDeliveryDate"
                name="requestDeliveryDate"
                value={formData.requestDeliveryDate}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
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
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                📋 Gerekli Evraklar ({transportMode === 'road' ? 'Karayolu' : transportMode === 'sea' ? 'Denizyolu' : transportMode === 'air' ? 'Havayolu' : 'Demiryolu'})
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
              <FileText className="mr-2 text-primary-600" size={20} />
              Evrak Yükleme Alanı
            </h3>
            
            {/* Dosya Yükleme Alanı */}
            <div className="mb-6">
              {/* File Upload Area */}
              <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-colors ${
                isUploading 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-primary-400'
              }`}>
                <input
                  type="file"
                  id="documentUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label htmlFor="documentUpload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-lg font-medium text-blue-700 mb-2">Dosyalar yükleniyor...</p>
                      <p className="text-sm text-blue-600">Lütfen bekleyin</p>
                    </div>
                  ) : storageReady === false ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-medium text-yellow-700 mb-2">Storage Kurulum Gerekli</p>
                      <p className="text-sm text-yellow-600 mb-3">
                        Storage bucketları oluşturuluyor, lütfen bekleyin...
                      </p>
                      <div className="bg-yellow-100 p-3 rounded-lg text-sm text-yellow-800">
                        <p className="font-medium mb-1">� Yapılıyor:</p>
                        <p>• Storage bucketları otomatik oluşturuluyor</p>
                        <p>• Eğer başarısız olursa manuel kurulum yapılacak</p>
                        <p>• Sayfayı yenilemeyi deneyin</p>
                        <br />
                        <p className="font-medium">📄 Manuel kurulum: BUCKET_OLUSTURMA_REHBERI.md</p>
                      </div>
                    </div>
                  ) : storageReady === null ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-12 h-12 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-lg font-medium text-gray-600 mb-2">Storage kontrol ediliyor...</p>
                      <p className="text-sm text-gray-500">Lütfen bekleyin</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Evrakları buraya sürükleyin veya tıklayın</p>
                      <p className="text-sm text-gray-500">
                        Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Maksimum dosya boyutu: 10MB</p>
                    </div>
                  )}
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
                          onClick={() => handleDocumentDelete(document)}
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

          {/* Transport Mode Specific Fields */}
          {transportMode && (
            <div className="bg-white/50 rounded-3xl p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {transportMode === 'road' && '🚛 Karayolu Taşımacılığı Detayları'}
                {transportMode === 'sea' && '🚢 Denizyolu Taşımacılığı Detayları'}
                {transportMode === 'air' && '✈️ Havayolu Taşımacılığı Detayları'}
                {transportMode === 'rail' && '🚂 Demiryolu Taşımacılığı Detayları'}
              </h4>
              <div className="text-sm text-gray-600">
                {transportMode === 'road' && 'Karayolu taşımacılığı için özel gereksinimlerinizi belirtebilirsiniz.'}
                {transportMode === 'sea' && 'Denizyolu taşımacılığı için liman ve konteyner bilgilerini ekleyebilirsiniz.'}
                {transportMode === 'air' && 'Havayolu taşımacılığı için havaalanı ve kargo terminal bilgilerini belirtebilirsiniz.'}
                {transportMode === 'rail' && 'Demiryolu taşımacılığı için istasyon ve vagon tipi bilgilerini ekleyebilirsiniz.'}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSection('my-listings')}
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`px-8 py-4 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl ${
                isSubmitting || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İlan Oluşturuluyor...
                </div>
              ) : isUploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dosyalar Yükleniyor...
                </div>
              ) : (
                editMode ? 'Güncelle' : 'İlanı Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipmentRequestSection;