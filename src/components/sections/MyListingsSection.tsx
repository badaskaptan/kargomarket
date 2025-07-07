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
  Loader2
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import type { Listing } from '../../types/database-types';

// Gerçek Supabase verileriyle extended Listing interface
interface ExtendedListing extends Omit<Listing, 'listing_number'> {
  listing_number?: string;
}

const MyListingsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'active' ? 'Aktif' : 
         status === 'paused' ? 'Duraklatılmış' : 
         status === 'completed' ? 'Tamamlandı' :
         status === 'cancelled' ? 'İptal' : 
         status === 'draft' ? 'Taslak' :
         status === 'expired' ? 'Süresi Dolmuş' : status}
      </span>
    );
  };

  const getListingTypeBadge = (type: string) => {
    const typeClasses = {
      'load_listing': 'bg-blue-100 text-blue-800',
      'shipment_request': 'bg-orange-100 text-orange-800',
      'transport_service': 'bg-purple-100 text-purple-800'
    };
    
    const typeLabels = {
      'load_listing': '📦 Yük İlanı',
      'shipment_request': '🚚 Nakliye Talebi',
      'transport_service': '🚛 Nakliye Hizmeti'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-800'}`}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">İlanlarınız yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlanlarım</h1>
          <p className="text-gray-600">Yayınladığınız tüm ilanları buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => setActiveSection('create-load-listing')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlan Oluştur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif İlan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Pause className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duraklatılan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="İlan ara... (başlık, nereden, nereye)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
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
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {listing.title}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          #{listing.listing_number || listing.id.substring(0, 8)}
                        </div>
                        {listing.description && (
                          <div className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                            {listing.description}
                          </div>
                        )}
                        {listing.required_documents && Array.isArray(listing.required_documents) && listing.required_documents.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            📋 {listing.required_documents.length} evrak gerekli
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="max-w-xs truncate">
                          {listing.origin} → {listing.destination}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-xs text-gray-500">Oluşturulma</div>
                        <div>{formatDate(listing.created_at)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="İlanı Görüntüle"
                          aria-label="İlanı Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="İlanı Düzenle"
                          aria-label="İlanı Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {listing.status === 'active' ? (
                          <button 
                            className="text-orange-600 hover:text-orange-900"
                            title="İlanı Duraklat"
                            aria-label="İlanı Duraklat"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="İlanı Etkinleştir"
                            aria-label="İlanı Etkinleştir"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="İlanı Sil"
                          aria-label="İlanı Sil"
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
    </div>
  );
};

export default MyListingsSection;
