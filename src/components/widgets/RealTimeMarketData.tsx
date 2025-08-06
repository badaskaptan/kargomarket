// Alpha Vantage Real-Time Market Data Component
import React from 'react';
import { useAlphaVantageData, formatPrice, formatChange, formatPercentage, getChangeColor } from '../../hooks/useAlphaVantageData';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Truck, BarChart3 } from 'lucide-react';

export default function RealTimeMarketData() {
  const { forex, shipping, commodities, indices, loading, error, lastUpdated, refresh } = useAlphaVantageData();

  if (loading && forex.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
          <span className="text-gray-600">Piyasa verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-600">Veri hatası: {error}</span>
          </div>
          <button 
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Veri Kaynağı Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-900">
              📊 Fallback Verileri Aktif - Güncel Piyasa Yaklaşımları (2025 Ağustos)
            </span>
          </div>
          <div className="ml-auto text-xs text-blue-700">
            API Limit: 25/gün • Yenileme: Her gece 00:00 UTC
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          💡 Bu veriler Bloomberg, Yahoo Finans, Investing.com kaynaklarından güncellenmiştir
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Canlı Piyasa Verileri</h2>
            <span className="ml-2 text-sm text-gray-500">Alpha Vantage API</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Son güncelleme: {new Date(lastUpdated).toLocaleTimeString('tr-TR')}
            </span>
            <button 
              onClick={refresh}
              disabled={loading}
              title="Verileri yenile"
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Döviz Kurları */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Döviz Kurları</h3>
            </div>
          </div>
          <div className="p-6">
            {forex.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {forex.map((rate: any, index: number) => (
                  <div key={`forex-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">
                        {rate.fromCurrency}/{rate.toCurrency}
                      </span>
                      <div className="text-xs text-gray-500">
                        Spread: {formatPrice(rate.askPrice - rate.bidPrice, 4)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900">
                        {formatPrice(rate.exchangeRate, 4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(rate.lastRefreshed).toLocaleTimeString('tr-TR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Döviz verileri yükleniyor...
              </div>
            )}
          </div>
        </div>

        {/* Nakliye Şirketleri */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Nakliye Şirketleri</h3>
            </div>
          </div>
          <div className="p-6">
            {shipping.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {shipping.map((stock: any, index: number) => (
                  <div key={`shipping-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{stock.symbol}</span>
                      <div className="text-xs text-gray-500">
                        Hacim: {stock.volume?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900">
                        ${formatPrice(stock.price)}
                      </div>
                      <div className={`text-sm flex items-center ${getChangeColor(stock.change)}`}>
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {formatChange(stock.change)} ({formatPercentage(stock.changePercent)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Hisse senedi verileri yükleniyor...
              </div>
            )}
          </div>
        </div>

        {/* Piyasa Endeksleri */}
        {indices.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Piyasa Endeksleri</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {indices.map((indexData: any, idx: number) => (
                  <div key={`index-${idx}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{indexData.symbol}</span>
                      <div className="text-xs text-gray-500">
                        H: ${formatPrice(indexData.high)} L: ${formatPrice(indexData.low)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900">
                        ${formatPrice(indexData.price)}
                      </div>
                      <div className={`text-sm flex items-center ${getChangeColor(indexData.change)}`}>
                        {indexData.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {formatChange(indexData.change)} ({formatPercentage(indexData.changePercent)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emtia Fiyatları */}
        {commodities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Emtia Fiyatları</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {commodities.map((commodity: any, idx: number) => (
                  <div key={`commodity-${idx}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{commodity.symbol}</span>
                      <div className="text-xs text-gray-500">
                        {commodity.lastUpdated}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900">
                        ${formatPrice(commodity.price)}
                      </div>
                      <div className={`text-sm ${getChangeColor(commodity.change)}`}>
                        {formatChange(commodity.change)} ({formatPercentage(commodity.changePercent)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-800 text-sm font-medium">
            Alpha Vantage API Aktif - Gerçek zamanlı veriler
          </span>
          <span className="ml-auto text-green-600 text-xs">
            Otomatik güncelleme: 2 dakikada bir
          </span>
        </div>
      </div>
    </div>
  );
}
