import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Truck,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { useAuth } from '../../../context/SupabaseAuthContext';
import { ListingService } from '../../../services/listingService';
import ShipmentRequestDetailModal from '../../modals/ShipmentRequestDetailModal';
import EditShipmentRequestModal from '../../modals/EditShipmentRequestModal';
import ListingCard from '../../common/ListingCard';
import type { ExtendedListing } from '../../../types/database-types';

/**
 * Nakliye Talepleri Bileşeni
 * Sadece shipment_request tipindeki ilanları yönetir
 */
const MyShipmentRequests: React.FC = () => {
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
  const loadShipmentRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userListings = await ListingService.getUserListings(user.id);
      // Sadece shipment_request tipindeki ilanları filtrele
      const shipmentRequests = userListings.filter(listing => listing.listing_type === 'shipment_request');
      setListings(shipmentRequests);
    } catch (error) {
      console.error('Shipment requests yüklenirken hata:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadShipmentRequests();
  }, [loadShipmentRequests]);

  // Arama filtreleme
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // İlan güncelleme
  // İlan silme
  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Bu nakliye talebini silmek istediğinizden emin misiniz?')) return;
    
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

  // Edit modal'dan gelen güncelleme
  const handleEditUpdate = (updatedListing: ExtendedListing) => {
    setListings(prev => prev.map(listing => 
      listing.id === updatedListing.id ? updatedListing : listing
    ));
    
    // Eğer detail modal açıksa ve güncellenen ilan aynı ilansa, selectedListing'i de güncelle
    if (selectedListing && selectedListing.id === updatedListing.id) {
      setSelectedListing(updatedListing);
    }
    
    setEditListing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Nakliye talepleri yükleniyor...</span>
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
              placeholder="Nakliye taleplerinde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredListings.length}</span> talep bulundu
          </div>
        </div>
        
        <button
          onClick={() => setActiveSection('create-shipment-request')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Nakliye Talebi
        </button>
      </div>

      {/* İlan Listesi */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aramanızla eşleşen talep bulunamadı' : 'Henüz nakliye talebiniz yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Farklı anahtar kelimelerle tekrar deneyin' : 'İlk nakliye talebinizi oluşturun'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setActiveSection('create-shipment-request')}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              İlk Talebimi Oluştur
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
              onMessage={() => {}} // Boş fonksiyon - MyListings sayfasında mesaj gönderme gerekmiyor
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editListing && (
        <EditShipmentRequestModal
          listing={editListing}
          isOpen={!!editListing}
          onClose={() => setEditListing(null)}
          onUpdated={handleEditUpdate}
        />
      )}

      {/* Preview Modal - ShipmentRequestDetailModal kullan */}
      {showPreview && selectedListing && (
        <ShipmentRequestDetailModal
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

export default MyShipmentRequests;
