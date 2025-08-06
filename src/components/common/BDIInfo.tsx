import React from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BDIInfoProps {
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const BDIInfo: React.FC<BDIInfoProps> = ({ value, change, trend }) => {
  const getBDILevel = (val: number) => {
    if (val < 1000) return { level: 'Çok Düşük', color: 'text-red-600', bg: 'bg-red-50' };
    if (val < 1500) return { level: 'Düşük', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (val < 2500) return { level: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (val < 5000) return { level: 'Yüksek', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { level: 'Çok Yüksek', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const numericValue = parseInt(value.replace(/,/g, ''));
  const levelInfo = getBDILevel(numericValue);
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-lg border p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Baltic Dry Index Analizi</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mevcut Seviye */}
        <div className={`p-3 rounded-lg ${levelInfo.bg}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Seviye</span>
            <span className={`text-sm font-semibold ${levelInfo.color}`}>
              {levelInfo.level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <div className="flex items-center gap-1">
              <TrendIcon className={`w-4 h-4 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : 
                change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}
              </span>
            </div>
          </div>
        </div>

        {/* Tarihsel Referans */}
        <div className="p-3 rounded-lg bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">Tarihsel Referans</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>2008 Kriz Öncesi:</span>
              <span className="font-semibold">11,000+</span>
            </div>
            <div className="flex justify-between">
              <span>2020-2023 Ort:</span>
              <span className="font-semibold">1,000-2,500</span>
            </div>
            <div className="flex justify-between">
              <span>COVID Düşük:</span>
              <span className="font-semibold">393 (2020)</span>
            </div>
          </div>
        </div>

        {/* Endeks Açıklaması */}
        <div className="p-3 rounded-lg bg-blue-50">
          <div className="text-sm text-gray-600 mb-1">Ne Anlama Geliyor?</div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>• Dökme kuru yük navlun fiyatları</p>
            <p>• 4 ana gemi tipinin ortalaması</p>
            <p>• Capesize, Panamax, Supramax, Handysize</p>
            <p>• Günlük güncellenir (Baltic Exchange)</p>
          </div>
        </div>
      </div>

      {/* BDI Seviye Göstergesi */}
      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">BDI Seviye Göstergesi</div>
        <div className="relative">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="w-1/5 bg-red-400"></div>
            <div className="w-1/5 bg-yellow-400"></div>
            <div className="w-1/5 bg-green-400"></div>
            <div className="w-1/5 bg-blue-400"></div>
            <div className="w-1/5 bg-purple-400"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>1K</span>
            <span>1.5K</span>
            <span>2.5K</span>
            <span>5K+</span>
          </div>
          {/* Mevcut Pozisyon Göstergesi */}
          <div 
            className={`absolute top-0 w-1 h-2 bg-gray-900 transform -translate-x-1/2`}
            style={{ left: `${Math.min(Math.max((numericValue / 5000) * 100, 0), 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <strong>Not:</strong> Baltic Dry Index, demir cevheri, kömür, tahıl gibi dökme kuru yüklerin 
        deniz taşımacılığındaki navlun fiyatlarını yansıtır. Küresel ticaret hacminin önemli bir göstergesidir.
      </div>
    </div>
  );
};

export default BDIInfo;
