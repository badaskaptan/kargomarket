import React, { useState } from 'react';
import { Search, Filter, MapPin, Package, Clock } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import CreateOfferModal from '../modals/CreateOfferModal';
import { useListings } from '../../hooks/useListings';
import { translateLoadType, translateTransportMode } from '../../utils/translationUtils';
import type { ExtendedListing } from '../../types/database-types';

const ListingsPage: React.FC = () => {
  const { isLoggedIn, login, register, googleLogin, user } = useAuth();
  const { listings, loading, error } = useListings(50);
  
  // State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTransport, setSelectedTransport] = useState('all');
  const [selectedOfferListing, setSelectedOfferListing] = useState<ExtendedListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSelfOfferWarning, setShowSelfOfferWarning] = useState(false);

  const currentUserId = user?.id || '';

  // Categories
  const categories = [
    { id: 'all', label: 'Tüm İlanlar', count: listings.length },
    { id: 'load_listing', label: 'Yük İlanları', count: listings.filter(l => l.listing_type === 'load_listing').length },
    { id: 'shipment_request', label: 'Nakliye Talebi', count: listings.filter(l => l.listing_type === 'shipment_request').length },
    { id: 'transport_service', label: 'Nakliye Hizmeti', count: listings.filter(l => l.listing_type === 'transport_service').length }
  ];

  const transportModes = [
    { id: 'all', label: 'Tümü' },
    { id: 'road', label: 'Karayolu' },
    { id: 'rail', label: 'Demiryolu' },
    { id: 'sea', label: 'Deniz' },
    { id: 'air', label: 'Hava' }
  ];

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await register(fullName, email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Utility functions
  const isOwnListing = (listing: ExtendedListing) => {
    return listing.user_id === currentUserId;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'load_listing': 'Yük İlanı',
      'shipment_request': 'Nakliye Talebi', 
      'transport_service': 'Nakliye Hizmeti'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'load_listing': 'bg-blue-100 text-blue-800',
      'shipment_request': 'bg-green-100 text-green-800',
      'transport_service': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || listing.listing_type === activeCategory;
    const matchesTransport = selectedTransport === 'all' || listing.transport_mode === selectedTransport;
    
    return matchesSearch && matchesCategory && matchesTransport;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İlanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">İlanlar</h1>
              <p className="text-gray-600">Aktif yük ve nakliye ilanları</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="İlan ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-80"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={20} />
                Filtreler
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    title="Kategori Seçimi"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taşıma Modu</label>
                  <select
                    value={selectedTransport}
                    onChange={(e) => setSelectedTransport(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    title="Taşıma Modu Seçimi"
                  >
                    {transportModes.map(mode => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">İlan bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.listing_type)}`}>
                          {getTypeLabel(listing.listing_type)}
                        </span>
                        {listing.transport_mode && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {translateTransportMode(listing.transport_mode)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                      
                      {/* Route */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={16} className="mr-1 text-primary-500" />
                        <span className="text-sm">{listing.origin} → {listing.destination}</span>
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-1 text-sm text-gray-600">
                        {listing.load_type && (
                          <div>Yük Tipi: <span className="font-medium">{translateLoadType(listing.load_type)}</span></div>
                        )}
                        {listing.weight_value && (
                          <div>Ağırlık: <span className="font-medium">{listing.weight_value} {listing.weight_unit}</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                  )}

                  {/* Price */}
                  {listing.price_amount && (
                    <div className="mb-4">
                      <div className="text-lg font-bold text-primary-600">
                        {listing.price_amount} {listing.price_currency}
                        {listing.price_per && <span className="text-sm text-gray-500">/{listing.price_per}</span>}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          setAuthModalOpen(true);
                          return;
                        }
                        if (isOwnListing(listing)) {
                          setShowSelfOfferWarning(true);
                          return;
                        }
                        setSelectedOfferListing(listing);
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
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
                  </div>

                  {/* Timestamp */}
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>{listing.created_at ? new Date(listing.created_at).toLocaleDateString('tr-TR') : 'Tarih bilinmiyor'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Self Offer Warning Modal */}
      {showSelfOfferWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Uyarı</h3>
            <p className="text-gray-600 mb-6">Kendi ilanınıza teklif veremezsiniz.</p>
            <button
              onClick={() => setShowSelfOfferWarning(false)}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />

      {/* Create Offer Modal */}
      {selectedOfferListing && (
        <CreateOfferModal 
          listing={selectedOfferListing}
          isOpen={true}
          onClose={() => setSelectedOfferListing(null)}
          onSubmit={async () => {}}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default ListingsPage;
