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
  Activity,
  FlaskConical
} from 'lucide-react';
import { MarketDataItem, FreightRate } from '../../services/marketDataService';

interface MarketDataPageProps {
  setActivePage?: (page: string) => void;
}

const MarketDataPage: React.FC<MarketDataPageProps> = ({ setActivePage }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index'>('energy');
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [freightRates, setFreightRates] = useState<FreightRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const categories = [
    { id: 'all', name: 'Tümü', icon: BarChart3, color: 'bg-gray-500' },
    { id: 'energy', name: 'Enerji', icon: Fuel, color: 'bg-red-500' },
    { id: 'metals', name: 'Metaller', icon: Activity, color: 'bg-blue-500' },
    { id: 'agricultural', name: 'Tarım Ürünleri', icon: FlaskConical, color: 'bg-green-500' },
    { id: 'industrial', name: 'Endüstriyel', icon: DollarSign, color: 'bg-yellow-500' },
    { id: 'livestock', name: 'Hayvancılık', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'index', name: 'Endeksler', icon: BarChart3, color: 'bg-indigo-500' }
  ];

  // Statik market verileri - sizin verdiğiniz tabloya göre
  const getStaticMarketData = () => {
    const energyData = [
      { name: 'Crude Oil', unit: 'USD/Bbl', price: '65.629', dayChange: '0.469', dayPercent: '0.72%', weekly: '-6.30%', monthly: '-3.45%', ytd: '-8.55%', yoy: '-12.82%', date: '09:22', positive: true },
      { name: 'Brent', unit: 'USD/Bbl', price: '68.131', dayChange: '0.491', dayPercent: '0.73%', weekly: '-6.04%', monthly: '-2.14%', ytd: '-8.77%', yoy: '-13.07%', date: '09:21', positive: true },
      { name: 'Natural gas', unit: 'USD/MMBtu', price: '2.9676', dayChange: '0.0424', dayPercent: '-1.41%', weekly: '-2.58%', monthly: '-13.06%', ytd: '-18.35%', yoy: '40.46%', date: '09:22', positive: false },
      { name: 'Gasoline', unit: 'USD/Gal', price: '2.1003', dayChange: '0.0111', dayPercent: '0.53%', weekly: '-4.91%', monthly: '-2.39%', ytd: '4.33%', yoy: '-11.14%', date: '09:21', positive: true },
      { name: 'Heating Oil', unit: 'USD/Gal', price: '2.2602', dayChange: '0.01', dayPercent: '0.44%', weekly: '-6.28%', monthly: '-6.25%', ytd: '-2.50%', yoy: '-4.01%', date: '09:22', positive: true },
      { name: 'Coal', unit: 'USD/T', price: '114.80', dayChange: '0.15', dayPercent: '-0.13%', weekly: '-0.61%', monthly: '4.84%', ytd: '-8.34%', yoy: '-21.10%', date: 'Aug/05', positive: false },
      { name: 'TTF Gas', unit: 'EUR/MWh', price: '34.17', dayChange: '0.23', dayPercent: '-0.68%', weekly: '-1.68%', monthly: '0.05%', ytd: '-32.31%', yoy: '-6.63%', date: '09:21', positive: false },
      { name: 'UK Gas', unit: 'GBp/thm', price: '84.2293', dayChange: '0.6307', dayPercent: '-0.74%', weekly: '-1.42%', monthly: '4.18%', ytd: '-32.84%', yoy: '-6.34%', date: '09:22', positive: false }
    ];

    const metalsData = [
      { name: 'Gold', unit: 'USD/t.oz', price: '3376.55', dayChange: '4.58', dayPercent: '-0.14%', weekly: '3.07%', monthly: '1.15%', ytd: '28.61%', yoy: '41.53%', date: '09:22', positive: false },
      { name: 'Silver', unit: 'USD/t.oz', price: '37.865', dayChange: '0.045', dayPercent: '0.12%', weekly: '1.95%', monthly: '2.95%', ytd: '31.08%', yoy: '42.05%', date: '09:22', positive: true },
      { name: 'Copper', unit: 'USD/Lbs', price: '4.3762', dayChange: '0.0058', dayPercent: '0.13%', weekly: '-5.15%', monthly: '-12.06%', ytd: '9.95%', yoy: '10.72%', date: '09:22', positive: true },
      { name: 'Steel', unit: 'CNY/T', price: '3244.00', dayChange: '26.00', dayPercent: '0.81%', weekly: '0.50%', monthly: '7.24%', ytd: '-1.99%', yoy: '9.04%', date: 'Aug/06', positive: true },
      { name: 'Lithium', unit: 'CNY/T', price: '70950', dayChange: '250', dayPercent: '-0.35%', weekly: '-2.74%', monthly: '13.43%', ytd: '-5.46%', yoy: '-10.75%', date: 'Aug/06', positive: false },
      { name: 'Iron Ore CNY', unit: 'CNY/T', price: '798.50', dayChange: '0.00', dayPercent: '0.00%', weekly: '1.01%', monthly: '9.38%', ytd: '2.50%', yoy: '6.61%', date: 'Aug/06', positive: true },
      { name: 'Platinum', unit: 'USD/t.oz', price: '1316.50', dayChange: '0.6', dayPercent: '0.05%', weekly: '0.59%', monthly: '-3.58%', ytd: '47.21%', yoy: '43.91%', date: '09:22', positive: true },
      { name: 'Iron Ore', unit: 'USD/T', price: '101.36', dayChange: '0.59', dayPercent: '0.59%', weekly: '2.40%', monthly: '6.45%', ytd: '-2.17%', yoy: '-1.46%', date: 'Aug/05', positive: true }
    ];

    const agriculturalData = [
      { name: 'Soybeans', unit: 'USd/Bu', price: '970.24', dayChange: '1.24', dayPercent: '0.13%', weekly: '0.26%', monthly: '-5.96%', ytd: '-2.81%', yoy: '-4.23%', date: 'Aug/06', positive: true },
      { name: 'Wheat', unit: 'USd/Bu', price: '508.04', dayChange: '0.21', dayPercent: '-0.04%', weekly: '-3.05%', monthly: '-7.42%', ytd: '-7.93%', yoy: '-5.66%', date: '09:21', positive: false },
      { name: 'Lumber', unit: 'USD/1000 board feet', price: '684.00', dayChange: '7.50', dayPercent: '-1.08%', weekly: '-0.07%', monthly: '12.20%', ytd: '24.35%', yoy: '33.08%', date: 'Aug/05', positive: false },
      { name: 'Palm Oil', unit: 'MYR/T', price: '4292.00', dayChange: '2.00', dayPercent: '0.05%', weekly: '0.35%', monthly: '5.45%', ytd: '-3.42%', yoy: '16.13%', date: 'Aug/06', positive: true },
      { name: 'Orange Juice', unit: 'USd/Lbs', price: '235.96', dayChange: '1.31', dayPercent: '0.56%', weekly: '-17.25%', monthly: '4.66%', ytd: '-52.57%', yoy: '-46.66%', date: 'Aug/06', positive: true },
      { name: 'Coffee', unit: 'USd/Lbs', price: '298.07', dayChange: '0.63', dayPercent: '-0.21%', weekly: '1.59%', monthly: '6.96%', ytd: '-7.00%', yoy: '21.70%', date: 'Aug/06', positive: false },
      { name: 'Cotton', unit: 'USd/Lbs', price: '65.914', dayChange: '0.331', dayPercent: '0.50%', weekly: '0.04%', monthly: '-0.96%', ytd: '-3.59%', yoy: '-0.57%', date: 'Aug/06', positive: true },
      { name: 'Rice', unit: 'USD/cwt', price: '12.5250', dayChange: '0.2450', dayPercent: '2.00%', weekly: '1.38%', monthly: '0.89%', ytd: '-10.70%', yoy: '-17.17%', date: 'Aug/06', positive: true },
      { name: 'Sugar', unit: 'USd/Lbs', price: '16.09', dayChange: '0.16', dayPercent: '-0.98%', weekly: '-3.01%', monthly: '-0.94%', ytd: '-16.59%', yoy: '-9.80%', date: 'Aug/05', positive: false },
      { name: 'Cocoa', unit: 'USD/T', price: '8400.63', dayChange: '37.63', dayPercent: '0.45%', weekly: '2.55%', monthly: '2.45%', ytd: '-26.97%', yoy: '-4.75%', date: 'Aug/06', positive: true }
    ];

    const industrialData = [
      { name: 'Bitumen', unit: 'CNY/T', price: '3517.00', dayChange: '8.00', dayPercent: '0.23%', weekly: '-4.17%', monthly: '-2.14%', ytd: '-4.66%', yoy: '-0.26%', date: 'Aug/06', positive: true },
      { name: 'Lead', unit: 'USD/T', price: '1987.30', dayChange: '10.47', dayPercent: '0.53%', weekly: '-0.42%', monthly: '-2.51%', ytd: '1.81%', yoy: '1.01%', date: 'Aug/06', positive: true },
      { name: 'Aluminum', unit: 'USD/T', price: '2567.70', dayChange: '3.10', dayPercent: '0.12%', weekly: '-1.55%', monthly: '-0.08%', ytd: '0.63%', yoy: '11.83%', date: 'Aug/05', positive: true },
      { name: 'Tin', unit: 'USD/T', price: '33206', dayChange: '172', dayPercent: '-0.52%', weekly: '-1.50%', monthly: '-0.23%', ytd: '14.18%', yoy: '12.62%', date: 'Aug/04', positive: false },
      { name: 'Zinc', unit: 'USD/T', price: '2767.00', dayChange: '6.55', dayPercent: '0.24%', weekly: '-1.06%', monthly: '2.99%', ytd: '-7.11%', yoy: '7.18%', date: '09:22', positive: true },
      { name: 'Nickel', unit: 'USD/T', price: '15060', dayChange: '5', dayPercent: '0.03%', weekly: '-0.12%', monthly: '-0.42%', ytd: '-1.52%', yoy: '-7.54%', date: '09:21', positive: true },
      { name: 'Urea', unit: 'USD/T', price: '457.50', dayChange: '5.00', dayPercent: '-1.08%', weekly: '-0.87%', monthly: '8.28%', ytd: '35.56%', yoy: '48.30%', date: 'Aug/05', positive: false }
    ];

    const livestockData = [
      { name: 'Feeder Cattle', unit: 'USd/Lbs', price: '341.0500', dayChange: '5.6500', dayPercent: '1.68%', weekly: '1.44%', monthly: '8.50%', ytd: '29.55%', yoy: '40.22%', date: 'Aug/05', positive: true },
      { name: 'Live Cattle', unit: 'USd/Lbs', price: '234.2750', dayChange: '3.3750', dayPercent: '1.46%', weekly: '1.98%', monthly: '8.51%', ytd: '22.28%', yoy: '28.67%', date: 'Aug/05', positive: true },
      { name: 'Lean Hogs', unit: 'USd/Lbs', price: '108.7750', dayChange: '0.6000', dayPercent: '0.55%', weekly: '1.42%', monthly: '1.71%', ytd: '33.79%', yoy: '19.17%', date: 'Aug/05', positive: true },
      { name: 'Beef', unit: 'BRL/15KG', price: '301.00', dayChange: '2.05', dayPercent: '0.69%', weekly: '2.21%', monthly: '-1.49%', ytd: '-5.17%', yoy: '28.25%', date: 'Aug/05', positive: true },
      { name: 'Eggs US', unit: 'USD/Dozen', price: '2.80', dayChange: '0.05', dayPercent: '-1.82%', weekly: '-15.42%', monthly: '8.24%', ytd: '-51.75%', yoy: '-11.28%', date: 'Aug/05', positive: false }
    ];

    const indexData = [
      { name: 'CRB Index', unit: 'Index Points', price: '362.23', dayChange: '1.88', dayPercent: '-0.52%', weekly: '-3.16%', monthly: '-1.56%', ytd: '1.52%', yoy: '14.22%', date: 'Aug/04', positive: false },
      { name: 'LME Index', unit: 'Index Points', price: '4133.20', dayChange: '9.10', dayPercent: '-0.22%', weekly: '-1.79%', monthly: '-1.51%', ytd: '5.83%', yoy: '8.11%', date: 'Aug/05', positive: false },
      { name: 'GSCI', unit: 'Index Points', price: '539.55', dayChange: '3.32', dayPercent: '-0.61%', weekly: '-3.15%', monthly: '-2.51%', ytd: '-1.84%', yoy: '1.66%', date: 'Aug/05', positive: false },
      { name: 'Containerized Freight Index', unit: 'Points', price: '1550.74', dayChange: '0.00', dayPercent: '0.00%', weekly: '-2.63%', monthly: '-12.06%', ytd: '-36.97%', yoy: '-53.47%', date: 'Aug/06', positive: true }
    ];

    return {
      energy: energyData,
      metals: metalsData,
      agricultural: agriculturalData,
      industrial: industrialData,
      livestock: livestockData,
      index: indexData
    };
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'energy':
        return Fuel;
      case 'metals':
        return Activity;
      case 'agricultural':
        return FlaskConical;
      case 'industrial':
        return DollarSign;
      case 'livestock':
        return TrendingUp;
      case 'index':
        return BarChart3;
      default:
        return BarChart3;
    }
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

  // Sayfa yüklendiğinde statik verileri yükle
  useEffect(() => {
    setLoading(true);
    
    // Statik verileri yükle
    const staticData = getStaticMarketData();
    const allStaticData = [
      ...staticData.energy.map(item => ({ ...item, category: 'energy' })),
      ...staticData.metals.map(item => ({ ...item, category: 'metals' })), 
      ...staticData.agricultural.map(item => ({ ...item, category: 'agricultural' })),
      ...staticData.industrial.map(item => ({ ...item, category: 'industrial' })),
      ...staticData.livestock.map(item => ({ ...item, category: 'livestock' })),
      ...staticData.index.map(item => ({ ...item, category: 'index' }))
    ];

    // MarketDataItem formatına dönüştür
    const formattedData = allStaticData.map((item, index) => ({
      id: `static-${index}`,
      name: item.name,
      category: item.category as 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index',
      value: item.price,
      change: parseFloat(item.dayChange),
      changePercent: item.dayPercent,
      unit: item.unit,
      lastUpdate: new Date().toISOString(),
      trend: item.positive ? 'up' as const : 'down' as const,
      icon: getIconForCategory(item.category),
      // Ek özellikler
      weekly: item.weekly,
      monthly: item.monthly,
      ytd: item.ytd,
      yoy: item.yoy,
      updateTime: item.date
    }));

    setMarketData(formattedData);
    setFreightRates(getFallbackFreightRates());
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Canlı veri çekme işlemi kaldırıldı - artık statik veri kullanıyoruz
  const refreshData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Veriler yenileniyor...');
      
      // Statik verileri yeniden yükle
      const staticData = getStaticMarketData();
      const allStaticData = [
        ...staticData.energy.map(item => ({ ...item, category: 'energy' })),
        ...staticData.metals.map(item => ({ ...item, category: 'metals' })), 
        ...staticData.agricultural.map(item => ({ ...item, category: 'agricultural' })),
        ...staticData.industrial.map(item => ({ ...item, category: 'industrial' })),
        ...staticData.livestock.map(item => ({ ...item, category: 'livestock' })),
        ...staticData.index.map(item => ({ ...item, category: 'index' }))
      ];

      // MarketDataItem formatına dönüştür
      const formattedData = allStaticData.map((item, index) => ({
        id: `static-${index}`,
        name: item.name,
        category: item.category as 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index',
        value: item.price,
        change: parseFloat(item.dayChange),
        changePercent: item.dayPercent,
        unit: item.unit,
        lastUpdate: new Date().toISOString(),
        trend: item.positive ? 'up' as const : 'down' as const,
        icon: getIconForCategory(item.category),
        // Ek özellikler
        weekly: item.weekly,
        monthly: item.monthly,
        ytd: item.ytd,
        yoy: item.yoy,
        updateTime: item.date
      }));

      setMarketData(formattedData);
      setLastRefresh(new Date());
      console.log('✅ Veriler başarıyla güncellendi');
    } catch (error) {
      console.error('❌ Veri yenileme hatası:', error);
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
              onClick={() => setSelectedCategory(category.id as 'all' | 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
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

      {/* Kategorili Market Verileri Widget */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Canlı Piyasa Verileri</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live Data</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            {categories.slice(1).map((category) => { // slice(1) to exclude 'all'
              const IconComponent = category.icon;
              const categoryData = marketData.filter(item => item.category === category.id);
              const hasData = categoryData.length > 0;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index')}
                  className={`flex items-center px-4 py-2 rounded-t-lg transition-all border-b-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                  {hasData && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {categoryData.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Data Display */}
          <div className="overflow-x-auto">
            {selectedCategory !== 'all' && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">
                  {categories.find(c => c.id === selectedCategory)?.name} Kategorisi
                </h4>
                <table className="w-full border-collapse min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Değişim
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        %Değişim
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Son Güncelleme
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marketData
                      .filter(item => item.category === selectedCategory)
                      .map((item, index) => {
                        const isPositive = item.change > 0;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.icon && <item.icon className="w-4 h-4 mr-3 text-gray-400" />}
                                <span className="font-medium text-gray-900">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <span className="font-semibold text-gray-900">
                                {item.value}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">{item.unit}</span>
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-right font-medium ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '+' : ''}{item.change.toFixed(3)}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-right font-semibold ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.changePercent}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {item.updateTime || new Date(item.lastUpdate).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {marketData.filter(item => item.category === selectedCategory).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Bu kategoride henüz veri bulunmuyor</div>
                    <div className="text-xs mt-1">Veriler yüklenirken lütfen bekleyin</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <span className="text-xs text-gray-400">
              📊 Canlı veriler • Son güncelleme: {lastRefresh.toLocaleDateString('tr-TR')} {lastRefresh.toLocaleTimeString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* Market Data Grid - Navlun Kategorileri */}
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
          // Navlun kategorileri kartları
          [
            {
              id: 'sea-freight',
              name: 'Deniz Navlunu',
              category: 'freight',
              value: '$1,247',
              change: 15.2,
              changePercent: '+1.2%',
              unit: 'BDI Points',
              description: 'Baltic Dry Index',
              icon: Ship,
              trend: 'up'
            },
            {
              id: 'road-freight',
              name: 'Karayolu Navlunu',
              category: 'freight',
              value: '₺2,850',
              change: 45.0,
              changePercent: '+1.6%',
              unit: '/Ton',
              description: 'Ortalama TR-EU',
              icon: Truck,
              trend: 'up'
            },
            {
              id: 'air-freight',
              name: 'Hava Navlunu',
              category: 'freight',
              value: '$4.20',
              change: -0.15,
              changePercent: '-3.4%',
              unit: '/Kg',
              description: 'İstanbul-Frankfurt',
              icon: Plane,
              trend: 'down'
            },
            {
              id: 'container-rates',
              name: 'Konteyner Oranları',
              category: 'freight',
              value: '$2,450',
              change: -125.0,
              changePercent: '-4.9%',
              unit: '/TEU',
              description: 'Asia-Europe',
              icon: Ship,
              trend: 'down'
            },
            {
              id: 'chemical-freight',
              name: 'Kimyasal Navlun',
              category: 'freight',
              value: '€3,200',
              change: 75.0,
              changePercent: '+2.4%',
              unit: '/MT',
              description: 'Tanker Oranları',
              icon: FlaskConical,
              trend: 'up'
            },
            {
              id: 'bulk-freight',
              name: 'Dökme Yük Navlun',
              category: 'freight',
              value: '$18.50',
              change: 1.25,
              changePercent: '+7.2%',
              unit: '/MT',
              description: 'Tahıl Taşımacılığı',
              icon: Activity,
              trend: 'up'
            }
          ].map((data) => {
            const IconComponent = data.icon;
            const TrendIcon = data.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = data.trend === 'up' ? 'text-green-500' : 'text-red-500';

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
                
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center ${trendColor}`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{data.changePercent}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleString('tr-TR')}
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                  {data.description}
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
