import React, { useState, useEffect } from 'react';
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
  LogIn,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import LiveMap from '../common/LiveMap';
import { listings, type Listing } from '../../data/listings';
import { translateLoadType } from '../../utils/translationUtils';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import './HomePage.pins.css';

// Type definitions for HomePage
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

const HomePage: React.FC<HomePageProps> = ({ onShowDashboard, onShowListings }) => {
  const navigate = useNavigate();
  const { isLoggedIn, login, register, googleLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMapUser, setSelectedMapUser] = useState<MapUser | null>(null);
  const [mapFilters, setMapFilters] = useState({
    buyers: true,
    sellers: true,
    carriers: true
  });
  // Geri eklenen state'ler:
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Teklif Ver Modalı için state
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOfferForm, setNewOfferForm] = useState({
    listingId: '',
    price: '',
    description: '',
    transportResponsible: '',
    origin: '',
    destination: '',
    files: [] as File[]
  });

  // Mesaj modalı için state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<Listing | null>(null);

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

  const mapUsers = [
    {
      id: 1,
      name: 'Mehmet Yılmaz',
      type: 'buyer',
      title: 'İstanbul-Ankara Tekstil Yükü',
      location: 'İstanbul',
      route: 'İstanbul → Ankara',
      coordinates: { lat: 41.0082, lng: 28.9784 },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
      lastActive: '5 dk önce',
      price: '₺4.500'
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      type: 'seller',
      title: 'Bursa Tekstil Ürünleri Satışı',
      location: 'Bursa',
      route: 'Bursa → Tüm Türkiye',
      coordinates: { lat: 40.1826, lng: 29.0665 },
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=150&fit=crop',
      lastActive: '12 dk önce',
      price: '₺125.000'
    },
    {
      id: 3,
      name: 'Ali Kaya',
      type: 'carrier',
      title: 'İzmir-Ankara Frigorifik Taşıma',
      location: 'İzmir',
      route: 'İzmir → Ankara',
      coordinates: { lat: 38.4192, lng: 27.1287 },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&h=150&fit=crop',
      lastActive: '3 dk önce',
      price: '₺8.500'
    },
    {
      id: 4,
      name: 'Fatma Özkan',
      type: 'buyer',
      title: 'Ankara-İzmir Elektronik Alımı',
      location: 'Ankara',
      route: 'Ankara → İzmir',
      coordinates: { lat: 39.9334, lng: 32.8597 },
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=150&fit=crop',
      lastActive: '8 dk önce',
      price: '₺65.000'
    },
    {
      id: 5,
      name: 'Hasan Yıldız',
      type: 'seller',
      title: 'Adana Organik Ürünler',
      location: 'Adana',
      route: 'Adana → İstanbul',
      coordinates: { lat: 37.0000, lng: 35.3213 },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=150&fit=crop',
      lastActive: '15 dk önce',
      price: '₺45.000'
    },
    {
      id: 6,
      name: 'Zeynep Akar',
      type: 'carrier',
      title: 'İstanbul-Antalya Karayolu',
      location: 'İstanbul',
      route: 'İstanbul → Antalya',
      coordinates: { lat: 41.0082, lng: 28.9784 },
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&h=150&fit=crop',
      lastActive: '1 dk önce',
      price: '₺12.000'
    },
    {
      id: 7,
      name: 'Murat Şen',
      type: 'buyer',
      title: 'Antalya-Mersin Gıda Alımı',
      location: 'Antalya',
      route: 'Antalya → Mersin',
      coordinates: { lat: 36.8969, lng: 30.7133 },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=200&h=150&fit=crop',
      lastActive: '20 dk önce',
      price: '₺28.000'
    },
    {
      id: 8,
      name: 'Elif Kara',
      type: 'seller',
      title: 'Trabzon Fındık Üretimi',
      location: 'Trabzon',
      route: 'Trabzon → Tüm Türkiye',
      coordinates: { lat: 41.0015, lng: 39.7178 },
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      productImage: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=200&h=150&fit=crop',
      lastActive: '6 dk önce',
      price: '₺85.000'
    }
  ];

  const stats: { number: string; label: string; icon: React.ElementType }[] = [
    { number: '50,000+', label: 'Aktif Kullanıcı', icon: Users },
    { number: '1M+', label: 'Taşınan Yük', icon: Package },
    { number: '5,000+', label: 'Nakliyeci', icon: Truck },
    { number: '99.8%', label: 'Müşteri Memnuniyeti', icon: CheckCircle }
  ];

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

  const filteredMapUsers = mapUsers.filter(user => {
    if (user.type === 'buyer' && !mapFilters.buyers) return false;
    if (user.type === 'seller' && !mapFilters.sellers) return false;
    if (user.type === 'carrier' && !mapFilters.carriers) return false;
    return true;
  });

  const openGoogleMaps = (user: MapUser) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${user.coordinates[0]},${user.coordinates[1]}`;
    window.open(url, '_blank');
  };

  // Kullanıcı adı örneği (gerçek uygulamada auth'dan alınır)
  const currentUserName = 'Mehmet Yılmaz'; // Örnek, değiştirilebilir

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

  const isOwnListing = (listing: Listing) => {
    if (!listing || !listing.contact) return false;
    return listing.contact.name === currentUserName;
  };

  const handleShowOffer = (listing: Listing) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    if (isOwnListing(listing)) {
      alert('Kendi ilanınıza teklif veremezsiniz!');
      return;
    }
    setNewOfferForm({
      listingId: listing.ilanNo || '', // Sadece ilanNo kullanılacak
      price: '',
      description: '',
      transportResponsible: '',
      origin: '',
      destination: '',
      files: []
    });
    setShowNewOfferModal(true);
  };

  // Dosya yükleme değişikliği
  const handleNewOfferFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
    }
  };

  // Teklif formu submit
  const handleNewOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasyon örneği
    if (!newOfferForm.price || !newOfferForm.transportResponsible || !newOfferForm.origin || !newOfferForm.destination) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }
    // API çağrısı simülasyonu
    alert('Teklif gönderildi!');
    setShowNewOfferModal(false);
  };

  // Detay modalı içindeki mesaj butonu için
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    // Burada API çağrısı yapılabilir
    alert('Mesaj gönderildi!');
    setShowMessageModal(false);
    setMessageText('');
  };

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
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group cursor-pointer">
                  <div className="flex justify-center mb-2 transform group-hover:scale-125 transition-transform duration-300">
                    <stat.icon className="text-yellow-300 group-hover:text-yellow-200" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">{stat.number}</div>
                  <div className="text-sm text-blue-200 group-hover:text-blue-100 transition-colors duration-300">{stat.label}</div>
                </div>
              ))}
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

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>

                  {/* Active Indicator */}
                  {currentStep === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-2xl"></div>
                  )}

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
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Öne Çıkan <span className="text-primary-600">İlanlar</span>
            </h2>
            <p className="text-xl text-gray-600">
              En güncel yük, nakliye ve taşıma ilanlarını keşfedin. Binlerce ilan arasından size uygun olanı hemen bulun.
            </p>
          </div>

          {/* Listings Grid - Copied from ListingsPage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold" title="İlan No">
                          {listing.ilanNo}
                        </span>
                        {listing.urgent && (
                          <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                            <Clock size={12} className="mr-1" />
                            Acil
                          </div>
                        )}
                        {isOwnListing(listing) && (
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
                      <div className="text-2xl font-bold text-primary-600">{listing.price}</div>
                      <div className="text-xs text-gray-500">{listing.offers} teklif</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={14} className="mr-2 text-primary-500" />
                      <span className="text-sm">{listing.route}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Package size={14} className="mr-2 text-primary-500" />
                      <span className="text-sm">{translateLoadType(listing.loadType)} • {listing.weight}</span>
                    </div>
                  </div>

                  {/* Contact Info - Only for logged in users */}
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">
                            {listing.contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{listing.contact.name}</div>
                          <div className="text-xs text-gray-500">{listing.contact.company}</div>
                          <div className="text-xs text-gray-500">{listing.contact.phone}</div>
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
                    coordinates={[listing.coordinates]}
                    height="128px"
                    onClick={() => setSelectedListing(listing)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>

                {/* Actions */}
                <div className="p-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShowOffer(listing)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${isOwnListing(listing)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      disabled={isOwnListing(listing)}
                    >
                      {isLoggedIn
                        ? isOwnListing(listing)
                          ? 'Kendi İlanınız'
                          : 'Teklif Ver'
                        : 'Giriş Yap'}
                    </button>
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105"
                      title="Detayları Görüntüle"
                    >
                      <Eye size={16} />
                    </button>
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl">
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
                      Nakliyeciler ({mapUsers.filter(u => u.type === 'carrier').length})
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
                coordinates={filteredMapUsers.map(u => ({ lat: u.coordinates.lat, lng: u.coordinates.lng }))}
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
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
              title="Kapat"
              aria-label="Kapat"
            >
              <X size={24} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Kolon */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedListing.urgent && (
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock size={16} className="mr-1" />
                        Acil İlan
                      </div>
                    )}
                    <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {translateLoadType(selectedListing.loadType)}
                    </div>
                    {isOwnListing(selectedListing) && (
                      <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Sizin İlanınız
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedListing.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={18} className="mr-2 text-primary-500" />
                    <span className="text-lg">{selectedListing.route}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Yük Detayları</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Yük Tipi:</span>
                      <div className="font-medium">{translateLoadType(selectedListing.loadType)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Ağırlık:</span>
                      <div className="font-medium">{selectedListing.weight}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Fiyat:</span>
                      <div className="font-medium">{selectedListing.price}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Teklif:</span>
                      <div className="font-medium">{selectedListing.offers} teklif</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Açıklama</h4>
                  <p className="text-gray-700">{selectedListing.description || 'Açıklama bulunamadı.'}</p>
                </div>
                {/* İletişim Bilgileri - Sadece giriş yapan kullanıcılar için */}
                {isLoggedIn ? (
                  <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                    <div className="flex items-center mb-4">
                      <h4 className="font-semibold text-gray-900">İletişim Bilgileri</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>İsim:</strong> {selectedListing.contact?.name}</div>
                      <div><strong>Firma:</strong> {selectedListing.contact?.company}</div>
                      <div><strong>Telefon:</strong> {selectedListing.contact?.phone}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center text-yellow-800 mb-3">
                      <LogIn size={20} className="mr-2" />
                      <h4 className="font-semibold">İletişim Bilgileri</h4>
                    </div>
                    <p className="text-yellow-700 text-sm mb-4">
                      İletişim bilgilerini görmek ve teklif vermek için giriş yapmanız gerekiyor.
                    </p>
                  </div>
                )}
              </div>

              {/* Sağ Kolon - Büyük Harita ve Diğer Kutular Dikey Hizalı */}
              <div className="hidden lg:flex flex-col items-stretch gap-6">
                {/* Büyük Harita */}
                <div className="h-80 rounded-lg overflow-hidden border border-gray-200 mb-0">
                  <LiveMap
                    coordinates={[selectedListing.coordinates, selectedListing.destination]}
                    height="320px"
                    showRoute={true}
                  />
                </div>
                {/* Fiyat ve Teklifler */}
                <div className="bg-white border-2 border-primary-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{selectedListing.price}</div>
                    <div className="text-gray-600 mb-4">{selectedListing.offers} teklif alındı</div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleShowOffer(selectedListing)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Teklif Ver'}
                      </button>
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            setAuthModalOpen(true);
                            return;
                          }
                          if (isOwnListing(selectedListing)) {
                            alert('Kendi ilanınıza mesaj gönderemezsiniz!');
                            return;
                          }
                          setMessageTarget(selectedListing);
                          setShowMessageModal(true);
                        }}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        disabled={isOwnListing(selectedListing)}
                      >
                        {isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Mesaj Gönder'}
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Teklif Ver Modalı */}
      {showNewOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative">
            <button onClick={() => setShowNewOfferModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-6">Yeni Teklif Ver</h3>
            <form onSubmit={handleNewOfferSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">İlan Numarası</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  value={newOfferForm.listingId}
                  disabled
                  readOnly
                  title="İlan Numarası"
                  placeholder="İlan Numarası"
                  aria-label="İlan Numarası"
                />
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
                  value={newOfferForm.destination}
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
                Teklif Ver
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mesaj Gönder Modalı */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative">
            <button onClick={() => setShowMessageModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold mb-4">Mesaj Gönder</h3>
            <div className="mb-2 text-sm font-semibold uppercase text-gray-500">
              Alıcı: <span className="text-primary-600 font-bold underline cursor-pointer">{messageTarget?.contact?.name || ''}</span>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alıcı</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900"
                  value={messageTarget?.contact?.name || ''}
                  disabled
                  readOnly
                  title="Alıcı"
                  aria-label="Alıcı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mesajınız</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={3}
                  required
                  title="Mesajınız"
                  placeholder="Mesajınızı yazın..."
                  aria-label="Mesajınız"
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
                Gönder
              </button>
            </form>
          </div>
        </div>
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
};

export default HomePage;