// ====================================
// REVIEW SERVICE - Supabase Integration
// ====================================

import { supabase } from '../lib/supabase'

// Review türü - gerçek tablo şemasına uygun
export interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string  // Gerçek tabloda reviewee_id
  listing_id?: string | null
  transport_service_id?: string | null  // transaction_id yerine transport_service_id
  rating: number
  comment?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  title?: string | null
  review_type: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general'
  service_quality?: number | null
  communication?: number | null
  timeliness?: number | null
  status: 'active' | 'hidden' | 'reported'
  helpful_count: number
  verified_transaction: boolean
  response?: string | null
  response_date?: string | null
  metadata: Record<string, unknown>
}

// Review ekleme türü
export interface ReviewInsert {
  reviewer_id: string
  reviewee_id: string
  listing_id?: string | null
  transport_service_id?: string | null  // transaction_id yerine transport_service_id
  rating: number
  comment?: string | null
  is_public?: boolean
  title?: string | null
  review_type?: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general'
  service_quality?: number | null
  communication?: number | null
  timeliness?: number | null
  status?: 'active' | 'hidden' | 'reported'
  metadata?: Record<string, unknown>
}

// Review güncelleme türü
export interface ReviewUpdate {
  rating?: number
  comment?: string | null
  is_public?: boolean
  title?: string | null
  service_quality?: number | null
  communication?: number | null
  timeliness?: number | null
  status?: 'active' | 'hidden' | 'reported'
  response?: string | null
  metadata?: Record<string, unknown>
}

// Profillerle birleştirilmiş review türü
export interface ReviewWithProfile {
  id: string
  reviewer_id: string
  reviewee_id: string
  listing_id?: string | null
  transport_service_id?: string | null  // transaction_id yerine transport_service_id
  rating: number
  comment?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  title?: string | null
  review_type: 'buyer' | 'carrier' | 'general' // Simplified types based on recent review structure
  service_quality?: number | null
  communication?: number | null
  timeliness?: number | null
  status: 'active' | 'hidden' | 'reported'
  helpful_count: number
  verified_transaction: boolean
  response?: string | null
  response_date?: string | null
  metadata: Record<string, unknown>
  reviewer_profile?: {
    id: string
    full_name: string
    avatar_url?: string | null
    company_name?: string | null
  }
  reviewee_profile?: {
    id: string
    full_name: string
    avatar_url?: string | null
    company_name?: string | null
  }
}

class ReviewService {

  // Herkese açık tüm yorumları getir (Vitrin sayfası için)
  async getAllPublicReviews(): Promise<{ data: ReviewWithProfile[] | null; error: unknown }> {
    try {
      // Herkese açık ve aktif olan tüm yorumları çek
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all public reviews:', error);
        return { data: null, error };
      }

      if (!reviews || reviews.length === 0) {
        return { data: [], error: null };
      }

      // Yorum yapanların ve yorum alanların ID'lerini topla
      const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];
      const revieweeIds = [...new Set(reviews.map(r => r.reviewee_id))];
      const allProfileIds = [...new Set([...reviewerIds, ...revieweeIds])];

      // Tüm ilgili profilleri tek seferde çek
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, avatar_url')
        .in('id', allProfileIds);

      if (profileError) {
        console.error('Error fetching profiles for reviews:', profileError);
        // Profilsiz de devam edebiliriz ama loglamak önemli
        return { data: reviews.map(r => ({...r})), error: null };
      }

      // Yorumları profil bilgileriyle birleştir
      const reviewsWithProfiles = reviews.map(review => ({
        ...review,
        reviewer_profile: profiles?.find(p => p.id === review.reviewer_id) || null,
        reviewee_profile: profiles?.find(p => p.id === review.reviewee_id) || null,
      }));

