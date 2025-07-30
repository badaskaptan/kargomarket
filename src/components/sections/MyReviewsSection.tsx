import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Eye,
  Building,
  MessageCircle,
  ThumbsUp,
  Save,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/SupabaseAuthContext';
import { reviewService } from '../../services/reviewService';
import type { ReviewWithProfile, ReviewInsert, ReviewUpdate } from '../../services/reviewService';

const MyReviewsSection: React.FC = () => {
  const { user } = useAuth();
  const {
    givenReviews,
    receivedReviews,
    averageRating,
    isLoadingGiven,
    isLoadingReceived,
    isCreating,
    isUpdating,
    isDeleting,
    createReview,
    updateReview,
    deleteReview,
    error
  } = useReviews();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'given' | 'received'>('given');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null);
  const [newReviewModalOpen, setNewReviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewWithProfile | null>(null);

  // Form state'leri
  const [editFormData, setEditFormData] = useState({
    rating: 5,
    comment: '',
    is_public: true,
    title: ''
  });

  const [newReviewFormData, setNewReviewFormData] = useState<{
    reviewee_id: string;
    reviewee_name: string;
    rating: number;
    comment: string;
    title: string;
    is_public: boolean;
    review_type: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general';
  }>({
    reviewee_id: '',
    reviewee_name: '',
    rating: 5,
    comment: '',
    title: '',
    is_public: true,
    review_type: 'general'
  });

  // Kullanıcı arama state'leri
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; email?: string; company_name?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; full_name: string; email?: string; company_name?: string } | null>(null);

  // Star Rating Component
  const StarRating: React.FC<{ rating: number; editable?: boolean; onChange?: (rating: number) => void }> = ({
    rating,
    editable = false,
    onChange
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange?.(star)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            title={`${star} yıldız`}
            aria-label={`${star} yıldız puanı`}
          >
            <Star
              className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      hidden: 'bg-gray-100 text-gray-800',
      reported: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Yayında',
      hidden: 'Gizli',
      reported: 'Bildirildi'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.active}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Edit işlemi
  const handleEdit = (review: ReviewWithProfile) => {
    setSelectedReview(review);
    setEditFormData({
      rating: review.rating,
      comment: review.comment || '',
      is_public: review.is_public,
      title: review.title || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedReview) return;

    const updateData: ReviewUpdate = {
      rating: editFormData.rating,
      comment: editFormData.comment.trim() || null,
      title: editFormData.title.trim() || null,
      is_public: editFormData.is_public
    };

    const result = await updateReview(selectedReview.id, updateData);
    if (result.success) {
      setEditModalOpen(false);
      setSelectedReview(null);
    }
  };

  // Kullanıcı arama fonksiyonu
  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await reviewService.searchUsers(searchTerm);
      setSearchResults(data || []);
    } catch (error) {
      console.error('User search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Kullanıcı arama debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(userSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, searchUsers]);

  // Kullanıcı seçme fonksiyonu
  const handleUserSelect = (user: { id: string; full_name: string; email?: string; company_name?: string }) => {
    setSelectedUser(user);
    setNewReviewFormData(prev => ({
      ...prev,
      reviewee_id: user.id,
      reviewee_name: user.full_name
    }));
    setUserSearchTerm(user.full_name);
    setSearchResults([]);
  };

  // Modal açıldığında state'leri temizle
  const handleNewReviewModalOpen = () => {
    setNewReviewModalOpen(true);
    setSelectedUser(null);
    setUserSearchTerm('');
    setSearchResults([]);
    setNewReviewFormData({
      reviewee_id: '',
      reviewee_name: '',
      rating: 5,
      comment: '',
      title: '',
      is_public: true,
      review_type: 'general'
    });
  };

  // Yeni yorum oluştur
  const handleNewReview = async () => {
    if (!newReviewFormData.reviewee_id || !newReviewFormData.comment.trim() || !user?.id) return;

    const reviewData: ReviewInsert = {
      reviewer_id: user.id,
      reviewee_id: newReviewFormData.reviewee_id,
      rating: newReviewFormData.rating,
      comment: newReviewFormData.comment.trim(),
      title: newReviewFormData.title.trim() || null,
      is_public: newReviewFormData.is_public,
      review_type: newReviewFormData.review_type
    };

    const result = await createReview(reviewData);
    if (result.success) {
      setNewReviewModalOpen(false);
      setSelectedUser(null);
      setUserSearchTerm('');
      setSearchResults([]);
      setNewReviewFormData({
        reviewee_id: '',
        reviewee_name: '',
        rating: 5,
        comment: '',
        title: '',
        is_public: true,
        review_type: 'general'
      });
    }
  };

  // Delete işlemi
  const handleDeleteClick = (review: ReviewWithProfile) => {
    setReviewToDelete(review);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    const result = await deleteReview(reviewToDelete.id);
    if (result.success) {
      setDeleteConfirmOpen(false);
      setReviewToDelete(null);
    }
  };

  // Filtreleme - Yaptığım Yorumlar
  const filteredGivenReviews = useMemo(() => {
    if (!givenReviews) return [];

    return givenReviews.filter(review => {
      const matchesSearch = !searchTerm ||
        review.reviewee_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewee_profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [givenReviews, searchTerm, statusFilter]);

  // Filtreleme - Bana Gelen Yorumlar
  const filteredReceivedReviews = useMemo(() => {
    if (!receivedReviews) return [];

    return receivedReviews.filter(review => {
      const matchesSearch = !searchTerm ||
        review.reviewer_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewer_profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receivedReviews, searchTerm, statusFilter]);

  // Aktif tab'a göre ilgili reviews ve loading state'ini belirle
  const currentReviews = activeTab === 'given' ? filteredGivenReviews : filteredReceivedReviews;
  const isLoading = activeTab === 'given' ? isLoadingGiven : isLoadingReceived;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Yorumlarınızı görmek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  // Debug logs
  console.log('🔍 MyReviewsSection Debug:', {
    user: user?.id,
    userEmail: user?.email,
    givenReviews: givenReviews?.length,
    receivedReviews: receivedReviews?.length,
    isLoadingGiven,
    isLoadingReceived,
    error,
    activeTab,
    givenReviewsData: givenReviews,
    receivedReviewsData: receivedReviews
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Debug Bilgileri (Geliştirme) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🔍 Supabase Debug Bilgileri</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Kullanıcı ID:</strong> {user?.id || 'Bulunamadı'}</p>
          <p><strong>Email:</strong> {user?.email || 'Bulunamadı'}</p>
          <p><strong>Authentication:</strong> {user ? '✅ Giriş Yapılmış' : '❌ Giriş Yapılmamış'}</p>
          <p><strong>Yaptığım Yorumlar:</strong> {givenReviews?.length || 0} adet</p>
          <p><strong>Bana Gelen Yorumlar:</strong> {receivedReviews?.length || 0} adet</p>
          <p><strong>Loading Durumu (Yaptığım):</strong> {isLoadingGiven ? '⏳ Yükleniyor' : '✅ Yüklendi'}</p>
          <p><strong>Loading Durumu (Gelen):</strong> {isLoadingReceived ? '⏳ Yükleniyor' : '✅ Yüklendi'}</p>
          <p><strong>Hata:</strong> {error || '✅ Hata Yok'}</p>
          <p><strong>Aktif Tab:</strong> {activeTab === 'given' ? 'Yaptığım Yorumlar' : 'Bana Gelen Yorumlar'}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yorumlarım & Puanlarım</h1>
            <p className="text-gray-600">Verdiğiniz ve aldığınız yorumları yönetin (Supabase Entegrasyonu)</p>
          </div>
          {activeTab === 'given' && (
            <button
              onClick={handleNewReviewModalOpen}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Yeni Yorum Yaz
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('given')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'given'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Yaptığım Yorumlar
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {givenReviews?.length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Bana Gelen Yorumlar
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {receivedReviews?.length || 0}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Yaptığım Yorum</p>
                <p className="text-2xl font-bold text-gray-900">{givenReviews?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Bana Gelen Yorum</p>
                <p className="text-2xl font-bold text-gray-900">{receivedReviews?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Yorum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Durum filtresi"
              aria-label="Durum filtresi"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Yayınlandı</option>
              <option value="hidden">Gizli</option>
              <option value="reported">Bildirildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {activeTab === 'given'
                        ? (review.reviewee_profile?.company_name || review.reviewee_profile?.full_name || 'Bilinmeyen Kullanıcı')
                        : (review.reviewer_profile?.company_name || review.reviewer_profile?.full_name || 'Bilinmeyen Kullanıcı')
                      }
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                      {activeTab === 'received' && (
                        <span className="ml-2 text-blue-600">• Bana yapılan yorum</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(review.status)}
                  {activeTab === 'given' && (
                    <>
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        disabled={isUpdating}
                        title="Yorumu düzenle"
                        aria-label="Yorumu düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(review)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isDeleting}
                        title="Yorumu sil"
                        aria-label="Yorumu sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <StarRating rating={review.rating} />
              </div>

              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              )}

              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {review.helpful_count || 0} yararlı
                  </span>
                  {review.verified_transaction && (
                    <span className="flex items-center text-green-600">
                      <Building className="h-4 w-4 mr-1" />
                      Doğrulanmış
                    </span>
                  )}
                </div>
                <span>
                  {review.review_type === 'buyer'
                    ? 'Alıcı → Taşıyıcı'
                    : review.review_type === 'carrier'
                      ? 'Taşıyıcı → Alıcı'
                      : 'Genel'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {activeTab === 'given'
                ? 'Henüz hiç yorum yapmamışsınız.'
                : 'Henüz size hiç yorum yapılmamış.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (Bu veriler Supabase veritabanından geliyor)
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal - sadece yaptığım yorumlarda görünür */}
      {editModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Yorumu Düzenle</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Modalı kapat"
                aria-label="Modalı kapat"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Firma/Kişi</p>
                <p className="font-medium">
                  {selectedReview.reviewee_profile?.company_name || selectedReview.reviewee_profile?.full_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yorum başlığı..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puan</label>
                <StarRating
                  rating={editFormData.rating}
                  editable
                  onChange={(rating) => setEditFormData(prev => ({ ...prev, rating }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yorum</label>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Yorumunuzu yazın..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-public"
                  checked={editFormData.is_public}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-public" className="ml-2 text-sm text-gray-700">
                  Yorumu herkese açık yap
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isUpdating}
              >
                İptal
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                disabled={isUpdating || !editFormData.comment.trim()}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Review Modal */}
      {newReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Yeni Yorum Yaz</h3>
              <button
                onClick={() => setNewReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Modalı kapat"
                aria-label="Modalı kapat"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorumlayacağınız Kullanıcı
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kullanıcı adı, email veya firma adı ile ara..."
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* Arama Sonuçları */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          {user.email && (
                            <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                          {user.company_name && (
                            <div className="text-sm text-blue-600">{user.company_name}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Seçilen Kullanıcı */}
                  {selectedUser && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">{selectedUser.full_name}</div>
                          {selectedUser.email && (
                            <div className="text-sm text-blue-600">{selectedUser.email}</div>
                          )}
                          {selectedUser.company_name && (
                            <div className="text-sm text-blue-500">{selectedUser.company_name}</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setUserSearchTerm('');
                            setNewReviewFormData(prev => ({ ...prev, reviewee_id: '', reviewee_name: '' }));
                          }}
                          className="text-blue-400 hover:text-blue-600"
                          title="Seçimi temizle"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newReviewFormData.title}
                  onChange={(e) => setNewReviewFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yorum başlığı..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puan</label>
                <StarRating
                  rating={newReviewFormData.rating}
                  editable
                  onChange={(rating) => setNewReviewFormData(prev => ({ ...prev, rating }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yorum</label>
                <textarea
                  value={newReviewFormData.comment}
                  onChange={(e) => setNewReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Yorumunuzu yazın..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yorum Türü</label>
                <select
                  value={newReviewFormData.review_type}
                  onChange={(e) => setNewReviewFormData(prev => ({ ...prev, review_type: e.target.value as 'buyer_to_carrier' | 'carrier_to_buyer' | 'general' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Yorum türü seçin"
                  aria-label="Yorum türü"
                >
                  <option value="general">Genel</option>
                  <option value="buyer_to_carrier">Alıcı → Taşıyıcı</option>
                  <option value="carrier_to_buyer">Taşıyıcı → Alıcı</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="new-public"
                  checked={newReviewFormData.is_public}
                  onChange={(e) => setNewReviewFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="new-public" className="ml-2 text-sm text-gray-700">
                  Yorumu herkese açık yap
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setNewReviewModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isCreating}
              >
                İptal
              </button>
              <button
                onClick={handleNewReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                disabled={isCreating || !selectedUser || !newReviewFormData.comment.trim()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Yorum Yaz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && reviewToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Yorumu Sil</h3>
              <p className="text-gray-600 mb-6">
                Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsSection;