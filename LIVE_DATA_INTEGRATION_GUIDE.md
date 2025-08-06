# 📊 Live Data Integration Guide

## Overview

KargoMarket v3'te Information Center sayfalarında canlı veri entegrasyonu sağlanmıştır. Bu sistem gerçek zamanlı finansal veriler ve haberleri API'ler aracılığıyla çekerek kullanıcılara güncel bilgi sunar.

## 🔗 Entegre Edilen API'ler

### 📈 Financial Data APIs

#### 1. **Fixer.io** - Döviz Kurları
- **Kullanım**: USD/TRY, EUR/TRY, EUR/USD kurları
- **Limit**: Ücretsiz plan - 1000 çağrı/ay
- **URL**: https://fixer.io/
- **Dosya**: `src/services/marketDataService.ts`

#### 2. **CoinGecko** - Emtia Fiyatları
- **Kullanım**: Altın, gümüş fiyatları
- **Limit**: Ücretsiz - rate limiting var
- **URL**: https://api.coingecko.com/
- **Özellik**: 24 saatlik değişim oranları

#### 3. **Alpha Vantage** - Petrol Fiyatları
- **Kullanım**: Brent petrol, WTI crude oil
- **Limit**: Ücretsiz plan - 500 çağrı/gün
- **URL**: https://www.alphavantage.co/
- **Not**: Demo mode'da fallback data kullanılır

### 📰 News APIs

#### 1. **NewsAPI.org** - Genel Haberler
- **Kullanım**: Türkiye, teknoloji, yatırım haberleri
- **Limit**: Ücretsiz plan - 1000 çağrı/gün
- **URL**: https://newsapi.org/
- **Dil Desteği**: Türkçe ve İngilizce

#### 2. **Bing News API** - Dünya Haberleri
- **Kullanım**: Global lojistik haberleri
- **Limit**: Cognitive Services ücretsiz katman
- **URL**: https://azure.microsoft.com/services/cognitive-services/
- **Özellik**: Thumbnail resimler dahil

## 🛠️ Setup Instructions

### 1. API Anahtarları Alma

```bash
# 1. Fixer.io
# https://fixer.io/ -> Sign up -> Free plan

# 2. NewsAPI
# https://newsapi.org/ -> Get API Key -> Free plan

# 3. Alpha Vantage  
# https://www.alphavantage.co/ -> Get API Key -> Free

# 4. Bing News (Optional)
# https://portal.azure.com -> Cognitive Services -> Bing Search
```

### 2. Environment Variables

`.env` dosyasını oluşturun:

```bash
# Financial APIs
REACT_APP_FIXER_API_KEY=your_fixer_api_key
REACT_APP_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# News APIs
REACT_APP_NEWS_API_KEY=your_news_api_key
REACT_APP_BING_NEWS_API_KEY=your_bing_news_key
```

### 3. Database Setup

Supabase'de gerekli tabloları oluşturun:

```sql
-- create-live-data-tables.sql dosyasını çalıştırın
psql -h your-supabase-host -U postgres -d postgres -f create-live-data-tables.sql
```

## 📋 Service Architecture

### MarketDataService

```typescript
// src/services/marketDataService.ts

export class MarketDataService {
  // Ana market data fonksiyonu
  static async getMarketData(): Promise<MarketDataItem[]>
  
  // Döviz kurları
  static async getCurrencyRates(): Promise<MarketDataItem[]>
  
  // Petrol fiyatları
  static async getOilPrices(): Promise<MarketDataItem[]>
  
  // Altın fiyatları
  static async getGoldPrices(): Promise<MarketDataItem[]>
  
  // Navlun oranları (Supabase'den)
  static async getFreightRates(): Promise<FreightRate[]>
  
  // Cache management
  static async cacheMarketData(data: MarketDataItem[]): Promise<void>
}
```

### NewsService

```typescript
// src/services/newsService.ts

export class NewsService {
  // Kategoriye göre haber getir
  static async getNewsByCategory(category: string): Promise<NewsArticle[]>
  
  // Türkiye haberleri
  static async getTurkeyNews(): Promise<NewsArticle[]>
  
  // Dünya haberleri
  static async getWorldNews(): Promise<NewsArticle[]>
  
  // Teknoloji haberleri
  static async getTechNews(): Promise<NewsArticle[]>
  
  // Mevzuat haberleri (Supabase)
  static async getRegulationNews(): Promise<NewsArticle[]>
  
  // Yatırım haberleri
  static async getInvestmentNews(): Promise<NewsArticle[]>
}
```

