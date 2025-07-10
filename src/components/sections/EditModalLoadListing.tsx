import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, FileText, Upload, Trash2 } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import type { ExtendedListing } from '../../types/database-types';

interface EditModalLoadListingProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedListing: ExtendedListing) => void;
}

const EditModalLoadListing: React.FC<EditModalLoadListingProps> = ({
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
    quantity: '',
    loading_date: '',
    delivery_date: '',
    price_amount: '',
    price_currency: 'TRY',
    special_requirements: '',
    transport_responsibility: ''
  });

  const [offerType, setOfferType] = useState('direct');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [loadImages, setLoadImages] = useState<(string | null)[]>([null, null, null]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        quantity: listing.quantity?.toString() || '',
        loading_date: listing.loading_date || '',
        delivery_date: listing.delivery_date || '',
        price_amount: listing.price_amount?.toString() || '',
        price_currency: listing.price_currency || 'TRY',
        special_requirements: listing.special_requirements || '',
        transport_responsibility: listing.transport_responsible || ''
      });
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
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        loading_date: formData.loading_date,
        delivery_date: formData.delivery_date,
        price_amount: formData.price_amount ? parseFloat(formData.price_amount) : null,
        price_currency: formData.price_currency,
        special_requirements: formData.special_requirements,
        transport_responsible: formData.transport_responsibility as "buyer" | "seller" | "carrier" | "negotiable" | null
      };

      const updatedListing = await ListingService.updateListing(listing.id, updateData);
      setSuccess(true);
      onSave(updatedListing);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setRequiredDocuments(prev => [...prev, value]);
    } else {
      setRequiredDocuments(prev => prev.filter(doc => doc !== value));
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 rounded-t-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-white bg-opacity-10" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Yük İlanını Düzenle</h2>
                <p className="text-white/80 text-sm mt-1">İlan bilgilerini güncelleyin</p>
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
              <span className="text-green-800 font-medium">İlan başarıyla güncellendi!</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              Temel Bilgiler
            </h3>
            
            <div className="space-y-6">
              {/* İlan No */}
              <div>
                <label htmlFor="listing_number" className="block text-sm font-semibold text-gray-700 mb-3">
                  İlan No
                </label>
                <input
                  type="text"
                  id="listing_number"
                  name="listing_number"
                  value={formData.listing_number}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed shadow-sm"
                  readOnly
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                  İlan Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Örn: İstanbul-Ankara Tekstil Yükü"
                  title="İlan başlığı"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Route & Load Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              Rota ve Yük Bilgileri
            </h3>
            
            <div className="space-y-6">
              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Kalkış Noktası
                    </div>
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="Örn: İstanbul, Türkiye"
                    title="Kalkış noktası"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Varış Noktası
                    </div>
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Örn: Ankara, Türkiye"
                    title="Varış noktası"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Load Type */}
              <div>
                <label htmlFor="load_type" className="block text-sm font-semibold text-gray-700 mb-3">
                  <Package className="inline h-4 w-4 mr-2" />
                  Yük Tipi *
                </label>
                <select
                  id="load_type"
                  name="load_type"
                  value={formData.load_type}
                  onChange={handleChange}
                  required
                  title="Yük tipi seçimi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white"
                >
                  <option value="">Yük tipini seçiniz</option>
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
            </div>
          </div>

          {/* Weight & Volume Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              Ağırlık ve Hacim Bilgileri
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ağırlık */}
                <div>
                  <label htmlFor="weight_value" className="block text-sm font-semibold text-gray-700 mb-3">
                    <Package className="inline h-4 w-4 mr-2" />
                    Ağırlık (ton) *
                  </label>
                  <input
                    type="number"
                    id="weight_value"
                    name="weight_value"
                    value={formData.weight_value}
                    onChange={handleChange}
                    min="0.1"
                    max="999999"
                    step="0.1"
                    required
                    placeholder="Örn: 10.5"
                    title="Ağırlık değeri"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Hacim */}
                <div>
                  <label htmlFor="volume_value" className="block text-sm font-semibold text-gray-700 mb-3">
                    <Package className="inline h-4 w-4 mr-2" />
                    Hacim (m³) *
                  </label>
                  <input
                    type="number"
                    id="volume_value"
                    name="volume_value"
                    value={formData.volume_value}
                    onChange={handleChange}
                    min="0.1"
                    max="999999"
                    step="0.1"
                    required
                    placeholder="Örn: 25.0"
                    title="Hacim değeri"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Price Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              Tarih ve Fiyat Bilgileri
            </h3>
            
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="loading_date" className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Yükleme Tarihi *
                  </label>
                  <input
                    type="date"
                    id="loading_date"
                    name="loading_date"
                    value={formData.loading_date}
                    onChange={handleChange}
                    required
                    title="Yükleme tarihi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="delivery_date" className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Teslimat Tarihi *
                  </label>
                  <input
                    type="date"
                    id="delivery_date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleChange}
                    required
                    title="Teslimat tarihi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Teklif Alma Şekli */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Teklif Alma Şekli</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="offerTypeDirect"
                      name="offerType"
                      value="direct"
                      checked={offerType === 'direct'}
                      onChange={(e) => setOfferType(e.target.value)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
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
                      className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                    />
                    <label htmlFor="offerTypePrice" className="ml-2 text-sm text-gray-700">
                      Fiyat Belirleyerek
                    </label>
                  </div>
                </div>
              </div>

              {/* Price - Only show when "Fiyat Belirleyerek" is selected */}
              {offerType === 'price' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price_amount" className="block text-sm font-semibold text-gray-700 mb-3">
                      Belirlenen Fiyat (TL) *
                    </label>
                    <input
                      type="number"
                      id="price_amount"
                      name="price_amount"
                      value={formData.price_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required={offerType === 'price'}
                      placeholder="Örn: 5000"
                      title="Fiyat miktarı"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="price_currency" className="block text-sm font-semibold text-gray-700 mb-3">
                      Para Birimi
                    </label>
                    <select
                      id="price_currency"
                      name="price_currency"
                      value={formData.price_currency}
                      onChange={handleChange}
                      title="Para birimi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white"
                    >
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Transport Responsibility */}
              <div>
                <label htmlFor="transport_responsibility" className="block text-sm font-semibold text-gray-700 mb-3">
                  Nakliye Kime Ait *
                </label>
                <select
                  id="transport_responsibility"
                  name="transport_responsibility"
                  value={formData.transport_responsibility}
                  onChange={handleChange}
                  required
                  title="Nakliye sorumlusu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="buyer">🛒 Alıcı</option>
                  <option value="seller">🏪 Satıcı</option>
                  <option value="carrier">🚛 Nakliyeci</option>
                  <option value="negotiable">🤝 Pazarlık Edilebilir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              Açıklama
            </h3>
            
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                  Açıklama *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Yükünüz hakkında detaylı bilgi verin..."
                  title="İlan açıklaması"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Load Images */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="bg-pink-100 p-2 rounded-lg mr-3">
                <Upload className="h-5 w-5 text-pink-600" />
              </div>
              Yük Görselleri (Opsiyonel)
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-2 border-dashed border-gray-300 rounded-xl aspect-square bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    title="Yük görseli yükle"
                    aria-label={`Yük görseli ${index + 1} yükle`}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!['image/png', 'image/jpeg'].includes(file.type)) {
                        alert('Sadece PNG veya JPG dosyası yükleyebilirsiniz.');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Dosya boyutu 5MB geçemez.');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const preview = ev.target?.result as string;
                        setLoadImages(imgs => {
                          const newImgs = [...imgs];
                          newImgs[index] = preview;
                          return newImgs;
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {loadImages[index] ? (
                    <img src={loadImages[index]!} alt={`Yük görseli ${index + 1}`} className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 text-center px-2">
                        PNG, JPG<br />max. 5MB
                      </p>
                    </div>
                  )}
                  {loadImages[index] && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-600 hover:text-red-600 z-20"
                      onClick={() => {
                        setLoadImages(imgs => { 
                          const newImgs = [...imgs]; 
                          newImgs[index] = null; 
                          return newImgs; 
                        });
                      }}
                      title="Görseli Kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Requirements */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <fieldset>
              <legend className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                📦 Yük İlanı Evrak Listesi (Opsiyonel/İsteğe Bağlı Yüklenebilir)
              </legend>
              
              {/* Hızlı Seçim Butonları */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setRequiredDocuments(Object.keys(documentLabels))}
                  className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                >
                  ✓ Tümünü Seç
                </button>
                <button
                  type="button"
                  onClick={() => setRequiredDocuments([])}
                  className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ✕ Tümünü Temizle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(documentLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={key} 
                      name="documents" 
                      value={key} 
                      checked={requiredDocuments.includes(key)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                      onChange={handleDocumentChange}
                    />
                    <label htmlFor={key} className="ml-3 text-sm font-medium text-gray-700">{label}</label>
                  </div>
                ))}
              </div>

              {/* Evrak Yükleme Alanı */}
              <div className="mt-8 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                  id="documents-upload"
                  onChange={() => {
                    // File upload handler will be implemented
                  }}
                />
                <label htmlFor="documents-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Evrakları buraya sürükleyin veya tıklayın</h4>
                  <p className="text-sm text-gray-500">
                    Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG<br />
                    Maksimum dosya boyutu: 10MB
                  </p>
                </label>
              </div>
            </fieldset>
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg"
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

export default EditModalLoadListing;
