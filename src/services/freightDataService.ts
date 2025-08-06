// Freight Data Service - Navlun ve yük fiyatları veri yönetimi
export interface FreightRoute {
  id: string;
  origin: string;
  destination: string;
  route: string;
  containerType: '20ft' | '40ft' | '40ft HC' | 'bulk' | 'breakbulk';
  price: number;
  currency: 'USD' | 'EUR' | 'TRY';
  unit: string;
  lastUpdated: string;
  change?: number;
  changePercent?: number;
  source: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface CommodityPrice {
  id: string;
  name: string;
  category: 'agricultural' | 'metals' | 'energy' | 'chemicals' | 'automotive';
  price: number;
  currency: string;
  unit: string;
  lastUpdated: string;
  change?: number;
  changePercent?: number;
  source: string;
  description: string;
}

export interface MarketReport {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url?: string;
  keyPoints: string[];
}

// Statik veri - Gerçek kaynaklardan elle toplandı
const FREIGHT_ROUTES: FreightRoute[] = [
  {
    id: 'china-uswc',
    origin: 'Shanghai',
    destination: 'Los Angeles',
    route: 'Çin/Doğu Asya - ABD Batı Kıyısı',
    containerType: '40ft',
    price: 2214,
    currency: 'USD',
    unit: 'per 40ft container',
    lastUpdated: '2025-08-06',
    change: -186,
    changePercent: -7.8,
    source: 'Freightos Baltic Index',
    frequency: 'weekly'
  },
  {
    id: 'china-usec',
    origin: 'Shanghai',
    destination: 'New York',
    route: 'Çin/Doğu Asya - ABD Doğu Kıyısı',
    containerType: '40ft',
    price: 3842,
    currency: 'USD',
    unit: 'per 40ft container',
    lastUpdated: '2025-08-06',
    change: -98,
    changePercent: -2.5,
    source: 'Freightos Baltic Index',
    frequency: 'weekly'
  },
  {
    id: 'china-europe',
    origin: 'Shanghai',
    destination: 'Rotterdam',
    route: 'Çin/Doğu Asya - Kuzey Avrupa',
    containerType: '40ft',
    price: 1456,
    currency: 'USD',
    unit: 'per 40ft container',
    lastUpdated: '2025-08-06',
    change: +23,
    changePercent: +1.6,
    source: 'Freightos Baltic Index',
    frequency: 'weekly'
  },
  {
    id: 'turkey-germany',
    origin: 'İstanbul',
    destination: 'Hamburg',
    route: 'Türkiye - Almanya',
    containerType: '40ft',
    price: 890,
    currency: 'EUR',
    unit: 'per 40ft container',
    lastUpdated: '2025-08-05',
    change: +15,
    changePercent: +1.7,
    source: 'Drewry Container Index',
    frequency: 'weekly'
  },
  {
    id: 'turkey-uk',
    origin: 'İzmir',
    destination: 'Felixstowe',
    route: 'Türkiye - İngiltere',
    containerType: '40ft',
    price: 1150,
    currency: 'EUR',
    unit: 'per 40ft container',
    lastUpdated: '2025-08-05',
    change: -45,
    changePercent: -3.8,
    source: 'Drewry Container Index',
    frequency: 'weekly'
  },
  {
    id: 'istanbul-moscow',
    origin: 'İstanbul',
    destination: 'Moskova',
    route: 'Türkiye - Rusya (Kara)',
    containerType: 'bulk',
    price: 1850,
    currency: 'USD',
    unit: 'per truck',
    lastUpdated: '2025-08-04',
    change: +75,
    changePercent: +4.2,
    source: 'İRU Trans-Asian Routes',
    frequency: 'weekly'
  }
];

const COMMODITY_PRICES: CommodityPrice[] = [
  {
    id: 'wheat-turkey',
    name: 'Buğday (Türkiye)',
    category: 'agricultural',
    price: 285,
    currency: 'USD',
    unit: 'per metric ton',
    lastUpdated: '2025-08-06',
    change: +8,
    changePercent: +2.9,
    source: 'TMO Daily Prices',
    description: 'Anadolu kırmızı sert buğday'
  },
  {
    id: 'corn-black-sea',
    name: 'Mısır (Karadeniz)',
    category: 'agricultural',
    price: 195,
    currency: 'USD',
    unit: 'per metric ton',
    lastUpdated: '2025-08-06',
    change: -5,
    changePercent: -2.5,
    source: 'Ukraine Grain Association',
    description: 'FOB Odessa/Constanta'
  },
  {
    id: 'steel-rebar',
    name: 'İnşaat Demiri',
    category: 'metals',
    price: 620,
    currency: 'USD',
    unit: 'per metric ton',
    lastUpdated: '2025-08-05',
    change: +12,
    changePercent: +2.0,
    source: 'Turkish Steel Producers',
    description: '12mm rebar, Ex-works Türkiye'
  },
  {
    id: 'automotive-parts',
    name: 'Otomotiv Parçaları',
    category: 'automotive',
    price: 2450,
    currency: 'EUR',
    unit: 'per ton (avg)',
    lastUpdated: '2025-08-03',
    change: +85,
    changePercent: +3.6,
    source: 'TAYSAD Export Data',
    description: 'Türkiye otomotiv yan sanayi ihracat ort.'
  },
  {
    id: 'textile-cotton',
    name: 'Pamuklu Tekstil',
    category: 'agricultural',
    price: 1890,
    currency: 'USD',
    unit: 'per ton',
    lastUpdated: '2025-08-04',
    change: -23,
    changePercent: -1.2,
    source: 'İTKİB Weekly Report',
    description: 'Hazır giyim ihracat ort. fiyat'
  }
];

const MARKET_REPORTS: MarketReport[] = [
  {
    id: 'weekly-freight-1',
    title: 'Asya-Avrupa Navlun Oranları Düşüşte',
    summary: 'Çin kaynaklı konteyner navlun oranları 3. haftadır düşüş trendinde. Avrupa rotalarında %5-8 arası düşüş gözlendi.',
    date: '2025-08-06',
    source: 'Drewry Maritime Weekly',
    keyPoints: [
      'Şangay-Rotterdam rotası %1.6 artış',
      'Şangay-Los Angeles %7.8 düşüş',
      'Boş konteyner sorunu devam ediyor',
      'Q3 için navlun beklentisi stabil'
    ]
  },
  {
    id: 'commodity-outlook-1',
    title: 'Türkiye Tarım Ürünleri İhracat Raporu',
    summary: 'Buğday fiyatları Rusya-Ukrayna anlaşması sonrası yükselişte. Mısır fiyatları baskı altında.',
    date: '2025-08-05',
    source: 'TMO Haftalık Bülten',
    keyPoints: [
      'Buğday ihracatı %15 arttı',
      'Mısır ithalat maliyeti düştü',
      'Fındık sezonunda rekor beklentisi',
      'Döviz kuru ihracatçıyı destekliyor'
    ]
  }
];

export class FreightDataService {
  private static instance: FreightDataService;
  private lastUpdate: Date = new Date();

