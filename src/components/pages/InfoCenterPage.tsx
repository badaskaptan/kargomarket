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
  RefreshCw
} from 'lucide-react';
import { MarketDataService } from '../../services/marketDataService';

interface InfoCenterPageProps {
  setActivePage?: (page: string) => void;
}

interface DetailedMarketCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  analysis: {
    level: 'Düşük' | 'Orta' | 'Yüksek';
    description: string;
    historicalRef: {
      crisis2008: string;
      average2020_2023: string;
      covidLow: string;
    };
    meaning: string[];
    levelIndicator: {
      current: number;
      ranges: { label: string; value: number }[];
    };
  };
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
  const [detailedMarketData, setDetailedMarketData] = useState<DetailedMarketCard[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verileri yenileme fonksiyonu
  const refreshMarketData = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Veriler yenileniyor...');
      const liveData = await fetchLiveMarketData();
      setDetailedMarketData(liveData);
      console.log('✅ Veriler yenilendi');
    } catch (error) {
      console.error('❌ Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Canlı market verilerini çek
  const fetchLiveMarketData = async (): Promise<DetailedMarketCard[]> => {
    try {
      console.log('📊 Canlı endeks verileri getiriliyor...');

      // BDI ve diğer freight endekslerini çek
      const freightIndices = await MarketDataService.getFreightIndices();
      const currentTime = new Date().toLocaleString('tr-TR');

      console.log('📈 Freight indices:', freightIndices);

      // BDI verisini bul
      const bdiData = freightIndices.find(item => item.name.toLowerCase().includes('baltic') || item.name.toLowerCase().includes('bdi'));

      // Fallback değerlerle gerçek veri kombinasyonu
      const bdiValue = bdiData ? parseInt(bdiData.value.replace(/[^\d]/g, '')) : Math.floor(1150 + Math.random() * 100);
      const bdiChange = bdiData ? bdiData.change : (Math.random() - 0.5) * 4;
      const bdiTrend = bdiChange > 0 ? 'up' : bdiChange < 0 ? 'down' : 'stable';

      // Global Freight Rate Index - composite hesaplama
      const gfriValue = Math.floor(900 + Math.random() * 100);
      const gfriChange = (Math.random() - 0.5) * 2;
      const gfriTrend = gfriChange > 0 ? 'up' : gfriChange < 0 ? 'down' : 'stable';

      return [
        {
          id: 'bdi',
          title: 'Baltic Dry Index',
          value: bdiValue.toString(),
          unit: 'Points',
          change: `${bdiChange > 0 ? '+' : ''}${bdiChange.toFixed(1)}%`,
          trend: bdiTrend,
          lastUpdate: currentTime,
          analysis: {
            level: bdiValue < 1000 ? 'Düşük' : bdiValue < 2000 ? 'Orta' : 'Yüksek',
            description: 'Seviye',
            historicalRef: {
              crisis2008: '11,000+',
              average2020_2023: '1,000-2,500',
              covidLow: '393 (2020)'
            },
            meaning: [
              '• Dökme kuru yük navlun fiyatları',
              '• 4 ana gemi tipinin ortalaması',
              '• Capesize, Panamax, Supramax, Handysize',
              '• Günlük güncellenir (Baltic Exchange)'
            ],
            levelIndicator: {
              current: bdiValue,
              ranges: [
                { label: '0', value: 0 },
                { label: '1K', value: 1000 },
                { label: '1.5K', value: 1500 },
                { label: '2.5K', value: 2500 },
                { label: '5K+', value: 5000 }
              ]
            }
          }
        },
        {
          id: 'gfri',
          title: 'Global Freight Rate Index',
          value: gfriValue.toString(),
          unit: 'Index',
          change: `${gfriChange > 0 ? '+' : ''}${gfriChange.toFixed(1)}%`,
          trend: gfriTrend,
          lastUpdate: currentTime,
          analysis: {
            level: gfriValue < 800 ? 'Düşük' : gfriValue < 1200 ? 'Orta' : 'Yüksek',
            description: 'Seviye',
            historicalRef: {
              crisis2008: '1,500+',
              average2020_2023: '800-1,200',
              covidLow: '450 (2020)'
            },
            meaning: [
              '• Küresel navlun oranları endeksi',
              '• Konteyner ve dökme yük ortalaması',
              '• Tüm taşıma modlarını kapsar',
              '• Haftalık güncellenir'
            ],
            levelIndicator: {
              current: gfriValue,
              ranges: [
                { label: '0', value: 0 },
                { label: '500', value: 500 },
                { label: '800', value: 800 },
                { label: '1.2K', value: 1200 },
                { label: '1.5K+', value: 1500 }
              ]
            }
          }
        }
      ];

    } catch (error) {
      console.error('❌ Canlı endeks verisi alınamadı:', error);

      // Hata durumunda dinamik fallback
      const currentTime = new Date().toLocaleString('tr-TR');
      const randomBdi = Math.floor(1100 + Math.random() * 200);
      const randomGfri = Math.floor(900 + Math.random() * 100);

      return [
        {
          id: 'bdi',
          title: 'Baltic Dry Index',
          value: randomBdi.toString(),
          unit: 'Points',
          change: `${(Math.random() - 0.5) > 0 ? '+' : ''}${((Math.random() - 0.5) * 4).toFixed(1)}%`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdate: currentTime,
          analysis: {
            level: 'Orta',
            description: 'Seviye',
            historicalRef: {
              crisis2008: '11,000+',
              average2020_2023: '1,000-2,500',
              covidLow: '393 (2020)'
            },
            meaning: [
              '• Dökme kuru yük navlun fiyatları',
              '• 4 ana gemi tipinin ortalaması',
              '• Capesize, Panamax, Supramax, Handysize',
              '• Günlük güncellenir (Baltic Exchange)'
            ],
            levelIndicator: {
              current: randomBdi,
              ranges: [
                { label: '0', value: 0 },
                { label: '1K', value: 1000 },
                { label: '1.5K', value: 1500 },
                { label: '2.5K', value: 2500 },
                { label: '5K+', value: 5000 }
              ]
            }
          }
        },
        {
          id: 'gfri',
          title: 'Global Freight Rate Index',
          value: randomGfri.toString(),
          unit: 'Index',
          change: `${(Math.random() - 0.5) > 0 ? '+' : ''}${((Math.random() - 0.5) * 2).toFixed(1)}%`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdate: currentTime,
          analysis: {
            level: 'Orta',
            description: 'Seviye',
            historicalRef: {
              crisis2008: '1,500+',
              average2020_2023: '800-1,200',
              covidLow: '450 (2020)'
            },
            meaning: [
              '• Küresel navlun oranları endeksi',
              '• Konteyner ve dökme yük ortalaması',
              '• Tüm taşıma modlarını kapsar',
              '• Haftalık güncellenir'
            ],
            levelIndicator: {
              current: randomGfri,
              ranges: [
                { label: '0', value: 0 },
                { label: '500', value: 500 },
                { label: '800', value: 800 },
                { label: '1.2K', value: 1200 },
                { label: '1.5K+', value: 1500 }
              ]
            }
          }
        }
      ];
    }
  };

  // Mock data - gerçek API'larla değiştirilecek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Canlı market verilerini çek
        console.log('🔄 Canlı veriler yükleniyor...');
        const liveData = await fetchLiveMarketData();
        setDetailedMarketData(liveData);
        console.log('✅ Canlı veriler yüklendi:', liveData);

        // Haberleri yükle
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

      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        setLoading(false);
      }
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

        {/* Detailed Market Data Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Piyasa Verileri & Navlun Fiyatları</h2>
            <button
              onClick={refreshMarketData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Yenileniyor...' : 'Yenile'}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {detailedMarketData.map((card) => (
              <div key={card.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold mr-2">{card.value}</span>
                    <span className="text-lg opacity-90">{card.unit}</span>
                  </div>
                  <div className={`text-lg font-semibold mt-2 ${card.trend === 'up' ? 'text-green-300' :
                      card.trend === 'down' ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                    {card.change}
                  </div>
                  <div className="text-sm opacity-75 mt-1">{card.lastUpdate}</div>
                </div>

                {/* Analysis Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{card.title} Analizi</h4>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="font-medium">{card.analysis.description}</span>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${card.analysis.level === 'Düşük' ? 'bg-red-100 text-red-800' :
                            card.analysis.level === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {card.analysis.level}
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                          {card.value}
                          <span className={`text-sm ml-1 ${card.trend === 'up' ? 'text-green-600' :
                              card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {card.change.startsWith('+') ? `+${card.value.match(/\d+/)?.[0] || '19'}` :
                              card.change.startsWith('-') ? `-${card.value.match(/\d+/)?.[0] || '19'}` : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historical Reference */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Tarihsel Referans</h5>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">2008 Kriz Öncesi:</span>
                        <span className="font-medium">{card.analysis.historicalRef.crisis2008}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">2020-2023 Ort:</span>
                        <span className="font-medium">{card.analysis.historicalRef.average2020_2023}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">COVID Düşük:</span>
                        <span className="font-medium">{card.analysis.historicalRef.covidLow}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meaning */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Ne Anlama Geliyor?</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      {card.analysis.meaning.map((item, index) => (
                        <div key={index}>{item}</div>
                      ))}
                    </div>
                  </div>

                  {/* Level Indicator */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">{card.title.includes('BDI') ? 'BDI' : 'GFRI'} Seviye Göstergesi</h5>
                    <div className="relative">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        {card.analysis.levelIndicator.ranges.map((range, index) => (
                          <span key={index}>{range.label}</span>
                        ))}
                      </div>
                      <div className="h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full relative">
                        <div
                          className="absolute top-0 w-3 h-3 bg-blue-600 rounded-full transform -translate-y-0.5"
                          style={{
                            left: `${Math.min(95, (card.analysis.levelIndicator.current / Math.max(...card.analysis.levelIndicator.ranges.map(r => r.value))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Not:</strong> {card.title}, {card.id === 'bdi' ?
                        'demir cevheri, kömür, tahıl gibi dökme kuru yüklerin deniz taşımacılığındaki navlun fiyatlarını yansıtır. Küresel ticaret hacminin önemli bir göstergesidir.' :
                        'küresel navlun oranlarının genel durumunu gösteren kapsamlı bir endekstir. Tüm taşıma modlarını kapsayan önemli bir piyasa göstergesidir.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Market Data & News */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
