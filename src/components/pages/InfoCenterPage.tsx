import { Calculator, Newspaper } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Truck,
  Ship,
  Plane,
  Train,
  Scale,
  DollarSign,
  Package,
  Clock
} from 'lucide-react';

interface InfoCenterPageProps {
  setActivePage?: (page: string) => void;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
}

const InfoCenterPage: React.FC<InfoCenterPageProps> = ({ setActivePage }) => {
  const [marketData, setMarketData] = useState<StatCard[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - gerçek API'larla değiştirilecek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulated API calls
      setTimeout(() => {
        setMarketData([
          {
            title: 'Brent Petrol',
            value: '$85.42',
            change: '+2.3%',
            icon: DollarSign,
            trend: 'up'
          },
          {
            title: 'USD/TRY',
            value: '27.48',
            change: '+0.8%',
            icon: TrendingUp,
            trend: 'up'
          },
          {
            title: 'Altın (Ons)',
            value: '$1,945',
            change: '-0.5%',
            icon: DollarSign,
            trend: 'down'
          },
          {
            title: 'Baltık Kuru Yük Endeksi',
            value: '1,247',
            change: '+1.2%',
            icon: Ship,
            trend: 'up'
          }
        ]);

        setNews([
          {
            id: '1',
            title: 'Süveyş Kanalı\'nda Trafik Yoğunluğu Artıyor',
            summary: 'Küresel ticaret artışıyla birlikte Süveyş Kanalı\'ndan geçen gemi sayısı...',
            category: 'Denizcilik',
            date: '2025-08-06',
            source: 'Maritime News'
          },
          {
            id: '2',
            title: 'Avrupa-Asya Kargo Tarifelerinde Artış',
            summary: 'Yakıt fiyatlarındaki yükseliş nedeniyle hava kargo tarifelerinde...',
            category: 'Havacılık',
            date: '2025-08-05',
            source: 'Cargo Today'
          },
          {
            id: '3',
            title: 'Türkiye\'de Lojistik Yatırımları Rekor Kırıyor',
            summary: 'Bu yıl lojistik sektörüne yapılan yatırımların toplam tutarı...',
            category: 'Türkiye',
            date: '2025-08-04',
            source: 'Lojistik Dergi'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const mainSections = [
    {
      id: 'logistics-dictionary',
      title: 'Logistik Sözlük',
      description: 'Kara, deniz, hava ve demir yolu taşımacılığı terimlerinin kapsamlı sözlüğü',
      icon: BookOpen,
      page: 'terimler-sozlugu',
      color: 'bg-blue-500'
    },
    {
      id: 'legal-guide',
      title: 'Hukuki Rehber',
      description: 'Ticaret hukuku, navlun hakları, sigorta ve sözleşme bilgileri',
      icon: Scale,
      page: 'ticaret-hukuku',
      color: 'bg-purple-500'
    },
    {
      id: 'market-data',
      title: 'Piyasa Verileri',
      description: 'Navlun fiyatları, yakıt maliyetleri, döviz kurları ve endeksler',
      icon: TrendingUp,
      page: 'navlun-fiyatlari',
      color: 'bg-green-500'
    },
    {
      id: 'news-updates',
      title: 'Sektör Haberleri',
      description: 'Türkiye ve dünya logistik sektöründen son haberler',
      icon: Newspaper,
      page: 'sektor-haberleri',
      color: 'bg-red-500'
    },
    {
      id: 'statistics',
      title: 'İstatistikler',
      description: 'En çok taşınan yükler, rota analizleri ve sektör istatistikleri',
      icon: BarChart3,
      page: 'sektorel-analiz',
      color: 'bg-indigo-500'
    },
    {
      id: 'calculation-tools',
      title: 'Hesaplama Araçları',
      description: 'Hacim, navlun, gümrük ve konteyner hesaplama araçları',
      icon: Calculator,
      page: 'hesaplama-araclari',
      color: 'bg-orange-500'
    }
  ];

  const quickStats = [
    { label: 'Aktif Taşıyıcı', value: '12,847', icon: Truck },
    { label: 'Günlük İlan', value: '3,245', icon: Package },
    { label: 'Aylık Ton', value: '847K', icon: Scale },
    { label: 'Ortalama Navlun', value: '₺2,150/km', icon: DollarSign }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Logistik Bilgi Merkezi
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Türkiye'nin en kapsamlı logistik bilgi kaynağı. Sektör verileri, hukuki bilgiler,
              piyasa analizleri ve güncel gelişmeler tek platformda.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-6 text-center backdrop-blur-sm">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mainSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActivePage?.(section.page)}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-left"
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {section.description}
                </p>
                <div className="flex items-center text-orange-600 font-medium">
                  <span>Detayları Gör</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Live Market Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Anlık Piyasa Verileri</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Canlı
              </div>
            </div>
            <div className="space-y-4">
              {marketData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <data.icon className="w-6 h-6 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-900">{data.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{data.value}</div>
                    <div className={`text-sm ${data.trend === 'up' ? 'text-green-600' :
                        data.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                      {data.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActivePage?.('piyasa-verileri')}
              className="block mt-4 text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Tüm Verileri Görüntüle
            </button>
          </div>

          {/* Latest News */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Son Haberler</h2>
              <Newspaper className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActivePage?.('haberler')}
              className="block mt-4 text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tüm Haberleri Görüntüle
            </button>
          </div>
        </div>

        {/* Transportation Modes Quick Access */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Taşımacılık Türleri</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Karayolu', icon: Truck, color: 'bg-green-500', category: 'karayolu' },
              { name: 'Deniz Yolu', icon: Ship, color: 'bg-blue-500', category: 'deniz' },
              { name: 'Hava Yolu', icon: Plane, color: 'bg-sky-500', category: 'hava' },
              { name: 'Demir Yolu', icon: Train, color: 'bg-gray-600', category: 'demir' }
            ].map((mode) => (
              <button
                key={mode.name}
                onClick={() => setActivePage?.('logistik-sozluk')}
                className="group text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-16 h-16 ${mode.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <mode.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {mode.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCenterPage;
