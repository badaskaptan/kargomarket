import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Pause, 
  Play, 
  Trash2, 
  Eye,
  Star,
  Archive,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  MapPin,
  Package,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const MyListingsSection: React.FC = () => {
  const { setActiveSection, userRole } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    price: '',
    transportResponsible: '',
    origin: '',
    destination: '',
    description: ''
  });

  // Simulated current user ID - gerçek uygulamada authentication context'ten gelecek
  const currentUserId = 'user_123'; // Bu değer gerçek uygulamada auth context'ten gelecek

  // İlanlar state olarak tanımlandı
  const [listings, setListings] = useState([
    {
      id: 'ILN2506230001',
      title: 'İstanbul-Ankara Tekstil Yükü',
      type: 'Tekstil',
      route: 'İstanbul → Ankara',
      publishDate: '15.06.2025',
      remainingDays: '6 gün',
      status: 'active',
      statusLabel: 'Aktif',
      listingType: 'Yük İlanı',
      price: '₺4.500',
      transportResponsible: 'Alıcı',
      origin: 'İstanbul, Türkiye',
      destination: 'Ankara, Türkiye',
      description: 'Kaliteli tekstil ürünleri, paletli yük. Yükleme ve boşaltma için forklift gerekli.',
      weight: '15 ton',
      volume: '25 m³',
      loadingDate: '2025-06-20',
      deliveryDate: '2025-06-22',
      loadType: 'Tekstil Ürünleri',
      offerType: 'Fiyat Belirleyerek',
      transportMode: 'Karayolu',
      vehicleType: 'Tır (Standart Dorse)',
      documents: ['Fatura', 'İrsaliye', 'Sigorta Poliçesi'],
      ownerId: currentUserId, // Kullanıcının kendi ilanı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    },
    {
      id: 'NT2506230002',
      title: 'Ankara-Konya Gıda Taşıma',
      type: 'Gıda',
      route: 'Ankara → Konya',
      publishDate: '14.06.2025',
      remainingDays: '5 gün',
      status: 'active',
      statusLabel: 'Aktif',
      listingType: 'Nakliye Talebi',
      price: '₺3.200',
      transportResponsible: 'Satıcı',
      origin: 'Ankara, Türkiye',
      destination: 'Konya, Türkiye',
      description: 'Organik gıda ürünleri nakliye talebi. Soğuk zincir gerektiren ürünler.',
      weight: '12 ton',
      volume: '20 m³',
      loadingDate: '2025-06-21',
      deliveryDate: '2025-06-23',
      loadType: 'Ambalajlı Gıda Ürünleri',
      offerType: 'Doğrudan Teklif',
      transportMode: 'Karayolu',
      vehicleType: 'Frigorifik Araç',
      documents: ['Gıda Sertifikası', 'Soğuk Zincir Belgesi'],
      ownerId: currentUserId, // Kullanıcının kendi ilanı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    },
    {
      id: 'NK2506230003',
      title: 'İzmir-Antalya Elektronik Eşya',
      type: 'Elektronik',
      route: 'İzmir → Antalya',
      publishDate: '12.06.2025',
      remainingDays: '3 gün',
      status: 'active',
      statusLabel: 'Aktif',
      listingType: 'Nakliye İlanı',
      price: '₺5.800',
      transportResponsible: 'Nakliyeci',
      origin: 'İzmir, Türkiye',
      destination: 'Antalya, Türkiye',
      description: 'Hassas elektronik ürünler için özel ambalajlama ile nakliye hizmeti.',
      capacity: '30 ton / 90 m³',
      availableDate: '2025-06-25',
      companyName: 'Yılmaz Nakliyat A.Ş.',
      transportMode: 'Karayolu',
      vehicleType: 'Kapalı Kasa Kamyon',
      features: ['Sigorta Dahil', 'Takip Sistemi', 'Hassas Yük Taşıma'],
      ownerId: currentUserId, // Kullanıcının kendi ilanı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    },
    {
      id: 'ILN2506230004',
      title: 'Bursa-İzmir Mobilya Taşıma',
      type: 'Mobilya',
      route: 'Bursa → İzmir',
      publishDate: '10.06.2025',
      remainingDays: '-',
      status: 'completed',
      statusLabel: 'Tamamlandı',
      listingType: 'Yük İlanı',
      price: '₺2.800',
      transportResponsible: 'Alıcı',
      origin: 'Bursa, Türkiye',
      destination: 'İzmir, Türkiye',
      description: 'Mobilya ve dekorasyon ürünleri. Özel ambalajlama gerekli.',
      weight: '8 ton',
      volume: '35 m³',
      loadingDate: '2025-06-15',
      deliveryDate: '2025-06-16',
      loadType: 'Mobilya / Dekorasyon Ürünleri',
      offerType: 'Fiyat Belirleyerek',
      transportMode: 'Karayolu',
      vehicleType: 'Tenteli Kamyon',
      documents: ['Fatura', 'Ambalaj Listesi'],
      ownerId: currentUserId, // Kullanıcının kendi ilanı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    },
    {
      id: 'NT2506230005',
      title: 'Adana-Mersin İnşaat Malzemesi',
      type: 'İnşaat Malzemesi',
      route: 'Adana → Mersin',
      publishDate: '08.06.2025',
      remainingDays: '-',
      status: 'paused',
      statusLabel: 'Pasif',
      listingType: 'Nakliye Talebi',
      price: '₺2.100',
      transportResponsible: 'Satıcı',
      origin: 'Adana, Türkiye',
      destination: 'Mersin, Türkiye',
      description: 'Çimento ve demir malzemeler nakliye talebi. Açık kasa araç uygun.',
      weight: '25 ton',
      volume: '15 m³',
      loadingDate: '2025-06-18',
      deliveryDate: '2025-06-19',
      loadType: 'İnşaat Malzemeleri',
      offerType: 'Doğrudan Teklif',
      transportMode: 'Karayolu',
      vehicleType: 'Açık Kasa Kamyon',
      documents: ['İnşaat Ruhsatı', 'Malzeme Listesi'],
      ownerId: currentUserId, // Kullanıcının kendi ilanı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    }
  ]);

  const getStatusBadge = (status: string, label: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status === 'active' ? 'Aktif' : status === 'paused' ? 'Pasif' : label}
      </span>
    );
  };

  const getListingTypeBadge = (type: string, id: string) => {
    const typeClasses = {
      'Yük İlanı': 'bg-blue-100 text-blue-800',
      'Nakliye Talebi': 'bg-orange-100 text-orange-800',
      'Nakliye İlanı': 'bg-purple-100 text-purple-800'
    };
    
    const typeIcons = {
      'Yük İlanı': '📦',
      'Nakliye Talebi': '🚚',
      'Nakliye İlanı': '🚛'
    };
    
    return (
      <div className="flex flex-col items-start">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[type as keyof typeof typeClasses]} mb-1`}>
          {typeIcons[type as keyof typeof typeIcons]} {type}
        </span>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {id}
        </span>
      </div>
    );
  };

  const handleEdit = (listing: any) => {
    setSelectedListing(listing);
    setEditFormData({
      price: listing.price.replace('₺', '').replace('.', ''),
      transportResponsible: listing.transportResponsible,
      origin: listing.origin,
      destination: listing.destination,
      description: listing.description
    });
    setEditModalOpen(true);
  };

  const handlePreview = (listing: any) => {
    setSelectedListing(listing);
    setPreviewModalOpen(true);
  };

  const handleSaveEdit = () => {
    // Burada API çağrısı yapılacak
    console.log('Düzenleme kaydediliyor:', editFormData);
    setEditModalOpen(false);
    setSelectedListing(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // İlanı aktif yap
  const handleActivate = (listingId: string) => {
    setListings((prev: any) => prev.map((l: any) => l.id === listingId ? { ...l, status: 'active', statusLabel: 'Aktif' } : l));
  };
  // İlanı pasif yap
  const handlePause = (listingId: string) => {
    setListings((prev: any) => prev.map((l: any) => l.id === listingId ? { ...l, status: 'paused', statusLabel: 'Pasif' } : l));
  };
  // İlanı sil
  const handleDelete = (listingId: string) => {
    setListings((prev: any) => prev.filter((l: any) => l.id !== listingId));
  };
  // İlanı değerlendir (örnek: toast veya alert ile)
  const handleEvaluate = () => {
    alert('Değerlendirme fonksiyonu henüz aktif değil.');
  };
  // İlanı arşivle (örnek: toast veya alert ile)
  const handleArchive = () => {
    alert('Arşivleme fonksiyonu henüz aktif değil.');
  };

  const getActionButtons = (status: string, listing: any) => {
    if (status === 'completed') {
      return (
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePreview(listing)}
            className="text-blue-600 hover:text-blue-900 transition-colors" 
            title="Ön İzleme"
          >
            <Eye size={18} />
          </button>
          <button onClick={handleEvaluate} className="text-green-600 hover:text-green-900 transition-colors" title="Değerlendir">
            <Star size={18} />
          </button>
          <button onClick={handleArchive} className="text-gray-600 hover:text-gray-900 transition-colors" title="Arşivle">
            <Archive size={18} />
          </button>
        </div>
      );
    }

    if (status === 'paused') {
      return (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEdit(listing)}
            className="text-blue-600 hover:text-blue-900 transition-colors" 
            title="Düzenle"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handlePreview(listing)}
            className="text-purple-600 hover:text-purple-900 transition-colors" 
            title="Ön İzleme"
          >
            <Eye size={18} />
          </button>
          <button onClick={() => handleActivate(listing.id)} className="text-green-600 hover:text-green-900 transition-colors" title="Aktif Yap">
            <Play size={18} />
          </button>
          <button onClick={() => handleDelete(listing.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Sil">
            <Trash2 size={18} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <button 
          onClick={() => handleEdit(listing)}
          className="text-blue-600 hover:text-blue-900 transition-colors" 
          title="Düzenle"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => handlePreview(listing)}
          className="text-purple-600 hover:text-purple-900 transition-colors" 
          title="Ön İzleme"
        >
          <Eye size={18} />
        </button>
        {status === 'active' ? (
          <button onClick={() => handlePause(listing.id)} className="text-yellow-600 hover:text-yellow-900 transition-colors" title="Pasif Yap">
            <Pause size={18} />
          </button>
        ) : status === 'paused' ? (
          <button onClick={() => handleActivate(listing.id)} className="text-green-600 hover:text-green-900 transition-colors" title="Aktif Yap">
            <Play size={18} />
          </button>
        ) : null}
        <button onClick={() => handleDelete(listing.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Sil">
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editModalOpen || !selectedListing) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Düzenleme modunu kapat"
            aria-label="Düzenleme modunu kapat"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">İlan Düzenle</h3>
            <p className="text-gray-600">{selectedListing.id} - {selectedListing.title}</p>
          </div>

          <form className="space-y-6">
            {/* Fiyat Bilgisi */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat Bilgisi (TL)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={editFormData.price}
                onChange={handleEditInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Örn: 4500"
              />
            </div>

            {/* Nakliye Kime Ait */}
            <div>
              <label htmlFor="transportResponsible" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye Kime Ait
              </label>
              <select
                id="transportResponsible"
                name="transportResponsible"
                value={editFormData.transportResponsible}
                onChange={handleEditInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="Alıcı">Alıcı</option>
                <option value="Satıcı">Satıcı</option>
                <option value="Nakliyeci">Nakliyeci</option>
                <option value="Nakliye Gerekmiyor">Nakliye Gerekmiyor</option>
              </select>
            </div>

            {/* Lokasyon Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Kalkış Noktası
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={editFormData.origin}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Örn: İstanbul, Türkiye"
                />
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Varış Noktası
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={editFormData.destination}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Örn: Ankara, Türkiye"
                />
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="İlan açıklaması..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
              >
                <Save size={18} className="mr-2" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!previewModalOpen || !selectedListing) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setPreviewModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Ön izlemeyi kapat"
            aria-label="Ön izlemeyi kapat"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">İlan Ön İzleme</h3>
            <div className="flex items-center space-x-4">
              {getListingTypeBadge(selectedListing.listingType, selectedListing.id)}
              {getStatusBadge(selectedListing.status, selectedListing.statusLabel)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Kolon - İlan Detayları */}
            <div className="lg:col-span-2 space-y-6">
              {/* Başlık ve Temel Bilgiler */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{selectedListing.title}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="text-primary-500 mr-2" size={18} />
                    <div>
                      <span className="text-sm text-gray-500">Güzergah</span>
                      <div className="font-medium">{selectedListing.route}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Package className="text-primary-500 mr-2" size={18} />
                    <div>
                      <span className="text-sm text-gray-500">Yük Tipi</span>
                      <div className="font-medium">{selectedListing.loadType || selectedListing.type}</div>
                    </div>
                  </div>

                  {selectedListing.weight && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Ağırlık</span>
                        <div className="font-medium">{selectedListing.weight}</div>
                      </div>
                    </div>
                  )}

                  {selectedListing.volume && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Hacim</span>
                        <div className="font-medium">{selectedListing.volume}</div>
                      </div>
                    </div>
                  )}

                  {selectedListing.capacity && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Kapasite</span>
                        <div className="font-medium">{selectedListing.capacity}</div>
                      </div>
                    </div>
                  )}

                  {selectedListing.loadingDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Yükleme Tarihi</span>
                        <div className="font-medium">{selectedListing.loadingDate}</div>
                      </div>
                    </div>
                  )}

                  {selectedListing.deliveryDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Teslimat Tarihi</span>
                        <div className="font-medium">{selectedListing.deliveryDate}</div>
                      </div>
                    </div>
                  )}

                  {selectedListing.availableDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Boşta Olma Tarihi</span>
                        <div className="font-medium">{selectedListing.availableDate}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="font-semibold text-gray-900 mb-3">Açıklama</h5>
                <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
              </div>

              {/* Taşıma Detayları */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="font-semibold text-gray-900 mb-4">Taşıma Detayları</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Taşıma Modu</span>
                    <div className="font-medium">{selectedListing.transportMode}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Araç Tipi</span>
                    <div className="font-medium">{selectedListing.vehicleType}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nakliye Sorumlusu</span>
                    <div className="font-medium">{selectedListing.transportResponsible}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Teklif Türü</span>
                    <div className="font-medium">{selectedListing.offerType}</div>
                  </div>
                </div>
              </div>

              {/* Özellikler (Nakliye İlanı için) */}
              {selectedListing.features && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Hizmet Özellikleri</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.features.map((feature: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evraklar */}
              {selectedListing.documents && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Gerekli Evraklar</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedListing.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Fiyat ve İletişim */}
            <div className="space-y-6">
              {/* Fiyat Bilgisi */}
              <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">{selectedListing.price}</div>
                  <div className="text-gray-600 mb-4">Belirlenen Fiyat</div>
                  <div className="text-sm text-gray-500">
                    Yayın Tarihi: {selectedListing.publishDate}
                  </div>
                  {selectedListing.remainingDays !== '-' && (
                    <div className="text-sm text-gray-500">
                      Kalan Süre: {selectedListing.remainingDays}
                    </div>
                  )}
                  {/* Duruma göre bilgilendirme */}
                  {selectedListing.status === 'active' ? (
                    <div className="mt-3 text-green-700 text-sm font-medium">Bu ilan yayında ve herkes tarafından görüntülenebilir.</div>
                  ) : selectedListing.status === 'paused' ? (
                    <div className="mt-3 text-yellow-700 text-sm font-medium">Bu ilan pasif durumda, yayında değildir.</div>
                  ) : null}
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-primary-600" size={20} />
                  İlan Sahibi İletişim Bilgileri
                </h5>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedListing.contact.name}</div>
                      <div className="text-sm text-gray-500">{selectedListing.contact.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedListing.contact.phone}</div>
                      <div className="text-sm text-gray-500">Telefon</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedListing.contact.email}</div>
                      <div className="text-sm text-gray-500">E-posta</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building className="text-gray-400 mr-3 mt-1" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedListing.contact.address}</div>
                      <div className="text-sm text-gray-500">Adres</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Güvenlik Bilgileri */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-3">Güvenlik Bilgileri</h5>
                <div className="space-y-2 text-sm text-green-700">
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
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    7/24 müşteri desteği
                  </div>
                </div>
              </div>

              {/* Güvenlik Uyarısı */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="text-yellow-600 mr-2" size={20} />
                  <h5 className="font-semibold text-yellow-800">Önemli Güvenlik Uyarısı</h5>
                </div>
                <p className="text-sm text-yellow-700">
                  Kendi ilanınıza teklif veremezsiniz. Bu, platformun güvenliğini ve adil kullanımını sağlamak için alınmış bir önlemdir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kullanıcının rolüne göre ilan oluşturma butonlarını göster
  const renderCreateButtons = () => {
    if (userRole === 'alici-satici') {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setActiveSection('create-load-listing')}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>📦 Yeni Yük İlanı</span>
          </button>
          <button 
            onClick={() => setActiveSection('create-shipment-request')}
            className="bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>🚚 Yeni Nakliye Talebi</span>
          </button>
        </div>
      );
    } else if (userRole === 'nakliyeci') {
      return (
        <button 
          onClick={() => setActiveSection('create-transport-service')}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus size={20} className="mr-2" />
          <span>🚛 Yeni Nakliye İlanı</span>
        </button>
      );
    } else {
      // Hem alıcı/satıcı hem nakliyeci rolü varsa tüm butonları göster
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setActiveSection('create-load-listing')}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>📦 Yeni Yük İlanı</span>
          </button>
          <button 
            onClick={() => setActiveSection('create-shipment-request')}
            className="bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>🚚 Yeni Nakliye Talebi</span>
          </button>
          <button 
            onClick={() => setActiveSection('create-transport-service')}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>🚛 Yeni Nakliye İlanı</span>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">İlanlarım</h2>
          {renderCreateButtons()}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="İlan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <label htmlFor="statusFilter" className="sr-only">Durum Filtrele</label>
          <select
            id="statusFilter"
            aria-label="Durum Filtrele"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Beklemede</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
          <label htmlFor="typeFilter" className="sr-only">İlan Tipi Filtrele</label>
          <select
            id="typeFilter"
            aria-label="İlan Tipi Filtrele"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="">Tüm İlan Tipleri</option>
            <option value="Yük İlanı">📦 Yük İlanı</option>
            <option value="Nakliye Talebi">🚚 Nakliye Talebi</option>
            <option value="Nakliye İlanı">🚛 Nakliye İlanı</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlan Tipi & No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlan Başlığı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yük Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kalkış/Varış
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yayın Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Süresi Kalan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eylemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getListingTypeBadge(listing.listingType, listing.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{listing.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{listing.route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{listing.publishDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{listing.remainingDays}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(listing.status, listing.statusLabel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionButtons(listing.status, listing)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam 5 kayıttan 1-5 arası gösteriliyor
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled title="Önceki Sayfa" aria-label="Önceki Sayfa">
              <ChevronLeft size={20} />
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-primary-600 text-white" title="1. Sayfa" aria-label="1. Sayfa">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors" title="2. Sayfa" aria-label="2. Sayfa">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 transition-colors" title="Sonraki Sayfa" aria-label="Sonraki Sayfa">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderEditModal()}
      {renderPreviewModal()}
    </div>
  );
};

export default MyListingsSection;