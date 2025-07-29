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
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUserListingStats } from '../../hooks/useUserListingStats'; // Yeni hook
import { useUserOfferStats } from '../../hooks/useUserOfferStats';   // Yeni hook
import { useRecentActivities } from '../../hooks/useRecentActivities'; // Mevcut hook
import './OverviewSection.cosmic.css';

const OverviewSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { profile } = useAuth();
  const userId = profile?.id; // Kullanıcı ID'sini al

  // Yeni hook'ları çağırarak canlı verileri çek
  const listingStats = useUserListingStats(userId);
  const offerStats = useUserOfferStats(userId);
  const recentActivities = useRecentActivities(userId);

  // Mock verileri kaldırıp canlı verileri kullan
  const stats = [
    {
      title: 'Aktif İlanlarım',
      // value: '8', // Mock
      value: listingStats.loading ? '...' : listingStats.activeListings.toString(), // Canlı veri
      // subtitle: 'Son 7 günde 3 yeni', // Mock
      subtitle: listingStats.loading ? '' : `Son 7 günde ${listingStats.newLast7Days} yeni`, // Canlı veri
      icon: FileText,
      color: 'blue',
      // trend: '+12%' // Mock (şimdilik canlı veri yok)
      trend: '' // Canlı veri olmadığında boş bırak
    },
    {
      title: 'Bekleyen Teklifler',
      // value: '12', // Mock
      value: offerStats.loading ? '...' : offerStats.pendingOffers.toString(), // Canlı veri
      // subtitle: 'Son 24 saatte 5 yeni', // Mock
      subtitle: offerStats.loading ? '' : `Son 24 saatte ${offerStats.newLast24Hours} yeni`, // Canlı veri
      icon: Tag,
      color: 'green',
      // trend: '+25%' // Mock (şimdilik canlı veri yok)
      trend: '' // Canlı veri olmadığında boş bırak
    },
    {
      title: 'Devam Eden İşlemler',
      // value: '4', // Mock
      // Varsayım: Kabul edilen teklifler devam eden işlemlerdir.
      value: offerStats.loading ? '...' : offerStats.acceptedOffers.toString(), // Canlı veri (accepted offers)
      // subtitle: '2 tanesi bugün başladı', // Mock (şimdilik detaylı canlı veri yok)
      subtitle: offerStats.loading ? '' : '', // Şimdilik boş
      icon: Clock,
      color: 'amber',
      // trend: '+8%' // Mock (şimdilik canlı veri yok)
      trend: '' // Canlı veri olmadığında boş bırak
    },
    {
      title: 'Tamamlanan İşlemler',
      // value: '27', // Mock
      // Varsayım: Teklif tablosunda 'completed' status'u olanlar. Eğer yoksa burası 0 veya farklı bir kaynaktan gelmeli.
      value: offerStats.loading ? '...' : offerStats.completedOffers.toString(), // Canlı veri (completed offers - varsayımsal)
      // subtitle: 'Bu ay 15 işlem', // Mock (şimdilik detaylı canlı veri yok)
      subtitle: offerStats.loading ? '' : '', // Şimdilik boş
      icon: CheckCheck,
      color: 'purple',
      // trend: '+18%' // Mock (şimdilik canlı veri yok)
      trend: '' // Canlı veri olmadığında boş bırak
    }
  ];

  // Mock etkinlik verilerini kaldırıp canlı verileri kullan
  const activities = recentActivities.loadingRecentActivities ? [] : recentActivities.recentActivities;


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
    <div className="cosmic-bg relative space-y-8 animate-fade-in overflow-hidden">
      {/* Cosmic Animations */}
      <div className="cosmic-stars absolute inset-0 pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cosmic-star cosmic-star-${i+1}`}></div>
        ))}
        <div className="cosmic-neon-line cosmic-line1"></div>
        <div className="cosmic-neon-line cosmic-line2"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`cosmic-particle cosmic-particle-${i+1}`}></div>
        ))}
      </div>

      {/* Welcome Header */}
      <div className="cosmic-header relative rounded-2xl p-10 text-white shadow-2xl overflow-hidden z-10">
        <div className="galaxy-bg"></div>
        <svg className="status-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ff6b6b" stroke="#fff" strokeWidth="1"/>
        </svg>
        <div className="header-content text-center">
          <h1 className="welcome-title cosmic-gradient-text text-4xl font-bold mb-2 animate-gradient-shift">
            Hoş Geldiniz, <span className="username">{profile?.full_name || 'Kullanıcı'}</span>!
          </h1>
          <p className="welcome-subtitle text-lg animate-glow-pulse">Bugün nasıl yardımcı olabiliriz?</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-10">
        {(listingStats.loading || offerStats.loading) ? (
          <div className="lg:col-span-4 text-center text-gray-400">Yükleniyor...</div>
        ) : (listingStats.error || offerStats.error) ? (
           <div className="lg:col-span-4 text-center text-red-500">Hata: {listingStats.error || offerStats.error}</div>
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className={`cosmic-card ${getColorClasses(stat.color)} rounded-2xl p-8 border relative overflow-hidden shadow-xl transition-all duration-500 animate-card-entrance`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold cosmic-card-title">{stat.title}</h3>
                <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center cosmic-card-icon">
                  <stat.icon size={28} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-white cosmic-card-number">{stat.value}</p>
                <p className="text-sm text-cyan-200 cosmic-card-subtitle">{stat.subtitle}</p>
                 {stat.trend && (
                  <div className="flex items-center">
                    <TrendingUp size={16} className="text-green-400 mr-1" />
                    <span className="text-sm font-medium text-green-400">{stat.trend}</span>
                  </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="cosmic-activities bg-gradient-to-r from-[#1e1e2e] to-[#2d2d44] rounded-2xl shadow-2xl p-8 border border-cyan-400/10">
            <h3 className="activities-title text-xl font-semibold mb-6 flex items-center cosmic-gradient-text">
              <Activity className="mr-2 text-cyan-400" size={24} />
              Son Etkinlikler
            </h3>
            {recentActivities.loadingRecentActivities ? (
              <div className="text-center text-gray-400">Etkinlikler yükleniyor...</div>
            ) : recentActivities.recentActivitiesError ? (
               <div className="text-center text-red-500">Hata: {recentActivities.recentActivitiesError}</div>
            ) : activities.length === 0 ? (
               <div className="text-center text-gray-500">Henüz bir etkinlik bulunmamaktadır.</div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="activity-item flex items-start p-4 bg-[#181828] rounded-xl hover:bg-[#23234a] transition-colors cosmic-activity-card animate-fade-in-up">
                    <div className={`w-10 h-10 rounded-full ${getColorClasses(activity.color)} flex items-center justify-center mr-4 flex-shrink-0 cosmic-activity-icon`}>
                      <activity.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white cosmic-activity-title">{activity.title}</p>
                      <p className="text-sm text-cyan-200 mt-1 cosmic-activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-cyan-400/20">
              <button className="text-cyan-400 font-medium flex items-center hover:text-cyan-300 transition-colors">
                <span>Tüm etkinlikleri görüntüle</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="cosmic-quick-actions bg-gradient-to-r from-[#1e1e2e] to-[#2d2d44] rounded-2xl shadow-2xl p-8 border border-cyan-400/10">
            <h3 className="text-xl font-semibold mb-6 cosmic-gradient-text">Hızlı İşlemler</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center justify-center p-4 rounded-xl font-medium transition-all duration-300 cosmic-quick-btn cosmic-card-hover ${
                    action.primary
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg hover:shadow-xl'
                      : 'bg-[#181828] text-cyan-400 border-2 border-cyan-400 hover:bg-[#23234a]'
                  }`}
                >
                  <action.icon size={20} className="mr-2" />
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cosmic-quick-links bg-gradient-to-r from-[#1e1e2e] to-[#2d2d44] rounded-2xl shadow-2xl p-8 border border-cyan-400/10">
            <h4 className="font-semibold mb-4 cosmic-gradient-text">Hızlı Erişim</h4>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="flex flex-col items-center p-3 bg-[#181828] rounded-xl hover:bg-[#23234a] transition-all duration-300 cosmic-card-hover"
                >
                  <link.icon size={20} className="mb-2 text-cyan-400" />
                  <span className="text-sm font-bold text-cyan-300 text-center cosmic-gradient-text">{link.title}</span>
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