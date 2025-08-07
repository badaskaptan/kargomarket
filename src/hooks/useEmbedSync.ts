import { useState, useCallback } from 'react';
import { EmbedSyncService, SyncResult, EmbedData } from '../services/embedSyncService';
import { MarketDataItem } from '../services/marketDataService';

export const useEmbedSync = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Belirli bir embed'i senkronize et
  const syncEmbed = useCallback(async (embedId: string): Promise<SyncResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await EmbedSyncService.syncEmbedWithMarketData(embedId);
      setLastSyncResult(result);
      
      if (!result.success) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync hatası';
      setError(errorMessage);
      return {
        success: false,
        updatedItems: 0,
        errors: [errorMessage],
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Tüm embed'leri senkronize et
  const syncAllEmbeds = useCallback(async (): Promise<SyncResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await EmbedSyncService.syncAllEmbeds();
      setLastSyncResult(result);
      
      if (!result.success) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Global sync hatası';
      setError(errorMessage);
      return {
        success: false,
        updatedItems: 0,
        errors: [errorMessage],
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Benzer itemları bul
  const findSimilarItems = useCallback(async (embedData: EmbedData): Promise<MarketDataItem[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const similarItems = await EmbedSyncService.findSimilarItems(embedData);
      return similarItems;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Benzer item arama hatası';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Error'ı temizle
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    lastSyncResult,
    syncEmbed,
    syncAllEmbeds,
    findSimilarItems,
    clearError
  };
};
