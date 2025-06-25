import React from 'react';
import { 
  FileText, 
  Tag, 
  Clock, 
  CheckCheck, 
  TrendingUp, 
  Package, 
  Truck, 
  MessageCircle, 
  User,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const OverviewSection: React.FC = () => {
  const { setActiveSection } = useDashboard();

  const stats = [
    {
      title: 'Aktif İlanlarım',
      value: '8',
      subtitle: 'Son 7 günde 3 yeni',
      icon: FileText,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Bekleyen Teklifler',
      value: '12',
      subtitle: 'Son 24 saatte 5 yeni',
      icon: Tag,
      color: 'green',
      trend: '+25%'
    },
    {
      title: 'Devam Eden İşlemler',
      value: '4',
      subtitle: '2 tanesi bugün başladı',
      icon: Clock,
      color: 'amber',
      trend: '+8%'
    },
    {
      title: 'Tamamlanan İşlemler',
      value: '27',
      subtitle: 'Bu ay 15 işlem',
      icon: CheckCheck,
      color: 'purple',
      trend: '+18%'
    }
  ];

  const activities = [
    {
      title: 'İstanbul-Ankara Tekstil Yükü ilanınıza yeni bir teklif geldi',
      time: 'Bugün, 14:32',
      icon: Tag,
      color: 'blue'
    },
    {
      title: 'Bursa-İzmir Mobilya Taşıma işlemi tamamlandı',
      time: 'Dün, 18:45',
      icon: CheckCheck,
      color: 'green'
    },
    {
      title: 'Mehmet Kaya size yeni bir mesaj gönderdi',
      time: 'Dün, 10:15',
      icon: MessageCircle,
      color: 'amber'
    },
    {
      title: 'Ankara-Konya Gıda Taşıma ilanınız yayınlandı',
      time: '16.06.2025, 09:28',
      icon: FileText,
      color: 'purple'
    }
  ];

  const quickActions = [
    {
      title: 'Yeni Yük İlanı Oluştur',
      icon: Package,
      action: () => setActiveSection('create-load-listing'),
      primary: true
    },
    {
      title: 'Yeni Nakliye Talebi Oluştur',
      icon: Truck,
      action: () => setActiveSection('create-shipment-request'),
      primary: false
    }
  ];

  const quickLinks = [
    { title: 'Tekliflerim', icon: Tag, action: () => setActiveSection('my-offers') },
    { title: 'Mesajlar', icon: MessageCircle, action: () => setActiveSection('messages') },
    { title: 'İlanlarım', icon: FileText, action: () => setActiveSection('my-listings') },
    { title: 'Profilim', icon: User, action: () => setActiveSection('profile') }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-100 text-blue-600',
      green: 'bg-green-50 border-green-100 text-green-600',
      amber: 'bg-amber-50 border-amber-100 text-amber-600',
      purple: 'bg-purple-50 border-purple-100 text-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz, Ahmet Yılmaz!</h1>
            <p className="text-primary-100 text-lg">Bugün nasıl yardımcı olabiliriz?</p>
          </div>
          <div className="hidden md:block">
            <Activity size={64} className="text-primary-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${getColorClasses(stat.color)} rounded-xl p-6 border card-hover`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.subtitle}</p>
              <div className="flex items-center">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Activity className="mr-2 text-primary-600" size={24} />
              Son Etkinlikler
            </h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${getColorClasses(activity.color)} flex items-center justify-center mr-4 flex-shrink-0`}>
                    <activity.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="text-primary-600 font-medium flex items-center hover:text-primary-700 transition-colors">
                <span>Tüm etkinlikleri görüntüle</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Hızlı İşlemler</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center justify-center p-4 rounded-lg font-medium transition-all duration-200 ${
                    action.primary
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                      : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <action.icon size={20} className="mr-2" />
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-semibold mb-4">Hızlı Erişim</h4>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 card-hover"
                >
                  <link.icon size={20} className="mb-2" />
                  <span className="text-sm font-medium text-center">{link.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;