import { useState, useEffect, useCallback } from 'react';
import { ListingService } from '../services/listingService';
import type { ExtendedListing } from '../types/database-types';

export const useListings = (limit?: number) => {
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aktif ilanları getir
      const data = await ListingService.getActiveListings(limit);
      setListings(data as ExtendedListing[]);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings
  };
};

export default useListings;
