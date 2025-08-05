import React, { useState } from 'react';
import {
  X,
  Truck,
  Check,
  DollarSign,
  User
} from 'lucide-react';
import { ServiceOfferService } from '../../../../services/serviceOfferService';
import { useAuth } from '../../../../context/SupabaseAuthContext';
import type { ExtendedServiceOffer } from '../../../../types/service-offer-types';

// TypeScript types (cargo types)
type CargoType = 'general_cargo' | 'bulk_cargo' | 'container' | 'liquid' | 'dry_bulk' | 'refrigerated' | 'hazardous' | 'oversized' | 'project_cargo' | 'livestock' | 'vehicles' | 'machinery' | 'box_package' | 'pallet_standard' | 'pallet_euro' | 'pallet_industrial' | 'sack_bigbag' | 'barrel_drum' | 'appliances_electronics' | 'furniture_decor' | 'textile_products' | 'automotive_parts' | 'machinery_parts' | 'construction_materials' | 'packaged_food' | 'consumer_goods' | 'ecommerce_cargo' | 'other_general' | 'grain' | 'ore' | 'coal' | 'cement_bulk' | 'sand_gravel' | 'fertilizer_bulk' | 'soil_excavation' | 'scrap_metal' | 'other_bulk' | 'crude_oil' | 'chemical_liquids' | 'vegetable_oils' | 'fuel' | 'lpg_lng' | 'water' | 'milk_dairy' | 'wine_concentrate' | 'other_liquid' | 'tbm' | 'transformer_generator' | 'heavy_machinery' | 'boat_yacht' | 'industrial_parts' | 'prefab_elements' | 'wind_turbine' | 'other_oversized' | 'art_antiques' | 'glass_ceramic' | 'electronic_devices' | 'medical_devices' | 'lab_equipment' | 'flowers_plants' | 'other_sensitive' | 'dangerous_class1' | 'dangerous_class2' | 'dangerous_class3' | 'dangerous_class4' | 'dangerous_class5' | 'dangerous_class6' | 'dangerous_class7' | 'dangerous_class8' | 'dangerous_class9' | 'frozen_food' | 'fresh_produce' | 'meat_dairy' | 'pharma_vaccine' | 'chemical_temp' | 'other_cold_chain' | 'small_livestock' | 'large_livestock' | 'poultry' | 'pets' | 'other_livestock' | 'factory_setup' | 'power_plant' | 'infrastructure' | 'other_project';

// Service Ad type for getting transport_mode
interface ServiceAd {
  transport_mode?: 'road' | 'sea' | 'air' | 'rail' | 'multimodal';
}

// Vehicle type structure
interface VehicleOption {
  value: string;
  label: string;
}

interface VehicleGroup {
  group: string;
  vehicles: VehicleOption[];
}

