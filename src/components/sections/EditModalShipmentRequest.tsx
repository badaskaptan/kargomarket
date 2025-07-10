import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, Truck } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import type { ExtendedListing } from '../../types/database-types';

interface EditModalShipmentRequestProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedListing: ExtendedListing) => void;
}

const EditModalShipmentRequest: React.FC<EditModalShipmentRequestProps> = ({
  listing,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    destination: '',
    load_type: '',
    weight_value: '',
    weight_unit: 'kg',
    volume_value: '',
    volume_unit: 'm³',
    quantity: '',
    loading_date: '',
    delivery_date: '',
    budget_min: '',
    budget_max: '',
    price_currency: 'TRY',
    transport_mode: 'road',
    special_requirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        origin: listing.origin || '',
        destination: listing.destination || '',
        load_type: listing.load_type || '',
        weight_value: listing.weight_value?.toString() || '',
        weight_unit: listing.weight_unit || 'kg',
        volume_value: listing.volume_value?.toString() || '',
        volume_unit: listing.volume_unit || 'm³',
        quantity: listing.quantity?.toString() || '',
        loading_date: listing.loading_date || '',
        delivery_date: listing.delivery_date || '',
        budget_min: listing.budget_min?.toString() || '',
        budget_max: listing.budget_max?.toString() || '',
        price_currency: listing.price_currency || 'TRY',
        transport_mode: listing.transport_mode || 'road',
        special_requirements: listing.special_requirements || ''
      });
    }
  }, [listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        load_type: formData.load_type,
        weight_value: formData.weight_value ? parseFloat(formData.weight_value) : null,
        weight_unit: formData.weight_unit,
        volume_value: formData.volume_value ? parseFloat(formData.volume_value) : null,
        volume_unit: formData.volume_unit,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        loading_date: formData.loading_date,
        delivery_date: formData.delivery_date,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        price_currency: formData.price_currency,
        transport_mode: formData.transport_mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal',
        special_requirements: formData.special_requirements
      };

      const updatedListing = await ListingService.updateListing(listing.id, updateData);
      setSuccess(true);
      onSave(updatedListing);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 rounded-t-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-white bg-opacity-10" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nakliye Talebini Düzenle</h2>
                <p className="text-white/80 text-sm mt-1">Talep bilgilerini güncelleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm"
              title="Kapat"
              aria-label="Düzenleme modalını kapat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-green-800 font-medium">Talep başarıyla güncellendi!</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Talep Başlığı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nakliye talebinin başlığını giriniz"
              title="Talep başlığı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Nakliye talebinin açıklamasını giriniz"
              title="Talep açıklaması"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Transport Mode */}
          <div>
            <label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="inline h-4 w-4 mr-1" />
              Taşıma Modu *
            </label>
            <select
              id="transport_mode"
              name="transport_mode"
              value={formData.transport_mode}
              onChange={handleChange}
              required
              title="Taşıma modu seçimi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="road">Karayolu</option>
              <option value="sea">Denizyolu</option>
              <option value="air">Havayolu</option>
              <option value="rail">Demiryolu</option>
              <option value="multimodal">Karma Taşımacılık</option>
            </select>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Yükleme Noktası *
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                placeholder="Yükleme noktasını giriniz"
                title="Yükleme noktası"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Teslimat Noktası *
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Teslimat noktasını giriniz"
                title="Teslimat noktası"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Load Type */}
          <div>
            <label htmlFor="load_type" className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Yük Tipi *
            </label>
            <select
              id="load_type"
              name="load_type"
              value={formData.load_type}
              onChange={handleChange}
              required
              title="Yük tipi seçimi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Yük tipini seçiniz</option>
              <option value="Genel Kargo">Genel Kargo</option>
              <option value="Palet">Palet</option>
              <option value="Konteyner">Konteyner</option>
              <option value="Parça Eşya">Parça Eşya</option>
              <option value="Araç">Araç</option>
              <option value="Endüstriyel">Endüstriyel</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          {/* Weight, Volume, Quantity */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weight_value" className="block text-sm font-medium text-gray-700 mb-2">
                  Ağırlık
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    id="weight_value"
                    name="weight_value"
                    value={formData.weight_value}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Değer"
                    title="Ağırlık değeri"
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <select
                    id="weight_unit"
                    name="weight_unit"
                    value={formData.weight_unit}
                    onChange={handleChange}
                    title="Ağırlık birimi"
                    className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="gr">gr</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="volume_value" className="block text-sm font-medium text-gray-700 mb-2">
                  Hacim
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    id="volume_value"
                    name="volume_value"
                    value={formData.volume_value}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Değer"
                    title="Hacim değeri"
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <select
                    id="volume_unit"
                    name="volume_unit"
                    value={formData.volume_unit}
                    onChange={handleChange}
                    title="Hacim birimi"
                    className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="m³">m³</option>
                    <option value="dm³">dm³</option>
                    <option value="cm³">cm³</option>
                    <option value="lt">lt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Miktar/Parça Sayısı
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              placeholder="Miktar/Parça sayısı"
              title="Miktar veya parça sayısı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loading_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Yükleme Tarihi
              </label>
              <input
                type="date"
                id="loading_date"
                name="loading_date"
                value={formData.loading_date}
                onChange={handleChange}
                title="Yükleme tarihi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Teslimat Tarihi
              </label>
              <input
                type="date"
                id="delivery_date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                title="Teslimat tarihi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bütçe
              </label>
              <input
                type="number"
                id="budget_min"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Minimum bütçe"
                title="Minimum bütçe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Bütçe
              </label>
              <input
                type="number"
                id="budget_max"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Maksimum bütçe"
                title="Maksimum bütçe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="price_currency" className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                id="price_currency"
                name="price_currency"
                value={formData.price_currency}
                onChange={handleChange}
                title="Para birimi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label htmlFor="special_requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Özel Gereksinimler
            </label>
            <textarea
              id="special_requirements"
              name="special_requirements"
              value={formData.special_requirements}
              onChange={handleChange}
              rows={3}
              placeholder="Özel gereksinimlerinizi giriniz"
              title="Özel gereksinimler"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium transform hover:scale-105"
              title="İptal et"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg"
              title="Değişiklikleri kaydet"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModalShipmentRequest;
