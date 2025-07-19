import React, { useState } from 'react';
import { Calendar, Package, MapPin, FileText, Upload, Eye, Download, Trash2, Image } from 'lucide-react';
import type { ExtendedListing, ListingUpdate } from '../../types/database-types';
import { ListingService } from '../../services/listingService';
import { storage } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface EditLoadListingModalProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updated: ExtendedListing) => void;
}

const EditLoadListingModal: React.FC<EditLoadListingModalProps> = ({ listing, isOpen, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    listingNumber: listing.listing_number || '',
    loadTitle: listing.title || '',
    loadType: listing.load_type || '',
    loadDescription: listing.description || '',
    loadOrigin: listing.origin || '',
    loadDestination: listing.destination || '',
    loadingDate: listing.loading_date || '',
    deliveryDate: listing.delivery_date || '',
    loadWeight: listing.weight_value?.toString() || '',
    loadVolume: listing.volume_value?.toString() || '',
    setPrice: listing.price_amount?.toString() || '',
    loadRoleSelection: listing.transport_responsible || ''
  });
  
  const [offerType, setOfferType] = useState(listing.offer_type === 'fixed_price' ? 'price' : 'direct');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(listing.required_documents || []);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
    file?: File;
    documentType?: string;
  }>>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
    file?: File;
  }>>([]);
  const [existingImages, setExistingImages] = useState<string[]>(listing.image_urls || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evrak etiketleri
  const documentLabels: Record<string, string> = {
    invoice: '📄 Fatura / Proforma Fatura',
    salesContract: '📝 Satış Sözleşmesi',
    waybill: '📋 İrsaliye / Sevk Fişi',
    originCertificate: '🌍 Menşe Şahadetnamesi',
    analysis: '🔬 Analiz Sertifikası / Laboratuvar Raporları',
    complianceCertificates: '📑 TSE, CE, ISO Uygunluk Sertifikaları',
    productPhotos: '🖼️ Ürün Fotoğrafları',
    packingList: '📦 Ambalaj / Packing List',
    warehouseReceipt: '🏪 Depo Teslim Fişi / Stok Belgesi',
    producerReceipt: '🌾 Müstahsil Makbuzu',
    customsDeclaration: '🛃 Gümrük Beyannamesi',
    msds: '🧪 MSDS',
    fumigationCertificate: '🌫️ Fumigasyon Sertifikası',
    inspectionReports: '🔎 SGS / Intertek Raporları',
    paymentDocuments: '💳 Ödeme Belgeleri',
    healthCertificates: '🩺 Sağlık/Veteriner/Fitosaniter Sertifika',
    specialCertificates: '🕋 Helal/Kosher/ECO Sertifikaları',
    importExportLicense: '📜 İthalat/İhracat Lisansı',
    antidampingCertificates: '🌱 Anti-damping/Orijinallik Belgeleri',
    productManuals: '📘 Ürün Teknik Bilgi Formları',
    other: '➕ Diğer'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setRequiredDocuments(prev => [...prev, value]);
    } else {
      setRequiredDocuments(prev => prev.filter(doc => doc !== value));
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

        if (allowedTypes.includes(file.type)) {
          const newDocument = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
            url: URL.createObjectURL(file),
            file: file,
            documentType: 'general'
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

  // Resim yükleme fonksiyonları
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const allowedImageTypes = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp'
        ];

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 10MB'dir.`);
          return;
        }

        if (allowedImageTypes.includes(file.type)) {
          const newImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
            url: URL.createObjectURL(file),
            file: file
          };
          setUploadedImages(prev => [...prev, newImage]);
        } else {
          toast.error('Desteklenmeyen resim türü. Lütfen PNG, JPEG, JPG veya WebP dosyası yükleyin.');
        }
      });
    }
  };

  const handleImageDelete = (id: string) => {
    const imageToDelete = uploadedImages.find(img => img.id === id);
    if (imageToDelete) {
      URL.revokeObjectURL(imageToDelete.url);
    }
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleImagePreview = (image: { id: string; name: string; size: string; type: string; url: string }) => {
    window.open(image.url, '_blank');
  };

  // Mevcut resim silme
  const handleExistingImageDelete = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
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
    
    // Form validasyonu
    if (!formData.loadTitle || !formData.loadType || !formData.loadingDate || !formData.deliveryDate || !formData.loadWeight || !formData.loadVolume || !formData.loadRoleSelection || !formData.loadDescription) {
      toast.error('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sayısal değerlerin validasyonu
      const weightValue = formData.loadWeight ? parseFloat(formData.loadWeight) : null;
      const volumeValue = formData.loadVolume ? parseFloat(formData.loadVolume) : null;
      const priceAmount = formData.setPrice ? parseFloat(formData.setPrice) : null;

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
        title: formData.loadTitle,
        description: formData.loadDescription,
        origin: formData.loadOrigin,
        destination: formData.loadDestination,
        load_type: formData.loadType || null,
        weight_value: weightValue,
        weight_unit: 'ton',
        volume_value: volumeValue,
        volume_unit: 'm3',
        loading_date: formData.loadingDate || null,
        delivery_date: formData.deliveryDate || null,
        price_amount: priceAmount,
        price_currency: 'TRY',
        offer_type: offerType === 'price' ? 'fixed_price' : 'negotiable',
        transport_responsible: formData.loadRoleSelection as 'buyer' | 'seller' | 'carrier' | 'negotiable' | null,
        required_documents: requiredDocuments.length > 0 ? requiredDocuments : null,
        listing_number: formData.listingNumber
      };

      // Yeni evrakları yükle
      const documentUrls: string[] = [...(listing.document_urls || [])];
      console.log('📋 Edit Modal: Starting document upload process', {
        existingDocuments: listing.document_urls || [],
        uploadedDocuments: uploadedDocuments.length,
        documentUrls: documentUrls.length
      });
      
      for (const doc of uploadedDocuments) {
        if (doc.file && doc.documentType) {
          try {
            console.log('📄 Edit Modal: Uploading document', { name: doc.name, type: doc.documentType });
            const result = await storage.uploadListingDocument(listing.id, doc.file, doc.documentType);
            if (result.data) {
              documentUrls.push(result.data.publicUrl);
              console.log('✅ Edit Modal: Document uploaded successfully', { url: result.data.publicUrl });
            }
          } catch (docError) {
            console.warn('❌ Edit Modal: Document upload error:', docError);
          }
        }
      }

      console.log('📋 Edit Modal: Final document URLs', { 
        original: listing.document_urls || [], 
        final: documentUrls,
        added: documentUrls.length - (listing.document_urls?.length || 0)
      });

      // Yeni resimleri yükle
      const imageUrls: string[] = [...existingImages]; // Mevcut resimlerden silinmeyenler
      console.log('🖼️ Edit Modal: Starting image upload process', {
        existingImages: existingImages,
        uploadedImages: uploadedImages.length,
        imageUrls: imageUrls.length
      });
      
      for (let index = 0; index < uploadedImages.length; index++) {
        const img = uploadedImages[index];
        if (img.file) {
          try {
            console.log('🖼️ Edit Modal: Uploading image', { name: img.name, index });
            const result = await storage.uploadListingImage(listing.id, img.file, index + (listing.image_urls?.length || 0));
            if (result.data) {
              imageUrls.push(result.data.publicUrl);
              console.log('✅ Edit Modal: Image uploaded successfully', { url: result.data.publicUrl });
            }
          } catch (imgError) {
            console.warn('❌ Edit Modal: Image upload error:', imgError);
          }
        }
      }

      console.log('🖼️ Edit Modal: Final image URLs', { 
        original: listing.image_urls || [], 
        final: imageUrls,
        added: imageUrls.length - (listing.image_urls?.length || 0)
      });

      // Dosya URL'lerini güncelleme verilerine ekle
      if (documentUrls.length > 0) {
        updateData.document_urls = documentUrls;
        console.log('📋 Edit Modal: Setting document_urls in updateData', { 
          count: documentUrls.length, 
          urls: documentUrls 
        });
      }

      // Resim URL'lerini güncelleme verilerine ekle
      if (imageUrls.length > 0) {
        updateData.image_urls = imageUrls;
        console.log('🖼️ Edit Modal: Setting image_urls in updateData', { 
          count: imageUrls.length, 
          urls: imageUrls 
        });
      }

      console.log('🔄 Edit Modal: Sending update to database', { 
        listingId: listing.id, 
        updateData: { 
          ...updateData, 
          document_urls: updateData.document_urls?.length || 0,
          image_urls: updateData.image_urls?.length || 0
        }
      });

      const updated = await ListingService.updateListing(listing.id, updateData);
      
      console.log('✅ Edit Modal: Update completed', { 
        updatedId: updated.id, 
        finalDocuments: updated.document_urls?.length || 0,
        finalImages: updated.image_urls?.length || 0
      });
      
      toast.success('Yük ilanı başarıyla güncellendi!');
      
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
            <h2 className="text-2xl font-bold text-gray-900">Yük İlanı Düzenle</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İlan No */}
            <div>
              <label htmlFor="listingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                İlan No
              </label>
              <input
                type="text"
                id="listingNumber"
                name="listingNumber"
                value={formData.listingNumber}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed shadow-sm"
                readOnly
              />
            </div>

            {/* İlan Başlığı */}
            <div>
              <label htmlFor="loadTitle" className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                id="loadTitle"
                name="loadTitle"
                value={formData.loadTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Tekstil Yükü"
              />
            </div>

            {/* Yük Tipi */}
            <div className="md:col-span-2">
              <label htmlFor="loadType" className="block text-sm font-medium text-gray-700 mb-2">
                Yük Tipi *
              </label>
              <select
                id="loadType"
                name="loadType"
                value={formData.loadType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
              </select>
            </div>

            {/* Kalkış Noktası */}
            <div>
              <label htmlFor="loadOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Kalkış Noktası
              </label>
              <input
                type="text"
                id="loadOrigin"
                name="loadOrigin"
                value={formData.loadOrigin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: İstanbul, Türkiye"
              />
            </div>

            {/* Varış Noktası */}
            <div>
              <label htmlFor="loadDestination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Varış Noktası
              </label>
              <input
                type="text"
                id="loadDestination"
                name="loadDestination"
                value={formData.loadDestination}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: Ankara, Türkiye"
              />
            </div>

            {/* Yükleme Tarihi */}
            <div>
              <label htmlFor="loadingDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Yükleme Tarihi *
              </label>
              <input
                type="date"
                id="loadingDate"
                name="loadingDate"
                value={formData.loadingDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Teslimat Tarihi */}
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Teslimat Tarihi *
              </label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Ağırlık */}
            <div>
              <label htmlFor="loadWeight" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Ağırlık (ton) *
              </label>
              <input
                type="number"
                id="loadWeight"
                name="loadWeight"
                value={formData.loadWeight}
                onChange={handleInputChange}
                min="0.1"
                max="999999"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: 10.5"
              />
            </div>

            {/* Hacim */}
            <div>
              <label htmlFor="loadVolume" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                Hacim (m³) *
              </label>
              <input
                type="number"
                id="loadVolume"
                name="loadVolume"
                value={formData.loadVolume}
                onChange={handleInputChange}
                min="0.1"
                max="999999"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                    Fiyat Belirle
                  </label>
                </div>
              </div>
            </div>

            {/* Fiyat */}
            {offerType === 'price' && (
              <div>
                <label htmlFor="setPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (TRY)
                </label>
                <input
                  type="number"
                  id="setPrice"
                  name="setPrice"
                  value={formData.setPrice}
                  onChange={handleInputChange}
                  min="0"
                  max="999999999"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: 5000.00"
                />
              </div>
            )}

            {/* Nakliye Sorumlusu */}
            <div>
              <label htmlFor="loadRoleSelection" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye Sorumlusu *
              </label>
              <select
                id="loadRoleSelection"
                name="loadRoleSelection"
                value={formData.loadRoleSelection}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              >
                <option value="">Seçiniz</option>
                <option value="buyer">🛒 Alıcı</option>
                <option value="seller">🏪 Satıcı</option>
                <option value="carrier">🚛 Taşıyıcı</option>
                <option value="negotiable">🤝 Pazarlık Edilebilir</option>
              </select>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="loadDescription" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Açıklama *
            </label>
            <textarea
              id="loadDescription"
              name="loadDescription"
              value={formData.loadDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              required
              placeholder="Yük detayları, özel talimatlar, ambalaj bilgileri..."
            />
          </div>

          {/* Gerekli Evraklar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gerekli Evraklar
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {Object.entries(documentLabels).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`doc-${key}`}
                    value={key}
                    checked={requiredDocuments.includes(key)}
                    onChange={handleDocumentChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor={`doc-${key}`} className="ml-2 text-sm text-gray-700">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

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

          {/* Resim Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Image className="inline w-4 h-4 mr-1" />
              Ürün Resimleri Yükle
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              title="Resim dosyalarını seçin"
              placeholder="Resim seçin..."
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPEG, JPG, WebP formatları desteklenir. Maksimum dosya boyutu: 10MB</p>
            
            {/* Yüklenen Resimler */}
            {(existingImages.length > 0 || uploadedImages.length > 0) && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Ürün Resimleri:</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Mevcut Resimler */}
                  {existingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Mevcut resim ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Broken image fallback
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTVhMyAzIDAgMTAwLTYgMyAzIDAgMDAwIDZ6IiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTIgMTJjMCA1LjUyMyA0LjQ3NyAxMCAxMCAxMHMxMC00LjQ3NyAxMC0xMFMxNy41MjMgMiAxMiAyUzIgNi40NzcgMiAxMnptNy44LThsMi40IDMuMiAyLjQtMy4yaDIuNEwxMy42IDEwSDIwYzAgLjY3LS4wNyAxLjMzLS4yIDJoLTMuNmwxLjYgMi4zTDE3IDEzaDJhOC4wNyA4LjA3IDAgMDEtMSAzLjdsLTEuNS0yLjJIMTQuNmwtMS42IDJhOC4wNyA4LjA3IDAgMDEtMi0xLjlsMi0yLjhIOWE4LjA3IDguMDcgMCAwMS0xLTNsMi42IDNoMS44bC0yLjQtM2gwLjZhOC4wNyA4LjA3IDAgMDEyLTEuOUw5LjQgNGgyLjR6IiBmaWxsPSIjOTk5Ii8+PC9zdmc+';
                          }}
                        />
                      </div>
                      
                      {/* Resim Bilgileri */}
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">
                          Mevcut Resim {index + 1}
                        </p>
                        <p className="text-xs text-gray-500">Mevcut</p>
                      </div>
                      
                      {/* Hover Butonları */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                            title="Büyüt"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExistingImageDelete(imageUrl)}
                            className="p-1 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Yeni Yüklenen Resimler */}
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Resim Bilgileri */}
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 truncate" title={img.name}>
                          {img.name}
                        </p>
                        <p className="text-xs text-gray-500">{img.size} (Yeni)</p>
                      </div>
                      
                      {/* Hover Butonları */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleImagePreview(img)}
                            className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                            title="Büyüt"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img.id)}
                            className="p-1 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

export default EditLoadListingModal;
