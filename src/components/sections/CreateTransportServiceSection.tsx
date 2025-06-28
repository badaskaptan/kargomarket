import React, { useState } from 'react';
import { ArrowLeft, Calendar, Package, MapPin, Truck, Ship, Plane, Train, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const CreateTransportServiceSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const [transportMode, setTransportMode] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>>([]);
  const [formData, setFormData] = useState({
    serviceNumber: `NK${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    serviceTitle: '',
    serviceTransportMode: '',
    serviceDescription: '',
    serviceOrigin: '',
    serviceDestination: '',
    serviceVehicleType: '',
    serviceAvailableDate: '',
    serviceCapacity: '',
    serviceCompanyName: '',
    serviceContact: '',
    
    // Karayolu için ek alanlar
    plateNumber: '',
    
    // Denizyolu için ek alanlar
    shipName: '',
    imoNumber: '',
    mmsiNumber: '',
    dwt: '',
    shipDimensions: '',
    laycanStart: '',
    laycanEnd: '',
    freightType: '',
    chartererInfo: '',
    
    // Havayolu için ek alanlar
    flightNumber: '',
    
    // Demiryolu için ek alanlar
    trainNumber: ''
  });

  // Araç tipleri taşıma moduna göre - Grup başlıkları ile organize edilmiş
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

  // Gerekli evraklar taşıma moduna göre
  const requiredDocuments = {
    road: [
      'SRC Belgesi',
      'Yetki Belgesi (K1/K2/L vs.)',
      'Taşıma Sözleşmesi',
      'Araç Ruhsatı',
      'Zorunlu Trafik Sigortası',
      'Taşıyıcı Sorumluluk Sigortası',
      'İrsaliye / Sevk Fişi',
      'ADR Belgesi (Tehlikeli madde için)',
      'Frigo Sertifikası (Soğutmalı araçlar için)',
      'Ağırlık ve Ölçüm Raporu (Low-bed için)',
      'Hamule Senedi / CMR Waybill (Consignment Note)',
      'Araç Takip Sistemi Kaydı / Sefer Defteri',
      'Araç Fotoğrafı',
      'Şoför Kimlik ve Ehliyet Fotokopisi',
      'Araç Muayene Belgesi',
      'Teslimat Tutanakları / Tesellüm/Kabul Belgesi',
      'Karayolu Taşıyıcı Yetki Belgesi (Bakanlık onayı)',
      'ISO/Kalite Belgesi (varsa)',
      'Kaza Geçmişi / Track Record (isteğe bağlı, büyük projelerde)',
      'Diğer (Belirtiniz): __________'
    ],
    sea: [
      'Konşimento (B/L)',
      'P&I Sigorta Sertifikası',
      'IMO Deklarasyonu (Tehlikeli Yük İçin)',
      'Gemici Belgeleri',
      'Gemi Uygunluk Sertifikası',
      'Son 3 kargo',
      'Yükleme Planı',
      'Tank/Ambar Temizlik sertifikası',
      'Sörvey Raporu',
      'Yükleme Manifestosu',
      'SOPEP (Petrol Kirliliği Önleme Planı – Tankerler için)',
      'SIRE Raporu (Tankerler için)',
      'DWT / Draft Survey Raporu',
      'CDI Raporu'
    ],
    air: [
      'Air Waybill (AWB)',
      'Booking Confirmation / Reservation',
      'Yükleme Listesi / Packing List',
      'Dangerous Goods Declaration (DGD) – Tehlikeli Yük Sertifikası',
      'Uçak Uygunluk Belgeleri (Airworthiness)',
      'Aircraft Registration Certificate',
      'Operator’s Certificate (AOC)',
      'Crew License ve Personel Belgeleri',
      'Sigorta Poliçeleri (P&I, H&M)',
      'Arrival Notice',
      'Cargo Manifest',
      'Teslimat Tutanakları / Teslim Tesellüm Belgesi',
      'MSDS',
      'Fumigasyon Sertifikası (gerekiyorsa)',
      'Havayolu ISO/Kalite Belgesi (varsa)',
      'Diğer (Belirtiniz): __________'
    ],
    rail: [
      'CIM Belgesi',
    'Hamule Senedi / Railway Consignment Note (CIM)',
      'Taşıma Sözleşmesi',
      'Vagon Sertifikası / Vagon Muayene Belgesi',
      'Vagon Numarası / Tipi',
      'Demiryolu İşletme Yetki Belgesi',
      'Yükleme Talimatı',
      'Yükleme Listesi',
      'Yük Manifestosu',
      'Sevk ve Teslim Belgesi',
      'Vagon Takip/Teslim Formu',
      'Tesellüm/Teslimat Tutanakları',
      'Sigorta Poliçesi',
      'Fumigasyon Sertifikası (gerekiyorsa)',
      'Demiryolu Kaza/Kusur Kayıtları (büyük projelerde)',
      'ISO/Kalite Belgesi (varsa)',
      'Diğer (Belirtiniz): __________'
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Taşıma modu değiştiğinde state'i güncelle ve araç tipini sıfırla
    if (name === 'serviceTransportMode') {
      setTransportMode(value);
      setSelectedDocuments([]); // Seçili evrakları sıfırla
      setFormData(prev => ({
        ...prev,
        serviceVehicleType: '', // Araç tipini sıfırla
        // Modlara özel alanları sıfırla
        plateNumber: '',
        shipName: '',
        imoNumber: '',
        mmsiNumber: '',
        dwt: '',
        shipDimensions: '',
        laycanEnd: '',
        freightType: '',
        chartererInfo: '',
        flightNumber: '',
        trainNumber: ''
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Dosya türü kontrolü
        const allowedTypes = [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/png',
          'image/jpeg',
          'image/jpg'
        ];

        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 10MB'dir.`);
          return;
        }

        if (allowedTypes.includes(file.type)) {
          const newDocument = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
            url: URL.createObjectURL(file)
          };
          setUploadedDocuments(prev => [...prev, newDocument]);
        } else {
          alert('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
        }
      });
    }
  };

  const handleDocumentSelect = (document: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(document)) {
        return prev.filter(doc => doc !== document);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleDocumentDelete = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleDocumentPreview = (document: any) => {
    window.open(document.url, '_blank');
  };

  const handleDocumentDownload = (document: any) => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Transport service submitted:', {
      ...formData,
      selectedDocuments,
      uploadedDocuments
    });
    setActiveSection('my-listings');
  };

  // Helper fonksiyonlar dinamik alan isimleri için
  const getDynamicFieldLabels = () => {
    const mode = formData.serviceTransportMode;
    return {
      origin: mode === 'sea' ? 'Kalkış Limanı / Bölgesi' : 
              mode === 'air' ? 'Kalkış Havalimanı' : 
              mode === 'rail' ? 'Kalkış İstasyonu / Bölgesi' : 
              'Kalkış Bölgesi/Noktası',
      destination: mode === 'sea' ? 'Varış Limanı / Bölgesi' : 
                   mode === 'air' ? 'Varış Havalimanı' : 
                   mode === 'rail' ? 'Varış İstasyonu / Bölgesi' : 
                   'Varış Bölgesi/Noktası',
      availableDate: mode === 'sea' ? 'Laycan (Başlangıç)' : 'Boşta Olma Tarihi',
      capacity: mode === 'air' ? 'Kargo Kapasitesi (kg/m³)' : 
                mode === 'sea' ? 'DWT / Kapasite' : 
                'Kapasite (ton/m³)'
    };
  };

  // Helper fonksiyon dinamik placeholder'lar için
  const getDynamicPlaceholders = () => {
    const mode = formData.serviceTransportMode;
    return {
      origin: mode === 'sea' ? 'Örn: İstanbul Limanı, Ambarlı' : 
              mode === 'air' ? 'Örn: İstanbul Havalimanı (IST)' : 
              mode === 'rail' ? 'Örn: Haydarpaşa İstasyonu' : 
              'Örn: İstanbul ve çevresi',
      destination: mode === 'sea' ? 'Örn: İzmir Limanı, Alsancak' : 
                   mode === 'air' ? 'Örn: Ankara Esenboğa (ESB)' : 
                   mode === 'rail' ? 'Örn: Ankara Gar' : 
                   'Örn: Ankara ve çevresi',
      capacity: mode === 'air' ? 'Örn: 5000 kg / 15 m³' : 
                mode === 'sea' ? 'Örn: 25000 DWT' : 
                'Örn: 40 ton / 90 m³'
    };
  };

  const getTransportBackground = () => {
    const backgrounds = {
      road: 'bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden',
      sea: 'bg-gradient-to-br from-cyan-50 to-cyan-100 relative overflow-hidden',
      air: 'bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden',
      rail: 'bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden'
    };
    return backgrounds[transportMode as keyof typeof backgrounds] || 'bg-white relative overflow-hidden';
  };

  const getTransportIcon = () => {
    const icons = {
      road: Truck,
      sea: Ship,
      air: Plane,
      rail: Train
    };
    const IconComponent = icons[transportMode as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-16 h-16 text-gray-400" /> : null;
  };

  const getTransportBackgroundImage = () => {
    if (!transportMode) return '';
    
    const backgroundImages = {
      road: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 50 L90 50 M20 40 L80 40 M20 60 L80 60" stroke="currentColor" stroke-width="2" fill="none"/>
            <rect x="30" y="35" width="20" height="15" rx="2" fill="currentColor"/>
            <circle cx="35" cy="52" r="3" fill="currentColor"/>
            <circle cx="45" cy="52" r="3" fill="currentColor"/>
          </svg>
        </div>
      `,
      sea: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 60 Q30 55 50 60 T90 60" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M30 40 L70 40 L65 55 L35 55 Z" fill="currentColor"/>
            <rect x="45" y="25" width="3" height="15" fill="currentColor"/>
            <path d="M48 25 L60 35 L48 30 Z" fill="currentColor"/>
          </svg>
        </div>
      `,
      air: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M20 50 L80 50" stroke="currentColor" stroke-width="3" fill="none"/>
            <path d="M30 45 L70 45 L75 50 L70 55 L30 55 Z" fill="currentColor"/>
            <path d="M35 40 L45 30 L55 40" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M35 60 L45 70 L55 60" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
      `,
      rail: `
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <path d="M10 55 L90 55 M10 45 L90 45" stroke="currentColor" stroke-width="2" fill="none"/>
            <rect x="25" y="35" width="50" height="20" rx="3" fill="currentColor"/>
            <circle cx="35" cy="58" r="2" fill="currentColor"/>
            <circle cx="45" cy="58" r="2" fill="currentColor"/>
            <circle cx="55" cy="58" r="2" fill="currentColor"/>
            <circle cx="65" cy="58" r="2" fill="currentColor"/>
          </svg>
        </div>
      `
    };
    
    return backgroundImages[transportMode as keyof typeof backgroundImages] || '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`rounded-3xl shadow-lg p-6 transition-all duration-300 ${getTransportBackground()}`}>
        {/* Background Image */}
        {transportMode && (
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: getTransportBackgroundImage() }}
          />
        )}
        
        {/* Header */}
        <div className="flex items-center mb-8 relative z-10">
          <button
            onClick={() => setActiveSection('my-listings')}
            className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full"
            title="Geri"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Nakliye İlanı Oluştur</h1>
          {transportMode && (
            <div className="ml-auto hidden md:block">
              {getTransportIcon()}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nakliye İlanı No */}
            <div>
              <label htmlFor="serviceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Nakliye İlanı No
              </label>
              <input
                type="text"
                id="serviceNumber"
                name="serviceNumber"
                value={formData.serviceNumber}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm"
                readOnly
              />
            </div>

            {/* İlan Başlığı */}
            <div>
              <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                id="serviceTitle"
                name="serviceTitle"
                value={formData.serviceTitle}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: İstanbul-Ankara Güzergahı Nakliye Hizmeti"
              />
            </div>

            {/* Taşıma Modu */}
            <div>
              <label htmlFor="serviceTransportMode" className="block text-sm font-medium text-gray-700 mb-2">
                Taşıma Modu *
              </label>
              <select
                id="serviceTransportMode"
                name="serviceTransportMode"
                value={formData.serviceTransportMode}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              >
                <option value="">Seçiniz</option>
                <option value="road">🚛 Karayolu</option>
                <option value="sea">🚢 Denizyolu</option>
                <option value="air">✈️ Havayolu</option>
                <option value="rail">🚂 Demiryolu</option>
              </select>
            </div>

            {/* Kalkış Bölgesi */}
            <div>
              <label htmlFor="serviceOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                {getDynamicFieldLabels().origin} *
              </label>
              <input
                type="text"
                id="serviceOrigin"
                name="serviceOrigin"
                value={formData.serviceOrigin}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder={getDynamicPlaceholders().origin}
              />
            </div>

            {/* Varış Bölgesi */}
            <div>
              <label htmlFor="serviceDestination" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                {getDynamicFieldLabels().destination} *
              </label>
              <input
                type="text"
                id="serviceDestination"
                name="serviceDestination"
                value={formData.serviceDestination}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder={getDynamicPlaceholders().destination}
              />
            </div>

            {/* Araç Tipi - Taşıma modu seçildikten sonra gösterilir */}
            {transportMode && (
              <div>
                <label htmlFor="serviceVehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="inline w-4 h-4 mr-1" />
                  Araç Tipi *
                </label>
                <select
                  id="serviceVehicleType"
                  name="serviceVehicleType"
                  value={formData.serviceVehicleType}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                >
                  <option value="">Araç tipi seçiniz...</option>
                  {vehicleTypes[transportMode as keyof typeof vehicleTypes]?.map((group, groupIndex) => (
                    <optgroup key={groupIndex} label={group.group}>
                      {group.vehicles.map((vehicle) => (
                        <option key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Boşta Olma Tarihi */}
            <div>
              <label htmlFor="serviceAvailableDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {getDynamicFieldLabels().availableDate} *
              </label>
              <input
                type="date"
                id="serviceAvailableDate"
                name="serviceAvailableDate"
                value={formData.serviceAvailableDate}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Laycan End (Sadece Denizyolu) */}
            {formData.serviceTransportMode === 'sea' && (
              <div>
                <label htmlFor="laycanEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Laycan (Bitiş) *
                </label>
                <input
                  type="date"
                  id="laycanEnd"
                  name="laycanEnd"
                  value={formData.laycanEnd}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  required
                />
              </div>
            )}

            {/* Kapasite */}
            <div>
              <label htmlFor="serviceCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline w-4 h-4 mr-1" />
                {getDynamicFieldLabels().capacity} *
              </label>
              <input
                type="number"
                id="serviceCapacity"
                name="serviceCapacity"
                value={formData.serviceCapacity}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder={getDynamicPlaceholders().capacity}
              />
            </div>

            {/* Firma Adı */}
            <div>
              <label htmlFor="serviceCompanyName" className="block text-sm font-medium text-gray-700 mb-2">
                Firma Adı (Opsiyonel)
              </label>
              <input
                type="text"
                id="serviceCompanyName"
                name="serviceCompanyName"
                value={formData.serviceCompanyName}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Örn: ABC Lojistik A.Ş."
              />
            </div>

            {/* İletişim Bilgileri */}
            <div>
              <label htmlFor="serviceContact" className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Bilgileri (E-posta/Telefon) *
              </label>
              <input
                type="text"
                id="serviceContact"
                name="serviceContact"
                value={formData.serviceContact}
                onChange={handleInputChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                required
                placeholder="Örn: info@abclojistik.com veya +90 555 123 4567"
              />
            </div>

            {/* ============ TAŞIMA MODUNA GÖRE EK ALANLAR ============ */}
            
            {/* 🚛 Karayolu Ek Alanları */}
            {formData.serviceTransportMode === 'road' && (
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  🚛 Plaka / Şasi Numarası
                </label>
                <input
                  type="text"
                  id="plateNumber"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: 34 ABC 123 veya WJMM62AUZ7C123456"
                />
              </div>
            )}

            {/* 🚢 Denizyolu Ek Alanları */}
            {formData.serviceTransportMode === 'sea' && (
              <>
                <div>
                  <label htmlFor="shipName" className="block text-sm font-medium text-gray-700 mb-2">
                    🚢 Gemi Adı *
                  </label>
                  <input
                    type="text"
                    id="shipName"
                    name="shipName"
                    value={formData.shipName}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: MV KARGO EXPRESS"
                  />
                </div>
                <div>
                  <label htmlFor="imoNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    🆔 IMO No *
                  </label>
                  <input
                    type="text"
                    id="imoNumber"
                    name="imoNumber"
                    value={formData.imoNumber}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: IMO 1234567"
                  />
                </div>
                <div>
                  <label htmlFor="mmsiNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    📡 MMSI No *
                  </label>
                  <input
                    type="text"
                    id="mmsiNumber"
                    name="mmsiNumber"
                    value={formData.mmsiNumber}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: 271234567"
                  />
                </div>
                <div>
                  <label htmlFor="dwt" className="block text-sm font-medium text-gray-700 mb-2">
                    ⚖️ DWT / Tonaj *
                  </label>
                  <input
                    type="text"
                    id="dwt"
                    name="dwt"
                    value={formData.dwt}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: 25000 DWT"
                  />
                </div>
                <div>
                  <label htmlFor="shipDimensions" className="block text-sm font-medium text-gray-700 mb-2">
                    📏 Boyutlar (LOA, Beam) *
                  </label>
                  <input
                    type="text"
                    id="shipDimensions"
                    name="shipDimensions"
                    value={formData.shipDimensions}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: LOA: 180m, Beam: 28m"
                  />
                </div>
                <div>
                  <label htmlFor="freightType" className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Navlun Tipi *
                  </label>
                  <input
                    type="text"
                    id="freightType"
                    name="freightType"
                    value={formData.freightType}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    required
                    placeholder="Örn: Lump sum, USD/ton, Time charter"
                  />
                </div>
                <div>
                  <label htmlFor="chartererInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Charterer / Broker Bilgisi
                  </label>
                  <input
                    type="text"
                    id="chartererInfo"
                    name="chartererInfo"
                    value={formData.chartererInfo}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                    placeholder="Örn: ABC Shipping & Brokerage"
                  />
                </div>
              </>
            )}

            {/* ✈️ Havayolu Ek Alanları */}
            {formData.serviceTransportMode === 'air' && (
              <div>
                <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  ✈️ Uçuş Numarası
                </label>
                <input
                  type="text"
                  id="flightNumber"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: TK123 veya CRG456"
                />
              </div>
            )}

            {/* 🚂 Demiryolu Ek Alanları */}
            {formData.serviceTransportMode === 'rail' && (
              <div>
                <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  🚂 Tren/Kompozisyon No
                </label>
                <input
                  type="text"
                  id="trainNumber"
                  name="trainNumber"
                  value={formData.trainNumber}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Örn: TR-12345 veya K-KARGO-67"
                />
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              id="serviceDescription"
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              required
              placeholder="Nakliye hizmetiniz hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Dynamic Document List */}
          {formData.serviceTransportMode && (
            <div className="bg-white/50 rounded-3xl p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-primary-600" size={20} />
                📋 Gerekli Evraklar ({formData.serviceTransportMode === 'road' ? 'Karayolu' : formData.serviceTransportMode === 'sea' ? 'Denizyolu' : formData.serviceTransportMode === 'air' ? 'Havayolu' : 'Demiryolu'})
              </h4>
              {formData.serviceTransportMode === 'sea' ? (
                <>
                  {[
                    {
                      group: 'GEMİ OPERASYONEL & UYGUNLUK BELGELERİ (Vetting/Yeterlilik)',
                      documents: [
                        'Q88 Formu (Tanker teknik bilgi formu)',
                        'SIRE Inspection Report (Son, temiz)',
                        'CDI Certificate (Kimyasal taşımada)',
                        'PSC Inspection Records (Son liman devleti kontrolü)',
                        'Vetting Approval Record / Broker Questionnaire',
                        'DOC/SMC/ISPS Sertifikaları',
                        'Class Certificate / Class Status Report',
                        'P&I Insurance Certificate (Sorumluluk sigortası)',
                        'Hull & Machinery Insurance (Gövde/Makina Sigortası)',
                        'Last Drydock/Special Survey Report',
                        'Vessel Particulars / Registration Certificate'
                      ]
                    },
                    {
                      group: 'STANDART DENİZYOLU TAŞIMA BELGELERİ',
                      documents: [
                        'Bill of Lading (B/L) – Konşimento / Sea Waybill',
                        'Charter Party / Fixture Note (Varsa, kiralama)',
                        'Yükleme Listesi / Manifesto',
                        'Loading Certificate / Yükleme Sertifikası',
                        'Yükleme Planı (Loading Plan)',
                        'Mate’s Receipt',
                        'Surveyor Raporları (Ullage, Draft, SGS, Intertek)',
                        'IMO Deklarasyonu (Tehlikeli yük için)',
                        'Arrival Notice / Delivery Order',
                        'Liman Belgeleri (Tally Sheet, EIR)',
                        'Tank/Ambar Temizlik Sertifikası',
                        'Fumigasyon Sertifikası (gerekiyorsa)',
                        'Crew List / Personel Sertifikaları',
                        'ISM/ISPS Belgeleri',
                        'Gemi Fotoğrafları',
                        'Diğer (Belirtiniz): __________'
                      ]
                    }
                  ].map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                      <div className="font-semibold text-primary-700 mb-2">{group.group}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.documents.map((document, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`sea_doc_${groupIdx}_${idx}`}
                              checked={selectedDocuments.includes(document)}
                              onChange={() => handleDocumentSelect(document)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor={`sea_doc_${groupIdx}_${idx}`} className="ml-3 text-sm text-gray-700">
                              {document}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredDocuments[formData.serviceTransportMode as keyof typeof requiredDocuments]?.map((document, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`document-${index}`}
                        checked={selectedDocuments.includes(document)}
                        onChange={() => handleDocumentSelect(document)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`document-${index}`} className="ml-2 text-sm text-gray-700">
                        📄 {document}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedDocuments.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Seçilen Evraklar ({selectedDocuments.length})
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    {selectedDocuments.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evrak Yükleme Alanı */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2 text-primary-600" size={20} />
              Evrak Yükleme Alanı
            </h3>
            
            {/* Dosya Yükleme Alanı */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="documentUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="documentUpload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Evrakları buraya sürükleyin veya tıklayın</p>
                  <p className="text-sm text-gray-500">
                    Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Maksimum dosya boyutu: 10MB</p>
                </label>
              </div>
            </div>

            {/* Yüklenen Dosyalar Listesi */}
            {uploadedDocuments.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Yüklenen Evraklar ({uploadedDocuments.length})</h4>
                <div className="space-y-3">
                  {uploadedDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200">
                      <div className="flex items-center flex-1">
                        <span className="text-2xl mr-3">{getFileIcon(document.type)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{document.name}</p>
                          <p className="text-sm text-gray-500">{document.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleDocumentPreview(document)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Önizleme"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentDownload(document)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                          title="İndir"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentDelete(document.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSection('my-listings')}
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              İlanı Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransportServiceSection;