import React, { useState } from 'react';
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
  X
} from 'lucide-react';

// myReviews değişkenini useState'ten önce tanımla
const myReviews = [
  {
    id: 1,
    companyId: 1,
    companyName: 'Aras Kargo',
    companyLogo: '🚚',
    rating: 5,
    comment: 'Çok hızlı ve güvenilir hizmet. Paketim zamanında geldi, hiçbir sorun yaşamadım. Kesinlikle tavsiye ederim.',
    date: '2025-01-12',
    status: 'published',
    statusLabel: 'Yayınlandı',
    helpful: 12,
    views: 156,
    isPublic: true,
    visibleOn: ['Reklamlar Sayfası', 'Firma Profili', 'Yorumlar Sayfası']
  },
  {
    id: 2,
    companyId: 2,
    companyName: 'MNG Kargo',
    companyLogo: '📦',
    rating: 4,
    comment: 'Genel olarak memnunum ama bazen teslimat saatleri değişebiliyor. Müşteri hizmetleri iyi.',
    date: '2025-01-08',
    status: 'published',
    statusLabel: 'Yayınlandı',
    helpful: 8,
    views: 89,
    isPublic: true,
    visibleOn: ['Reklamlar Sayfası', 'Yorumlar Sayfası']
  },
  {
    id: 3,
    companyId: 4,
    companyName: 'Güven Sigorta',
    companyLogo: '🛡️',
    rating: 5,
    comment: 'Hasar durumunda çok hızlı ödeme yaptılar. Profesyonel yaklaşım için teşekkürler.',
    date: '2024-12-20',
    status: 'pending',
    statusLabel: 'Moderasyonda',
    helpful: 0,
    views: 0,
    isPublic: true,
    visibleOn: []
  },
  {
    id: 4,
    companyId: 5,
    companyName: 'Lojistik Pro',
    companyLogo: '🏭',
    rating: 3,
    comment: 'Ortalama bir hizmet. Fiyat/performans dengesi makul ama daha iyisi olabilir.',
    date: '2024-12-15',
    status: 'draft',
    statusLabel: 'Taslak',
    helpful: 0,
    views: 0,
    isPublic: false,
    visibleOn: []
  }
];

const MyReviewsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [newReviewModalOpen, setNewReviewModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    rating: 5,
    comment: '',
    isPublic: true
  });
  const [newReviewFormData, setNewReviewFormData] = useState({
    companyId: null,
    companyName: '',
    companyLogo: '',
    rating: 5,
    comment: '',
    isPublic: true
  });
  const [myReviewsState, setMyReviewsState] = useState(myReviews);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<any>(null);

  // Kullanıcının işlem yaptığı firmalar (sadece bunlara yorum verebilir)
  const eligibleCompanies = [
    { id: 1, name: 'Aras Kargo', logo: '🚚', lastTransaction: '2025-01-10' },
    { id: 2, name: 'MNG Kargo', logo: '📦', lastTransaction: '2025-01-05' },
    { id: 3, name: 'Yurtiçi Kargo', logo: '🚛', lastTransaction: '2024-12-28' },
    { id: 4, name: 'Güven Sigorta', logo: '🛡️', lastTransaction: '2024-12-15' },
    { id: 5, name: 'Lojistik Pro', logo: '🏭', lastTransaction: '2024-12-10' }
  ];

  const getStatusBadge = (status: string, label: string) => {
    const statusClasses = {
      published: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {label}
      </span>
    );
  };

  const handleEdit = (review: any) => {
    setSelectedReview(review);
    setEditFormData({
      rating: review.rating,
      comment: review.comment,
      isPublic: review.isPublic
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    console.log('Yorum düzenleme kaydediliyor:', editFormData);
    setEditModalOpen(false);
    setSelectedReview(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNewReview = (company?: any) => {
    if (company) {
      setNewReviewFormData({
        companyId: company.id,
        companyName: company.name,
        companyLogo: company.logo,
        rating: 5,
        comment: '',
        isPublic: true
      });
      setNewReviewModalOpen(true);
    } else {
      setNewReviewModalOpen(true);
    }
  };

  const handleNewReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewReviewFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectCompanyForReview = (company: any) => {
    setNewReviewFormData({
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      rating: 5,
      comment: '',
      isPublic: true
    });
    setNewReviewModalOpen(true);
  };

  const handleSaveNewReview = () => {
    if (!newReviewFormData.companyId || !newReviewFormData.comment.trim()) return;
    const newReview = {
      id: myReviewsState.length + 1,
      companyId: newReviewFormData.companyId,
      companyName: newReviewFormData.companyName,
      companyLogo: newReviewFormData.companyLogo,
      rating: newReviewFormData.rating,
      comment: newReviewFormData.comment,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      statusLabel: 'Moderasyonda',
      helpful: 0,
      views: 0,
      isPublic: newReviewFormData.isPublic,
      visibleOn: []
    };
    setMyReviewsState(prev => [newReview, ...prev]);
    setNewReviewModalOpen(false);
  };

  const handleDeleteClick = (review: any) => {
    setReviewToDelete(review);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setMyReviewsState(prev => prev.filter(r => r.id !== reviewToDelete.id));
    setDeleteConfirmOpen(false);
    setReviewToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setReviewToDelete(null);
  };

  const renderEditModal = () => {
    if (!editModalOpen || !selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Yorumu Düzenle</h3>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedReview.companyLogo}</span>
              <span className="text-lg font-medium text-gray-700">{selectedReview.companyName}</span>
            </div>
          </div>

          <form className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                    title={`${star} yıldız ver`}
                    aria-label={`${star} yıldız ver`}
                  >
                    <Star 
                      size={32} 
                      className={`${star <= editFormData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} 
                    />
                    <span className="sr-only">{star} yıldız</span>
                  </button>
                ))}
                <span className="ml-3 text-lg font-medium text-gray-700">{editFormData.rating}/5</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                id="comment"
                name="comment"
                value={editFormData.comment}
                onChange={handleEditInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Deneyiminizi detaylı olarak paylaşın..."
              />
            </div>

            {/* Visibility */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={editFormData.isPublic}
                  onChange={handleEditInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Yorumum herkese açık olsun
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Herkese açık yorumlar reklamlar sayfasında ve firma profilinde görünür.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
              >
                <Save size={18} className="mr-2" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderNewReviewModal = () => {
    if (!newReviewModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setNewReviewModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Yeni Yorum Ekle</h3>
            <p className="text-gray-600">Sadece işlem yaptığınız firmalar hakkında yorum yapabilirsiniz.</p>
          </div>
          {!newReviewFormData.companyId ? (
            <div className="space-y-6">
              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Firma Seçin
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {eligibleCompanies.map((company) => (
                    <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{company.logo}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-500">Son işlem: {company.lastTransaction}</p>
                          </div>
                        </div>
                        <button 
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                          title={`'${company.name}' için yorum yap`}
                          aria-label={`'${company.name}' için yorum yap`}
                          onClick={() => handleSelectCompanyForReview(company)}
                        >
                          Yorum Yap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6">
              {/* Firma Bilgisi */}
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{newReviewFormData.companyLogo}</span>
                <span className="text-lg font-medium text-gray-700">{newReviewFormData.companyName}</span>
              </div>
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puanınız
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                      title={`${star} yıldız ver`}
                      aria-label={`${star} yıldız ver`}
                    >
                      <Star 
                        size={32} 
                        className={`${star <= newReviewFormData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} 
                      />
                      <span className="sr-only">{star} yıldız</span>
                    </button>
                  ))}
                  <span className="ml-3 text-lg font-medium text-gray-700">{newReviewFormData.rating}/5</span>
                </div>
              </div>
              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Yorumunuz
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={newReviewFormData.comment}
                  onChange={handleNewReviewInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Deneyiminizi detaylı olarak paylaşın..."
                />
              </div>
              {/* Visibility */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={newReviewFormData.isPublic}
                    onChange={handleNewReviewInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Yorumum herkese açık olsun
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Herkese açık yorumlar reklamlar sayfasında ve firma profilinde görünür.
                </p>
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setNewReviewModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewReview}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                  disabled={!newReviewFormData.comment.trim()}
                >
                  <Save size={18} className="mr-2" />
                  Kaydet
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const filteredReviews = myReviewsState.filter((review: any) => {
    const matchesSearch = review.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Yorumlarım & Puanlarım</h2>
          <button 
            onClick={handleNewReview}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            title="Yeni Yorum Ekle"
            aria-label="Yeni Yorum Ekle"
          >
            <Plus size={20} className="mr-2" />
            <span>Yeni Yorum Ekle</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Yorum</p>
                <p className="text-2xl font-bold text-blue-600">{myReviews.length}</p>
              </div>
              <MessageCircle className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yayınlanan</p>
                <p className="text-2xl font-bold text-green-600">{myReviews.filter(r => r.status === 'published').length}</p>
              </div>
              <Eye className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)}
                </p>
              </div>
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Beğeni</p>
                <p className="text-2xl font-bold text-purple-600">{myReviews.reduce((sum, r) => sum + r.helpful, 0)}</p>
              </div>
              <ThumbsUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Yorum ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Yorum ara"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Durum Filtrele"
          >
            <option value="">Tüm Durumlar</option>
            <option value="published">Yayınlanan</option>
            <option value="pending">Moderasyonda</option>
            <option value="draft">Taslak</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{review.companyLogo}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{review.companyName}</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(review.status, review.statusLabel)}
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                      title="Düzenle"
                      aria-label="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(review)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      title="Sil"
                      aria-label="Sil"
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Sil</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye size={14} className="mr-1" />
                    <span>{review.views} görüntülenme</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp size={14} className="mr-1" />
                    <span>{review.helpful} beğeni</span>
                  </div>
                  <div className="flex items-center">
                    <Building size={14} className="mr-1" />
                    <span>{review.isPublic ? 'Herkese açık' : 'Özel'}</span>
                  </div>
                </div>
                
                {review.visibleOn.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Görünür:</span> {review.visibleOn.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yorum yapmamışsınız</h3>
            <p className="text-gray-600 mb-6">İşlem yaptığınız firmalar hakkında yorum yaparak diğer kullanıcılara yardımcı olun.</p>
            <button 
              onClick={handleNewReview}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              İlk Yorumunuzu Yapın
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {renderEditModal()}
      {renderNewReviewModal()}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Yorumu Sil</h3>
            <p className="mb-6 text-gray-700">Bu yorumu silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsSection;