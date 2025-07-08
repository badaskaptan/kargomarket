import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Pause, 
  Play, 
  Trash2, 
  Eye,
  MapPin,
  Package,
  Calendar,
  Loader2,
  Download,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import type { ExtendedListing } from '../../types/database-types';

const MyListingsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const { user } = useAuth();
  const [listings, setListings] = useState<ExtendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);

  // Kullanıcının ilanlarını yükle
  useEffect(() => {
    const loadUserListings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userListings = await ListingService.getUserListings(user.id);
        setListings(userListings);
        console.log('✅ User listings loaded:', userListings);
      } catch (error) {
        console.error('Error loading user listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserListings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'active' ? 'Aktif' : 
         status === 'paused' ? 'Duraklatılmış' : 
         status === 'completed' ? 'Tamamlandı' :
         status === 'cancelled' ? 'İptal' : 
         status === 'draft' ? 'Taslak' :
         status === 'expired' ? 'Süresi Dolmuş' : status}
      </span>
    );
  };

  const getListingTypeBadge = (type: string) => {
    const typeClasses = {
      'load_listing': 'bg-blue-100 text-blue-800',
      'shipment_request': 'bg-orange-100 text-orange-800',
      'transport_service': 'bg-purple-100 text-purple-800'
    };
    
    const typeLabels = {
      'load_listing': '📦 Yük İlanı',
      'shipment_request': '🚚 Nakliye Talebi',
      'transport_service': '🚛 Nakliye Hizmeti'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-800'}`}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">İlanlarınız yükleniyor...</span>
        </div>
      </div>
    );
  }

  // --- FONKSİYONLAR ---
  const handleEditListing = () => {
    setActiveSection('my-listings'); // veya uygun başka bir ActiveSection değeri
    // Eğer context ile seçili ilanı paylaşmak gerekiyorsa burada eklenebilir
    // ör: setSelectedListingForEdit(listing)
  };

  const handleTogglePause = async (listing: ExtendedListing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      await ListingService.updateListing(listing.id, { status: newStatus });
      setListings((prev) => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    } catch {
      alert('İlan durumu güncellenemedi.');
    }
  };

  const handleDeleteListing = async (listing: ExtendedListing) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    try {
      await ListingService.deleteListing(listing.id);
      setListings((prev) => prev.filter(l => l.id !== listing.id));
    } catch {
      alert('İlan silinemedi.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlanlarım</h1>
          <p className="text-gray-600">Yayınladığınız tüm ilanları buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => setActiveSection('create-load-listing')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlan Oluştur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif İlan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Pause className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duraklatılan</p>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="İlan ara... (başlık, nereden, nereye)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arama sonucu bulunamadı</h3>
              <p className="text-gray-600">"{searchTerm}" için hiçbir ilan bulunamadı.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hiç ilanınız yok</h3>
              <p className="text-gray-600 mb-6">İlk ilanınızı oluşturarak başlayın!</p>
              <button
                onClick={() => setActiveSection('create-load-listing')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlan Oluştur
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan Bilgisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center mb-2">
                          {getListingTypeBadge(listing.listing_type)}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {listing.title}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          #{listing.listing_number || listing.id.substring(0, 8)}
                        </div>
                        {listing.description && (
                          <div className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                            {listing.description}
                          </div>
                        )}
                        {listing.required_documents && Array.isArray(listing.required_documents) && listing.required_documents.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            📋 {listing.required_documents.length} evrak gerekli
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="max-w-xs truncate">
                          {listing.origin} → {listing.destination}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-xs text-gray-500">Oluşturulma</div>
                        <div>{formatDate(listing.created_at)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="İlanı Görüntüle"
                          aria-label="İlanı Görüntüle"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="İlanı Düzenle"
                          aria-label="İlanı Düzenle"
                          onClick={() => handleEditListing()}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {listing.status === 'active' ? (
                          <button 
                            className="text-orange-600 hover:text-orange-900"
                            title="İlanı Duraklat"
                            aria-label="İlanı Duraklat"
                            onClick={() => handleTogglePause(listing)}
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="İlanı Etkinleştir"
                            aria-label="İlanı Etkinleştir"
                            onClick={() => handleTogglePause(listing)}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="İlanı Sil"
                          aria-label="İlanı Sil"
                          onClick={() => handleDeleteListing(listing)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listing Detail Modal (Önizleme) */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            >
              ×
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Kolon */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {selectedListing.listing_type}
                    </div>
                    <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Sizin İlanınız
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedListing.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={18} className="mr-2 text-primary-500" />
                    <span className="text-lg">{selectedListing.origin} → {selectedListing.destination}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{selectedListing.created_at ? new Date(selectedListing.created_at).toLocaleDateString('tr-TR') : ''} yayınlandı</div>
                  <div className="text-xs text-gray-500 font-mono mb-2">İlan No: #{selectedListing.listing_number || selectedListing.id?.toString().substring(0, 8)}</div>
                  {/* İlan Sahibi ve İletişim Bilgileri */}
                  <div className="bg-primary-50 rounded-lg p-4 mb-4 border border-primary-200">
                    <div className="mb-2">
                      <span className="font-semibold text-primary-800">İlan Sahibi:</span> {selectedListing.owner_name || '-'}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-primary-800">Telefon:</span> {selectedListing.owner_phone || '-'}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-primary-800">E-posta:</span> {selectedListing.owner_email || '-'}
                    </div>
                  </div>
                  {/* Nakliye Kime Ait */}
                  <div className="mb-4">
                    <span className="font-semibold text-gray-700">Nakliye Kime Ait:</span> {selectedListing.transport_responsible || '-'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Yük Detayları</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Yük Tipi:</span>
                      <div className="font-medium">{selectedListing.load_type}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Ağırlık:</span>
                      <div className="font-medium">{selectedListing.weight_value} {selectedListing.weight_unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Hacim:</span>
                      <div className="font-medium">{selectedListing.volume_value} {selectedListing.volume_unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Taşıma Modu:</span>
                      <div className="font-medium capitalize">{selectedListing.transport_mode}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Açıklama</h4>
                  <p className="text-gray-700">{selectedListing.description}</p>
                </div>
                {selectedListing.required_documents && Array.isArray(selectedListing.required_documents) && selectedListing.required_documents.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Gerekli Evraklar</h4>
                    <ul className="list-disc pl-5 text-blue-800 text-sm">
                      {selectedListing.required_documents.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Sağ Kolon */}
              <div>
                {/* Harita */}
                {/* Burada LiveMap veya RealMap kullanılabilir, örnek olarak LiveMap: */}
                {/* <LiveMap coordinates={[selectedListing.origin, selectedListing.destination]} height="320px" showRoute={true} /> */}
                <div className="mb-6 h-80 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center text-gray-400">
                  Harita entegrasyonu (opsiyonel)
                </div>
                {/* Fiyat Bilgisi */}
                <div className="bg-white border-2 border-primary-200 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{selectedListing.price_amount ? `${selectedListing.price_amount} ${selectedListing.price_currency}` : '-'}</div>
                  </div>
                </div>

                {/* Yüklenen Resimler */}
                {selectedListing.image_urls && Array.isArray(selectedListing.image_urls) && selectedListing.image_urls.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Yük Görselleri ({selectedListing.image_urls.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedListing.image_urls.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`Yük görseli ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(imageUrl, '_blank')}
                                className="p-2 bg-white bg-opacity-90 rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                                title="Büyük boyutta görüntüle"
                              >
                                <ExternalLink size={16} />
                              </button>
                              <a
                                href={imageUrl}
                                download={`yuk-gorseli-${index + 1}.jpg`}
                                className="p-2 bg-white bg-opacity-90 rounded-full text-gray-700 hover:text-green-600 transition-colors"
                                title="İndir"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yüklenen Evraklar */}
                {selectedListing.document_urls && Array.isArray(selectedListing.document_urls) && selectedListing.document_urls.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Yüklenen Evraklar ({selectedListing.document_urls.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedListing.document_urls.map((documentUrl, index) => {
                        const fileName = documentUrl.split('/').pop() || `evrak-${index + 1}`;
                        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                        
                        const getFileIcon = (ext: string) => {
                          if (['pdf'].includes(ext)) return '📄';
                          if (['doc', 'docx'].includes(ext)) return '📝';
                          if (['xls', 'xlsx'].includes(ext)) return '📊';
                          if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
                          return '📎';
                        };

                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center flex-1">
                              <span className="text-2xl mr-3">{getFileIcon(fileExtension)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-gray-500 uppercase">
                                  {fileExtension} dosyası
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => window.open(documentUrl, '_blank')}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Görüntüle"
                              >
                                <Eye size={16} />
                              </button>
                              <a
                                href={documentUrl}
                                download={fileName}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="İndir"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Güvenlik Bilgileri */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Güvenlik Bilgileri</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Doğrulanmış üye
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Sigorta güvencesi
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Güvenli ödeme sistemi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsSection;