interface EditServiceOfferModalProps {
  offer: ExtendedServiceOffer;
  serviceAd: ServiceAd; // Service ad for getting transport_mode
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditServiceOfferFormData {
  // Coğrafi bilgiler
  pickup_location: string;
  delivery_location: string;
  service_reference_title: string;
  offered_vehicle_type: string;
  
  // Şirket bilgileri
  company_name: string;
  company_website: string;
  company_tax_number: string;
  
  // Sigorta bilgileri
  insurance_company: string;
  insurance_policy_number: string;
  
  // Yük miktarı ve hacim bilgileri
  cargo_weight: string;
  cargo_weight_unit: 'kg' | 'ton' | 'lb';
  cargo_volume: string;
  cargo_volume_unit: 'm3' | 'ft3' | 'l';
  
  // Fiyat bilgileri
  price_amount: string;
  price_currency: 'USD' | 'EUR' | 'TRY';
  price_per: 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle';
  message: string;
  
  // Hizmet özellikleri
  transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal';
  cargo_type: CargoType;
  service_scope: 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only';
  
  // Tarih bilgileri
  pickup_date_preferred: string;
  pickup_date_latest: string;
  delivery_date_preferred: string;
  delivery_date_latest: string;
  transit_time_estimate: string;
  expires_at: string;
  
  // Ek hizmetler
  customs_handling_included: boolean;
  documentation_handling_included: boolean;
  loading_unloading_included: boolean;
  tracking_system_provided: boolean;
  express_service: boolean;
  weekend_service: boolean;
  
  // Ek ücretler
  fuel_surcharge_included: boolean;
  toll_fees_included: boolean;
  port_charges_included: boolean;
  airport_charges_included: boolean;
  
  // Garantiler
  on_time_guarantee: boolean;
  damage_free_guarantee: boolean;
  temperature_guarantee: boolean;
  
  // İletişim bilgileri
  contact_person: string;
  contact_phone: string;
  emergency_contact: string;
  
  // Ödeme koşulları
  payment_terms: string;
}

const EditServiceOfferModal: React.FC<EditServiceOfferModalProps> = ({
  isOpen,
  onClose,
  serviceAd,
  offer
}) => {
  // Vehicle types configuration for dynamic dropdown
  const vehicleTypes = {
    road: [
      {
        group: 'Kamyonlar',
        vehicles: [
          { value: 'truck_3_5_open', label: 'Kamyon - 3.5 Ton (Açık Kasa)' },
          { value: 'truck_3_5_closed', label: 'Kamyon - 3.5 Ton (Kapalı Kasa)' },
          { value: 'truck_5_open', label: 'Kamyon - 5 Ton (Açık Kasa)' },
          { value: 'truck_5_closed', label: 'Kamyon - 5 Ton (Kapalı Kasa)' },
          { value: 'truck_10_open', label: 'Kamyon - 10 Ton (Açık Kasa)' },
          { value: 'truck_10_closed', label: 'Kamyon - 10 Ton (Kapalı Kasa)' },
          { value: 'truck_10_tent', label: 'Kamyon - 10 Ton (Tenteli)' },
          { value: 'truck_15_open', label: 'Kamyon - 15 Ton (Açık Kasa)' },
          { value: 'truck_15_closed', label: 'Kamyon - 15 Ton (Kapalı Kasa)' },
          { value: 'truck_15_tent', label: 'Kamyon - 15 Ton (Tenteli)' }
        ]
      },
      {
        group: 'Tır ve Çekiciler (40 Tona Kadar)',
        vehicles: [
          { value: 'tir_standard', label: 'Tır (Standart Dorse) - 90m³ / 40t' },
          { value: 'tir_mega', label: 'Tır (Mega Dorse) - 100m³ / 40t' },
          { value: 'tir_jumbo', label: 'Tır (Jumbo Dorse) - 120m³ / 40t' },
          { value: 'tir_tent', label: 'Tır (Tenteli Dorse) - 40t' },
          { value: 'tir_frigo', label: 'Tır (Frigorifik Dorse - Isı Kontrollü) - 40t' },
          { value: 'tir_container', label: 'Tır (Konteyner Taşıyıcı) - 40t' },
          { value: 'tir_platform', label: 'Tır (Platform) - 40t' },
          { value: 'tir_frigo_dual', label: 'Tır (Frigorifik Çift Isı) - 40t' }
        ]
      },
      {
        group: 'Kargo Araçları (Hafif Yükler)',
        vehicles: [
          { value: 'van_3', label: 'Kargo Van - 3m³ (1000kg)' },
          { value: 'van_6', label: 'Kargo Van - 6m³ (1500kg)' },
          { value: 'van_10', label: 'Kargo Van - 10m³ (2000kg)' },
          { value: 'van_15', label: 'Kargo Van - 15m³ (2500kg)' }
        ]
      }
    ],
    sea: [
      {
        group: 'Konteyner Gemisi',
        vehicles: [
          { value: 'container_20dc', label: '20\' Standart (20DC) - 33m³ / 28t' },
          { value: 'container_40dc', label: '40\' Standart (40DC) - 67m³ / 28t' },
          { value: 'container_40hc', label: '40\' Yüksek (40HC) - 76m³ / 28t' },
          { value: 'container_20ot', label: '20\' Open Top - 32m³ / 28t' },
          { value: 'container_40ot', label: '40\' Open Top - 66m³ / 28t' },
          { value: 'container_20fr', label: '20\' Flat Rack - 28t' },
          { value: 'container_40fr', label: '40\' Flat Rack - 40t' },
          { value: 'container_20rf', label: '20\' Reefer - 28m³ / 25t' },
          { value: 'container_40rf', label: '40\' Reefer - 60m³ / 25t' }
        ]
      },
      {
        group: 'Dökme Yük Gemisi',
        vehicles: [
          { value: 'bulk_handysize', label: 'Handysize (10,000-35,000 DWT)' },
          { value: 'bulk_handymax', label: 'Handymax (35,000-60,000 DWT)' },
          { value: 'bulk_panamax', label: 'Panamax (60,000-80,000 DWT)' },
          { value: 'bulk_capesize', label: 'Capesize (80,000+ DWT)' }
        ]
      },
      {
        group: 'Genel Kargo Gemisi',
        vehicles: [
          { value: 'general_small', label: 'Küçük Tonaj (1,000-5,000 DWT)' },
          { value: 'general_medium', label: 'Orta Tonaj (5,000-15,000 DWT)' },
          { value: 'general_large', label: 'Büyük Tonaj (15,000+ DWT)' }
        ]
      },
      {
        group: 'Tanker',
        vehicles: [
          { value: 'tanker_product', label: 'Ürün Tankeri (10,000-60,000 DWT)' },
          { value: 'tanker_chemical', label: 'Kimyasal Tanker (5,000-40,000 DWT)' },
          { value: 'tanker_crude', label: 'Ham Petrol Tankeri (60,000+ DWT)' },
          { value: 'tanker_lpg', label: 'LPG Tankeri (5,000-80,000 m³)' },
          { value: 'tanker_lng', label: 'LNG Tankeri (150,000-180,000 m³)' }
        ]
      },
      {
        group: 'RO-RO',
        vehicles: [
          { value: 'roro_small', label: 'Küçük RO-RO (100-200 araç)' },
          { value: 'roro_medium', label: 'Orta RO-RO (200-500 araç)' },
          { value: 'roro_large', label: 'Büyük RO-RO (500+ araç)' }
        ]
      },
      {
        group: 'Feribot ve Yük Teknesi',
        vehicles: [
          { value: 'ferry_cargo', label: 'Kargo Feribotu' },
          { value: 'ferry_mixed', label: 'Karma Feribot (Yolcu+Yük)' },
          { value: 'cargo_small', label: 'Küçük Yük Teknesi (500-1,000 DWT)' },
          { value: 'cargo_large', label: 'Büyük Yük Teknesi (1,000+ DWT)' }
        ]
      }
    ],
    air: [
      {
        group: 'Kargo Tipleri',
        vehicles: [
          { value: 'standard_cargo', label: 'Standart Kargo' },
          { value: 'large_cargo', label: 'Büyük Hacimli Kargo' },
          { value: 'special_cargo', label: 'Özel Kargo' }
        ]
      }
    ],
    rail: [
      {
        group: 'Vagon Tipleri',
        vehicles: [
          { value: 'open_wagon', label: 'Açık Yük Vagonu' },
          { value: 'closed_wagon', label: 'Kapalı Yük Vagonu' },
          { value: 'container_wagon', label: 'Konteyner Vagonu' },
          { value: 'tanker_wagon', label: 'Tanker Vagonu' }
        ]
      }
    ]
  };

  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditServiceOfferFormData>({
    pickup_location: offer.pickup_location || '',
    delivery_location: offer.delivery_location || '',
    service_reference_title: offer.service_reference_title || '',
    offered_vehicle_type: offer.offered_vehicle_type || '',
    
    company_name: offer.company_name || '',
    company_website: offer.company_website || '',
    company_tax_number: offer.company_tax_number || '',
    
    insurance_company: offer.insurance_company || '',
    insurance_policy_number: offer.insurance_policy_number || '',
    
    cargo_weight: offer.cargo_weight?.toString() || '',
    cargo_weight_unit: offer.cargo_weight_unit || 'kg',
    cargo_volume: offer.cargo_volume?.toString() || '',
    cargo_volume_unit: offer.cargo_volume_unit || 'm3',
    
    price_amount: offer.price_amount?.toString() || '',
    price_currency: offer.price_currency || 'TRY',
    price_per: (offer.price_per as 'total' | 'per_km' | 'per_ton' | 'per_ton_km' | 'per_pallet' | 'per_hour' | 'per_day' | 'per_container' | 'per_teu' | 'per_cbm' | 'per_piece' | 'per_vehicle') || 'total',
    message: offer.message || '',
    
    transport_mode: (offer.transport_mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal') || 'road',
    cargo_type: (offer.cargo_type as CargoType) || 'general_cargo',
    service_scope: (offer.service_scope as 'door_to_door' | 'port_to_port' | 'terminal_to_terminal' | 'warehouse_to_warehouse' | 'pickup_only' | 'delivery_only') || 'door_to_door',
    
    pickup_date_preferred: offer.pickup_date_preferred ? offer.pickup_date_preferred.split('T')[0] : '',
    pickup_date_latest: offer.pickup_date_latest ? offer.pickup_date_latest.split('T')[0] : '',
    delivery_date_preferred: offer.delivery_date_preferred ? offer.delivery_date_preferred.split('T')[0] : '',
    delivery_date_latest: offer.delivery_date_latest ? offer.delivery_date_latest.split('T')[0] : '',
    transit_time_estimate: offer.transit_time_estimate || '',
    expires_at: offer.expires_at ? offer.expires_at.split('T')[0] : '',
    
    customs_handling_included: offer.customs_handling_included || false,
    documentation_handling_included: offer.documentation_handling_included || false,
    loading_unloading_included: offer.loading_unloading_included || false,
    tracking_system_provided: offer.tracking_system_provided || true,
    express_service: offer.express_service || false,
    weekend_service: offer.weekend_service || false,
    
    fuel_surcharge_included: offer.fuel_surcharge_included || false,
    toll_fees_included: offer.toll_fees_included || false,
    port_charges_included: offer.port_charges_included || false,
    airport_charges_included: offer.airport_charges_included || false,
    
    on_time_guarantee: offer.on_time_guarantee || false,
    damage_free_guarantee: offer.damage_free_guarantee || false,
    temperature_guarantee: offer.temperature_guarantee || false,
    
    contact_person: offer.contact_person || '',
    contact_phone: offer.contact_phone || '',
    emergency_contact: offer.emergency_contact || '',
    
    payment_terms: offer.payment_terms || 'after_delivery'
  });

  // Form data update handler
  const updateFormData = (field: keyof EditServiceOfferFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Prevent form submission on Enter key in input fields
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) {
      alert('Lütfen önce giriş yapın.');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate numeric fields to prevent overflow
    const validateNumericField = (value: string, fieldName: string, maxValue: number = 999999999) => {
      if (!value) return null;
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        throw new Error(`${fieldName} geçerli bir pozitif sayı olmalıdır.`);
      }
      if (numValue > maxValue) {
        throw new Error(`${fieldName} çok büyük bir değer. Maksimum: ${maxValue.toLocaleString()}`);
      }
      return numValue;
    };

    try {
      // Validate before submission
      const priceAmount = validateNumericField(formData.price_amount, 'Fiyat miktarı', 999999999);
      const cargoWeight = validateNumericField(formData.cargo_weight, 'Yük ağırlığı', 999999);
      const cargoVolume = validateNumericField(formData.cargo_volume, 'Yük hacmi', 999999);

      setIsSubmitting(true);
      
      // Clean and prepare data for submission
      const cleanedData = {
        ...formData,
        price_amount: priceAmount,
        cargo_weight: cargoWeight,
        cargo_volume: cargoVolume,
        pickup_date_preferred: formData.pickup_date_preferred || null,
        pickup_date_latest: formData.pickup_date_latest || null,
        delivery_date_preferred: formData.delivery_date_preferred || null,
        delivery_date_latest: formData.delivery_date_latest || null,
        expires_at: formData.expires_at || null,
        // Convert empty strings to null
        pickup_location: formData.pickup_location || null,
        delivery_location: formData.delivery_location || null,
        service_reference_title: formData.service_reference_title || null,
        offered_vehicle_type: formData.offered_vehicle_type || null,
        company_name: formData.company_name || null,
        company_website: formData.company_website || null,
        company_tax_number: formData.company_tax_number || null,
        insurance_company: formData.insurance_company || null,
        insurance_policy_number: formData.insurance_policy_number || null,
        message: formData.message || null,
        transit_time_estimate: formData.transit_time_estimate || null,
        contact_person: formData.contact_person || null,
        contact_phone: formData.contact_phone || null,
        emergency_contact: formData.emergency_contact || null,
        payment_terms: formData.payment_terms || null
      };

      // Update the offer
      await ServiceOfferService.updateServiceOffer(offer.id, cleanedData);
      alert('Teklifiniz başarıyla güncellendi!');
      onClose();
    } catch (error) {
      console.error('Error updating offer:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('numeric field overflow')) {
          alert('Girilen sayısal değerler çok büyük. Lütfen daha küçük değerler girin.');
        } else if (error.message.includes('validation')) {
          alert(error.message);
        } else {
          alert(`Teklif güncellenirken bir hata oluştu: ${error.message}`);
        }
      } else {
        alert('Teklif güncellenirken bir hata oluştu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Teklif Güncelle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Kapat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-8">
          {/* Service Reference and Vehicle Type */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              🚛 Hizmet Detayları
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hizmet Referansı
                </label>
                <input
                  type="text"
                  value={formData.service_reference_title}
                  onChange={(e) => updateFormData('service_reference_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Hizmet tanımı"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Önerilen Araç Tipi
                </label>
                <select
                  value={formData.offered_vehicle_type}
                  onChange={(e) => updateFormData('offered_vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  title="Araç tipi seçiniz"
                >
                  <option value="">Araç tipi seçiniz</option>
                  {serviceAd?.transport_mode && vehicleTypes[serviceAd.transport_mode as keyof typeof vehicleTypes]?.map((group: VehicleGroup) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.vehicles.map((vehicle: VehicleOption) => (
                        <option key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              🏢 Şirket Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => updateFormData('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Şirket adınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Web Sitesi
                </label>
                <input
                  type="url"
                  value={formData.company_website}
                  onChange={(e) => updateFormData('company_website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://www.sirketiniz.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={formData.company_tax_number}
                  onChange={(e) => updateFormData('company_tax_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Vergi numaranız"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              💰 Fiyatlandırma
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat Miktarı
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999999"
                  value={formData.price_amount}
                  onChange={(e) => updateFormData('price_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                  title="Maksimum: 999,999,999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={formData.price_currency}
                  onChange={(e) => updateFormData('price_currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  title="Para birimi seçiniz"
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat Türü
                </label>
                <select
                  value={formData.price_per}
                  onChange={(e) => updateFormData('price_per', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  title="Fiyat türü seçiniz"
                >
                  <option value="total">Toplam Fiyat</option>
                  <option value="per_km">KM Başına</option>
                  <option value="per_ton">Ton Başına</option>
                  <option value="per_ton_km">Ton-KM Başına</option>
                  <option value="per_pallet">Palet Başına</option>
                  <option value="per_hour">Saat Başına</option>
                  <option value="per_day">Gün Başına</option>
                  <option value="per_container">Konteyner Başına</option>
                  <option value="per_teu">TEU Başına</option>
                  <option value="per_cbm">CBM Başına</option>
                  <option value="per_piece">Parça Başına</option>
                  <option value="per_vehicle">Araç Başına</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              💳 Ödeme Şartları
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Koşulları
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => updateFormData('payment_terms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                title="Ödeme koşulları seçiniz"
              >
                <option value="advance_payment">Peşin Ödeme</option>
                <option value="on_pickup">Alım Sırasında</option>
                <option value="after_delivery">Teslimat Sonrası</option>
                <option value="partial_advance">Kısmi Avans</option>
                <option value="bank_guarantee">Banka Garantisi</option>
                <option value="letter_of_credit">Akreditif</option>
                <option value="net_30">Net 30 Gün</option>
                <option value="net_60">Net 60 Gün</option>
                <option value="end_of_month">Ay Sonu</option>
                <option value="cash_on_delivery">Kapıda Ödeme</option>
                <option value="wire_transfer">Havale/EFT</option>
                <option value="check_payment">Çek ile Ödeme</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💬 Ek Mesaj
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Teklifinizle ilgili ek bilgiler..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              onClick={(e) => {
                if (isSubmitting) {
                  e.preventDefault();
                  return;
                }
              }}
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Güncelleniyor...' : 'Teklifi Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceOfferModal;
