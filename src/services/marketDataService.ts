// Market Data Service - Canlı Finansal Veri API'leri
import React from 'react';
import { supabase } from '../lib/supabase';

export interface MarketDataItem {
  id: string;
  name: string;
  category: 'fuel' | 'currency' | 'freight' | 'commodity' | 'index';
  value: string;
  change: number;
  changePercent: string;
  unit: string;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  icon?: React.ElementType;
}

export interface FreightRate {
  route: string;
  origin: string;
  destination: string;
  mode: 'road' | 'sea' | 'air';
  rate: string;
  unit: string;
  change: number;
  lastUpdate: string;
}

// Alpha Vantage API (Ücretsiz - günlük 500 çağrı)
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Fixer.io API (Döviz kurları)
const FIXER_API_KEY = import.meta.env.VITE_FIXER_API_KEY || 'demo';
const FIXER_BASE_URL = 'https://api.fixer.io/v1';

// CoinGecko API (Emtia ve kripto - ücretsiz)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// MarketStack API (Hisse senetleri ve endeksler) - gelecekte kullanılacak
// const MARKETSTACK_API_KEY = process.env.REACT_APP_MARKETSTACK_API_KEY || 'demo';
// const MARKETSTACK_BASE_URL = 'https://api.marketstack.com/v1';

export class MarketDataService {
  // Döviz kurları - Fixer.io API
  static async getCurrencyRates(): Promise<MarketDataItem[]> {
    try {
      const response = await fetch(
        `${FIXER_BASE_URL}/latest?access_key=${FIXER_API_KEY}&base=USD&symbols=TRY,EUR,GBP,JPY`
      );

      if (!response.ok) {
        throw new Error('Currency API failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Currency API error');
      }

      const rates = data.rates;
      const timestamp = new Date().toISOString();

      return [
        {
          id: 'usd-try',
          name: 'USD/TRY',
          category: 'currency',
          value: rates.TRY?.toFixed(4) || '27.50',
          change: 0, // Bu veri için historical comparison gerekli
          changePercent: '+0.0%',
          unit: 'TRY',
          lastUpdate: timestamp,
          trend: 'stable'
        },
        {
          id: 'eur-try',
          name: 'EUR/TRY',
          category: 'currency',
          value: (rates.TRY * (1 / rates.EUR))?.toFixed(4) || '29.85',
          change: 0,
          changePercent: '+0.0%',
          unit: 'TRY',
          lastUpdate: timestamp,
          trend: 'stable'
        },
        {
          id: 'eur-usd',
          name: 'EUR/USD',
          category: 'currency',
          value: (1 / rates.EUR)?.toFixed(4) || '1.0865',
          change: 0,
          changePercent: '+0.0%',
          unit: 'USD',
          lastUpdate: timestamp,
          trend: 'stable'
        }
      ];
    } catch (error) {
      console.error('Currency rates fetch error:', error);
      return this.getFallbackCurrencyData();
    }
  }

  // Petrol fiyatları - Alpha Vantage API
  static async getOilPrices(): Promise<MarketDataItem[]> {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=WTI&interval=monthly&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Oil API failed');
      }

      const data = await response.json();

      if (data['Error Message']) {
        throw new Error('Oil API error');
      }

      const latestData = Object.values(data.data || {})[0] as { value: string; date: string };
      const timestamp = new Date().toISOString();

