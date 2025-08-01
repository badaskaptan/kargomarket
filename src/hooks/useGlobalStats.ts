import { useState, useEffect } from 'react';
import {
  fetchTotalOffersCount,
  fetchTotalCompletedTransactionsCount,
  fetchTotalUsersCount,
  fetchTotalActivePublicListingsCount,
  fetchListingCategoryCounts,
  fetchTransportModeCounts,
} from '../services/statsService';

interface GlobalStats {
  totalOffers: number | null;
  completedTransactions: number | null;
  totalUsers: number | null;
  activePublicListings: number | null;
  yuk: number;
  nakliyeTalebi: number;
  nakliyeHizmeti: number;
  transportModes: {
    road: number;
    sea: number;
    air: number;
    rail: number;
  };
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalOffers: null,
    completedTransactions: null,
    totalUsers: null,
    activePublicListings: null,
    yuk: 0,
    nakliyeTalebi: 0,
    nakliyeHizmeti: 0,
    transportModes: { road: 0, sea: 0, air: 0, rail: 0 },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const [
          totalOffers,
          completedTransactions,
          totalUsers,
          activePublicListings,
          categoryCounts,
          transportModes
        ] = await Promise.all([
          fetchTotalOffersCount(),
          fetchTotalCompletedTransactionsCount(),
          fetchTotalUsersCount(),
          fetchTotalActivePublicListingsCount(),
          fetchListingCategoryCounts(),
          fetchTransportModeCounts(),
        ]);
        setStats({
          totalOffers,
          completedTransactions,
          totalUsers,
          activePublicListings,
          yuk: categoryCounts.yuk,
          nakliyeTalebi: categoryCounts.nakliyeTalebi,
          nakliyeHizmeti: categoryCounts.nakliyeHizmeti,
          transportModes,
        });
      } catch (err) {
        console.error('Failed to fetch global stats:', err);
        setError(err as Error);
        setStats({
          totalOffers: null,
          completedTransactions: null,
          totalUsers: null,
          activePublicListings: null,
          yuk: 0,
          nakliyeTalebi: 0,
          nakliyeHizmeti: 0,
          transportModes: { road: 0, sea: 0, air: 0, rail: 0 },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { stats, loading, error };
}
