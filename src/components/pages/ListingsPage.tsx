import React, { useState } from 'react';
import { Search, Filter, MapPin, Package, Clock, Eye, Star, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import LiveMap from '../common/LiveMap.tsx';
import { listings, type Listing } from '../../data/listings';

interface ListingsPageProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
}

const ListingsPage: React.FC<ListingsPageProps> = ({ isLoggedIn = false, onLogin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTransport, setSelectedTransport] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSelfOfferWarning, setShowSelfOfferWarning] = useState(false);

  // Teklif Ver Modalı için state
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOfferForm, setNewOfferForm] = useState({
    listingId: '',
    price: '',
    description: '',
    transportResponsible: '',
    origin: '',
    destination: '',
    files: [] as File[]
  });
  // Mesaj modalı için state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<any>(null);

  // Simulated current user ID - gerçek uygulamada authentication context'ten gelecek
  const currentUserId = 'user_123'; // Bu değer gerçek uygulamada auth context'ten gelecek

  const categories = [
    { id: 'all', label: 'Tüm İlanlar', count: 156 },
    { id: 'cargo-trade', label: 'Yük Alım Satım', count: 89 },
    { id: 'transport-request', label: 'Nakliye Talebi', count: 34 },
    { id: 'transport-service', label: 'Nakliye İlanları', count: 33 }
  ];

  const transportModes = [
    { id: 'all', label: 'Tüm Taşıma' },
    { id: 'road', label: 'Karayolu' },
    { id: 'sea', label: 'Denizyolu' },
    { id: 'air', label: 'Havayolu' },
    { id: 'rail', label: 'Demiryolu' }
  ];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.loadType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || listing.category === activeCategory;
    
    const matchesTransport = selectedTransport === 'all' || 
                            listing.transportMode === selectedTransport;
    
    return matchesSearch && matchesCategory && matchesTransport;
  });

  const stats = [
    { label: 'Toplam İlan', value: '1,247', color: 'text-blue-600' },
    { label: 'Bugün Yeni', value: '89', color: 'text-green-600' },
    { label: 'Aktif Nakliyeci', value: '3,456', color: 'text-purple-600' },
    { label: 'Tamamlanan', value: '12,890', color: 'text-orange-600' }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'all': 'bg-gray-100 text-gray-700 border-gray-200',
      'cargo-trade': 'bg-blue-100 text-blue-700 border-blue-200',
      'transport-request': 'bg-green-100 text-green-700 border-green-200',
      'transport-service': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[category as keyof typeof colors] || colors.all;
  };

  const getListingTypeColor = (type: string) => {
    const colors = {
      'Satış İlanı': 'bg-blue-100 text-blue-800',
      'Alım İlanı': 'bg-green-100 text-green-800',
      'Nakliye Talebi': 'bg-orange-100 text-orange-800',
      'Nakliye Hizmeti': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isOwnListing = (listing: any) => {
    return isLoggedIn && listing.ownerId === currentUserId;
  };

  // Teklif Ver butonu işlevi
  const handleShowOffer = (listing: any) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (listing.ownerId === currentUserId) {
      setShowSelfOfferWarning(true);
      return;
    }
    setNewOfferForm({
      listingId: listing.id?.toString() || '',
      price: '',
      description: '',
      transportResponsible: '',
      origin: '',
      destination: '',
      files: []
    });
    setShowNewOfferModal(true);
  };
  // Mesaj Gönder butonu işlevi
  const handleShowMessage = (listing: any) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (listing.ownerId === currentUserId) {
      setShowSelfOfferWarning(true);
      return;
    }
    setMessageTarget(listing);
    setShowMessageModal(true);
  };
  // Dosya yükleme
  const handleNewOfferFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
    }
  };
  // Teklif formu submit
  const handleNewOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferForm.price || !newOfferForm.transportResponsible || !newOfferForm.origin || !newOfferForm.destination) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }
    alert('Teklif gönderildi!');
    setShowNewOfferModal(false);
  };
  // Mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    alert('Mesaj gönderildi!');
    setShowMessageModal(false);
    setMessageText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Güncel <span className="text-primary-600">Yük ve Nakliye İlanları</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Binlerce aktif ilan arasından size en uygun olanını bulun
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${
                  activeCategory === category.id
                    ? getCategoryColor(category.id).replace('100', '200').replace('700', '800') + ' shadow-lg'
                    : getCategoryColor(category.id) + ' hover:shadow-md'
                }`}
              >
                <span>{category.label}</span>
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="İlan, şehir veya yük tipi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Transport Mode Filter */}
            <select
              value={selectedTransport}
              onChange={(e) => setSelectedTransport(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              title="Taşıma modu seçin"
            >
              {transportModes.map(mode => (
                <option key={mode.id} value={mode.id}>{mode.label}</option>
              ))}
            </select>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center transform hover:scale-105"
            >
              <Filter size={20} className="mr-2" />
              Filtreler
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ağırlık Aralığı</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min (ton)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    <input type="number" placeholder="Max (ton)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat Aralığı</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min (₺)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    <input type="number" placeholder="Max (₺)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" 
                    title="Tarih seçin"
                    placeholder="Tarih seçin"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold" title="İlan No">
                        {listing.ilanNo}
                      </span>
                      {listing.urgent && (
                        <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          <Clock size={12} className="mr-1" />
                          Acil
                        </div>
                      )}
                      {/* İlan sahibi göstergesi */}
                      {isOwnListing(listing) && (
                        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Sizin İlanınız
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
                      {listing.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{listing.price}</div>
                    <div className="text-xs text-gray-500">{listing.offers} teklif</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={14} className="mr-2 text-primary-500" />
                    <span className="text-sm">{listing.route}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package size={14} className="mr-2 text-primary-500" />
                    <span className="text-sm">{listing.loadType} • {listing.weight} • {listing.volume}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={14} className="mr-2 text-primary-500" />
                    <span className="text-sm">{listing.publishDate}</span>
                  </div>
                </div>

                {/* Contact Info - Sadece giriş yapan kullanıcılar için */}
                {isLoggedIn ? (
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-medium">
                          {listing.contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{listing.contact.name}</div>
                        <div className="text-xs text-gray-500">{listing.contact.company}</div>
                        <div className="text-xs text-gray-500">{listing.contact.phone}</div>
                        <div className="text-xs text-gray-500">{listing.contact.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm font-medium text-gray-700 ml-1">{listing.contact.rating}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center text-yellow-800">
                      <LogIn size={16} className="mr-2" />
                      <span className="text-sm font-medium">İletişim bilgilerini görmek için giriş yapın</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mini Map */}
              <div className="h-32 border-t border-gray-100">
                <LiveMap 
                  coordinates={[listing.coordinates]}
                  height="128px"
                  onClick={() => setSelectedListing(listing)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShowOffer(listing)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${
                      isOwnListing(listing) 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                    disabled={isOwnListing(listing)}
                  >
                    {isLoggedIn 
                      ? isOwnListing(listing) 
                        ? 'Kendi İlanınız' 
                        : 'Teklif Ver' 
                      : 'Giriş Yap'}
                  </button>
                  <button 
                    onClick={() => setSelectedListing(listing)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105"
                    title="Detayları Görüntüle"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleShowMessage(listing)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${
                      isOwnListing(listing) 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isOwnListing(listing)}
                    title="Mesaj Gönder"
                  >
                    {isLoggedIn 
                      ? isOwnListing(listing) 
                        ? 'Kendi İlanınız' 
                        : 'Mesaj Gönder' 
                      : 'Giriş Yap'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl">
            Daha Fazla İlan Yükle
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sıkça Sorulan Sorular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">İlan nasıl verebilirim?</h3>
              <p className="text-gray-600 text-sm">Üye olduktan sonra "Yeni İlan" butonuna tıklayarak kolayca ilan verebilirsiniz.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Teklif verme ücreti var mı?</h3>
              <p className="text-gray-600 text-sm">Hayır, teklif vermek tamamen ücretsizdir. Sadece anlaştığınızda komisyon alınır.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Güvenlik nasıl sağlanıyor?</h3>
              <p className="text-gray-600 text-sm">Tüm üyelerimiz doğrulanır ve işlemler sigorta güvencesi altındadır.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ödeme nasıl yapılır?</h3>
              <p className="text-gray-600 text-sm">Güvenli ödeme sistemi ile kredi kartı, havale veya çek ile ödeme yapabilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            >
              ×
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="text-primary-600" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Giriş Gerekli</h3>
              <p className="text-gray-600 mb-6">
                Teklif vermek ve iletişim bilgilerini görmek için giriş yapmanız gerekiyor.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    onLogin?.();
                  }}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center"
                >
                  <LogIn size={18} className="mr-2" />
                  Giriş Yap
                </button>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    onLogin?.();
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors transform hover:scale-105 flex items-center justify-center"
                >
                  <UserPlus size={18} className="mr-2" />
                  Üye Ol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self Offer Warning Modal */}
      {showSelfOfferWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full">
            <button
              onClick={() => setShowSelfOfferWarning(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            >
              ×
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">İşlem Yapılamaz</h3>
              <p className="text-gray-600 mb-6">
                Kendi ilanınıza teklif veremez veya mesaj gönderemezsiniz. Bu bir güvenlik önlemidir.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowSelfOfferWarning(false)}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105"
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            >
              ×
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedListing.urgent && (
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock size={16} className="mr-1" />
                        Acil İlan
                      </div>
                    )}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getListingTypeColor(selectedListing.listingType ?? '')}`}>
                      {selectedListing.listingType}
                    </div>
                    
                    {/* İlan sahibi göstergesi */}
                    {isOwnListing(selectedListing) && (
                      <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Sizin İlanınız
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedListing.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={18} className="mr-2 text-primary-500" />
                    <span className="text-lg">{selectedListing.route}</span>
                  </div>
                  <div className="text-sm text-gray-500">{selectedListing.publishDate} yayınlandı</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Yük Detayları</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Yük Tipi:</span>
                      <div className="font-medium">{selectedListing.loadType}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Ağırlık:</span>
                      <div className="font-medium">{selectedListing.weight}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Hacim:</span>
                      <div className="font-medium">{selectedListing.volume}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Taşıma Modu:</span>
                      <div className="font-medium capitalize">{selectedListing.transportMode === 'road' ? 'Karayolu' : selectedListing.transportMode}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Açıklama</h4>
                  <p className="text-gray-700">{selectedListing.description}</p>
                </div>

                {/* İletişim Bilgileri - Sadece giriş yapan kullanıcılar için */}
                {isLoggedIn ? (
                  <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">İletişim Bilgileri</h4>
                      <div className="flex items-center">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-sm font-medium text-gray-700 ml-1">{selectedListing.contact.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>İsim:</strong> {selectedListing.contact.name}</div>
                      <div><strong>Firma:</strong> {selectedListing.contact.company}</div>
                      <div><strong>Telefon:</strong> {selectedListing.contact.phone}</div>
                      <div><strong>E-posta:</strong> {selectedListing.contact.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center text-yellow-800 mb-3">
                      <LogIn size={20} className="mr-2" />
                      <h4 className="font-semibold">İletişim Bilgileri</h4>
                    </div>
                    <p className="text-yellow-700 text-sm mb-4">
                      İletişim bilgilerini görmek ve teklif vermek için giriş yapmanız gerekiyor.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedListing(null);
                        setShowLoginModal(true);
                      }}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Giriş Yap
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                {/* Large Map */}
                <div className="mb-6 h-80 rounded-lg overflow-hidden border border-gray-200">
                  <LiveMap 
                    coordinates={[selectedListing.coordinates, selectedListing.destination]}
                    height="320px"
                    showRoute={true}
                  />
                </div>

                {/* Price and Offers */}
                <div className="bg-white border-2 border-primary-200 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{selectedListing.price}</div>
                    <div className="text-gray-600 mb-4">{selectedListing.offers} teklif alındı</div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleShowOffer(selectedListing)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${
                          isOwnListing(selectedListing) 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isLoggedIn 
                          ? isOwnListing(selectedListing) 
                            ? 'Kendi İlanınız' 
                            : 'Teklif Ver' 
                          : 'Giriş Yap'}
                      </button>
                      <button 
                        onClick={() => handleShowMessage(selectedListing)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${
                          isOwnListing(selectedListing) 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isLoggedIn 
                          ? isOwnListing(selectedListing) 
                            ? 'Kendi İlanınız' 
                            : 'Mesaj Gönder' 
                          : 'Giriş Yap'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Güvenlik Bilgileri</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Doğrulanmış üye
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Sigorta güvencesi
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Güvenli ödeme sistemi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teklif Ver Modalı */}
      {showNewOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative">
            <button onClick={() => setShowNewOfferModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
              ×
            </button>
            <h3 className="text-xl font-bold mb-6">Yeni Teklif Ver</h3>
            <form onSubmit={handleNewOfferSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">İlan</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900"
                  value={newOfferForm.listingId}
                  disabled
                  readOnly
                  title="İlan Numarası"
                  aria-label="İlan Numarası"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nakliye Kime Ait</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={newOfferForm.transportResponsible}
                  onChange={e => setNewOfferForm(f => ({ ...f, transportResponsible: e.target.value }))}
                  required
                  title="Nakliye Kime Ait"
                  aria-label="Nakliye Kime Ait"
                >
                  <option value="">Seçiniz</option>
                  <option value="Alıcı">Alıcı</option>
                  <option value="Satıcı">Satıcı</option>
                  <option value="Nakliye Gerekmiyor">Nakliye Gerekmiyor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kalkış Noktası</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newOfferForm.origin}
                  onChange={e => setNewOfferForm(f => ({ ...f, origin: e.target.value }))}
                  required
                  title="Kalkış Noktası"
                  placeholder="Kalkış Noktası"
                  aria-label="Kalkış Noktası"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Varış Noktası</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newOfferForm.destination}
                  onChange={e => setNewOfferForm(f => ({ ...f, destination: e.target.value }))}
                  required
                  title="Varış Noktası"
                  placeholder="Varış Noktası"
                  aria-label="Varış Noktası"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teklif Tutarı</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newOfferForm.price}
                  onChange={e => setNewOfferForm(f => ({ ...f, price: e.target.value }))}
                  required
                  min="0"
                  title="Teklif Tutarı"
                  placeholder="Teklif Tutarı"
                  aria-label="Teklif Tutarı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  value={newOfferForm.description}
                  onChange={e => setNewOfferForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  title="Açıklama"
                  placeholder="Açıklama"
                  aria-label="Açıklama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Evrak ve Resim Yükle</label>
                <input
                  type="file"
                  className="w-full border rounded-lg px-3 py-2"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleNewOfferFileChange}
                  title="Evrak ve Resim Yükle"
                  aria-label="Evrak ve Resim Yükle"
                />
                {newOfferForm.files && newOfferForm.files.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                    {newOfferForm.files.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
                Teklif Ver
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mesaj Gönder Modalı */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative">
            <button onClick={() => setShowMessageModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">Mesaj Gönder</h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alıcı</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  value={messageTarget?.contact?.name || messageTarget?.contact || ''}
                  disabled
                  readOnly
                  title="Alıcı"
                  aria-label="Alıcı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mesajınız</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={3}
                  required
                  title="Mesajınız"
                  placeholder="Mesajınızı yazın..."
                  aria-label="Mesajınız"
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;