import { useState, useEffect, useCallback } from 'react';
import { OfferService } from '../services/offerService';
import { ServiceOfferService } from '../services/serviceOfferService';
import type { ExtendedOffer } from '../types/database-types';
import type { ExtendedServiceOffer } from '../types/service-offer-types';

// Tarih karşılaştırması için basit bir utility fonksiyonu (Eğer src/utils/dateUtils.ts yoksa)
const isWithinLastHours = (dateString: string, hours: number): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours <= hours;
  } catch (e) {
    console.error("Invalid date string in isWithinLastHours:", dateString, e);
    return false; // Hatalı tarih formatında false döndür
  }
};

interface UserOfferStats {
  totalReceivedOffers: number;
  pendingOffers: number;
  acceptedOffers: number; // Devam Eden İşlemler
  completedOffers: number; // Tamamlanan İşlemler (Eğer teklif status'unde varsa)
  newLast24Hours: number; // Son 24 saatte gelen yeni teklifler
  loading: boolean;
  error: string | null;
}

// Teklif veya service teklifi listesinden istatistik hesaplama
const calculateOfferStats = (offers: Array<ExtendedOffer | ExtendedServiceOffer>) => {

  return {
    totalReceivedOffers: offers.length,
    pendingOffers: offers.filter(offer => offer.status === 'pending').length,
    acceptedOffers: offers.filter(offer => offer.status === 'accepted').length,
    // 'completed' status'u teklif tablolarında yok gibi görünüyor.
    // Eğer işlem tamamlama ayrı bir yerden takip ediliyorsa burası güncellenmeli.
    // Şimdilik accepted teklifleri devam eden kabul edebiliriz.
    // Tamamlanan işlemler için farklı bir veri kaynağı gerekebilir.
    completedOffers: offers.filter(offer => offer.status === 'completed').length, // Varsayımsal 'completed' status
    newLast24Hours: offers.filter(offer =>
      offer.created_at ? isWithinLastHours(offer.created_at, 24) : false
    ).length,
  };
};

export const useUserOfferStats = (userId: string | undefined): UserOfferStats => {
  const [stats, setStats] = useState<UserOfferStats>({
    totalReceivedOffers: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    completedOffers: 0,
    newLast24Hours: 0,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats({
        totalReceivedOffers: 0,
        pendingOffers: 0,
        acceptedOffers: 0,
        completedOffers: 0,
        newLast24Hours: 0,
        loading: false,
        error: "User ID is not provided.",
      });
      return;
    }

    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Kullanıcının aldığı teklifleri çek (listings için)
      const receivedOffersFromListings = await OfferService.getReceivedOffers(userId);

      // Kullanıcının aldığı teklifleri çek (transport_services için)
      const receivedOffersFromServices = await ServiceOfferService.getReceivedServiceOffers(userId);

      // İki teklif listesini birleştir
      const allReceivedOffers = [
        ...receivedOffersFromListings,
        ...receivedOffersFromServices
      ];

      // İstatistikleri hesapla
      const calculatedStats = calculateOfferStats(allReceivedOffers);

      setStats({
        ...calculatedStats,
        loading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching user offer stats:', err);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Kullanıcı teklif istatistikleri getirilemedi.',
      }));
    } finally {
       setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return stats;
};
