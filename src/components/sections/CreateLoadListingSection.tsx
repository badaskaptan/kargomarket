import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, Package, MapPin, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import toast, { Toaster } from 'react-hot-toast';

const CreateLoadListingSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [roleType, setRoleType] = useState('');
  const [offerType, setOfferType] = useState('direct');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>>([]);
  const [formData, setFormData] = useState({
    listingNumber: `ILN${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    loadTitle: '',
    loadType: '',
    loadDescription: '',
    loadOrigin: '',
    loadDestination: '',
    loadingDate: '',
    deliveryDate: '',
    loadWeight: '',
    loadVolume: '',
    setPrice: '',
    loadRoleSelection: ''
  });
  const [loadImages, setLoadImages] = useState<(string | null)[]>([null, null, null]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kullanıcı kontrolü
    if (!user) {
      toast.error('Giriş yapmanız gerekiyor!');
      return;
    }

    // Form validasyonu
    if (!formData.loadTitle || !formData.loadType || !formData.loadingDate || !formData.deliveryDate || !formData.loadWeight || !formData.loadVolume || !formData.loadRoleSelection || !formData.loadDescription) {
      toast.error('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Supabase için veri formatı - en minimal
      const listingData = {
        user_id: user.id,
        listing_type: 'load_listing' as const,
        title: formData.loadTitle,
        pickup_location: formData.loadOrigin,
        delivery_location: formData.loadDestination
      };

      await ListingService.createListing(listingData);
      toast.success('Yük ilanı başarıyla oluşturuldu!');
      
      // Success message and redirect
      setTimeout(() => setActiveSection('my-listings'), 1200);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error instanceof Error ? error.message : 'İlan oluşturulurken bir hata oluştu!');
    } finally {
      setIsSubmitting(false);
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

        if (allowedTypes.includes(file.type)) {
          const newDocument = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
            url: URL.createObjectURL(file)
          };
          setUploadedDocuments(prev => [...prev, newDocument]);
        } else {
          alert('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
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

  const getRoleBackground = () => {
    if (roleType === 'buyer') {
      return 'bg-gradient-to-br from-blue-50 to-blue-100';
    } else if (roleType === 'seller') {
      return 'bg-gradient-to-br from-green-50 to-green-100';
    }
    return 'bg-white';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-right" />
      <div className={`rounded-3xl shadow-lg p-6 transition-all duration-300 ${getRoleBackground()}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => setActiveSection('my-listings')}
              className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full"
              title="Geri Dön"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Yük İlanı Oluştur</h1>
          </div>
          <div className="relative">
            <label htmlFor="roleType" className="sr-only">Rol Seçin</label>
            <select
              id="roleType"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium bg-white shadow-sm"
              title="Rol Seçin"
              aria-label="Rol Seçin"
            >
              <option value="" disabled>Rol Seçin</option>
              <option value="buyer">🛒 Alıcı</option>
              <option value="seller">🏪 Satıcı</option>
            </select>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
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
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Tekstil Yükü"
              />
            </div>

            {/* Yük Tipi */}
            <div>
              <label htmlFor="loadType" className="block text-sm font-medium text-gray-700 mb-2">
                Yük Tipi *
              </label>
              <select
                id="loadType"
                name="loadType"
                value={formData.loadType}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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

            {/* Kalkış Noktası - Artık opsiyonel */}
            <div>
              <label htmlFor="loadOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Kalkış Noktası (Opsiyonel)
              </label>
              <input
                type="text"
                id="loadOrigin"
                name="loadOrigin"
                value={formData.loadOrigin}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: İstanbul, Türkiye"
              />
            </div>

            {/* Varış Noktası - Artık opsiyonel */}
            <div>
              <label htmlFor="loadDestination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Varış Noktası (Opsiyonel)
              </label>
              <input
                type="text"
                id="loadDestination"
                name="loadDestination"
                value={formData.loadDestination}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
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
                    Fiyat Belirleyerek
                  </label>
                </div>
              </div>
            </div>

            {/* Belirlenen Fiyat */}
            {offerType === 'price' && (
              <div>
                <label htmlFor="setPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Belirlenen Fiyat (TL) *
                </label>
                <input
                  type="number"
                  id="setPrice"
                  name="setPrice"
                  value={formData.setPrice}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: 5000"
                />
              </div>
            )}

            {/* Nakliye Sorumlusu */}
            <div>
              <label htmlFor="loadRoleSelection" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye Kime Ait *
              </label>
              <select
                id="loadRoleSelection"
                name="loadRoleSelection"
                value={formData.loadRoleSelection}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              >
                <option value="">Seçiniz</option>
                <option value="buyer">🛒 Alıcı</option>
                <option value="seller">🏪 Satıcı</option>
                <option value="none">❌ Nakliye Gerekmiyor</option>
              </select>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="loadDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="loadDescription"
              name="loadDescription"
              value={formData.loadDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              required
              placeholder="Yükünüz hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Yük Görselleri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yük Görselleri (Opsiyonel)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-2 border-dashed border-gray-300 rounded-3xl aspect-square bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
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
                        setLoadImages(imgs => {
                          const newImgs = [...imgs];
                          newImgs[index] = ev.target?.result as string;
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
                      onClick={() => setLoadImages(imgs => { const newImgs = [...imgs]; newImgs[index] = null; return newImgs; })}
                      title="Görseli Kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Yük İlanı Evrak Listesi */}
          <div className="border-t border-gray-200 pt-6">
            <fieldset>
              <legend className="text-lg font-medium text-gray-900 mb-4">📦 Yük İlanı Evrak Listesi (Opsiyonel/İsteğe Bağlı Yüklenebilir)</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fatura / Proforma Fatura */}
                <div className="flex items-center">
                  <input type="checkbox" id="invoice" name="documents" value="invoice" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="invoice" className="ml-3 text-sm font-medium text-gray-700">📄 Fatura / Proforma Fatura</label>
                </div>
                {/* Satış Sözleşmesi */}
                <div className="flex items-center">
                  <input type="checkbox" id="salesContract" name="documents" value="salesContract" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="salesContract" className="ml-3 text-sm font-medium text-gray-700">📝 Satış Sözleşmesi</label>
                </div>
                {/* İrsaliye / Sevk Fişi */}
                <div className="flex items-center">
                  <input type="checkbox" id="waybill" name="documents" value="waybill" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="waybill" className="ml-3 text-sm font-medium text-gray-700">📋 İrsaliye / Sevk Fişi</label>
                </div>
                {/* Menşe Şahadetnamesi (Certificate of Origin) */}
                <div className="flex items-center">
                  <input type="checkbox" id="originCertificate" name="documents" value="originCertificate" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="originCertificate" className="ml-3 text-sm font-medium text-gray-700">🌍 Menşe Şahadetnamesi (Certificate of Origin)</label>
                </div>
                {/* Analiz Sertifikası / Laboratuvar Raporları (Quality/Quantity) */}
                <div className="flex items-center">
                  <input type="checkbox" id="analysis" name="documents" value="analysis" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="analysis" className="ml-3 text-sm font-medium text-gray-700">🔬 Analiz Sertifikası / Laboratuvar Raporları (Quality/Quantity)</label>
                </div>
                {/* TSE, CE, ISO, vb. Uygunluk Sertifikaları */}
                <div className="flex items-center">
                  <input type="checkbox" id="complianceCertificates" name="documents" value="complianceCertificates" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="complianceCertificates" className="ml-3 text-sm font-medium text-gray-700">📑 TSE, CE, ISO, vb. Uygunluk Sertifikaları</label>
                </div>
                {/* Ürün Fotoğrafları */}
                <div className="flex items-center">
                  <input type="checkbox" id="productPhotos" name="documents" value="productPhotos" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="productPhotos" className="ml-3 text-sm font-medium text-gray-700">🖼️ Ürün Fotoğrafları</label>
                </div>
                {/* Ambalaj / Packing List */}
                <div className="flex items-center">
                  <input type="checkbox" id="packingList" name="documents" value="packingList" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="packingList" className="ml-3 text-sm font-medium text-gray-700">📦 Ambalaj / Packing List</label>
                </div>
                {/* Depo Teslim Fişi / Stok Belgesi */}
                <div className="flex items-center">
                  <input type="checkbox" id="warehouseReceipt" name="documents" value="warehouseReceipt" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="warehouseReceipt" className="ml-3 text-sm font-medium text-gray-700">🏪 Depo Teslim Fişi / Stok Belgesi</label>
                </div>
                {/* Müstahsil Makbuzu (Tarım ürünleri) */}
                <div className="flex items-center">
                  <input type="checkbox" id="producerReceipt" name="documents" value="producerReceipt" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="producerReceipt" className="ml-3 text-sm font-medium text-gray-700">🌾 Müstahsil Makbuzu (Tarım ürünleri)</label>
                </div>
                {/* Gümrük Beyannamesi (İhracat/İthalat) */}
                <div className="flex items-center">
                  <input type="checkbox" id="customsDeclaration" name="documents" value="customsDeclaration" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="customsDeclaration" className="ml-3 text-sm font-medium text-gray-700">🛃 Gümrük Beyannamesi (İhracat/İthalat)</label>
                </div>
                {/* MSDS (Malzeme Güvenlik Bilgi Formu) */}
                <div className="flex items-center">
                  <input type="checkbox" id="msds" name="documents" value="msds" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="msds" className="ml-3 text-sm font-medium text-gray-700">🧪 MSDS (Malzeme Güvenlik Bilgi Formu)</label>
                </div>
                {/* Fumigasyon Sertifikası (gerekiyorsa) */}
                <div className="flex items-center">
                  <input type="checkbox" id="fumigationCertificate" name="documents" value="fumigationCertificate" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="fumigationCertificate" className="ml-3 text-sm font-medium text-gray-700">🌫️ Fumigasyon Sertifikası (gerekiyorsa)</label>
                </div>
                {/* SGS / Intertek / Third Party Inspection Raporları */}
                <div className="flex items-center">
                  <input type="checkbox" id="inspectionReports" name="documents" value="inspectionReports" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="inspectionReports" className="ml-3 text-sm font-medium text-gray-700">🔎 SGS / Intertek / Third Party Inspection Raporları</label>
                </div>
                {/* Ödeme Belgeleri (Banka Dekontu, Akreditif, Teminat Mektubu) */}
                <div className="flex items-center">
                  <input type="checkbox" id="paymentDocuments" name="documents" value="paymentDocuments" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="paymentDocuments" className="ml-3 text-sm font-medium text-gray-700">💳 Ödeme Belgeleri (Banka Dekontu, Akreditif, Teminat Mektubu)</label>
                </div>
                {/* Sağlık Sertifikası / Veteriner Sertifikası / Fitosaniter Sertifika */}
                <div className="flex items-center">
                  <input type="checkbox" id="healthCertificates" name="documents" value="healthCertificates" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="healthCertificates" className="ml-3 text-sm font-medium text-gray-700">🩺 Sağlık/Veteriner/Fitosaniter Sertifika</label>
                </div>
                {/* Helal/Kosher/ECO/Özel Ülke Sertifikaları */}
                <div className="flex items-center">
                  <input type="checkbox" id="specialCertificates" name="documents" value="specialCertificates" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="specialCertificates" className="ml-3 text-sm font-medium text-gray-700">🕋 Helal/Kosher/ECO/Özel Ülke Sertifikaları</label>
                </div>
                {/* İthalat/İhracat Lisansı / Kota Belgesi */}
                <div className="flex items-center">
                  <input type="checkbox" id="importExportLicense" name="documents" value="importExportLicense" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="importExportLicense" className="ml-3 text-sm font-medium text-gray-700">📜 İthalat/İhracat Lisansı / Kota Belgesi</label>
                </div>
                {/* Anti-damping/Orijinallik/Çevre/Emisyon Belgeleri */}
                <div className="flex items-center">
                  <input type="checkbox" id="antidampingCertificates" name="documents" value="antidampingCertificates" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="antidampingCertificates" className="ml-3 text-sm font-medium text-gray-700">🌱 Anti-damping/Orijinallik/Çevre/Emisyon Belgeleri</label>
                </div>
                {/* Ürün Teknik Bilgi Formları / Kullanım Kılavuzu */}
                <div className="flex items-center">
                  <input type="checkbox" id="productManuals" name="documents" value="productManuals" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="productManuals" className="ml-3 text-sm font-medium text-gray-700">📘 Ürün Teknik Bilgi Formları / Kullanım Kılavuzu</label>
                </div>
                {/* Diğer (Belirtiniz) */}
                <div className="flex items-center">
                  <input type="checkbox" id="other" name="documents" value="other" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="other" className="ml-3 text-sm font-medium text-gray-700">➕ Diğer (Belirtiniz): __________</label>
                </div>
              </div>
            </fieldset>
          </div>

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
                  aria-label="Evrak yükle"
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
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'İlan Oluşturuluyor...' : 'İlanı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoadListingSection;