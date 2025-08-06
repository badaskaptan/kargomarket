import React, { useState } from 'react';
import { 
  Gavel, 
  FileText, 
  Shield, 
  AlertTriangle, 
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Download,
  ExternalLink,
  Scale,
  Users,
  Building
} from 'lucide-react';

interface LegalGuidePageProps {
  setActivePage?: (page: string) => void;
}

interface LegalGuide {
  id: string;
  title: string;
  category: 'ticaret' | 'sigorta' | 'sozlesme' | 'vergi' | 'uluslararasi';
  summary: string;
  content: string;
  lastUpdated: string;
  downloadUrl?: string;
  externalLink?: string;
  importance: 'high' | 'medium' | 'low';
}

const LegalGuidePage: React.FC<LegalGuidePageProps> = ({ setActivePage }) => {
  const [selectedGuide, setSelectedGuide] = useState<LegalGuide | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ticaret' | 'sigorta' | 'sozlesme' | 'vergi' | 'uluslararasi'>('all');

  const categories = [
    { id: 'all', name: 'Tüm Konular', icon: BookOpen, color: 'bg-gray-500' },
    { id: 'ticaret', name: 'Ticaret Hukuku', icon: Scale, color: 'bg-blue-500' },
    { id: 'sigorta', name: 'Sigorta & Güvence', icon: Shield, color: 'bg-green-500' },
    { id: 'sozlesme', name: 'Sözleşme Hukuku', icon: FileText, color: 'bg-purple-500' },
    { id: 'vergi', name: 'Vergi & Gümrük', icon: Building, color: 'bg-orange-500' },
    { id: 'uluslararasi', name: 'Uluslararası Hukuk', icon: Users, color: 'bg-indigo-500' }
  ];

  const legalGuides: LegalGuide[] = [
    {
      id: '1',
      title: 'Navlun Hakkı ve Tahsil Usulleri',
      category: 'ticaret',
      summary: 'Taşıyıcının navlun hakkının doğması, tahsil usulleri ve gecikme durumlarında hukuki yollar.',
      content: `
# Navlun Hakkı ve Tahsil Usulleri

## Navlun Hakkının Doğması
Navlun, taşıyıcının yükü teslim almasıyla birlikte doğan bir haktır. Türk Ticaret Kanunu'na göre:

### Temel İlkeler
- Navlun, taşıma sözleşmesinin kurucu unsurlarından biridir
- Yükün teslim alınmasıyla navlun hakkı doğar
- Hakim kusur olmadıkça navlun tahsil edilebilir

### Tahsil Usulleri
1. **Peşin Ödeme**: Yük teslim alınmadan önce ödeme
2. **Vadeli Ödeme**: Belirlenen vade tarihinde ödeme
3. **Kapıda Ödeme**: Teslimat anında ödeme

### Gecikme Durumları
- Vade tarihi geçtikten sonra yasal faiz işlemeye başlar
- İcra takibi başlatılabilir
- Yük üzerinde hapis hakkı kullanılabilir

### Hukuki Koruma
- Taşıyıcının hapis hakkı (TTK m. 862)
- İcra ve iflas hukuku yolları
- Teminat talep etme hakkı
      `,
      lastUpdated: '2025-08-01',
      importance: 'high'
    },
    {
      id: '2',
      title: 'CMR Konvansiyonu ve Sorumluluk Limitleri',
      category: 'uluslararasi',
      summary: 'Uluslararası karayolu taşımacılığında CMR hükümlerini ve sorumluluk sınırlarını düzenleyen rehber.',
      content: `
# CMR Konvansiyonu ve Sorumluluk Limitleri

## CMR Nedir?
Convention relative au contrat de transport international de marchandises par route

### Uygulama Alanı
- Uluslararası karayolu yük taşımacılığı
- En az iki ülke arasında taşıma
- Ticari nitelikli taşımalar

### Sorumluluk Limitleri
- **Genel Limit**: SDR 8,33 / kg
- **Tam Kayıp**: Brüt ağırlığın SDR ile çarpımı
- **Gecikme**: Navlunun %100'ü kadar

### Taşıyıcının Sorumluluğu
1. Tam kayıp
2. Kısmi kayıp
3. Hasar
4. Gecikme

### Muafiyet Sebepleri
- Mücbir sebep
- Yükün kendine özgü kusuru
- Gönderenin hatası
      `,
      lastUpdated: '2025-07-28',
      importance: 'high'
    },
    {
      id: '3',
      title: 'Kargo Sigortası ve Teminat Kapsamı',
      category: 'sigorta',
      summary: 'Kargo sigortası türleri, teminat kapsamları ve hasar durumlarında izlenecek prosedürler.',
      content: `
# Kargo Sigortası ve Teminat Kapsamı

## Sigorta Türleri
### 1. Nakliye Sigortası
- Yükün taşınması sırasındaki riskler
- Hırsızlık, yangın, kaza
- Doğal afetler

### 2. Sorumluluk Sigortası
- Taşıyıcının 3. şahıslara karşı sorumluluğu
- Çevre kirliliği
- Mali mesuliyet

### Teminat Kapsamı
- **Temel Teminatlar**: Yangın, çarpışma, devrilme
- **Ek Teminatlar**: Hırsızlık, soygur, doğal afet
- **İstisna Edilen Riskler**: Savaş, nükleer risk, gecikme

### Hasar Durumlarında Prosedür
1. Derhal sigorta şirketine bildirim
2. Hasar tespit tutanağı düzenleme
3. Gerekli belgelerin toplanması
4. Ekspertiz süreci
5. Tazminat ödemesi
      `,
      lastUpdated: '2025-07-25',
      importance: 'medium'
    },
    {
      id: '4',
      title: 'Gümrük Mevzuatı ve Vergi Yükümlülükleri',
      category: 'vergi',
      summary: 'İthalat-ihracat işlemlerinde gümrük prosedürleri ve vergi yükümlülükleri hakkında bilgiler.',
      content: `
# Gümrük Mevzuatı ve Vergi Yükümlülükleri

## Gümrük Rejimi
### İthalat
- Gümrük beyannamesi verme yükümlülüğü
- Gümrük vergisi hesaplama
- KDV ve ÖTV yükümlülükleri

### İhracat
- İhracat beyannamesi
- Döviz kazandırma yükümlülüğü
- İhracat teşvikleri

### Transit Rejimi
- TIR karnesi
- Gümrük mühürü
- Geçiş belgeleri

## Vergi Türleri
1. **Gümrük Vergisi**: CIF değer üzerinden
2. **KDV**: (CIF + Gümrük V.) üzerinden %20
3. **ÖTV**: Ürün türüne göre değişken

### Muafiyet ve İndirimler
- Dahilde işleme rejimi
- Serbest bölge avantajları
- Gümrük birliği kapsamında muafiyetler
      `,
      lastUpdated: '2025-07-20',
      importance: 'high'
    },
    {
      id: '5',
      title: 'Taşıma Sözleşmeleri ve Genel Şartlar',
      category: 'sozlesme',
      summary: 'Taşıma sözleşmelerinin unsurları, genel şartlar ve tipik sözleşme maddeleri.',
      content: `
# Taşıma Sözleşmeleri ve Genel Şartlar

## Sözleşme Unsurları
### Zorunlu Unsurlar
1. Tarafların kimlik bilgileri
2. Yükün cinsi ve miktarı
3. Yükleme ve boşaltma yerleri
4. Navlun miktarı
5. Teslim süresi

### İhtiyari Unsurlar
- Sigorta şartları
- Gecikme cezaları
- Özel taşıma şartları
- Hakem şartı

## Genel Şartlar
### Taşıyıcının Yükümlülükleri
- Yükü güvenli taşıma
- Belirtilen sürede teslim
- Gereğinde sigorta yaptırma

### Gönderenin Yükümlülükleri
- Navlunu ödeme
- Yükü uygun şekilde ambalajlama
- Gerekli belgeleri sağlama

### Alıcının Yükümlülükleri
- Yükü teslim alma
- Hasar durumunda ihtirazi kayıt
- Boşaltma masraflarını karşılama

## Tipik Sözleşme Maddeleri
1. Force majeure (mücbir sebep)
2. Hakem şartı
3. Uygulanacak hukuk
4. Yetki anlaşması
      `,
      lastUpdated: '2025-07-15',
      importance: 'medium'
    }
  ];

  const filteredGuides = selectedCategory === 'all' 
    ? legalGuides 
    : legalGuides.filter(guide => guide.category === selectedCategory);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'high': return 'Yüksek Öncelik';
      case 'medium': return 'Orta Öncelik';
      case 'low': return 'Düşük Öncelik';
      default: return 'Normal';
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Hukuki Rehber</h1>
                <p className="text-gray-600 mt-1">Lojistik sektöründe hukuki bilgilendirme ve rehberlik</p>
              </div>
            </div>
            <Gavel className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Hukuk Alanları
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as 'all' | 'ticaret' | 'sigorta' | 'sozlesme' | 'vergi' | 'uluslararasi')}
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

            {/* Important Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">Önemli Uyarı</h4>
                  <p className="text-xs text-orange-700">
                    Bu rehberler genel bilgilendirme amaçlıdır. Spesifik hukuki durumlar için mutlaka uzman hukuk müşavirliği alınız.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedGuide ? (
              /* Guide Detail View */
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Listeye Dön
                  </button>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGuide.title}</h2>
                      <p className="text-gray-600 mb-4">{selectedGuide.summary}</p>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getImportanceColor(selectedGuide.importance)}`}>
                          {getImportanceText(selectedGuide.importance)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Son güncelleme: {selectedGuide.lastUpdated}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {selectedGuide.downloadUrl && (
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          PDF İndir
                        </button>
                      )}
                      {selectedGuide.externalLink && (
                        <button className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Kaynak
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="prose max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: selectedGuide.content
                          .replace(/^# /gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">')
                          .replace(/^## /gm, '<h2 class="text-xl font-semibold text-gray-800 mb-3 mt-6">')
                          .replace(/^### /gm, '<h3 class="text-lg font-medium text-gray-800 mb-2 mt-4">')
                          .replace(/^- /gm, '<li class="ml-4">')
                          .replace(/^\d+\. /gm, '<li class="ml-4 list-decimal">')
                      }} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Guides List View */
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {categories.find(c => c.id === selectedCategory)?.name || 'Tüm Konular'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {filteredGuides.length} rehber bulundu
                    </span>
                  </div>

                  <div className="grid gap-6">
                    {filteredGuides.map((guide) => (
                      <div
                        key={guide.id}
                        onClick={() => setSelectedGuide(guide)}
                        className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 mr-3">{guide.title}</h3>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getImportanceColor(guide.importance)}`}>
                                {getImportanceText(guide.importance)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{guide.summary}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="mr-4">Son güncelleme: {guide.lastUpdated}</span>
                              <span className="capitalize">
                                {categories.find(c => c.id === guide.category)?.name}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalGuidePage;
