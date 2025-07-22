import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Edit,
  Check,
  RefreshCw,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { OfferService, type ExtendedOffer } from '../../services/offerService';
import { ServiceOfferService } from '../../services/serviceOfferService';
import type { ExtendedServiceOffer } from '../../types/service-offer-types';
import OfferDetailModal from '../modals/OfferDetailModal';
import CreateOfferModal from '../modals/CreateOfferModal';
import EditOfferModal from '../modals/EditOfferModal';
import AcceptRejectOfferModal from '../modals/AcceptRejectOfferModal';
import type { Database } from '../../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface MyOffersSectionProps {
  currentUserId: string;
}

const MyOffersSection: React.FC<MyOffersSectionProps> = ({ currentUserId }) => {
  // --- STATE TANIMLARI ---
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<ExtendedOffer | ExtendedServiceOffer | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Real data states
  const [sentOffers, setSentOffers] = useState<ExtendedOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<ExtendedOffer[]>([]);
  const [sentServiceOffers, setSentServiceOffers] = useState<ExtendedServiceOffer[]>([]);
  const [receivedServiceOffers, setReceivedServiceOffers] = useState<ExtendedServiceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [acceptRejectModalOpen, setAcceptRejectModalOpen] = useState(false);

  // --- HELPER FUNCTIONS ---
  const closeAllModals = useCallback(() => {
    setDetailModalOpen(false);
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setAcceptRejectModalOpen(false);
    setSelectedOffer(null);
    setSelectedListing(null);
  }, []);

  // --- VERİ ÇEKME FONKSİYONLARI ---
  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load regular offers
      const [sent, received] = await Promise.all([
        OfferService.getSentOffers(currentUserId),
        OfferService.getReceivedOffers(currentUserId)
      ]);
      
      setSentOffers(sent);
      setReceivedOffers(received);

      // Load service offers
      const [sentService, receivedService] = await Promise.all([
        ServiceOfferService.getSentServiceOffers(currentUserId),
        ServiceOfferService.getReceivedServiceOffers(currentUserId)
      ]);
      
      setSentServiceOffers(sentService);
      setReceivedServiceOffers(receivedService);

    } catch (err) {
      console.error('Error loading offers:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata oluştu');
      toast.error('Teklifler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadOffers();
    }
  }, [loadOffers, currentUserId]);

  // --- STATUS HELPER FUNCTIONS ---
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'Bekliyor';
      default:
        return 'Bilinmiyor';
    }
  };

  // --- FORMAT LISTING NUMBER ---
  const formatListingNumber = (offer: ExtendedOffer) => {
    // İlan numarasını sadece numara olarak göster
    if (offer.listing?.listing_number) {
      return offer.listing.listing_number;
    }
    return offer.listing_id || 'N/A';
  };

  // --- FORMAT SERVICE NUMBER ---
  const formatServiceNumber = (offer: ExtendedServiceOffer) => {
    // Servis numarasını sadece numara olarak göster
    if (offer.transport_service?.service_number) {
      return offer.transport_service.service_number;
    }
    return offer.transport_service_id || 'N/A';
  };

  // --- EVENT HANDLERS ---
  const handleAcceptOffer = useCallback(async (offerId: string) => {
    try {
      // Regular offers için OfferService kullan
      const { error } = await supabase
        .from('offers')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', offerId);

      if (error) throw error;

      toast.success('Teklif kabul edildi');
      await loadOffers();
      closeAllModals();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Teklif kabul edilirken hata oluştu');
    }
  }, [loadOffers, closeAllModals]);

  const handleRejectOffer = useCallback(async (offerId: string) => {
    try {
      // Regular offers için OfferService kullan
      const { error } = await supabase
        .from('offers')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', offerId);

      if (error) throw error;

      toast.success('Teklif reddedildi');
      await loadOffers();
      closeAllModals();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Teklif reddedilirken hata oluştu');
    }
  }, [loadOffers, closeAllModals]);

  // --- FILTERING ---
  const getFilteredOffers = () => {
    const offers = activeTab === 'sent' ? sentOffers : receivedOffers;
    const serviceOffers = activeTab === 'sent' ? sentServiceOffers : receivedServiceOffers;
    
    const filtered = offers.filter(offer => {
      const searchMatch = searchTerm === '' || 
        offer.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.price_amount?.toString().includes(searchTerm);
      
      const statusMatch = statusFilter === '' || offer.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    const filteredService = serviceOffers.filter(offer => {
      const searchMatch = searchTerm === '' || 
        offer.transport_service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.price_amount?.toString().includes(searchTerm);
      
      const statusMatch = statusFilter === '' || offer.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    return { offers: filtered, serviceOffers: filteredService };
  };

  const { offers: filteredOffers, serviceOffers: filteredServiceOffers } = getFilteredOffers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Teklifler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadOffers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tekliflerim</h2>
        <button
          onClick={loadOffers}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yenile</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aldığım Teklifler
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gönderdiğim Teklifler
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Teklif ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Durum filtresi"
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="accepted">Kabul Edildi</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="space-y-4">
        {/* Regular Offers */}
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Card Header with Listing Number - MAVI ŞERİT */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {formatListingNumber(offer)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {offer.listing?.title || 'İlan başlığı bulunamadı'}
                    </h3>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  offer.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(offer.status || 'pending')}
                    <span>{getStatusLabel(offer.status || 'pending')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Teklif Tutarı</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₺{offer.price_amount?.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teklif Veren</p>
                  <p className="text-sm font-medium">{offer.carrier?.full_name || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oluşturma</p>
                  <p className="text-sm">{new Date(offer.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Güncelleme</p>
                  <p className="text-sm">{new Date(offer.updated_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Offer Description */}
              {offer.message && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Mesaj</p>
                  <p className="text-sm text-gray-700">{offer.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedOffer(offer);
                    setDetailModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detay</span>
                </button>

                {activeTab === 'received' && offer.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedOffer(offer);
                      setAcceptRejectModalOpen(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Kabul Et/Reddet</span>
                  </button>
                )}

                {activeTab === 'sent' && offer.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedOffer(offer);
                      setEditModalOpen(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Düzenle</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Service Offers */}
        {filteredServiceOffers.map((offer) => (
          <div
            key={`service-${offer.id}`}
            className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Service Offer Card Header with Service Number - TURUNCU ŞERİT */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      {formatServiceNumber(offer)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {offer.transport_service?.title || 'Servis başlığı bulunamadı'}
                    </h3>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  offer.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(offer.status || 'pending')}
                    <span>{getStatusLabel(offer.status || 'pending')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Card Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Teklif Tutarı</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₺{offer.price_amount?.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teklif Veren</p>
                  <p className="text-sm font-medium">{offer.sender?.full_name || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oluşturma</p>
                  <p className="text-sm">{new Date(offer.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Güncelleme</p>
                  <p className="text-sm">{new Date(offer.updated_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Service Route Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Kalkış</p>
                  <p className="text-sm font-medium">{offer.transport_service?.origin || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Varış</p>
                  <p className="text-sm font-medium">{offer.transport_service?.destination || 'Belirtilmemiş'}</p>
                </div>
              </div>

              {/* Service Offer Description */}
              {offer.message && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Mesaj</p>
                  <p className="text-sm text-gray-700">{offer.message}</p>
                </div>
              )}

              {/* Service Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedOffer(offer);
                    setDetailModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detay</span>
                </button>

                {activeTab === 'received' && offer.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedOffer(offer);
                      setAcceptRejectModalOpen(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Kabul Et/Reddet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredOffers.length === 0 && filteredServiceOffers.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'sent' ? 'Henüz gönderdiğiniz teklif yok.' : 'Henüz aldığınız teklif yok.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOffer && 'listing_id' in selectedOffer && (
        <>
          <OfferDetailModal
            offer={selectedOffer as ExtendedOffer}
            currentUserId={currentUserId}
            isOpen={detailModalOpen}
            onClose={closeAllModals}
          />
          
          <EditOfferModal
            offer={selectedOffer as ExtendedOffer}
            isOpen={editModalOpen}
            onClose={closeAllModals}
            onSubmit={loadOffers}
          />
          
          <AcceptRejectOfferModal
            offer={selectedOffer as ExtendedOffer}
            isOpen={acceptRejectModalOpen}
            onClose={closeAllModals}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
          />
        </>
      )}

      {selectedListing && (
        <CreateOfferModal
          listing={selectedListing}
          currentUserId={currentUserId}
          isOpen={createModalOpen}
          onClose={closeAllModals}
          onSubmit={loadOffers}
        />
      )}
    </div>
  );
};

export default MyOffersSection;
