import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  MessageCircle,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  Loader,
  Reply,
  Edit3,
  Save,
  X,
  Trash2
} from 'lucide-react';
import { reviewService, ReviewService, type ReviewWithProfile } from '../../services/reviewService';
import { useAuth } from '../../context/SupabaseAuthContext';

const ReviewsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const revieweeIdFilter = searchParams.get('revieweeId');
  console.log('ReviewsPage: Debug 1 - revieweeIdFilter from URL:', revieweeIdFilter);

  const { user } = useAuth();
  const [allReviews, setAllReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  // Response yönetimi için state'ler
  const [responseStates, setResponseStates] = useState<{
    [reviewId: string]: {
      isEditing: boolean;
      text: string;
      isSubmitting: boolean;
    }
  }>({});

  const initResponseState = (reviewId: string, existingResponse?: string) => {
    if (!responseStates[reviewId]) {
      setResponseStates(prev => ({
        ...prev,
        [reviewId]: {
          isEditing: false,
          text: existingResponse || '',
          isSubmitting: false
        }
      }));
    }
  };

  const updateResponseState = (reviewId: string, updates: Partial<typeof responseStates[string]>) => {
    setResponseStates(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        ...updates
      }
    }));
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await reviewService.getAllPublicReviews();
        if (fetchError) {
          throw new Error(`Yorumlar yüklenirken bir hata oluştu: ${fetchError}`);
        }
        setAllReviews(data || []);
        console.log('ReviewsPage: Debug 2 - Fetched all public reviews (raw data):', data);
      } catch (err: any) {
        setError(err.message || 'Bilinmeyen bir hata oluştu.');
        console.error('ReviewsPage: Debug - Error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Response handling functions
  const handleAddResponse = async (reviewId: string) => {
    const responseText = responseStates[reviewId]?.text?.trim();
    if (!responseText) return;

    updateResponseState(reviewId, { isSubmitting: true });

    try {
      const { error } = await ReviewService.addResponseToReview(reviewId, responseText);

      if (error) {
        console.error('Response add error:', error);
        alert(`Hata: ${error}`);
        return;
      }

      // Update the review in the list
      setAllReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, response: responseText, response_date: new Date().toISOString() }
          : review
      ));

      updateResponseState(reviewId, { isEditing: false, isSubmitting: false });
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Cevap eklenirken beklenmeyen bir hata oluştu. Konsolu kontrol edin.');
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
        alert(error);
        return;
      }

      // Update the review in the list
      setAllReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, response: responseText, response_date: new Date().toISOString() }
          : review
      ));

      updateResponseState(reviewId, { isEditing: false, isSubmitting: false });
    } catch (error) {
      console.error('Error updating response:', error);
      alert('Cevap güncellenirken bir hata oluştu.');
    } finally {
      updateResponseState(reviewId, { isSubmitting: false });
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm('Bu cevabı silmek istediğinizden emin misiniz?')) return;

    updateResponseState(reviewId, { isSubmitting: true });

    try {
      const { error } = await ReviewService.deleteResponse(reviewId);

      if (error) {
        alert(error);
        return;
      }

      // Update the review in the list
      setAllReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, response: null, response_date: null }
          : review
      ));

      updateResponseState(reviewId, { text: '', isEditing: false, isSubmitting: false });
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Cevap silinirken bir hata oluştu.');
    } finally {
      updateResponseState(reviewId, { isSubmitting: false });
    }
  };

  const canResponseToReview = (review: ReviewWithProfile): boolean => {
    return user?.id === review.reviewee_id;
  };

  const companiesData = useMemo(() => {
    console.log('ReviewsPage: Debug 3 - Recalculating companiesData. allReviews length:', allReviews.length);
    if (!allReviews || allReviews.length === 0) {
      console.log('ReviewsPage: Debug 4 - allReviews is empty or null, returning empty companiesData.');
      return [];
    }

    const groupedReviews = allReviews.reduce((acc, review) => {
      const revieweeId = review.reviewee_id;

      // Add a check for valid reviewee_profile for grouping
      if (!review.reviewee_profile || (!review.reviewee_profile.company_name && !review.reviewee_profile.full_name)) {
        console.warn('ReviewsPage: Debug 5 - Skipping review due to missing or invalid reviewee_profile:', review);
        return acc;
      }

      if (!acc[revieweeId]) {
        acc[revieweeId] = {
          id: revieweeId,
          name: review.reviewee_profile?.company_name || review.reviewee_profile?.full_name || 'Bilinmiyor',
          logo: review.reviewee_profile?.avatar_url || '🏢',
          rating: 0,
          reviewCount: 0,
          reviews: [] as ReviewWithProfile[]
        };
      }
      acc[revieweeId].reviews.push(review);
      return acc;
    }, {} as Record<string, {
      id: string;
      name: string;
      logo: string;
      rating: number;
      reviewCount: number;
      reviews: ReviewWithProfile[];
    }>);

    let companiesArray = Object.values(groupedReviews).map(company => {
      const totalRating = company.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
      return {
        ...company,
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: company.reviews.length,
        reviews: company.reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      };
    });

    console.log('ReviewsPage: Debug 6 - Companies data before revieweeId filter:', companiesArray);

    // Filter by revieweeId from URL if it exists
    if (revieweeIdFilter) {
      companiesArray = companiesArray.filter(company => {
        console.log(`ReviewsPage: Debug 7 - Comparing filter: '${revieweeIdFilter}' with company ID: '${company.id}'`); // Critical Debug
        return company.id === revieweeIdFilter;
      });
      console.log('ReviewsPage: Debug 8 - Companies data after revieweeId filter:', companiesArray);
    }

    return companiesArray;
  }, [allReviews, revieweeIdFilter]);

  const filteredCompanies = useMemo(() => {
    return companiesData.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.reviews.some(review => review.comment?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [companiesData, searchTerm]);

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredCompanies, sortBy]);

  const totalCompanies = companiesData.length;
  const totalReviewCount = companiesData.reduce((sum, company) => sum + company.reviewCount, 0);
  const overallAverageRating = totalCompanies > 0
    ? (companiesData.reduce((sum, company) => sum + company.rating * company.reviewCount, 0) / totalReviewCount).toFixed(1)
    : '0.0';
  const highestRating = Math.max(...companiesData.map(c => c.rating), 0);

  const stats = [
    { label: 'Toplam Firma', value: totalCompanies.toString(), icon: Users, color: 'blue' },
    { label: 'Toplam Yorum', value: totalReviewCount.toLocaleString(), icon: MessageCircle, color: 'green' },
    { label: 'Ortalama Puan', value: overallAverageRating, icon: Star, color: 'yellow' },
    { label: 'En Yüksek Puan', value: highestRating.toString(), icon: Award, color: 'purple' }
  ];

  const getColorClasses = (color: string) => ({
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  }[color] || 'bg-gray-100 text-gray-600');

  const getReviewTypeColor = (review: ReviewWithProfile) => {
    if (review.rating >= 4) return 'border-l-green-500 bg-green-50';
    if (review.rating >= 3) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-red-500 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Yorumlar</span> ve Değerlendirmeler
          </h1>
          {revieweeIdFilter && companiesData.length > 0 ? (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Şu an <span className="font-bold text-gray-800">{companiesData[0].name}</span> firmasına ait yorumları görüntülüyorsunuz.
            </p>
          ) : (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Kullanıcı deneyimlerini keşfedin, güvenilir firmalar hakkında gerçek yorumları okuyun.
            </p>
          )}
        </div>

        {/* Stats and filters are hidden when viewing a specific company's reviews */}
        {!revieweeIdFilter && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Firma veya yorum içeriği ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  aria-label="Sırala"
                  title="Sırala"
                >
                  <option value="rating">Puana Göre</option>
                  <option value="reviews">Yorum Sayısına Göre</option>
                  <option value="name">İsme Göre</option>
                </select>
              </div>
            </div>
          </>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={48} className="animate-spin text-primary-500" />
            <p className="ml-4 text-gray-700">Yorumlar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl h-64 flex items-center justify-center">
            Hata: {error}
          </div>
        ) : sortedCompanies.length === 0 ? (
          <div className="text-center text-gray-600 text-xl h-64 flex items-center justify-center">
            {revieweeIdFilter ? 'Bu firmaya ait hiç yorum bulunamadı.' : 'Henüz gösterilecek herkese açık yorum bulunmuyor.'}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg text-white text-2xl">
                        {company.logo.startsWith('http') ? <img src={company.logo} alt={company.name} className="w-full h-full rounded-full object-cover" /> : company.logo}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{company.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} className={`${i < Math.floor(company.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{company.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-gray-600">{company.reviewCount} yorum</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Yorumlar ({company.reviews.length})</h4>
                    {company.reviews.length > 2 && !revieweeIdFilter && (
                      <button
                        onClick={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                      >
                        {expandedCompanyId === company.id ? 'Daha Az Göster' : `Tümünü Gör (${company.reviews.length})`}
                        {expandedCompanyId === company.id ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {company.reviews.slice(0, revieweeIdFilter ? company.reviews.length : (expandedCompanyId === company.id ? company.reviews.length : 2)).map((review) => (
                      <div key={review.id} className={`border-l-4 p-4 rounded-lg ${getReviewTypeColor(review)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{review.reviewer_profile?.full_name || review.reviewer_profile?.company_name || 'Anonim'}</span>
                            {review.verified_transaction && (
                              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                ✓ Doğrulanmış
                              </span>
                            )}
                            <div className="flex items-center ml-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        {/* Response Section */}
                        {(review.response || canResponseToReview(review)) && (
                          <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-200">
                            {review.response && !responseStates[review.id]?.isEditing ? (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center text-blue-700">
                                    <Reply size={16} className="mr-2" />
                                    <span className="font-medium">İşletme Yanıtı</span>
                                    {review.response_date && (
                                      <span className="ml-2 text-sm text-blue-600">
                                        {new Date(review.response_date).toLocaleDateString('tr-TR')}
                                      </span>
                                    )}
                                  </div>
                                  {canResponseToReview(review) && (
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          initResponseState(review.id, review.response || '');
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
                                  )}
                                </div>
                                <p className="text-gray-700">{review.response}</p>
                              </div>
                            ) : canResponseToReview(review) && responseStates[review.id]?.isEditing ? (
                              <div>
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
                            ) : canResponseToReview(review) && !review.response && (
                              <div>
                                <button
                                  onClick={() => {
                                    initResponseState(review.id, '');
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Deneyiminizi Paylaşın!</h2>
          <p className="text-xl mb-8 text-primary-100">
            Çalıştığınız firmalar hakkında yorum yaparak diğer kullanıcılara yardımcı olun.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg">
            Yorum Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;