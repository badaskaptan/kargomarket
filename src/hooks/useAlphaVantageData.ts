// Alpha Vantage API verilerini kullanan React hook
import { useState, useEffect } from 'react';
import { getCachedMarketData } from '../services/alphaVantageService';
import type { MarketData, ForexData } from '../services/alphaVantageService';

interface UseMarketDataReturn {
  forex: ForexData[];
  shipping: MarketData[];
  commodities: MarketData[];
  indices: MarketData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string;
  refresh: () => void;
}

export function useAlphaVantageData(): UseMarketDataReturn {
  const [data, setData] = useState({
    forex: [] as ForexData[],
    shipping: [] as MarketData[],
    commodities: [] as MarketData[],
    indices: [] as MarketData[],
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const marketData = await getCachedMarketData();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri çekme hatası');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Her 2 dakikada bir otomatik güncelleme
    const interval = setInterval(fetchData, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    loading,
    error,
    refresh: fetchData
  };
}

// Formatted display için utility fonksiyonlar
export function formatPrice(price: number, decimals = 2): string {
  return price.toFixed(decimals);
}

export function formatChange(change: number, decimals = 2): string {
  const formatted = change.toFixed(decimals);
  return change >= 0 ? `+${formatted}` : formatted;
}

export function formatPercentage(percent: number, decimals = 2): string {
  const formatted = percent.toFixed(decimals);
  return `${percent >= 0 ? '+' : ''}${formatted}%`;
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
}
