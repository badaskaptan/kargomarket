import React, { useState, useEffect, Fragment } from 'react';
import {
  Plus, Search, Edit, Pause, Play, Trash2, Eye, MapPin, Package, Calendar, Loader2, X
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import EditModalLoadListing from './EditModalLoadListing';
import EditModalShipmentRequest from './EditModalShipmentRequest';
import TransportServiceDetailSection from './TransportServiceDetailSection';
import EditTransportServiceModal from './EditTransportServiceModal';

import type { ExtendedListing } from '../../types/database-types';

const MyListingsSection = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  const [editListing, setEditListing] = useState<ExtendedListing | null>(null);

  useEffect(() => {
    const loadUserListings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userListings = await ListingService.getUserListings(user.id);
        setListings(
          userListings.map(l => ({
            ...l,
            load_type: l.load_type === null ? '' : l.load_type,
            status: l.status === null ? 'draft' : l.status,
            description: l.description === null ? '' : l.description,
            origin: l.origin === null ? '' : l.origin,
            destination: l.destination === null ? '' : l.destination,
            title: l.title === null ? '' : l.title,
            listing_type: l.listing_type === null ? 'load_listing' : l.listing_type,
            listing_number: l.listing_number === null ? '' : l.listing_number,
            transport_mode: l.transport_mode === null ? 'road' : l.transport_mode,
            vehicle_types: l.vehicle_types === null ? [] : l.vehicle_types,
            // capacity: l.capacity === null ? '' : l.capacity,
            available_from_date: l.available_from_date === null ? '' : l.available_from_date,
            loading_date: l.loading_date === null ? '' : l.loading_date,
            delivery_date: l.delivery_date === null ? '' : l.delivery_date,
            metadata: l.metadata === null ? {} : l.metadata,
          }))
        );
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    loadUserListings();
  }, [user]);

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.load_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePause = async (listing: ExtendedListing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      await ListingService.updateListing(listing.id, { status: newStatus });
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error('Error toggling listing status:', error);
    }
  };

  const handleDeleteListing = async (listing: ExtendedListing) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    try {
      await ListingService.deleteListing(listing.id);
      setListings(prev => prev.filter(l => l.id !== listing.id));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleUpdateListing = (updatedListing: ExtendedListing) => {
    setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
  };

  // Removed unused fetchRelatedLoadListing function

  const getStatusBadge = (status: string) => {
    const config = {
      'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' }
    };
    const { label, color } = (config as Record<string, { label: string; color: string }>)[status] || { label: 'Taslak', color: 'bg-gray-100 text-gray-800' };
    return React.createElement(
      'span',
      { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}` },
      label
    );
  };

  const formatDate = (dateString: string | undefined) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
          <p className="mt-1 text-sm text-gray-600">Toplam {listings.length} ilan</p>
        </div>
        <button
          onClick={() => setActiveSection('create-load-listing')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlan
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="İlan ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          {searchTerm ? (
            <Fragment>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arama sonucu bulunamadı</h3>
              <p className="text-gray-600">"{searchTerm}" için hiçbir ilan bulunamadı.</p>
            </Fragment>
          ) : (
            <Fragment>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{listings.length === 0 ? 'Henüz hiç ilanınız yok' : 'İlan bulunamadı'}</h3>
              <p className="text-gray-600 mb-2">
                {listings.length === 0 ? 'İlk ilanınızı oluşturarak başlayın!' : `Toplam ${listings.length} ilanınız var ama filtreye uygun olan bulunamadı.`}
              </p>
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
            </Fragment>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlan Bilgisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        <div className="text-sm text-gray-500">{listing.load_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />{listing.origin}
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />{listing.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <div>
                          <div>Yükleme: {formatDate(listing.loading_date ?? undefined)}</div>
                          <div>Teslimat: {formatDate(listing.delivery_date ?? undefined)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status ?? '')}
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
      {/* Modal ve Edit bileşenleri */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              title="Modalı Kapat"
              aria-label="Modalı Kapat"
            >
              <X className="h-6 w-6" />
            </button>
            {selectedListing.listing_type === 'transport_service' && (
              <TransportServiceDetailSection listing={prepareTransportServiceDetail(selectedListing)} />
            )}
          </div>
        </div>
      )}
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
        <EditTransportServiceModal
          listing={editListing}
          open={true}
          onClose={() => setEditListing(null)}
        />
      )}
    </div>
  );
};

function prepareTransportServiceDetail(listing: ExtendedListing) {
  return {
    listing_number: listing.listing_number || '',
    title: listing.title || '',
    description: listing.description || '',
    origin: listing.origin || '',
    destination: listing.destination || '',
    transport_mode: listing.transport_mode || '',
    vehicle_types: listing.vehicle_types || [],
    capacity: ('capacity' in listing && typeof listing.capacity === 'string' ? listing.capacity : ''),
    available_from_date: ('available_from_date' in listing && typeof listing.available_from_date === 'string' ? listing.available_from_date : ''),
    status: listing.status || '',
    metadata: ('metadata' in listing && typeof listing.metadata === 'object' && listing.metadata !== null
      ? listing.metadata
      : {
        contact_info: {},
        transport_details: {},
        required_documents: [],
      }),
  };
}

export default MyListingsSection;
