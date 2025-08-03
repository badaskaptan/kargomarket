import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Reply, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Loader,
  MessageCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { reviewService, ReviewService, type ReviewWithProfile } from '../../services/reviewService';
import { useAuth } from '../../context/SupabaseAuthContext';

interface ResponseState {
  text: string;
  isEditing: boolean;
  isSubmitting: boolean;
}

const MyReviewsManagement: React.FC = () => {
  const { user } = useAuth();
  const [myReviews, setMyReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseStates, setResponseStates] = useState<Record<string, ResponseState>>({});

  // Response state yönetimi
  const initResponseState = (reviewId: string, initialText: string = '') => {
    setResponseStates(prev => ({
      ...prev,
      [reviewId]: { text: initialText, isEditing: false, isSubmitting: false }
    }));
  };

  const updateResponseState = (reviewId: string, updates: Partial<ResponseState>) => {
    setResponseStates(prev => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], ...updates }
    }));
  };

  // Bana yapılan yorumları getir
  useEffect(() => {
    const fetchMyReviews = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await reviewService.getAllPublicReviews();
        
        if (error) {
          setError('Yorumlar yüklenirken hata oluştu.');
          return;
        }

        // Sadece bana yapılan yorumları filtrele
        const reviewsAboutMe = data?.filter((review: ReviewWithProfile) => review.reviewee_id === user.id) || [];
        setMyReviews(reviewsAboutMe);

        // Her review için response state'i initialize et
        reviewsAboutMe.forEach((review: ReviewWithProfile) => {
          initResponseState(review.id, review.response || '');
        });

      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Yorumlar yüklenirken beklenmeyen hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [user]);

  // Response handler fonksiyonları
  const handleAddResponse = async (reviewId: string) => {
    const responseText = responseStates[reviewId]?.text?.trim();
    if (!responseText) return;

    updateResponseState(reviewId, { isSubmitting: true });

    try {
      const { error } = await ReviewService.addResponseToReview(reviewId, responseText);
      
      if (error) {
        alert(`Hata: ${error}`);
        return;
      }

      // Review'ı güncelle
      setMyReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: responseText, response_date: new Date().toISOString() }
          : review
      ));

      updateResponseState(reviewId, { isEditing: false, isSubmitting: false });
      alert('Yanıt başarıyla eklendi!');
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Yanıt eklenirken beklenmeyen hata oluştu.');
    } finally {
      updateResponseState(reviewId, { isSubmitting: false });
    }
  };

  const handleUpdateResponse = async (reviewId: string) => {
    const responseText = responseStates[reviewId]?.text?.trim();
    if (!responseText) return;

    updateResponseState(reviewId, { isSubmitting: true });

    try {
      const { error } = await ReviewService.updateResponse(reviewId, responseText);
      
      if (error) {
        alert(`Hata: ${error}`);
        return;
      }

      setMyReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: responseText, response_date: new Date().toISOString() }
          : review
      ));

      updateResponseState(reviewId, { isEditing: false, isSubmitting: false });
      alert('Yanıt başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating response:', error);
      alert('Yanıt güncellenirken beklenmeyen hata oluştu.');
    } finally {
      updateResponseState(reviewId, { isSubmitting: false });
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm('Bu yanıtı silmek istediğinizden emin misiniz?')) return;

    updateResponseState(reviewId, { isSubmitting: true });

    try {
      const { error } = await ReviewService.deleteResponse(reviewId);
      
      if (error) {
        alert(`Hata: ${error}`);
        return;
      }

      setMyReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: null, response_date: null }
          : review
      ));

      updateResponseState(reviewId, { text: '', isEditing: false, isSubmitting: false });
      alert('Yanıt başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Yanıt silinirken beklenmeyen hata oluştu.');
    } finally {
      updateResponseState(reviewId, { isSubmitting: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Yorumlar yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="mr-2" size={24} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yorum Yönetimi</h2>
          <p className="text-gray-600 mt-1">Size yapılan yorumları yönetin ve yanıtlayın</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <MessageCircle size={16} className="mr-1" />
            <span>{myReviews.length} yorum</span>
          </div>
          <div className="flex items-center">
            <Reply size={16} className="mr-1" />
            <span>{myReviews.filter(r => r.response).length} yanıt</span>
          </div>
        </div>
      </div>

      {myReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yorum yapılmamış</h3>
          <p className="text-gray-500">Size yapılan yorumlar burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.reviewer_profile?.full_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.reviewer_profile?.full_name || 'Anonim Kullanıcı'}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <Calendar size={14} />
                      <span>{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{review.rating.toFixed(1)}</span>
                  <div className="text-xs text-gray-500">/ 5.0</div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                {review.title && (
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                )}
                <p className="text-gray-700">{review.comment}</p>
              </div>

              {/* Response Section */}
              <div className="border-t pt-4">
                {review.response && !responseStates[review.id]?.isEditing ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-blue-700">
                        <Reply size={16} className="mr-2" />
                        <span className="font-medium">Yanıtınız</span>
                        {review.response_date && (
                          <span className="ml-2 text-sm text-blue-600">
                            {new Date(review.response_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            updateResponseState(review.id, { isEditing: true });
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Yanıtı düzenle"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(review.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          disabled={responseStates[review.id]?.isSubmitting}
                          title="Yanıtı sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.response}</p>
                  </div>
                ) : responseStates[review.id]?.isEditing ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-blue-700">
                        <Reply size={16} className="mr-2" />
                        <span className="font-medium">
                          {review.response ? 'Yanıtı Düzenle' : 'Yanıt Ekle'}
                        </span>
                      </div>
                      <button
                        onClick={() => updateResponseState(review.id, { isEditing: false })}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Düzenlemeyi iptal et"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <textarea
                      value={responseStates[review.id]?.text || ''}
                      onChange={(e) => updateResponseState(review.id, { text: e.target.value })}
                      placeholder="Müşterinizin yorumuna yanıt verin..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      disabled={responseStates[review.id]?.isSubmitting}
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => updateResponseState(review.id, { isEditing: false })}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        disabled={responseStates[review.id]?.isSubmitting}
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => review.response ? handleUpdateResponse(review.id) : handleAddResponse(review.id)}
                        disabled={
                          !responseStates[review.id]?.text?.trim() || 
                          responseStates[review.id]?.isSubmitting
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {responseStates[review.id]?.isSubmitting ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            {review.response ? 'Güncelle' : 'Yanıtla'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        updateResponseState(review.id, { isEditing: true });
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Reply size={16} className="mr-2" />
                      Bu yoruma yanıt ver
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsManagement;
