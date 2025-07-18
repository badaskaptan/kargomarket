import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Package,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { useAuth } from '../../../context/SupabaseAuthContext';
import { ListingService } from '../../../services/listingService';
import LoadListingDetailModal from '../../modals/LoadListingDetailModal';
import ListingCard from '../../common/ListingCard';
import type { ExtendedListing } from '../../../types/database-types';

/**
 * Yük İlanları Bileşeni
 * Sadece load_listing tipindeki ilanları yönetir
 */
const MyLoadListings: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  
  // State
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  const [editListing, setEditListing] = useState<ExtendedListing | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Veri yükleme
  // Veri yükleme
  const loadLoadListings = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userListings = await ListingService.getUserListings(user.id);
      // Sadece load_listing tipindeki ilanları filtrele
      const loadListings = userListings.filter(listing => listing.listing_type === 'load_listing');
      setListings(loadListings);
    } catch (error) {
      console.error('Load listings yüklenirken hata:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLoadListings();
  }, [loadLoadListings]);

  // Arama filtreleme
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // İlan güncelleme
  // İlan silme
  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await ListingService.deleteListing(listingId);
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error('İlan silinirken hata:', error);
    }
  };

  // Önizleme aç
  const handlePreview = (listing: ExtendedListing) => {
    setSelectedListing(listing);
    setShowPreview(true);
  };

  // Düzenleme aç
  const handleEdit = (listing: ExtendedListing) => {
    setEditListing(listing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Yük ilanları yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="İlanlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredListings.length}</span> ilan bulundu
          </div>
        </div>
        
        <button
          onClick={() => setActiveSection('create-load-listing')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yük İlanı
        </button>
      </div>

      {/* İlan Listesi */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aramanızla eşleşen ilan bulunamadı' : 'Henüz yük ilanınız yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Farklı anahtar kelimelerle tekrar deneyin' : 'İlk yük ilanınızı oluşturun'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setActiveSection('create-load-listing')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              İlk İlanımı Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              layout="compact"
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}

      {/* Edit Modal - geçici olarak kapatıldı */}
      {editListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Düzenleme</h3>
            <p className="text-gray-600 mb-4">Edit modal henüz hazır değil</p>
            <button
              onClick={() => setEditListing(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal - LoadListingDetailModal kullan */}
      {showPreview && selectedListing && (
        <LoadListingDetailModal
          listing={selectedListing}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedListing(null);
          }}
        />
      )}
    </div>
  );
};

export default MyLoadListings;
