import React, { useState, useEffect } from 'react';
import { MarketDataService, MarketDataItem } from '../../services/marketDataService';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Clock } from 'lucide-react';

interface MarketDataWidgetProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milisaniye
}

const MarketDataWidget: React.FC<MarketDataWidgetProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 dakika
}) => {
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MarketDataService.getMarketData();
      setMarketData(data);
      setLastUpdate(new Date().toLocaleString('tr-TR'));
    } catch (err) {
      setError('Piyasa verileri yüklenirken hata oluştu');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    if (autoRefresh) {
      const interval = setInterval(fetchMarketData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && marketData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📊 Piyasa Verileri</h3>
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📊 Piyasa Verileri</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {lastUpdate && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdate}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {marketData.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {item.value}
                  <span className="text-sm font-normal text-gray-600 ml-1">{item.unit}</span>
                </p>
              </div>
              {getTrendIcon(item.trend)}
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(item.trend)}`}
              >
                {item.changePercent}
              </span>
              {item.source && (
                <span className="text-xs text-gray-400">{item.source}</span>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {new Date(item.lastUpdate).toLocaleString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              })}
            </div>
          </div>
        ))}
      </div>

      {marketData.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Piyasa verisi bulunamadı</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        Veriler canlı API'lerden çekilmektedir. Yatırım tavsiyesi değildir.
      </div>
    </div>
  );
};

export default MarketDataWidget;
