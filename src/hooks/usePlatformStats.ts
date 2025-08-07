import { useState, useEffect } from 'react';
import { platformStatsService } from '../services/platformStatsService';

export const usePlatformStats = () => {
  const [stats, setStats] = useState({
    users: '50,000+',
    totalCargo: '1M+',
    activeCarriers: '5,000+',
    satisfaction: '99.8%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const formattedStats = await platformStatsService.getFormattedStats();
        setStats(formattedStats);
        setError(null);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Veriler yüklenirken hata oluştu');
        // Fallback değerler zaten stats'te var
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
