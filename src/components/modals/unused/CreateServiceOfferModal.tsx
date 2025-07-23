import React, { useState } from 'react';
import { X, Send, Truck } from 'lucide-react';
import { ServiceOfferService } from '../../../services/serviceOfferService';
import { useAuth } from '../../../context/SupabaseAuthContext';
import type { ExtendedListing } from '../../../types/database-types';

interface CreateServiceOfferModalProps {
    transportService: ExtendedListing;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateServiceOfferModal: React.FC<CreateServiceOfferModalProps> = ({
    transportService,
    isOpen,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        price_amount: '',
        price_currency: 'TRY' as 'TRY' | 'USD' | 'EUR',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Teklif verebilmek için giriş yapmalısınız');
            return;
        }

        if (!formData.price_amount || isNaN(Number(formData.price_amount)) || Number(formData.price_amount) <= 0) {
            alert('Geçerli bir fiyat girmelisiniz');
            return;
        }

        setIsSubmitting(true);

        try {
            await ServiceOfferService.createServiceOffer({
                user_id: user.id,
                transport_service_id: transportService.id,
                price_amount: Number(formData.price_amount),
                price_currency: formData.price_currency,
                message: formData.message || null
            });

            console.log('✅ Service offer created successfully');
            alert('Teklifiniz başarıyla gönderildi!');

            // Reset form
            setFormData({
                price_amount: '',
                price_currency: 'TRY',
                message: ''
            });

            onClose();
            onSuccess?.();

        } catch (error) {
            console.error('❌ Service offer creation failed:', error);
            alert(error instanceof Error ? error.message : 'Teklif gönderilirken bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Truck className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Nakliye Hizmetine Teklif Ver
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {transportService.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modalı Kapat"
                        aria-label="Modalı Kapat"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* Service Info */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Güzergah:</span>
                            <span className="text-gray-900 font-medium">
                                {transportService.origin} → {transportService.destination}
                            </span>
                        </div>
                        {transportService.transport_mode && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Taşıma Türü:</span>
                                <span className="text-gray-900 font-medium">
                                    {transportService.transport_mode === 'road' ? 'Karayolu' :
                                        transportService.transport_mode === 'sea' ? 'Denizyolu' :
                                            transportService.transport_mode === 'air' ? 'Havayolu' :
                                                transportService.transport_mode === 'rail' ? 'Demiryolu' :
                                                    transportService.transport_mode}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hizmet Sahibi:</span>
                            <span className="text-gray-900 font-medium">
                                {transportService.owner_name || 'Bilinmiyor'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teklif Fiyatı *
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={formData.price_amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, price_amount: e.target.value }))}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                            <select
                                value={formData.price_currency}
                                onChange={(e) => setFormData(prev => ({ ...prev, price_currency: e.target.value as 'TRY' | 'USD' | 'EUR' }))}
                                className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                title="Para Birimi"
                                aria-label="Para Birimi Seçin"
                            >
                                <option value="TRY">₺</option>
                                <option value="USD">$</option>
                                <option value="EUR">€</option>
                            </select>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mesaj (Opsiyonel)
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Teklifiniz hakkında detaylar, özel koşullar vs..."
                        />
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800">
                                    <strong>Dikkat:</strong> Teklifiniz gönderildikten sonra hizmet sahibi tarafından değerlendirilecektir.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            disabled={isSubmitting}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.price_amount}
                            className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span>Teklif Gönder</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateServiceOfferModal;
