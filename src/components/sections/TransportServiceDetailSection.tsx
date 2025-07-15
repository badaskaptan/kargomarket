import React from 'react';
import { Truck, Ship, Plane, Train, MapPin, Calendar, Package, Building, Phone, FileText } from 'lucide-react';
import type { ExtendedListing } from '../../types/database-types';

interface TransportServiceDetailProps {
  listing: ExtendedListing;
}

const TransportServiceDetailSection: React.FC<TransportServiceDetailProps> = ({ listing }) => {
  const { metadata } = listing;
  const transportDetails = (metadata as Record<string, unknown>)?.transport_details as Record<string, unknown> | undefined;
  const contactInfo = (metadata as Record<string, unknown>)?.contact_info as Record<string, unknown> | undefined;

  // Taşıma moduna göre ikon ve Türkçe metin
  function getTransportModeDisplay(mode: string) {
    switch (mode) {
      case 'road':
        return <span className="flex items-center gap-2 font-semibold text-yellow-700"><Truck className="w-6 h-6 text-yellow-500" />Karayolu</span>;
      case 'sea':
        return <span className="flex items-center gap-2 font-semibold text-blue-700"><Ship className="w-6 h-6 text-blue-500" />Denizyolu</span>;
      case 'air':
        return <span className="flex items-center gap-2 font-semibold text-cyan-700"><Plane className="w-6 h-6 text-cyan-500" />Havayolu</span>;
      case 'rail':
        return <span className="flex items-center gap-2 font-semibold text-gray-700"><Train className="w-6 h-6 text-gray-500" />Demiryolu</span>;
      default:
        return <span className="text-gray-500">Bilinmiyor</span>;
    }
  }

  // Kapasite bilgisini taşıma moduna göre akıllı şekilde getir
  function getCapacityInfo(): string {
    // 1. Önce legacy capacity alanını kontrol et (mevcut veriler için)
    const legacyCapacity = (listing as Record<string, unknown>).capacity;
    if (legacyCapacity && legacyCapacity !== null && legacyCapacity !== '') {
      return String(legacyCapacity);
    }

    // 2. Ana listing alanlarını kontrol et (yeni veriler için)
    if (listing.weight_value && listing.weight_value > 0) {
      const unit = listing.weight_unit || 'kg';
      return `${listing.weight_value} ${unit}`;
    }

    if (listing.volume_value && listing.volume_value > 0) {
      const unit = listing.volume_unit || 'm³';
      return `${listing.volume_value} ${unit}`;
    }

    // 3. Metadata'daki genel capacity kontrolü
    if (transportDetails?.capacity) {
      return String(transportDetails.capacity);
    }

    // 4. Taşıma moduna özel alanları kontrol et (son çare)
    switch (listing.transport_mode) {
      case 'road':
        if (transportDetails?.truck_capacity) {
          return String(transportDetails.truck_capacity);
        }
        if (transportDetails?.load_capacity) {
          return String(transportDetails.load_capacity);
        }
        break;
        
      case 'rail':
        if (transportDetails?.wagon_capacity) {
          return String(transportDetails.wagon_capacity);
        }
        if (transportDetails?.train_capacity) {
          return String(transportDetails.train_capacity);
        }
        break;
        
      case 'sea':
        if (transportDetails?.ship_capacity) {
          return String(transportDetails.ship_capacity);
        }
        if (transportDetails?.cargo_capacity) {
          return String(transportDetails.cargo_capacity);
        }
        break;
        
      case 'air':
        if (transportDetails?.payload) {
          return String(transportDetails.payload);
        }
        if (transportDetails?.cargo_weight) {
          return String(transportDetails.cargo_weight);
        }
        break;
    }

    return 'Belirtilmemiş';
  }

  // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD-MM-YYYY)
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Belirtilmemiş';
    
    // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);
    
    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year}`;
    }
    
    // Eğer farklı bir formatta gelirse, olduğu gibi döndür
    return dateString;
  }

  // Araç tipi kodunu Türkçe'ye çevir (emoji ile)
  function getVehicleTypeLabel(vehicleCode: string): string {
    const vehicleTypeMapping: { [key: string]: string } = {
      // Road vehicles
      'truck_3_5_open': '🚚 Kamyon - 3.5 Ton (Açık Kasa)',
      'truck_3_5_closed': '🚚 Kamyon - 3.5 Ton (Kapalı Kasa)',
      'truck_5_open': '🚚 Kamyon - 5 Ton (Açık Kasa)',
      'truck_5_closed': '🚚 Kamyon - 5 Ton (Kapalı Kasa)',
      'truck_10_open': '🚛 Kamyon - 10 Ton (Açık Kasa)',
      'truck_10_closed': '🚛 Kamyon - 10 Ton (Kapalı Kasa)',
      'truck_10_tent': '🚛 Kamyon - 10 Ton (Tenteli)',
      'truck_15_open': '🚛 Kamyon - 15 Ton (Açık Kasa)',
      'truck_15_closed': '🚛 Kamyon - 15 Ton (Kapalı Kasa)',
      'truck_15_tent': '🚛 Kamyon - 15 Ton (Tenteli)',
      'tir_standard': '🚛 Tır (Standart Dorse) - 90m³ / 40t',
      'tir_mega': '🚛 Tır (Mega Dorse) - 100m³ / 40t',
      'tir_jumbo': '🚛 Tır (Jumbo Dorse) - 120m³ / 40t',
      'tir_tent': '🚛 Tır (Tenteli Dorse) - 40t',
      'tir_frigo': '🧊 Tır (Frigorifik Dorse - Isı Kontrollü) - 40t',
      'tir_container': '📦 Tır (Konteyner Taşıyıcı) - 40t',
      'tir_platform': '🏗️ Tır (Platform) - 40t',
      'tir_frigo_dual': '🧊 Tır (Frigorifik Çift Isı) - 40t',
      'van_3': '🚐 Kargo Van - 3m³ (1000kg)',
      'van_6': '🚐 Kargo Van - 6m³ (1500kg)',
      'van_10': '🚐 Kargo Van - 10m³ (2000kg)',
      'van_15': '🚐 Kargo Van - 15m³ (2500kg)',
      
      // Sea vehicles
      'container_20dc': '🚢 20\' Standart (20DC) - 33m³ / 28t',
      'container_40dc': '🚢 40\' Standart (40DC) - 67m³ / 28t',
      'container_40hc': '🚢 40\' Yüksek (40HC) - 76m³ / 28t',
      'container_20ot': '🚢 20\' Open Top - 32m³ / 28t',
      'container_40ot': '🚢 40\' Open Top - 66m³ / 28t',
      'container_20fr': '🚢 20\' Flat Rack - 28t',
      'container_40fr': '🚢 40\' Flat Rack - 40t',
      'container_20rf': '❄️ 20\' Reefer - 28m³ / 25t',
      'container_40rf': '❄️ 40\' Reefer - 60m³ / 25t',
      'bulk_handysize': '🚢 Handysize (10,000-35,000 DWT)',
      'bulk_handymax': '🚢 Handymax (35,000-60,000 DWT)',
      'bulk_panamax': '🚢 Panamax (60,000-80,000 DWT)',
      'bulk_capesize': '🚢 Capesize (80,000+ DWT)',
      'general_small': '🚢 Küçük Tonaj (1,000-5,000 DWT)',
      'general_medium': '🚢 Orta Tonaj (5,000-15,000 DWT)',
      'general_large': '🚢 Büyük Tonaj (15,000+ DWT)',
      'tanker_product': '🛢️ Ürün Tankeri (10,000-60,000 DWT)',
      'tanker_chemical': '🛢️ Kimyasal Tanker (5,000-40,000 DWT)',
      'tanker_crude': '🛢️ Ham Petrol Tankeri (60,000+ DWT)',
      'tanker_lpg': '🛢️ LPG Tankeri (5,000-80,000 m³)',
      'tanker_lng': '🛢️ LNG Tankeri (150,000-180,000 m³)',
      'roro_small': '🚗 Küçük RO-RO (100-200 araç)',
      'roro_medium': '🚗 Orta RO-RO (200-500 araç)',
      'roro_large': '🚗 Büyük RO-RO (500+ araç)',
      'ferry_cargo': '⛴️ Kargo Feribotu',
      'ferry_mixed': '⛴️ Karma Feribot (Yolcu+Yük)',
      'cargo_small': '🚤 Küçük Yük Teknesi (500-1,000 DWT)',
      'cargo_large': '🚤 Büyük Yük Teknesi (1,000+ DWT)',
      
      // Air vehicles
      'standard_cargo': '✈️ Standart Kargo',
      'large_cargo': '✈️ Büyük Hacimli Kargo',
      'special_cargo': '✈️ Özel Kargo',
      
      // Rail vehicles
      'open_wagon': '🚂 Açık Yük Vagonu',
      'closed_wagon': '🚂 Kapalı Yük Vagonu',
      'container_wagon': '🚂 Konteyner Vagonu',
      'tanker_wagon': '🚂 Tanker Vagonu'
    };

    return vehicleTypeMapping[vehicleCode] || `🚛 ${vehicleCode}`;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              {listing.transport_mode === 'road' && <Truck className="w-6 h-6" />}
              {listing.transport_mode === 'sea' && <Ship className="w-6 h-6" />}
              {listing.transport_mode === 'air' && <Plane className="w-6 h-6" />}
              {listing.transport_mode === 'rail' && <Train className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{listing.title}</h2>
              <p className="text-white/80 text-sm mt-1">İlan No: {listing.listing_number}</p>
            </div>
          </div>
          <div className="bg-green-500/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-white font-medium capitalize">{listing.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Description */}
        {listing.description && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Açıklama
            </h3>
            <p className="text-blue-800 leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Transport Mode */}
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            Taşıma Modu
          </h3>
          <div>{getTransportModeDisplay(listing.transport_mode)}</div>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Kalkış Bölgesi
            </h3>
            <p className="text-green-800 text-lg font-medium">{listing.origin}</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Varış Bölgesi
            </h3>
            <p className="text-orange-800 text-lg font-medium">{listing.destination}</p>
          </div>
        </div>

        {/* Vehicle and Capacity Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Araç Tipi
            </h3>
            <p className="text-purple-800 font-medium">
              {listing.vehicle_types && listing.vehicle_types.length > 0 
                ? listing.vehicle_types.map(vehicleCode => getVehicleTypeLabel(vehicleCode)).join(', ')
                : 'Belirtilmemiş'
              }
            </p>
          </div>
          
          <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="text-lg font-semibold text-cyan-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {listing.transport_mode === 'sea' ? 'Gross Tonnage' : 'Kapasite'}
            </h3>
            <p className="text-cyan-800 text-lg font-medium">{getCapacityInfo()}</p>
          </div>
        </div>

        {/* Date Information */}
        {listing.transport_mode !== 'sea' ? (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Boşta Olma Tarihi
            </h3>
            <p className="text-yellow-800 font-medium">
              {formatDate(listing.available_from_date)}
            </p>
          </div>
        ) : null}

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            İletişim Bilgileri
          </h3>
          <div className="space-y-3">
            {contactInfo?.contact_info ? (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">{String(contactInfo.contact_info)}</span>
              </div>
            ) : null}
            {contactInfo?.company_name ? (
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800 font-medium">{String(contactInfo.company_name)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Required Documents */}
        {listing.required_documents && listing.required_documents.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Gerekli Evraklar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {listing.required_documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-amber-800 text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport Mode Specific Details */}
        {(listing.transport_mode === 'road' && transportDetails?.plate_number) ? (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Karayolu Detayları
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-yellow-700">Plaka:</span>
              <span className="text-yellow-800 font-medium">{String(transportDetails.plate_number)}</span>
            </div>
          </div>
        ) : null}

        {listing.transport_mode === 'sea' && (
          <>
            {/* Laycan Information for Sea Transport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Laycan Başlangıç
                </h3>
                <p className="text-blue-800 font-medium">
                  {transportDetails?.laycan_start 
                    ? formatDate(String(transportDetails.laycan_start))
                    : formatDate(listing.available_from_date)
                  }
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Laycan Bitiş
                </h3>
                <p className="text-blue-800 font-medium">
                  {transportDetails?.laycan_end 
                    ? formatDate(String(transportDetails.laycan_end))
                    : 'Belirtilmemiş'
                  }
                </p>
              </div>
            </div>

            {/* Sea Transport Details */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Ship className="w-5 h-5 mr-2" />
                Denizyolu Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transportDetails?.ship_name ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Gemi Adı:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.ship_name)}</span>
                  </div>
                ) : null}
                {transportDetails?.imo_number ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">IMO No:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.imo_number)}</span>
                  </div>
                ) : null}
                {transportDetails?.mmsi_number ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">MMSI No:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.mmsi_number)}</span>
                  </div>
                ) : null}
                {transportDetails?.dwt ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">DWT:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.dwt)}</span>
                  </div>
                ) : null}
                {transportDetails?.ship_dimensions ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Boyutlar:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.ship_dimensions)}</span>
                  </div>
                ) : null}
                {transportDetails?.freight_type ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Navlun Tipi:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.freight_type)}</span>
                  </div>
                ) : null}
                {transportDetails?.charterer_info ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Charterer:</span>
                    <span className="text-blue-800 font-medium">{String(transportDetails.charterer_info)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}

        {(listing.transport_mode === 'air' && transportDetails?.flight_number) ? (
          <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="text-lg font-semibold text-cyan-900 mb-4 flex items-center">
              <Plane className="w-5 h-5 mr-2" />
              Havayolu Detayları
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-cyan-700">Uçuş Numarası:</span>
              <span className="text-cyan-800 font-medium">{String(transportDetails.flight_number)}</span>
            </div>
          </div>
        ) : null}

        {(listing.transport_mode === 'rail' && transportDetails?.train_number) ? (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Train className="w-5 h-5 mr-2" />
              Demiryolu Detayları
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Tren/Kompozisyon No:</span>
              <span className="text-gray-800 font-medium">{String(transportDetails.train_number)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TransportServiceDetailSection;
