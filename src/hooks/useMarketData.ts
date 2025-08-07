import { useState, useEffect, useCallback } from 'react';
import { MarketDataService, MarketDataItem } from '../services/marketDataService';

interface UseMarketDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milisaniye
  categories?: ('currency' | 'fuel' | 'freight' | 'commodity' | 'index')[];
}

export const useMarketData = (options: UseMarketDataOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 dakika
    categories
  } = options;

  const [data, setData] = useState<MarketDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const marketData = await MarketDataService.getMarketData();
      
      // Kategori filtresi uygula
      const filteredData = categories 
        ? marketData.filter(item => categories.includes(item.category))
        : marketData;
      
      setData(filteredData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  // Belirli bir sembol için veri al
  const getItemBySymbol = useCallback((symbol: string): MarketDataItem | undefined => {
    return data.find(item => item.id === symbol || item.name === symbol);
  }, [data]);

  // Kategori bazında veri al
  const getItemsByCategory = useCallback((category: string): MarketDataItem[] => {
    return data.filter(item => item.category === category);
  }, [data]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    getItemBySymbol,
    getItemsByCategory
  };
};

// Özel hook'lar
export const useCurrencyRates = () => {
  return useMarketData({ categories: ['currency'] });
};

export const useFuelPrices = () => {
  return useMarketData({ categories: ['fuel'] });
};

export const useFreightIndices = () => {
  return useMarketData({ categories: ['freight'] });
};

export const useCommodityPrices = () => {
  return useMarketData({ categories: ['commodity'] });
};
