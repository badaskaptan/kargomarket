// Embed Sync Service - Embed alanındaki verilerle diğer itemları senkronize eder
import { supabase } from '../lib/supabase';
import { MarketDataService, MarketDataItem } from './marketDataService';

export interface EmbedMarketItem {
  symbol: string;
  value: number;
  change: number;
  changePercent: string;
  timestamp: string;
}

export interface EmbedCurrencyRate {
  from: string;
  to: string;
  rate: number;
  change: number;
}

export interface EmbedFuelPrice {
  type: string;
  price: number;
  unit: string;
  change: number;
}

export interface EmbedData {
  id: string;
  title: string;
  content: string;
  embed_data?: {
    market_data?: EmbedMarketItem[];
    currency_rates?: EmbedCurrencyRate[];
    fuel_prices?: EmbedFuelPrice[];
  };
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  updatedItems: number;
  errors: string[];
  timestamp: string;
}

class EmbedSyncService {
  // Embed verilerini analiz et ve market data ile eşleştir
  static async syncEmbedWithMarketData(embedId: string): Promise<SyncResult> {
    try {
      // Embed verisini al
      const embedData = await this.getEmbedData(embedId);
      if (!embedData) {
        return {
          success: false,
          updatedItems: 0,
          errors: ['Embed verisi bulunamadı'],
          timestamp: new Date().toISOString()
        };
      }

      // Market data'yı al
      const marketData = await MarketDataService.getMarketData();
      
      let updatedItems = 0;
      const errors: string[] = [];

      // Embed'deki market data ile mevcut verileri senkronize et
      if (embedData.embed_data?.market_data) {
        for (const embedMarketItem of embedData.embed_data.market_data) {
          try {
            const matchedItem = this.findMatchingMarketItem(embedMarketItem, marketData);
            if (matchedItem) {
              await this.updateMarketItem(matchedItem, embedMarketItem);
              updatedItems++;
            }
          } catch (error) {
            errors.push(`Market data sync error for ${embedMarketItem.symbol}: ${error}`);
          }
        }
      }

      // Currency rates sync
      if (embedData.embed_data?.currency_rates) {
        for (const currencyRate of embedData.embed_data.currency_rates) {
          try {
            await this.syncCurrencyRate(currencyRate);
            updatedItems++;
          } catch (error) {
            errors.push(`Currency sync error for ${currencyRate.from}/${currencyRate.to}: ${error}`);
          }
        }
      }

      // Fuel prices sync
      if (embedData.embed_data?.fuel_prices) {
        for (const fuelPrice of embedData.embed_data.fuel_prices) {
          try {
            await this.syncFuelPrice(fuelPrice);
            updatedItems++;
          } catch (error) {
            errors.push(`Fuel price sync error for ${fuelPrice.type}: ${error}`);
          }
        }
      }

      // Sync sonucunu kaydet
      await this.logSyncResult(embedId, updatedItems, errors);

      return {
        success: errors.length === 0,
        updatedItems,
        errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        updatedItems: 0,
        errors: [`Sync error: ${error}`],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Tüm embed'leri tarayıp senkronize et
  static async syncAllEmbeds(): Promise<SyncResult> {
    try {
      const embeds = await this.getAllEmbeds();
      let totalUpdated = 0;
      const allErrors: string[] = [];

      for (const embed of embeds) {
        const result = await this.syncEmbedWithMarketData(embed.id);
        totalUpdated += result.updatedItems;
        allErrors.push(...result.errors);
      }

      return {
        success: allErrors.length === 0,
        updatedItems: totalUpdated,
        errors: allErrors,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        updatedItems: 0,
        errors: [`Global sync error: ${error}`],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Embed verisini al
  private static async getEmbedData(embedId: string): Promise<EmbedData | null> {
    try {
      const { data, error } = await supabase
        .from('embeds') // Embed tablosu adını buraya yazın
        .select('*')
        .eq('id', embedId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get embed data error:', error);
      return null;
    }
  }

  // Tüm embed'leri al
  private static async getAllEmbeds(): Promise<EmbedData[]> {
    try {
      const { data, error } = await supabase
        .from('embeds')
        .select('*')
        .not('embed_data', 'is', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all embeds error:', error);
      return [];
    }
  }

  // Market item'ı eşleştir - Gelişmiş algoritma
  private static findMatchingMarketItem(
    embedItem: EmbedMarketItem, 
    marketData: MarketDataItem[]
  ): MarketDataItem | null {
    const embedSymbol = embedItem.symbol.toLowerCase().trim();
    
    // 1. Tam eşleşme kontrolü
    let exactMatch = marketData.find(item => 
      item.id.toLowerCase() === embedSymbol ||
      item.name.toLowerCase() === embedSymbol ||
      item.name.toLowerCase() === embedItem.symbol.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // 2. Symbol parçalama ve eşleştirme (USD/TRY gibi)
    if (embedSymbol.includes('/')) {
      const [base, quote] = embedSymbol.split('/');
      exactMatch = marketData.find(item => {
        const itemName = item.name.toLowerCase();
        return (itemName.includes(base) && itemName.includes(quote)) ||
               (itemName === `${base}/${quote}`) ||
               (item.id === `${base.toLowerCase()}-${quote.toLowerCase()}`)
      });
      
      if (exactMatch) return exactMatch;
    }
    
    // 3. Anahtar kelime bazında eşleştirme
    const keywordMatch = marketData.find(item => {
      const itemName = item.name.toLowerCase();
      const embedName = embedSymbol.replace(/[^a-z0-9]/g, '');
      
      // Özel durumlar için mapping
      const symbolMappings = {
        'usdtry': ['usd', 'try', 'dolar', 'türk lirası'],
        'eurtry': ['eur', 'try', 'euro', 'türk lirası'],
        'brent': ['brent', 'petrol', 'oil'],
        'gold': ['altın', 'gold', 'ons'],
        'bdi': ['baltic', 'dry', 'index', 'navlun'],
        'wti': ['wti', 'petrol', 'oil']
      };
      
      // Mapping kontrolü
      for (const [key, keywords] of Object.entries(symbolMappings)) {
        if (embedName.includes(key) || keywords.some(keyword => embedSymbol.includes(keyword))) {
          return keywords.some(keyword => itemName.includes(keyword));
        }
      }
      
      // Genel benzerlik kontrolü
      return itemName.includes(embedName) || 
             embedName.includes(itemName.replace(/[^a-z0-9]/g, '')) ||
             this.calculateSimilarity(itemName, embedSymbol) > 0.7;
    });
    
    if (keywordMatch) return keywordMatch;
    
    // 4. Fuzzy matching (bulanık eşleştirme)
    const fuzzyMatches = marketData
      .map(item => ({
        item,
        similarity: this.calculateSimilarity(item.name.toLowerCase(), embedSymbol)
      }))
      .filter(match => match.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity);
    
    return fuzzyMatches.length > 0 ? fuzzyMatches[0].item : null;
  }
  
  // String benzerlik hesaplama (Levenshtein distance based)
  private static calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  // Market item'ı güncelle
  private static async updateMarketItem(
    marketItem: MarketDataItem, 
    embedData: EmbedMarketItem
  ): Promise<void> {
    try {
      const updatedItem: MarketDataItem = {
        ...marketItem,
        value: embedData.value?.toString() || marketItem.value,
        change: embedData.change || marketItem.change,
        changePercent: embedData.changePercent || marketItem.changePercent,
        lastUpdate: embedData.timestamp || new Date().toISOString(),
        source: 'Embed Sync'
      };

      // Cache'e kaydet
      await MarketDataService.cacheMarketData([updatedItem]);
    } catch (error) {
      console.error('Update market item error:', error);
      throw error;
    }
  }

  // Currency rate senkronize et
  private static async syncCurrencyRate(
    currencyRate: EmbedCurrencyRate
  ): Promise<void> {
    try {
      const symbolKey = `${currencyRate.from.toLowerCase()}-${currencyRate.to.toLowerCase()}`;
      
      const currencyItem: MarketDataItem = {
        id: symbolKey,
        name: `${currencyRate.from}/${currencyRate.to}`,
        category: 'currency',
        value: currencyRate.rate.toFixed(4),
        change: currencyRate.change || 0,
        changePercent: `${currencyRate.change > 0 ? '+' : ''}${((currencyRate.change / currencyRate.rate) * 100).toFixed(1)}%`,
        unit: currencyRate.to,
        lastUpdate: new Date().toISOString(),
        trend: currencyRate.change > 0 ? 'up' : currencyRate.change < 0 ? 'down' : 'stable',
        source: 'Embed Sync'
      };

      await MarketDataService.cacheMarketData([currencyItem]);
    } catch (error) {
      console.error('Sync currency rate error:', error);
      throw error;
    }
  }

  // Fuel price senkronize et
  private static async syncFuelPrice(
    fuelPrice: EmbedFuelPrice
  ): Promise<void> {
    try {
      const fuelId = fuelPrice.type.toLowerCase().replace(/\s+/g, '-');
      
      const fuelItem: MarketDataItem = {
        id: fuelId,
        name: fuelPrice.type,
        category: 'fuel',
        value: `$${fuelPrice.price.toFixed(2)}`,
        change: fuelPrice.change || 0,
        changePercent: `${fuelPrice.change > 0 ? '+' : ''}${((fuelPrice.change / fuelPrice.price) * 100).toFixed(1)}%`,
        unit: fuelPrice.unit || 'USD/Varil',
        lastUpdate: new Date().toISOString(),
        trend: fuelPrice.change > 0 ? 'up' : fuelPrice.change < 0 ? 'down' : 'stable',
        source: 'Embed Sync'
      };

      await MarketDataService.cacheMarketData([fuelItem]);
    } catch (error) {
      console.error('Sync fuel price error:', error);
      throw error;
    }
  }

  // Sync sonucunu logla
  private static async logSyncResult(
    embedId: string, 
    updatedItems: number, 
    errors: string[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('embed_sync_logs')
        .insert({
          embed_id: embedId,
          updated_items: updatedItems,
          errors: errors,
          success: errors.length === 0,
          synced_at: new Date().toISOString()
        });

      if (error) {
        console.error('Log sync result error:', error);
      }
    } catch (error) {
      console.error('Log sync result error:', error);
    }
  }

  // Benzer itemları bul ve öner - Gelişmiş algoritma
  static async findSimilarItems(embedData: EmbedData): Promise<MarketDataItem[]> {
    try {
      const marketData = await MarketDataService.getMarketData();
      const similarItems: MarketDataItem[] = [];
      
      // 1. Embed data'sındaki market verileri ile direkt eşleştirme
      if (embedData.embed_data?.market_data) {
        for (const marketItem of embedData.embed_data.market_data) {
          const match = this.findMatchingMarketItem(marketItem, marketData);
          if (match) {
            similarItems.push({
              ...match,
              source: 'Embed Direct Match',
              cached_at: new Date().toISOString()
            });
          }
        }
      }
      
      // 2. Currency rates ile eşleştirme
      if (embedData.embed_data?.currency_rates) {
        for (const currencyRate of embedData.embed_data.currency_rates) {
          const match = marketData.find(item => 
            item.name.toLowerCase().includes(currencyRate.from.toLowerCase()) &&
            item.name.toLowerCase().includes(currencyRate.to.toLowerCase())
          );
          if (match) {
            similarItems.push({
              ...match,
              value: currencyRate.rate.toFixed(4),
              change: currencyRate.change,
              changePercent: `${currencyRate.change > 0 ? '+' : ''}${((currencyRate.change / currencyRate.rate) * 100).toFixed(1)}%`,
              source: 'Embed Currency Match'
            });
          }
        }
      }
      
      // 3. İçerik analizi ile anahtar kelime eşleştirme
      const keywords = this.extractKeywords(embedData.content);
      
      for (const keyword of keywords) {
        const keywordMatches = marketData.filter(item => {
          const itemName = item.name.toLowerCase();
          const itemDesc = item.description?.toLowerCase() || '';
          const keywordLower = keyword.toLowerCase();
          
          return itemName.includes(keywordLower) || 
                 itemDesc.includes(keywordLower) ||
                 this.calculateSimilarity(itemName, keywordLower) > 0.6;
        });
        
        similarItems.push(...keywordMatches.map(item => ({
          ...item,
          source: `Keyword Match: ${keyword}`
        })));
      }
      
      // 4. Sayısal değer analizi
      const numberMatches = this.findItemsByNumericValues(embedData.content, marketData);
      similarItems.push(...numberMatches);
      
      // 5. Dublicate'leri kaldır ve skorla
      const uniqueItems = this.removeDuplicatesAndScore(similarItems);
      
      // En yüksek skordan sırala ve ilk 10'u döndür
      return uniqueItems
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 10);
        
    } catch (error) {
      console.error('Find similar items error:', error);
      return [];
    }
  }
  
  // Sayısal değerlere göre eşleştirme
  private static findItemsByNumericValues(content: string, marketData: MarketDataItem[]): MarketDataItem[] {
    const matches: MarketDataItem[] = [];
    
    // İçerikteki sayıları bul
    const numberRegex = /(\d+[.,]?\d*)/g;
    const numbers = content.match(numberRegex)?.map(n => parseFloat(n.replace(',', '.'))) || [];
    
    for (const number of numbers) {
      // Benzer değerlere sahip market itemları bul
      const valueMatches = marketData.filter(item => {
        const itemValue = parseFloat(item.value.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (isNaN(itemValue)) return false;
        
        // %20 toleransla karşılaştır
        const tolerance = Math.abs(itemValue * 0.2);
        return Math.abs(itemValue - number) <= tolerance;
      });
      
      matches.push(...valueMatches.map(item => ({
        ...item,
        source: `Numeric Match: ${number}`
      } as MarketDataItem & { matchScore: number })));
    }
    
    return matches;
  }
  
  // Dublicate'leri kaldır ve skor hesapla
  private static removeDuplicatesAndScore(items: MarketDataItem[]): (MarketDataItem & { matchScore: number })[] {
    const itemMap = new Map<string, MarketDataItem & { matchScore: number }>();
    
    for (const item of items) {
      const existing = itemMap.get(item.id);
      const itemWithScore = item as MarketDataItem & { matchScore?: number };
      const currentScore = itemWithScore.matchScore || this.calculateItemScore(item);
      
      if (!existing || currentScore > existing.matchScore) {
        itemMap.set(item.id, {
          ...item,
          matchScore: currentScore
        });
      }
    }
    
    return Array.from(itemMap.values());
  }
  
  // Item skor hesaplama
  private static calculateItemScore(item: MarketDataItem): number {
    let score = 0.5; // Base score
    
    // Source bazında skor
    if (item.source?.includes('Direct Match')) score += 0.4;
    else if (item.source?.includes('Currency Match')) score += 0.3;
    else if (item.source?.includes('Keyword Match')) score += 0.2;
    else if (item.source?.includes('Numeric Match')) score += 0.1;
    
    // Category bazında skor
    if (item.category === 'currency') score += 0.1;
    if (item.category === 'fuel') score += 0.1;
    if (item.category === 'commodity') score += 0.1;
    
    // Güncellik bazında skor
    const lastUpdate = new Date(item.lastUpdate);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 1) score += 0.1;
    else if (hoursDiff < 24) score += 0.05;
    
    return Math.min(score, 1.0); // Max 1.0 skor
  }

  // İçerikten gelişmiş anahtar kelime çıkarma
  private static extractKeywords(content: string): string[] {
    // Türkçe ve İngilizce piyasa terimleri
    const marketKeywords = {
      currencies: ['usd', 'eur', 'try', 'dolar', 'euro', 'türk lirası', 'tl', 'dollar'],
      commodities: ['altın', 'gold', 'gümüş', 'silver', 'bakır', 'copper', 'petrol', 'oil', 'brent', 'wti'],
      indices: ['baltic', 'dry', 'index', 'endeks', 'nasdaq', 'dow', 'sp500', 'bist'],
      units: ['ton', 'varil', 'barrel', 'ons', 'ounce', 'pound', 'kilo', 'litre'],
      terms: ['fiyat', 'price', 'kur', 'rate', 'değer', 'value', 'piyasa', 'market', 'navlun', 'freight']
    };
    
    const allKeywords = Object.values(marketKeywords).flat();
    const contentLower = content.toLowerCase();
    
    // 1. Direkt anahtar kelime arama
    const foundKeywords = allKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );
    
    // 2. Sayısal değerlerle birlikte olan kelimeleri bul
    const numberRegex = /(\d+[.,]?\d*)\s*([a-züğıişçö]+)/gi;
    const matches = contentLower.match(numberRegex) || [];
    const numericKeywords = matches.map(match => {
      const parts = match.split(/\s+/);
      return parts[1]; // Sayıdan sonraki kelime
    }).filter(word => word && word.length > 2);
    
    // 3. Para birimi sembolleri
    const currencySymbols = contentLower.match(/[€$₺£¥]/g) || [];
    const symbolStrings = currencySymbols as string[];
    if (symbolStrings.includes('$')) foundKeywords.push('usd', 'dolar');
    if (symbolStrings.includes('€')) foundKeywords.push('eur', 'euro');
    if (symbolStrings.includes('₺')) foundKeywords.push('try', 'türk lirası');
    
    // 4. Oran ifadeleri (USD/TRY gibi)
    const ratioRegex = /([A-Z]{3})\/([A-Z]{3})/g;
    const ratios = contentLower.match(ratioRegex) || [];
    ratios.forEach(ratio => {
      const [base, quote] = ratio.split('/');
      foundKeywords.push(base.toLowerCase(), quote.toLowerCase(), ratio.toLowerCase());
    });
    
    // 5. Fiyat ifadeleri
    const priceRegex = /(\d+[.,]?\d*)\s*(tl|usd|eur|dolar|euro|₺|\$|€)/gi;
    const priceMatches = contentLower.match(priceRegex) || [];
    priceMatches.forEach(match => {
      const currency = match.replace(/[\d.,\s]/g, '');
      if (currency) foundKeywords.push(currency);
    });
    
    // Dublicate'leri kaldır ve döndür
    return [...new Set([...foundKeywords, ...numericKeywords])];
  }
}

export { EmbedSyncService };
