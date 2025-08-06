import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Globe,
  Fuel,
  Ship,
  Plane,
  Truck,
  Activity
} from 'lucide-react';

interface MarketDataPageProps {
  setActivePage?: (page: string) => void;
}

interface MarketData {
  id: string;
  name: string;
  category: 'fuel' | 'currency' | 'freight' | 'commodity' | 'index';
  value: string;
  change: number;
  changePercent: string;
  unit: string;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface FreightRate {
  route: string;
  origin: string;
  destination: string;
  mode: 'road' | 'sea' | 'air';
  rate: string;
  unit: string;
  change: number;
  lastUpdate: string;
}

const MarketDataPage: React.FC<MarketDataPageProps> = ({ setActivePage }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fuel' | 'currency' | 'freight' | 'commodity' | 'index'>('all');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [freightRates, setFreightRates] = useState<FreightRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const categories = [
    { id: 'all', name: 'Tümü', icon: BarChart3, color: 'bg-gray-500' },
    { id: 'fuel', name: 'Yakıt & Enerji', icon: Fuel, color: 'bg-red-500' },
    { id: 'currency', name: 'Döviz', icon: DollarSign, color: 'bg-green-500' },
    { id: 'freight', name: 'Navlun', icon: Ship, color: 'bg-blue-500' },
    { id: 'commodity', name: 'Emtia', icon: Activity, color: 'bg-yellow-500' },
    { id: 'index', name: 'Endeksler', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  // Mock data - gerçek API'larla değiştirilecek
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      
      // Simulated API call
      setTimeout(() => {
        setMarketData([
          // Yakıt & Enerji
          {
            id: '1',
            name: 'Brent Petrol',
            category: 'fuel',
            value: '$85.42',
            change: 2.1,
            changePercent: '+2.5%',
            unit: 'USD/Varil',
            lastUpdate: '2025-08-06 15:30',
            trend: 'up',
            icon: Fuel
          },
          {
            id: '2',
            name: 'Doğalgaz (TTF)',
            category: 'fuel',
            value: '€42.15',
            change: -1.2,
            changePercent: '-2.8%',
            unit: 'EUR/MWh',
            lastUpdate: '2025-08-06 15:25',
            trend: 'down',
            icon: Fuel
          },
          {
            id: '3',
            name: 'Gazyağı (Jet Fuel)',
            category: 'fuel',
            value: '$89.67',
            change: 1.8,
            changePercent: '+2.0%',
            unit: 'USD/Varil',
            lastUpdate: '2025-08-06 15:20',
            trend: 'up',
            icon: Plane
          },
          
          // Döviz
          {
            id: '4',
            name: 'USD/TRY',
            category: 'currency',
            value: '27.48',
            change: 0.22,
            changePercent: '+0.8%',
            unit: 'TRY',
            lastUpdate: '2025-08-06 15:35',
            trend: 'up',
            icon: DollarSign
          },
          {
            id: '5',
            name: 'EUR/TRY',
            category: 'currency',
            value: '29.85',
            change: -0.15,
            changePercent: '-0.5%',
            unit: 'TRY',
            lastUpdate: '2025-08-06 15:35',
            trend: 'down',
            icon: DollarSign
          },
          {
            id: '6',
            name: 'EUR/USD',
            category: 'currency',
            value: '1.0865',
            change: -0.0012,
            changePercent: '-0.1%',
            unit: 'USD',
            lastUpdate: '2025-08-06 15:35',
            trend: 'stable',
            icon: DollarSign
          },
          
          // Emtia
          {
            id: '7',
            name: 'Altın',
            category: 'commodity',
            value: '$1,945.30',
            change: -8.5,
            changePercent: '-0.4%',
            unit: 'USD/Ons',
            lastUpdate: '2025-08-06 15:30',
            trend: 'down',
            icon: Activity
          },
          {
            id: '8',
            name: 'Bakır',
            category: 'commodity',
            value: '$8,245',
            change: 125,
            changePercent: '+1.5%',
            unit: 'USD/Ton',
            lastUpdate: '2025-08-06 15:28',
            trend: 'up',
            icon: Activity
          },
          
          // Endeksler
          {
            id: '9',
            name: 'Baltık Kuru Yük Endeksi',
            category: 'index',
            value: '1,247',
            change: 15,
            changePercent: '+1.2%',
            unit: 'Puan',
            lastUpdate: '2025-08-06 15:00',
            trend: 'up',
            icon: Ship
          },
          {
            id: '10',
            name: 'Freightos Baltık Endeksi',
            category: 'index',
            value: '1,456',
            change: -23,
            changePercent: '-1.6%',
            unit: 'USD',
            lastUpdate: '2025-08-06 14:45',
            trend: 'down',
            icon: Ship
          }
        ]);

        setFreightRates([
          {
            route: 'İstanbul - Hamburg',
            origin: 'İstanbul',
            destination: 'Hamburg',
            mode: 'road',
            rate: '₺2,850',
            unit: '/Ton',
            change: 2.3,
            lastUpdate: '2025-08-06'
          },
          {
            route: 'Mersin - Rotterdam',
            origin: 'Mersin',
            destination: 'Rotterdam',
            mode: 'sea',
            rate: '$450',
            unit: '/TEU',
            change: -1.2,
            lastUpdate: '2025-08-06'
          },
          {
            route: 'İstanbul - Dubai',
            origin: 'İstanbul',
            destination: 'Dubai',
            mode: 'air',
            rate: '$4.50',
            unit: '/Kg',
            change: 0.8,
            lastUpdate: '2025-08-06'
          },
          {
            route: 'Ankara - Moskova',
            origin: 'Ankara',
            destination: 'Moskova',
            mode: 'road',
            rate: '₺3,200',
            unit: '/Ton',
            change: 1.5,
            lastUpdate: '2025-08-05'
          },
          {
            route: 'İzmir - Napoli',
            origin: 'İzmir',
            destination: 'Napoli',
            mode: 'sea',
            rate: '$380',
            unit: '/TEU',
            change: -0.5,
            lastUpdate: '2025-08-05'
          }
        ]);
        
        setLoading(false);
        setLastRefresh(new Date());
      }, 1000);
    };

    fetchMarketData();
  }, []);

  const filteredData = selectedCategory === 'all' 
    ? marketData 
    : marketData.filter(data => data.category === selectedCategory);

  const refreshData = () => {
    setLoading(true);
    // Simulated refresh
    setTimeout(() => {
      setLoading(false);
      setLastRefresh(new Date());
    }, 1000);
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'road': return Truck;
      case 'sea': return Ship;
      case 'air': return Plane;
      default: return Truck;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setActivePage?.('bilgi-merkezi')} 
                className="mr-4"
                aria-label="Bilgi Merkezi'ne dön"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-orange-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Piyasa Verileri</h1>
                <p className="text-gray-600 mt-1">Anlık navlun fiyatları, yakıt maliyetleri ve piyasa endeksleri</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
              </div>
              <button
                onClick={refreshData}
                className="flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'all' | 'fuel' | 'currency' | 'freight' | 'commodity' | 'index')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Data Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {categories.find(c => c.id === selectedCategory)?.name || 'Tüm'} Verileri
              </h2>
              <div className="grid gap-4">
                {filteredData.map((data) => {
                  const TrendIcon = getTrendIcon(data.trend);
                  return (
                    <div key={data.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${categories.find(c => c.id === data.category)?.color} rounded-lg flex items-center justify-center mr-4`}>
                            <data.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{data.name}</h3>
                            <p className="text-sm text-gray-500">{data.unit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{data.value}</div>
                          <div className={`flex items-center justify-end text-sm ${getTrendColor(data.trend)}`}>
                            <TrendIcon className="w-4 h-4 mr-1" />
                            {data.changePercent}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500 text-right">
                        {data.lastUpdate}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Freight Rates */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Güncel Navlun Oranları
              </h2>
              <div className="space-y-4">
                {freightRates.map((rate, index) => {
                  const TransportIcon = getTransportIcon(rate.mode);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <TransportIcon className="w-4 h-4 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {rate.mode === 'road' ? 'Karayolu' : 
                             rate.mode === 'sea' ? 'Deniz' : 'Hava'}
                          </span>
                        </div>
                        <div className={`text-sm ${rate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rate.change >= 0 ? '+' : ''}{rate.change}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {rate.origin} → {rate.destination}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {rate.rate}{rate.unit}
                        </span>
                        <span className="text-xs text-gray-500">
                          {rate.lastUpdate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Bilgi</h3>
                <p className="text-xs text-blue-800">
                  Navlun oranları günlük olarak güncellenmektedir. Kesin fiyat için lütfen teklif talep ediniz.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Özet</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">En Yüksek Artış</span>
                  <span className="text-sm font-medium text-green-600">Brent +2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">En Yüksek Düşüş</span>
                  <span className="text-sm font-medium text-red-600">Doğalgaz -2.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ortalama Navlun</span>
                  <span className="text-sm font-medium text-gray-900">₺2,925/Ton</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aktif Rota</span>
                  <span className="text-sm font-medium text-gray-900">247 Rota</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Piyasa Analizi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">📈 Artış Eğilimi</h3>
              <p className="text-sm text-green-700">
                Petrol fiyatlarındaki artış navlun maliyetlerini yukarı çekiyor. 
                Özellikle uzun mesafe taşımacılığında artış beklentisi var.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🌊 Deniz Taşımacılığı</h3>
              <p className="text-sm text-blue-700">
                Baltık Endeksi'ndeki artış kuru yük taşımacılığında olumlu sinyaller veriyor. 
                Konteyner navlunları stabil seyrediyor.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">💱 Döviz Etkisi</h3>
              <p className="text-sm text-orange-700">
                USD/TRY artışı ithal yakıt maliyetlerini artırırken, 
                ihracat navlunlarında rekabet avantajı sağlıyor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPage;
