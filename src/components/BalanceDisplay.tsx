import React, { useState, useEffect } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { BillingService, UserBalance, BILLING_CONFIG } from '../services/billingService';
import PaymentModal from './PaymentModal';

interface BalanceDisplayProps {
  onBalanceUpdate?: (balance: UserBalance) => void;
  showAddButton?: boolean;
  className?: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  onBalanceUpdate, 
  showAddButton = true,
  className = '' 
}) => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const initializeBalance = async () => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await BillingService.getUserBalance();
      
      if (apiError) {
        setError(apiError);
      } else {
        setBalance(data);
        if (onBalanceUpdate && data) {
          onBalanceUpdate(data);
        }
      }
      
      setLoading(false);
    };

    initializeBalance();
  }, [onBalanceUpdate]);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await BillingService.getUserBalance();
    
    if (apiError) {
      setError(apiError);
    } else {
      setBalance(data);
      if (onBalanceUpdate && data) {
        onBalanceUpdate(data);
      }
    }
    
    setLoading(false);
  };

  const handlePaymentSuccess = async () => {
    // Refresh balance after successful payment
    await loadBalance();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className={`bg-red-500 rounded-lg p-4 text-white ${className}`}>
        <div className="flex items-center">
          <Wallet className="h-5 w-5 mr-2" />
          <span className="text-sm">{error || 'Bakiye yüklenemedi'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 mr-3" />
            <div>
              <p className="text-sm opacity-90">
                {BILLING_CONFIG.FREE_MODE ? 'Reklam Bakiyesi (Ücretsiz)' : 'Mevcut Bakiye'}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(balance.current_balance)}</p>
              {BILLING_CONFIG.FREE_MODE && (
                <p className="text-xs opacity-75 mt-1 flex items-center">
                  <Gift className="h-3 w-3 mr-1" />
                  Sınırsız kullanım
                </p>
              )}
            </div>
          </div>
          
          {showAddButton && !BILLING_CONFIG.FREE_MODE && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors"
              title="Bakiye Ekle"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-300" />
              <div>
                <p className="text-xs opacity-75">
                  {BILLING_CONFIG.FREE_MODE ? 'Hediye Bakiye' : 'Toplam Yüklenen'}
                </p>
                <p className="font-semibold">{formatCurrency(balance.current_balance + balance.total_spent)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-300" />
              <div>
                <p className="text-xs opacity-75">Toplam Harcanan</p>
                <p className="font-semibold">{formatCurrency(balance.total_spent)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs opacity-75">
          {BILLING_CONFIG.FREE_MODE && (
            <span className="bg-yellow-500 bg-opacity-20 px-2 py-1 rounded mr-2">
              Beta Sürüm
            </span>
          )}
          Son güncelleme: {new Date(balance.last_updated).toLocaleString('tr-TR')}
        </div>
      </div>

      {!BILLING_CONFIG.FREE_MODE && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default BalanceDisplay;
