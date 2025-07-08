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
  Save
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import type { ExtendedListing } from '../../types/database-types';

const MyListingsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ExtendedListing | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    load_type: '',
    origin: '',
    destination: '',
    loading_date: '',
    delivery_date: '',
    weight_value: '',
    weight_unit: 'ton',
    volume_value: '',
    volume_unit: 'm3',
    price_amount: '',
    price_per: 'total'
  });

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

  // Edit modal functions
  const handleEditListing = (listing: ExtendedListing) => {
    setEditingListing(listing);
    setEditFormData({
      title: listing.title || '',
      description: listing.description || '',
      load_type: listing.load_type || '',
      origin: listing.origin || '',
      destination: listing.destination || '',
      loading_date: listing.loading_date || '',
      delivery_date: listing.delivery_date || '',
      weight_value: listing.weight_value?.toString() || '',
      weight_unit: listing.weight_unit || 'ton',
      volume_value: listing.volume_value?.toString() || '',
      volume_unit: listing.volume_unit || 'm3',
      price_amount: listing.price_amount?.toString() || '',
      price_per: listing.price_per || 'total'
    });
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !user) return;
    
    try {
      setEditSubmitting(true);
      
      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        load_type: editFormData.load_type,
        origin: editFormData.origin,
        destination: editFormData.destination,
        loading_date: editFormData.loading_date,
        delivery_date: editFormData.delivery_date,
        weight_value: editFormData.weight_value ? parseFloat(editFormData.weight_value) : null,
        weight_unit: editFormData.weight_unit,
        volume_value: editFormData.volume_value ? parseFloat(editFormData.volume_value) : null,
        volume_unit: editFormData.volume_unit,
        price_amount: editFormData.price_amount ? parseFloat(editFormData.price_amount) : null,
        price_per: editFormData.price_per as 'total' | 'ton' | 'km' | 'day' | 'hour'
      };

      await ListingService.updateListing(editingListing.id, updateData);
      
      // Local state'i güncelle
      setListings((prev) => prev.map(l => 
        l.id === editingListing.id 
          ? { ...l, ...updateData } 
          : l
      ));
      
      setEditModalOpen(false);
      setEditingListing(null);
      console.log('✅ Listing updated successfully');
      
    } catch (error) {
      console.error('Error updating listing:', error);
    } finally {
      setEditSubmitting(false);
    }
  };

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
    return new Date(dateString).toLocaleDateString('tr-TR');
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
                        <div className="flex items-center mb-2">
                          {getListingTypeBadge(listing.listing_type)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        <div className="text-sm text-gray-500">{listing.load_type}</div>
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
                          className="text-green-600 hover:text-green-900"
                          title="İlanı Düzenle"
                          aria-label="İlanı Düzenle"
                          onClick={() => handleEditListing(listing)}
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
              {/* İlan Sahibi Bilgileri - En Üstte */}
              {selectedListing.owner_name && (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">👤</span>
                      </div>
                      İlan Sahibi Bilgileri
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-4">
                            <div className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Ad Soyad</div>
                            <div className="text-gray-900 font-semibold text-xl">{selectedListing.owner_name}</div>
                          </div>
                          
                          {selectedListing.owner_phone && (
                            <div className="mb-4">
                              <div className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Telefon</div>
                              <div className="flex items-center bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200">
                                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                  <span className="text-lg">📞</span>
                                </div>
                                <span className="text-indigo-700 font-semibold">{selectedListing.owner_phone}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          {selectedListing.owner_company && (
                            <div className="mb-4">
                              <div className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Şirket Adı</div>
                              <div className="text-gray-900 font-semibold text-lg">{selectedListing.owner_company}</div>
                            </div>
                          )}
                          
                          {selectedListing.owner_email && (
                            <div className="mb-4">
                              <div className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">E-posta</div>
                              <div className="flex items-center bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200">
                                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                  <span className="text-lg">✉️</span>
                                </div>
                                <span className="text-indigo-700 font-semibold">{selectedListing.owner_email}</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedListing.owner_city && (
                            <div className="mb-4">
                              <div className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Şehir</div>
                              <div className="text-gray-900 font-semibold">{selectedListing.owner_city}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedListing.owner_rating && (
                        <div className="mt-4 pt-4 border-t border-indigo-200">
                          <div className="flex items-center">
                            <div className="text-sm font-semibold text-indigo-700 mr-3 uppercase tracking-wide">Değerlendirme:</div>
                            <div className="flex items-center">
                              <span className="text-yellow-400 text-lg mr-1">⭐</span>
                              <span className="text-gray-900 font-semibold">{selectedListing.owner_rating}/5</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ana Bilgiler */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm">
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
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol Kolon - Yük Bilgileri */}
                <div className="space-y-6">
                  {/* Yük Detayları */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      Yük Detayları
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Yük Tipi</div>
                        <div className="text-gray-900 font-semibold text-lg">{selectedListing.load_type || 'Belirtilmemiş'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                          <div className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Ağırlık</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedListing.weight_value ? 
                              `${selectedListing.weight_value} ${selectedListing.weight_unit}` : 
                              'Belirtilmemiş'
                            }
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                          <div className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Hacim</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedListing.volume_value ? 
                              `${selectedListing.volume_value} ${selectedListing.volume_unit}` : 
                              'Belirtilmemiş'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fiyat Bilgileri */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">💰</span>
                      </div>
                      Fiyat Bilgileri
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                      <div className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Teklif Edilen Fiyat</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {selectedListing.price_amount ? 
                          `${selectedListing.price_amount.toLocaleString('tr-TR')} ${selectedListing.price_currency || 'TL'}` : 
                          'Fiyat belirtilmemiş'
                        }
                      </div>
                      {selectedListing.price_per && selectedListing.price_amount && (
                        <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                          {selectedListing.price_per} başına
                        </div>
                      )}
                      
                      {/* Teklif Tipi */}
                      {selectedListing.offer_type && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Teklif Tipi</div>
                          <div className="text-gray-900 font-medium">
                            {selectedListing.offer_type === 'fixed_price' ? 'Sabit Fiyat' : 
                             selectedListing.offer_type === 'negotiable' ? 'Pazarlığa Açık' : 
                             selectedListing.offer_type}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rol ve Taşıma Bilgileri */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">🚛</span>
                      </div>
                      Taşıma Bilgileri
                    </h3>
                    <div className="space-y-4">
                      {selectedListing.role_type && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                          <div className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Rol</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedListing.role_type === 'buyer' ? '🛒 Alıcı' : 
                             selectedListing.role_type === 'seller' ? '🏪 Satıcı' : 
                             selectedListing.role_type}
                          </div>
                        </div>
                      )}
                      
                      {selectedListing.transport_responsible && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                          <div className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Taşıma Sorumlusu</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedListing.transport_responsible === 'buyer' ? 'Alıcı' : 
                             selectedListing.transport_responsible === 'seller' ? 'Satıcı' : 
                             selectedListing.transport_responsible}
                          </div>
                        </div>
                      )}
                      
                      {selectedListing.transport_mode && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                          <div className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Taşıma Modu</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedListing.transport_mode === 'road' ? '🚛 Karayolu' : 
                             selectedListing.transport_mode === 'sea' ? '🚢 Deniz' : 
                             selectedListing.transport_mode === 'air' ? '✈️ Hava' : 
                             selectedListing.transport_mode === 'rail' ? '🚂 Demiryolu' : 
                             selectedListing.transport_mode}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

                  {/* Tarih Bilgileri */}
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

                  {/* Gerekli Evraklar */}
                  {selectedListing.required_documents && selectedListing.required_documents.length > 0 && (
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100 shadow-sm">
                      <h3 className="text-xl font-semibold text-pink-900 mb-4 flex items-center">
                        <div className="bg-pink-100 p-2 rounded-lg mr-3">
                          <FileText className="h-6 w-6 text-pink-600" />
                        </div>
                        Gerekli Evraklar
                      </h3>
                      <div className="bg-white rounded-xl p-4 border border-pink-200 shadow-sm">
                        <div className="grid grid-cols-1 gap-2">
                          {selectedListing.required_documents.map((doc, index) => {
                            const documentLabels: Record<string, string> = {
                              invoice: '📄 Fatura / Proforma Fatura',
                              salesContract: '📝 Satış Sözleşmesi',
                              waybill: '📋 İrsaliye / Sevk Fişi',
                              originCertificate: '🌍 Menşe Şahadetnamesi',
                              analysis: '🔬 Analiz Sertifikası',
                              complianceCertificates: '📑 TSE, CE, ISO Sertifikaları',
                              productPhotos: '🖼️ Ürün Fotoğrafları',
                              packingList: '📦 Ambalaj / Packing List',
                              warehouseReceipt: '🏪 Depo Teslim Fişi',
                              producerReceipt: '🌾 Müstahsil Makbuzu',
                              customsDeclaration: '🛃 Gümrük Beyannamesi',
                              msds: '🧪 MSDS',
                              fumigationCertificate: '🌫️ Fumigasyon Sertifikası',
                              inspectionReports: '🔎 SGS / Intertek Raporları',
                              paymentDocuments: '💳 Ödeme Belgeleri',
                              healthCertificates: '🩺 Sağlık/Veteriner Sertifika',
                              specialCertificates: '🕋 Helal/Kosher/ECO Sertifikaları',
                              importExportLicense: '📜 İthalat/İhracat Lisansı',
                              antidampingCertificates: '🌱 Anti-damping Belgeleri',
                              productManuals: '📘 Ürün Teknik Bilgi Formları',
                              other: '➕ Diğer'
                            };
                            
                            return (
                              <div key={index} className="flex items-center p-2 bg-pink-50 rounded-lg border border-pink-200">
                                <span className="text-sm text-pink-700 font-medium">
                                  {documentLabels[doc] || doc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* İlan İstatistikleri */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <span className="text-2xl">�</span>
                      </div>
                      İlan İstatistikleri
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{selectedListing.view_count || 0}</div>
                          <div className="text-sm text-gray-600">Görüntüleme</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{selectedListing.offer_count || 0}</div>
                          <div className="text-sm text-gray-600">Teklif</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <div className="text-sm text-gray-600">
                          Son güncelleme: {formatDate(selectedListing.updated_at)}
                        </div>
                      </div>
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

      {/* İlan Düzenleme Modalı */}
      {editModalOpen && editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">İlanı Düzenle</h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Modalı Kapat"
                  aria-label="Modalı Kapat"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateListing}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlan Başlığı *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={editFormData.title}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="İlan başlığını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="İlan açıklamasını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yük Tipi
                      </label>
                      <input
                        type="text"
                        name="load_type"
                        value={editFormData.load_type}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Yük tipini girin"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ağırlık
                        </label>
                        <input
                          type="number"
                          name="weight_value"
                          title="Ağırlık Değeri"
                          step="0.01"
                          value={editFormData.weight_value}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Birim
                        </label>
                        <select
                          name="weight_unit"
                          title="Ağırlık Birimi"
                          value={editFormData.weight_unit}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="kg">kg</option>
                          <option value="ton">ton</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hacim
                        </label>
                        <input
                          type="number"
                          name="volume_value"
                          title="Hacim Değeri"
                          step="0.01"
                          value={editFormData.volume_value}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Birim
                        </label>
                        <select
                          name="volume_unit"
                          title="Hacim Birimi"
                          value={editFormData.volume_unit}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="m3">m³</option>
                          <option value="litre">Litre</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Çıkış Noktası *
                      </label>
                      <input
                        type="text"
                        name="origin"
                        required
                        value={editFormData.origin}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Çıkış noktasını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Varış Noktası *
                      </label>
                      <input
                        type="text"
                        name="destination"
                        required
                        value={editFormData.destination}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Varış noktasını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yükleme Tarihi
                      </label>
                      <input
                        type="date"
                        name="loading_date"
                        title="Yükleme Tarihi"
                        value={editFormData.loading_date}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teslimat Tarihi
                      </label>
                      <input
                        type="date"
                        name="delivery_date"
                        title="Teslimat Tarihi"
                        value={editFormData.delivery_date}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiyat
                        </label>
                        <input
                          type="number"
                          name="price_amount"
                          title="Fiyat Miktarı"
                          step="0.01"
                          value={editFormData.price_amount}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiyat Türü
                        </label>
                        <select
                          name="price_per"
                          title="Fiyat Türü"
                          value={editFormData.price_per}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="total">Toplam</option>
                          <option value="ton">Ton</option>
                          <option value="km">km</option>
                          <option value="day">Gün</option>
                          <option value="hour">Saat</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    {editSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsSection;
