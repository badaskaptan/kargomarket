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

interface NewsArticle {
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

  // Mock data - gerçek haber API'sı ile değiştirilecek
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setNews([
          {
            id: '1',
            title: 'Türkiye-Avrupa Kargo Taşımacılığında Yeni Dönem',
            summary: 'Türkiye ve Avrupa arasındaki kargo hacmi 2025 yılında %15 artış gösterdi. Yeni lojistik merkezleri ve dijital dönüşüm projeleri ile...',
            content: `
# Türkiye-Avrupa Kargo Taşımacılığında Yeni Dönem

## Büyüme Rakamları
2025 yılının ilk yarısında Türkiye-Avrupa kargo hacmi geçen yıla göre %15 artış gösterdi. Bu artışın arkasında:

### Temel Faktörler
- E-ticaret hacmindeki artış (%25)
- Yeni lojistik merkezleri yatırımları
- Dijital gümrük sistemleri
- Intermodal taşımacılık gelişimi

### Bölgesel Dağılım
- **Almanya**: %18 artış
- **Fransa**: %12 artış  
- **İtalya**: %14 artış
- **Hollanda**: %20 artış

## Gelecek Projeksiyonları
Uzmanlar 2025 yılsonuna kadar bu artışın devam edeceğini öngörüyor.
            `,
            category: 'turkiye',
            tags: ['Avrupa', 'Kargo', 'İstatistik', 'Büyüme'],
            publishDate: '2025-08-06',
            source: 'Lojistik Dergi',
            viewCount: 1247,
            featured: true,
            imageUrl: '/images/turkey-europe-cargo.jpg'
          },
          {
            id: '2', 
            title: 'Süveyş Kanalı Trafiğinde Rekor Artış',
            summary: 'Küresel ticaretin kalbi sayılan Süveyş Kanalı\'ndan geçen gemi sayısı tarihinde ilk kez günlük 80 adedi aştı...',
            content: `
# Süveyş Kanalı Trafiğinde Rekor Artış

## Trafik Verileri
Süveyş Kanalı İdaresi'nin açıkladığı son verilere göre:

- Günlük geçiş: 82 gemi (rekor)
- Aylık toplam: 2,247 gemi
- Yıllık artış: %12

## Ekonomik Etki
Bu artış global deniz taşımacılığında önemli gelişmelere işaret ediyor.
            `,
            category: 'dunya',
            tags: ['Süveyş Kanalı', 'Deniz Taşımacılığı', 'Global Ticaret'],
            publishDate: '2025-08-05',
            source: 'Maritime News',
            sourceUrl: 'https://example.com',
            viewCount: 892,
            featured: true
          },
          {
            id: '3',
            title: 'Yapay Zeka Destekli Lojistik Sistemleri',
            summary: 'Türk lojistik şirketleri yapay zeka teknolojilerini rota optimizasyonu ve maliyet düşürme için kullanmaya başladı...',
            content: `
# Yapay Zeka Destekli Lojistik Sistemleri

## Kullanım Alanları
- Rota optimizasyonu
- Maliyet tahmini
- Talep tahmin modelleri
- Otomatik fiyatlandırma

## Faydalar
%20'ye varan maliyet tasarrufu sağlanıyor.
            `,
            category: 'teknoloji',
            tags: ['Yapay Zeka', 'Dijital Dönüşüm', 'Optimizasyon'],
            publishDate: '2025-08-04',
            source: 'Tech Logistics',
            viewCount: 634,
            featured: false
          },
          {
            id: '4',
            title: 'Yeni Gümrük Mevzuatı Değişiklikleri',
            summary: 'Ticaret Bakanlığı\'nın açıkladığı yeni gümrük mevzuatı 1 Eylül 2025 tarihinde yürürlüğe girecek...',
            content: `
# Yeni Gümrük Mevzuatı Değişiklikleri

## Temel Değişiklikler
- Elektronik beyanname zorunluluğu
- Yeni vergi oranları
- Hızlandırılmış gümrük prosedürleri

## Sektöre Etkisi
Taşımacılık şirketleri için yeni süreçler belirlendi.
            `,
            category: 'mevzuat',
            tags: ['Gümrük', 'Mevzuat', 'Değişiklik'],
            publishDate: '2025-08-03',
            source: 'Gümrük Gazetesi',
            viewCount: 445,
            featured: false
          },
          {
            id: '5',
            title: 'Lojistik Sektörüne 2.5 Milyar TL Yatırım',
            summary: 'Özel sektör bu yıl lojistik altyapısına 2.5 milyar TL yatırım yapacağını açıkladı. Yatırımların %40\'ı teknoloji alanında...',
            content: `
# Lojistik Sektörüne 2.5 Milyar TL Yatırım

## Yatırım Dağılımı
- Teknoloji: %40 (1 milyar TL)
- Altyapı: %35 (875 milyon TL)
- Araç filosu: %25 (625 milyon TL)

## Beklenen Gelişmeler
2026 yılında sektörde %30 büyüme hedefleniyor.
            `,
            category: 'yatirim',
            tags: ['Yatırım', 'Büyüme', 'Teknoloji'],
            publishDate: '2025-08-02',
            source: 'Ekonomi Gazetesi',
            viewCount: 756,
            featured: true
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchNews();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setActivePage?.('bilgi-merkezi')} 
                className="mr-4"
                aria-label="Bilgi Merkezi'ne dön"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-orange-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sektör Haberleri</h1>
                <p className="text-gray-600 mt-1">Türkiye ve dünya lojistik sektöründen güncel gelişmeler</p>
              </div>
            </div>
            <Newspaper className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedArticle ? (
          /* Article Detail View */
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Haberlere Dön
              </button>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(selectedArticle.category)} mr-3`}>
                    {getCategoryName(selectedArticle.category)}
                  </span>
                  <span className="text-sm text-gray-500 mr-4">
                    {formatDate(selectedArticle.publishDate)}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedArticle.viewCount.toLocaleString()} görüntülenme
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedArticle.summary}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Kaynak:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedArticle.source}</span>
                    {selectedArticle.sourceUrl && (
                      <a 
                        href={selectedArticle.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-orange-600 hover:text-orange-700"
                        title="Haberin kaynağını görüntüle"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-4 h-4 mr-2" />
                    Paylaş
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: selectedArticle.content
                      .replace(/^# /gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">')
                      .replace(/^## /gm, '<h2 class="text-xl font-semibold text-gray-800 mb-3 mt-6">')
                      .replace(/^### /gm, '<h3 class="text-lg font-medium text-gray-800 mb-2 mt-4">')
                      .replace(/^- /gm, '<li class="ml-4">')
                      .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
                  }} 
                />
              </div>
            </div>
          </div>
        ) : (
          /* News List View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Haber ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Kategoriler
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as typeof selectedCategory)}
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                        <category.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured News */}
              {selectedCategory === 'all' && featuredNews.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Öne Çıkan Haberler</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredNews.slice(0, 2).map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="cursor-pointer group"
                      >
                        <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(article.category)} mb-2`}>
                          {getCategoryName(article.category)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{article.summary}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(article.publishDate)}
                          <span className="mx-2">•</span>
                          <Eye className="w-3 h-3 mr-1" />
                          {article.viewCount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All News */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Tüm Haberler'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredNews.length} haber bulundu
                  </span>
                </div>

                <div className="space-y-6">
                  {filteredNews.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(article.category)} mr-3`}>
                              {getCategoryName(article.category)}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(article.publishDate)}</span>
                            {article.featured && (
                              <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                Öne Çıkan
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.summary}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Eye className="w-3 h-3 mr-1" />
                              {article.viewCount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredNews.length === 0 && (
                  <div className="text-center py-12">
                    <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Haber bulunamadı</h3>
                    <p className="text-gray-600">
                      Arama kriterlerinizi değiştirmeyi deneyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
