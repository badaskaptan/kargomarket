import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Truck, 
  Ship, 
  Plane, 
  Train,
  ChevronRight,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface LogisticsDictionaryPageProps {
  setActivePage?: (page: string) => void;
}

interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'karayolu' | 'deniz' | 'hava' | 'demir' | 'genel';
  subcategory?: string;
  relatedTerms?: string[];
  examples?: string[];
}

const LogisticsDictionaryPage: React.FC<LogisticsDictionaryPageProps> = ({ setActivePage }) => {
  const initialCategory = 'genel' as 'karayolu' | 'deniz' | 'hava' | 'demir' | 'genel';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'karayolu' | 'deniz' | 'hava' | 'demir' | 'genel'>(initialCategory);
  const [selectedTerm, setSelectedTerm] = useState<DictionaryTerm | null>(null);
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);

  const categories = [
    { id: 'genel', name: 'Genel Terimler', icon: BookOpen, color: 'bg-gray-500' },
    { id: 'karayolu', name: 'Karayolu', icon: Truck, color: 'bg-green-500' },
    { id: 'deniz', name: 'Deniz Yolu', icon: Ship, color: 'bg-blue-500' },
    { id: 'hava', name: 'Hava Yolu', icon: Plane, color: 'bg-sky-500' },
    { id: 'demir', name: 'Demir Yolu', icon: Train, color: 'bg-gray-600' }
  ];

  // Kapsamlı terimler sözlüğü
  useEffect(() => {
    const dictionaryTerms: DictionaryTerm[] = [
      // Genel Terimler
      {
        id: '1',
        term: 'Navlun',
        definition: 'Yük taşımacılığında taşıyıcıya ödenen ücret. Freight olarak da bilinir.',
        category: 'genel',
        subcategory: 'Finansal',
        examples: ['Konteyner navlunu $2,500', 'Kuru yük navlun oranı ton başına $45'],
        relatedTerms: ['Freight', 'Taşıma Ücreti', 'Kargo Bedeli']
      },
      {
        id: '2',
        term: 'FOB (Free on Board)',
        definition: 'Satıcının malı gemiye yüklemekle yükümlülüklerinin sona erdiği teslimat şekli.',
        category: 'genel',
        subcategory: 'Ticaret Terimleri',
        examples: ['FOB İstanbul', 'FOB Shanghai'],
        relatedTerms: ['CIF', 'EXW', 'DDP']
      },
      {
        id: '3',
        term: 'CIF (Cost, Insurance and Freight)',
        definition: 'Satıcının malın masrafını, sigortasını ve navlununu karşıladığı teslimat şekli.',
        category: 'genel',
        subcategory: 'Ticaret Terimleri',
        examples: ['CIF Hamburg', 'CIF New York'],
        relatedTerms: ['FOB', 'CFR', 'DDP']
      },
      {
        id: '4',
        term: 'Bill of Lading (Konşimento)',
        definition: 'Deniz taşımacılığında yükün teslim alındığını belgeleyen ve taşıma sözleşmesi niteliği taşıyan belge.',
        category: 'deniz',
        subcategory: 'Belgeler',
        examples: ['Master B/L', 'House B/L', 'Express B/L'],
        relatedTerms: ['Konşimento', 'Freight Receipt', 'Cargo Receipt']
      },
      
      // Karayolu Terimleri
      {
        id: '5',
        term: 'CMR',
        definition: 'Uluslararası karayolu yük taşımacılığına ilişkin sözleşme belgesi.',
        category: 'karayolu',
        subcategory: 'Belgeler',
        examples: ['CMR formu', 'Elektronik CMR'],
        relatedTerms: ['Taşıma Belgesi', 'Freight Document']
      },
      {
        id: '6',
        term: 'Tır',
        definition: 'Uluslararası karayolu taşımacılığında kullanılan çekici ve dorsesi olan büyük araç.',
        category: 'karayolu',
        subcategory: 'Araçlar',
        examples: ['40 tonluk tır', 'Soğutmalı tır'],
        relatedTerms: ['Kamyon', 'Çekici', 'Dorse']
      },
      {
        id: '7',
        term: 'ADR',
        definition: 'Tehlikeli maddelerin karayoluyla uluslararası taşınmasına dair Avrupa anlaşması.',
        category: 'karayolu',
        subcategory: 'Regülasyon',
        examples: ['ADR sertifikası', 'ADR sınıf 3 (yanıcı sıvılar)'],
        relatedTerms: ['Tehlikeli Madde', 'IMDG', 'IATA-DGR']
      },
      
      // Deniz Yolu Terimleri
      {
        id: '8',
        term: 'TEU (Twenty-foot Equivalent Unit)',
        definition: '20 feet uzunluğundaki standart konteyner birimine denk gelen ölçü birimi.',
        category: 'deniz',
        subcategory: 'Konteyner',
        examples: ['Gemi kapasitesi 18,000 TEU', '1 adet 40\' konteyner = 2 TEU'],
        relatedTerms: ['FEU', 'Konteyner', 'Container']
      },
      {
        id: '9',
        term: 'Demurrage',
        definition: 'Konteyner veya geminin belirlenen süreyi aşan kullanımı için ödenen ceza ücreti.',
        category: 'deniz',
        subcategory: 'Finansal',
        examples: ['Günlük $100 demurrage', 'Free time 7 gün'],
        relatedTerms: ['Detention', 'Free Time', 'Storage']
      },
      {
        id: '10',
        term: 'Bunker',
        definition: 'Gemilerde yakıt olarak kullanılan heavy fuel oil veya marine gas oil.',
        category: 'deniz',
        subcategory: 'Yakıt',
        examples: ['Bunker fiyatı $580/MT', 'Low sulfur bunker'],
        relatedTerms: ['Marine Fuel', 'HFO', 'MGO']
      },
      
      // Hava Yolu Terimleri
      {
        id: '11',
        term: 'AWB (Air Waybill)',
        definition: 'Hava kargo taşımacılığında kullanılan taşıma belgesi.',
        category: 'hava',
        subcategory: 'Belgeler',
        examples: ['MAWB (Master AWB)', 'HAWB (House AWB)'],
        relatedTerms: ['Air Cargo Receipt', 'Freight Document']
      },
      {
        id: '12',
        term: 'Chargeable Weight',
        definition: 'Hava kargoda ücretlendirme için kullanılan ağırlık (ağırlık veya hacimsel ağırlıktan büyük olanı).',
        category: 'hava',
        subcategory: 'Ölçüm',
        examples: ['Actual weight: 100kg, Volume weight: 150kg → Chargeable: 150kg'],
        relatedTerms: ['Volumetric Weight', 'Gross Weight', 'Dimensional Weight']
      },
      {
        id: '13',
        term: 'ULD (Unit Load Device)',
        definition: 'Hava kargosunda kullanılan standart yükleme cihazları (konteyner ve palet).',
        category: 'hava',
        subcategory: 'Ekipman',
        examples: ['AKE konteyner', 'PMC palet'],
        relatedTerms: ['Air Container', 'Air Pallet', 'Loading Device']
      },
      
      // Demir Yolu Terimleri
      {
        id: '14',
        term: 'Vagon',
        definition: 'Demir yolu taşımacılığında yük taşıyan araç.',
        category: 'demir',
        subcategory: 'Araçlar',
        examples: ['Kapalı vagon', 'Açık vagon', 'Tank vagon', 'Soğutmalı vagon'],
        relatedTerms: ['Freight Car', 'Railroad Car', 'Railway Wagon']
      },
      {
        id: '15',
        term: 'Intermodal',
        definition: 'Birden fazla taşıma türünün birlikte kullanıldığı taşımacılık sistemi.',
        category: 'demir',
        subcategory: 'Sistem',
        examples: ['Tren + kamyon kombine taşımacılık', 'RoRo + demir yolu'],
        relatedTerms: ['Multimodal', 'Combined Transport', 'Piggyback']
      }
    ];

    setTerms(dictionaryTerms);
  }, []);

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'genel' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
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
                <h1 className="text-3xl font-bold text-gray-900">Logistik Sözlük</h1>
                <p className="text-gray-600 mt-1">Taşımacılık sektörü terimlerinin kapsamlı sözlüğü</p>
              </div>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Terim ara..."
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
                    onClick={() => setSelectedCategory(category.id as 'karayolu' | 'deniz' | 'hava' | 'demir' | 'genel')}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                      <category.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedTerm ? (
              /* Term Detail View */
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="flex items-center text-orange-600 hover:text-orange-700 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Listeye Dön
                </button>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(selectedTerm.category)} mr-3`}>
                      {categories.find(c => c.id === selectedTerm.category)?.name}
                    </span>
                    {selectedTerm.subcategory && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {selectedTerm.subcategory}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedTerm.term}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">{selectedTerm.definition}</p>
                </div>

                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Örnekler</h3>
                    <ul className="space-y-2">
                      {selectedTerm.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">İlgili Terimler</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium cursor-pointer hover:bg-orange-200 transition-colors"
                          onClick={() => setSearchTerm(relatedTerm)}
                        >
                          {relatedTerm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Terms List View */
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {categories.find(c => c.id === selectedCategory)?.name} Terimleri
                    </h2>
                    <span className="text-sm text-gray-500">
                      {filteredTerms.length} terim bulundu
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {filteredTerms.map((term) => (
                      <div
                        key={term.id}
                        onClick={() => setSelectedTerm(term)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 mr-3">{term.term}</h3>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(term.category)}`}>
                                {categories.find(c => c.id === term.category)?.name}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{term.definition}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredTerms.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Terim bulunamadı</h3>
                      <p className="text-gray-600">
                        Arama kriterlerinizi değiştirmeyi deneyin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDictionaryPage;
