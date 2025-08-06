import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Calendar, 
  Globe, 
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  Filter,
  Search,
  Clock,
  Eye,
  Share2
} from 'lucide-react';
import { NewsService, NewsArticle } from '../../services/newsService';

interface NewsPageProps {
  setActivePage?: (page: string) => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ setActivePage }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'turkiye' | 'dunya' | 'teknoloji' | 'mevzuat' | 'yatirim'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Tüm Haberler', icon: Newspaper, color: 'bg-gray-500' },
    { id: 'turkiye', name: 'Türkiye', icon: Globe, color: 'bg-red-500' },
    { id: 'dunya', name: 'Dünya', icon: Globe, color: 'bg-blue-500' },
    { id: 'teknoloji', name: 'Teknoloji', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'mevzuat', name: 'Mevzuat', icon: Calendar, color: 'bg-orange-500' },
    { id: 'yatirim', name: 'Yatırım', icon: TrendingUp, color: 'bg-green-500' }
  ];

  // Canlı haber çekme - NewsService kullanımı
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      
      try {
        // Seçili kategoriye göre haber çek
        const liveNews = await NewsService.getNewsByCategory(selectedCategory);
        setNews(liveNews);
        
        // Haberleri cache'e kaydet
        await NewsService.cacheNews(liveNews);
      } catch (error) {
        console.error('News fetch error:', error);
        // Fallback verilerini kullan
        setNews(getFallbackNews());
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  const getFallbackNews = (): NewsArticle[] => {
    return [
      {
        id: 'fallback-1',
        title: 'Türkiye-Avrupa Kargo Taşımacılığında Yeni Dönem',
        summary: 'Türkiye ve Avrupa arasındaki kargo hacmi 2025 yılında %15 artış gösterdi.',
        content: 'Detaylı haber içeriği burada yer alacak...',
        category: 'turkiye',
        tags: ['Avrupa', 'Kargo', 'İstatistik'],
        publishDate: new Date().toISOString().split('T')[0],
        source: 'Lojistik Dergi',
        viewCount: 1247,
        featured: true,
        imageUrl: undefined
      },
      {
        id: 'fallback-2',
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
  };

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredNews = news.filter(article => article.featured);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Diğer';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || 'bg-gray-500';
  };

  const handleArticleClick = async (article: NewsArticle) => {
    setSelectedArticle(article);
    
    // Görüntülenme sayısını artır
    try {
      await NewsService.incrementViewCount(article.id);
      // Local state'i güncelle
      setNews(prevNews => 
        prevNews.map(n => 
          n.id === article.id 
            ? { ...n, viewCount: n.viewCount + 1 }
            : n
        )
      );
    } catch (error) {
      console.error('View count increment error:', error);
    }
  };

  if (selectedArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Article Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Haberlere Dön
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </button>
            {selectedArticle.sourceUrl && (
              <a 
                href={selectedArticle.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Kaynağa Git
              </a>
            )}
          </div>
        </div>

        {/* Article Content */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {selectedArticle.imageUrl && (
            <div className="w-full h-64 bg-gray-200">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Article Meta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 ${getCategoryColor(selectedArticle.category)} text-white text-sm rounded-full`}>
                  {getCategoryName(selectedArticle.category)}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(selectedArticle.publishDate).toLocaleDateString('tr-TR')}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  {selectedArticle.viewCount} görüntülenme
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Kaynak: {selectedArticle.source}
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedArticle.title}
            </h1>

            {/* Article Summary */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {selectedArticle.summary}
            </p>

            {/* Article Content */}
            <div className="prose max-w-none">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Article Tags */}
            {selectedArticle.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Etiketler:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActivePage?.('infocenter')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bilgi Merkezi
          </button>
          <div className="text-gray-300">•</div>
          <h1 className="text-3xl font-bold text-gray-900">Sektör Haberleri</h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Haber ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filtrele
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as 'all' | 'turkiye' | 'dunya' | 'teknoloji' | 'mevzuat' | 'yatirim')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Featured News */}
      {featuredNews.length > 0 && selectedCategory === 'all' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Öne Çıkan Haberler</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredNews.slice(0, 2).map((article) => (
              <div 
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {article.imageUrl && (
                  <div className="w-full h-48 bg-gray-200">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 ${getCategoryColor(article.category)} text-white text-xs rounded-full`}>
                      {getCategoryName(article.category)}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(article.publishDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {article.source}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.viewCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))
        ) : filteredNews.length > 0 ? (
          filteredNews.map((article) => (
            <div 
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 ${getCategoryColor(article.category)} text-white text-xs rounded-full`}>
                  {getCategoryName(article.category)}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(article.publishDate).toLocaleDateString('tr-TR')}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {article.source}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  {article.viewCount}
                </div>
              </div>
              
              {article.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Haber bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Arama kriterlerinizi değiştirerek tekrar deneyin.' : 'Bu kategoride henüz haber bulunmuyor.'}
            </p>
          </div>
        )}
      </div>

      {/* Loading More Button */}
      {!loading && filteredNews.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Daha Fazla Haber Yükle
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
