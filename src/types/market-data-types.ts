export interface CurrencyRate {
  symbol: string;
  name: string;
  price: number;
  change_24h?: number;
  volume_24h?: number;
}

export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  unit: string;
  change_24h?: number;
}

export interface StockIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
}

export interface BalticIndex {
  symbol: string;
  name: string;
  value: number;
  change?: number;
  change_percent?: number;
}

export interface MarketDataItem {
  symbol: string;
  name: string;
  price?: number;
  value?: number;
  change?: number;
  change_24h?: number;
  change_percent?: number;
  volume_24h?: number;
  unit?: string;
  type: 'currency' | 'commodity' | 'stock' | 'baltic';
  matchScore?: number; // For matching algorithms
}

export interface MarketDataResponse {
  currencies: CurrencyRate[];
  commodities: CommodityPrice[];
  stocks: StockIndex[];
  baltic: BalticIndex[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

// API Response types
export interface ExchangeRateAPIResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
  };
}

export interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}
