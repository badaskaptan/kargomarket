import React, { useState } from 'react';
import { User, Bell, Lock, CreditCard, FileText, Globe, Shield } from 'lucide-react';

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Yasal Bilgiler</h3>
      <p className="text-gray-600">Yasal bilgiler ve belgeler burada görüntülenecek.</p>
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
                    placeholder="E-posta adresinizi girin"
                    title="E-posta adresi"
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
                    placeholder="Telefon numaranızı girin"
                    title="Telefon numarası"
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Dil Seçimi
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    title="Dil seçimi"
                  >
                    <option value="" disabled>Bir dil seçin</option>
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                    Saat Dilimi
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    title="Saat dilimi seçimi"
                  >
                    <option value="" disabled>Saat dilimi seçin</option>
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
                    <label htmlFor="visibilityPublic" className="flex items-start">
                      <input
                        type="radio"
                        id="visibilityPublic"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                        title="Herkese Açık görünürlük seçeneği"
                        placeholder="Görünürlük seçeneği"
                      />
                      <span className="ml-3">
                        <span className="font-medium text-gray-900">Herkese Açık</span>
                        <p className="text-sm text-gray-500">Profiliniz ve ilanlarınız tüm kullanıcılar tarafından görülebilir.</p>
                      </span>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <label htmlFor="visibilityLimited" className="flex items-start">
                      <input
                        type="radio"
                        id="visibilityLimited"
                        name="visibility"
                        value="limited"
                        checked={formData.visibility === 'limited'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                        title="Sınırlı görünürlük seçeneği"
                        placeholder="Görünürlük seçeneği"
                      />
                      <span className="ml-3">
                        <span className="font-medium text-gray-900">Sınırlı</span>
                        <p className="text-sm text-gray-500">Profiliniz sadece iş yaptığınız kullanıcılar tarafından görülebilir.</p>
                      </span>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <label htmlFor="visibilityPrivate" className="flex items-start">
                      <input
                        type="radio"
                        id="visibilityPrivate"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                        title="Özel görünürlük seçeneği"
                        placeholder="Görünürlük seçeneği"
                      />
                      <span className="ml-3">
                        <span className="font-medium text-gray-900">Özel</span>
                        <p className="text-sm text-gray-500">Profiliniz sadece sizin tarafınızdan görülebilir.</p>
                      </span>
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
                    <label htmlFor="twoFactor" className="sr-only">
                      İki Faktörlü Doğrulama
                      <input
                        type="checkbox"
                        id="twoFactor"
                        name="twoFactor"
                        checked={formData.twoFactor}
                        onChange={handleInputChange}
                        className="sr-only peer"
                        title="İki Faktörlü Doğrulama"
                        placeholder="İki Faktörlü Doğrulama seçeneği"
                      />
                    </label>
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
        // ... unchanged ...
        return (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {/* ... */}
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
                    className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${item.active ? 'bg-primary-50 border-l-4 border-primary-600' : ''
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