## 🔄 Fallback System

Her API çağrısı için fallback mekanizması vardır:

### Market Data Fallback
```typescript
// API başarısız olursa cached veriler kullanılır
try {
  const liveData = await MarketDataService.getMarketData();
  setMarketData(liveData);
} catch (error) {
  console.error('API error:', error);
  setMarketData(getFallbackData()); // Fallback data
}
```

### News Fallback
```typescript
// Haber API'si başarısız olursa yerel veriler gösterilir
try {
  const newsData = await NewsService.getAllNews();
  setNews(newsData);
} catch (error) {
  setNews(getFallbackNews()); // Local fallback news
}
```

## 📊 Data Flow

### Market Data Page
1. **Component Mount** → API çağrıları başlatılır
2. **Multiple APIs** → Paralel veri çekme (Promise.allSettled)
3. **Success Response** → Verileri state'e kaydet
4. **Error Handling** → Fallback data kullan
5. **Cache Update** → Supabase'e cache kaydet
6. **User Interaction** → Refresh butonuyla yeniden çek

### News Page
1. **Category Selection** → Kategori değişiminde yeni API çağrısı
2. **Real-time Data** → Live news feeds
3. **Search & Filter** → Client-side filtreleme
4. **View Tracking** → Haber görüntülenme sayısı
5. **Cache Management** → Supabase cache tablosu

## 🔧 Configuration

### Rate Limiting
```typescript
// API çağrılarında rate limiting kontrolü
const RATE_LIMIT_DELAY = 1000; // 1 saniye
const MAX_RETRIES = 3;

// Retry mechanism
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    const response = await fetch(apiUrl);
    break;
  } catch (error) {
    if (i === MAX_RETRIES - 1) throw error;
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  }
}
```

### Error Handling
```typescript
// Comprehensive error handling
try {
  const data = await apiCall();
  return data;
} catch (error) {
  console.error('API Error:', error);
  
  // Log to monitoring service (future)
  // logError(error, 'MarketDataService');
  
  // Return fallback data
  return getFallbackData();
}
```

## 📈 Performance Optimization

### 1. **Caching Strategy**
- Supabase tabanlı cache sistemi
- 5 dakika cache süre
- Background refresh

### 2. **Lazy Loading**
```typescript
// Sayfa açıldığında sadece gerekli veriler yüklenir
useEffect(() => {
  if (selectedCategory === 'all') {
    loadAllData();
  } else {
    loadCategoryData(selectedCategory);
  }
}, [selectedCategory]);
```

### 3. **Debounced Search**
```typescript
// Search input'ta debounce kullanımı
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

## 🔒 Security Considerations

### API Key Protection
- Environment variables kullanımı
- Client-side exposure minimizasyonu
- Rate limiting implementation

### Data Validation
```typescript
// API response validation
interface ApiResponse {
  success: boolean;
  data: any;
  error?: string;
}

const validateResponse = (response: ApiResponse): boolean => {
  return response.success && response.data;
};
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Service fonksiyonları için unit testler
describe('MarketDataService', () => {
  test('should fetch currency rates', async () => {
    const rates = await MarketDataService.getCurrencyRates();
    expect(rates).toHaveLength(3);
    expect(rates[0]).toHaveProperty('value');
  });
});
```

### Integration Tests
```typescript
// API entegrasyonu testleri
describe('News API Integration', () => {
  test('should handle API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    const news = await NewsService.getAllNews();
    expect(news).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: expect.any(String) })
    ]));
  });
});
```

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Optimized loading states

### Progressive Enhancement
- Core functionality without JS
- Enhanced features with API data
- Graceful degradation

## 🔮 Future Enhancements

### Real-time Updates
```typescript
// WebSocket connection for real-time data
const wsConnection = new WebSocket('wss://api.example.com/realtime');
wsConnection.onmessage = (event) => {
  const newData = JSON.parse(event.data);
  updateMarketData(newData);
};
```

### AI Integration
- Smart content recommendations
- Automated market analysis
- Predictive analytics

### Analytics Dashboard
- User engagement metrics
- API usage statistics
- Performance monitoring

## 📞 Support & Maintenance

### Monitoring
- API health checks
- Error rate monitoring
- Performance metrics

### Updates
- Weekly API key rotation
- Monthly dependency updates
- Quarterly security audits

---

*Last Updated: August 6, 2025*
*Version: v3.1.0*
