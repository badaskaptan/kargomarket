// Enhanced Market Data Page with Freight Data
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
  Activity
} from 'lucide-react';
import { MarketDataService, MarketDataItem } from '../../services/marketDataService';
import TradingViewMarketWidget from '../widgets/TradingViewMarketWidget';
import TradingViewCurrencyWidget from '../widgets/TradingViewCurrencyWidget';
import RealTimeMarketData from '../widgets/RealTimeMarketData';
import FreightDataPanel from '../widgets/FreightDataPanel';

interface EnhancedMarketDataPageProps {
  setActivePage?: (page: string) => void;
}

const EnhancedMarketDataPage: React.FC<EnhancedMarketDataPageProps> = ({ setActivePage }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fuel' | 'currency' | 'freight' | 'commodity' | 'index'>('all');
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
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

  // Canlı veri çekme
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);

      try {
        const liveData = await MarketDataService.getMarketData();
        const dataWithIcons = liveData.map(item => ({
          ...item,
          icon: getIconForCategory(item.category)
        }));

        setMarketData(dataWithIcons);
        setLastRefresh(new Date());
        await MarketDataService.cacheMarketData(liveData);
      } catch (error) {
        console.error('Market data fetch error:', error);
        setMarketData(getFallbackData());
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
        source: 'Alpha Vantage',
        description: 'Brent Ham Petrol Vadeli İşlemler'
      }
    ];
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const liveData = await MarketDataService.getMarketData();
      const dataWithIcons = liveData.map(item => ({
        ...item,
        icon: getIconForCategory(item.category)
      }));

      setMarketData(dataWithIcons);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = selectedCategory === 'all' 
    ? marketData 
    : marketData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {setActivePage && (
              <button
                onClick={() => setActivePage('dashboard')}
                title="Ana sayfaya dön"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Piyasa Verileri</h1>
              <p className="text-gray-600 mt-1">Gerçek zamanlı finansal veriler ve navlun oranları</p>
            </div>
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

      {/* Live Market Ticker */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-8 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Anlık Kurlar & Piyasa</h3>
          <div className="flex items-center text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium">Canlı</span>
          </div>
        </div>
        <TradingViewCurrencyWidget />
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          filteredData.map((item) => {
            const IconComponent = item.icon || BarChart3;
            const isPositive = item.change > 0;

            return (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <IconComponent className={`w-6 h-6 mr-3 ${
                      item.category === 'fuel' ? 'text-red-500' :
                      item.category === 'currency' ? 'text-green-500' :
                      item.category === 'freight' ? 'text-blue-500' :
                      item.category === 'commodity' ? 'text-yellow-500' :
                      'text-purple-500'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>{item.changePercent}</span>
                  </div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.source}</span>
                    <span>{new Date(item.lastUpdate).toLocaleTimeString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TradingView Widgets */}
      <div className="bg-white rounded-xl shadow-lg mb-12">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Detaylı Piyasa Verileri</h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Döviz kurları, emtialar, enerji ve nakliye sektörü hisse senetleri</p>
            <div className="flex items-center text-blue-600">
              <Activity className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Canlı</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <TradingViewMarketWidget />
        </div>
      </div>

      {/* Alpha Vantage Real-Time Data */}
      <div className="mb-12">
        <RealTimeMarketData />
      </div>

      {/* Freight & Commodity Data Panel */}
      <FreightDataPanel />

      {/* Data Sources Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Veri Kaynakları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <strong>Döviz Kurları:</strong> Alpha Vantage API
          </div>
          <div>
            <strong>Hisse Senetleri:</strong> Alpha Vantage API
          </div>
          <div>
            <strong>TradingView Widgets:</strong> Canlı finansal veriler
          </div>
          <div>
            <strong>Navlun Oranları:</strong> Freightos Baltic Index
          </div>
          <div>
            <strong>Emtia Fiyatları:</strong> TMO & Drewry Index
          </div>
          <div>
            <strong>Piyasa Raporları:</strong> Sektör kaynaklarından derlendi
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          * Veriler haftalık veya günlük güncellenir. API'lardan gelen canlı veriler gerçek zamanlıdır.
        </p>
      </div>
    </div>
  );
};

export default EnhancedMarketDataPage;
