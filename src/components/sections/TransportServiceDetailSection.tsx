import React from 'react';
import { Truck, Ship, Plane, Train } from 'lucide-react';

interface TransportServiceDetailProps {
  listing: {
    listing_number: string;
    title: string;
    description: string;
    origin: string;
    destination: string;
    transport_mode: string;
    vehicle_types: string[];
    capacity: string;
    available_from_date: string;
    status: string;
    metadata: {
      contact_info?: {
        contact?: string;
        company_name?: string;
      };
      transport_details?: {
        plate_number?: string;
        ship_name?: string;
        imo_number?: string;
        mmsi_number?: string;
        dwt?: string;
        ship_dimensions?: string;
        laycan_start?: string;
        laycan_end?: string;
        freight_type?: string;
        charterer_info?: string;
        flight_number?: string;
        train_number?: string;
      };
      required_documents?: string[];
    };
    // Diğer alanlar eklenebilir
  };
}

const TransportServiceDetailSection: React.FC<TransportServiceDetailProps> = ({ listing }) => {
  const { metadata } = listing;
  const transportDetails = metadata?.transport_details || {};
  const contactInfo = metadata?.contact_info || {};
  const requiredDocuments = metadata?.required_documents || [];

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

  return (
    <div className="rounded-3xl shadow-lg p-8 bg-white border border-gray-200 space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-lg font-bold text-gray-900">{listing.listing_number}</span>
        <span className="text-xl font-bold text-gray-900">{listing.title}</span>
        <span className="ml-auto px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{listing.status}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <div className="text-gray-800 mb-2">{listing.description}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Taşıma Modu</label>
          <div className="mb-2">{getTransportModeDisplay(listing.transport_mode)}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kalkış Bölgesi</label>
          <div className="text-gray-800 mb-2">{listing.origin}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varış Bölgesi</label>
          <div className="text-gray-800 mb-2">{listing.destination}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Araç Tipi</label>
          <div className="text-gray-800 mb-2">{listing.vehicle_types?.join(', ')}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
          <div className="text-gray-800 mb-2">{listing.capacity}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Boşta Olma Tarihi</label>
          <div className="text-gray-800 mb-2">{listing.available_from_date}</div>
        </div>
        {/* İletişim Bilgileri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Bilgileri</label>
          <div className="text-gray-800 mb-2">{contactInfo?.contact}</div>
          {contactInfo?.company_name && (
            <div className="text-gray-600 text-xs">Firma: {contactInfo?.company_name}</div>
          )}
        </div>
        {/* Modlara özel detaylar */}
        {listing.transport_mode === 'road' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plaka / Şasi No</label>
            {/* Dinamik metadata alanları - taşıma moduna göre uygun kolonlar */}
            {transportDetails?.plate_number && (
              <div className="text-gray-800 mb-2">Plaka/Şasi: {transportDetails.plate_number}</div>
            )}
          </div>
        )}
        {listing.transport_mode === 'sea' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gemi Adı</label>
              {transportDetails?.ship_name && (
                <div className="text-gray-800 mb-2">Gemi Adı: {transportDetails.ship_name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMO No</label>
              {transportDetails?.imo_number && (
                <div className="text-gray-800 mb-2">IMO No: {transportDetails.imo_number}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MMSI No</label>
              {transportDetails?.mmsi_number && (
                <div className="text-gray-800 mb-2">MMSI No: {transportDetails.mmsi_number}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DWT / Tonaj</label>
              {transportDetails?.dwt && (
                <div className="text-gray-800 mb-2">DWT/Tonaj: {transportDetails.dwt}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boyutlar</label>
              {transportDetails?.ship_dimensions && (
                <div className="text-gray-800 mb-2">Boyutlar: {transportDetails.ship_dimensions}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laycan Başlangıç</label>
              {transportDetails?.laycan_start && (
                <div className="text-gray-800 mb-2">Laycan Başlangıç: {transportDetails.laycan_start}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laycan Bitiş</label>
              {transportDetails?.laycan_end && (
                <div className="text-gray-800 mb-2">Laycan Bitiş: {transportDetails.laycan_end}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Navlun Tipi</label>
              {transportDetails?.freight_type && (
                <div className="text-gray-800 mb-2">Navlun Tipi: {transportDetails.freight_type}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charterer / Broker</label>
              {transportDetails?.charterer_info && (
                <div className="text-gray-800 mb-2">Charterer/Broker: {transportDetails.charterer_info}</div>
              )}
            </div>
          </>
        )}
        {listing.transport_mode === 'air' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uçuş Numarası</label>
            {transportDetails?.flight_number && (
              <div className="text-gray-800 mb-2">Uçuş Numarası: {transportDetails.flight_number}</div>
            )}
          </div>
        )}
        {listing.transport_mode === 'rail' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tren/Kompozisyon No</label>
            {transportDetails?.train_number && (
              <div className="text-gray-800 mb-2">Tren/Kompozisyon No: {transportDetails.train_number}</div>
            )}
          </div>
        )}
      </div>
      {/* Evraklar */}
      {requiredDocuments?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gerekli Evraklar</label>
          <div className="text-gray-800 mb-2">
            {requiredDocuments.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportServiceDetailSection;
