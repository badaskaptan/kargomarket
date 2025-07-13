import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import { UploadService } from '../../services/uploadService';
import type { ExtendedListing } from '../../types/database-types';

interface EditModalShipmentRequestProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedListing: ExtendedListing) => void;
}

const EditModalShipmentRequest: React.FC<EditModalShipmentRequestProps> = ({
  listing,
  isOpen,
  onClose,
  onSave
}) => {
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
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    name: string;
    url: string;
    type: string;
    size: string;
  }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        transport_mode: formData.transport_mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal',
        vehicle_types: formData.vehicle_type ? [formData.vehicle_type] : null, // Convert single vehicle_type to array
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        offer_type: (offerType === 'price' ? 'fixed_price' : 'negotiable') as 'fixed_price' | 'negotiable' | null,
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
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransportModeChange = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      transport_mode: mode,
      vehicle_type: '' // Araç tipini sıfırla
    }));
    setSelectedDocuments([]); // Seçili evrakları sıfırla
  };

  const handleDocumentChange = (document: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, document]);
    } else {
      setSelectedDocuments(prev => prev.filter(doc => doc !== document));
    }
  };

  // Evrak yükleme fonksiyonu
  const handleDocumentUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setDocumentUploading(true);
    const successfulUploads: Array<{
      name: string;
      url: string;
      type: string;
      size: string;
    }> = [];

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
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          alert(`${file.name} yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }

      if (successfulUploads.length > 0) {
        setUploadedDocuments(prev => [...prev, ...successfulUploads]);
        console.log('✅ Documents uploaded successfully:', successfulUploads);
      }
    } finally {
      setDocumentUploading(false);
    }
  };

  // Evrak silme fonksiyonu
  const handleDocumentRemove = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const getTransportIcon = () => {
    const icons = {
      road: Truck,
      sea: Ship,
      air: Plane,
      rail: Train
    };
    const IconComponent = icons[formData.transport_mode as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-7 w-7 text-white" /> : <Truck className="h-7 w-7 text-white" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 rounded-t-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-white bg-opacity-10" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                {getTransportIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nakliye Talebini Düzenle</h2>
                <p className="text-white/80 text-sm mt-1">Talep bilgilerini güncelleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm"
              title="Kapat"
              aria-label="Düzenleme modalını kapat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-green-800 font-medium">Talep başarıyla güncellendi!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nakliye Talebi No */}
            <div>
              <label htmlFor="listing_number" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye Talebi No
              </label>
              <input
                type="text"
                id="listing_number"
                name="listing_number"
                value={formData.listing_number}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
                readOnly
              />
            </div>

            {/* İlan Başlığı */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Nakliye Talebi"
              />
            </div>

            {/* Yük Tipi */}
            <div>
              <label htmlFor="load_type" className="block text-sm font-medium text-gray-700 mb-2">
                Yük Tipi *
              </label>
              <select
                id="load_type"
                name="load_type"
                value={formData.load_type}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
              >
                <option value="">Seçiniz</option>
                <optgroup label="Genel Kargo / Paletli Ürünler">
                  <option value="box_package">📦 Koli / Paket</option>
                  <option value="pallet_standard">🏗️ Paletli Yükler - Standart Palet</option>
                  <option value="pallet_euro">🇪🇺 Paletli Yükler - Euro Palet</option>
                  <option value="pallet_industrial">🏭 Paletli Yükler - Endüstriyel Palet</option>
                  <option value="sack_bigbag">🛍️ Çuval / Bigbag (Dökme Olmayan)</option>
                  <option value="barrel_drum">🛢️ Varil / Fıçı</option>
                  <option value="appliances_electronics">📱 Beyaz Eşya / Elektronik</option>
                  <option value="furniture_decor">🪑 Mobilya / Dekorasyon Ürünleri</option>
                  <option value="textile_products">👕 Tekstil Ürünleri</option>
                  <option value="automotive_parts">🚗 Otomotiv Parçaları / Yedek Parça</option>
                  <option value="machinery_parts">⚙️ Makine / Ekipman Parçaları (Büyük Olmayan)</option>
                  <option value="construction_materials">🏗️ İnşaat Malzemeleri (Torbalı Çimento, Demir Bağlar vb.)</option>
                  <option value="packaged_food">🥫 Ambalajlı Gıda Ürünleri (Kuru Gıda, Konserve vb.)</option>
                  <option value="consumer_goods">🛒 Tüketim Ürünleri (Market Ürünleri)</option>
                  <option value="ecommerce_cargo">📱 E-ticaret Kargo</option>
                  <option value="other_general">📋 Diğer Genel Kargo</option>
                </optgroup>
                <optgroup label="Dökme Yükler">
                  <option value="grain">🌾 Tahıl (Buğday, Mısır, Arpa, Pirinç vb.)</option>
                  <option value="ore">⛏️ Maden Cevheri (Demir, Bakır, Boksit vb.)</option>
                  <option value="coal">⚫ Kömür</option>
                  <option value="cement_bulk">🏗️ Çimento (Dökme)</option>
                  <option value="sand_gravel">🏖️ Kum / Çakıl</option>
                  <option value="fertilizer_bulk">🌱 Gübre (Dökme)</option>
                  <option value="soil_excavation">🏗️ Toprak / Hafriyat</option>
                  <option value="scrap_metal">♻️ Hurda Metal</option>
                  <option value="other_bulk">📋 Diğer Dökme Yükler</option>
                </optgroup>
                <optgroup label="Sıvı Yükler (Dökme Sıvı)">
                  <option value="crude_oil">🛢️ Ham Petrol / Petrol Ürünleri</option>
                  <option value="chemical_liquids">🧪 Kimyasal Sıvılar (Asit, Baz, Solvent vb.)</option>
                  <option value="vegetable_oils">🌻 Bitkisel Yağlar (Ayçiçek Yağı, Zeytinyağı vb.)</option>
                  <option value="fuel">⛽ Yakıt (Dizel, Benzin vb.)</option>
                  <option value="lpg_lng">🔥 LPG / LNG (Sıvılaştırılmış Gazlar)</option>
                  <option value="water">💧 Su (İçme Suyu, Endüstriyel Su)</option>
                  <option value="milk_dairy">🥛 Süt / Süt Ürünleri (Dökme)</option>
                  <option value="wine_concentrate">🍷 Şarap / İçecek Konsantresi</option>
                  <option value="other_liquid">💧 Diğer Sıvı Yükler</option>
                </optgroup>
                <optgroup label="Ağır Yük / Gabari Dışı Yük">
                  <option value="tbm">🚇 Tünel Açma Makinesi (TBM)</option>
                  <option value="transformer_generator">⚡ Trafo / Jeneratör</option>
                  <option value="heavy_machinery">🏗️ Büyük İş Makineleri (Ekskavatör, Vinç vb.)</option>
                  <option value="boat_yacht">⛵ Tekne / Yat</option>
                  <option value="industrial_parts">🏭 Büyük Endüstriyel Parçalar</option>
                  <option value="prefab_elements">🏗️ Prefabrik Yapı Elemanları</option>
                  <option value="wind_turbine">💨 Rüzgar Türbini Kanatları / Kuleleri</option>
                  <option value="other_oversized">📏 Diğer Gabari Dışı Yükler</option>
                </optgroup>
                <optgroup label="Hassas / Kırılabilir Kargo">
                  <option value="art_antiques">🎨 Sanat Eserleri / Antikalar</option>
                  <option value="glass_ceramic">🏺 Cam / Seramik Ürünler</option>
                  <option value="electronic_devices">💻 Elektronik Cihaz</option>
                  <option value="medical_devices">🏥 Tıbbi Cihazlar</option>
                  <option value="lab_equipment">🔬 Laboratuvar Ekipmanları</option>
                  <option value="flowers_plants">🌸 Çiçek / Canlı Bitki</option>
                  <option value="other_sensitive">🔒 Diğer Hassas Kargo</option>
                </optgroup>
                <optgroup label="Tehlikeli Madde (ADR / IMDG / IATA Sınıflandırması)">
                  <option value="dangerous_class1">💥 Patlayıcılar (Sınıf 1)</option>
                  <option value="dangerous_class2">💨 Gazlar (Sınıf 2)</option>
                  <option value="dangerous_class3">🔥 Yanıcı Sıvılar (Sınıf 3)</option>
                  <option value="dangerous_class4">🔥 Yanıcı Katılar (Sınıf 4)</option>
                  <option value="dangerous_class5">⚗️ Oksitleyici Maddeler (Sınıf 5)</option>
                  <option value="dangerous_class6">☠️ Zehirli ve Bulaşıcı Maddeler (Sınıf 6)</option>
                  <option value="dangerous_class7">☢️ Radyoaktif Maddeler (Sınıf 7)</option>
                  <option value="dangerous_class8">🧪 Aşındırıcı Maddeler (Sınıf 8)</option>
                  <option value="dangerous_class9">⚠️ Diğer Tehlikeli Maddeler (Sınıf 9)</option>
                </optgroup>
                <optgroup label="Soğuk Zincir / Isı Kontrollü Yük">
                  <option value="frozen_food">🧊 Donmuş Gıda</option>
                  <option value="fresh_produce">🥬 Taze Meyve / Sebze</option>
                  <option value="meat_dairy">🥩 Et / Süt Ürünleri</option>
                  <option value="pharma_vaccine">💊 İlaç / Aşı</option>
                  <option value="chemical_temp">🌡️ Kimyasal Maddeler (Isı Kontrollü)</option>
                  <option value="other_cold_chain">❄️ Diğer Soğuk Zincir Kargo</option>
                </optgroup>
                <optgroup label="Canlı Hayvan">
                  <option value="small_livestock">🐑 Küçük Baş Hayvan (Koyun, Keçi vb.)</option>
                  <option value="large_livestock">🐄 Büyük Baş Hayvan (Sığır, At vb.)</option>
                  <option value="poultry">🐔 Kanatlı Hayvan</option>
                  <option value="pets">🐕 Evcil Hayvan</option>
                  <option value="other_livestock">🐾 Diğer Canlı Hayvanlar</option>
                </optgroup>
                <optgroup label="Proje Yükleri">
                  <option value="factory_setup">🏭 Fabrika Kurulumu</option>
                  <option value="power_plant">⚡ Enerji Santrali Ekipmanları</option>
                  <option value="infrastructure">🏗️ Altyapı Proje Malzemeleri</option>
                  <option value="other_project">📋 Diğer Proje Yükleri</option>
                </optgroup>
              </select>
            </div>

            {/* Taşıma Modu */}
            <div>
              <label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700 mb-2">
                Taşıma Modu *
              </label>
              <select
                id="transport_mode"
                name="transport_mode"
                value={formData.transport_mode}
                onChange={(e) => handleTransportModeChange(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
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
            {formData.transport_mode && (
              <div>
                <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Tipi *
                </label>
                <select
                  id="vehicle_type"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                  required
                >
                  <option value="">Araç tipi seçiniz...</option>
                  {vehicleTypes[formData.transport_mode as keyof typeof vehicleTypes]?.map((group, groupIndex) => (
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

            {/* Kalkış Noktası */}
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Kalkış Noktası
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                placeholder="Örn: İstanbul, Türkiye"
              />
            </div>

            {/* Varış Noktası */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Varış Noktası
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                placeholder="Örn: Ankara, Türkiye"
              />
            </div>

            {/* Yükleme Tarihi */}
            <div>
              <label htmlFor="loading_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Yükleme Tarihi *
              </label>
              <input
                type="date"
                id="loading_date"
                name="loading_date"
                value={formData.loading_date}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Teslimat Tarihi */}
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Teslimat Tarihi *
              </label>
              <input
                type="date"
                id="delivery_date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Ağırlık */}
            <div>
              <label htmlFor="weight_value" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Ağırlık (ton) *
              </label>
              <input
                type="number"
                id="weight_value"
                name="weight_value"
                value={formData.weight_value}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
                placeholder="Örn: 10.5"
              />
            </div>

            {/* Hacim */}
            <div>
              <label htmlFor="volume_value" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Hacim (m³) *
              </label>
              <input
                type="number"
                id="volume_value"
                name="volume_value"
                value={formData.volume_value}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
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
                    id="offerTypeDirect"
                    name="offerType"
                    value="direct"
                    checked={offerType === 'direct'}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="offerTypeDirect" className="ml-2 text-sm text-gray-700">
                    Doğrudan Teklif
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="offerTypePrice"
                    name="offerType"
                    value="price"
                    checked={offerType === 'price'}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="offerTypePrice" className="ml-2 text-sm text-gray-700">
                    Fiyat Belirleyerek
                  </label>
                </div>
              </div>
            </div>

            {/* Belirlenen Fiyat */}
            {offerType === 'price' && (
              <div>
                <label htmlFor="price_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Belirlenen Fiyat (TL) *
                </label>
                <input
                  type="number"
                  id="price_amount"
                  name="price_amount"
                  value={formData.price_amount}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                  placeholder="Örn: 5000"
                />
              </div>
            )}

            {/* Bütçe Aralığı - Eğer doğrudan teklif seçilmişse */}
            {offerType === 'direct' && (
              <>
                <div>
                  <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Bütçe (TL)
                  </label>
                  <input
                    type="number"
                    id="budget_min"
                    name="budget_min"
                    value={formData.budget_min}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                    placeholder="Minimum bütçe"
                  />
                </div>
                <div>
                  <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Bütçe (TL)
                  </label>
                  <input
                    type="number"
                    id="budget_max"
                    name="budget_max"
                    value={formData.budget_max}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                    placeholder="Maksimum bütçe"
                  />
                </div>
              </>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
              required
              placeholder="Nakliye talebiniz hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Gerekli Evraklar - Taşıma modu seçildikten sonra gösterilir */}
          {formData.transport_mode && (
            <div className="bg-white/50 rounded-3xl p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-green-600" size={20} />
                Gerekli Evraklar ({formData.transport_mode === 'road' ? 'Karayolu' : formData.transport_mode === 'sea' ? 'Denizyolu' : formData.transport_mode === 'air' ? 'Havayolu' : 'Demiryolu'})
              </h4>
              {/* Denizyolu için grup yapısı */}
              {formData.transport_mode === 'sea' ? (
                <>
                  {(requiredDocuments.sea as { group: string; documents: string[] }[]).map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                      <div className="font-semibold text-green-700 mb-2">{group.group}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.documents.map((document, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`sea_doc_${groupIdx}_${idx}`}
                              checked={selectedDocuments.includes(document)}
                              onChange={(e) => handleDocumentChange(document, e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                  {(requiredDocuments[formData.transport_mode as keyof typeof requiredDocuments] as string[]).map((document, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doc_${index}`}
                        checked={selectedDocuments.includes(document)}
                        onChange={(e) => handleDocumentChange(document, e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor={`doc_${index}`} className="ml-3 text-sm text-gray-700">
                        {document}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedDocuments.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-3xl border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Seçilen Evraklar ({selectedDocuments.length}):</strong> {selectedDocuments.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Evrak Yükleme Alanı */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="mr-2 text-green-600" size={20} />
              Evrak Yükleme & Dosya Ekleme
            </h3>
            
            {/* Dosya Yükleme Alanı */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  id="documentUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleDocumentUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="documentUpload" className="cursor-pointer">
                  {documentUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Evraklar yükleniyor...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Evrakları buraya sürükleyin veya tıklayın</p>
                    </>
                  )}
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
                  {uploadedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200">
                      <div className="flex items-center flex-1">
                        <span className="text-2xl mr-3">{getFileIcon(doc.type)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => window.open(doc.url, '_blank')}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Önizleme"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.url;
                            link.download = doc.name;
                            link.click();
                          }}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                          title="İndir"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentRemove(index)}
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

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium transform hover:scale-105"
              title="İptal et"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg"
              title="Değişiklikleri kaydet"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModalShipmentRequest;
