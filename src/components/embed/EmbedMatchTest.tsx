import React, { useState } from 'react';
import { useEmbedSync } from '../../hooks/useEmbedSync';
import { useMarketData } from '../../hooks/useMarketData';
import { MarketDataItem } from '../../services/marketDataService';
import { Search, Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface EmbedMatchTestProps {
  className?: string;
}

const EmbedMatchTest: React.FC<EmbedMatchTestProps> = ({ className = '' }) => {
  const { findSimilarItems, loading } = useEmbedSync();
  const { data: marketData } = useMarketData();
  
  const [testContent, setTestContent] = useState(`
Bugünkü piyasa durumu:
USD/TRY 27.48 (+0.8%)
EUR/TRY 29.85 (-0.5%) 
Brent Petrol $68.39
Altın $1950.00 
Baltic Dry Index 1247 points (+1.2%)
Dolar yükselişte, Euro düşüşte.
  `.trim());
  
  const [matchResults, setMatchResults] = useState<MarketDataItem[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    try {
      setTestStatus('testing');
      
      const embedData = {
        id: 'test-embed',
        title: 'Test Embed',
        content: testContent,
        embed_data: {
          market_data: [
            { symbol: 'USD/TRY', value: 27.48, change: 0.22, changePercent: '+0.8%', timestamp: new Date().toISOString() },
            { symbol: 'EUR/TRY', value: 29.85, change: -0.15, changePercent: '-0.5%', timestamp: new Date().toISOString() },
            { symbol: 'BRENT', value: 68.39, change: 0.0, changePercent: '+0.0%', timestamp: new Date().toISOString() }
          ],
          currency_rates: [
            { from: 'USD', to: 'TRY', rate: 27.48, change: 0.22 },
            { from: 'EUR', to: 'TRY', rate: 29.85, change: -0.15 }
          ]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const results = await findSimilarItems(embedData);
      setMatchResults(results);
      setTestStatus(results.length > 0 ? 'success' : 'error');
    } catch (error) {
      console.error('Test error:', error);
      setTestStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <Search className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case 'testing':
        return 'Eşleştirme yapılıyor...';
      case 'success':
        return `${matchResults.length} eşleşme bulundu`;
      case 'error':
        return 'Eşleşme bulunamadı';
      default:
        return 'Test başlatılmadı';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Embed Eşleştirme Testi</h3>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          {getStatusIcon()}
          <span className={`${
            testStatus === 'success' ? 'text-green-600' :
            testStatus === 'error' ? 'text-red-600' :
            testStatus === 'testing' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Test İçeriği */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test İçeriği
        </label>
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          placeholder="Piyasa verilerini içeren metin girin..."
        />
      </div>

      {/* Test Butonu */}
      <button
        onClick={handleTest}
        disabled={loading || !testContent.trim()}
        className="w-full mb-6 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <Search className="w-5 h-5 animate-spin" />
        ) : (
          <Target className="w-5 h-5" />
        )}
        <span>Eşleştirme Testini Başlat</span>
      </button>

      {/* Mevcut Market Data */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Mevcut Market Data ({marketData.length} item)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {marketData.slice(0, 6).map((item) => (
            <div key={item.id} className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-gray-600">{item.value} {item.unit}</div>
              <div className="text-xs text-gray-500">ID: {item.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Eşleştirme Sonuçları */}
      {matchResults.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Eşleşen Itemlar ({matchResults.length})
          </h4>
          
          <div className="space-y-3">
            {matchResults.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white p-3 rounded border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Değer: {item.value} {item.unit}
                    </div>
                    <div className="text-sm text-gray-600">
                      Değişim: {item.changePercent}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {item.id} | Kategori: {item.category}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600">
                      {item.source || 'Unknown Source'}
                    </div>
                    {item.matchScore && (
                      <div className="text-xs text-gray-500">
                        Skor: {(item.matchScore * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Sonucu Boş */}
      {testStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <XCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">Hiç eşleşme bulunamadı</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            İçerikte tanınabilir piyasa verisi bulunamadı. Daha spesifik terimler kullanmayı deneyin.
          </p>
        </div>
      )}

      {/* Bilgilendirme */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-1">Test Nasıl Çalışır?</h5>
        <p className="text-blue-700 text-sm">
          Sistem, girdiğiniz metni analiz ederek içindeki piyasa verilerini (döviz kurları, emtia fiyatları, 
          endeks değerleri) çıkarır ve mevcut market data ile eşleştirir. Eşleştirme algoritması:
        </p>
        <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
          <li>Tam sembol eşleştirme (USD/TRY gibi)</li>
          <li>Anahtar kelime analizi</li>
          <li>Sayısal değer karşılaştırması</li>
          <li>Fuzzy matching (bulanık eşleştirme)</li>
        </ul>
      </div>
    </div>
  );
};

export default EmbedMatchTest;
