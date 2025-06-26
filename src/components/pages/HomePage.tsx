import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Package, 
  Truck, 
  Clock,
  Shield,
  Zap,
  Globe,
  Heart,
  MapPin,
  Eye,
  MessageCircle,
  ExternalLink,
  X
} from 'lucide-react';
import LiveMap from '../common/LiveMap.tsx';
import './HomePage.pins.css';

const HomePage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedMapUser, setSelectedMapUser] = useState<any>(null);
  const [mapFilters, setMapFilters] = useState({
    buyers: true,
    sellers: true,
    carriers: true
  });

  // Otomatik slider için
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Adımlar animasyonu için
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const activeListings = [
    {
      id: 1,
      title: 'İstanbul-Ankara Tekstil Yükü',
      route: 'İstanbul → Ankara',
      loadType: 'Tekstil',
      weight: '15 ton',
      offers: 8,
      price: '₺4.500',
      urgent: true,
      coordinates: { lat: 41.0082, lng: 28.9784 },
      destination: { lat: 39.9334, lng: 32.8597 },
      contact: {
        name: 'Mehmet Yılmaz',
        company: 'Yılmaz Tekstil A.Ş.',
        phone: '+90 555 123 4567'
      }
    },
    {
      id: 2,
      title: 'İzmir-Bursa Elektronik Eşya',
      route: 'İzmir → Bursa',
      loadType: 'Elektronik',
      weight: '8 ton',
      offers: 12,
      price: '₺3.200',
      urgent: false,
      coordinates: { lat: 38.4192, lng: 27.1287 },
      destination: { lat: 40.1826, lng: 29.0665 },
      contact: {
        name: 'Ayşe Demir',
        company: 'Demir Elektronik Ltd.',
        phone: '+90 555 987 6543'
      }
    },
    {
      id: 3,
      title: 'Ankara-Antalya Gıda Taşıma',
      route: 'Ankara → Antalya',
      loadType: 'Gıda',
      weight: '20 ton',
      offers: 6,
      price: '₺5.800',
      urgent: true,
      coordinates: { lat: 39.9334, lng: 32.8597 },
      destination: { lat: 36.8969, lng: 30.7133 },
      contact: {
        name: 'Ali Kaya',
        company: 'Kaya Gıda San. Tic.',
        phone: '+90 555 456 7890'
      }
    }
  ];

  // Harita üzerindeki kullanıcılar
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

  const testimonials = [
    {
      name: 'Mehmet Yılmaz',
      company: 'Yılmaz Lojistik',
      role: 'Nakliyeci',
      content: 'Kargo Market sayesinde iş hacmim %300 arttı. Artık boş dönüş yok!',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Ayşe Demir',
      company: 'Demir Tekstil',
      role: 'Alıcı/Satıcı',
      content: 'Nakliye maliyetlerimiz %40 azaldı. Harika bir platform!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Ali Kaya',
      company: 'Kaya İnşaat',
      role: 'Nakliyeci',
      content: 'Güvenli ödeme sistemi ve hızlı eşleşme. Kesinlikle tavsiye ederim.',
      rating: 5,
      avatar: '👨‍🔧'
    }
  ];

  const partners = [
    { name: 'Aras Kargo', logo: '🚚' },
    { name: 'MNG Kargo', logo: '📦' },
    { name: 'Yurtiçi Kargo', logo: '🚛' },
    { name: 'UPS', logo: '📮' },
    { name: 'DHL', logo: '✈️' },
    { name: 'FedEx', logo: '🌍' }
  ];

  const stats = [
    { number: '50,000+', label: 'Aktif Kullanıcı', icon: Users },
    { number: '1M+', label: 'Taşınan Yük', icon: Package },
    { number: '5,000+', label: 'Nakliyeci', icon: Truck },
    { number: '99.8%', label: 'Müşteri Memnuniyeti', icon: Heart }
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

  const openGoogleMaps = (user: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${user.coordinates.lat},${user.coordinates.lng}`;
    window.open(url, '_blank');
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
              Alıcı, Satıcı ve Nakliyecileri Uçtan Uca Bağlayan Pazaryeri. Kargo Market ile yük alım satımı ve nakliye süreçlerinizi tek platformda yönetin.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <button className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center hover:rotate-1"
                aria-label="İlan Oluştur" title="İlan Oluştur">
                <span>İlan Oluştur</span>
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={24} />
              </button>
              <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center justify-center hover:-rotate-1"
                aria-label="İlanları Keşfet" title="İlanları Keşfet">
                <span>İlanları Keşfet</span>
                <Package className="ml-2 group-hover:scale-125 transition-transform duration-300" size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
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
              <span className="text-primary-600">Kargo Market</span> Nasıl Çalışır?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platformumuzun sunduğu avantajları ve lojistik süreçlerinizi nasıl optimize edebileceğinizi keşfedin.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="aspect-video relative">
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <button 
                      onClick={() => setVideoModalOpen(true)}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-all duration-500 mb-4 group hover:shadow-2xl hover:bg-primary-50"
                      aria-label="Tanıtım videosunu oynat"
                      title="Tanıtım videosunu oynat"
                    >
                      <Play className="text-primary-600 ml-2 group-hover:scale-110 transition-transform duration-300" size={32} />
                    </button>
                    <p className="text-white text-lg font-medium">Tanıtım Filmini İzle</p>
                    <p className="text-gray-300 text-sm mt-2">2:45 dk • HD Kalite • TR/EN Altyazı</p>
                  </div>
                </div>
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
              Neden <span className="text-primary-600">Kargo Market?</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeListings.map((listing) => (
              <div key={listing.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border border-gray-100 cursor-pointer">
                {listing.urgent && (
                  <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mb-4 group-hover:animate-pulse">
                    <Clock size={16} className="mr-1" />
                    Acil
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {listing.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    <MapPin size={16} className="mr-2 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{listing.route}</span>
                  </div>
                  <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    <Package size={16} className="mr-2 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{listing.loadType} • {listing.weight}</span>
                  </div>
                </div>

                {/* Mini Map */}
                <div className="mb-4 h-32 rounded-lg overflow-hidden border border-gray-200 group-hover:border-primary-300 transition-colors duration-300">
                  <LiveMap 
                    coordinates={[listing.coordinates]}
                    height="128px"
                    onClick={() => setSelectedListing(listing)}
                    className="cursor-pointer hover:opacity-80 transition-opacity transform group-hover:scale-105 duration-300"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary-600 group-hover:text-primary-700 transition-colors duration-300">{listing.price}</div>
                  <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">{listing.offers} teklif</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 group-hover:shadow-lg transform hover:scale-105 hover:rotate-1"
                    aria-label="Hemen Teklif Ver" title="Hemen Teklif Ver">
                    Hemen Teklif Ver
                  </button>
                  <button 
                    onClick={() => setSelectedListing(listing)}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                    aria-label="İlanı Görüntüle"
                    title="İlanı Görüntüle"
                  >
                    <Eye size={18} />
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-110 hover:-rotate-3"
                    aria-label="Mesaj Gönder"
                    title="Mesaj Gönder"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center mx-auto transform hover:scale-105 hover:rotate-1 duration-300"
              aria-label="Tüm İlanları Görüntüle"
              title="Tüm İlanları Görüntüle">
              <span>Tüm İlanları Görüntüle</span>
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={20} />
            </button>
          </div>
        </div>
      </section>

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
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                selectedMapUser.type === 'buyer' ? 'bg-blue-100 text-blue-800' :
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
                <ExternalLink size={16} />
                <span className="text-sm">Google Maps'te Gör</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Müşterilerimiz <span className="text-primary-600">Ne Diyor?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Binlerce memnun kullanıcımızdan bazı yorumlar
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl transform hover:scale-105 transition-all duration-500 hover:rotate-1">
              <div className="text-center">
                <p className="text-2xl text-gray-700 mb-8 leading-relaxed italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current hover:scale-125 transition-transform duration-300" size={24} />
                  ))}
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-4xl mr-4 hover:scale-125 transition-transform duration-300">{testimonials[currentTestimonial].avatar}</div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-primary-600 font-semibold">{testimonials[currentTestimonial].company}</p>
                    <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-150 ${
                    currentTestimonial === index ? 'bg-primary-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Kargo Market'e Hemen Katılın
          </h2>
          <h3 className="text-3xl lg:text-5xl font-bold mb-8 text-yellow-300">
            Lojistik süreçlerinizi optimize edin!
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="group bg-white text-primary-600 px-12 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-2xl flex items-center"
              aria-label="Hemen Üye Olun" title="Hemen Üye Olun">
              <Users className="mr-3 group-hover:scale-125 transition-transform duration-300" size={24} />
              <span>Hemen Üye Olun</span>
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" size={24} />
            </button>
            <button className="group border-2 border-white text-white px-12 py-4 rounded-xl font-bold text-xl hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 flex items-center"
              aria-label="Daha Fazla Bilgi" title="Daha Fazla Bilgi">
              <Package className="mr-3 group-hover:scale-125 transition-transform duration-300" size={24} />
              <span>Daha Fazla Bilgi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center group cursor-pointer">
              <CheckCircle className="text-green-300 mr-3 group-hover:scale-125 transition-transform duration-300" size={24} />
              <span className="text-lg group-hover:text-yellow-300 transition-colors duration-300">100% Ücretsiz Kayıt</span>
            </div>
            <div className="flex items-center justify-center group cursor-pointer">
              <Shield className="text-green-300 mr-3 group-hover:scale-125 transition-transform duration-300" size={24} />
              <span className="text-lg group-hover:text-yellow-300 transition-colors duration-300">Güvenli Ödeme</span>
            </div>
            <div className="flex items-center justify-center group cursor-pointer">
              <Clock className="text-green-300 mr-3 group-hover:scale-125 transition-transform duration-300" size={24} />
              <span className="text-lg group-hover:text-yellow-300 transition-colors duration-300">7/24 Destek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Güvenilir Partnerlerimiz</h3>
            <p className="text-gray-600">Sektörün önde gelen firmaları ile çalışıyoruz</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="group flex items-center space-x-3 bg-white px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-2 cursor-pointer">
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{partner.logo}</span>
                <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors duration-300">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full transform scale-100 transition-all duration-300">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-125 hover:rotate-90 transition-all duration-300"
              aria-label="Kapat"
              title="Kapat"
            >
              ×
            </button>
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-white text-center">
                <Play size={64} className="mx-auto mb-4 hover:scale-125 transition-transform duration-300" />
                <p className="text-xl">Kargo Market Tanıtım Videosu</p>
                <p className="text-gray-400">Video yüklenemedi veya henüz hazır değil</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-125 hover:rotate-90 transition-all duration-300"
              aria-label="Kapat"
              title="Kapat"
            >
              ×
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</h3>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={18} className="mr-2 text-primary-500" />
                <span>{selectedListing.route}</span>
              </div>
            </div>

            {/* Large Map */}
            <div className="mb-6 h-64 rounded-lg overflow-hidden border border-gray-200">
              <LiveMap 
                coordinates={[selectedListing.coordinates, selectedListing.destination]}
                height="256px"
                showRoute={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Yük Detayları</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Tip:</strong> {selectedListing.loadType}</p>
                  <p><strong>Ağırlık:</strong> {selectedListing.weight}</p>
                  <p><strong>Fiyat:</strong> {selectedListing.price}</p>
                  <p><strong>Teklif Sayısı:</strong> {selectedListing.offers}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">İletişim</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>İsim:</strong> {selectedListing.contact.name}</p>
                  <p><strong>Firma:</strong> {selectedListing.contact.company}</p>
                  <p><strong>Telefon:</strong> {selectedListing.contact.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                aria-label="Teklif Ver" title="Teklif Ver">
                Teklif Ver
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
                aria-label="Mesaj Gönder" title="Mesaj Gönder">
                Mesaj Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;