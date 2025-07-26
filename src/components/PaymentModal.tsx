import React, { useState } from 'react';
import { CreditCard, X, Lock, AlertCircle } from 'lucide-react';
import { BillingService } from '../services/billingService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Preset amounts
  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setCardData(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) < 10) {
      setError('Minimum yükleme tutarı 10 TL\'dir.');
      return false;
    }

    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Geçerli bir kart numarası giriniz.');
      return false;
    }

    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      setError('Geçerli bir son kullanma tarihi giriniz.');
      return false;
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      setError('Geçerli bir CVV giriniz.');
      return false;
    }

    if (!cardData.cardHolder.trim()) {
      setError('Kart sahibinin adını giriniz.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulated payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment reference
      const paymentReference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add balance
      const { success, error: billingError } = await BillingService.addBalance(
        parseFloat(amount),
        paymentReference
      );

      if (success) {
        onSuccess(parseFloat(amount));
        onClose();
        // Reset form
        setAmount('');
        setCardData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolder: ''
        });
      } else {
        setError(billingError || 'Ödeme işlemi başarısız oldu.');
      }
    } catch (error) {
      setError('Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Bakiye Ekle</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yüklenecek Tutar (TL)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                    amount === preset.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isProcessing}
                >
                  {preset} TL
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Özel tutar girin"
              min="10"
              step="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>

          {/* Card Information */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              Kart Bilgileri
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kart Numarası</label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Son Kullanma</label>
                  <input
                    type="text"
                    value={cardData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardData(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Kart Sahibi</label>
                <input
                  type="text"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                  placeholder="JOHN DOE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isProcessing}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isProcessing || !amount}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {amount ? `${amount} TL Öde` : 'Öde'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <Lock className="h-3 w-3 inline mr-1" />
          Ödeme bilgileriniz SSL ile şifrelenmektedir.
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
