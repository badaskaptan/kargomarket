import React, { useState } from 'react';
import { Search, Clock, MapPin, Package, Eye, X, LogIn } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import LoadListingDetailModal from '../modals/LoadListingDetailModal';
import ShipmentRequestDetailModal from '../modals/ShipmentRequestDetailModal';
import TransportServiceDetailModal from '../modals/TransportServiceDetailModal';
import CreateOfferModal from '../modals/CreateOfferModal';
import CreateServiceOfferModal from '../modals/CreateServiceOfferModal';
import { useListings } from '../../hooks/useListings';
import { OfferService } from '../../services/offerService';
import type { ExtendedListing, TransportService, Database } from '../../types/database-types';
import { translateLoadType } from '../../utils/translationUtils';
import toast from 'react-hot-toast';

const ListingsPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, login, register, googleLogin } = useAuth();
  const { listings, loading, error } = useListings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Dual Modal System States
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showCreateServiceOfferModal, setShowCreateServiceOfferModal] = useState(false);
  
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<ExtendedListing | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'load_listing' | 'shipment_request' | 'transport_service'>('all');
  const isLoggedIn = !!user;

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

  const filteredListings = listings.filter((listing: ExtendedListing) => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || listing.listing_type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Tab counts for display
  const tabCounts = {
    all: listings.length,
    load_listing: listings.filter(l => l.listing_type === 'load_listing').length,
    shipment_request: listings.filter(l => l.listing_type === 'shipment_request').length,
    transport_service: listings.filter(l => l.listing_type === 'transport_service').length
  };

  // Tab helper functions
  const getTabInfo = () => {
    switch (activeTab) {
      case 'load_listing':
        return {
          title: 'Yük İlanları',
          description: 'Taşınmak istenen yükler',
          emptyMessage: 'Henüz yük ilanı bulunmuyor.',
          icon: Package
        };
      case 'shipment_request':
        return {
          title: 'Nakliye Talepleri',
          description: 'Nakliye hizmeti arayanlar',
          emptyMessage: 'Henüz nakliye talebi bulunmuyor.',
          icon: Clock
        };
      case 'transport_service':
        return {
          title: 'Nakliye Hizmetleri',
          description: 'Nakliye hizmeti verenler',
          emptyMessage: 'Henüz nakliye hizmeti ilanı bulunmuyor.',
          icon: MapPin
        };
      default:
        return {
          title: 'Tüm İlanlar',
          description: 'Aktif yük ve nakliye ilanları',
          emptyMessage: 'Henüz ilan bulunmuyor.',
          icon: Search
        };
    }
  };

  const isOwnListing = (listing: ExtendedListing) => {
    if (!listing || !user?.id) return false;
    return listing.user_id === user.id;
  };

  // Helper functions to map database fields to HomePage interface
  const getListingDisplayData = (listing: ExtendedListing) => ({
    ilanNo: listing.listing_number,
    title: listing.title,
    route: `${listing.origin} → ${listing.destination}`,
    loadType: listing.load_type || '',
    weight: listing.weight_value ? `${listing.weight_value} ${listing.weight_unit || 'kg'}` : 'Belirtilmemiş',
    price: listing.price_amount ? `₺${listing.price_amount.toLocaleString()}` : 'Fiyat belirtilmemiş',
    offers: listing.offer_count || 0,
    urgent: listing.is_urgent || false,
    contact: {
      name: listing.owner_name || 'Bilinmiyor',
      company: listing.owner_company || '',
      phone: listing.owner_phone || '',
      email: listing.owner_email || ''
    }
  });

  // Get listing type badge info
  const getListingTypeBadge = (listingType: string) => {
    switch (listingType) {
      case 'load_listing':
        return {
          label: 'Yük İlanı',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'shipment_request':
        return {
          label: 'Nakliye Talebi',
          className: 'bg-green-100 text-green-800'
        };
      case 'transport_service':
        return {
          label: 'Nakliye Hizmeti',
          className: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          label: 'İlan',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const handleShowDetails = (listing: ExtendedListing) => {
    setSelectedListing(listing);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedListing(null);
  };

  // Convert ExtendedListing to TransportService for transport service modal
  const convertToTransportService = (listing: ExtendedListing): TransportService => {
    // transport_details'ten tüm transport service bilgilerini al
    const transportDetails = (listing.transport_details as Record<string, unknown>) || {};
    
    return {
      id: listing.id,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      user_id: listing.user_id,
      service_number: listing.listing_number,
      title: listing.title,
      description: listing.description || null,
      status: listing.status === 'active' ? 'active' : 'inactive',
      transport_mode: listing.transport_mode || 'road',
      vehicle_type: transportDetails?.vehicle_type || listing.vehicle_types?.[0] || null,
      origin: listing.origin || null,
      destination: listing.destination || null,
      available_from_date: listing.available_from_date,
      available_until_date: listing.available_until_date,
      capacity_value: listing.weight_value || null,
      capacity_unit: listing.weight_unit || 'kg',
      contact_info: listing.owner_phone ? `Tel: ${listing.owner_phone}${listing.owner_email ? `\nE-posta: ${listing.owner_email}` : ''}${listing.owner_company ? `\nŞirket: ${listing.owner_company}` : ''}` : null,
      company_name: listing.owner_company || transportDetails?.company_name || null,
      
      // Karayolu özel alanları
      plate_number: transportDetails?.plate_number || null,
      
      // Denizyolu özel alanları
      ship_name: transportDetails?.ship_name || null,
      imo_number: transportDetails?.imo_number || null,
      mmsi_number: transportDetails?.mmsi_number || null,
      dwt: transportDetails?.dwt || null,
      gross_tonnage: transportDetails?.gross_tonnage || null,
      net_tonnage: transportDetails?.net_tonnage || null,
      ship_dimensions: transportDetails?.ship_dimensions || null,
      freight_type: transportDetails?.freight_type || null,
      charterer_info: transportDetails?.charterer_info || null,
      ship_flag: transportDetails?.ship_flag || null,
      home_port: transportDetails?.home_port || null,
      year_built: transportDetails?.year_built || null,
      speed_knots: transportDetails?.speed_knots || null,
      fuel_consumption: transportDetails?.fuel_consumption || null,
      ballast_capacity: transportDetails?.ballast_capacity || null,
      
      // Havayolu özel alanları
      flight_number: transportDetails?.flight_number || null,
      aircraft_type: transportDetails?.aircraft_type || null,
      max_payload: transportDetails?.max_payload || null,
      cargo_volume: transportDetails?.cargo_volume || null,
      
      // Demiryolu özel alanları
      train_number: transportDetails?.train_number || null,
      wagon_count: transportDetails?.wagon_count || null,
      wagon_types: transportDetails?.wagon_types || null,
      
      // Diğer alanlar
      required_documents: transportDetails?.required_documents || null,
      document_urls: transportDetails?.document_urls || null,
      rating: transportDetails?.rating || 0,
      rating_count: transportDetails?.rating_count || 0,
      view_count: listing.view_count || 0,
      last_updated_by: listing.user_id,
      is_featured: transportDetails?.is_featured || listing.is_urgent || false,
      featured_until: transportDetails?.featured_until || null,
      created_by_user_type: null,
      last_activity_at: listing.updated_at
    } as unknown as TransportService;
  };

  // Dual Modal Handlers
  const handleShowOffer = (listing: ExtendedListing) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    
    if (isOwnListing(listing)) {
      toast.error('Kendi ilanınıza teklif veremezsiniz!');
      return;
    }

    // Transport service için ayrı modal
    if (listing.listing_type === 'transport_service') {
      setSelectedListing(listing);
      setShowCreateServiceOfferModal(true);
    } else {
      // Load listing ve shipment request için normal offer modal
      setSelectedListing(listing);
      setShowCreateOfferModal(true);
    }
  };

  // Detail modal içinden teklif verme handler'ı - modal karışıklığını önler
  const handleShowOfferFromDetail = (listing: ExtendedListing) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    
    if (isOwnListing(listing)) {
      toast.error('Kendi ilanınıza teklif veremezsiniz!');
      return;
    }

    // Önce detail modal'ı kapat
    setShowDetailModal(false);
    
    // Kısa bir delay ile offer modal'ı aç (smooth transition için)
    setTimeout(() => {
      if (listing.listing_type === 'transport_service') {
        setShowCreateServiceOfferModal(true);
      } else {
        setShowCreateOfferModal(true);
      }
    }, 100);
  };

  // CreateOfferModal için submit handler (load_listing ve shipment_request için)
  const handleOfferSubmit = async (offerData: Omit<Database['public']['Tables']['offers']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await OfferService.createOffer(offerData);
      toast.success('Teklif başarıyla gönderildi!');
      setShowCreateOfferModal(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Teklif gönderme hatası:', error);
      toast.error('Teklif gönderilirken hata oluştu!');
    }
  };

  // CreateServiceOfferModal için success handler (transport_service için)
  const handleServiceOfferSuccess = () => {
    toast.success('Hizmete teklif başarıyla gönderildi!');
    setShowCreateServiceOfferModal(false);
    setSelectedListing(null);
  };

  // Modal close handlers
  const handleCloseOfferModal = () => {
    setShowCreateOfferModal(false);
    setSelectedListing(null);
  };

  const handleCloseServiceOfferModal = () => {
    setShowCreateServiceOfferModal(false);
    setSelectedListing(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    alert('Mesaj gönderildi!');
    setShowMessageModal(false);
    setMessageText('');
  };

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
              <h1 className="text-3xl font-bold text-gray-900">{getTabInfo().title}</h1>
              <p className="text-gray-600">{getTabInfo().description}</p>
            </div>
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
            </div>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tüm İlanlar
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'all'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts.all}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('load_listing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'load_listing'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Yük İlanları
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'load_listing'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts.load_listing}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('shipment_request')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'shipment_request'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nakliye Talebi
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'shipment_request'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts.shipment_request}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('transport_service')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'transport_service'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nakliye Hizmeti
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'transport_service'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts.transport_service}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      {/* Listings Grid - HomePage style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              {React.createElement(getTabInfo().icon, { className: "h-6 w-6 text-gray-400" })}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{getTabInfo().emptyMessage}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Arama kriterinize uygun ilan bulunamadı.' : 'Yeni ilanlar eklendiğinde burada görünecek.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredListings.map((listing) => {
                const displayData = getListingDisplayData(listing);
                return (
                <div 
                  key={listing.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold" title="İlan No">
                        {displayData.ilanNo}
                      </span>
                      {activeTab === 'all' && (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getListingTypeBadge(listing.listing_type).className}`}>
                          {getListingTypeBadge(listing.listing_type).label}
                        </div>
                      )}
                      {displayData.urgent && (
                        <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          <Clock size={12} className="mr-1" />
                          Acil
                        </div>
                      )}
                      {isOwnListing(listing) && (
                        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Sizin İlanınız
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
                      {displayData.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{displayData.price}</div>
                    <div className="text-xs text-gray-500">{displayData.offers} teklif</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={14} className="mr-2 text-primary-500" />
                    <span className="text-sm">{displayData.route}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package size={14} className="mr-2 text-primary-500" />
                    <span className="text-sm">{translateLoadType(displayData.loadType)} • {displayData.weight}</span>
                  </div>
                </div>
                
                {/* İlan Sahibi Bilgileri - Her zaman görünür */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-medium">
                        {displayData.contact.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{displayData.contact.name}</div>
                      {displayData.contact.company && (
                        <div className="text-xs text-gray-500">{displayData.contact.company}</div>
                      )}
                      {isLoggedIn ? (
                        <div className="flex items-center space-x-3 mt-1">
                          {displayData.contact.phone && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {displayData.contact.phone}
                            </div>
                          )}
                          {displayData.contact.email && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {displayData.contact.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1 px-2 py-1 bg-yellow-100 rounded text-xs text-yellow-800">
                          İletişim bilgilerini görmek için giriş yapın
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="p-6 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowOffer(listing)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${isOwnListing(listing)
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
                  {isLoggedIn && (
                    <button
                      onClick={() => handleShowDetails(listing)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105"
                      title="Detayları Görüntüle"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        setAuthModalOpen(true);
                        return;
                      }
                      if (isOwnListing(listing)) {
                        alert('Kendi ilanınıza mesaj gönderemezsiniz!');
                        return;
                      }
                      setMessageTarget(listing);
                      setShowMessageModal(true);
                    }}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(listing)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    disabled={isOwnListing(listing)}
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
            );
          })}
        </div>
        <div className="text-center mt-12">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl">
            Daha Fazla İlan Yükle
          </button>
        </div>
          </>
        )}
      </div>
      {/* Detail Modals */}
      {selectedListing && showDetailModal && selectedListing.listing_type === 'load_listing' && (
        <LoadListingDetailModal
          listing={selectedListing}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}

      {selectedListing && showDetailModal && selectedListing.listing_type === 'shipment_request' && (
        <ShipmentRequestDetailModal
          listing={selectedListing}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}

      {selectedListing && showDetailModal && selectedListing.listing_type === 'transport_service' && (
        <TransportServiceDetailModal
          service={convertToTransportService(selectedListing)}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Listing Detail Modal */}
      {selectedListing && !showDetailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
              title="Kapat"
              aria-label="Kapat"
            >
              <X size={24} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {getListingDisplayData(selectedListing).urgent && (
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock size={16} className="mr-1" />
                        Acil İlan
                      </div>
                    )}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getListingTypeBadge(selectedListing.listing_type).className}`}>
                      {getListingTypeBadge(selectedListing.listing_type).label}
                    </div>
                    <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {translateLoadType(getListingDisplayData(selectedListing).loadType)}
                    </div>
                    {isOwnListing(selectedListing) && (
                      <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Sizin İlanınız
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{getListingDisplayData(selectedListing).title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={18} className="mr-2 text-primary-500" />
                    <span className="text-lg">{getListingDisplayData(selectedListing).route}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Yük Detayları</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Yük Tipi:</span>
                      <div className="font-medium">{translateLoadType(getListingDisplayData(selectedListing).loadType)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Ağırlık:</span>
                      <div className="font-medium">{getListingDisplayData(selectedListing).weight}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Fiyat:</span>
                      <div className="font-medium">{getListingDisplayData(selectedListing).price}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Teklif:</span>
                      <div className="font-medium">{getListingDisplayData(selectedListing).offers} teklif</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Açıklama</h4>
                  <p className="text-gray-700">{selectedListing.description || 'Açıklama bulunamadı.'}</p>
                </div>
                {isLoggedIn ? (
                  <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                    <div className="flex items-center mb-4">
                      <h4 className="font-semibold text-gray-900">İletişim Bilgileri</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>İsim:</strong> {getListingDisplayData(selectedListing).contact.name}</div>
                      <div><strong>Firma:</strong> {getListingDisplayData(selectedListing).contact.company}</div>
                      <div><strong>Telefon:</strong> {getListingDisplayData(selectedListing).contact.phone}</div>
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
                  </div>
                )}
              </div>
              {/* Sağ Kolon - Fiyat ve Teklifler */}
              <div className="hidden lg:flex flex-col items-stretch gap-6">
                <div className="bg-white border-2 border-primary-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{getListingDisplayData(selectedListing).price}</div>
                    <div className="text-gray-600 mb-4">{getListingDisplayData(selectedListing).offers} teklif alındı</div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleShowOfferFromDetail(selectedListing)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Teklif Ver'}
                      </button>
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            setAuthModalOpen(true);
                            return;
                          }
                          if (isOwnListing(selectedListing)) {
                            alert('Kendi ilanınıza mesaj gönderemezsiniz!');
                            return;
                          }
                          setMessageTarget(selectedListing);
                          setShowMessageModal(true);
                        }}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Mesaj Gönder'}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Güvenlik Bilgileri */}
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
      
      {/* CreateOfferModal - Load Listing ve Shipment Request için */}
      {selectedListing && showCreateOfferModal && (
        <CreateOfferModal
          listing={selectedListing}
          isOpen={showCreateOfferModal}
          onClose={handleCloseOfferModal}
          onSubmit={handleOfferSubmit}
          currentUserId={user?.id || ''}
        />
      )}
      
      {/* CreateServiceOfferModal - Transport Service için */}
      {selectedListing && showCreateServiceOfferModal && (
        <CreateServiceOfferModal
          transportService={selectedListing}
          isOpen={showCreateServiceOfferModal}
          onClose={handleCloseServiceOfferModal}
          onSuccess={handleServiceOfferSuccess}
        />
      )}
      
      {/* Mesaj Gönder Modalı */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative">
            <button onClick={() => setShowMessageModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold mb-4">Mesaj Gönder</h3>
            <div className="mb-2 text-sm font-semibold uppercase text-gray-500">
              Alıcı: <span className="text-primary-600 font-bold underline cursor-pointer">{messageTarget ? getListingDisplayData(messageTarget).contact.name : ''}</span>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alıcı</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900"
                  value={messageTarget ? getListingDisplayData(messageTarget).contact.name : ''}
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
      {/* AuthModal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default ListingsPage;
