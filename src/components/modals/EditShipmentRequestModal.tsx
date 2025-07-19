import React, { useState, useEffect } from 'react';
import { Calendar, Package, MapPin, FileText, Upload, Eye, Download, Trash2, Truck, Ship, Plane, Train } from 'lucide-react';
import type { ExtendedListing, ListingUpdate } from '../../types/database-types';
import { ListingService } from '../../services/listingService';
import { storage } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database-types';

type LoadListing = Database['public']['Tables']['listings']['Row'];

interface EditShipmentRequestModalProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updated: ExtendedListing) => void;
}

const EditShipmentRequestModal: React.FC<EditShipmentRequestModalProps> = ({ listing, isOpen, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
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
  
  const [transportMode, setTransportMode] = useState(listing.transport_mode || '');
  const [vehicleType, setVehicleType] = useState(listing.vehicle_types?.[0] || '');
  const [offerType, setOfferType] = useState(listing.offer_type === 'fixed_price' ? 'price' : 'direct');
  const [selectedLoadListing, setSelectedLoadListing] = useState(listing.related_load_listing_id || '');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(listing.required_documents || []);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aktif yük ilanlarını Supabase'den çek
  useEffect(() => {
    const fetchLoadListings = async () => {
      try {
        setLoadingListings(true);
        const listings = await ListingService.searchListings({
          listingType: 'load_listing',
          limit: 50
        });
        setLoadListings(listings);
      } catch (error) {
        console.error('Error fetching load listings:', error);
        toast.error('Yük ilanları yüklenirken hata oluştu.');
        setLoadListings([]);
      } finally {
        setLoadingListings(false);
      }
    };

    if (isOpen) {
      fetchLoadListings();
    }
  }, [isOpen]);

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
      'Son 3 Yük (Last 3 Cargo)'
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
      'Havayolu ISO/Kalite Belgesi (varsa)'
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
      'ISO/Kalite Belgesi (varsa)'
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
    setTransportMode(mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal');
    setVehicleType('');
    setSelectedDocuments([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!formData.requestTitle || !transportMode || !vehicleType || !formData.requestLoadingDate || !formData.requestDeliveryDate) {
      toast.error('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      // İlan verilerini güncelle
      const updateData: ListingUpdate = {
        title: formData.requestTitle,
        description: formData.requestDescription,
        origin: formData.requestOrigin,
        destination: formData.requestDestination,
        transport_mode: transportMode,
        vehicle_types: vehicleType ? [vehicleType] : null,
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
        required_documents: selectedDocuments.length > 0 ? selectedDocuments : null,
        related_load_listing_id: selectedLoadListing || null,
        listing_number: formData.requestNumber
      };

      // Yeni evrakları yükle
      const documentUrls: string[] = [...(listing.document_urls || [])];
      console.log('📋 EditShipmentRequest: Starting document upload process', {
        existingDocuments: listing.document_urls || [],
        uploadedDocuments: uploadedDocuments.length,
        documentUrls: documentUrls.length
      });
      
      for (const doc of uploadedDocuments) {
        if (doc.file && doc.documentType) {
          try {
            console.log('📄 EditShipmentRequest: Uploading document', { name: doc.name, type: doc.documentType });
            const result = await storage.uploadListingDocument(listing.id, doc.file, doc.documentType);
            if (result.data) {
              documentUrls.push(result.data.publicUrl);
              console.log('✅ EditShipmentRequest: Document uploaded successfully', { url: result.data.publicUrl });
            }
          } catch (docError) {
            console.warn('❌ EditShipmentRequest: Document upload error:', docError);
          }
        }
      }

      console.log('📋 EditShipmentRequest: Final document URLs', { 
        original: listing.document_urls || [], 
        final: documentUrls,
        added: documentUrls.length - (listing.document_urls?.length || 0)
      });

      // Dosya URL'lerini güncelleme verilerine ekle
      if (documentUrls.length > 0) {
        updateData.document_urls = documentUrls;
        console.log('📋 EditShipmentRequest: Setting document_urls in updateData', { 
          count: documentUrls.length, 
          urls: documentUrls 
        });
      }

      console.log('🔄 EditShipmentRequest: Sending update to database', { 
        listingId: listing.id, 
        updateData: { ...updateData, document_urls: updateData.document_urls?.length || 0 }
      });

      const updated = await ListingService.updateListing(listing.id, updateData);
      
      console.log('✅ EditShipmentRequest: Update completed', { 
        updatedId: updated.id, 
        finalDocuments: updated.document_urls?.length || 0 
      });
      
      toast.success('Nakliye talebi başarıyla güncellendi!');
      
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
            <h2 className="text-2xl font-bold text-gray-900">Nakliye Talebi Düzenle</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Talep No */}
            <div>
              <label htmlFor="requestNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Talep No
              </label>
              <input
                type="text"
                id="requestNumber"
                name="requestNumber"
                value={formData.requestNumber}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed shadow-sm"
                readOnly
              />
            </div>

            {/* Talep Başlığı */}
            <div>
              <label htmlFor="requestTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Talep Başlığı *
              </label>
              <input
                type="text"
                id="requestTitle"
                name="requestTitle"
                value={formData.requestTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Nakliye Talebi"
              />
            </div>

            {/* Bağlı Yük İlanı */}
            <div className="md:col-span-2">
              <label htmlFor="loadListing" className="block text-sm font-medium text-gray-700 mb-2">
                Bağlı Yük İlanı (Opsiyonel)
              </label>
              {loadingListings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Yük ilanları yükleniyor...</span>
                </div>
              ) : (
                <select
                  id="loadListing"
                  value={selectedLoadListing}
                  onChange={(e) => handleLoadListingSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                >
                  <option value="">Yük İlanı Seçin (Opsiyonel)</option>
                  {loadListings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title} - {listing.origin} → {listing.destination}
                    </option>
                  ))}
                </select>
              )}
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
                    onClick={() => handleTransportModeChange(mode.value)}
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      transportMode === mode.value
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
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                  {getTransportIcon(transportMode)}
                  <span className="ml-2">Araç Tipi *</span>
                </label>
                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
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
              <label htmlFor="requestOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Kalkış Noktası
              </label>
              <input
                type="text"
                id="requestOrigin"
                name="requestOrigin"
                value={formData.requestOrigin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: İstanbul, Türkiye"
              />
            </div>

            {/* Varış Noktası */}
            <div>
              <label htmlFor="requestDestination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Varış Noktası
              </label>
              <input
                type="text"
                id="requestDestination"
                name="requestDestination"
                value={formData.requestDestination}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Ağırlık */}
            <div>
              <label htmlFor="requestWeight" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Ağırlık (ton)
              </label>
              <input
                type="number"
                id="requestWeight"
                name="requestWeight"
                value={formData.requestWeight}
                onChange={handleInputChange}
                min="0.1"
                max="999999"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: 10.5"
              />
            </div>

            {/* Hacim */}
            <div>
              <label htmlFor="requestVolume" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Hacim (m³)
              </label>
              <input
                type="number"
                id="requestVolume"
                name="requestVolume"
                value={formData.requestVolume}
                onChange={handleInputChange}
                min="0.1"
                max="999999"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
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
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="offerTypePrice" className="ml-2 text-sm text-gray-700">
                    Bütçe Belirle
                  </label>
                </div>
              </div>
            </div>

            {/* Bütçe */}
            {offerType === 'price' && (
              <div>
                <label htmlFor="requestSetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Bütçe (TRY)
                </label>
                <input
                  type="number"
                  id="requestSetPrice"
                  name="requestSetPrice"
                  value={formData.requestSetPrice}
                  onChange={handleInputChange}
                  min="0"
                  max="999999999"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: 5000.00"
                />
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="requestDescription" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Açıklama
            </label>
            <textarea
              id="requestDescription"
              name="requestDescription"
              value={formData.requestDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              placeholder="Nakliye talebi detayları, özel gereksinimler..."
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

export default EditShipmentRequestModal;
