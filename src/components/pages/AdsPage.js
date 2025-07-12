import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Search, Star, Phone, Mail, ExternalLink, Play, Eye, MessageCircle, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
// AdsPage component - no props needed since we use context
const AdsPage = () => {
    const { isLoggedIn, login, register, googleLogin } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const categories = [
        { id: 'all', label: 'Tüm Reklamlar', count: 24 },
        { id: 'transport', label: 'Nakliye Hizmetleri', count: 12 },
        { id: 'logistics', label: 'Lojistik Çözümleri', count: 8 },
        { id: 'insurance', label: 'Sigorta Hizmetleri', count: 4 }
    ];
    const ads = [
        {
            id: 1,
            companyName: 'Aras Kargo',
            title: 'Türkiye\'nin En Hızlı Kargo Hizmeti',
            description: 'Aynı gün teslimat garantisi ile tüm Türkiye\'ye güvenli kargo hizmeti. 30 yıllık deneyimimizle yanınızdayız.',
            rating: 4.8,
            reviewCount: 1247,
            category: 'transport',
            type: 'premium',
            hasVideo: true,
            videoThumbnail: 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=400',
            logo: '🚚',
            specialOffer: '%20 İndirim - İlk Siparişinizde',
            contact: {
                phone: '+90 444 2 727',
                email: 'info@araskargo.com.tr',
                website: 'https://www.araskargo.com.tr'
            },
            features: ['Aynı Gün Teslimat', 'SMS Bilgilendirme', 'Online Takip', '7/24 Müşteri Hizmetleri'],
            views: 15420,
            clicks: 892
        },
        {
            id: 2,
            companyName: 'MNG Kargo',
            title: 'Güvenilir Kargo ve Lojistik Çözümleri',
            description: 'Kurumsal ve bireysel müşterilerimize özel kargo çözümleri. Hızlı, güvenli ve ekonomik teslimat seçenekleri.',
            rating: 4.6,
            reviewCount: 856,
            category: 'transport',
            type: 'standard',
            hasVideo: false,
            logo: '📦',
            specialOffer: 'Toplu Gönderimde Özel Fiyat',
            contact: {
                phone: '+90 444 6 664',
                email: 'musteri@mngkargo.com.tr',
                website: 'https://www.mngkargo.com.tr'
            },
            features: ['Kapıdan Kapıya', 'Sigortalı Taşıma', 'Esnek Ödeme', 'Şube Ağı'],
            views: 12350,
            clicks: 567
        },
        {
            id: 3,
            companyName: 'Yurtiçi Kargo',
            title: 'Türkiye\'nin Kargo Lideri',
            description: 'En geniş şube ağı ile her yere ulaşıyoruz. Güvenli ve hızlı kargo hizmetleri için doğru adres.',
            rating: 4.7,
            reviewCount: 2134,
            category: 'transport',
            type: 'premium',
            hasVideo: true,
            videoThumbnail: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400',
            logo: '🚛',
            specialOffer: 'Ücretsiz Kargo - 50 TL Üzeri',
            contact: {
                phone: '+90 444 9 999',
                email: 'info@yurticikargo.com',
                website: 'https://www.yurticikargo.com'
            },
            features: ['Geniş Şube Ağı', 'Hızlı Teslimat', 'Güvenli Paketleme', 'Müşteri Memnuniyeti'],
            views: 18750,
            clicks: 1234
        },
        {
            id: 4,
            companyName: 'Güven Sigorta',
            title: 'Nakliye ve Kargo Sigortası',
            description: 'Yüklerinizi güvence altına alın. Kapsamlı nakliye sigortası ile riskleri minimize edin.',
            rating: 4.5,
            reviewCount: 432,
            category: 'insurance',
            type: 'standard',
            hasVideo: false,
            logo: '🛡️',
            specialOffer: 'İlk Yıl %30 İndirim',
            contact: {
                phone: '+90 212 555 0123',
                email: 'info@guvensigorta.com',
                website: 'https://www.guvensigorta.com'
            },
            features: ['Kapsamlı Koruma', 'Hızlı Hasar Ödemesi', 'Online İşlemler', 'Uzman Destek'],
            views: 8920,
            clicks: 345
        },
        {
            id: 5,
            companyName: 'Lojistik Pro',
            title: 'Entegre Lojistik Çözümleri',
            description: 'Depolama, dağıtım ve nakliye hizmetlerini tek çatı altında toplayan lojistik çözüm ortağınız.',
            rating: 4.9,
            reviewCount: 678,
            category: 'logistics',
            type: 'premium',
            hasVideo: true,
            videoThumbnail: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400',
            logo: '🏭',
            specialOffer: 'Ücretsiz Depo Analizi',
            contact: {
                phone: '+90 216 555 0456',
                email: 'info@lojistikpro.com',
                website: 'https://www.lojistikpro.com'
            },
            features: ['Depolama', 'Dağıtım Ağı', 'Teknoloji Entegrasyonu', 'Raporlama'],
            views: 11200,
            clicks: 789
        },
        {
            id: 6,
            companyName: 'Hızlı Nakliyat',
            title: 'Şehir İçi Express Teslimat',
            description: 'Şehir içi acil teslimat ihtiyaçlarınız için 7/24 hizmet. Motokurye ve araç filosu ile hızlı çözümler.',
            rating: 4.4,
            reviewCount: 289,
            category: 'transport',
            type: 'standard',
            hasVideo: false,
            logo: '🏍️',
            specialOffer: '2 Saat İçinde Teslimat',
            contact: {
                phone: '+90 555 123 4567',
                email: 'info@hizlinakliyat.com',
                website: 'https://www.hizlinakliyat.com'
            },
            features: ['Express Teslimat', 'Motokurye', '7/24 Hizmet', 'Anlık Takip'],
            views: 6780,
            clicks: 234
        }
    ];
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
    const handleContactClick = (ad, type) => {
        if (!isLoggedIn) {
            setAuthModalOpen(true);
            return;
        }
        // İletişim işlemi
        if (type === 'phone') {
            window.open(`tel:${ad.contact.phone}`);
        }
        else if (type === 'email') {
            window.open(`mailto:${ad.contact.email}`);
        }
        else if (type === 'website') {
            window.open(ad.contact.website, '_blank');
        }
    };
    const handleViewReviews = (companyName) => {
        // Yorumlar sayfasına yönlendirme
        console.log(`${companyName} yorumlarını görüntüle`);
    };
    const getTypeStyle = (type) => {
        return type === 'premium'
            ? 'border-2 border-yellow-300 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50'
            : 'border border-gray-200 shadow-lg bg-white';
    };
    const getTypeBadge = (type) => {
        if (type === 'premium') {
            return (_jsx("div", { className: "absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg", children: "\u2B50 PREMIUM" }));
        }
        return null;
    };
    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || ad.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 py-8", children: [_jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: [_jsx("span", { className: "text-primary-600", children: "Reklam" }), " Vitrini"] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto mb-8", children: "G\u00FCvenilir firmalardan \u00F6zel teklifler ve hizmetler. Kaliteli i\u015F ortaklar\u0131 ile tan\u0131\u015F\u0131n." })] }), _jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex flex-wrap justify-center gap-4", children: categories.map(category => (_jsxs("button", { onClick: () => setCategoryFilter(category.id), className: `px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${categoryFilter === category.id
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'}`, children: [_jsx("span", { children: category.label }), _jsxs("span", { className: "ml-2 text-sm opacity-75", children: ["(", category.count, ")"] })] }, category.id))) }) }), _jsx("div", { className: "mb-8 max-w-2xl mx-auto", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Firma veya hizmet ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-12 pr-4 py-4 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm text-lg" })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8", children: filteredAds.map((ad) => (_jsxs("div", { className: `rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl relative ${getTypeStyle(ad.type)}`, children: [getTypeBadge(ad.type), ad.hasVideo ? (_jsxs("div", { className: "relative h-48 bg-gray-900 overflow-hidden group cursor-pointer", children: [_jsx("img", { src: ad.videoThumbnail, alt: ad.title, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors", children: _jsx("div", { className: "w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl", children: _jsx(Play, { className: "text-primary-600 ml-1", size: 24 }) }) }), _jsx("div", { className: "absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold", children: "\uD83C\uDFA5 V\u0130DEO" })] })) : (_jsx("div", { className: "h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center", children: _jsx("div", { className: "text-6xl", children: ad.logo }) })), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-3 shadow-lg", children: _jsx("span", { className: "text-white text-lg", children: ad.logo }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: ad.companyName }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex items-center mr-2", children: [...Array(5)].map((_, i) => (_jsx(Star, { size: 14, className: `${i < Math.floor(ad.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}` }, i))) }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: ad.rating }), _jsxs("span", { className: "text-sm text-gray-500 ml-1", children: ["(", ad.reviewCount, ")"] })] })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "p-2 text-gray-400 hover:text-red-500 transition-colors", title: "Favorilere Ekle", children: _jsx(Heart, { size: 18 }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-blue-500 transition-colors", title: "Payla\u015F", children: _jsx(Share2, { size: 18 }) })] })] }), _jsx("h4", { className: "text-xl font-bold text-gray-900 mb-3", children: ad.title }), _jsx("p", { className: "text-gray-600 mb-4 leading-relaxed", children: ad.description }), ad.specialOffer && (_jsx("div", { className: "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg p-3 mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-green-600 mr-2", children: "\uD83C\uDF89" }), _jsx("span", { className: "font-semibold text-green-800", children: ad.specialOffer })] }) })), _jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [ad.features.slice(0, 3).map((feature, index) => (_jsxs("span", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium", children: ["\u2713 ", feature] }, index))), ad.features.length > 3 && (_jsxs("span", { className: "bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium", children: ["+", ad.features.length - 3, " daha"] }))] }) }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Eye, { size: 14, className: "mr-1" }), _jsxs("span", { children: [ad.views.toLocaleString(), " g\u00F6r\u00FCnt\u00FClenme"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MessageCircle, { size: 14, className: "mr-1" }), _jsxs("span", { children: [ad.clicks, " t\u0131klama"] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { onClick: () => handleContactClick(ad, 'phone'), className: "flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium", title: "Telefon", children: [_jsx(Phone, { size: 14, className: "mr-1" }), "Ara"] }), _jsxs("button", { onClick: () => handleContactClick(ad, 'email'), className: "flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium", title: "E-posta", children: [_jsx(Mail, { size: 14, className: "mr-1" }), "Mail"] }), _jsxs("button", { onClick: () => handleContactClick(ad, 'website'), className: "flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium", title: "Website", children: [_jsx(ExternalLink, { size: 14, className: "mr-1" }), "Site"] })] }), _jsxs("button", { onClick: () => handleViewReviews(ad.companyName), className: "w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center", children: [_jsx(Star, { size: 14, className: "mr-2" }), "T\u00FCm Yorumlar\u0131 G\u00F6r (", ad.reviewCount, ")"] })] })] })] }, ad.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx("button", { className: "bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl", children: "Daha Fazla Reklam Y\u00FCkle" }) }), _jsxs("div", { className: "mt-16 bg-white rounded-xl shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 text-center mb-6", children: "Reklam Vermek \u0130ster misiniz?" }), _jsx("p", { className: "text-gray-600 text-center mb-8 max-w-2xl mx-auto", children: "Firman\u0131z\u0131 binlerce potansiyel m\u00FC\u015Fteriye tan\u0131t\u0131n. Reklam kartlar\u0131 ve video reklamlar\u0131 ile i\u015Finizi b\u00FCy\u00FCt\u00FCn." }), _jsx("div", { className: "text-center", children: _jsx("button", { className: "bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl", children: "Reklam Ver" }) })] })] }), _jsx(AuthModal, { isOpen: authModalOpen, onClose: () => setAuthModalOpen(false), onLogin: handleLogin, onRegister: handleRegister, onGoogleLogin: handleGoogleLogin })] }));
};
export default AdsPage;
