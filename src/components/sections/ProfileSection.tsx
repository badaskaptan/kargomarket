import React, { useState } from 'react';
import { Edit, Lock, User, Mail, Phone, Calendar, Building, MapPin, Star } from 'lucide-react';

const ProfileSection: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [buyerRole, setBuyerRole] = useState(true);
  const [carrierRole, setCarrierRole] = useState(true);

  const stats = [
    {
      label: 'Toplam İlan',
      value: '42',
      icon: Building,
      color: 'blue'
    },
    {
      label: 'Toplam Teklif',
      value: '78',
      icon: Star,
      color: 'green'
    },
    {
      label: 'Tamamlanan',
      value: '27',
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Ortalama Puan',
      value: '4.8',
      icon: Star,
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profilim</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg">
                  <User size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Ahmet Yılmaz</h3>
                <p className="text-gray-600 mb-4">ahmet.yilmaz@example.com</p>
                
                <div className="w-full space-y-3">
                  <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl">
                    <Edit size={16} className="mr-2" />
                    <span>Profili Düzenle</span>
                  </button>
                  <button className="w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-gray-50 transition-colors">
                    <Lock size={16} className="mr-2" />
                    <span>Şifre Değiştir</span>
                  </button>
                </div>
              </div>

              {/* Roles */}
              <div className="mt-6 pt-6 border-t border-primary-200">
                <h4 className="font-medium mb-3 text-gray-900">Roller</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Alıcı/Satıcı</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyerRole}
                        onChange={(e) => setBuyerRole(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Nakliyeci</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={carrierRole}
                        onChange={(e) => setCarrierRole(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mt-6 pt-6 border-t border-primary-200">
                <h4 className="font-medium mb-3 text-gray-900">Bildirim Tercihleri</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">E-posta Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">SMS Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Yeni Teklif Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerNotifications}
                        onChange={(e) => setOfferNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 text-primary-600" size={20} />
                Kişisel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium text-gray-900">Ahmet Yılmaz</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium text-gray-900">ahmet.yilmaz@example.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900">+90 555 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Üyelik Tarihi</p>
                    <p className="font-medium text-gray-900">01.01.2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 text-primary-600" size={20} />
                Firma Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Firma Adı</p>
                    <p className="font-medium text-gray-900">Yılmaz Lojistik A.Ş.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Vergi Dairesi</p>
                    <p className="font-medium text-gray-900">Kadıköy</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Vergi No</p>
                    <p className="font-medium text-gray-900">1234567890</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="font-medium text-gray-900">Atatürk Mah. Cumhuriyet Cad. No:123 Kadıköy/İstanbul</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="mr-2 text-primary-600" size={20} />
                Hesap İstatistikleri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 card-hover">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className={`w-8 h-8 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center`}>
                        <stat.icon size={16} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;