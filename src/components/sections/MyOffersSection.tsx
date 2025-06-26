import React, { useState } from 'react';
import { 
  Search, 
  Check, 
  X, 
  MessageCircle, 
  Eye, 
  Edit,
  Save,
  MapPin,
  Package,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

const MyOffersSection: React.FC = () => {
  // --- STATE TANIMLARI ---
  const [activeTab, setActiveTab] = useState('incoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showSelfOfferWarning, setShowSelfOfferWarning] = useState(false);
  const [editFormData, setEditFormData] = useState({
    price: '',
    transportResponsible: '',
    origin: '',
    destination: '',
    description: ''
  });
  const [newOfferForm, setNewOfferForm] = useState({
    listingId: '',
    price: '',
    description: '',
    transportResponsible: '',
    origin: '',
    destination: '',
    files: [] as File[]
  });

  // --- SABİT VERİLER ---
  const currentUserId = 'user_123'; // Simulated user id
  const incomingOffers = [
    {
      id: 1,
      listingId: 'ILN2506230001',
      listingTitle: 'İstanbul-Ankara Tekstil Yükü',
      offerBy: 'Mehmet Kaya',
      offerById: 'user_456', // Farklı kullanıcı - normal teklif
      amount: '₺4.500',
      date: '16.06.2025, 14:32',
      status: 'pending',
      statusLabel: 'Beklemede',
      listingType: 'Yük İlanı',
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
      listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      },
      offerContact: {
        name: 'Mehmet Kaya',
        company: 'Kaya Nakliyat Ltd.',
        phone: '+90 555 987 6543',
        email: 'mehmet@kayanakliyat.com',
        address: 'Cumhuriyet Mah. Lojistik Cad. No:12 Şişli/İstanbul'
      }
    },
    {
      id: 2,
      listingId: 'NT2506230002',
      listingTitle: 'Ankara-Konya Gıda Taşıma',
      offerBy: 'Ali Demir',
      offerById: 'user_789', // Farklı kullanıcı - normal teklif
      amount: '₺3.200',
      date: '15.06.2025, 09:45',
      status: 'pending',
      statusLabel: 'Beklemede',
      listingType: 'Nakliye Talebi',
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
      listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      },
      offerContact: {
        name: 'Ali Demir',
        company: 'Demir Lojistik A.Ş.',
        phone: '+90 555 456 7890',
        email: 'ali@demirlojistik.com',
        address: 'Kızılay Mah. Taşıma Sok. No:8 Çankaya/Ankara'
      }
    },
    {
      id: 3,
      listingId: 'NK2506230003',
      listingTitle: 'İzmir-Antalya Elektronik Eşya',
      offerBy: 'Ayşe Yılmaz',
      offerById: 'user_101', // Farklı kullanıcı - normal teklif
      amount: '₺5.800',
      date: '14.06.2025, 16:20',
      status: 'accepted',
      statusLabel: 'Kabul Edildi',
      listingType: 'Nakliye İlanı',
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
      listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      },
      offerContact: {
        name: 'Ayşe Yılmaz',
        company: 'Yılmaz Elektronik Ltd.',
        phone: '+90 555 321 9876',
        email: 'ayse@yilmazelektronik.com',
        address: 'Alsancak Mah. Teknoloji Cad. No:25 Konak/İzmir'
      }
    },
    {
      id: 4,
      listingId: 'ILN2506230004',
      listingTitle: 'Adana-Mersin İnşaat Malzemesi',
      offerBy: 'Hakan Şahin',
      offerById: 'user_202', // Farklı kullanıcı - normal teklif
      amount: '₺2.750',
      date: '12.06.2025, 11:05',
      status: 'rejected',
      statusLabel: 'Reddedildi',
      listingType: 'Yük İlanı',
      transportResponsible: 'Satıcı',
      origin: 'Adana, Türkiye',
      destination: 'Mersin, Türkiye',
      description: 'Çimento ve demir malzemeler. Açık kasa araç uygun.',
      weight: '25 ton',
      volume: '15 m³',
      loadingDate: '2025-06-18',
      deliveryDate: '2025-06-19',
      loadType: 'İnşaat Malzemeleri',
      offerType: 'Doğrudan Teklif',
      transportMode: 'Karayolu',
      vehicleType: 'Açık Kasa Kamyon',
      documents: ['İnşaat Ruhsatı', 'Malzeme Listesi'],
      listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
      contact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      },
      offerContact: {
        name: 'Hakan Şahin',
        company: 'Şahin İnşaat Malz.',
        phone: '+90 555 654 3210',
        email: 'hakan@sahininşaat.com',
        address: 'Seyhan Mah. İnşaat Cad. No:67 Seyhan/Adana'
      }
    }
  ];

  const outgoingOffers = [
    {
      id: 5,
      listingId: 'ILN2506230005',
      listingTitle: 'Samsun-Trabzon Mobilya Taşıma',
      offerBy: 'Ahmet Yılmaz', // Mevcut kullanıcı
      offerById: currentUserId, // Teklif veren mevcut kullanıcı
      amount: '₺3.800',
      date: '15.06.2025, 10:15',
      status: 'pending',
      statusLabel: 'Beklemede',
      listingType: 'Yük İlanı',
      transportResponsible: 'Alıcı',
      origin: 'Samsun, Türkiye',
      destination: 'Trabzon, Türkiye',
      description: 'Mobilya taşıma işlemi. Dikkatli taşıma gerekli.',
      weight: '10 ton',
      volume: '30 m³',
      loadingDate: '2025-06-22',
      deliveryDate: '2025-06-23',
      loadType: 'Mobilya',
      offerType: 'Fiyat Belirleyerek',
      transportMode: 'Karayolu',
      vehicleType: 'Kapalı Kasa Kamyon',
      documents: ['Fatura', 'Sigorta Poliçesi'],
      listingOwnerId: 'user_303', // İlan sahibi farklı kullanıcı
      contact: {
        name: 'Kemal Demir',
        company: 'Demir Mobilya Ltd.',
        phone: '+90 555 222 3333',
        email: 'kemal@demirmobilya.com',
        address: 'Atatürk Mah. Mobilya Cad. No:45 Samsun'
      },
      offerContact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    },
    {
      id: 6,
      listingId: 'NT2506230006',
      listingTitle: 'Eskişehir-Konya Makine Taşıma',
      offerBy: 'Ahmet Yılmaz', // Mevcut kullanıcı
      offerById: currentUserId, // Teklif veren mevcut kullanıcı
      amount: '₺4.200',
      date: '14.06.2025, 14:30',
      status: 'accepted',
      statusLabel: 'Kabul Edildi',
      listingType: 'Nakliye Talebi',
      transportResponsible: 'Satıcı',
      origin: 'Eskişehir, Türkiye',
      destination: 'Konya, Türkiye',
      description: 'Endüstriyel makine taşıma işlemi. Özel ekipman gerekli.',
      weight: '18 ton',
      volume: '40 m³',
      loadingDate: '2025-06-25',
      deliveryDate: '2025-06-26',
      loadType: 'Makine Ekipmanları',
      offerType: 'Doğrudan Teklif',
      transportMode: 'Karayolu',
      vehicleType: 'Low-bed',
      documents: ['Makine Teknik Belgesi', 'Sigorta Poliçesi'],
      listingOwnerId: 'user_404', // İlan sahibi farklı kullanıcı
      contact: {
        name: 'Murat Öztürk',
        company: 'Öztürk Makine San.',
        phone: '+90 555 444 5555',
        email: 'murat@ozturkmakine.com',
        address: 'Sanayi Mah. Makine Cad. No:78 Eskişehir'
      },
      offerContact: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567',
        email: 'ahmet@yilmaztekstil.com',
        address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
      }
    }
  ];

  // listings dizisini fonksiyonun başında tanımla
  const listings = [
    { id: 'ILN2506230001', title: 'İstanbul-Ankara Tekstil Yükü' },
    { id: 'ILN2506230002', title: 'Bursa Tekstil Ürünleri Satışı' },
    { id: 'ILN2506230003', title: 'İzmir-Ankara Frigorifik Taşıma' }
  ];

  // --- YARDIMCI FONKSİYONLAR ---
  const getActiveOffers = () => (activeTab === 'incoming' ? incomingOffers : outgoingOffers);

  const getStatusBadge = (status: string, label: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>{label}</span>
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
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{id}</span>
      </div>
    );
  };

  // --- ACTION FONKSİYONLARI ---
  const handleEdit = (offer: any) => {
    if (activeTab === 'outgoing' && offer.listingOwnerId === currentUserId) {
      setShowSelfOfferWarning(true);
      return;
    }
    setSelectedOffer(offer);
    setEditFormData({
      price: offer.amount.replace('₺', '').replace('.', ''),
      transportResponsible: offer.transportResponsible,
      origin: offer.origin,
      destination: offer.destination,
      description: offer.description
    });
    setEditModalOpen(true);
  };

  const handlePreview = (offer: any) => {
    setSelectedOffer(offer);
    setPreviewModalOpen(true);
  };

  const handleSaveEdit = () => {
    // API çağrısı yapılacak
    setEditModalOpen(false);
    setSelectedOffer(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccept = (offer: any) => {
    alert(`Teklif kabul edildi: ${offer.listingId}`);
  };
  const handleReject = (offer: any) => {
    alert(`Teklif reddedildi: ${offer.listingId}`);
  };
  const handleChat = (offer: any) => {
    alert(`Mesajlaşma başlatıldı: ${offer.listingId}`);
  };

  // Dosya yükleme değişikliği
  const handleNewOfferFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
    }
  };

  // --- BUTONLAR ---
  const getActionButtons = (status: string, offer: any) => {
    const isSelfOffer = activeTab === 'outgoing' && offer.listingOwnerId === currentUserId;
    if (isSelfOffer) {
      return (
        <div className="flex space-x-2">
          <button onClick={() => setShowSelfOfferWarning(true)} className="text-red-600 hover:text-red-900 transition-colors" title="Uyarı">
            <AlertTriangle size={18} />
          </button>
          <button onClick={() => handlePreview(offer)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Ön İzleme">
            <Eye size={18} />
          </button>
        </div>
      );
    }
    if (status === 'accepted') {
      return (
        <div className="flex space-x-2">
          <button onClick={() => handlePreview(offer)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Ön İzleme">
            <Eye size={18} />
          </button>
          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Mesaj Gönder">
            <MessageCircle size={18} />
          </button>
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <div className="flex space-x-2">
          <button onClick={() => handlePreview(offer)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Ön İzleme">
            <Eye size={18} />
          </button>
        </div>
      );
    }
    if (activeTab === 'incoming') {
      return (
        <div className="flex space-x-2">
          <button onClick={() => handlePreview(offer)} className="text-purple-600 hover:text-purple-900 transition-colors" title="Ön İzleme">
            <Eye size={18} />
          </button>
          <button className="text-green-600 hover:text-green-900 transition-colors" title="Kabul Et" onClick={() => handleAccept(offer)}>
            <Check size={18} />
          </button>
          <button className="text-red-600 hover:text-red-900 transition-colors" title="Reddet" onClick={() => handleReject(offer)}>
            <X size={18} />
          </button>
          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Mesaj Gönder" onClick={() => handleChat(offer)}>
            <MessageCircle size={18} />
          </button>
        </div>
      );
    }
    return (
      <div className="flex space-x-2">
        <button onClick={() => handleEdit(offer)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle">
          <Edit size={18} />
        </button>
        <button onClick={() => handlePreview(offer)} className="text-purple-600 hover:text-purple-900 transition-colors" title="Ön İzleme">
          <Eye size={18} />
        </button>
        <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Mesaj Gönder">
          <MessageCircle size={18} />
        </button>
      </div>
    );
  };

  // --- MODAL RENDER FONKSİYONLARI ---
  const renderEditModal = () => {
    if (!editModalOpen || !selectedOffer) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Teklif Düzenle</h3>
            <p className="text-gray-600">{selectedOffer.listingId} - {selectedOffer.listingTitle}</p>
          </div>

          <form className="space-y-6">
            {/* Fiyat Bilgisi */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Teklif Tutarı (TL)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={editFormData.price}
                onChange={handleEditInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Örn: 4500"
                title="Teklif Tutarı"
                aria-label="Teklif Tutarı"
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
                title="Nakliye Kime Ait"
                aria-label="Nakliye Kime Ait"
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
                  title="Kalkış Noktası"
                  aria-label="Kalkış Noktası"
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
                  title="Varış Noktası"
                  aria-label="Varış Noktası"
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
                placeholder="Teklif açıklaması..."
                title="Açıklama"
                aria-label="Açıklama"
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
    if (!previewModalOpen || !selectedOffer) return null;

    // Kullanıcının kendi ilanına teklif vermesi durumunu kontrol et
    const isSelfOffer = selectedOffer.listingOwnerId === currentUserId && 
                        selectedOffer.offerById === currentUserId;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setPreviewModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
          >
            <X size={24} />
          </button>
          
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Teklif Ön İzleme</h3>
            <div className="flex items-center space-x-4">
              {getListingTypeBadge(selectedOffer.listingType, selectedOffer.listingId)}
              {getStatusBadge(selectedOffer.status, selectedOffer.statusLabel)}
              
              {/* Kendi ilanına teklif uyarısı */}
              {isSelfOffer && (
                <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  <AlertTriangle size={16} className="mr-1" />
                  Kendi İlanınıza Teklif
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Kolon - İlan Detayları */}
            <div className="lg:col-span-2 space-y-6">
              {/* Başlık ve Temel Bilgiler */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{selectedOffer.listingTitle}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="text-primary-500 mr-2" size={18} />
                    <div>
                      <span className="text-sm text-gray-500">Güzergah</span>
                      <div className="font-medium">{selectedOffer.origin} → {selectedOffer.destination}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Package className="text-primary-500 mr-2" size={18} />
                    <div>
                      <span className="text-sm text-gray-500">Yük Tipi</span>
                      <div className="font-medium">{selectedOffer.loadType}</div>
                    </div>
                  </div>

                  {selectedOffer.weight && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Ağırlık</span>
                        <div className="font-medium">{selectedOffer.weight}</div>
                      </div>
                    </div>
                  )}

                  {selectedOffer.volume && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Hacim</span>
                        <div className="font-medium">{selectedOffer.volume}</div>
                      </div>
                    </div>
                  )}

                  {selectedOffer.capacity && (
                    <div className="flex items-center">
                      <Package className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Kapasite</span>
                        <div className="font-medium">{selectedOffer.capacity}</div>
                      </div>
                    </div>
                  )}

                  {selectedOffer.loadingDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Yükleme Tarihi</span>
                        <div className="font-medium">{selectedOffer.loadingDate}</div>
                      </div>
                    </div>
                  )}

                  {selectedOffer.deliveryDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Teslimat Tarihi</span>
                        <div className="font-medium">{selectedOffer.deliveryDate}</div>
                      </div>
                    </div>
                  )}

                  {selectedOffer.availableDate && (
                    <div className="flex items-center">
                      <Calendar className="text-primary-500 mr-2" size={18} />
                      <div>
                        <span className="text-sm text-gray-500">Boşta Olma Tarihi</span>
                        <div className="font-medium">{selectedOffer.availableDate}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="font-semibold text-gray-900 mb-3">Açıklama</h5>
                <p className="text-gray-700 leading-relaxed">{selectedOffer.description}</p>
              </div>

              {/* Taşıma Detayları */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="font-semibold text-gray-900 mb-4">Taşıma Detayları</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Taşıma Modu</span>
                    <div className="font-medium">{selectedOffer.transportMode}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Araç Tipi</span>
                    <div className="font-medium">{selectedOffer.vehicleType}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nakliye Sorumlusu</span>
                    <div className="font-medium">{selectedOffer.transportResponsible}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Teklif Türü</span>
                    <div className="font-medium">{selectedOffer.offerType}</div>
                  </div>
                </div>
              </div>

              {/* Özellikler (Nakliye İlanı için) */}
              {selectedOffer.features && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Hizmet Özellikleri</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.features.map((feature: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evraklar */}
              {selectedOffer.documents && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Gerekli Evraklar</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedOffer.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Teklif ve İletişim */}
            <div className="space-y-6">
              {/* Teklif Bilgisi */}
              <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">{selectedOffer.amount}</div>
                  <div className="text-gray-600 mb-4">Teklif Tutarı</div>
                  <div className="text-sm text-gray-500">
                    Teklif Tarihi: {selectedOffer.date}
                  </div>
                  <div className="text-sm text-gray-500">
                    Teklif Veren: {selectedOffer.offerBy}
                  </div>
                </div>
              </div>

              {/* İlan Sahibi İletişim Bilgileri */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-primary-600" size={20} />
                  İlan Sahibi İletişim Bilgileri
                </h5>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedOffer.contact.name}</div>
                      <div className="text-sm text-gray-500">{selectedOffer.contact.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedOffer.contact.phone}</div>
                      <div className="text-sm text-gray-500">Telefon</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="text-gray-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedOffer.contact.email}</div>
                      <div className="text-sm text-gray-500">E-posta</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building className="text-gray-400 mr-3 mt-1" size={16} />
                    <div>
                      <div className="font-medium text-gray-900">{selectedOffer.contact.address}</div>
                      <div className="text-sm text-gray-500">Adres</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teklif Veren İletişim Bilgileri */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Teklif Veren İletişim Bilgileri
                </h5>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="text-blue-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-blue-900">{selectedOffer.offerContact.name}</div>
                      <div className="text-sm text-blue-600">{selectedOffer.offerContact.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="text-blue-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-blue-900">{selectedOffer.offerContact.phone}</div>
                      <div className="text-sm text-blue-600">Telefon</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="text-blue-400 mr-3" size={16} />
                    <div>
                      <div className="font-medium text-blue-900">{selectedOffer.offerContact.email}</div>
                      <div className="text-sm text-blue-600">E-posta</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building className="text-blue-400 mr-3 mt-1" size={16} />
                    <div>
                      <div className="font-medium text-blue-900">{selectedOffer.offerContact.address}</div>
                      <div className="text-sm text-blue-600">Adres</div>
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

              {/* Kendi İlanına Teklif Uyarısı */}
              {isSelfOffer && (
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="text-red-600 mr-2" size={20} />
                    <h5 className="font-semibold text-red-800">Güvenlik Uyarısı</h5>
                  </div>
                  <p className="text-sm text-red-700">
                    <strong>Kendi ilanınıza teklif vermeniz sistem tarafından engellenmiştir.</strong> Bu, platformun güvenliğini ve adil kullanımını sağlamak için alınmış bir önlemdir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kendi İlanına Teklif Verme Uyarı Modalı
  const renderSelfOfferWarningModal = () => {
    if (!showSelfOfferWarning) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setShowSelfOfferWarning(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
          >
            <X size={24} />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Güvenlik Uyarısı</h3>
            <p className="text-gray-600 mb-6">
              Kendi ilanınıza teklif vermeniz sistem tarafından engellenmiştir. Bu, platformun güvenliğini ve adil kullanımını sağlamak için alınmış bir önlemdir.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowSelfOfferWarning(false)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Yeni Teklif Modalini Aç
  const closeNewOfferModal = () => setShowNewOfferModal(false);

  // Yeni Teklif Modalini render et
  const renderNewOfferModal = () => {
    if (!showNewOfferModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative">
          <button onClick={closeNewOfferModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold mb-6">Yeni Teklif Ver</h3>
          <form onSubmit={e => { e.preventDefault(); /* Teklif gönderme işlemi */ closeNewOfferModal(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">İlan Seç</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.listingId}
                onChange={e => setNewOfferForm(f => ({ ...f, listingId: e.target.value }))}
                required
                title="İlan Seçiniz"
                aria-label="İlan Seçiniz"
              >
                <option value="">İlan Seçiniz</option>
                {listings.map((listing: {id: string, title: string}) => (
                  <option key={listing.id} value={listing.id}>{listing.id} - {listing.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nakliye Kime Ait</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.transportResponsible}
                onChange={e => setNewOfferForm(f => ({ ...f, transportResponsible: e.target.value }))}
                required
                title="Nakliye Kime Ait"
                aria-label="Nakliye Kime Ait"
              >
                <option value="">Seçiniz</option>
                <option value="Alıcı">Alıcı</option>
                <option value="Satıcı">Satıcı</option>
                <option value="Nakliye Gerekmiyor">Nakliye Gerekmiyor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kalkış Noktası</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.origin}
                onChange={e => setNewOfferForm(f => ({ ...f, origin: e.target.value }))}
                required
                title="Kalkış Noktası"
                placeholder="Kalkış Noktası"
                aria-label="Kalkış Noktası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Varış Noktası</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.destination || ''}
                onChange={e => setNewOfferForm(f => ({ ...f, destination: e.target.value }))}
                required
                title="Varış Noktası"
                placeholder="Varış Noktası"
                aria-label="Varış Noktası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teklif Tutarı</label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.price}
                onChange={e => setNewOfferForm(f => ({ ...f, price: e.target.value }))}
                required
                min="0"
                title="Teklif Tutarı"
                placeholder="Teklif Tutarı"
                aria-label="Teklif Tutarı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                value={newOfferForm.description}
                onChange={e => setNewOfferForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                title="Açıklama"
                placeholder="Açıklama"
                aria-label="Açıklama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Evrak ve Resim Yükle</label>
              <input
                type="file"
                className="w-full border rounded-lg px-3 py-2"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleNewOfferFileChange}
                title="Evrak ve Resim Yükle"
                aria-label="Evrak ve Resim Yükle"
              />
              {newOfferForm.files && newOfferForm.files.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                  {newOfferForm.files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              Teklif Ver
            </button>
          </form>
        </div>
      </div>
    );
  };

  // --- RETURN ---
  return (
    <div className="space-y-6 animate-fade-in">
      {renderNewOfferModal()}
      <button onClick={() => setShowNewOfferModal(true)} className="mb-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2">
        <PlusCircle size={20} /> Yeni Teklif Ver
      </button>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Tekliflerim</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Teklif ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              title="Durum filtresi"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="accepted">Kabul Edildi</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'incoming'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gelen Teklifler
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'outgoing'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verdiğim Teklifler
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlan No & Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlan Başlığı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'incoming' ? 'Teklif Veren' : 'İlan Sahibi'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teklif Tutarı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teklif Tarihi
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
              {getActiveOffers().map((offer) => {
                const isSelfOffer = activeTab === 'outgoing' && offer.listingOwnerId === currentUserId;
                return (
                  <tr key={offer.id} className={`hover:bg-gray-50 transition-colors ${isSelfOffer ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getListingTypeBadge(offer.listingType, offer.listingId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.listingTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-medium">
                            {activeTab === 'incoming' 
                              ? offer.offerBy.split(' ').map(n => n[0]).join('') 
                              : offer.contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'incoming' ? offer.offerBy : offer.contact.name}
                          {isSelfOffer && (
                            <div className="text-xs text-red-600 font-medium flex items-center mt-1">
                              <AlertTriangle size={12} className="mr-1" />
                              Kendi ilanınız!
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{offer.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status, offer.statusLabel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionButtons(offer.status, offer)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam {getActiveOffers().length} kayıttan 1-{getActiveOffers().length} arası gösteriliyor
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
              Önceki
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-primary-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
              Sonraki
            </button>
          </div>
        </div>
      </div>
      {/* Modallar */}
      {renderEditModal()}
      {renderPreviewModal()}
      {renderSelfOfferWarningModal()}
    </div>
  );
};

export default MyOffersSection;