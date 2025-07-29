import React, { useState, useEffect } from 'react';
import LoadListingDetailModal from '../modals/listings/detail/LoadListingDetailModal';
import ShipmentRequestDetailModal from '../modals/listings/detail/ShipmentRequestDetailModal';
import TransportServiceDetailModal from '../modals/listings/detail/TransportServiceDetailModal';
import CreateOfferModal from '../modals/CreateOfferModal';
import { OfferService } from '../../services/offerService';
import EnhancedServiceOfferModal from '../modals/EnhancedServiceOfferModal';
import MessageModal from '../modals/MessageModal';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  ArrowRight,
  CheckCircle,
  Users,
  Package,
  Truck,
  Clock,
  MapPin,
  Eye,
  X,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import LiveMap from '../common/LiveMap';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import { useListings } from '../../hooks/useListings';
import type { ExtendedListing, TransportService } from '../../types/database-types';
import './HomePage.pins.css';

// Type definitions for HomePage
// ListingsPage'den alınan TransportService dönüşüm fonksiyonu
const convertToTransportService = (listing: ExtendedListing): TransportService => {
  const transportDetails = (listing.transport_details as Record<string, unknown>) || {};
  return {
    id: listing.id,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
    user_id: listing.user_id,
    service_number: listing.listing_number,
    title: listing.title,
    description: listing.description || null,
    status: listing.status === 'active' ? 'active' : 'inactive',
    transport_mode: listing.transport_mode || 'road',
    vehicle_type: transportDetails?.vehicle_type || listing.vehicle_types?.[0] || null,
    origin: listing.origin || null,
    destination: listing.destination || null,
    available_from_date: listing.available_from_date,
    available_until_date: listing.available_until_date,
    capacity_value: listing.weight_value || null,
    capacity_unit: listing.weight_unit || 'kg',
    contact_info: listing.owner_phone ? `Tel: ${listing.owner_phone}${listing.owner_email ? `\nE-posta: ${listing.owner_email}` : ''}${listing.owner_company ? `\nŞirket: ${listing.owner_company}` : ''}` : null,
    company_name: listing.owner_company || transportDetails?.company_name || null,
    plate_number: transportDetails?.plate_number || null,
    ship_name: transportDetails?.ship_name || null,
    imo_number: transportDetails?.imo_number || null,
    mmsi_number: transportDetails?.mmsi_number || null,
    dwt: transportDetails?.dwt || null,
    gross_tonnage: transportDetails?.gross_tonnage || null,
    net_tonnage: transportDetails?.net_tonnage || null,
    ship_dimensions: transportDetails?.ship_dimensions || null,
    freight_type: transportDetails?.freight_type || null,
    charterer_info: transportDetails?.charterer_info || null,
    ship_flag: transportDetails?.ship_flag || null,
    home_port: transportDetails?.home_port || null,
    year_built: transportDetails?.year_built || null,
    speed_knots: transportDetails?.speed_knots || null,
    fuel_consumption: transportDetails?.fuel_consumption || null,
    ballast_capacity: transportDetails?.ballast_capacity || null,
    flight_number: transportDetails?.flight_number || null,
    aircraft_type: transportDetails?.aircraft_type || null,
    max_payload: transportDetails?.max_payload || null,
    cargo_volume: transportDetails?.cargo_volume || null,
    train_number: transportDetails?.train_number || null,
    wagon_count: transportDetails?.wagon_count || null,
    wagon_types: transportDetails?.wagon_types || null,
    required_documents: transportDetails?.required_documents || null,
    document_urls: transportDetails?.document_urls || null,
    rating: transportDetails?.rating || 0,
    rating_count: transportDetails?.rating_count || 0,
    view_count: listing.view_count || 0,
    last_updated_by: listing.user_id,
    is_featured: transportDetails?.is_featured || listing.is_urgent || false,
    featured_until: transportDetails?.featured_until || null,
    created_by_user_type: null,
    last_activity_at: listing.updated_at
  } as unknown as TransportService;
};
interface MapUser {
  id: number;
  name: string;
  type: 'transport' | 'shipper' | 'buyer' | 'seller';
  coordinates: [number, number];
  details: string;
  avatar?: string;
  title?: string;
  route?: string;
  lastActive?: string;
  price?: string;
  productImage?: string;
}

interface HomePageProps {
  onShowDashboard: () => void;
  onShowListings?: () => void;
}

// Coordinate type for LiveMap
type Coordinate = { lat: number; lng: number };

// stats: array of { label: string, number: number, icon?: React.ElementType }
type Stat = { label: string; number: number; icon?: React.ElementType };

const HomePage: React.FC<HomePageProps> = ({ onShowDashboard, onShowListings }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { isLoggedIn, login, register, googleLogin, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMapUser, setSelectedMapUser] = useState<MapUser | null>(null);
  const [mapFilters, setMapFilters] = useState({
    buyers: true,
    sellers: true,
    carriers: true
  });
  // Geri eklenen state'ler:
const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);
  // Sekme ve filtreleme için state
  const [activeTab, setActiveTab] = useState<'all' | 'load' | 'shipment' | 'transport'>('all');
  const [filterText, setFilterText] = useState('');
  // Canlı veri
  const { listings, refetch } = useListings();
  // Dashboard stats için state
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Supabase'den dashboard stats çekimi (örnek: get_user_dashboard_stats fonksiyonu ile)
        // NOT: user id'yi auth context'ten alın
        const userId = (typeof window !== 'undefined' && window.localStorage.getItem('user_id')) || null;
        if (!userId) {
          setStats([]);
          setStatsLoading(false);
          return;
        }
        // Supabase importu
        const { supabase } = await import('../../lib/supabase');
        const { data, error } = await supabase.rpc('get_user_dashboard_stats', { user_id: userId });
        if (error) {
          setStats([]);
        } else {
          // data: [{ label, number, icon }] formatında olmalı
          setStats(data || []);
        }
      } catch {
        setStats([]);
      }
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  // Teklif Ver Modalı için state
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showCreateServiceOfferModal, setShowCreateServiceOfferModal] = useState(false);
  const [selectedOfferListing, setSelectedOfferListing] = useState<ExtendedListing | null>(null);

  // Mesaj modalı için state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<ExtendedListing | null>(null);

  const features = [
    {
      icon: Zap,
      title: 'Hızlı Eşleşme',
      subtitle: '30 saniyede teklif al',
      description: 'Gelişmiş algoritma ile en uygun nakliyeci ve yük eşleşmesi',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Güvenli İşlem',
      subtitle: 'Evrak ve sigorta koruması',
      description: 'Tüm işlemleriniz sigorta ve evrak güvencesi altında',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Çoklu Rol',
      subtitle: 'Alıcı, Satıcı, Nakliyeci aynı platformda',
      description: 'Tek platformda tüm lojistik ihtiyaçlarınızı karşılayın',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'İlan Oluştur',
      description: 'Yük veya nakliye ilanınızı kolayca oluşturun',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      number: '02',
      title: 'Teklif Al',
      description: 'Dakikalar içinde çoklu teklif alın',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      number: '03',
      title: 'Karşılaştır ve Onayla',
      description: 'En uygun teklifi seçin ve onaylayın',
      icon: CheckCircle,
      color: 'bg-purple-500'
    },
    {
      number: '04',
      title: 'Teslimatı Takip Et',
      description: 'Yükünüzü gerçek zamanlı takip edin',
      icon: Truck,
      color: 'bg-orange-500'
    }
  ];

  // Adımlar animasyonu için
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);
  // Sekme filtreleme fonksiyonu
  const filteredListings = listings.filter(listing => {
    if (activeTab === 'load' && listing.listing_type !== 'load_listing') return false;
    if (activeTab === 'shipment' && listing.listing_type !== 'shipment_request') return false;
    if (activeTab === 'transport' && listing.listing_type !== 'transport_service') return false;
    if (filterText && !listing.title?.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'bg-blue-500';
      case 'seller': return 'bg-green-500';
      case 'carrier': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'buyer': return 'Alıcı';
      case 'seller': return 'Satıcı';
      case 'carrier': return 'Nakliyeci';
      default: return 'Kullanıcı';
    }
  };

  const openGoogleMaps = (user: MapUser) => {
    if (user.coordinates && user.coordinates[0] != null && user.coordinates[1] != null) {
      const url = `https://www.google.com/maps/search/?api=1&query=${user.coordinates[0]},${user.coordinates[1]}`;
      window.open(url, '_blank');
    }
  };

  // Kullanıcı adı örneği (gerçek uygulamada auth'dan alınır)
  const currentUserName = 'Mehmet Yılmaz'; // Örnek, değiştirilebilir

  // Mock map users (gerçek veri ile değiştirilebilir)
  const mapUsers: MapUser[] = [
    { id: 1, name: 'Ali Veli', type: 'buyer', coordinates: [39.9, 32.85], details: 'Ankara', avatar: '', title: 'Yük Sahibi', route: 'Ankara - İstanbul', lastActive: '2 saat önce', price: '₺5000', productImage: '' },
    { id: 2, name: 'Ayşe Demir', type: 'seller', coordinates: [41.0, 29.0], details: 'İstanbul', avatar: '', title: 'Satıcı', route: 'İstanbul - İzmir', lastActive: '1 saat önce', price: '₺7000', productImage: '' },
    { id: 3, name: 'Mehmet Kargo', type: 'transport', coordinates: [38.4, 27.1], details: 'İzmir', avatar: '', title: 'Nakliyeci', route: 'İzmir - Antalya', lastActive: '10 dakika önce', price: '₺3000', productImage: '' },
  ];
  const filteredMapUsers = mapUsers.filter(u =>
    (mapFilters.buyers && u.type === 'buyer') ||
    (mapFilters.sellers && u.type === 'seller') ||
    (mapFilters.carriers && u.type === 'transport')
  );

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await register(fullName, email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const isOwnListing = (listing: ExtendedListing) => {
    if (!listing || !user?.id) return false;
    return listing.user_id === user.id;
  };

  const handleShowOffer = (listing: ExtendedListing) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    if (isOwnListing(listing)) {
      alert('Kendi ilanınıza teklif veremezsiniz!');
      return;
    }
    setSelectedOfferListing(listing);
    if (listing.listing_type === 'transport_service') {
      setShowCreateServiceOfferModal(true);
    } else {
      setShowCreateOfferModal(true);
    }
  };

  // Dosya yükleme değişikliği

  // Teklif formu submit

  // Detay modalı içindeki mesaj butonu için

  // Type guard for ExtendedListing

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Türkiye'nin
              </span>
              <br />
              <span className="text-white">Yeni Nesil</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Kargo & Taşıma Pazarı
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed max-w-4xl mx-auto">
              Alıcı, Satıcı ve Nakliyecileri Uçtan Uca Bağlayan Pazaryeri. KargoMarketing ile yük alım satımı ve nakliye süreçlerinizi tek platformda yönetin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <button
                className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center hover:rotate-1"
                aria-label="İlan Oluştur"
                title="İlan Oluştur"
                onClick={() => {
                  if (isLoggedIn) {
                    onShowDashboard();
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
              >
                <span>İlan Oluştur</span>
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={24} />
              </button>
              <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 flex items-center justify-center"
                aria-label="İlanları Keşfet" title="İlanları Keşfet"
                onClick={() => {
                  if (onShowListings) {
                    onShowListings();
                  } else {
                    navigate('/listings');
                  }
                }}
              >
                <span>İlanları Keşfet</span>
                <Package className="ml-2 group-hover:scale-125 transition-transform duration-300" size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {statsLoading ? (
                <div className="col-span-4 text-center py-8 text-blue-300 animate-pulse">Yükleniyor...</div>
              ) : stats && stats.length > 0 ? (
                stats.map((stat) => (
                  <div key={stat.label} className="text-center group cursor-pointer">
                    <div className="flex justify-center mb-2 transform group-hover:scale-125 transition-transform duration-300">
                      {/* Icon dinamik gelmiyorsa varsayılan ikon kullan */}
                      {stat.icon ? (
                        <stat.icon className="text-yellow-300 group-hover:text-yellow-200" size={24} />
                      ) : (
                        <Users className="text-yellow-300 group-hover:text-yellow-200" size={24} />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">{stat.number}</div>
                    <div className="text-sm text-blue-200 group-hover:text-blue-100 transition-colors duration-300">{stat.label}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-red-300">İstatistik bulunamadı.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <span className="text-primary-600">KargoMarketing</span> Nasıl Çalışır?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platformumuzun sunduğu avantajları ve lojistik süreçlerinizi nasıl optimize edebileceğinizi keşfedin.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Responsive Video Embed */}
              <div className="video-embed-responsive">
                <iframe
                  id="vp1uPtKt"
                  title="Video Player"
                  src="https://s3.amazonaws.com/embed.animoto.com/play.html?w=swf/production/vp1&e=1750969143&f=uPtKt76FIJhLEgxM8d1KFA&d=0&m=p&r=360p+720p&volume=100&start_res=720p&i=m&asset_domain=s3-p.animoto.com&animoto_domain=animoto.com&options="
                  allowFullScreen
                  width="432"
                  height="243"
                  frameBorder="0"
                  aria-label="Video Player"
                ></iframe>
              </div>
              <div className="p-8 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-wrap gap-8 justify-center">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Clock size={24} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Video Süresi</p>
                      <p className="text-gray-600">2:45 dk</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Play size={24} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">HD Kalite</p>
                      <p className="text-gray-600">1080p</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Globe size={24} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Altyazı</p>
                      <p className="text-gray-600">TR/EN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Neden <span className="text-primary-600">KargoMarketing?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern teknoloji ile lojistik sektörünü dönüştürüyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border border-gray-100 cursor-pointer">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-primary-600 font-semibold mb-4 group-hover:text-primary-700 transition-colors duration-300">{feature.subtitle}</p>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-primary-600">Nasıl</span> Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              4 basit adımda yükünüzü taşıyın veya nakliye hizmeti verin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className={`relative group ${currentStep === index ? 'scale-110' : ''} transition-all duration-500 cursor-pointer`}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-3xl transition-all duration-500 text-center relative overflow-hidden transform hover:scale-110 hover:rotate-2">
                  {/* Step Number */}
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <step.icon className="text-gray-400 mx-auto group-hover:text-primary-600 group-hover:scale-125 transition-all duration-300" size={40} />
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-500"></div>
                  )}

                  {/* Floating Elements */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button className="bg-primary-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 hover:rotate-1 shadow-xl hover:shadow-2xl"
              aria-label="Hemen Başla" title="Hemen Başla">
              Hemen Başla!
            </button>
          </div>
        </div>
      </section>

      {/* Active Listings Section with Live Map */}
      {/* --- REFACTORED FEATURED LISTINGS SECTION START --- */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Öne Çıkan <span className="text-primary-600">İlanlar</span>
            </h2>
            <p className="text-xl text-gray-600">
              En güncel yük, nakliye ve taşıma ilanlarını keşfedin. Binlerce ilan arasından size uygun olanı hemen bulun.
            </p>
          </div>
          {/* Sekme ve filtreleme */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Tüm İlanlar</button>
              <button onClick={() => setActiveTab('load')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'load' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Yük İlanları</button>
              <button onClick={() => setActiveTab('shipment')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'shipment' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Nakliye Talebi</button>
              <button onClick={() => setActiveTab('transport')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'transport' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Nakliye Hizmeti</button>
            </div>
            <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="İlan ara..." className="px-4 py-2 rounded-lg border border-gray-300" />
          </div>
          {/* Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold" title="İlan No">
                          {listing.listing_number}
                        </span>
                        {listing.is_urgent && (
                          <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                            <Clock size={12} className="mr-1" />
                            Acil
                          </div>
                        )}
                        {/* Kendi ilanı kontrolü için owner bilgisi kullanılmalı */}
                        {listing.owner_name === currentUserName && (
                          <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Sizin İlanınız
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
                        {listing.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {listing.price_amount ? `${listing.price_amount} ${listing.price_currency || '₺'}` : 'Fiyat Yok'}
                      </div>
                      <div className="text-xs text-gray-500">{listing.offer_count || 0} teklif</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={14} className="mr-2 text-primary-500" />
                      <span className="text-sm">{listing.origin} → {listing.destination}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Package size={14} className="mr-2 text-primary-500" />
                      <span className="text-sm">{listing.load_type} • {listing.weight_value} {listing.weight_unit}</span>
                    </div>
                  </div>

                  {/* Contact Info - Only for logged in users */}
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">
                            {listing.owner_name ? listing.owner_name.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{listing.owner_name}</div>
                          <div className="text-xs text-gray-500">{listing.owner_company}</div>
                          <div className="text-xs text-gray-500">{listing.owner_phone}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center text-yellow-800">
                        <span className="text-sm font-medium">İletişim bilgilerini görmek için giriş yapın</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini Map */}
                <div className="h-32 border-t border-gray-100">
                  <LiveMap
                    coordinates={Array.isArray(listing.route_waypoints) ? (listing.route_waypoints as Coordinate[]) : []}
                    height="128px"
                    onClick={() => setSelectedListing(listing)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>

                {/* Actions */}
                <div className="p-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {/* Teklif Ver Butonu */}
                    <button
                      onClick={() => handleShowOffer(listing)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${isOwnListing(listing)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      disabled={isOwnListing(listing)}
                    >
                      {isOwnListing(listing) ? 'Kendi İlanınız' : (isLoggedIn ? 'Teklif Ver' : 'Giriş Yap')}
                    </button>
                    {/* Mesaj Gönder Butonu */}
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          setAuthModalOpen(true);
                          return;
                        }
                        if (isOwnListing(listing)) {
                          alert('Kendi ilanınıza mesaj gönderemezsiniz!');
                          return;
                        }
                        setMessageTarget(listing);
                        setShowMessageModal(true);
                      }}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(listing)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      disabled={isOwnListing(listing)}
                    >
                      {isLoggedIn
                        ? isOwnListing(listing)
                          ? 'Kendi İlanınız'
                          : 'Mesaj Gönder'
                        : 'Giriş Yap'}
                    </button>
                    {/* Detayları Görüntüle Butonu */}
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105"
                      title="Detayları Görüntüle"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* MessageModal sadece bir kez, gridin dışında render edilir */}
          {showMessageModal && messageTarget && (
            <MessageModal
              isOpen={showMessageModal}
              onClose={() => setShowMessageModal(false)}
              target={messageTarget}
              currentUserId={user?.id || null}
            />
          )}
          {/* Load More */}
          <div className="text-center mt-12">
            <button onClick={refetch} className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl">
              Daha Fazla İlan Yükle
            </button>
          </div>
        </div>
      </section>
      {/* --- REFACTORED FEATURED LISTINGS SECTION END --- */}

      {/* Live Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Canlı <span className="text-primary-600">Harita</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Türkiye genelindeki aktif alıcı, satıcı ve nakliyecileri gerçek zamanlı olarak görün.
              İhtiyacınıza en yakın kullanıcıları keşfedin.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={mapFilters.buyers}
                      onChange={(e) => setMapFilters(prev => ({ ...prev, buyers: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.buyers ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}></div>
                    <span className={`font-medium transition-colors duration-300 ${mapFilters.buyers ? 'text-blue-600' : 'text-gray-500'} group-hover:text-blue-600`}>
                      Alıcılar ({mapUsers.filter(u => u.type === 'buyer').length})
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={mapFilters.sellers}
                      onChange={(e) => setMapFilters(prev => ({ ...prev, sellers: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.sellers ? 'bg-green-500 scale-110' : 'bg-gray-300'}`}></div>
                    <span className={`font-medium transition-colors duration-300 ${mapFilters.sellers ? 'text-green-600' : 'text-gray-500'} group-hover:text-green-600`}>
                      Satıcılar ({mapUsers.filter(u => u.type === 'seller').length})
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={mapFilters.carriers}
                      onChange={(e) => setMapFilters(prev => ({ ...prev, carriers: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.carriers ? 'bg-orange-500 scale-110' : 'bg-gray-300'}`}></div>
                    <span className={`font-medium transition-colors duration-300 ${mapFilters.carriers ? 'text-orange-600' : 'text-gray-500'} group-hover:text-orange-600`}>
                      Nakliyeciler ({mapUsers.filter(u => u.type === 'transport').length})
                    </span>
                  </label>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Toplam Aktif:</span> {filteredMapUsers.length} kullanıcı
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[600px] bg-gradient-to-br from-blue-50 to-green-50">
              <LiveMap
                coordinates={filteredMapUsers.map(u => ({ lat: u.coordinates[0], lng: u.coordinates[1] }))}
                height="600px"
              />
              {/* İsteğe bağlı: üstteki svg, legend, butonlar burada kalabilir veya haritanın üstüne overlay olarak eklenebilir */}
            </div>
          </div>
        </div>
      </section>

      {/* User Profile Card Modal */}
      {selectedMapUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full transform scale-100 transition-all duration-300 shadow-2xl">
            <button
              onClick={() => setSelectedMapUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transform hover:scale-125 hover:rotate-90 transition-all duration-300"
              aria-label="Kapat"
              title="Kapat"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <img
                  src={selectedMapUser.avatar}
                  alt={selectedMapUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getUserTypeColor(selectedMapUser.type)} rounded-full flex items-center justify-center border-2 border-white`}>
                  <span className="text-white text-xs font-bold">
                    {selectedMapUser.type === 'buyer' ? 'A' : selectedMapUser.type === 'seller' ? 'S' : 'N'}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedMapUser.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedMapUser.type === 'buyer' ? 'bg-blue-100 text-blue-800' :
                selectedMapUser.type === 'seller' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                {getUserTypeLabel(selectedMapUser.type)}
              </span>
            </div>
            <div className="mb-6">
              <img
                src={selectedMapUser.productImage}
                alt="Ürün"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">{selectedMapUser.title}</h4>
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2 text-primary-500" />
                <span className="text-sm">{selectedMapUser.route}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Son aktivite: {selectedMapUser.lastActive}</span>
                <span className="text-lg font-bold text-primary-600">{selectedMapUser.price}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                aria-label="Detay Gör" title="Detay Gör">
                Detay Gör
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                aria-label="Teklif Ver" title="Teklif Ver">
                Teklif Ver
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => openGoogleMaps(selectedMapUser)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                aria-label="Google Maps'te Gör"
                title="Google Maps'te Gör"
              >
                <Globe size={16} className="text-primary-600" />
                Google Maps'te Gör
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listing Detail Modal (Önizleme) - ListingsPage ile birebir aynı yapı */}
      {selectedListing && selectedListing.listing_type === 'load_listing' && (
        <LoadListingDetailModal
          listing={selectedListing}
          isOpen={true}
          onClose={() => setSelectedListing(null)}
        />
      )}
      {selectedListing && selectedListing.listing_type === 'shipment_request' && (
        <ShipmentRequestDetailModal
          listing={selectedListing}
          isOpen={true}
          onClose={() => setSelectedListing(null)}
        />
      )}
      {selectedListing && selectedListing.listing_type === 'transport_service' && (
        <TransportServiceDetailModal
          service={convertToTransportService(selectedListing)}
          isOpen={true}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {/* Teklif Ver Modalı */}

      {/* CreateOfferModal - Yük İlanı ve Nakliye Talebi için */}
      {selectedOfferListing && showCreateOfferModal && (
        <CreateOfferModal
          listing={selectedOfferListing}
          isOpen={showCreateOfferModal}
          onClose={() => { setShowCreateOfferModal(false); setSelectedOfferListing(null); }}
          onSubmit={async (offerData) => {
            try {
              await OfferService.createOffer({ ...offerData });
              setShowCreateOfferModal(false);
              setSelectedOfferListing(null);
            } catch {
              // Hata modalında zaten gösteriliyor
            }
          }}
          currentUserId={auth?.user?.id || ''}
        />
      )}

      {/* EnhancedServiceOfferModal - Nakliye Hizmeti için */}
      {selectedOfferListing && showCreateServiceOfferModal && (
        <EnhancedServiceOfferModal
          transportService={selectedOfferListing}
          isOpen={showCreateServiceOfferModal}
          onClose={() => { setShowCreateServiceOfferModal(false); setSelectedOfferListing(null); }}
          onSuccess={() => { setShowCreateServiceOfferModal(false); setSelectedOfferListing(null); }}
        />
      )}

    {/* AuthModal */}
    <AuthModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onGoogleLogin={handleGoogleLogin}
    />
  </div>
);
}

export default HomePage;