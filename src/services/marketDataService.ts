// Market Data Service - Canlı Finansal Veri API'leri
import React from 'react';
import { supabase } from '../lib/supabase';

export interface MarketDataItem {
  id: string;
  name: string;
  category: 'fuel' | 'currency' | 'freight' | 'commodity' | 'index' | 'chemical' | 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock';
  value: string;
  change: number;
  changePercent: string;
  unit: string;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  icon?: React.ElementType;
  // Ek özellikler
  weekly?: string;
  monthly?: string;
  ytd?: string;
  yoy?: string;
  updateTime?: string;
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

// API anahtarları
const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY || 'demo';
const TRADING_ECONOMICS_API_KEY = import.meta.env.VITE_TRADING_ECONOMICS_API_KEY || 'demo';
const TRADING_ECONOMICS_BASE_URL = 'https://api.tradingeconomics.com';

export class MarketDataService {
  // Trading Economics API - Gerçek commodity verileri
  static async getTradingEconomicsData(): Promise<MarketDataItem[]> {
    try {
      console.log('📊 Trading Economics API verilerini çekiyor...');
      
      if (TRADING_ECONOMICS_API_KEY === 'demo') {
        console.log('⚠️ Demo modunda - statik veriler kullanılıyor');
        return this.getStaticTradingEconomicsData();
      }

      // Gerçek API çağrısı buraya gelecek
      // Demo mode için statik veri döndürüyoruz
      return this.getStaticTradingEconomicsData();

    } catch (error) {
      console.error('❌ Trading Economics API hatası:', error);
      return this.getStaticTradingEconomicsData();
    }
  }

  // Sembol kategorilendirme
  static categorizeSymbol(symbol: string): 'energy' | 'metals' | 'agricultural' | 'industrial' | 'livestock' | 'index' {
    const energySymbols = ['CRUDE', 'BRENT', 'NGAS', 'GAS', 'COAL', 'TTF', 'UK_GAS'];
    const metalSymbols = ['GOLD', 'SILVER', 'COPPER', 'STEEL', 'LITHIUM', 'IRON', 'PLATINUM'];
    const agriculturalSymbols = ['WHEAT', 'CORN', 'SOYBEAN', 'COFFEE', 'SUGAR', 'COTTON', 'RICE', 'LUMBER', 'PALM', 'ORANGE', 'COCOA'];
    const industrialSymbols = ['BITUMEN', 'LEAD', 'ALUMINUM', 'TIN', 'ZINC', 'NICKEL', 'UREA'];
    const livestockSymbols = ['CATTLE', 'HOGS', 'BEEF', 'EGGS'];
    
    if (energySymbols.some(s => symbol.includes(s))) return 'energy';
    if (metalSymbols.some(s => symbol.includes(s))) return 'metals';
    if (agriculturalSymbols.some(s => symbol.includes(s))) return 'agricultural';
    if (industrialSymbols.some(s => symbol.includes(s))) return 'industrial';
    if (livestockSymbols.some(s => symbol.includes(s))) return 'livestock';
    return 'index';
  }

