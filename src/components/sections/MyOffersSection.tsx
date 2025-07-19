import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Edit,
  Check,
  X,
  RefreshCw,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { OfferService, type ExtendedOffer } from '../../services/offerService';
import OfferDetailModal from '../modals/OfferDetailModal';
import CreateOfferModal from '../modals/CreateOfferModal';
import EditOfferModal from '../modals/EditOfferModal';
import AcceptRejectOfferModal from '../modals/AcceptRejectOfferModal';
import type { Database } from '../../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];
type OfferUpdate = Database['public']['Tables']['offers']['Update'];

interface MyOffersSectionProps {
  currentUserId: string;
}

const MyOffersSection: React.FC<MyOffersSectionProps> = ({ currentUserId }) => {
  // --- STATE TANIMLARI ---
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<ExtendedOffer | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Real data states
  const [sentOffers, setSentOffers] = useState<ExtendedOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<ExtendedOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [acceptRejectModalOpen, setAcceptRejectModalOpen] = useState(false);

  // --- DATA FETCHING ---
  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sentData, receivedData] = await Promise.all([
        OfferService.getSentOffers(currentUserId),
        OfferService.getReceivedOffers(currentUserId)
      ]);

      setSentOffers(sentData);
      setReceivedOffers(receivedData);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setError('Teklifler yüklenirken bir hata oluştu');
      toast.error('Teklifler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchOffers();

      // TEST: Basit queries
      console.log('🧪 Running test queries...');
      import('../../services/testQueries').then(({ testOffers, testProfiles, testListings }) => {
        testOffers();
        testProfiles();
        testListings();
      });
    }
  }, [currentUserId, fetchOffers]);

  // --- OFFER ACTIONS ---
  const handleCreateOffer = async (offerData: Omit<OfferInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await OfferService.createOffer(offerData);
      toast.success('Teklif başarıyla gönderildi');
      fetchOffers(); // Refresh data
    } catch (error) {
      console.error('Create offer failed:', error);
      toast.error('Teklif gönderilirken bir hata oluştu');
    }
  };

  const handleUpdateOffer = async (offerId: string, updates: OfferUpdate) => {
    try {
      await OfferService.updateOffer(offerId, updates);
      toast.success('Teklif başarıyla güncellendi');
      fetchOffers(); // Refresh data
    } catch (error) {
      console.error('Update offer failed:', error);
      toast.error('Teklif güncellenirken bir hata oluştu');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAcceptOffer = async (offerId: string, _reason?: string) => {
    try {
      await OfferService.acceptOffer(offerId);
      toast.success('Teklif kabul edildi');
      fetchOffers(); // Refresh data
    } catch (error) {
      console.error('Accept offer failed:', error);
      toast.error('Teklif kabul edilirken bir hata oluştu');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRejectOffer = async (offerId: string, _reason?: string) => {
    try {
      await OfferService.rejectOffer(offerId);
      toast.success('Teklif reddedildi');
      fetchOffers(); // Refresh data
    } catch (error) {
      console.error('Reject offer failed:', error);
      toast.error('Teklif reddedilirken bir hata oluştu');
    }
  };

  const handleWithdrawOffer = async (offerId: string) => {
    try {
      await OfferService.withdrawOffer(offerId);
      toast.success('Teklif geri çekildi');
      fetchOffers(); // Refresh data
    } catch (error) {
      console.error('Withdraw offer failed:', error);
      toast.error('Teklif geri çekilirken bir hata oluştu');
    }
  };

  // --- MODAL HANDLERS ---
  const openDetailModal = (offer: ExtendedOffer) => {
    setSelectedOffer(offer);
    setDetailModalOpen(true);
  };

  const openEditModal = (offer: ExtendedOffer) => {
    setSelectedOffer(offer);
    setEditModalOpen(true);
  };

  const openAcceptRejectModal = (offer: ExtendedOffer) => {
    setSelectedOffer(offer);
    setAcceptRejectModalOpen(true);
  };

  const closeAllModals = () => {
    setDetailModalOpen(false);
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setAcceptRejectModalOpen(false);
    setSelectedOffer(null);
    setSelectedListing(null);
  };

  // --- FILTERING & SEARCH ---
  const currentOffers = activeTab === 'sent' ? sentOffers : receivedOffers;

  const filteredOffers = currentOffers.filter(offer => {
    const matchesSearch = !searchTerm ||
      offer.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.carrier?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.listing_owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || (offer.status && offer.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  // --- HELPER FUNCTIONS ---
  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'countered': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Bilinmiyor';
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      case 'withdrawn': return 'Geri Çekildi';
      case 'countered': return 'Karşı Teklif';
      default: return status;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'countered': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number, currency?: string | null) => {
    const curr = currency || 'TRY';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: curr === 'TRY' ? 'TRY' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // --- RENDER ---
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOffers}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tekliflerim</h2>
          <button
            onClick={fetchOffers}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'received'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Gelen Teklifler ({receivedOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sent'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Gönderilen Teklifler ({sentOffers.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="İlan başlığı veya kullanıcı adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Durum filtresi"
              aria-label="Durum filtresi"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="accepted">Kabul Edildi</option>
              <option value="rejected">Reddedildi</option>
              <option value="withdrawn">Geri Çekildi</option>
              <option value="countered">Karşı Teklif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Teklifler yükleniyor...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentOffers.length === 0 ? 'Henüz teklif yok' : 'Sonuç bulunamadı'}
            </h3>
            <p className="text-gray-600">
              {currentOffers.length === 0
                ? `Henüz ${activeTab === 'sent' ? 'gönderilen' : 'gelen'} teklif bulunmuyor.`
                : 'Arama kriterlerinize uygun teklif bulunamadı.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {offer.listing?.title || `İlan #${offer.listing_id?.substring(0, 8)}` || 'İlan Başlığı'}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(offer.status || 'pending')}`}>
                        {getStatusIcon(offer.status || 'pending')}
                        <span>{getStatusLabel(offer.status || 'pending')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Teklif Tutarı: </span>
                        <span className="text-blue-600 font-semibold">
                          {formatPrice(offer.price_amount || 0, offer.price_currency || 'TRY')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Tarih: </span>
                        {formatDate(offer.created_at)}
                      </div>
                      {offer.service_description && (
                        <div>
                          <span className="font-medium">Hizmet Açıklaması: </span>
                          {offer.service_description}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">
                          {activeTab === 'sent' ? 'İlan Sahibi: ' : 'Teklif Veren: '}
                        </span>
                        {activeTab === 'sent'
                          ? (offer.listing_owner?.full_name || offer.listing?.user_id?.substring(0, 8) || 'Bilinmiyor')
                          : (offer.carrier?.full_name || offer.user_id?.substring(0, 8) || 'Bilinmiyor')
                        }
                      </div>
                    </div>

                    {offer.message && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{offer.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openDetailModal(offer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Detayları Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Actions based on user role and offer status */}
                    {activeTab === 'sent' && offer.status === 'pending' && (
                      <button
                        onClick={() => openEditModal(offer)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Teklifi Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {activeTab === 'received' && offer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openAcceptRejectModal(offer)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Kabul Et / Reddet"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {activeTab === 'sent' && offer.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawOffer(offer.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Teklifi Geri Çek"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOffer && (
        <>
          <OfferDetailModal
            offer={selectedOffer}
            isOpen={detailModalOpen}
            onClose={closeAllModals}
            currentUserId={currentUserId}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            onWithdraw={handleWithdrawOffer}
            onEdit={openEditModal}
          />

          <EditOfferModal
            offer={selectedOffer}
            isOpen={editModalOpen}
            onClose={closeAllModals}
            onSubmit={handleUpdateOffer}
          />

          <AcceptRejectOfferModal
            offer={selectedOffer}
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
          isOpen={createModalOpen}
          onClose={closeAllModals}
          onSubmit={handleCreateOffer}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default MyOffersSection;