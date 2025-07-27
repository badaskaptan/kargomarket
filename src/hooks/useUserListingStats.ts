import { useState, useEffect, useCallback } from 'react';
import { ListingService } from '../services/listingService';
import type { ExtendedListing } from '../types/database-types';

// Tarih karşılaştırması için basit bir utility fonksiyonu (Eğer src/utils/dateUtils.ts yoksa)
const isWithinLastDays = (dateString: string, days: number): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  } catch (e) {
    console.error("Invalid date string in isWithinLastDays:", dateString, e);
    return false; // Hatalı tarih formatında false döndür
  }
};

interface UserListingStats {
  totalListings: number;
  activeListings: number;
  newLast7Days: number;
  loading: boolean;
  error: string | null;
}

export const useUserListingStats = (userId: string | undefined): UserListingStats => {
  const [stats, setStats] = useState<UserListingStats>({
    totalListings: 0,
    activeListings: 0,
    newLast7Days: 0,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats({
        totalListings: 0,
        activeListings: 0,
        newLast7Days: 0,
        loading: false,
        error: "User ID is not provided.",
      });
      return;
    }

    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Kullanıcının tüm ilanlarını çek
      const userListings = await ListingService.getUserListings(userId);

      const totalListings = userListings.length;
      const activeListings = userListings.filter(listing => listing.status === 'active').length;

      // Son 7 günde eklenen ilanları bul
      const newLast7Days = userListings.filter(listing =>
        listing.created_at ? isWithinLastDays(listing.created_at, 7) : false
      ).length;

      setStats({
        totalListings,
        activeListings,
        newLast7Days,
        loading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching user listing stats:', err);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Kullanıcı ilanı istatistikleri getirilemedi.',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return stats;
};
