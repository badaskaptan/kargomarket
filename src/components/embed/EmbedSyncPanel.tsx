import React, { useState, useEffect } from 'react';
import { useEmbedSync } from '../../hooks/useEmbedSync';
import { useMarketData } from '../../hooks/useMarketData';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Database,
  Link
} from 'lucide-react';

interface EmbedSyncPanelProps {
  className?: string;
  embedId?: string;
  autoSync?: boolean;
  syncInterval?: number; // dakika
}

const EmbedSyncPanel: React.FC<EmbedSyncPanelProps> = ({
  className = '',
  embedId,
  autoSync = false,
  syncInterval = 30 // 30 dakika
}) => {
  const { 
    loading: syncLoading, 
    error: syncError, 
    lastSyncResult,
    syncEmbed,
    syncAllEmbeds,
    clearError
  } = useEmbedSync();

  const { data: marketData, lastUpdate } = useMarketData();
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0
  });

  // Otomatik sync
  useEffect(() => {
    if (autoSync && embedId) {
      const handleAutoSync = async () => {
        await syncEmbed(embedId);
      };

      const interval = setInterval(handleAutoSync, syncInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoSync, embedId, syncInterval, syncEmbed]);

  // Sync sonuçlarını takip et
  useEffect(() => {
    if (lastSyncResult) {
      setLastSyncTime(new Date(lastSyncResult.timestamp));
      setSyncStats(prev => ({
        totalSyncs: prev.totalSyncs + 1,
        successfulSyncs: prev.successfulSyncs + (lastSyncResult.success ? 1 : 0),
        failedSyncs: prev.failedSyncs + (lastSyncResult.success ? 0 : 1)
      }));
    }
  }, [lastSyncResult]);

  const handleSyncEmbed = async () => {
    if (embedId) {
      await syncEmbed(embedId);
    }
  };

  const handleSyncAll = async () => {
    await syncAllEmbeds();
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Link className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Embed Data Sync</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {autoSync && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Auto Sync: {syncInterval}dk
            </span>
          )}
          
          {lastSyncTime && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {lastSyncTime.toLocaleString('tr-TR')}
            </div>
          )}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSyncEmbed}
          disabled={syncLoading || !embedId}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {syncLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <RotateCcw className="w-5 h-5" />
          )}
          <span>Bu Embed'i Sync Et</span>
        </button>

        <button
          onClick={handleSyncAll}
          disabled={syncLoading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {syncLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Database className="w-5 h-5" />
          )}
          <span>Tüm Embed'leri Sync Et</span>
        </button>
      </div>

      {/* Error Display */}
      {syncError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Sync Hatası</p>
            <p className="text-red-600 text-sm">{syncError}</p>
            <button
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Hatayı Temizle
            </button>
          </div>
        </div>
      )}

      {/* Sync Result */}
      {lastSyncResult && (
        <div className={`mb-4 p-4 rounded-lg flex items-start space-x-2 ${
          lastSyncResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {lastSyncResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              lastSyncResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {lastSyncResult.success ? 'Sync Başarılı' : 'Sync Başarısız'}
            </p>
            <p className={`text-sm ${
              lastSyncResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {lastSyncResult.updatedItems} item güncellendi
            </p>
            {lastSyncResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">Hatalar:</p>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {lastSyncResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{syncStats.totalSyncs}</div>
          <div className="text-sm text-gray-600">Toplam Sync</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{syncStats.successfulSyncs}</div>
          <div className="text-sm text-gray-600">Başarılı</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{syncStats.failedSyncs}</div>
          <div className="text-sm text-gray-600">Başarısız</div>
        </div>
      </div>

      {/* Market Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Mevcut Market Data</h4>
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {marketData.slice(0, 5).map((item) => (
            <div key={item.id} className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-gray-600">{item.value}</div>
              <div className={`text-xs ${
                item.trend === 'up' ? 'text-green-600' : 
                item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.changePercent}
              </div>
            </div>
          ))}
        </div>
        
        {lastUpdate && (
          <div className="mt-3 text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Nasıl Çalışır?</p>
          <p>Embed içeriğindeki piyasa verileri analiz edilir ve benzer market data itemları otomatik olarak güncellenir. 
          Döviz kurları, emtia fiyatları ve endeks değerleri senkronize edilir.</p>
        </div>
      </div>
    </div>
  );
};

export default EmbedSyncPanel;
