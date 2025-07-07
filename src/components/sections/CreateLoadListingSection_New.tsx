import React, { useState } from 'react';
import { ArrowLeft, Package, MapPin, DollarSign, Truck, FileText } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import toast, { Toaster } from 'react-hot-toast';
import type { CargoDetails, TransportDetails, AdditionalRequirements } from '../../types/database-types';

interface FormData {
  title: string;
  description: string;
  listing_type: 'shipment_request' | 'load_listing';
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date: string;
  price: string;
  currency: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  // Cargo details
  cargo_weight: string;
  cargo_volume: string;
  cargo_type: string;
  cargo_description: string;
  cargo_value: string;
  cargo_fragile: boolean;
  cargo_hazardous: boolean;
  cargo_temperature_controlled: boolean;
  // Transport details
  vehicle_type: string;
  equipment_needed: string[];
  loading_requirements: string;
  unloading_requirements: string;
  insurance_required: boolean;
  tracking_required: boolean;
  // Additional requirements
  permits_needed: string[];
  documentation: string[];
  special_instructions: string;
  contact_preferences: string[];
}

const CreateLoadListingSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    listing_type: 'load_listing',
    pickup_location: '',
    delivery_location: '',
    pickup_date: '',
    delivery_date: '',
    price: '',
    currency: 'TRY',
    priority: 'medium',
    // Cargo details
    cargo_weight: '',
    cargo_volume: '',
    cargo_type: '',
    cargo_description: '',
    cargo_value: '',
    cargo_fragile: false,
    cargo_hazardous: false,
    cargo_temperature_controlled: false,
    // Transport details
    vehicle_type: '',
    equipment_needed: [],
    loading_requirements: '',
    unloading_requirements: '',
    insurance_required: false,
    tracking_required: false,
    // Additional requirements
    permits_needed: [],
    documentation: [],
    special_instructions: '',
    contact_preferences: []
  });

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('İlan başlığı gerekli');
      return false;
    }
    if (!formData.pickup_location.trim()) {
      toast.error('Yükleme yeri gerekli');
      return false;
    }
    if (!formData.delivery_location.trim()) {
      toast.error('Teslimat yeri gerekli');
      return false;
    }
    if (!formData.pickup_date) {
      toast.error('Yükleme tarihi gerekli');
      return false;
    }
    if (!formData.delivery_date) {
      toast.error('Teslimat tarihi gerekli');
      return false;
    }
    if (new Date(formData.pickup_date) >= new Date(formData.delivery_date)) {
      toast.error('Teslimat tarihi yükleme tarihinden sonra olmalı');
      return false;
    }
    if (!formData.cargo_weight.trim()) {
      toast.error('Yük ağırlığı gerekli');
      return false;
    }
    if (!formData.cargo_type.trim()) {
      toast.error('Yük türü gerekli');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Giriş yapmanız gerekli');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Cargo details nesnesini oluştur
      const cargoDetails: CargoDetails = {
        weight: parseFloat(formData.cargo_weight) || undefined,
        type: formData.cargo_type || undefined,
        description: formData.cargo_description || undefined,
        value: parseFloat(formData.cargo_value) || undefined,
        fragile: formData.cargo_fragile,
        hazardous: formData.cargo_hazardous,
        temperature_controlled: formData.cargo_temperature_controlled,
        dimensions: formData.cargo_volume ? {
          // Hacim bilgisini parse et (örn: "25 m³" -> 25)
          length: parseFloat(formData.cargo_volume) || undefined
        } : undefined
      };

      // Transport details nesnesini oluştur
      const transportDetails: TransportDetails = {
        vehicle_type: formData.vehicle_type || undefined,
        equipment_needed: formData.equipment_needed.length > 0 ? formData.equipment_needed : undefined,
        loading_requirements: formData.loading_requirements || undefined,
        unloading_requirements: formData.unloading_requirements || undefined,
        insurance_required: formData.insurance_required,
        tracking_required: formData.tracking_required
      };

      // Additional requirements nesnesini oluştur
      const additionalRequirements: AdditionalRequirements = {
        permits_needed: formData.permits_needed.length > 0 ? formData.permits_needed : undefined,
        documentation: formData.documentation.length > 0 ? formData.documentation : undefined,
        special_instructions: formData.special_instructions || undefined,
        contact_preferences: formData.contact_preferences.length > 0 ? formData.contact_preferences : undefined
      };

      // İlan verisini hazırla
      const listingData = {
        user_id: user.id,
        listing_type: formData.listing_type,
        title: formData.title,
        description: formData.description || null,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        pickup_date: formData.pickup_date || null,
        delivery_date: formData.delivery_date || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        priority: formData.priority,
        status: 'active' as const,
        views_count: 0,
        offers_count: 0,
        is_featured: false,
        cargo_details: cargoDetails,
        transport_details: transportDetails,
        additional_requirements: additionalRequirements,
        metadata: {
          source: 'web_form',
          version: 1
        }
      };

      // İlanı kaydet
      await ListingService.createListing(listingData);

      toast.success('İlan başarıyla oluşturuldu!');
      
      // Form'u temizle
      setFormData({
        title: '',
        description: '',
        listing_type: 'load_listing',
        pickup_location: '',
        delivery_location: '',
        pickup_date: '',
        delivery_date: '',
        price: '',
        currency: 'TRY',
        priority: 'medium',
        cargo_weight: '',
        cargo_volume: '',
        cargo_type: '',
        cargo_description: '',
        cargo_value: '',
        cargo_fragile: false,
        cargo_hazardous: false,
        cargo_temperature_controlled: false,
        vehicle_type: '',
        equipment_needed: [],
        loading_requirements: '',
        unloading_requirements: '',
        insurance_required: false,
        tracking_required: false,
        permits_needed: [],
        documentation: [],
        special_instructions: '',
        contact_preferences: []
      });

      // İlanlarım sayfasına git
      setActiveSection('my-listings');

    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error instanceof Error ? error.message : 'İlan oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni İlan Oluştur</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* İlan Türü */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            İlan Türü
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
              <input
                type="radio"
                name="listing_type"
                value="load_listing"
                checked={formData.listing_type === 'load_listing'}
                onChange={(e) => handleInputChange('listing_type', e.target.value)}
                className="h-4 w-4 text-primary-600"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Yük İlanı</div>
                <div className="text-sm text-gray-500">Taşıyacağınız yük için ilan verin</div>
              </div>
            </label>
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
              <input
                type="radio"
                name="listing_type"
                value="shipment_request"
                checked={formData.listing_type === 'shipment_request'}
                onChange={(e) => handleInputChange('listing_type', e.target.value)}
                className="h-4 w-4 text-primary-600"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Taşıma Talebi</div>
                <div className="text-sm text-gray-500">Taşınacak yükünüz için teklif isteyin</div>
              </div>
            </label>
          </div>
        </div>

        {/* Temel Bilgiler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Temel Bilgiler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: İstanbul-Ankara Tekstil Yükü"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="Öncelik seçimi"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="İlan hakkında detaylı bilgi verin..."
            />
          </div>
        </div>

        {/* Lokasyon ve Tarih */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Lokasyon ve Tarih
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yükleme Yeri *
              </label>
              <input
                type="text"
                value={formData.pickup_location}
                onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: İstanbul, Türkiye"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teslimat Yeri *
              </label>
              <input
                type="text"
                value={formData.delivery_location}
                onChange={(e) => handleInputChange('delivery_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: Ankara, Türkiye"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yükleme Tarihi *
              </label>
              <input
                type="date"
                value={formData.pickup_date}
                onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                title="Yükleme Tarihi"
                aria-label="Yükleme Tarihi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teslimat Tarihi *
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                title="Teslimat Tarihi"
                aria-label="Teslimat Tarihi"
                required
              />
            </div>
          </div>
        </div>

        {/* Yük Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Yük Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yük Türü *
              </label>
              <input
                type="text"
                value={formData.cargo_type}
                onChange={(e) => handleInputChange('cargo_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: Tekstil, Gıda, Elektronik"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ağırlık (kg) *
              </label>
              <input
                type="number"
                value={formData.cargo_weight}
                onChange={(e) => handleInputChange('cargo_weight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: 15000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hacim (m³)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.cargo_volume}
                onChange={(e) => handleInputChange('cargo_volume', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: 25"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yük Açıklaması
            </label>
            <textarea
              value={formData.cargo_description}
              onChange={(e) => handleInputChange('cargo_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Yük hakkında detaylı bilgi..."
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cargo_fragile}
                onChange={(e) => handleInputChange('cargo_fragile', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
                aria-label="Kırılabilir yük"
              />
              <span className="ml-2 text-sm text-gray-700">Kırılabilir</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cargo_hazardous}
                onChange={(e) => handleInputChange('cargo_hazardous', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Tehlikeli Madde</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cargo_temperature_controlled}
                onChange={(e) => handleInputChange('cargo_temperature_controlled', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Soğuk Zincir</span>
            </label>
          </div>
        </div>

        {/* Fiyat Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Fiyat Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: 4500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                title="Para Birimi Seçin"
                aria-label="Para Birimi"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">ABD Doları ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Araç Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Araç ve Taşıma Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Araç Türü
              </label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                title="Araç Türü Seçin"
                aria-label="Araç Türü"
              >
                <option value="">Seçiniz</option>
                <option value="kamyon">Kamyon</option>
                <option value="kamyonet">Kamyonet</option>
                <option value="tir">TIR</option>
                <option value="cekici">Çekici</option>
                <option value="frigorifik">Frigorifik</option>
                <option value="tenteli">Tenteli</option>
                <option value="kapali_kasa">Kapalı Kasa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yükleme Gereksinimleri
              </label>
              <input
                type="text"
                value={formData.loading_requirements}
                onChange={(e) => handleInputChange('loading_requirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Örn: Forklift gerekli, dock var"
              />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.insurance_required}
                onChange={(e) => handleInputChange('insurance_required', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Sigorta Gerekli</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.tracking_required}
                onChange={(e) => handleInputChange('tracking_required', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Takip Sistemi Gerekli</span>
            </label>
          </div>
        </div>

        {/* Özel Talimatlar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Özel Talimatlar
          </h2>
          <textarea
            value={formData.special_instructions}
            onChange={(e) => handleInputChange('special_instructions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Özel talimatlar, dikkat edilmesi gereken noktalar..."
          />
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'İlanı Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLoadListingSection;
