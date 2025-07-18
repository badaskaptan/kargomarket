import React from 'react';
import { 
  X, 
  Ship, 
  MapPin, 
  Truck, 
  FileText, 
  Star,
  Eye,
  Phone,
  Calendar
} from 'lucide-react';
import type { Database } from '../../types/database-types';

type TransportService = Database['public']['Tables']['transport_services']['Row'];

interface TransportServiceDetailModalProps {
  service: TransportService;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Nakliye Hizmeti Detay Modal'ı
 * Gerçek transport_services tablosu şemasına göre tasarlandı
 */
const TransportServiceDetailModal: React.FC<TransportServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Tarih formatlama
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Durum badge'i
  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Pasif', color: 'bg-gray-100 text-gray-800' },
      'completed': { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-800' },
      'suspended': { label: 'Askıya Alındı', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Rating gösterimi
  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Transport mode ikonu
  const getTransportModeIcon = (mode: string) => {
    switch (mode) {
      case 'road': return '🚛';
      case 'sea': return '🚢';
      case 'air': return '✈️';
      case 'rail': return '🚂';
      default: return '🚛';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Ship className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{service.title}</h2>
                  <p className="text-blue-100 text-sm mt-1">Servis No: {service.service_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(service.status)}
                {service.is_featured && (
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    <Star className="h-4 w-4 inline mr-1" />
                    Öne Çıkan
                  </span>
                )}
                <button
                  onClick={onClose}
                  title="Kapat"
                  className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Temel Bilgiler */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Hizmet Bilgileri
            </h3>
            
            <div className="space-y-4">
              {service.description && (
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Açıklama</h4>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700 mb-1">Taşıma Modu</div>
                  <div className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">{getTransportModeIcon(service.transport_mode)}</span>
                    {service.transport_mode === 'road' ? 'Karayolu' :
                     service.transport_mode === 'sea' ? 'Deniz' :
                     service.transport_mode === 'air' ? 'Hava' :
                     service.transport_mode === 'rail' ? 'Demiryolu' : service.transport_mode}
                  </div>
                </div>
                
                {service.company_name && (
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-sm font-medium text-blue-700 mb-1">Şirket</div>
                    <div className="text-lg font-semibold text-gray-900">{service.company_name}</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Rota ve Lokasyon */}
          {(service.origin || service.destination) && (
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                <MapPin className="h-6 w-6 mr-3" />
                Rota Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.origin && (
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="text-sm font-medium text-green-700 mb-1">Başlangıç</div>
                    <div className="text-lg font-semibold text-gray-900">{service.origin}</div>
                  </div>
                )}
                
                {service.destination && (
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="text-sm font-medium text-green-700 mb-1">Varış</div>
                    <div className="text-lg font-semibold text-gray-900">{service.destination}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Araç/Taşıt Bilgileri */}
          <section className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <Truck className="h-6 w-6 mr-3" />
              Taşıt Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.vehicle_type && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Araç Tipi</div>
                  <div className="text-gray-900">{service.vehicle_type}</div>
                </div>
              )}
              
              {service.plate_number && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Plaka</div>
                  <div className="text-gray-900 font-mono">{service.plate_number}</div>
                </div>
              )}

              {service.capacity_value && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Kapasite</div>
                  <div className="text-gray-900">
                    {service.capacity_value} {service.capacity_unit || 'kg'}
                  </div>
                </div>
              )}

              {service.ship_name && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Gemi Adı</div>
                  <div className="text-gray-900">{service.ship_name}</div>
                </div>
              )}

              {service.imo_number && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">IMO Numarası</div>
                  <div className="text-gray-900 font-mono">{service.imo_number}</div>
                </div>
              )}

              {service.flight_number && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Uçuş Numarası</div>
                  <div className="text-gray-900 font-mono">{service.flight_number}</div>
                </div>
              )}

              {service.train_number && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Tren Numarası</div>
                  <div className="text-gray-900 font-mono">{service.train_number}</div>
                </div>
              )}
            </div>
          </section>

          {/* Müsaitlik */}
          {(service.available_from_date || service.available_until_date) && (
            <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
                <Calendar className="h-6 w-6 mr-3" />
                Müsaitlik
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.available_from_date && (
                  <div className="bg-white rounded-lg p-4 border border-orange-100">
                    <div className="text-sm font-medium text-orange-700 mb-1">Başlangıç Tarihi</div>
                    <div className="text-gray-900">{formatDate(service.available_from_date)}</div>
                  </div>
                )}
                
                {service.available_until_date && (
                  <div className="bg-white rounded-lg p-4 border border-orange-100">
                    <div className="text-sm font-medium text-orange-700 mb-1">Bitiş Tarihi</div>
                    <div className="text-gray-900">{formatDate(service.available_until_date)}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Değerlendirme ve İstatistikler */}
          <section className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center">
              <Star className="h-6 w-6 mr-3" />
              Değerlendirme ve İstatistikler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-yellow-100 text-center">
                <div className="flex justify-center mb-3">
                  {renderRating(Math.round(service.rating || 0))}
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {service.rating ? service.rating.toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Puan</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-yellow-100 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{service.rating_count || 0}</div>
                <div className="text-sm text-gray-600">Değerlendirme Sayısı</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-yellow-100 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{service.view_count || 0}</div>
                <div className="text-sm text-gray-600">Görüntülenme</div>
              </div>
            </div>
          </section>

          {/* İletişim Bilgileri */}
          {service.contact_info && (
            <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                <Phone className="h-6 w-6 mr-3" />
                İletişim Bilgileri
              </h3>
              
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <div className="text-sm font-medium text-indigo-700 mb-2">İletişim</div>
                <div className="text-gray-900 whitespace-pre-wrap">{service.contact_info}</div>
              </div>
            </section>
          )}

          {/* Belgeler */}
          {service.required_documents && service.required_documents.length > 0 && (
            <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
              <h3 className="text-xl font-semibold text-cyan-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Gerekli Belgeler
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {service.required_documents.map((doc, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-cyan-100">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="text-sm font-medium text-gray-900">{doc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sistem Bilgileri */}
          <section className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-3" />
              Sistem Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">Oluşturulma</div>
                <div className="text-gray-900">{formatDate(service.created_at)}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">Son Güncelleme</div>
                <div className="text-gray-900">{formatDate(service.updated_at)}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">Son Aktivite</div>
                <div className="text-gray-900">{formatDate(service.last_activity_at)}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {service.is_featured && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Öne Çıkan Hizmet
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                📊 {service.view_count || 0} Görüntülenme
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ {service.rating_count || 0} Değerlendirme
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TransportServiceDetailModal;
