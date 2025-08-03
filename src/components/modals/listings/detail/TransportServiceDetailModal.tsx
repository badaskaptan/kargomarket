import React from 'react';
import {
  X,
  Ship,
  MapPin,
  Truck,
  FileText,
  Star,
  Eye,
  Calendar
} from 'lucide-react';
import type { TransportService } from '../../../../types/database-types';
import { translateDocument, translateVehicleType } from '../../../../utils/translationUtils';


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
  // Dosya tipi kontrolü
  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf'];
    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';
    return 'file';
  };

  // Dosya adı çıkarma
  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'Dosya';
  };

  // Dosya indirme
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
                  <h2 className="text-2xl font-bold text-white">Nakliye Hizmeti Detayı</h2>
                  <p className="text-blue-100 text-sm mt-1">Servis No: {service.service_number}</p>
                  {service.title && (
                    <span className="text-blue-200 text-xs mt-1 block">{service.title}</span>
                  )}
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
              {/* Ortak Alanlar */}
              {service.vehicle_type && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Araç Tipi</div>
                  <div className="text-gray-900">{translateVehicleType(service.vehicle_type)}</div>
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

              {/* Karayolu */}
              {service.transport_mode === 'road' && service.plate_number && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-1">Plaka</div>
                  <div className="text-gray-900 font-mono">{service.plate_number}</div>
                </div>
              )}

              {/* Denizyolu */}
              {service.transport_mode === 'sea' && (
                <>
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
                  {service.mmsi_number && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">MMSI Numarası</div>
                      <div className="text-gray-900 font-mono">{service.mmsi_number}</div>
                    </div>
                  )}
                  {service.dwt && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">DWT (Deadweight Tonnage)</div>
                      <div className="text-gray-900">{service.dwt}</div>
                    </div>
                  )}
                  {service.gross_tonnage && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Gross Tonnage (GT)</div>
                      <div className="text-gray-900">{service.gross_tonnage}</div>
                    </div>
                  )}
                  {service.net_tonnage && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Net Tonnage (NT)</div>
                      <div className="text-gray-900">{service.net_tonnage}</div>
                    </div>
                  )}
                  {service.ship_dimensions && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Gemi Boyutları</div>
                      <div className="text-gray-900">{service.ship_dimensions}</div>
                    </div>
                  )}
                  {service.freight_type && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Yük Tipi</div>
                      <div className="text-gray-900">{service.freight_type}</div>
                    </div>
                  )}
                  {service.charterer_info && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Charterer Bilgisi</div>
                      <div className="text-gray-900">{service.charterer_info}</div>
                    </div>
                  )}
                  {service.ship_flag && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Bayrak Devleti</div>
                      <div className="text-gray-900">{service.ship_flag}</div>
                    </div>
                  )}
                  {service.home_port && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Ana Liman</div>
                      <div className="text-gray-900">{service.home_port}</div>
                    </div>
                  )}
                  {service.year_built && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">İnşa Yılı</div>
                      <div className="text-gray-900">{service.year_built}</div>
                    </div>
                  )}
                  {service.speed_knots && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Hız (knot)</div>
                      <div className="text-gray-900">{service.speed_knots}</div>
                    </div>
                  )}
                  {service.fuel_consumption && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Yakıt Tüketimi</div>
                      <div className="text-gray-900">{service.fuel_consumption}</div>
                    </div>
                  )}
                  {service.ballast_capacity && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Balast Kapasitesi</div>
                      <div className="text-gray-900">{service.ballast_capacity}</div>
                    </div>
                  )}
                </>
              )}

              {/* Havayolu */}
              {service.transport_mode === 'air' && (
                <>
                  {service.flight_number && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Uçuş Numarası</div>
                      <div className="text-gray-900 font-mono">{service.flight_number}</div>
                    </div>
                  )}
                  {service.aircraft_type && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Uçak Tipi</div>
                      <div className="text-gray-900">{service.aircraft_type}</div>
                    </div>
                  )}
                  {service.max_payload && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Maksimum Payload (kg)</div>
                      <div className="text-gray-900">{service.max_payload}</div>
                    </div>
                  )}
                  {service.cargo_volume && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Kargo Hacmi (m³)</div>
                      <div className="text-gray-900">{service.cargo_volume}</div>
                    </div>
                  )}
                </>
              )}

              {/* Demiryolu */}
              {service.transport_mode === 'rail' && (
                <>
                  {service.train_number && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Tren Numarası</div>
                      <div className="text-gray-900 font-mono">{service.train_number}</div>
                    </div>
                  )}
                  {service.wagon_count && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Vagon Sayısı</div>
                      <div className="text-gray-900">{service.wagon_count}</div>
                    </div>
                  )}
                  {service.wagon_types && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="text-sm font-medium text-purple-700 mb-1">Vagon Tipleri</div>
                      <div className="text-gray-900">{Array.isArray(service.wagon_types) ? service.wagon_types.join(', ') : service.wagon_types}</div>
                    </div>
                  )}
                </>
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

          {/* İlan Bilgileri */}
          <section className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-3" />
              İlan Bilgileri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">Oluşturulma Tarihi</div>
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
            </div>
          </section>

          {/* İletişim Bilgileri */}
          {service.contact_info && (
            <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                İletişim Bilgileri
              </h3>              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <div className="text-sm font-medium text-indigo-700 mb-2">İletişim</div>
                <div className="text-gray-900 whitespace-pre-wrap">{service.contact_info}</div>
              </div>
            </section>
          )}

          {/* Belgeler */}

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
                      <div className="text-sm font-medium text-gray-900">{translateDocument(doc)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Yüklenen Dosyalar ve Resimler */}
          {((service.document_urls && service.document_urls.length > 0) || (service.image_urls && service.image_urls.length > 0)) && (
            <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Yüklenen Dosyalar ve Resimler
              </h3>
              {/* Resimler */}
              {service.image_urls && service.image_urls.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Resimler ({service.image_urls.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {service.image_urls.map((imageUrl: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <img
                            src={imageUrl}
                            alt={`Hizmet resmi ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdWMTdBMiAyIDAgMCAwIDUgMTlIMTVNMjEgMTVMMTggMTJMMTUgMTVNMjEgMTlMMTggMTZMMTUgMTkiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate flex-1">
                            {getFileName(imageUrl)}
                          </p>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => window.open(imageUrl, '_blank')}
                              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                              title="Büyük boyutta görüntüle"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDownload(imageUrl, getFileName(imageUrl))}
                              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                              title="İndir"
                            >
                              <FileText className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Dökümanlar */}
              {service.document_urls && service.document_urls.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Dökümanlar ({service.document_urls.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.document_urls.map((docUrl: string, index: number) => {
                      const fileName = getFileName(docUrl);
                      const fileType = getFileType(docUrl);
                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-purple-100 group hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {fileType === 'document' ? (
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-red-600" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fileType === 'document' ? 'Döküman' : 'Dosya'}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-3">
                              <button
                                onClick={() => window.open(docUrl, '_blank')}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Görüntüle"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(docUrl, fileName)}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                title="İndir"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportServiceDetailModal;
