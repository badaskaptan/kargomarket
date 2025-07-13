import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, CheckCircle, Users, Package, Truck, Clock, MapPin, Eye, X, LogIn, Zap, Shield, Globe } from 'lucide-react';
import LiveMap from '../common/LiveMap';
import { listings } from '../../data/listings';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import './HomePage.pins.css';
const HomePage = ({ onShowDashboard, onShowListings }) => {
    const navigate = useNavigate();
    const { isLoggedIn, login, register, googleLogin } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedMapUser, setSelectedMapUser] = useState(null);
    const [mapFilters, setMapFilters] = useState({
        buyers: true,
        sellers: true,
        carriers: true
    });
    // Geri eklenen state'ler:
    const [selectedListing, setSelectedListing] = useState(null);
    // Teklif Ver Modalı için state
    const [showNewOfferModal, setShowNewOfferModal] = useState(false);
    const [newOfferForm, setNewOfferForm] = useState({
        listingId: '',
        price: '',
        description: '',
        transportResponsible: '',
        origin: '',
        destination: '',
        files: []
    });
    // Mesaj modalı için state
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messageTarget, setMessageTarget] = useState(null);
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
    const stats = [
        { number: '50,000+', label: 'Aktif Kullanıcı', icon: Users },
        { number: '1M+', label: 'Taşınan Yük', icon: Package },
        { number: '5,000+', label: 'Nakliyeci', icon: Truck },
        { number: '99.8%', label: 'Müşteri Memnuniyeti', icon: CheckCircle }
    ];
    const getUserTypeColor = (type) => {
        switch (type) {
            case 'buyer': return 'bg-blue-500';
            case 'seller': return 'bg-green-500';
            case 'carrier': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };
    const getUserTypeLabel = (type) => {
        switch (type) {
            case 'buyer': return 'Alıcı';
            case 'seller': return 'Satıcı';
            case 'carrier': return 'Nakliyeci';
            default: return 'Kullanıcı';
        }
    };
    const filteredMapUsers = mapUsers.filter(user => {
        if (user.type === 'buyer' && !mapFilters.buyers)
            return false;
        if (user.type === 'seller' && !mapFilters.sellers)
            return false;
        if (user.type === 'carrier' && !mapFilters.carriers)
            return false;
        return true;
    });
    const openGoogleMaps = (user) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${user.coordinates[0]},${user.coordinates[1]}`;
        window.open(url, '_blank');
    };
    // Kullanıcı adı örneği (gerçek uygulamada auth'dan alınır)
    const currentUserName = 'Mehmet Yılmaz'; // Örnek, değiştirilebilir
    // Auth handlers
    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Login error:', error);
        }
    };
    const handleRegister = async (fullName, email, password) => {
        try {
            await register(fullName, email, password);
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Register error:', error);
        }
    };
    const handleGoogleLogin = async () => {
        try {
            await googleLogin();
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Google login error:', error);
        }
    };
    const isOwnListing = (listing) => {
        if (!listing || !listing.contact)
            return false;
        return listing.contact.name === currentUserName;
    };
    const handleShowOffer = (listing) => {
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
    const handleNewOfferFileChange = (e) => {
        if (e.target.files) {
            setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
        }
    };
    // Teklif formu submit
    const handleNewOfferSubmit = (e) => {
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
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim())
            return;
        // Burada API çağrısı yapılabilir
        alert('Mesaj gönderildi!');
        setShowMessageModal(false);
        setMessageText('');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("section", { className: "relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 opacity-10", children: [_jsx("div", { className: "absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" }), _jsx("div", { className: "absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute bottom-10 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" })] }), _jsx("div", { className: "relative container mx-auto px-6 py-20 lg:py-32", children: _jsxs("div", { className: "text-center", children: [_jsxs("h1", { className: "text-5xl lg:text-7xl font-bold mb-6 leading-tight", children: [_jsx("span", { className: "bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent", children: "T\u00FCrkiye'nin" }), _jsx("br", {}), _jsx("span", { className: "text-white", children: "Yeni Nesil" }), _jsx("br", {}), _jsx("span", { className: "bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent", children: "Kargo & Ta\u015F\u0131ma Pazar\u0131" })] }), _jsx("p", { className: "text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed max-w-4xl mx-auto", children: "Al\u0131c\u0131, Sat\u0131c\u0131 ve Nakliyecileri U\u00E7tan Uca Ba\u011Flayan Pazaryeri. Kargo Market ile y\u00FCk al\u0131m sat\u0131m\u0131 ve nakliye s\u00FCre\u00E7lerinizi tek platformda y\u00F6netin." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-12 justify-center", children: [_jsxs("button", { className: "group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center hover:rotate-1", "aria-label": "\u0130lan Olu\u015Ftur", title: "\u0130lan Olu\u015Ftur", onClick: () => {
                                                if (isLoggedIn) {
                                                    onShowDashboard();
                                                }
                                                else {
                                                    setAuthModalOpen(true);
                                                }
                                            }, children: [_jsx("span", { children: "\u0130lan Olu\u015Ftur" }), _jsx(ArrowRight, { className: "ml-2 group-hover:translate-x-2 transition-transform duration-300", size: 24 })] }), _jsxs("button", { className: "group border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 flex items-center justify-center", "aria-label": "\u0130lanlar\u0131 Ke\u015Ffet", title: "\u0130lanlar\u0131 Ke\u015Ffet", onClick: () => {
                                                if (onShowListings) {
                                                    onShowListings();
                                                }
                                                else {
                                                    navigate('/listings');
                                                }
                                            }, children: [_jsx("span", { children: "\u0130lanlar\u0131 Ke\u015Ffet" }), _jsx(Package, { className: "ml-2 group-hover:scale-125 transition-transform duration-300", size: 20 })] })] }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto", children: stats.map((stat) => (_jsxs("div", { className: "text-center group cursor-pointer", children: [_jsx("div", { className: "flex justify-center mb-2 transform group-hover:scale-125 transition-transform duration-300", children: _jsx(stat.icon, { className: "text-yellow-300 group-hover:text-yellow-200", size: 24 }) }), _jsx("div", { className: "text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300", children: stat.number }), _jsx("div", { className: "text-sm text-blue-200 group-hover:text-blue-100 transition-colors duration-300", children: stat.label })] }, stat.label))) })] }) })] }), _jsx("section", { className: "py-16 bg-white", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: [_jsx("span", { className: "text-primary-600", children: "Kargo Market" }), " Nas\u0131l \u00C7al\u0131\u015F\u0131r?"] }), _jsx("p", { className: "text-lg text-gray-600 max-w-2xl mx-auto", children: "Platformumuzun sundu\u011Fu avantajlar\u0131 ve lojistik s\u00FCre\u00E7lerinizi nas\u0131l optimize edebilece\u011Finizi ke\u015Ffedin." })] }), _jsx("div", { className: "max-w-5xl mx-auto", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [_jsx("div", { className: "video-embed-responsive", children: _jsx("iframe", { id: "vp1uPtKt", title: "Video Player", src: "https://s3.amazonaws.com/embed.animoto.com/play.html?w=swf/production/vp1&e=1750969143&f=uPtKt76FIJhLEgxM8d1KFA&d=0&m=p&r=360p+720p&volume=100&start_res=720p&i=m&asset_domain=s3-p.animoto.com&animoto_domain=animoto.com&options=", allowFullScreen: true, width: "432", height: "243", frameBorder: "0", "aria-label": "Video Player" }) }), _jsx("div", { className: "p-8 bg-gradient-to-r from-gray-50 to-white", children: _jsxs("div", { className: "flex flex-wrap gap-8 justify-center", children: [_jsxs("div", { className: "flex items-center gap-3 group cursor-pointer", children: [_jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-blue-100 text-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-300", children: _jsx(Clock, { size: 24 }) }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-medium", children: "Video S\u00FCresi" }), _jsx("p", { className: "text-gray-600", children: "2:45 dk" })] })] }), _jsxs("div", { className: "flex items-center gap-3 group cursor-pointer", children: [_jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300", children: _jsx(Play, { size: 24 }) }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-medium", children: "HD Kalite" }), _jsx("p", { className: "text-gray-600", children: "1080p" })] })] }), _jsxs("div", { className: "flex items-center gap-3 group cursor-pointer", children: [_jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300", children: _jsx(Globe, { size: 24 }) }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-medium", children: "Altyaz\u0131" }), _jsx("p", { className: "text-gray-600", children: "TR/EN" })] })] })] }) })] }) })] }) }), _jsx("section", { className: "py-20 bg-gradient-to-br from-gray-50 to-gray-100", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: ["Neden ", _jsx("span", { className: "text-primary-600", children: "Kargo Market?" })] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "Modern teknoloji ile lojistik sekt\u00F6r\u00FCn\u00FC d\u00F6n\u00FC\u015Ft\u00FCr\u00FCyoruz" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: features.map((feature, index) => (_jsxs("div", { className: "group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border border-gray-100 cursor-pointer", children: [_jsx("div", { className: `w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl`, children: _jsx(feature.icon, { className: "text-white", size: 32 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300", children: feature.title }), _jsx("p", { className: "text-primary-600 font-semibold mb-4 group-hover:text-primary-700 transition-colors duration-300", children: feature.subtitle }), _jsx("p", { className: "text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300", children: feature.description }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" }), _jsx("div", { className: "absolute -top-2 -right-2 w-4 h-4 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500" }), _jsx("div", { className: "absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700" })] }, index))) })] }) }), _jsx("section", { className: "py-20 bg-white", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: [_jsx("span", { className: "text-primary-600", children: "Nas\u0131l" }), " \u00C7al\u0131\u015F\u0131r?"] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "4 basit ad\u0131mda y\u00FCk\u00FCn\u00FCz\u00FC ta\u015F\u0131y\u0131n veya nakliye hizmeti verin" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: steps.map((step, index) => (_jsx("div", { className: `relative group ${currentStep === index ? 'scale-110' : ''} transition-all duration-500 cursor-pointer`, children: _jsxs("div", { className: "bg-white rounded-2xl p-8 shadow-lg hover:shadow-3xl transition-all duration-500 text-center relative overflow-hidden transform hover:scale-110 hover:rotate-2", children: [_jsx("div", { className: `w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`, children: step.number }), _jsx("div", { className: "mb-4", children: _jsx(step.icon, { className: "text-gray-400 mx-auto group-hover:text-primary-600 group-hover:scale-125 transition-all duration-300", size: 40 }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300", children: step.title }), _jsx("p", { className: "text-gray-600 group-hover:text-gray-700 transition-colors duration-300", children: step.description }), currentStep === index && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-2xl" })), index < steps.length - 1 && (_jsx("div", { className: "hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-500" })), _jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500" })] }) }, index))) }), _jsx("div", { className: "text-center mt-16", children: _jsx("button", { className: "bg-primary-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 hover:rotate-1 shadow-xl hover:shadow-2xl", "aria-label": "Hemen Ba\u015Fla", title: "Hemen Ba\u015Fla", children: "Hemen Ba\u015Fla!" }) })] }) }), _jsx("section", { className: "py-20 bg-gray-50", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: ["\u00D6ne \u00C7\u0131kan ", _jsx("span", { className: "text-primary-600", children: "\u0130lanlar" })] }), _jsx("p", { className: "text-xl text-gray-600", children: "En g\u00FCncel y\u00FCk, nakliye ve ta\u015F\u0131ma ilanlar\u0131n\u0131 ke\u015Ffedin. Binlerce ilan aras\u0131ndan size uygun olan\u0131 hemen bulun." })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: listings.map((listing) => (_jsxs("div", { className: "bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden", children: [_jsxs("div", { className: "p-6 pb-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold", title: "\u0130lan No", children: listing.ilanNo }), listing.urgent && (_jsxs("div", { className: "inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold", children: [_jsx(Clock, { size: 12, className: "mr-1" }), "Acil"] })), isOwnListing(listing) && (_jsx("div", { className: "inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold", children: "Sizin \u0130lan\u0131n\u0131z" }))] }), _jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer", children: listing.title })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold text-primary-600", children: listing.price }), _jsxs("div", { className: "text-xs text-gray-500", children: [listing.offers, " teklif"] })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(MapPin, { size: 14, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-sm", children: listing.route })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Package, { size: 14, className: "mr-2 text-primary-500" }), _jsxs("span", { className: "text-sm", children: [listing.loadType, " \u2022 ", listing.weight] })] })] }), isLoggedIn ? (_jsx("div", { className: "flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3", children: _jsx("span", { className: "text-white text-xs font-medium", children: listing.contact.name.split(' ').map(n => n[0]).join('') }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 text-sm", children: listing.contact.name }), _jsx("div", { className: "text-xs text-gray-500", children: listing.contact.company }), _jsx("div", { className: "text-xs text-gray-500", children: listing.contact.phone })] })] }) })) : (_jsx("div", { className: "mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200", children: _jsx("div", { className: "flex items-center text-yellow-800", children: _jsx("span", { className: "text-sm font-medium", children: "\u0130leti\u015Fim bilgilerini g\u00F6rmek i\u00E7in giri\u015F yap\u0131n" }) }) }))] }), _jsx("div", { className: "h-32 border-t border-gray-100", children: _jsx(LiveMap, { coordinates: [listing.coordinates], height: "128px", onClick: () => setSelectedListing(listing), className: "cursor-pointer hover:opacity-80 transition-opacity" }) }), _jsx("div", { className: "p-6 pt-4 border-t border-gray-100", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleShowOffer(listing), className: `flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${isOwnListing(listing)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'}`, disabled: isOwnListing(listing), children: isLoggedIn
                                                        ? isOwnListing(listing)
                                                            ? 'Kendi İlanınız'
                                                            : 'Teklif Ver'
                                                        : 'Giriş Yap' }), _jsx("button", { onClick: () => setSelectedListing(listing), className: "px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105", title: "Detaylar\u0131 G\u00F6r\u00FCnt\u00FCle", children: _jsx(Eye, { size: 16 }) }), _jsx("button", { onClick: () => {
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
                                                    }, className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(listing)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, disabled: isOwnListing(listing), children: isLoggedIn
                                                        ? isOwnListing(listing)
                                                            ? 'Kendi İlanınız'
                                                            : 'Mesaj Gönder'
                                                        : 'Giriş Yap' })] }) })] }, listing.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx("button", { className: "bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl", children: "Daha Fazla \u0130lan Y\u00FCkle" }) })] }) }), _jsx("section", { className: "py-20 bg-white", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: ["Canl\u0131 ", _jsx("span", { className: "text-primary-600", children: "Harita" })] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "T\u00FCrkiye genelindeki aktif al\u0131c\u0131, sat\u0131c\u0131 ve nakliyecileri ger\u00E7ek zamanl\u0131 olarak g\u00F6r\u00FCn. \u0130htiyac\u0131n\u0131za en yak\u0131n kullan\u0131c\u0131lar\u0131 ke\u015Ffedin." })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200", children: [_jsx("div", { className: "p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("label", { className: "flex items-center cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: mapFilters.buyers, onChange: (e) => setMapFilters(prev => ({ ...prev, buyers: e.target.checked })), className: "sr-only" }), _jsx("div", { className: `w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.buyers ? 'bg-blue-500 scale-110' : 'bg-gray-300'}` }), _jsxs("span", { className: `font-medium transition-colors duration-300 ${mapFilters.buyers ? 'text-blue-600' : 'text-gray-500'} group-hover:text-blue-600`, children: ["Al\u0131c\u0131lar (", mapUsers.filter(u => u.type === 'buyer').length, ")"] })] }), _jsxs("label", { className: "flex items-center cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: mapFilters.sellers, onChange: (e) => setMapFilters(prev => ({ ...prev, sellers: e.target.checked })), className: "sr-only" }), _jsx("div", { className: `w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.sellers ? 'bg-green-500 scale-110' : 'bg-gray-300'}` }), _jsxs("span", { className: `font-medium transition-colors duration-300 ${mapFilters.sellers ? 'text-green-600' : 'text-gray-500'} group-hover:text-green-600`, children: ["Sat\u0131c\u0131lar (", mapUsers.filter(u => u.type === 'seller').length, ")"] })] }), _jsxs("label", { className: "flex items-center cursor-pointer group", children: [_jsx("input", { type: "checkbox", checked: mapFilters.carriers, onChange: (e) => setMapFilters(prev => ({ ...prev, carriers: e.target.checked })), className: "sr-only" }), _jsx("div", { className: `w-5 h-5 rounded-full mr-3 transition-all duration-300 ${mapFilters.carriers ? 'bg-orange-500 scale-110' : 'bg-gray-300'}` }), _jsxs("span", { className: `font-medium transition-colors duration-300 ${mapFilters.carriers ? 'text-orange-600' : 'text-gray-500'} group-hover:text-orange-600`, children: ["Nakliyeciler (", mapUsers.filter(u => u.type === 'carrier').length, ")"] })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("span", { className: "font-medium", children: "Toplam Aktif:" }), " ", filteredMapUsers.length, " kullan\u0131c\u0131"] })] }) }), _jsx("div", { className: "relative h-[600px] bg-gradient-to-br from-blue-50 to-green-50", children: _jsx(LiveMap, { coordinates: filteredMapUsers.map(u => ({ lat: u.coordinates.lat, lng: u.coordinates.lng })), height: "600px" }) })] })] }) }), selectedMapUser && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-md w-full transform scale-100 transition-all duration-300 shadow-2xl", children: [_jsx("button", { onClick: () => setSelectedMapUser(null), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transform hover:scale-125 hover:rotate-90 transition-all duration-300", "aria-label": "Kapat", title: "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "text-center mb-6", children: [_jsxs("div", { className: "relative inline-block mb-4", children: [_jsx("img", { src: selectedMapUser.avatar, alt: selectedMapUser.name, className: "w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" }), _jsx("div", { className: `absolute -bottom-1 -right-1 w-6 h-6 ${getUserTypeColor(selectedMapUser.type)} rounded-full flex items-center justify-center border-2 border-white`, children: _jsx("span", { className: "text-white text-xs font-bold", children: selectedMapUser.type === 'buyer' ? 'A' : selectedMapUser.type === 'seller' ? 'S' : 'N' }) })] }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-1", children: selectedMapUser.name }), _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedMapUser.type === 'buyer' ? 'bg-blue-100 text-blue-800' :
                                        selectedMapUser.type === 'seller' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'}`, children: getUserTypeLabel(selectedMapUser.type) })] }), _jsx("div", { className: "mb-6", children: _jsx("img", { src: selectedMapUser.productImage, alt: "\u00DCr\u00FCn", className: "w-full h-32 object-cover rounded-lg border border-gray-200" }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: selectedMapUser.title }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(MapPin, { size: 16, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-sm", children: selectedMapUser.route })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-gray-500", children: ["Son aktivite: ", selectedMapUser.lastActive] }), _jsx("span", { className: "text-lg font-bold text-primary-600", children: selectedMapUser.price })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 transform hover:scale-105", "aria-label": "Detay G\u00F6r", title: "Detay G\u00F6r", children: "Detay G\u00F6r" }), _jsx("button", { className: "flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105", "aria-label": "Teklif Ver", title: "Teklif Ver", children: "Teklif Ver" })] }), _jsx("div", { className: "mt-4", children: _jsxs("button", { onClick: () => openGoogleMaps(selectedMapUser), className: "w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105", "aria-label": "Google Maps'te G\u00F6r", title: "Google Maps'te G\u00F6r", children: [_jsx(Globe, { size: 16, className: "text-primary-600" }), "Google Maps'te G\u00F6r"] }) })] }) })), selectedListing && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setSelectedListing(null), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [selectedListing.urgent && (_jsxs("div", { className: "inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold", children: [_jsx(Clock, { size: 16, className: "mr-1" }), "Acil \u0130lan"] })), _jsx("div", { className: "inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold", children: selectedListing.loadType }), isOwnListing(selectedListing) && (_jsx("div", { className: "inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold", children: "Sizin \u0130lan\u0131n\u0131z" }))] }), _jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-3", children: selectedListing.title }), _jsxs("div", { className: "flex items-center text-gray-600 mb-2", children: [_jsx(MapPin, { size: 18, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-lg", children: selectedListing.route })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6 mb-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Y\u00FCk Detaylar\u0131" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Y\u00FCk Tipi:" }), _jsx("div", { className: "font-medium", children: selectedListing.loadType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "A\u011F\u0131rl\u0131k:" }), _jsx("div", { className: "font-medium", children: selectedListing.weight })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Fiyat:" }), _jsx("div", { className: "font-medium", children: selectedListing.price })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Teklif:" }), _jsxs("div", { className: "font-medium", children: [selectedListing.offers, " teklif"] })] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6 mb-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "A\u00E7\u0131klama" }), _jsx("p", { className: "text-gray-700", children: selectedListing.description || 'Açıklama bulunamadı.' })] }), isLoggedIn ? (_jsxs("div", { className: "bg-primary-50 rounded-lg p-6 border border-primary-200", children: [_jsx("div", { className: "flex items-center mb-4", children: _jsx("h4", { className: "font-semibold text-gray-900", children: "\u0130leti\u015Fim Bilgileri" }) }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "\u0130sim:" }), " ", selectedListing.contact?.name] }), _jsxs("div", { children: [_jsx("strong", { children: "Firma:" }), " ", selectedListing.contact?.company] }), _jsxs("div", { children: [_jsx("strong", { children: "Telefon:" }), " ", selectedListing.contact?.phone] })] })] })) : (_jsxs("div", { className: "bg-yellow-50 rounded-lg p-6 border border-yellow-200", children: [_jsxs("div", { className: "flex items-center text-yellow-800 mb-3", children: [_jsx(LogIn, { size: 20, className: "mr-2" }), _jsx("h4", { className: "font-semibold", children: "\u0130leti\u015Fim Bilgileri" })] }), _jsx("p", { className: "text-yellow-700 text-sm mb-4", children: "\u0130leti\u015Fim bilgilerini g\u00F6rmek ve teklif vermek i\u00E7in giri\u015F yapman\u0131z gerekiyor." })] }))] }), _jsxs("div", { className: "hidden lg:flex flex-col items-stretch gap-6", children: [_jsx("div", { className: "h-80 rounded-lg overflow-hidden border border-gray-200 mb-0", children: _jsx(LiveMap, { coordinates: [selectedListing.coordinates, selectedListing.destination], height: "320px", showRoute: true }) }), _jsx("div", { className: "bg-white border-2 border-primary-200 rounded-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-primary-600 mb-2", children: selectedListing.price }), _jsxs("div", { className: "text-gray-600 mb-4", children: [selectedListing.offers, " teklif al\u0131nd\u0131"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleShowOffer(selectedListing), className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-primary-600 text-white hover:bg-primary-700'}`, disabled: isOwnListing(selectedListing), children: isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Teklif Ver' }), _jsx("button", { onClick: () => {
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
                                                                }, className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, disabled: isOwnListing(selectedListing), children: isOwnListing(selectedListing) ? 'Kendi İlanınız' : 'Mesaj Gönder' })] })] }) }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "G\u00FCvenlik Bilgileri" }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Do\u011Frulanm\u0131\u015F \u00FCye"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Sigorta g\u00FCvencesi"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "G\u00FCvenli \u00F6deme sistemi"] })] })] })] })] })] }) })), showNewOfferModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative", children: [_jsx("button", { onClick: () => setShowNewOfferModal(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-xl font-bold mb-6", children: "Yeni Teklif Ver" }), _jsxs("form", { onSubmit: handleNewOfferSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\u0130lan Numaras\u0131" }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2 bg-gray-100", value: newOfferForm.listingId, disabled: true, readOnly: true, title: "\u0130lan Numaras\u0131", placeholder: "\u0130lan Numaras\u0131", "aria-label": "\u0130lan Numaras\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Nakliye Kime Ait" }), _jsxs("select", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.transportResponsible, onChange: e => setNewOfferForm(f => ({ ...f, transportResponsible: e.target.value })), required: true, title: "Nakliye Kime Ait", "aria-label": "Nakliye Kime Ait", children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "Al\u0131c\u0131", children: "Al\u0131c\u0131" }), _jsx("option", { value: "Sat\u0131c\u0131", children: "Sat\u0131c\u0131" }), _jsx("option", { value: "Nakliye Gerekmiyor", children: "Nakliye Gerekmiyor" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Kalk\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.origin, onChange: e => setNewOfferForm(f => ({ ...f, origin: e.target.value })), required: true, title: "Kalk\u0131\u015F Noktas\u0131", placeholder: "Kalk\u0131\u015F Noktas\u0131", "aria-label": "Kalk\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Var\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.destination, onChange: e => setNewOfferForm(f => ({ ...f, destination: e.target.value })), required: true, title: "Var\u0131\u015F Noktas\u0131", placeholder: "Var\u0131\u015F Noktas\u0131", "aria-label": "Var\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Teklif Tutar\u0131" }), _jsx("input", { type: "number", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.price, onChange: e => setNewOfferForm(f => ({ ...f, price: e.target.value })), required: true, min: "0", title: "Teklif Tutar\u0131", placeholder: "Teklif Tutar\u0131", "aria-label": "Teklif Tutar\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "A\u00E7\u0131klama" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.description, onChange: e => setNewOfferForm(f => ({ ...f, description: e.target.value })), rows: 3, title: "A\u00E7\u0131klama", placeholder: "A\u00E7\u0131klama", "aria-label": "A\u00E7\u0131klama" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Evrak ve Resim Y\u00FCkle" }), _jsx("input", { type: "file", className: "w-full border rounded-lg px-3 py-2", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", onChange: handleNewOfferFileChange, title: "Evrak ve Resim Y\u00FCkle", "aria-label": "Evrak ve Resim Y\u00FCkle" }), newOfferForm.files && newOfferForm.files.length > 0 && (_jsx("ul", { className: "mt-2 text-xs text-gray-600 list-disc list-inside", children: newOfferForm.files.map((file, idx) => (_jsx("li", { children: file.name }, idx))) }))] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2", children: "Teklif Ver" })] })] }) })), showMessageModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative", children: [_jsx("button", { onClick: () => setShowMessageModal(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-lg font-bold mb-4", children: "Mesaj G\u00F6nder" }), _jsxs("div", { className: "mb-2 text-sm font-semibold uppercase text-gray-500", children: ["Al\u0131c\u0131: ", _jsx("span", { className: "text-primary-600 font-bold underline cursor-pointer", children: messageTarget?.contact?.name || '' })] }), _jsxs("form", { onSubmit: handleSendMessage, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Al\u0131c\u0131" }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900", value: messageTarget?.contact?.name || '', disabled: true, readOnly: true, title: "Al\u0131c\u0131", "aria-label": "Al\u0131c\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Mesaj\u0131n\u0131z" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2", value: messageText, onChange: e => setMessageText(e.target.value), rows: 3, required: true, title: "Mesaj\u0131n\u0131z", placeholder: "Mesaj\u0131n\u0131z\u0131 yaz\u0131n...", "aria-label": "Mesaj\u0131n\u0131z" })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2", children: "G\u00F6nder" })] })] }) })), _jsx(AuthModal, { isOpen: authModalOpen, onClose: () => setAuthModalOpen(false), onLogin: handleLogin, onRegister: handleRegister, onGoogleLogin: handleGoogleLogin })] }));
};
export default HomePage;