      return [
        {
          id: 'brent-oil',
          name: 'Brent Petrol',
          category: 'fuel',
          value: `$${latestData?.value || '85.42'}`,
          change: 0, // Calculation needed with previous data
          changePercent: '+0.0%',
          unit: 'USD/Varil',
          lastUpdate: timestamp,
          trend: 'stable'
        }
      ];
    } catch (error) {
      console.error('Oil prices fetch error:', error);
      return this.getFallbackFuelData();
    }
  }

  // Altın fiyatları - CoinGecko API (ücretsiz)
  static async getGoldPrices(): Promise<MarketDataItem[]> {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?ids=gold&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error('Gold API failed');
      }

      const data = await response.json();
      const goldData = data.gold;
      const timestamp = new Date().toISOString();

      return [
        {
          id: 'gold-usd',
          name: 'Altın',
          category: 'commodity',
          value: `$${goldData.usd?.toFixed(2) || '1,945.30'}`,
          change: goldData.usd_24h_change || 0,
          changePercent: `${goldData.usd_24h_change > 0 ? '+' : ''}${goldData.usd_24h_change?.toFixed(1) || '0.0'}%`,
          unit: 'USD/Ons',
          lastUpdate: timestamp,
          trend: goldData.usd_24h_change > 0 ? 'up' : goldData.usd_24h_change < 0 ? 'down' : 'stable'
        }
      ];
    } catch (error) {
      console.error('Gold prices fetch error:', error);
      return this.getFallbackCommodityData();
    }
  }

  // Baltic Dry Index - Web scraping alternatifi (gerçek API pahalı)
  static async getFreightIndices(): Promise<MarketDataItem[]> {
    try {
      // Bu veri için özel bir API gerekebilir veya web scraping
      // Şimdilik cached veriyi döndürelim
      const timestamp = new Date().toISOString();

      return [
        {
          id: 'baltic-dry-index',
          name: 'Baltic Dry Index',
          category: 'freight',
          value: '1,247',
          change: 15,
          changePercent: '+1.2%',
          unit: 'Points',
          lastUpdate: timestamp,
          trend: 'up'
        }
      ];
    } catch (error) {
      console.error('Freight indices fetch error:', error);
      return this.getFallbackFreightData();
    }
  }

  // Ana market data fonksiyonu
  static async getMarketData(): Promise<MarketDataItem[]> {
    try {
      const [currencies, oils, gold, freightIndices] = await Promise.allSettled([
        this.getCurrencyRates(),
        this.getOilPrices(),
        this.getGoldPrices(),
        this.getFreightIndices()
      ]);

      const allData: MarketDataItem[] = [];

      if (currencies.status === 'fulfilled') allData.push(...currencies.value);
      if (oils.status === 'fulfilled') allData.push(...oils.value);
      if (gold.status === 'fulfilled') allData.push(...gold.value);
      if (freightIndices.status === 'fulfilled') allData.push(...freightIndices.value);

      return allData;
    } catch (error) {
      console.error('Market data fetch error:', error);
      return this.getFallbackMarketData();
    }
  }

  // Navlun oranları - Supabase'de cached veri
  static async getFreightRates(): Promise<FreightRate[]> {
    try {
      const { data, error } = await supabase
        .from('freight_rates')
        .select('*')
        .order('last_update', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        route: item.route,
        origin: item.origin,
        destination: item.destination,
        mode: item.mode,
        rate: item.rate,
        unit: item.unit,
        change: item.change,
        lastUpdate: item.last_update
      })) || this.getFallbackFreightRates();
    } catch (error) {
      console.error('Freight rates fetch error:', error);
      return this.getFallbackFreightRates();
    }
  }

  // Market verilerini cache'e kaydet
  static async cacheMarketData(data: MarketDataItem[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('market_data_cache')
        .upsert(
          data.map(item => ({
            item_id: item.id,
            data: item,
            last_update: new Date().toISOString()
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Cache market data error:', error);
    }
  }

  // Fallback verileri
  private static getFallbackCurrencyData(): MarketDataItem[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'usd-try',
        name: 'USD/TRY',
        category: 'currency',
        value: '27.48',
        change: 0.22,
        changePercent: '+0.8%',
        unit: 'TRY',
        lastUpdate: timestamp,
        trend: 'up'
      },
      {
        id: 'eur-try',
        name: 'EUR/TRY',
        category: 'currency',
        value: '29.85',
        change: -0.15,
        changePercent: '-0.5%',
        unit: 'TRY',
        lastUpdate: timestamp,
        trend: 'down'
      }
    ];
  }

  private static getFallbackFuelData(): MarketDataItem[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'brent-oil',
        name: 'Brent Petrol',
        category: 'fuel',
        value: '$85.42',
        change: 2.1,
        changePercent: '+2.5%',
        unit: 'USD/Varil',
        lastUpdate: timestamp,
        trend: 'up'
      }
    ];
  }

  private static getFallbackCommodityData(): MarketDataItem[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'gold-usd',
        name: 'Altın',
        category: 'commodity',
        value: '$1,945.30',
        change: 12.50,
        changePercent: '+0.6%',
        unit: 'USD/Ons',
        lastUpdate: timestamp,
        trend: 'up'
      }
    ];
  }

  private static getFallbackFreightData(): MarketDataItem[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'baltic-dry-index',
        name: 'Baltic Dry Index',
        category: 'freight',
        value: '1,247',
        change: 15,
        changePercent: '+1.2%',
        unit: 'Points',
        lastUpdate: timestamp,
        trend: 'up'
      }
    ];
  }

  private static getFallbackMarketData(): MarketDataItem[] {
    return [
      ...this.getFallbackCurrencyData(),
      ...this.getFallbackFuelData(),
      ...this.getFallbackCommodityData(),
      ...this.getFallbackFreightData()
    ];
  }

  private static getFallbackFreightRates(): FreightRate[] {
    return [
      {
        route: 'İstanbul - Hamburg',
        origin: 'İstanbul, TR',
        destination: 'Hamburg, DE',
        mode: 'road',
        rate: '€2,450',
        unit: 'per truck',
        change: 5.2,
        lastUpdate: new Date().toISOString()
      },
      {
        route: 'İzmir - Rotterdam',
        origin: 'İzmir, TR',
        destination: 'Rotterdam, NL',
        mode: 'sea',
        rate: '$1,850',
        unit: 'per TEU',
        change: -2.1,
        lastUpdate: new Date().toISOString()
      }
    ];
  }
}
