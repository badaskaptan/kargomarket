import React, { useState } from 'react';
import { User, Bell, Lock, CreditCard, FileText, Globe, Clock, Shield, AlertTriangle, ExternalLink } from 'lucide-react';

const SettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 555 123 4567',
    language: 'tr',
    timezone: 'europe-istanbul',
    visibility: 'public',
    twoFactor: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings updated:', formData);
    // Show success message
  };

  const menuItems = [
    {
      id: 'account',
      label: 'Hesap Ayarları',
      icon: User,
      active: activeTab === 'account'
    },
    {
      id: 'notifications',
      label: 'Bildirim Ayarları',
      icon: Bell,
      active: activeTab === 'notifications'
    },
    {
      id: 'security',
      label: 'Gizlilik ve Güvenlik',
      icon: Lock,
      active: activeTab === 'security'
    },
    {
      id: 'payment',
      label: 'Ödeme Yöntemleri',
      icon: CreditCard,
      active: activeTab === 'payment'
    },
    {
      id: 'billing',
      label: 'Fatura Bilgileri',
      icon: FileText,
      active: activeTab === 'billing'
    },
    {
      id: 'legal',
      label: 'Yasal Bilgiler',
      icon: Shield,
      active: activeTab === 'legal'
    }
  ];

  const renderLegalContent = () => (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Shield className="mr-2 text-primary-600" size={20} />
        Yasal Bilgiler ve Sorumluluk Reddi
      </h3>
      
      <div className="space-y-6">
        {/* Platform Disclaimer */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <h4 className="text-lg font-semibold text-gray-900">Platform Sorumluluk Reddi</h4>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-800 mb-2">Önemli Uyarı</h5>
              <p className="text-red-700">
                Bu platform yalnızca ilan ve reklam hizmeti sunar. Kullanıcılar arasındaki tüm ticari işlemler, 
                anlaşmalar ve sorumluluklar tamamen kullanıcılara aittir. Platform hiçbir ticari işlemin tarafı değildir.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Gelir Modeli</h5>
              <p>
                Platformumuzun gelirleri yalnızca üyelik ücretleri ve reklam/ilan yayınlama bedellerinden elde edilmektedir. 
                Kullanıcılar arasındaki hiçbir finansal işlemde aracı değiliz.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Sorumluluk Sınırları</h5>
              <p>
                Platform; dolandırıcılık, kalitesiz hizmet, gecikme, kayıp, hasar, sözleşme ihlali ve benzeri 
                durumlardan sorumlu değildir. Tüm işlemler kullanıcıların kendi risk ve sorumluluğundadır.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <FileText size={16} className="mr-2" />
              Tam Metni Oku
              <ExternalLink size={14} className="ml-2" />
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Globe size={16} className="mr-2" />
              English Version
            </button>
          </div>
        </div>

        {/* KVKK Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Lock className="text-green-500 mr-3" size={24} />
            <h4 className="text-lg font-semibold text-gray-900">Kişisel Verilerin Korunması (KVKK)</h4>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Kişisel verileriniz yalnızca platform işleyişini sağlamak ve yasal yükümlülükler çerçevesinde işlenir. 
              Verileriniz üçüncü şahıslarla paylaşılmaz.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-green-800 mb-2">Veri İşleme Amaçları</h5>
              <ul className="text-green-700 space-y-1">
                <li>• Platform hizmetlerinin sunulması</li>
                <li>• Kullanıcı güvenliğinin sağlanması</li>
                <li>• Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>• İletişim ve destek hizmetleri</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Shield size={16} className="mr-2" />
              KVKK Aydınlatma Metni
              <ExternalLink size={14} className="ml-2" />
            </button>
          </div>
        </div>

        {/* User Rights */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <User className="text-blue-500 mr-3" size={24} />
            <h4 className="text-lg font-semibold text-gray-900">Kullanıcı Hakları</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Veri Hakları</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Verilerinizi görme hakkı</li>
                <li>• Düzeltme talep etme hakkı</li>
                <li>• Silme talep etme hakkı</li>
                <li>• İşlemeye itiraz etme hakkı</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Platform Hakları</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Hesap kapatma hakkı</li>
                <li>• Veri taşınabilirlik hakkı</li>
                <li>• Şikayet etme hakkı</li>
                <li>• Bilgi alma hakkı</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact for Legal Issues */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="text-purple-500 mr-3" size={24} />
            <h4 className="text-lg font-semibold text-gray-900">Yasal Konularda İletişim</h4>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Yasal konular, veri koruma, sorumluluk reddi veya platform kullanımı hakkında sorularınız için:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Hukuk Departmanı</h5>
                <p>📧 emrahbadas@gmail.com</p>
                <p>📞 +905412879705</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Veri Koruma Sorumlusu</h5>
                <p>📧 emrahbadas@gmail.com</p>
                <p>📞 +905412879705</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Acceptance */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-yellow-600 mr-3" size={24} />
            <h4 className="text-lg font-semibold text-gray-900">Sözleşme Kabulü</h4>
          </div>
          
          <p className="text-sm text-yellow-800 mb-4">
            Platformu kullanmaya devam ederek, yukarıda belirtilen tüm koşulları ve sorumluluk reddi beyanını 
            kabul etmiş sayılırsınız.
          </p>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="legalAcceptance"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              defaultChecked
            />
            <label htmlFor="legalAcceptance" className="ml-2 text-sm text-yellow-800">
              Yasal koşulları okudum ve kabul ediyorum
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="mr-2 text-primary-600" size={20} />
              Hesap Ayarları
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-1" />
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Dil
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Saat Dilimi
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="europe-istanbul">Europe/Istanbul (UTC+3)</option>
                    <option value="europe-london">Europe/London (UTC+0)</option>
                    <option value="america-new_york">America/New_York (UTC-5)</option>
                  </select>
                </div>
              </div>

              {/* Account Visibility */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <Shield className="mr-2 text-primary-600" size={16} />
                  Hesap Görünürlüğü
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="visibilityPublic"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                    />
                    <label htmlFor="visibilityPublic" className="ml-3">
                      <span className="font-medium text-gray-900">Herkese Açık</span>
                      <p className="text-sm text-gray-500">Profiliniz ve ilanlarınız tüm kullanıcılar tarafından görülebilir.</p>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="visibilityLimited"
                      name="visibility"
                      value="limited"
                      checked={formData.visibility === 'limited'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                    />
                    <label htmlFor="visibilityLimited" className="ml-3">
                      <span className="font-medium text-gray-900">Sınırlı</span>
                      <p className="text-sm text-gray-500">Profiliniz sadece iş yaptığınız kullanıcılar tarafından görülebilir.</p>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="visibilityPrivate"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                    />
                    <label htmlFor="visibilityPrivate" className="ml-3">
                      <span className="font-medium text-gray-900">Özel</span>
                      <p className="text-sm text-gray-500">Profiliniz sadece sizin tarafınızdan görülebilir.</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Two Factor Authentication */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium mb-4 flex items-center">
                  <Lock className="mr-2 text-primary-600" size={16} />
                  İki Faktörlü Doğrulama
                </h4>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">İki Faktörlü Doğrulama</p>
                    <p className="text-sm text-gray-500">Hesabınızı daha güvenli hale getirmek için iki faktörlü doğrulamayı etkinleştirin.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactor"
                      checked={formData.twoFactor}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Bell className="mr-2 text-primary-600" size={20} />
              Bildirim Ayarları
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">E-posta Bildirimleri</h4>
                    <p className="text-sm text-gray-500">Yeni teklifler ve mesajlar için e-posta bildirimleri alın</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Bildirimleri</h4>
                    <p className="text-sm text-gray-500">Acil durumlar için SMS bildirimleri alın</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'legal':
        return renderLegalContent();

      default:
        return (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu bölüm henüz hazırlanıyor</h3>
            <p className="text-gray-600">Seçtiğiniz ayar bölümü yakında kullanıma sunulacak.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Menu */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-100 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Ayarlar Menüsü</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
                      item.active ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon 
                        size={20} 
                        className={`mr-3 ${item.active ? 'text-primary-600' : 'text-gray-500'}`} 
                      />
                      <span className={`font-medium ${item.active ? 'text-primary-600' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;