import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Fuel,
  Ship,
  Plane,
  Truck,
  Activity
} from 'lucide-react';
import { MarketDataService, MarketDataItem, FreightRate } from '../../services/marketDataService';

interface MarketDataPageProps {
  setActivePage?: (page: string) => void;
}

const MarketDataPage: React.FC<MarketDataPageProps> = ({ setActivePage }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fuel' | 'currency' | 'freight' | 'commodity' | 'index'>('all');
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
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

  // Canlı veri çekme - MarketDataService kullanımı
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);

      try {
        // Canlı market verilerini çek
        const liveData = await MarketDataService.getMarketData();
        const liveFreightRates = await MarketDataService.getFreightRates();

        // Icon'ları ekle
        const dataWithIcons = liveData.map(item => ({
          ...item,
          icon: getIconForCategory(item.category)
        }));

        setMarketData(dataWithIcons);
        setFreightRates(liveFreightRates);
        setLastRefresh(new Date());

        // Verileri cache'e kaydet
        await MarketDataService.cacheMarketData(liveData);
      } catch (error) {
        console.error('Market data fetch error:', error);
        // Fallback verilerini kullan
        setMarketData(getFallbackData());
        setFreightRates(getFallbackFreightRates());
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'fuel':
        return Fuel;
      case 'currency':
        return DollarSign;
      case 'freight':
        return Ship;
      case 'commodity':
        return Activity;
      case 'index':
        return TrendingUp;
      default:
        return BarChart3;
    }
  };

  const getFallbackData = (): MarketDataItem[] => {
    return [
      {
        id: '1',
        name: 'Brent Petrol',
        category: 'fuel' as const,
        value: '$85.42',
        change: 2.1,
        changePercent: '+2.5%',
        unit: 'USD/Varil',
        lastUpdate: new Date().toISOString(),
        trend: 'up' as const,
        icon: Fuel
      },
      {
        id: '2',
        name: 'Doğalgaz (TTF)',
        category: 'fuel' as const,
        value: '€42.15',
        change: -1.2,
        changePercent: '-2.8%',
        unit: 'EUR/MWh',
        lastUpdate: new Date().toISOString(),
        trend: 'down' as const,
        icon: Fuel
      },
      {
        id: '3',
        name: 'USD/TRY',
        category: 'currency' as const,
        value: '27.48',
        change: 0.22,
        changePercent: '+0.8%',
        unit: 'TRY',
        lastUpdate: new Date().toISOString(),
        trend: 'up' as const,
        icon: DollarSign
      },
      {
        id: '4',
        name: 'Altın',
        category: 'commodity' as const,
        value: '$1,945.30',
        change: -8.5,
        changePercent: '-0.4%',
        unit: 'USD/Ons',
        lastUpdate: new Date().toISOString(),
        trend: 'down' as const,
        icon: Activity
      },
      {
        id: '5',
        name: 'Baltic Dry Index',
        category: 'freight' as const,
        value: '1,247',
        change: 15,
        changePercent: '+1.2%',
        unit: 'Points',
        lastUpdate: new Date().toISOString(),
        trend: 'up' as const,
        icon: Ship
      }
    ];
  };

  const getFallbackFreightRates = (): FreightRate[] => {
    return [
      {
        route: 'İstanbul - Hamburg',
        origin: 'İstanbul',
        destination: 'Hamburg',
        mode: 'road' as const,
        rate: '₺2,850',
        unit: '/Ton',
        change: 2.3,
        lastUpdate: new Date().toISOString()
      },
      {
        route: 'Mersin - Rotterdam',
        origin: 'Mersin',
        destination: 'Rotterdam',
        mode: 'sea' as const,
        rate: '$450',
        unit: '/TEU',
        change: -1.2,
        lastUpdate: new Date().toISOString()
      }
    ];
  };

  const filteredData = selectedCategory === 'all'
    ? marketData
    : marketData.filter(data => data.category === selectedCategory);

  const refreshData = async () => {
    setLoading(true);
    try {
      const liveData = await MarketDataService.getMarketData();
      const liveFreightRates = await MarketDataService.getFreightRates();

      const dataWithIcons = liveData.map(item => ({
        ...item,
        icon: getIconForCategory(item.category)
      }));

      setMarketData(dataWithIcons);
      setFreightRates(liveFreightRates);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'road': return Truck;
      case 'sea': return Ship;
      case 'air': return Plane;
      default: return Truck;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return BarChart3;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActivePage?.('infocenter')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bilgi Merkezi
          </button>
          <div className="text-gray-300">•</div>
          <h1 className="text-3xl font-bold text-gray-900">Piyasa Verileri & Navlun Fiyatları</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as 'all' | 'fuel' | 'currency' | 'freight' | 'commodity' | 'index')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          filteredData.map((data) => {
            const IconComponent = data.icon || BarChart3;
            const TrendIcon = getTrendIcon(data.trend);
            const trendColor = getTrendColor(data.trend);

            return (
              <div key={data.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{data.name}</h3>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">{data.value}</span>
                  <span className="text-sm text-gray-500 ml-2">{data.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center ${trendColor}`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{data.changePercent}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(data.lastUpdate).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Freight Rates Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Navlun Oranları</h2>
          <p className="text-gray-600">Güncel taşımacılık fiyatları ve rotalar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taşıma Türü
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Güncelleme
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {freightRates.map((rate, index) => {
                const TransportIcon = getTransportIcon(rate.mode);
                const isPositive = rate.change > 0;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{rate.route}</div>
                        <div className="text-sm text-gray-500">{rate.origin} → {rate.destination}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TransportIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm text-gray-900 capitalize">{rate.mode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rate.rate} <span className="text-gray-500">{rate.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">
                          {isPositive ? '+' : ''}{rate.change}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rate.lastUpdate).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Veri Kaynakları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Döviz Kurları:</strong> Fixer.io API
          </div>
          <div>
            <strong>Petrol Fiyatları:</strong> Alpha Vantage API
          </div>
          <div>
            <strong>Emtia Fiyatları:</strong> CoinGecko API
          </div>
          <div>
            <strong>Navlun Oranları:</strong> Supabase Database
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          * Veriler 15 dakikada bir güncellenir. API limitleri nedeniyle bazı veriler gecikebilir.
        </p>
      </div>
    </div>
  );
};

export default MarketDataPage;
