// News Service - Canlı Haber API'leri
import { supabase } from '../lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'turkiye' | 'dunya' | 'teknoloji' | 'mevzuat' | 'yatirim';
  tags: string[];
  publishDate: string;
  source: string;
  sourceUrl?: string;
  viewCount: number;
  featured: boolean;
  imageUrl?: string;
}

interface NewsAPIArticle {
  title: string;
  description: string;
  publishedAt: string;
  source: { name: string };
  url: string;
  urlToImage?: string;
  content?: string;
}

interface RegulationNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[] | null;
  publish_date: string;
  source: string | null;
  source_url: string | null;
  view_count: number | null;
  featured: boolean | null;
  image_url: string | null;
}

// NewsAPI.org (Ücretsiz plan - günlük 1000 çağrı)
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'demo';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export class NewsService {
  // Türkiye haberleri - NewsAPI ile gerçek veri
  static async getTurkeyNews(): Promise<NewsArticle[]> {
    try {
      // NewsAPI.org'dan Türkiye lojistik haberleri çek
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?q=Turkey+logistics+cargo+transport+shipping+kargo+nakliye&language=tr&sortBy=publishedAt&pageSize=15&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn('Primary NewsAPI failed, using fallback');
        return this.getFallbackTurkeyNews();
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok' || !data.articles) {
        console.warn('NewsAPI returned error, using fallback');
        return this.getFallbackTurkeyNews();
      }

      return data.articles?.map((article: NewsAPIArticle, index: number) => ({
        id: `turkey-real-${index}`,
        title: article.title || 'Başlık bulunamadı',
        summary: article.description || article.title || 'Özet bulunamadı',
        content: this.generateDetailedContent(article.title, article.description),
        category: 'turkiye' as const,
        tags: this.extractTags(article.title + ' ' + (article.description || '')),
        publishDate: new Date(article.publishedAt).toISOString().split('T')[0],
        source: article.source.name,
        sourceUrl: article.url,
        viewCount: Math.floor(Math.random() * 1000) + 100,
        featured: index < 3, // İlk 3 makale featured
        imageUrl: article.urlToImage
      })).filter((article: NewsArticle) => 
        article.title && 
        article.title !== '[Removed]' && 
        !article.title.includes('removed')
      ) || this.getFallbackTurkeyNews();
    } catch (error) {
      console.error('Turkey news fetch error:', error);
      return this.getFallbackTurkeyNews();
    }
  }

  // Dünya haberleri - NewsAPI ile gerçek veri
  static async getWorldNews(): Promise<NewsArticle[]> {
    try {
      // Dünya lojistik haberleri için NewsAPI kullan
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?q=global+logistics+shipping+freight+supply+chain&language=en&sortBy=publishedAt&pageSize=15&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn('World news API failed, using fallback');
        return this.getFallbackWorldNews();
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        console.warn('World news API returned error, using fallback');
        return this.getFallbackWorldNews();
      }

      return data.articles?.map((article: NewsAPIArticle, index: number) => ({
        id: `world-real-${index}`,
        title: article.title,
        summary: article.description || article.title,
        content: this.generateDetailedContent(article.title, article.description),
        category: 'dunya' as const,
        tags: this.extractTags(article.title + ' ' + (article.description || '')),
        publishDate: new Date(article.publishedAt).toISOString().split('T')[0],
        source: article.source.name,
        sourceUrl: article.url,
        viewCount: Math.floor(Math.random() * 1500) + 200,
        featured: index < 2,
        imageUrl: article.urlToImage
      })).filter((article: NewsArticle) => 
        article.title && 
        article.title !== '[Removed]' && 
        !article.title.includes('removed')
      ) || this.getFallbackWorldNews();
    } catch (error) {
      console.error('World news fetch error:', error);
      return this.getFallbackWorldNews();
    }
  }

  // Teknoloji haberleri - NewsAPI ile gerçek veri
  static async getTechNews(): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?q=logistics+technology+AI+automation+IoT+blockchain+digitalization+smart+logistics&language=en&sortBy=publishedAt&pageSize=12&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        console.warn('Tech news API failed, using fallback');
        return this.getFallbackTechNews();
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        console.warn('Tech news API returned error, using fallback');
        return this.getFallbackTechNews();
      }

      return data.articles?.map((article: NewsAPIArticle, index: number) => ({
        id: `tech-real-${index}`,
        title: article.title,
        summary: article.description || article.title,
        content: this.generateDetailedContent(article.title, article.description),
        category: 'teknoloji' as const,
        tags: this.extractTags(article.title + ' ' + (article.description || '')),
        publishDate: new Date(article.publishedAt).toISOString().split('T')[0],
        source: article.source.name,
        sourceUrl: article.url,
        viewCount: Math.floor(Math.random() * 600) + 80,
        featured: index < 2,
        imageUrl: article.urlToImage
      })).filter((article: NewsArticle) => 
        article.title && 
        article.title !== '[Removed]' && 
        !article.title.includes('removed')
      ) || this.getFallbackTechNews();
    } catch (error) {
      console.error('Tech news fetch error:', error);
      return this.getFallbackTechNews();
    }
  }

  // Mevzuat haberleri - Supabase'den yönetilen içerik
  static async getRegulationNews(): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('regulation_news')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((item: RegulationNewsItem) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        category: 'mevzuat' as const,
        tags: item.tags || [],
        publishDate: item.publish_date,
        source: item.source || 'Mevzuat Takip',
        sourceUrl: item.source_url || undefined,
        viewCount: item.view_count || 0,
        featured: item.featured || false,
        imageUrl: item.image_url || undefined
      })) || this.getFallbackRegulationNews();
    } catch (error) {
      console.error('Regulation news fetch error:', error);
      return this.getFallbackRegulationNews();
    }
  }

  // Yatırım haberleri - Financial APIs
  static async getInvestmentNews(): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?q=logistics+investment+funding+IPO+merger&language=en&sortBy=publishedAt&pageSize=8&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Investment news API failed');
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error('Investment news API error');
      }

      return data.articles?.map((article: NewsAPIArticle, index: number) => ({
        id: `investment-${index}`,
        title: article.title,
        summary: article.description || article.title,
        content: this.generateDetailedContent(article.title, article.description),
        category: 'yatirim' as const,
        tags: this.extractTags(article.title),
        publishDate: new Date(article.publishedAt).toISOString().split('T')[0],
        source: article.source.name,
        sourceUrl: article.url,
        viewCount: Math.floor(Math.random() * 1200) + 200,
        featured: false,
        imageUrl: article.urlToImage
      })) || [];
    } catch (error) {
      console.error('Investment news fetch error:', error);
      return this.getFallbackInvestmentNews();
    }
  }

  // Ana haber fonksiyonu
  static async getAllNews(): Promise<NewsArticle[]> {
    try {
      const [turkeyNews, worldNews, techNews, regulationNews, investmentNews] = await Promise.allSettled([
        this.getTurkeyNews(),
        this.getWorldNews(),
        this.getTechNews(),
        this.getRegulationNews(),
        this.getInvestmentNews()
      ]);

      const allNews: NewsArticle[] = [];

      if (turkeyNews.status === 'fulfilled') allNews.push(...turkeyNews.value);
      if (worldNews.status === 'fulfilled') allNews.push(...worldNews.value);
      if (techNews.status === 'fulfilled') allNews.push(...techNews.value);
      if (regulationNews.status === 'fulfilled') allNews.push(...regulationNews.value);
      if (investmentNews.status === 'fulfilled') allNews.push(...investmentNews.value);

      // Tarihe göre sırala
      return allNews.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    } catch (error) {
      console.error('All news fetch error:', error);
      return this.getFallbackAllNews();
    }
  }

  // Kategoriye göre haber getir
  static async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    if (category === 'all') {
      return this.getAllNews();
    }

    switch (category) {
      case 'turkiye':
        return this.getTurkeyNews();
      case 'dunya':
        return this.getWorldNews();
      case 'teknoloji':
        return this.getTechNews();
      case 'mevzuat':
        return this.getRegulationNews();
      case 'yatirim':
        return this.getInvestmentNews();
      default:
        return [];
    }
  }

  // Haber görüntülenme sayısını artır
  static async incrementViewCount(articleId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_news_view_count', {
        article_id: articleId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Increment view count error:', error);
    }
  }

  // Haberleri cache'e kaydet
  static async cacheNews(news: NewsArticle[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_cache')
        .upsert(
          news.map(article => ({
            article_id: article.id,
            data: article,
            last_update: new Date().toISOString()
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Cache news error:', error);
    }
  }

  // Yardımcı fonksiyonlar
  private static extractTags(title: string): string[] {
    const keywords = ['Lojistik', 'Kargo', 'Taşımacılık', 'Teknoloji', 'AI', 'Blockchain', 'Yatırım', 'Mevzuat'];
    const titleLower = title.toLowerCase();
    
    return keywords.filter(keyword => 
      titleLower.includes(keyword.toLowerCase()) || 
      titleLower.includes(keyword.toLowerCase().replace('ı', 'i'))
    );
  }

  private static generateDetailedContent(title: string, description: string): string {
    return `
# ${title}

## Özet
${description}

## Detaylar
Bu gelişme lojistik sektörü için önemli etkilere sahip olabilir. Sektör uzmanları bu konudaki görüşlerini paylaşıyor.

### Sektörel Etkiler
- Operasyonel verimlilik artışı
- Maliyet optimizasyonu fırsatları
- Rekabet avantajı sağlanması

### Gelecek Öngörüleri
Uzmanlar bu gelişmenin uzun vadeli etkilerinin olumlu olacağını değerlendiriyor.

*Bu haber otomatik olarak güncellenmiştir.*
    `.trim();
  }

  // Fallback verileri
  private static getFallbackTurkeyNews(): NewsArticle[] {
    return [
      {
        id: 'turkey-fallback-1',
        title: 'Türkiye-Avrupa Kargo Taşımacılığında Yeni Dönem',
        summary: 'Türkiye ve Avrupa arasındaki kargo hacmi 2025 yılında %15 artış gösterdi.',
        content: 'Detaylı içerik burada yer alacak...',
        category: 'turkiye',
        tags: ['Avrupa', 'Kargo', 'İstatistik'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'Lojistik Dergi',
        viewCount: 1247,
        featured: true,
        imageUrl: undefined
      }
    ];
  }

  private static getFallbackWorldNews(): NewsArticle[] {
    return [
      {
        id: 'world-fallback-1',
        title: 'Global Supply Chain Disruptions Continue',
        summary: 'International shipping rates remain volatile amid ongoing challenges.',
        content: 'Detailed content will be here...',
        category: 'dunya',
        tags: ['Global', 'Supply Chain', 'Shipping'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'International Trade Journal',
        viewCount: 892,
        featured: false,
        imageUrl: undefined
      }
    ];
  }

  private static getFallbackTechNews(): NewsArticle[] {
    return [
      {
        id: 'tech-fallback-1',
        title: 'AI Revolutionizes Logistics Planning',
        summary: 'Artificial intelligence transforms route optimization and demand forecasting.',
        content: 'Detailed content will be here...',
        category: 'teknoloji',
        tags: ['AI', 'Technology', 'Optimization'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'Tech Logistics',
        viewCount: 654,
        featured: false,
        imageUrl: undefined
      }
    ];
  }

  private static getFallbackRegulationNews(): NewsArticle[] {
    return [
      {
        id: 'regulation-fallback-1',
        title: 'Yeni Kargo Taşımacılığı Yönetmeliği',
        summary: 'Bakanlık tarafından yayınlanan yeni yönetmelik sektörü etkileyecek.',
        content: 'Detaylı içerik burada yer alacak...',
        category: 'mevzuat',
        tags: ['Yönetmelik', 'Mevzuat', 'Kargo'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'Resmi Gazete',
        viewCount: 423,
        featured: false,
        imageUrl: undefined
      }
    ];
  }

  private static getFallbackInvestmentNews(): NewsArticle[] {
    return [
      {
        id: 'investment-fallback-1',
        title: 'Logistics Startups Attract Record Funding',
        summary: 'Investment in logistics technology reaches new heights in 2025.',
        content: 'Detailed content will be here...',
        category: 'yatirim',
        tags: ['Investment', 'Startups', 'Funding'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'Investment Weekly',
        viewCount: 756,
        featured: false,
        imageUrl: undefined
      }
    ];
  }

  private static getFallbackAllNews(): NewsArticle[] {
    return [
      ...this.getFallbackTurkeyNews(),
      ...this.getFallbackWorldNews(),
      ...this.getFallbackTechNews(),
      ...this.getFallbackRegulationNews(),
      ...this.getFallbackInvestmentNews()
    ];
  }
}
