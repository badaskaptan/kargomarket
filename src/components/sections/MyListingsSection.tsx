import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit,
  Pause, 
  Play, 
  Trash2, 
  Eye,
  MapPin,
  Package,
  Calendar,
  Loader2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  X,
  BarChart3
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import type { ExtendedListing } from '../../types/database-types';
import EditModalLoadListing from './EditModalLoadListing';
import EditModalShipmentRequest from './EditModalShipmentRequest';
import EditModalTransportService from './EditModalTransportService';
import TransportServiceDetailSection from './TransportServiceDetailSection';

const MyListingsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  const [editListing, setEditListing] = useState<ExtendedListing | null>(null);
  const [relatedLoadListing, setRelatedLoadListing] = useState<ExtendedListing | null>(null);

  // Kullanıcının ilanlarını yükle
  useEffect(() => {
    const loadUserListings = async () => {
      if (!user) {
        console.log('❌ No user found');
        return;
      }
      
      try {
        console.log('🔄 Loading listings for user:', user.id);
        setLoading(true);
        const userListings = await ListingService.getUserListings(user.id);
        console.log('✅ User listings loaded:', userListings);
        setListings(userListings);
      } catch (error) {
        console.error('❌ Error loading user listings:', error);
        // Hata durumunda da loading'i false yap
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserListings();
  }, [user]);

  // Arama filtresi
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.load_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePause = async (listing: ExtendedListing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      await ListingService.updateListing(listing.id, { status: newStatus });
      
      setListings(prev => prev.map(l => 
        l.id === listing.id ? { ...l, status: newStatus } : l
      ));
      
      console.log(`✅ Listing ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Error toggling listing status:', error);
    }
  };

  const handleDeleteListing = async (listing: ExtendedListing) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await ListingService.deleteListing(listing.id);
      setListings(prev => prev.filter(l => l.id !== listing.id));
      console.log('✅ Listing deleted');
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleUpdateListing = (updatedListing: ExtendedListing) => {
    setListings(prev => prev.map(l => 
      l.id === updatedListing.id ? updatedListing : l
    ));
    console.log('✅ Listing updated');
  };

  // Fetch related load listing details
  const fetchRelatedLoadListing = async (relatedLoadListingId: string) => {
    try {
      const relatedListing = await ListingService.getListingById(relatedLoadListingId);
      setRelatedLoadListing(relatedListing);
    } catch (error) {
      console.error('Error fetching related load listing:', error);
      setRelatedLoadListing(null);
    }
  };

  // Effect to fetch related load listing when selectedListing changes
  useEffect(() => {
    if (selectedListing?.related_load_listing_id) {
      fetchRelatedLoadListing(selectedListing.related_load_listing_id);
    } else {
      setRelatedLoadListing(null);
    }
  }, [selectedListing?.related_load_listing_id]);

  // Yardımcı fonksiyonlar
  const getListingTypeBadge = (type: string) => {
    const config = {
      'load_listing': { label: 'Yük İlanı', color: 'bg-blue-100 text-blue-800' },
      'shipment_request': { label: 'Nakliye Talebi', color: 'bg-green-100 text-green-800' },
      'transport_service': { label: 'Taşıma Hizmeti', color: 'bg-purple-100 text-purple-800' }
    };
    
    const { label, color } = config[type as keyof typeof config] || { label: type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string | null) => {
    const config = {
      'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' }
    };
    
    const { label, color } = config[status as keyof typeof config] || { label: 'Taslak', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);
    
    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year}`;
    }
    
    // Eğer ISO tarih formatındaysa (YYYY-MM-DDTHH:mm:ss), sadece tarih kısmını al
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}-${month}-${year}`;
    }
    
    // Fallback: Date objesini kullan
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">İlanlar yükleniyor...</span>
      </div>
    );
  }

  // Debug bilgileri
  console.log('🔍 Debug Info:', {
    user: user ? { id: user.id, email: user.email } : null,
    loading,
    listingsCount: listings.length,
    listings: listings.slice(0, 2) // İlk 2 ilanı log'la
  });

  // Eğer user yoksa hata mesajı göster
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Oturumunuz Bulunamadı</h3>
          <p className="text-gray-600">Lütfen giriş yapınız.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
          <p className="mt-1 text-sm text-gray-600">
            Toplam {listings.length} ilan
          </p>
        </div>
        <button
          onClick={() => setActiveSection('create-load-listing')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlan
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="İlan ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Content */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arama sonucu bulunamadı</h3>
              <p className="text-gray-600">"{searchTerm}" için hiçbir ilan bulunamadı.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {listings.length === 0 ? 'Henüz hiç ilanınız yok' : 'İlan bulunamadı'}
              </h3>
              <p className="text-gray-600 mb-2">
                {listings.length === 0 
                  ? 'İlk ilanınızı oluşturarak başlayın!' 
                  : `Toplam ${listings.length} ilanınız var ama filtreye uygun olan bulunamadı.`
                }
              </p>
              {/* Debug info */}
              <div className="text-xs text-gray-400 mb-6">
                Debug: user_id={user?.id}, total_listings={listings.length}, loading={loading.toString()}
              </div>
              <button
                onClick={() => setActiveSection('create-load-listing')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlan Oluştur
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan Bilgisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        <div className="text-sm text-gray-500">
                          {listing.listing_type === 'transport_service' 
                            ? (() => {
                                const vehicleTypeMapping: { [key: string]: string } = {
                                  // Road vehicles
                                  'truck_3_5_open': '🚚 Kamyon - 3.5 Ton (Açık Kasa)',
                                  'truck_3_5_closed': '🚚 Kamyon - 3.5 Ton (Kapalı Kasa)',
                                  'truck_5_open': '🚚 Kamyon - 5 Ton (Açık Kasa)',
                                  'truck_5_closed': '🚚 Kamyon - 5 Ton (Kapalı Kasa)',
                                  'truck_10_open': '🚛 Kamyon - 10 Ton (Açık Kasa)',
                                  'truck_10_closed': '🚛 Kamyon - 10 Ton (Kapalı Kasa)',
                                  'truck_10_tent': '🚛 Kamyon - 10 Ton (Tenteli)',
                                  'truck_15_open': '🚛 Kamyon - 15 Ton (Açık Kasa)',
                                  'truck_15_closed': '🚛 Kamyon - 15 Ton (Kapalı Kasa)',
                                  'truck_15_tent': '🚛 Kamyon - 15 Ton (Tenteli)',
                                  'tir_standard': '🚛 Tır (Standart Dorse) - 90m³ / 40t',
                                  'tir_mega': '🚛 Tır (Mega Dorse) - 100m³ / 40t',
                                  'tir_jumbo': '🚛 Tır (Jumbo Dorse) - 120m³ / 40t',
                                  'tir_tent': '🚛 Tır (Tenteli Dorse) - 40t',
                                  'tir_frigo': '🧊 Tır (Frigorifik Dorse - Isı Kontrollü) - 40t',
                                  'tir_container': '📦 Tır (Konteyner Taşıyıcı) - 40t',
                                  'tir_platform': '🏗️ Tır (Platform) - 40t',
                                  'tir_frigo_dual': '🧊 Tır (Frigorifik Çift Isı) - 40t',
                                  'van_3': '🚐 Kargo Van - 3m³ (1000kg)',
                                  'van_6': '🚐 Kargo Van - 6m³ (1500kg)',
                                  'van_10': '🚐 Kargo Van - 10m³ (2000kg)',
                                  'van_15': '🚐 Kargo Van - 15m³ (2500kg)',
                                  
                                  // Sea vehicles
                                  'container_20dc': '🚢 20\' Standart (20DC) - 33m³ / 28t',
                                  'container_40dc': '🚢 40\' Standart (40DC) - 67m³ / 28t',
                                  'container_40hc': '🚢 40\' Yüksek (40HC) - 76m³ / 28t',
                                  'container_20ot': '🚢 20\' Open Top - 32m³ / 28t',
                                  'container_40ot': '🚢 40\' Open Top - 66m³ / 28t',
                                  'container_20fr': '🚢 20\' Flat Rack - 28t',
                                  'container_40fr': '🚢 40\' Flat Rack - 40t',
                                  'container_20rf': '❄️ 20\' Reefer - 28m³ / 25t',
                                  'container_40rf': '❄️ 40\' Reefer - 60m³ / 25t',
                                  'bulk_handysize': '🚢 Handysize (10,000-35,000 DWT)',
                                  'bulk_handymax': '🚢 Handymax (35,000-60,000 DWT)',
                                  'bulk_panamax': '🚢 Panamax (60,000-80,000 DWT)',
                                  'bulk_capesize': '🚢 Capesize (80,000+ DWT)',
                                  'general_small': '🚢 Küçük Tonaj (1,000-5,000 DWT)',
                                  'general_medium': '🚢 Orta Tonaj (5,000-15,000 DWT)',
                                  'general_large': '🚢 Büyük Tonaj (15,000+ DWT)',
                                  'tanker_product': '🛢️ Ürün Tankeri (10,000-60,000 DWT)',
                                  'tanker_chemical': '🛢️ Kimyasal Tanker (5,000-40,000 DWT)',
                                  'tanker_crude': '🛢️ Ham Petrol Tankeri (60,000+ DWT)',
                                  'tanker_lpg': '🛢️ LPG Tankeri (5,000-80,000 m³)',
                                  'tanker_lng': '🛢️ LNG Tankeri (150,000-180,000 m³)',
                                  'roro_small': '🚗 Küçük RO-RO (100-200 araç)',
                                  'roro_medium': '🚗 Orta RO-RO (200-500 araç)',
                                  'roro_large': '🚗 Büyük RO-RO (500+ araç)',
                                  'ferry_cargo': '⛴️ Kargo Feribotu',
                                  'ferry_mixed': '⛴️ Karma Feribot (Yolcu+Yük)',
                                  'cargo_small': '🚤 Küçük Yük Teknesi (500-1,000 DWT)',
                                  'cargo_large': '🚤 Büyük Yük Teknesi (1,000+ DWT)',
                                  
                                  // Air vehicles
                                  'standard_cargo': '✈️ Standart Kargo',
                                  'large_cargo': '✈️ Büyük Hacimli Kargo',
                                  'special_cargo': '✈️ Özel Kargo',
                                  
                                  // Rail vehicles
                                  'open_wagon': '🚂 Açık Yük Vagonu',
                                  'closed_wagon': '🚂 Kapalı Yük Vagonu',
                                  'container_wagon': '🚂 Konteyner Vagonu',
                                  'tanker_wagon': '🚂 Tanker Vagonu'
                                };
                                // Use vehicle_types if available, otherwise use load_type
                                const vehicleType = listing.vehicle_types && listing.vehicle_types.length > 0 
                                  ? listing.vehicle_types[0] 
                                  : listing.load_type;
                                return vehicleType ? (vehicleTypeMapping[vehicleType] || `🚛 ${vehicleType}`) : '🚛 Araç Tipi Belirtilmemiş';
                              })()
                            : listing.load_type
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {listing.origin}
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {listing.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <div>
                          <div>Yükleme: {formatDate(listing.loading_date)}</div>
                          <div>Teslimat: {formatDate(listing.delivery_date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="İlan Detayını Görüntüle"
                          aria-label="İlan Detayını Görüntüle"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="İlanı Düzenle"
                          aria-label="İlanı Düzenle"
                          onClick={() => setEditListing(listing)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {listing.status === 'active' ? (
                          <button 
                            className="text-orange-600 hover:text-orange-900"
                            title="İlanı Duraklat"
                            aria-label="İlanı Duraklat"
                            onClick={() => handleTogglePause(listing)}
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="İlanı Etkinleştir"
                            aria-label="İlanı Etkinleştir"
                            onClick={() => handleTogglePause(listing)}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="İlanı Sil"
                          aria-label="İlanı Sil"
                          onClick={() => handleDeleteListing(listing)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İlan Detay Modalı */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-6 rounded-t-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-white bg-opacity-10" />
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">İlan Detayı</h2>
                      <p className="text-white/80 text-sm mt-1">Detaylı ilan bilgileri ve dosyalar</p>
                    </div>
                    <div className="transform scale-110">
                      {getListingTypeBadge(selectedListing.listing_type)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm"
                    title="Modalı Kapat"
                    aria-label="Modalı Kapat"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* İlan Numarası ve Durum */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/90 text-sm font-medium">İlan No:</span>
                        <span className="text-white font-bold text-lg">{selectedListing.listing_number}</span>
                      </div>
                    </div>
                    <div className="transform scale-110">
                      {getStatusBadge(selectedListing.status)}
                    </div>
                  </div>
                  <div className="text-white/80 text-sm bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(selectedListing.created_at)} tarihinde oluşturuldu
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Ana Bilgiler */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                  {/* İlan Sahibi Özet Bilgileri */}
                  {selectedListing.owner_name && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                          <span className="text-xl">👤</span>
                        </div>
                        İlan Sahibi
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Kişisel Bilgiler */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                          <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Kişisel Bilgiler</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Ad Soyad</span>
                              <div className="text-gray-900 font-medium">{selectedListing.owner_name}</div>
                            </div>
                            {selectedListing.owner_phone && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Telefon</span>
                                <div className="text-gray-900 font-medium flex items-center">
                                  <span className="mr-2">📞</span>
                                  {selectedListing.owner_phone}
                                </div>
                              </div>
                            )}
                            {selectedListing.owner_email && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">E-posta</span>
                                <div className="text-gray-900 font-medium flex items-center">
                                  <span className="mr-2">✉️</span>
                                  {selectedListing.owner_email}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Firma Bilgileri */}
                        {(selectedListing.owner_company || selectedListing.owner_city || selectedListing.owner_address) && (
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h4 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Firma Bilgileri</h4>
                            <div className="space-y-2">
                              {selectedListing.owner_company && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Şirket Adı</span>
                                  <div className="text-gray-900 font-medium flex items-center">
                                    <span className="mr-2">🏢</span>
                                    {selectedListing.owner_company}
                                  </div>
                                </div>
                              )}
                              {selectedListing.owner_city && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Şehir</span>
                                  <div className="text-gray-900 font-medium flex items-center">
                                    <span className="mr-2">📍</span>
                                    {selectedListing.owner_city}
                                  </div>
                                </div>
                              )}
                              {selectedListing.owner_address && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Adres</span>
                                  <div className="text-gray-900 font-medium text-sm">
                                    {selectedListing.owner_address}
                                  </div>
                                </div>
                              )}
                              {(selectedListing.owner_tax_office || selectedListing.owner_tax_number) && (
                                <div className="pt-2 border-t border-gray-100">
                                  {selectedListing.owner_tax_office && (
                                    <div className="mb-1">
                                      <span className="text-xs text-gray-500">Vergi Dairesi:</span>
                                      <span className="text-gray-700 text-sm ml-1">{selectedListing.owner_tax_office}</span>
                                    </div>
                                  )}
                                  {selectedListing.owner_tax_number && (
                                    <div>
                                      <span className="text-xs text-gray-500">Vergi No:</span>
                                      <span className="text-gray-700 text-sm ml-1">{selectedListing.owner_tax_number}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* İstatistikler ve Değerlendirme */}
                        <div className="bg-white rounded-lg p-4 border border-orange-100">
                          <h4 className="text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide">İstatistikler</h4>
                          <div className="space-y-2">
                            {selectedListing.owner_rating && selectedListing.owner_rating > 0 && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Değerlendirme</span>
                                <div className="flex items-center">
                                  <span className="text-yellow-400 mr-1">⭐</span>
                                  <span className="text-gray-900 font-medium">{selectedListing.owner_rating}/5</span>
                                  {selectedListing.owner_rating_count && (
                                    <span className="text-xs text-gray-500 ml-1">({selectedListing.owner_rating_count})</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {selectedListing.owner_total_listings && selectedListing.owner_total_listings > 0 && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Toplam İlan</span>
                                <div className="text-gray-900 font-medium">{selectedListing.owner_total_listings}</div>
                              </div>
                            )}
                            {selectedListing.owner_total_completed_transactions && selectedListing.owner_total_completed_transactions > 0 && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Tamamlanan İşlem</span>
                                <div className="text-gray-900 font-medium">{selectedListing.owner_total_completed_transactions}</div>
                              </div>
                            )}
                            {selectedListing.owner_user_type && (
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Kullanıcı Tipi</span>
                                <div className="text-gray-900 font-medium">
                                  {selectedListing.owner_user_type === 'buyer_seller' ? '🛒 Alıcı/Satıcı' :
                                   selectedListing.owner_user_type === 'carrier' ? '🚛 Taşıyıcı' :
                                   selectedListing.owner_user_type === 'both' ? '🔄 Karma' :
                                   selectedListing.owner_user_type}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* İlan Bilgileri */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      İlan Bilgileri
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
                        {selectedListing.title}
                      </h4>
                      {selectedListing.description && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nakliye Talebi Özel Bilgileri */}
                  {selectedListing.listing_type === 'shipment_request' && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <span className="text-2xl">🚛</span>
                        </div>
                        Nakliye Talebi Detayları
                      </h3>
                      <div className="space-y-4">
                        {/* Taşıma Modu */}
                        {selectedListing.transport_mode && (
                          <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                            <div className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Taşıma Modu</div>
                            <div className="text-gray-900 font-semibold text-lg flex items-center">
                              {selectedListing.transport_mode === 'road' && '🚛 Karayolu'}
                              {selectedListing.transport_mode === 'sea' && '🚢 Denizyolu'}
                              {selectedListing.transport_mode === 'air' && '✈️ Havayolu'}
                              {selectedListing.transport_mode === 'rail' && '🚂 Demiryolu'}
                              {selectedListing.transport_mode === 'multimodal' && '🔄 Karma Taşımacılık'}
                            </div>
                          </div>
                        )}
                        {/* Araç Tipi */}
                        {selectedListing.vehicle_types && selectedListing.vehicle_types.length > 0 && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                            <div className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Araç Tipi</div>
                            <div className="text-gray-900 font-semibold text-lg">
                              {(() => {
                                const vehicleType = selectedListing.vehicle_types[0];
                                
                                // Araç tipi çeviri mapping'i
                                const vehicleTypeMapping: { [key: string]: string } = {
                                  // Road vehicles
                                  'truck_3_5_open': '🚚 Kamyon - 3.5 Ton (Açık Kasa)',
                                  'truck_3_5_closed': '🚚 Kamyon - 3.5 Ton (Kapalı Kasa)',
                                  'truck_5_open': '🚚 Kamyon - 5 Ton (Açık Kasa)',
                                  'truck_5_closed': '🚚 Kamyon - 5 Ton (Kapalı Kasa)',
                                  'truck_10_open': '🚛 Kamyon - 10 Ton (Açık Kasa)',
                                  'truck_10_closed': '🚛 Kamyon - 10 Ton (Kapalı Kasa)',
                                  'truck_10_tent': '🚛 Kamyon - 10 Ton (Tenteli)',
                                  'truck_15_open': '🚛 Kamyon - 15 Ton (Açık Kasa)',
                                  'truck_15_closed': '🚛 Kamyon - 15 Ton (Kapalı Kasa)',
                                  'truck_15_tent': '🚛 Kamyon - 15 Ton (Tenteli)',
                                  'tir_standard': '🚛 Tır (Standart Dorse) - 90m³ / 40t',
                                  'tir_mega': '🚛 Tır (Mega Dorse) - 100m³ / 40t',
                                  'tir_jumbo': '🚛 Tır (Jumbo Dorse) - 120m³ / 40t',
                                  'tir_tent': '🚛 Tır (Tenteli Dorse) - 40t',
                                  'tir_frigo': '🧊 Tır (Frigorifik Dorse - Isı Kontrollü) - 40t',
                                  'tir_container': '📦 Tır (Konteyner Taşıyıcı) - 40t',
                                  'tir_platform': '🏗️ Tır (Platform) - 40t',
                                  'tir_frigo_dual': '🧊 Tır (Frigorifik Çift Isı) - 40t',
                                  'van_3': '🚐 Kargo Van - 3m³ (1000kg)',
                                  'van_6': '🚐 Kargo Van - 6m³ (1500kg)',
                                  'van_10': '🚐 Kargo Van - 10m³ (2000kg)',
                                  'van_15': '🚐 Kargo Van - 15m³ (2500kg)',
                                  
                                  // Sea vehicles
                                  'container_20dc': '🚢 20\' Standart (20DC) - 33m³ / 28t',
                                  'container_40dc': '🚢 40\' Standart (40DC) - 67m³ / 28t',
                                  'container_40hc': '🚢 40\' Yüksek (40HC) - 76m³ / 28t',
                                  'container_20ot': '🚢 20\' Open Top - 32m³ / 28t',
                                  'container_40ot': '🚢 40\' Open Top - 66m³ / 28t',
                                  'container_20fr': '🚢 20\' Flat Rack - 28t',
                                  'container_40fr': '🚢 40\' Flat Rack - 40t',
                                  'container_20rf': '❄️ 20\' Reefer - 28m³ / 25t',
                                  'container_40rf': '❄️ 40\' Reefer - 60m³ / 25t',
                                  'bulk_handysize': '🚢 Handysize (10,000-35,000 DWT)',
                                  'bulk_handymax': '🚢 Handymax (35,000-60,000 DWT)',
                                  'bulk_panamax': '🚢 Panamax (60,000-80,000 DWT)',
                                  'bulk_capesize': '🚢 Capesize (80,000+ DWT)',
                                  'general_small': '🚢 Küçük Tonaj (1,000-5,000 DWT)',
                                  'general_medium': '🚢 Orta Tonaj (5,000-15,000 DWT)',
                                  'general_large': '🚢 Büyük Tonaj (15,000+ DWT)',
                                  'tanker_product': '🛢️ Ürün Tankeri (10,000-60,000 DWT)',
                                  'tanker_chemical': '🛢️ Kimyasal Tanker (5,000-40,000 DWT)',
                                  'tanker_crude': '🛢️ Ham Petrol Tankeri (60,000+ DWT)',
                                  'tanker_lpg': '🛢️ LPG Tankeri (5,000-80,000 m³)',
                                  'tanker_lng': '🛢️ LNG Tankeri (150,000-180,000 m³)',
                                  'roro_small': '🚗 Küçük RO-RO (100-200 araç)',
                                  'roro_medium': '🚗 Orta RO-RO (200-500 araç)',
                                  'roro_large': '🚗 Büyük RO-RO (500+ araç)',
                                  'ferry_cargo': '⛴️ Kargo Feribotu',
                                  'ferry_mixed': '⛴️ Karma Feribot (Yolcu+Yük)',
                                  'cargo_small': '🚤 Küçük Yük Teknesi (500-1,000 DWT)',
                                  'cargo_large': '🚤 Büyük Yük Teknesi (1,000+ DWT)',
                                  
                                  // Air vehicles
                                  'standard_cargo': '✈️ Standart Kargo',
                                  'large_cargo': '✈️ Büyük Hacimli Kargo',
                                  'special_cargo': '✈️ Özel Kargo',
                                  
                                  // Rail vehicles
                                  'open_wagon': '🚂 Açık Yük Vagonu',
                                  'closed_wagon': '🚂 Kapalı Yük Vagonu',
                                  'container_wagon': '🚂 Konteyner Vagonu',
                                  'tanker_wagon': '🚂 Tanker Vagonu'
                                };

                                return vehicleTypeMapping[vehicleType] || `🚛 ${vehicleType}`;
                              })()}
                            </div>
                            {selectedListing.vehicle_types.length > 1 && (
                              <div className="text-sm text-blue-600 mt-1">
                                +{selectedListing.vehicle_types.length - 1} diğer araç tipi
                              </div>
                            )}
                          </div>
                        )}
                        {/* İlgili Yük İlanı */}
                        {selectedListing.related_load_listing_id && (
                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                            <div className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">İlgili Yük İlanı</div>
                            <div className="text-gray-900 font-medium">
                              {relatedLoadListing ? (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <span className="text-lg mr-2">📦</span>
                                    <div className="flex-1">
                                      <div className="font-semibold text-amber-900">{relatedLoadListing.title}</div>
                                      <div className="text-sm text-amber-600">
                                        İlan No: {relatedLoadListing.listing_number}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium">Güzergah:</span> {relatedLoadListing.origin} → {relatedLoadListing.destination}
                                    </div>
                                    <div>
                                      <span className="font-medium">Yük Tipi:</span> {relatedLoadListing.load_type || 'Belirtilmemiş'}
                                    </div>
                                    {relatedLoadListing.weight_value && (
                                      <div>
                                        <span className="font-medium">Ağırlık:</span> {relatedLoadListing.weight_value} {relatedLoadListing.weight_unit}
                                      </div>
                                    )}
                                    {relatedLoadListing.volume_value && (
                                      <div>
                                        <span className="font-medium">Hacim:</span> {relatedLoadListing.volume_value} {relatedLoadListing.volume_unit}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-amber-600 mt-2 italic">
                                    Bu nakliye talebi yukarıdaki yük ilanı için oluşturulmuştur
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">📦</span>
                                  <div className="flex-1">
                                    <div className="text-gray-500">Yük ilanı yükleniyor...</div>
                                    <div className="text-xs text-amber-600">
                                      ID: {selectedListing.related_load_listing_id}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Teklif Alma Şekli */}
                        {selectedListing.offer_type && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                            <div className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Teklif Alma Şekli</div>
                            <div className="text-gray-900 font-medium">
                              {selectedListing.offer_type === 'fixed_price' && '💰 Sabit Fiyat'}
                              {selectedListing.offer_type === 'negotiable' && '💬 Pazarlıklı'}
                              {selectedListing.offer_type === 'auction' && '🏷️ Müzayede'}
                              {selectedListing.offer_type === 'free_quote' && '📝 Doğrudan Teklif'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedListing.listing_type === 'transport_service' && (
                    <div>
                      <TransportServiceDetailSection listing={prepareTransportServiceDetail(selectedListing)} />
                    </div>
                  )}
                </div>

                {/* Sağ Kolon - Lokasyon ve Tarih */}
                <div className="space-y-6">
                  {/* Lokasyon Bilgileri */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      Rota Bilgileri
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                        <div className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">Yükleme Noktası</div>
                        <div className="text-gray-900 font-semibold flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-sm"></div>
                          {selectedListing.origin}
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-gradient-to-b from-purple-300 to-purple-400"></div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                        <div className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">Teslimat Noktası</div>
                        <div className="text-gray-900 font-semibold flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 shadow-sm"></div>
                          {selectedListing.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarih Bilgileri - Sadece yük ilanı ve nakliye talebinde göster */}
                  {(selectedListing.listing_type === 'load_listing' || selectedListing.listing_type === 'shipment_request') && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 shadow-sm">
                      <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
                        <div className="bg-orange-100 p-2 rounded-lg mr-3">
                          <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        Tarih Bilgileri
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                          <div className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide">Yükleme Tarihi</div>
                          <div className="text-gray-900 font-semibold">{formatDate(selectedListing.loading_date)}</div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                          <div className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide">Teslimat Tarihi</div>
                          <div className="text-gray-900 font-semibold">{formatDate(selectedListing.delivery_date)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gerekli Evraklar - Sadece gerçek evrak listesini göster */}
                  {selectedListing.required_documents && selectedListing.required_documents.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Gerekli Evraklar
                      </h3>
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="space-y-2">
                          {selectedListing.required_documents.map((doc, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* İlan İstatistikleri */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <BarChart3 className="h-5 w-5 text-amber-600" />
                      </div>
                      İlan İstatistikleri
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                        <div className="text-2xl font-bold text-amber-600">0</div>
                        <div className="text-sm text-amber-700">Görüntüleme</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                        <div className="text-2xl font-bold text-amber-600">0</div>
                        <div className="text-sm text-amber-700">Teklif</div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-amber-600 text-center">
                      Son güncelleme: {formatDate(selectedListing.updated_at || selectedListing.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dosyalar ve Görseller */}
              {(selectedListing.document_urls && selectedListing.document_urls.length > 0) || 
               (selectedListing.image_urls && selectedListing.image_urls.length > 0) ? (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <span className="text-2xl mr-3">📎</span>
                      Ekli Dosyalar
                    </h3>
                    
                    {/* Evraklar */}
                    {selectedListing.document_urls && selectedListing.document_urls.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-800">
                            Evraklar ({selectedListing.document_urls.length})
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedListing.document_urls.map((url, index) => {
                            const fileName = url.split('/').pop() || `Evrak ${index + 1}`;
                            const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'DOC';
                            
                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg transition-colors">
                                      <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium text-gray-900 truncate">
                                        Evrak {index + 1}
                                      </h5>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                        {fileExtension}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {fileName}
                                    </p>
                                    <div className="flex items-center mt-2 text-blue-600 group-hover:text-blue-700">
                                      <span className="text-xs font-medium">İndir</span>
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </div>
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Görseller */}
                    {selectedListing.image_urls && selectedListing.image_urls.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <ImageIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-800">
                            Görseller ({selectedListing.image_urls.length})
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {selectedListing.image_urls.map((url, index) => {
                            const fileName = url.split('/').pop() || `Görsel ${index + 1}`;
                            
                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                              >
                                <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-gray-100 to-gray-200">
                                  <div className="flex items-center justify-center">
                                    <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-full transition-colors">
                                      <ImageIcon className="h-8 w-8 text-green-600" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-medium text-gray-900 truncate">
                                      Görsel {index + 1}
                                    </h5>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                      IMG
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate mb-2">
                                    {fileName}
                                  </p>
                                  <div className="flex items-center text-green-600 group-hover:text-green-700">
                                    <span className="text-xs font-medium">Görüntüle</span>
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal'ları */}
      {editListing && editListing.listing_type === 'load_listing' && (
        <EditModalLoadListing
          listing={editListing}
          isOpen={true}
          onClose={() => setEditListing(null)}
          onSave={handleUpdateListing}
        />
      )}

      {editListing && editListing.listing_type === 'shipment_request' && (
        <EditModalShipmentRequest
          listing={editListing}
          isOpen={true}
          onClose={() => setEditListing(null)}
          onSave={handleUpdateListing}
        />
      )}

      {editListing && editListing.listing_type === 'transport_service' && (
        <EditModalTransportService
          listing={editListing}
          isOpen={true}
          onClose={() => setEditListing(null)}
          onSave={handleUpdateListing}
        />
      )}
    </div>
  );
}

  // TransportServiceDetailSection için veri hazırlama fonksiyonu
function prepareTransportServiceDetail(listing: ExtendedListing): ExtendedListing {
  console.log('🔍 PREPARING TRANSPORT SERVICE DETAIL:');
  console.log('- Original listing.metadata:', JSON.stringify(listing.metadata, null, 2));
  console.log('- Original listing.required_documents:', listing.required_documents);
  
  // Metadata'dan required_documents'ı temizle (eğer varsa)
  let cleanMetadata = listing.metadata && typeof listing.metadata === 'object' 
    ? { ...listing.metadata } 
    : { contact_info: {}, transport_details: {} };
  
  // required_documents varsa metadata'dan kaldır
  if (cleanMetadata && 'required_documents' in cleanMetadata) {
    const { required_documents, ...metadataWithoutDocs } = cleanMetadata as any;
    cleanMetadata = metadataWithoutDocs;
    console.log('🧹 CLEANED required_documents from metadata');
  }
  
  const result = {
    ...listing, // Tüm ExtendedListing properties'ini spread et
    metadata: cleanMetadata,
  };
  
  console.log('- Cleaned metadata:', JSON.stringify(result.metadata, null, 2));
  console.log('- Prepared required_documents (main column only):', result.required_documents);
  
  return result;
}

export default MyListingsSection;