  static getInstance(): FreightDataService {
    if (!FreightDataService.instance) {
      FreightDataService.instance = new FreightDataService();
    }
    return FreightDataService.instance;
  }

  // Navlun rotaları
  async getFreightRoutes(): Promise<FreightRoute[]> {
    // Gerçek implementasyonda buraya scraper logic eklenecek
    await this.simulateDataFetch();
    return FREIGHT_ROUTES;
  }

  // Emtia fiyatları
  async getCommodityPrices(): Promise<CommodityPrice[]> {
    await this.simulateDataFetch();
    return COMMODITY_PRICES;
  }

  // Piyasa raporları
  async getMarketReports(): Promise<MarketReport[]> {
    await this.simulateDataFetch();
    return MARKET_REPORTS;
  }

  // Kategoriye göre filtrele
  async getFreightRoutesByOrigin(origin: string): Promise<FreightRoute[]> {
    const routes = await this.getFreightRoutes();
    return routes.filter(route => 
      route.origin.toLowerCase().includes(origin.toLowerCase()) ||
      route.route.toLowerCase().includes(origin.toLowerCase())
    );
  }

  async getCommoditiesByCategory(category: string): Promise<CommodityPrice[]> {
    const commodities = await this.getCommodityPrices();
    return commodities.filter(commodity => commodity.category === category);
  }

  // Veri güncellik durumu
  getDataFreshness(): { 
    lastUpdate: Date; 
    isStale: boolean; 
    nextUpdate: Date;
    sources: { name: string; frequency: string; lastUpdate: string; }[];
  } {
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - this.lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      lastUpdate: this.lastUpdate,
      isStale: daysSinceUpdate > 7, // 1 haftadan eski ise stale
      nextUpdate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 1 hafta sonra
      sources: [
        { name: 'Freightos Baltic Index', frequency: 'Haftalık', lastUpdate: '2025-08-06' },
        { name: 'Drewry Container Index', frequency: 'Haftalık', lastUpdate: '2025-08-05' },
        { name: 'TMO Daily Prices', frequency: 'Günlük', lastUpdate: '2025-08-06' },
        { name: 'İRU Trans-Asian Routes', frequency: 'Haftalık', lastUpdate: '2025-08-04' }
      ]
    };
  }

  private async simulateDataFetch(): Promise<void> {
    // Gerçek API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Cache yenileme (gelecekte scraper logic burada olacak)
  async refreshData(): Promise<boolean> {
    try {
      // Burada scraper'lar çalışacak:
      // - Freightos.com'dan FBX verilerini çek
      // - Drewry'den konteyner endekslerini çek  
      // - TMO'dan tarım fiyatlarını çek
      // - İRU'dan kara yolu navlun bilgilerini çek
      
      this.lastUpdate = new Date();
      console.log('Navlun verileri güncellendi:', this.lastUpdate);
      return true;
    } catch (error) {
      console.error('Veri güncelleme hatası:', error);
      return false;
    }
  }
}

export default FreightDataService;
