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
      if (!user) return;
      
      try {
        setLoading(true);
        const userListings = await ListingService.getUserListings(user.id);
        setListings(userListings);
        console.log('✅ User listings loaded:', userListings);
      } catch (error) {
        console.error('Error loading user listings:', error);
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hiç ilanınız yok</h3>
              <p className="text-gray-600 mb-6">İlk ilanınızı oluşturarak başlayın!</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">İlan Detayı</h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Modalı Kapat"
                  aria-label="Modalı Kapat"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı</label>
                    <p className="text-sm text-gray-900">{selectedListing.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <p className="text-sm text-gray-900">{selectedListing.description || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yük Tipi</label>
                    <p className="text-sm text-gray-900">{selectedListing.load_type || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ağırlık</label>
                    <p className="text-sm text-gray-900">
                      {selectedListing.weight_value ? `${selectedListing.weight_value} ${selectedListing.weight_unit}` : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hacim</label>
                    <p className="text-sm text-gray-900">
                      {selectedListing.volume_value ? `${selectedListing.volume_value} ${selectedListing.volume_unit}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Noktası</label>
                    <p className="text-sm text-gray-900">{selectedListing.origin}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Varış Noktası</label>
                    <p className="text-sm text-gray-900">{selectedListing.destination}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yükleme Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedListing.loading_date)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedListing.delivery_date)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                    <p className="text-sm text-gray-900">
                      {selectedListing.price_amount ? `${selectedListing.price_amount} ${selectedListing.price_currency || 'TL'} / ${selectedListing.price_per}` : '-'}
                    </p>
                  </div>
                  
                  {selectedListing.owner_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İlan Sahibi</label>
                      <p className="text-sm text-gray-900">{selectedListing.owner_name}</p>
                      {selectedListing.owner_phone && (
                        <p className="text-sm text-gray-600">{selectedListing.owner_phone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Dosyalar */}
              {(selectedListing.document_urls && selectedListing.document_urls.length > 0) || 
               (selectedListing.image_urls && selectedListing.image_urls.length > 0) ? (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dosyalar</h3>
                  
                  {selectedListing.document_urls && selectedListing.document_urls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Evraklar</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {selectedListing.document_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700 truncate">Evrak {index + 1}</span>
                            <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedListing.image_urls && selectedListing.image_urls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Görseller</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {selectedListing.image_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700 truncate">Görsel {index + 1}</span>
                            <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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
