// Freight & Commodity Data Component - Navlun ve yük fiyatları
import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Package, 
  Wheat, 
  Fuel,
  Calendar,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import FreightDataService, { FreightRoute, CommodityPrice, MarketReport } from '../../services/freightDataService';

export default function FreightDataPanel() {
  const [freightRoutes, setFreightRoutes] = useState<FreightRoute[]>([]);
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'routes' | 'commodities' | 'reports'>('routes');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const freightService = FreightDataService.getInstance();

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [routesData, commoditiesData, reportsData] = await Promise.all([
          freightService.getFreightRoutes(),
          freightService.getCommodityPrices(),
          freightService.getMarketReports()
        ]);

        setFreightRoutes(routesData);
        setCommodities(commoditiesData);
        setReports(reportsData);
      } catch (error) {
        console.error('Freight data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [freightService]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesData, commoditiesData, reportsData] = await Promise.all([
        freightService.getFreightRoutes(),
        freightService.getCommodityPrices(),
        freightService.getMarketReports()
      ]);

      setFreightRoutes(routesData);
      setCommodities(commoditiesData);
      setReports(reportsData);
    } catch (error) {
      console.error('Freight data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const success = await freightService.refreshData();
    if (success) {
      loadData();
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${colorClass} text-sm`}>
        {icon}
        <span className="ml-1">
          {isPositive ? '+' : ''}{change} ({isPositive ? '+' : ''}{changePercent}%)
        </span>
      </div>
    );
  };

  const getContainerIcon = (type: string) => {
    switch (type) {
      case '40ft':
      case '20ft':
        return <Package className="w-4 h-4" />;
      case 'bulk':
        return <Truck className="w-4 h-4" />;
      default:
        return <Ship className="w-4 h-4" />;
    }
  };

  const getCommodityIcon = (category: string) => {
    switch (category) {
      case 'agricultural':
        return <Wheat className="w-4 h-4 text-green-600" />;
      case 'energy':
        return <Fuel className="w-4 h-4 text-red-600" />;
      case 'metals':
        return <Package className="w-4 h-4 text-gray-600" />;
      case 'automotive':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const freshness = freightService.getDataFreshness();

  const filteredRoutes = selectedCategory === 'all' 
    ? freightRoutes 
    : freightRoutes.filter(route => route.origin.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
          <span className="text-gray-600">Navlun verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Data Status */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Ship className="w-6 h-6 mr-2 text-blue-600" />
                Navlun & Yük Fiyatları
              </h2>
              <p className="text-gray-600 mt-1">Gerçek piyasa verileri - haftalık güncelleme</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </button>
          </div>

          {/* Data Freshness Indicator */}
          <div className={`mt-4 p-3 rounded-lg ${freshness.isStale ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center">
              {freshness.isStale ? (
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              ) : (
                <Calendar className="w-4 h-4 text-green-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${freshness.isStale ? 'text-yellow-800' : 'text-green-800'}`}>
                Son güncelleme: {freshness.lastUpdate.toLocaleDateString('tr-TR')}
              </span>
              <span className="ml-4 text-xs text-gray-600">
                Sonraki güncelleme: {freshness.nextUpdate.toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'routes', label: 'Navlun Rotaları', icon: Ship },
              { id: 'commodities', label: 'Yük Fiyatları', icon: Package },
              { id: 'reports', label: 'Piyasa Raporları', icon: TrendingUp }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'routes' | 'commodities' | 'reports')}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Konteyner Navlun Oranları</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                title="Rota kategorisi seçin"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tüm Rotalar</option>
                <option value="china">Çin Rotaları</option>
                <option value="turkey">Türkiye Rotaları</option>
                <option value="europe">Avrupa Rotaları</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Değişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getContainerIcon(route.containerType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{route.route}</div>
                          <div className="text-xs text-gray-500">{route.origin} → {route.destination}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{route.containerType}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(route.price, route.currency)}
                      </div>
                      <div className="text-xs text-gray-500">{route.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      {route.change !== undefined && route.changePercent !== undefined && 
                        formatChange(route.change, route.changePercent)
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        <div>{route.source}</div>
                        <div>{route.lastUpdated}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commodities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodities.map((commodity) => (
            <div key={commodity.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getCommodityIcon(commodity.category)}
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">{commodity.name}</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(commodity.price, commodity.currency)}
                  </div>
                  <div className="text-sm text-gray-500">{commodity.unit}</div>
                </div>

                {commodity.change !== undefined && commodity.changePercent !== undefined && (
                  <div>
                    {formatChange(commodity.change, commodity.changePercent)}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{commodity.description}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{commodity.source}</span>
                    <span>{commodity.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 mb-4">{report.summary}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Öne Çıkan Noktalar:</h4>
                    <ul className="space-y-1">
                      {report.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {report.url && (
                  <a 
                    href={report.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Raporu aç"
                    className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">{report.source}</span>
                <span className="text-sm text-gray-500">{report.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Sources Footer */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Veri Kaynakları:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {freshness.sources.map((source, index) => (
            <div key={index} className="text-xs">
              <div className="font-medium text-gray-700">{source.name}</div>
              <div className="text-gray-500">Güncelleme: {source.frequency}</div>
              <div className="text-gray-500">Son: {source.lastUpdate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