  // Statik veriler - API erişimi olmadığında fallback
  static getStaticTradingEconomicsData(): MarketDataItem[] {
    return [
      // Energy Data
      { id: 'crude-oil', name: 'Crude Oil', category: 'energy', value: '65.629', change: 0.469, changePercent: '0.72%', unit: 'USD/Bbl', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '-6.30%', monthly: '-3.45%', ytd: '-8.55%', yoy: '-12.82%', updateTime: '09:22' },
      { id: 'brent', name: 'Brent', category: 'energy', value: '68.131', change: 0.491, changePercent: '0.73%', unit: 'USD/Bbl', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '-6.04%', monthly: '-2.14%', ytd: '-8.77%', yoy: '-13.07%', updateTime: '09:21' },
      { id: 'natural-gas', name: 'Natural gas', category: 'energy', value: '2.9676', change: 0.0424, changePercent: '-1.41%', unit: 'USD/MMBtu', lastUpdate: new Date().toISOString(), trend: 'down', weekly: '-2.58%', monthly: '-13.06%', ytd: '-18.35%', yoy: '40.46%', updateTime: '09:22' },
      // Metals Data  
      { id: 'gold', name: 'Gold', category: 'metals', value: '3376.55', change: 4.58, changePercent: '-0.14%', unit: 'USD/t.oz', lastUpdate: new Date().toISOString(), trend: 'down', weekly: '3.07%', monthly: '1.15%', ytd: '28.61%', yoy: '41.53%', updateTime: '09:22' },
      { id: 'silver', name: 'Silver', category: 'metals', value: '37.865', change: 0.045, changePercent: '0.12%', unit: 'USD/t.oz', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '1.95%', monthly: '2.95%', ytd: '31.08%', yoy: '42.05%', updateTime: '09:22' },
      // Agricultural Data
      { id: 'soybeans', name: 'Soybeans', category: 'agricultural', value: '970.24', change: 1.24, changePercent: '0.13%', unit: 'USd/Bu', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '0.26%', monthly: '-5.96%', ytd: '-2.81%', yoy: '-4.23%', updateTime: 'Aug/06' },
      { id: 'wheat', name: 'Wheat', category: 'agricultural', value: '508.04', change: 0.21, changePercent: '-0.04%', unit: 'USd/Bu', lastUpdate: new Date().toISOString(), trend: 'down', weekly: '-3.05%', monthly: '-7.42%', ytd: '-7.93%', yoy: '-5.66%', updateTime: '09:21' },
      // Industrial Data
      { id: 'copper', name: 'Copper', category: 'metals', value: '4.3762', change: 0.0058, changePercent: '0.13%', unit: 'USD/Lbs', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '-5.15%', monthly: '-12.06%', ytd: '9.95%', yoy: '10.72%', updateTime: '09:22' },
      // Livestock Data
      { id: 'cattle', name: 'Live Cattle', category: 'livestock', value: '234.2750', change: 3.3750, changePercent: '1.46%', unit: 'USd/Lbs', lastUpdate: new Date().toISOString(), trend: 'up', weekly: '1.98%', monthly: '8.51%', ytd: '22.28%', yoy: '28.67%', updateTime: 'Aug/05' },
      // Index Data
      { id: 'crb-index', name: 'CRB Index', category: 'index', value: '362.23', change: 1.88, changePercent: '-0.52%', unit: 'Index Points', lastUpdate: new Date().toISOString(), trend: 'down', weekly: '-3.16%', monthly: '-1.56%', ytd: '1.52%', yoy: '14.22%', updateTime: 'Aug/04' }
    ];
  }

  // Freight rates
  static async getFreightRates(): Promise<FreightRate[]> {
    try {
      // Supabase'den navlun verilerini çek
      const { data, error } = await supabase
        .from('freight_rates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Freight rates fetch error:', error);
        return this.getFallbackFreightRates();
      }

      return data?.map((rate: any) => ({
        route: `${rate.origin} - ${rate.destination}`,
        origin: rate.origin,
        destination: rate.destination,
        mode: rate.mode,
        rate: rate.rate,
        unit: rate.unit,
        change: rate.change || 0,
        lastUpdate: rate.created_at
      })) || this.getFallbackFreightRates();

    } catch (error) {
      console.error('Freight rates service error:', error);
      return this.getFallbackFreightRates();
    }
  }

  static getFallbackFreightRates(): FreightRate[] {
    return [
      {
        route: 'İstanbul - Hamburg',
        origin: 'İstanbul',
        destination: 'Hamburg',
        mode: 'road',
        rate: '₺2,850',
        unit: '/Ton',
        change: 2.3,
        lastUpdate: new Date().toISOString()
      },
      {
        route: 'Mersin - Rotterdam',
        origin: 'Mersin',
        destination: 'Rotterdam',
        mode: 'sea',
        rate: '$450',
        unit: '/TEU',
        change: -1.2,
        lastUpdate: new Date().toISOString()
      }
    ];
  }
}
