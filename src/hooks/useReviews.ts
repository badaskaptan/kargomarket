// ====================================
// REVIEW HOOK - Supabase ile Reviews Yönetimi
// ====================================

import { useState, useEffect, useCallback } from 'react'
import { reviewService, type ReviewWithProfile, type ReviewInsert, type ReviewUpdate } from '../services/reviewService'
import { useAuth } from '../context/SupabaseAuthContext'

interface UseReviewsReturn {
  // Data
  givenReviews: ReviewWithProfile[] | null
  receivedReviews: ReviewWithProfile[] | null
  averageRating: number
  totalReviews: number
  
  // Loading states
  isLoadingGiven: boolean
  isLoadingReceived: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Actions
  createReview: (review: ReviewInsert) => Promise<{ success: boolean; error?: string }>
  updateReview: (reviewId: string, update: ReviewUpdate) => Promise<{ success: boolean; error?: string }>
  deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>
  markHelpful: (reviewId: string) => Promise<{ success: boolean; error?: string }>
  refreshReviews: () => Promise<void>
  
  // Errors
  error: string | null
}

export const useReviews = (): UseReviewsReturn => {
  const { user } = useAuth()
  
  // State
  const [givenReviews, setGivenReviews] = useState<ReviewWithProfile[] | null>(null)
  const [receivedReviews, setReceivedReviews] = useState<ReviewWithProfile[] | null>(null)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  
  // Loading states
  const [isLoadingGiven, setIsLoadingGiven] = useState(false)
  const [isLoadingReceived, setIsLoadingReceived] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Kullanıcının yaptığı yorumları getir
  const loadGivenReviews = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingGiven(true)
    setError(null)
    
    try {
      const { data, error } = await reviewService.getGivenReviews(user.id)
      
      if (error) {
        setError('Yaptığınız yorumlar yüklenemedi')
        console.error('Error loading given reviews:', error)
      } else {
        setGivenReviews(data)
      }
    } catch (err) {
      setError('Yaptığınız yorumlar yüklenemedi')
      console.error('Error loading given reviews:', err)
    } finally {
      setIsLoadingGiven(false)
    }
  }, [user?.id])

  // Kullanıcıya gelen yorumları getir
  const loadReceivedReviews = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingReceived(true)
    setError(null)
    
    try {
      const { data, error } = await reviewService.getReceivedReviews(user.id)
      
      if (error) {
        setError('Size gelen yorumlar yüklenemedi')
        console.error('Error loading received reviews:', error)
      } else {
        setReceivedReviews(data)
      }
    } catch (err) {
      setError('Size gelen yorumlar yüklenemedi')
      console.error('Error loading received reviews:', err)
    } finally {
      setIsLoadingReceived(false)
    }
  }, [user?.id])

  // Kullanıcının ortalama puanını getir
  const loadAverageRating = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await reviewService.getUserAverageRating(user.id)
      
      if (error) {
        console.error('Error loading average rating:', error)
      } else if (data) {
        setAverageRating(data.avg_rating)
        setTotalReviews(data.total_reviews)
      }
    } catch (err) {
      console.error('Error loading average rating:', err)
    }
  }, [user?.id])

  // Yeni yorum oluştur
  const createReview = async (review: ReviewInsert): Promise<{ success: boolean; error?: string }> => {
    setIsCreating(true)
    setError(null)
    
    try {
      const { data, error } = await reviewService.createReview(review)
      
      if (error) {
        const errorMessage = 'Yorum oluşturulamadı'
        setError(errorMessage)
        console.error('Error creating review:', error)
        return { success: false, error: errorMessage }
      }
      
      if (data) {
        // Başarılı oluşturma sonrası listeleri yenile
        await refreshReviews()
        return { success: true }
      }
      
      return { success: false, error: 'Bilinmeyen hata' }
    } catch (err) {
      const errorMessage = 'Yorum oluşturulamadı'
      setError(errorMessage)
      console.error('Error creating review:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsCreating(false)
    }
  }

  // Yorumu güncelle
  const updateReview = async (reviewId: string, update: ReviewUpdate): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const { data, error } = await reviewService.updateReview(reviewId, update)
      
      if (error) {
        const errorMessage = 'Yorum güncellenemedi'
        setError(errorMessage)
        console.error('Error updating review:', error)
        return { success: false, error: errorMessage }
      }
      
      if (data) {
        // Başarılı güncelleme sonrası listeleri yenile
        await refreshReviews()
        return { success: true }
      }
      
      return { success: false, error: 'Bilinmeyen hata' }
    } catch (err) {
      const errorMessage = 'Yorum güncellenemedi'
      setError(errorMessage)
      console.error('Error updating review:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  // Yorumu sil
  const deleteReview = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
    setIsDeleting(true)
    setError(null)
    
    try {
      const { error } = await reviewService.deleteReview(reviewId)
      
      if (error) {
        const errorMessage = 'Yorum silinemedi'
        setError(errorMessage)
        console.error('Error deleting review:', error)
        return { success: false, error: errorMessage }
      }
      
      // Başarılı silme sonrası listeleri yenile
      await refreshReviews()
      return { success: true }
    } catch (err) {
      const errorMessage = 'Yorum silinemedi'
      setError(errorMessage)
      console.error('Error deleting review:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }

  // Yararlı olarak işaretle
  const markHelpful = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await reviewService.markHelpful(reviewId)
      
      if (error) {
        const errorMessage = 'İşaretlenemedi'
        console.error('Error marking review as helpful:', error)
        return { success: false, error: errorMessage }
      }
      
      if (data) {
        // Başarılı işaretleme sonrası listeleri yenile
        await refreshReviews()
        return { success: true }
      }
      
      return { success: false, error: 'Bilinmeyen hata' }
    } catch (err) {
      const errorMessage = 'İşaretlenemedi'
      console.error('Error marking review as helpful:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Tüm verileri yenile
  const refreshReviews = useCallback(async () => {
    await Promise.all([
      loadGivenReviews(),
      loadReceivedReviews(),
      loadAverageRating()
    ])
  }, [loadGivenReviews, loadReceivedReviews, loadAverageRating])

  // Component mount edildiğinde ve user değiştiğinde verileri yükle
  useEffect(() => {
    if (user?.id) {
      refreshReviews()
    } else {
      // User yoksa state'i temizle
      setGivenReviews(null)
      setReceivedReviews(null)
      setAverageRating(0)
      setTotalReviews(0)
      setError(null)
    }
  }, [user?.id, refreshReviews])

  return {
    // Data
    givenReviews,
    receivedReviews,
    averageRating,
    totalReviews,
    
    // Loading states
    isLoadingGiven,
    isLoadingReceived,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Actions
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    refreshReviews,
    
    // Error
    error
  }
}
