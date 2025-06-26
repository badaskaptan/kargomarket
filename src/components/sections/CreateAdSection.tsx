import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Save, Eye, Play } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const CreateAdSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const [adType, setAdType] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string;
    size: string;
  }>>([]);
  const [formData, setFormData] = useState({
    adNumber: `AD${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    companyName: '',
    adTitle: '',
    shortDescription: '',
    fullDescription: '',
    specialOffer: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    targetAudience: 'all',
    budget: '',
    duration: '30',
    features: [] as string[]
  });

  const adTypes = [
    {
      id: 'premium-card',
      title: 'Premium Reklam Kartı',
      description: 'Öne çıkan konumda, büyük boyutlu reklam kartı',
      price: '₺500/ay',
      features: ['Öne çıkan konum', 'Büyük kart boyutu', 'Video desteği', 'Özel rozet'],
      icon: '⭐'
    },
    {
      id: 'standard-card',
      title: 'Standart Reklam Kartı',
      description: 'Normal boyutlu, etkili reklam kartı',
      price: '₺300/ay',
      features: ['Standart konum', 'Normal kart boyutu', 'Resim desteği', 'İletişim butonları'],
      icon: '📋'
    },
    {
      id: 'video-ad',
      title: 'Video Reklamı',
      description: 'Video içerikli, dikkat çekici reklam',
      price: '₺750/ay',
      features: ['Video oynatma', 'Otomatik oynatma', 'HD kalite', 'Ses desteği'],
      icon: '🎥'
    }
  ];

  const availableFeatures = [
    'Aynı Gün Teslimat',
    'SMS Bilgilendirme',
    'Online Takip',
    '7/24 Müşteri Hizmetleri',
    'Kapıdan Kapıya',
    'Sigortalı Taşıma',
    'Esnek Ödeme',
    'Geniş Şube Ağı',
    'Hızlı Teslimat',
    'Güvenli Paketleme',
    'Müşteri Memnuniyeti',
    'Express Teslimat',
    'Motokurye',
    'Anlık Takip'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Dosya türü kontrolü
        const allowedTypes = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif',
          'video/mp4',
          'video/webm',
          'video/ogg'
        ];

        // Dosya boyutu kontrolü (50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 50MB'dir.`);
          return;
        }

        if (allowedTypes.includes(file.type)) {
          const newMedia = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
            url: URL.createObjectURL(file),
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          };
          setUploadedMedia(prev => [...prev, newMedia]);
        } else {
          alert('Desteklenmeyen dosya türü. Lütfen PNG, JPEG, GIF, MP4, WebM veya OGG dosyası yükleyin.');
        }
      });
    }
  };

  const handleMediaDelete = (id: string) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reklam oluşturuluyor:', {
      ...formData,
      adType,
      uploadedMedia
    });
    setActiveSection('my-ads');
  };

  const getAdTypeStyle = () => {
    const styles = {
      'premium-card': 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300',
      'standard-card': 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
      'video-ad': 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300'
    };
    return styles[adType as keyof typeof styles] || 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`rounded-3xl shadow-lg p-6 transition-all duration-300 border-2 ${getAdTypeStyle()}`}>
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => setActiveSection('my-ads')}
            className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full"
            title="Geri"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Reklam Oluştur</h1>
        </div>

        {/* Ad Type Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reklam Türü Seçin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setAdType(type.id)}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  adType === type.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                  <div className="text-xl font-bold text-primary-600 mb-3">{type.price}</div>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        {adType && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reklam No */}
              <div>
                <label htmlFor="adNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Reklam No
                </label>
                <input
                  type="text"
                  id="adNumber"
                  name="adNumber"
                  value={formData.adNumber}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
                  readOnly
                />
              </div>

              {/* Firma Adı */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Adı *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: ABC Lojistik A.Ş."
                />
              </div>

              {/* Reklam Başlığı */}
              <div>
                <label htmlFor="adTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Reklam Başlığı *
                </label>
                <input
                  type="text"
                  id="adTitle"
                  name="adTitle"
                  value={formData.adTitle}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: Türkiye'nin En Hızlı Kargo Hizmeti"
                />
              </div>

              {/* Hedef Kitle */}
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Kitle *
                </label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="buyers">Alıcı/Satıcılar</option>
                  <option value="carriers">Nakliyeciler</option>
                  <option value="companies">Kurumsal Müşteriler</option>
                </select>
              </div>

              {/* İletişim Telefonu */}
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Telefonu *
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: +90 444 2 727"
                />
              </div>

              {/* E-posta */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: info@abclojistik.com"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Opsiyonel)
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: https://www.abclojistik.com"
                />
              </div>

              {/* Bütçe */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Aylık Bütçe (TL) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="100"
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                  placeholder="Örn: 1000"
                />
              </div>
            </div>

            {/* Kısa Açıklama */}
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Kısa Açıklama *
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={2}
                maxLength={150}
                className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Reklam kartında görünecek kısa açıklama (max 150 karakter)"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/150 karakter
              </div>
            </div>

            {/* Detaylı Açıklama */}
            <div>
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Firmanız ve hizmetleriniz hakkında detaylı bilgi"
              />
            </div>

            {/* Özel Teklif */}
            <div>
              <label htmlFor="specialOffer" className="block text-sm font-medium text-gray-700 mb-2">
                Özel Teklif/Kampanya (Opsiyonel)
              </label>
              <input
                type="text"
                id="specialOffer"
                name="specialOffer"
                value={formData.specialOffer}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: %20 İndirim - İlk Siparişinizde"
              />
            </div>

            {/* Hizmet Özellikleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hizmet Özellikleri (En fazla 6 adet seçin)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      disabled={formData.features.length >= 6 && !formData.features.includes(feature)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor={feature} className="ml-2 text-sm text-gray-700">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {formData.features.length}/6 özellik seçildi
              </div>
            </div>

            {/* Medya Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reklam Görseli/Videosu *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="mediaUpload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <label htmlFor="mediaUpload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Medya dosyalarını buraya sürükleyin veya tıklayın</p>
                  <p className="text-sm text-gray-500">
                    Desteklenen formatlar: PNG, JPEG, GIF, MP4, WebM, OGG
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Maksimum dosya boyutu: 50MB</p>
                </label>
              </div>

              {/* Yüklenen Medya Dosyaları */}
              {uploadedMedia.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Yüklenen Medya ({uploadedMedia.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedMedia.map((media) => (
                      <div key={media.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {media.type === 'video' ? (
                            <div className="relative w-full h-full">
                              <video 
                                src={media.url} 
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="text-white" size={24} />
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={media.url} 
                              alt={media.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMediaDelete(media.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Sil"
                        >
                          <X size={14} />
                        </button>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-900 truncate">{media.name}</p>
                          <p className="text-xs text-gray-500">{media.size}</p>
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
                onClick={() => setActiveSection('my-ads')}
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm"
              >
                İptal
              </button>
              <button
                type="button"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                title="Önizleme"
              >
                <Eye size={18} className="mr-2" />
                Önizleme
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                title="Reklamı Yayınla"
              >
                <Save size={18} className="mr-2" />
                Reklamı Yayınla
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAdSection;