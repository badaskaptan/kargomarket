import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Globe,
  Target,
  Users,
  Truck,
  Ship,
  Plane,
  Train,
  Filter,
  Download,
  Info,
  Activity
} from 'lucide-react';

interface StatisticsData {
  transportModes: {
    name: string;
    percentage: number;
    growth: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  regionalData: {
    region: string;
    volume: number;
    growth: number;
    routes: number;
  }[];
  monthlyGrowth: {
    month: string;
    value: number;
    year: number;
  }[];
  topRoutes: {
    from: string;
    to: string;
    volume: number;
    growth: number;
    transportMode: string;
  }[];
  cargoTypes: {
    type: string;
    volume: number;
    percentage: number;
    growth: number;
  }[];
}

interface StatisticsPageProps {
  setActivePage?: (page: string) => void;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ setActivePage }) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'transport' | 'regional' | 'routes' | 'cargo'>('overview');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const viewOptions = [
    { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
    { id: 'transport', name: 'Taşıma Türleri', icon: Truck },
    { id: 'regional', name: 'Bölgesel Analiz', icon: Globe },
    { id: 'routes', name: 'Popüler Rotalar', icon: Target },
    { id: 'cargo', name: 'Yük Türleri', icon: Activity }
  ];

  // Mock data - gerçek istatistik API'sı ile değiştirilecek
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setData({
          transportModes: [
            { name: 'Karayolu', percentage: 45, growth: 8.2, color: 'bg-blue-500', icon: Truck },
            { name: 'Deniz Yolu', percentage: 28, growth: 12.5, color: 'bg-cyan-500', icon: Ship },
            { name: 'Havayolu', percentage: 18, growth: -2.1, color: 'bg-purple-500', icon: Plane },
            { name: 'Demiryolu', percentage: 9, growth: 15.3, color: 'bg-green-500', icon: Train }
          ],
          regionalData: [
            { region: 'Avrupa', volume: 2840000, growth: 15.2, routes: 145 },
            { region: 'Asya', volume: 1980000, growth: 22.8, routes: 89 },
            { region: 'Ortadoğu', volume: 1250000, growth: 8.4, routes: 67 },
            { region: 'Afrika', volume: 780000, growth: 18.7, routes: 34 },
            { region: 'Amerika', volume: 650000, growth: 5.9, routes: 28 }
          ],
          monthlyGrowth: [
            { month: 'Ocak', value: 2.8, year: 2025 },
            { month: 'Şubat', value: 4.2, year: 2025 },
            { month: 'Mart', value: 6.1, year: 2025 },
            { month: 'Nisan', value: 5.7, year: 2025 },
            { month: 'Mayıs', value: 8.3, year: 2025 },
            { month: 'Haziran', value: 9.2, year: 2025 },
            { month: 'Temmuz', value: 11.5, year: 2025 },
            { month: 'Ağustos', value: 12.8, year: 2025 }
          ],
          topRoutes: [
            { from: 'İstanbul', to: 'Berlin', volume: 145000, growth: 18.5, transportMode: 'Karayolu' },
            { from: 'İzmir', to: 'Rotterdam', volume: 98000, growth: 12.3, transportMode: 'Deniz' },
            { from: 'Ankara', to: 'Viyana', volume: 87000, growth: 15.7, transportMode: 'Karayolu' },
            { from: 'Antalya', to: 'Milano', volume: 76000, growth: 8.9, transportMode: 'Karayolu' },
            { from: 'Trabzon', to: 'Kiev', volume: 54000, growth: 22.1, transportMode: 'Deniz' }
          ],
          cargoTypes: [
            { type: 'Otomotiv Parçaları', volume: 1240000, percentage: 22.4, growth: 14.2 },
            { type: 'Tekstil Ürünleri', volume: 980000, percentage: 17.7, growth: 8.9 },
            { type: 'Gıda Ürünleri', volume: 870000, percentage: 15.7, growth: 11.3 },
            { type: 'Elektronik', volume: 650000, percentage: 11.7, growth: 18.5 },
            { type: 'İnşaat Malzemeleri', volume: 580000, percentage: 10.5, growth: 6.2 },
            { type: 'Kimyasal Ürünler', volume: 420000, percentage: 7.6, growth: 9.8 },
            { type: 'Makine ve Ekipman', volume: 380000, percentage: 6.9, growth: 12.7 },
            { type: 'Diğer', volume: 430000, percentage: 7.8, growth: 5.4 }
          ]
        });
        
        setLoading(false);
      }, 1000);
    };

    fetchStatistics();
  }, [selectedYear]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!data) return null;

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
                <h1 className="text-3xl font-bold text-gray-900">Sektörel İstatistikler</h1>
                <p className="text-gray-600 mt-1">Türkiye lojistik sektörü analiz ve raporları</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                PDF İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Analiz Görünümü</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedView(option.id as typeof selectedView)}
                className={`flex items-center p-3 rounded-lg text-left transition-colors ${
                  selectedView === option.id
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <option.icon className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Hacim</p>
                  <p className="text-2xl font-bold text-gray-900">5.5M Ton</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.4%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Rotalar</p>
                  <p className="text-2xl font-bold text-gray-900">363</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.7%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ortalama Büyüme</p>
                  <p className="text-2xl font-bold text-gray-900">11.2%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Şirketler</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transport Modes */}
        {(selectedView === 'overview' || selectedView === 'transport') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Taşıma Türleri Dağılımı</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {data.transportModes.map((mode, index) => {
                  const Icon = mode.icon;
                  const GrowthIcon = getGrowthIcon(mode.growth);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${mode.color} rounded-lg flex items-center justify-center mr-4`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{mode.name}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-600 mr-2">{mode.percentage}%</span>
                            <span className={`text-sm flex items-center ${getGrowthColor(mode.growth)}`}>
                              <GrowthIcon className="w-3 h-3 mr-1" />
                              {Math.abs(mode.growth)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${mode.color}`}
                          style={{ width: `${mode.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="3"/>
                    {data.transportModes.map((mode, index) => {
                      const offset = data.transportModes.slice(0, index).reduce((sum, m) => sum + m.percentage, 0);
                      return (
                        <circle
                          key={index}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={mode.color.replace('bg-', '').replace('-500', '')}
                          strokeWidth="3"
                          strokeDasharray={`${mode.percentage} ${100 - mode.percentage}`}
                          strokeDashoffset={`${-(offset)}`}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">100%</div>
                      <div className="text-sm text-gray-600">Toplam</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regional Data */}
        {(selectedView === 'overview' || selectedView === 'regional') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Bölgesel Analiz</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hacim (Ton)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Büyüme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Rotalar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.regionalData.map((region, index) => {
                    const GrowthIcon = getGrowthIcon(region.growth);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{region.region}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(region.volume)} Ton
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm flex items-center ${getGrowthColor(region.growth)}`}>
                            <GrowthIcon className="w-4 h-4 mr-1" />
                            {Math.abs(region.growth)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {region.routes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Routes */}
        {(selectedView === 'overview' || selectedView === 'routes') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">En Popüler Rotalar</h3>
            <div className="space-y-4">
              {data.topRoutes.map((route, index) => {
                const GrowthIcon = getGrowthIcon(route.growth);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{route.from} → {route.to}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-600 mr-3">{route.transportMode}</span>
                          <span className="text-sm text-gray-500">{formatNumber(route.volume)} Ton</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm flex items-center justify-end ${getGrowthColor(route.growth)}`}>
                        <GrowthIcon className="w-4 h-4 mr-1" />
                        {Math.abs(route.growth)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cargo Types */}
        {(selectedView === 'overview' || selectedView === 'cargo') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">En Çok Taşınan Yük Türleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.cargoTypes.map((cargo, index) => {
                const GrowthIcon = getGrowthIcon(cargo.growth);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{cargo.type}</h4>
                        <span className="text-sm text-gray-600">{cargo.percentage}%</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{formatNumber(cargo.volume)} Ton</span>
                        <span className={`text-sm flex items-center ${getGrowthColor(cargo.growth)}`}>
                          <GrowthIcon className="w-3 h-3 mr-1" />
                          {Math.abs(cargo.growth)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                          style={{ width: `${cargo.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Veri Kaynakları</h4>
              <p className="text-sm text-blue-700">
                Bu istatistikler TOBB, UND, TÜİK ve uluslararası lojistik kuruluşlarının verilerinden derlenmiştir. 
                Veriler aylık olarak güncellenmektedir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