      return { data: reviewsWithProfiles, error: null };
    } catch (error) {
      console.error('An unexpected error occurred in getAllPublicReviews:', error);
      return { data: null, error };
    }
  }


  // Kullanıcının yaptığı yorumları getir
  async getGivenReviews(userId: string): Promise<{ data: ReviewWithProfile[] | null; error: unknown }> {
    try {
      // Reviews'ları al
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (error) {
        return { data: null, error };
      }
      
      // Eğer review'lar varsa, profile'ları manuel olarak al
      if (data && data.length > 0) {
        const revieweeIds = [...new Set(data.map(r => r.reviewee_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, company_name')
          .in('id', revieweeIds);
          
        // Reviews ile profiles'ı birleştir
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          reviewee_profile: profiles?.find(p => p.id === review.reviewee_id) || null
        }));
        
        return { data: reviewsWithProfiles, error: null };
      }

      return { data, error };
    } catch (error) {
      console.error('Error fetching given reviews:', error);
      return { data: null, error };
    }
  }

  // Kullanıcıya gelen yorumları getir
  async getReceivedReviews(userId: string): Promise<{ data: ReviewWithProfile[] | null; error: unknown }> {
    try {
      // Reviews'ları al
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
        
      if (error) {
        return { data: null, error };
      }
      
      // Eğer review'lar varsa, profile'ları manuel olarak al
      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, company_name')
          .in('id', reviewerIds);
          
        // Reviews ile profiles'ı birleştir
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          reviewer_profile: profiles?.find(p => p.id === review.reviewer_id) || null
        }));
        
        return { data: reviewsWithProfiles, error: null };
      }

      return { data, error };
    } catch (error) {
      console.error('Error fetching received reviews:', error);
      return { data: null, error };
    }
  }

  // Belirli bir kullanıcıya gelen son yorumları getir (reklam kartları için)
  async getUserLatestReviews(userId: string, limit: number = 3): Promise<{ data: ReviewWithProfile[] | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (
            id,
            full_name,
            avatar_url,
            company_name
          )
        `)
        .eq('reviewee_id', userId)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      console.error('Error fetching user latest reviews:', error)
      return { data: null, error }
    }
  }

  // Yeni yorum ekle
  async createReview(review: ReviewInsert): Promise<{ data: Review | null; error: unknown }> {
    try {
      // Validasyon: Kullanıcı kendine yorum yapamaz
      if (review.reviewer_id === review.reviewee_id) {
        const errorMessage = 'Kendinize yorum yapamazsınız.';
        console.warn(errorMessage);
        return { data: null, error: errorMessage };
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...review,
          is_public: review.is_public ?? true,
          review_type: review.review_type ?? 'general',
          status: review.status ?? 'active',
          metadata: review.metadata ?? {}
        }])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating review:', error)
      return { data: null, error }
    }
  }

  // Yorum güncelle
  async updateReview(reviewId: string, update: ReviewUpdate): Promise<{ data: Review | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...update,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating review:', error)
      return { data: null, error }
    }
  }

  // Yorum sil
  async deleteReview(reviewId: string): Promise<{ error: unknown }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      return { error }
    } catch (error) {
      console.error('Error deleting review:', error)
      return { error }
    }
  }

  // Kullanıcının ortalama puanını getir
  async getUserAverageRating(userId: string): Promise<{ data: { avg_rating: number; total_reviews: number } | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avg_rating, rating_count')
        .eq('id', userId)
        .single()

      if (data) {
        return {
          data: {
            avg_rating: data.avg_rating || 0,
            total_reviews: data.rating_count || 0
          },
          error
        }
      }

      return { data: null, error }
    } catch (error) {
      console.error('Error fetching user average rating:', error)
      return { data: null, error }
    }
  }

  // Yorum yararlı olarak işaretle (helpful_count artır)
  async markHelpful(reviewId: string): Promise<{ data: Review | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .rpc('increment_helpful_count', { review_id: reviewId })

      return { data, error }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
      return { data: null, error }
    }
  }

  // Kullanıcıların yorumlayabileceği kişileri getir (transaction_id üzerinden)
  async getEligibleUsersForReview(): Promise<{ data: unknown[] | null; error: unknown }> {
    try {
      // Bu fonksiyon, transactions tablosu kullanılarak implementiert edilebilir
      // Şimdilik boş döndürüyoruz
      return { data: [], error: null }
    } catch (error) {
      console.error('Error fetching eligible users for review:', error)
      return { data: null, error }
    }
  }

  // Kullanıcı arama fonksiyonu
  async searchUsers(searchTerm: string): Promise<{ data: { id: string; full_name: string; email?: string; company_name?: string }[] | null; error: unknown }> {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
        .limit(10)

      return { data, error }
    } catch (error) {
      console.error('Error searching users:', error)
      return { data: null, error }
    }
  }
}

export const reviewService = new ReviewService()
