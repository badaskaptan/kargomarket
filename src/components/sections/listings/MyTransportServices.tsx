import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Truck,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { useAuth } from '../../../context/SupabaseAuthContext';
import { supabase } from '../../../lib/supabase';
import TransportServiceDetailModal from '../../modals/TransportServiceDetailModal';
import EditTransportServiceModal from '../../modals/EditTransportServiceModal';
import ListingCard from '../../common/ListingCard';
import type { ExtendedListing, TransportService } from '../../../types/database-types';
import toast from 'react-hot-toast';

// Profile bilgilerini içeren transport service tipi
interface TransportServiceWithProfile extends TransportService {
  profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    city?: string;
    avatar_url?: string;
  };
}

// Transport Service API class
class TransportServiceService {
  static async getTransportServices(userId: string): Promise<TransportServiceWithProfile[]> {
    // Profiles join ile transport services çekelim
    const { data, error } = await supabase
      .from('transport_services')
      .select(`
        *,
        profiles!inner(
          full_name,
          email,
          phone,
          company_name,
          city,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Transport services fetch failed:', error);
      throw new Error(`Transport services fetch failed: ${error.message}`);
    }

    return data || [];
  }  static async deleteTransportService(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transport_services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Transport service deletion failed:', error);
      throw new Error(`Transport service deletion failed: ${error.message}`);
    }

    return true;
  }
}

/**
 * Nakliye Hizmetleri Bileşeni
 * transport_services tablosundaki verileri yönetir
 */
const MyTransportServices: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();

  // State
  const [services, setServices] = useState<TransportServiceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<TransportService | null>(null);
  const [editService, setEditService] = useState<TransportService | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Veri yükleme
  const loadTransportServices = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const userServices = await TransportServiceService.getTransportServices(user.id);
      setServices(userServices);
    } catch (error) {
      console.error('❌ Transport services yüklenirken hata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`Nakliye hizmetleri yüklenemedi: ${errorMessage}`);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);  useEffect(() => {
    loadTransportServices();
  }, [loadTransportServices]);

  // Arama filtreleme
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.origin && service.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.destination && service.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.company_name && service.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Hizmet güncelleme
  const handleServiceUpdated = (updated: TransportService) => {
    setServices(prev => prev.map(service =>
      service.id === updated.id ? updated : service
    ));

    // Eğer detail modal açıksa ve güncellenen hizmet aynı hizmetse, selectedService'i de güncelle
    if (selectedService && selectedService.id === updated.id) {
      setSelectedService(updated);
    }

    toast.success('Nakliye hizmeti başarıyla güncellendi!');
  };

  // Hizmet silme
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Bu nakliye hizmetini silmek istediğinizden emin misiniz?')) return;

    try {
      await TransportServiceService.deleteTransportService(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Hizmet silinirken hata:', error);
    }
  };

  // Önizleme aç
  const handlePreview = (service: TransportService) => {
    setSelectedService(service);
    setShowPreview(true);
  };

  // Düzenleme aç
  const handleEdit = (service: TransportService) => {
    setEditService(service);
  };

  // ListingCard bileşeni için wrapper fonksiyonlar
  const handleCardPreview = (listing: ExtendedListing) => {
    // ExtendedListing'den TransportService'e dönüşüm için orijinal service'i bul
    const originalService = services.find((s: TransportServiceWithProfile) => s.id === listing.id);
    if (originalService) {
      handlePreview(originalService);
    }
  };

  const handleCardEdit = (listing: ExtendedListing) => {
    // ExtendedListing'den TransportService'e dönüşüm için orijinal service'i bul
    const originalService = services.find((s: TransportServiceWithProfile) => s.id === listing.id);
    if (originalService) {
      handleEdit(originalService);
    }
  };

  const handleCardDelete = (id: string) => {
    handleDeleteService(id);
  };

  // TransportService'i ExtendedListing formatına dönüştür
  const convertToExtendedListing = (service: TransportServiceWithProfile): ExtendedListing => {
    return {
      id: service.id,
      listing_number: service.service_number || service.id,
      user_id: service.user_id,
      listing_type: 'transport_service' as const,
      role_type: 'seller' as const,
      title: service.title || 'Başlıksız Hizmet',
      description: service.description,
      category: service.vehicle_type || 'nakliye',
      subcategory: null,
      origin: service.origin || '',
      destination: service.destination || '',
      origin_coordinates: null,
      destination_coordinates: null,
      origin_details: null,
      destination_details: null,
      route_waypoints: null,
      load_type: null,
      load_category: null,
      weight_value: service.capacity_value,
      weight_unit: service.capacity_unit,
      volume_value: null,
      volume_unit: null,
      dimensions: null,
      quantity: null,
      packaging_type: null,
      special_handling_requirements: null,
      loading_date: null,
      loading_time: null,
      delivery_date: null,
      delivery_time: null,
      available_from_date: service.available_from_date,
      available_until_date: service.available_until_date,
      flexible_dates: null,
      transport_mode: service.transport_mode || 'road',
      vehicle_types: service.vehicle_type ? [service.vehicle_type] : null,
      transport_responsible: null,
      special_requirements: null,
      temperature_controlled: null,
      temperature_range: null,
      humidity_controlled: null,
      hazardous_materials: null,
      fragile_cargo: null,
      offer_type: null,
      price_amount: null,
      price_currency: 'TRY',
      price_per: null,
      budget_min: null,
      budget_max: null,
      required_documents: null,
      insurance_required: false,
      insurance_value: null,
      customs_clearance_required: null,
      related_load_listing_id: null,
      status: 'active' as const,
      is_urgent: null,
      priority_level: null,
      visibility: 'public' as const,
      view_count: service.view_count || 0,
      offer_count: null,
      favorite_count: 0,
      search_tags: null,
      seo_keywords: null,
      document_urls: null,
      image_urls: null,
      created_at: service.created_at,
      updated_at: service.updated_at,
      published_at: service.created_at,
      expires_at: null,
      metadata: null,
      transport_details: {
        ship_name: service.ship_name,
        imo_number: service.imo_number,
        vehicle_type: service.vehicle_type,
        // Tüm transport service detaylarını ekle
        company_name: service.company_name,
        plate_number: service.plate_number,
        mmsi_number: service.mmsi_number,
        dwt: service.dwt,
        gross_tonnage: service.gross_tonnage,
        net_tonnage: service.net_tonnage,
        ship_dimensions: service.ship_dimensions,
        freight_type: service.freight_type,
        charterer_info: service.charterer_info,
        ship_flag: service.ship_flag,
        home_port: service.home_port,
        year_built: service.year_built,
        speed_knots: service.speed_knots,
        fuel_consumption: service.fuel_consumption,
        ballast_capacity: service.ballast_capacity,
        flight_number: service.flight_number,
        aircraft_type: service.aircraft_type,
        max_payload: service.max_payload,
        cargo_volume: service.cargo_volume,
        train_number: service.train_number,
        wagon_count: service.wagon_count,
        wagon_types: service.wagon_types,
        required_documents: service.required_documents,
        document_urls: service.document_urls,
        rating: service.rating,
        rating_count: service.rating_count,
        is_featured: service.is_featured,
        featured_until: service.featured_until
      },
      contact_info: service.contact_info ? { info: service.contact_info } : null,
      cargo_details: null,
      // Owner bilgilerini profiles'den al
      owner_name: service.profiles?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Siz',
      owner_email: service.profiles?.email || user?.email || '',
      owner_phone: service.profiles?.phone || user?.user_metadata?.phone || '',
      owner_company: service.company_name || service.profiles?.company_name || user?.user_metadata?.company_name || '',
      owner_city: service.profiles?.city || user?.user_metadata?.city || '',
      owner_rating: 0,
      owner_address: user?.user_metadata?.address || '',
      owner_tax_office: user?.user_metadata?.tax_office || '',
      owner_tax_number: user?.user_metadata?.tax_number || '',
      owner_avatar_url: service.profiles?.avatar_url || user?.user_metadata?.avatar_url || '',
      owner_user_type: user?.user_metadata?.user_role || '',
      owner_total_listings: 0,
      owner_total_completed_transactions: 0,
      owner_rating_count: 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Nakliye hizmetleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Nakliye hizmetlerinde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredServices.length}</span> hizmet bulundu
          </div>
        </div>

        <button
          onClick={() => setActiveSection('create-transport-service')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Nakliye Hizmeti
        </button>
      </div>

      {/* Hizmet Listesi */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aramanızla eşleşen hizmet bulunamadı' : 'Henüz nakliye hizmetiniz yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Farklı anahtar kelimelerle tekrar deneyin' : 'İlk nakliye hizmetinizi oluşturun'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setActiveSection('create-transport-service')}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              İlk Hizmetimi Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ListingCard
              key={service.id}
              listing={convertToExtendedListing(service)}
              onPreview={handleCardPreview}
              onEdit={handleCardEdit}
              onDelete={handleCardDelete}
              onMessage={() => {}} // Boş fonksiyon - MyListings sayfasında mesaj gönderme gerekmiyor
              isLoggedIn={true} // Dashboard'da kullanıcı zaten giriş yapmış
            />
          ))}
        </div>
      )}

      {/* EditTransportServiceModal */}
      {editService && (
        <EditTransportServiceModal
          service={editService}
          isOpen={!!editService}
          onClose={() => setEditService(null)}
          onUpdated={handleServiceUpdated}
        />
      )}

      {/* TransportServiceDetailModal */}
      {showPreview && selectedService && (
        <TransportServiceDetailModal
          service={selectedService}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
};

export default MyTransportServices;
