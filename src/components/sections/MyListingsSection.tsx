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
  const { setActiveSection, setEditingShipmentRequestId } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  const [relatedLoadListing, setRelatedLoadListing] = useState<ExtendedListing | null>(null);
  const [loadingRelatedListing, setLoadingRelatedListing] = useState(false);
  
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
    volume_value: '',
    price_amount: '',
    transport_responsible: ''
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
    // Eğer shipment_request ise, özel düzenleme section'ına yönlendir
    if (listing.listing_type === 'shipment_request') {
      setEditingShipmentRequestId(listing.id);
      setActiveSection('edit-shipment-request');
      return;
    }
    
    // Diğer ilan tipleri için mevcut modal'ı kullan
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
      volume_value: listing.volume_value?.toString() || '',
      price_amount: listing.price_amount?.toString() || '',
      transport_responsible: listing.transport_responsible || ''
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
        weight_unit: 'ton', // Sabit değer
        volume_value: editFormData.volume_value ? parseFloat(editFormData.volume_value) : null,
        volume_unit: 'm3', // Sabit değer
        price_amount: editFormData.price_amount ? parseFloat(editFormData.price_amount) : null,
        price_currency: 'TRY', // Sabit değer
        transport_responsible: editFormData.transport_responsible && ['buyer', 'seller', 'carrier', 'negotiable'].includes(editFormData.transport_responsible) 
          ? editFormData.transport_responsible as 'buyer' | 'seller' | 'carrier' | 'negotiable'
          : null
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

  // İlgili yük ilanını getir (Nakliye Talebi için)
  const loadRelatedLoadListing = async (relatedListingId: string) => {
    try {
      setLoadingRelatedListing(true);
      const relatedListing = await ListingService.getListingById(relatedListingId);
      setRelatedLoadListing(relatedListing);
    } catch (error) {
      console.error('Error loading related load listing:', error);
      setRelatedLoadListing(null);
    } finally {
      setLoadingRelatedListing(false);
    }
  };

  // Seçilen ilan değiştiğinde ilgili yük ilanını yükle
  useEffect(() => {
    if (selectedListing?.listing_type === 'shipment_request' && selectedListing?.related_load_listing_id) {
      loadRelatedLoadListing(selectedListing.related_load_listing_id);
    } else {
      setRelatedLoadListing(null);
    }
  }, [selectedListing]);

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

                    {/* Nakliye Talebi İçin Özel Bölüm - Hangi Yük İlanına Bağlı? */}
                    {selectedListing.listing_type === 'shipment_request' && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <span className="text-lg">🔗</span>
                          </div>
                          Hangi Yük İlanına Bağlı?
                        </h4>
                        
                        {selectedListing.related_load_listing_id ? (
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                            {loadingRelatedListing ? (
                              <div className="flex items-center text-gray-600">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span>İlgili yük ilanı bilgisi yükleniyor...</span>
                              </div>
                            ) : relatedLoadListing ? (
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                                        ILN
                                      </span>
                                      <span className="font-bold text-blue-700">
                                        {relatedLoadListing.listing_number}
                                      </span>
                                    </div>
                                    <div className="text-gray-900 font-medium mb-1">
                                      {relatedLoadListing.title}
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                        <span>{relatedLoadListing.origin} → {relatedLoadListing.destination}</span>
                                      </div>
                                      {relatedLoadListing.load_type && (
                                        <div className="flex items-center">
                                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                                          <span>{relatedLoadListing.load_type}</span>
                                        </div>
                                      )}
                                      {relatedLoadListing.loading_date && (
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                          <span>{new Date(relatedLoadListing.loading_date).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {relatedLoadListing.status}
                                    </span>
                                  </div>
                                </div>
                                
                                {relatedLoadListing.description && (
                                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-orange-100">
                                    <span className="font-medium">Açıklama: </span>
                                    {relatedLoadListing.description.length > 150 
                                      ? relatedLoadListing.description.substring(0, 150) + '...'
                                      : relatedLoadListing.description
                                    }
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-3">
                                <div className="text-gray-500 text-sm">
                                  ⚠️ İlgili yük ilanı bilgisi alınamadı
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="text-center text-gray-500">
                              <span className="text-2xl block mb-2">📦</span>
                              <span className="text-sm">Bu nakliye talebi belirli bir yük ilanına bağlı değil</span>
                            </div>
                          </div>
                        )}
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

                  {/* Fiyat Bilgileri - Sadece fiyat belirlenmiş ilanlar için */}
                  {selectedListing.price_amount && selectedListing.offer_type !== 'free_quote' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
                      <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <span className="text-2xl">💰</span>
                        </div>
                        Fiyat Bilgileri
                      </h3>
                      <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                        <div className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Belirlenen Fiyat</div>
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
                        
                        {/* Teklif Alma Şekli */}
                        {selectedListing.offer_type && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Teklif Alma Şekli</div>
                            <div className="text-gray-900 font-medium">
                              {selectedListing.offer_type === 'fixed_price' ? 'Fiyat Belirleyerek' : 
                               selectedListing.offer_type === 'negotiable' ? 'Pazarlığa Açık' : 
                               selectedListing.offer_type === 'auction' ? 'Açık Artırma' :
                               selectedListing.offer_type === 'free_quote' ? 'Doğrudan Teklif' :
                               selectedListing.offer_type}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Doğrudan Teklif Bilgisi - Fiyat belirlenmemiş ilanlar için */}
                  {(!selectedListing.price_amount || selectedListing.offer_type === 'free_quote') && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <span className="text-2xl">🎯</span>
                        </div>
                        Teklif Alma Şekli
                      </h3>
                      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">Doğrudan Teklif</div>
                          <p className="text-gray-700 text-sm">
                            Bu ilan için fiyat belirtilmemiştir. İlgilenen taraflardan doğrudan teklif beklenmektedir.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                    )}                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* İlan Düzenleme Modalı */}
      {editModalOpen && editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">İlanı Düzenle</h2>
                  <p className="text-sm text-gray-600 mt-1">İlan No: {editingListing.listing_number}</p>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  title="Modalı Kapat"
                  aria-label="Modalı Kapat"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Bilgi Notu */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Düzenleme Rehberi</h3>
                    <p className="mt-1 text-sm text-amber-700">
                      Yük tipi ve nakliye sorumlusu gibi temel bilgiler sonradan değiştirilebilir. 
                      Büyük değişiklikler için ilanı silerek yeni ilan açmanızı öneririz.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleUpdateListing} className="space-y-8">
                {/* Temel Bilgiler */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Temel Bilgiler
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlan Başlığı *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={editFormData.title}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="İlan başlığını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yük Tipi
                      </label>
                      <select
                        name="load_type"
                        value={editFormData.load_type}
                        onChange={handleEditFormChange}
                        title="Yük Tipi Seçimi"
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      >
                        <option value="">Seçiniz</option>
                        <optgroup label="Genel Kargo / Paletli Ürünler">
                          <option value="box_package">📦 Koli / Paket</option>
                          <option value="pallet_standard">🏗️ Paletli Yükler - Standart Palet</option>
                          <option value="pallet_euro">🇪🇺 Paletli Yükler - Euro Palet</option>
                          <option value="pallet_industrial">🏭 Paletli Yükler - Endüstriyel Palet</option>
                          <option value="sack_bigbag">🛍️ Çuval / Bigbag (Dökme Olmayan)</option>
                          <option value="barrel_drum">🛢️ Varil / Fıçı</option>
                          <option value="appliances_electronics">📱 Beyaz Eşya / Elektronik</option>
                          <option value="furniture_decor">🪑 Mobilya / Dekorasyon Ürünleri</option>
                          <option value="textile_products">👕 Tekstil Ürünleri</option>
                          <option value="automotive_parts">🚗 Otomotiv Parçaları / Yedek Parça</option>
                          <option value="construction_materials">🏗️ İnşaat Malzemeleri</option>
                          <option value="packaged_food">🥫 Ambalajlı Gıda Ürünleri</option>
                          <option value="consumer_goods">🛒 Tüketim Ürünleri</option>
                          <option value="ecommerce_cargo">📱 E-ticaret Kargo</option>
                          <option value="other_general">📋 Diğer Genel Kargo</option>
                        </optgroup>
                        <optgroup label="Dökme Yükler">
                          <option value="grain">🌾 Tahıl</option>
                          <option value="ore">⛏️ Maden Cevheri</option>
                          <option value="coal">⚫ Kömür</option>
                          <option value="cement_bulk">🏗️ Çimento (Dökme)</option>
                          <option value="sand_gravel">🏖️ Kum / Çakıl</option>
                          <option value="fertilizer_bulk">🌱 Gübre (Dökme)</option>
                          <option value="soil_excavation">🏗️ Toprak / Hafriyat</option>
                          <option value="scrap_metal">♻️ Hurda Metal</option>
                          <option value="other_bulk">📋 Diğer Dökme Yükler</option>
                        </optgroup>
                        <optgroup label="Sıvı Yükler">
                          <option value="crude_oil">🛢️ Ham Petrol / Petrol Ürünleri</option>
                          <option value="chemical_liquids">🧪 Kimyasal Sıvılar</option>
                          <option value="vegetable_oils">🌻 Bitkisel Yağlar</option>
                          <option value="fuel">⛽ Yakıt</option>
                          <option value="lpg_lng">🔥 LPG / LNG</option>
                          <option value="water">💧 Su</option>
                          <option value="milk_dairy">🥛 Süt / Süt Ürünleri</option>
                          <option value="other_liquid">💧 Diğer Sıvı Yükler</option>
                        </optgroup>
                        <optgroup label="Ağır / Gabari Dışı Yük">
                          <option value="heavy_machinery">🏗️ Büyük İş Makineleri</option>
                          <option value="transformer_generator">⚡ Trafo / Jeneratör</option>
                          <option value="boat_yacht">⛵ Tekne / Yat</option>
                          <option value="industrial_parts">🏭 Büyük Endüstriyel Parçalar</option>
                          <option value="prefab_elements">🏗️ Prefabrik Yapı Elemanları</option>
                          <option value="wind_turbine">💨 Rüzgar Türbini</option>
                          <option value="other_oversized">📏 Diğer Gabari Dışı Yükler</option>
                        </optgroup>
                        <optgroup label="Hassas / Kırılabilir">
                          <option value="art_antiques">🎨 Sanat Eserleri / Antikalar</option>
                          <option value="glass_ceramic">🏺 Cam / Seramik Ürünler</option>
                          <option value="electronic_devices">💻 Elektronik Cihaz</option>
                          <option value="medical_devices">🏥 Tıbbi Cihazlar</option>
                          <option value="flowers_plants">🌸 Çiçek / Canlı Bitki</option>
                          <option value="other_sensitive">🔒 Diğer Hassas Kargo</option>
                        </optgroup>
                        <optgroup label="Tehlikeli Madde">
                          <option value="dangerous_class1">💥 Patlayıcılar (Sınıf 1)</option>
                          <option value="dangerous_class2">💨 Gazlar (Sınıf 2)</option>
                          <option value="dangerous_class3">🔥 Yanıcı Sıvılar (Sınıf 3)</option>
                          <option value="dangerous_class4">🔥 Yanıcı Katılar (Sınıf 4)</option>
                          <option value="dangerous_class5">⚗️ Oksitleyici Maddeler (Sınıf 5)</option>
                          <option value="dangerous_class6">☠️ Zehirli Maddeler (Sınıf 6)</option>
                          <option value="dangerous_class7">☢️ Radyoaktif Maddeler (Sınıf 7)</option>
                          <option value="dangerous_class8">🧪 Aşındırıcı Maddeler (Sınıf 8)</option>
                          <option value="dangerous_class9">⚠️ Diğer Tehlikeli Maddeler (Sınıf 9)</option>
                        </optgroup>
                        <optgroup label="Soğuk Zincir">
                          <option value="frozen_food">🧊 Donmuş Gıda</option>
                          <option value="fresh_produce">🥬 Taze Meyve / Sebze</option>
                          <option value="meat_dairy">🥩 Et / Süt Ürünleri</option>
                          <option value="pharma_vaccine">💊 İlaç / Aşı</option>
                          <option value="chemical_temp">🌡️ Kimyasal Maddeler (Isı Kontrollü)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      placeholder="İlan açıklamasını girin"
                    />
                  </div>
                </div>

                {/* Konum Bilgileri */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Konum Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Çıkış Noktası *
                      </label>
                      <input
                        type="text"
                        name="origin"
                        required
                        value={editFormData.origin}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="Çıkış noktasını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Varış Noktası *
                      </label>
                      <input
                        type="text"
                        name="destination"
                        required
                        value={editFormData.destination}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="Varış noktasını girin"
                      />
                    </div>
                  </div>
                </div>

                {/* Zaman ve Nakliye Bilgileri */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                    Zaman ve Nakliye Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yükleme Tarihi
                      </label>
                      <input
                        type="date"
                        name="loading_date"
                        value={editFormData.loading_date}
                        onChange={handleEditFormChange}
                        title="Yükleme Tarihi"
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teslimat Tarihi
                      </label>
                      <input
                        type="date"
                        name="delivery_date"
                        value={editFormData.delivery_date}
                        onChange={handleEditFormChange}
                        title="Teslimat Tarihi"
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nakliye Kime Ait
                      </label>
                      <select
                        name="transport_responsible"
                        value={editFormData.transport_responsible || ''}
                        onChange={handleEditFormChange}
                        title="Nakliye Sorumlusu Seçimi"
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                      >
                        <option value="">Seçiniz</option>
                        <option value="buyer">🛒 Alıcı</option>
                        <option value="seller">🏪 Satıcı</option>
                        <option value="carrier">🚛 Nakliyeci</option>
                        <option value="negotiable">🤝 Pazarlık Edilebilir</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Yük Özellikleri */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-orange-600" />
                    Yük Özellikleri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ağırlık (ton)
                      </label>
                      <input
                        type="number"
                        name="weight_value"
                        step="0.01"
                        value={editFormData.weight_value}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hacim (m³)
                      </label>
                      <input
                        type="number"
                        name="volume_value"
                        step="0.01"
                        value={editFormData.volume_value}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiyat Bilgileri */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Fiyat Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiyat (TL)
                      </label>
                      <input
                        type="number"
                        name="price_amount"
                        step="0.01"
                        value={editFormData.price_amount}
                        onChange={handleEditFormChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Modal Alt Butonlar */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-8 py-3 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Değişiklikleri Kaydet
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
