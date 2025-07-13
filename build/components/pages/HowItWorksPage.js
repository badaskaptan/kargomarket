import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { UserPlus, FileText, Search, MessageCircle, CheckCircle, Truck, Play, Phone, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
const HowItWorksPage = () => {
    const [activeRole, setActiveRole] = useState('buyer');
    const [openFaq, setOpenFaq] = useState(null);
    const steps = {
        buyer: [
            {
                icon: UserPlus,
                title: 'Üye Olun',
                description: 'Hızlı ve kolay kayıt işlemi ile platformumuza katılın',
                details: 'E-posta adresiniz ve temel bilgilerinizle 2 dakikada üye olabilirsiniz.'
            },
            {
                icon: FileText,
                title: 'Yük İlanı Verin',
                description: 'Almak veya satmak istediğiniz yükün detaylarını girin',
                details: 'Yük tipi, ağırlık, hacim, kalkış-varış noktaları ve tarih bilgilerini ekleyin.'
            },
            {
                icon: Search,
                title: 'Teklifleri Karşılaştırın',
                description: 'Gelen teklifleri inceleyin ve en uygununu seçin',
                details: 'Fiyat, nakliyeci profili, değerlendirmeler ve hizmet kalitesini karşılaştırın.'
            },
            {
                icon: MessageCircle,
                title: 'İletişime Geçin',
                description: 'Seçtiğiniz nakliyeci ile detayları konuşun',
                details: 'Platform üzerinden güvenli mesajlaşma ile tüm detayları netleştirin.'
            },
            {
                icon: CheckCircle,
                title: 'Anlaşmayı Onaylayın',
                description: 'Koşulları kabul edin ve taşıma işlemini başlatın',
                details: 'Dijital sözleşme ile güvenli bir şekilde anlaşmanızı tamamlayın.'
            },
            {
                icon: Truck,
                title: 'Takip Edin',
                description: 'Yükünüzün durumunu gerçek zamanlı takip edin',
                details: 'GPS takip sistemi ile yükünüzün nerede olduğunu her an bilin.'
            }
        ],
        carrier: [
            {
                icon: UserPlus,
                title: 'Üye Olun',
                description: 'Nakliyeci olarak platformumuza katılın',
                details: 'Firma bilgileriniz ve araç detaylarınızla kayıt olun.'
            },
            {
                icon: Search,
                title: 'İlanları İnceleyin',
                description: 'Size uygun yük ilanlarını bulun',
                details: 'Güzergah, yük tipi ve tarih filtrelerini kullanarak uygun ilanları bulun.'
            },
            {
                icon: FileText,
                title: 'Teklif Verin',
                description: 'Uygun gördüğünüz ilanlara teklif gönderin',
                details: 'Rekabetçi fiyatlarla teklif verin ve müşterilerle iletişime geçin.'
            },
            {
                icon: MessageCircle,
                title: 'Müşteri ile Görüşün',
                description: 'Yük sahibi ile detayları konuşun',
                details: 'Yükleme, taşıma ve teslimat detaylarını netleştirin.'
            },
            {
                icon: CheckCircle,
                title: 'İşi Alın',
                description: 'Anlaşma sağlandığında işi onaylayın',
                details: 'Dijital sözleşme ile güvenli bir şekilde işi teslim alın.'
            },
            {
                icon: Truck,
                title: 'Taşıma Yapın',
                description: 'Güvenli taşıma ile işi tamamlayın',
                details: 'Profesyonel hizmet vererek müşteri memnuniyetini sağlayın.'
            }
        ]
    };
    const features = [
        {
            title: 'Güvenli Ödeme',
            description: 'Tüm ödemeler güvenli ödeme sistemi ile korunur',
            icon: '🔒'
        },
        {
            title: 'Sigorta Koruması',
            description: 'Yükleriniz sigorta güvencesi altındadır',
            icon: '🛡️'
        },
        {
            title: 'Gerçek Zamanlı Takip',
            description: 'GPS ile yükünüzü her an takip edebilirsiniz',
            icon: '📍'
        },
        {
            title: '7/24 Destek',
            description: 'Her zaman yanınızdayız',
            icon: '🎧'
        }
    ];
    const faqs = [
        {
            question: 'Kayıt olmak ve ilan vermek ücretli mi?',
            answer: 'Evet, yalnız sitemiz geliştirme ve tanıtım aşamasındadır! İlk 3 ay boyunca hiçbir ilan veya kayıt ücreti alınmayacaktır. Sistemin kilit fonksiyonları %100 çalışmaktadır. Gönül rahatlığıyla ilan açabilir, teklif sunabilir, tüm işlemleri sorunsuzca gerçekleştirebilirsiniz!'
        },
        {
            question: 'Yüklerim sigortalı mı?',
            answer: 'Profil böyle bir sorumluluk almamaktadır. İleride düşünülebilir. Sorumluluk reddi beyanında belirtilmiştir.'
        },
        {
            question: 'Nakliyeci nasıl seçerim?',
            answer: 'Nakliyecilerin profil bilgilerini, geçmiş işlerini ve müşteri değerlendirmelerini inceleyerek karar verebilirsiniz.'
        },
        {
            question: 'Ödeme nasıl yapılır?',
            answer: 'Profil böyle bir sorumluluk almamaktadır. İleride düşünülebilir. Sorumluluk reddi beyanında belirtilmiştir.'
        },
        {
            question: 'Sorun yaşarsam ne yapmalıyım?',
            answer: 'Avukatınızla görüşün. Sorumluluk reddi beyanında belirtilmiştir. Platform danışman olarak tavsiyede bulunabilir.'
        },
        {
            question: 'Yükümü takip edebilir miyim?',
            answer: 'Evet, GPS takip sistemi ile yükünüzün konumunu gerçek zamanlı olarak takip edebilirsiniz.'
        }
    ];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: [_jsx("span", { className: "text-primary-600", children: "Nas\u0131l" }), " \u00C7al\u0131\u015F\u0131r?"] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto mb-8", children: "Kargo Market'te i\u015Flem yapmak \u00E7ok kolay! Ad\u0131m ad\u0131m s\u00FCre\u00E7lerimizi inceleyin." }), _jsx("div", { className: "flex justify-center mb-12", children: _jsxs("div", { className: "bg-white rounded-xl p-2 shadow-lg", children: [_jsx("button", { onClick: () => setActiveRole('buyer'), className: `px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeRole === 'buyer'
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-primary-600'}`, children: "Y\u00FCk Sahibi / Al\u0131c\u0131" }), _jsx("button", { onClick: () => setActiveRole('carrier'), className: `px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeRole === 'carrier'
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-primary-600'}`, children: "Nakliyeci" })] }) })] }), _jsx("div", { className: "mb-20", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: steps[activeRole].map((step, index) => (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center", children: [_jsx("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm", children: index + 1 }), _jsx("div", { className: "w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-4", children: _jsx(step.icon, { className: "text-primary-600", size: 32 }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: step.title }), _jsx("p", { className: "text-gray-600 mb-4", children: step.description }), _jsx("p", { className: "text-sm text-gray-500", children: step.details })] }), index < steps[activeRole].length - 1 && (_jsx("div", { className: "hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-300" }))] }, index))) }) }), _jsxs("div", { className: "mb-20", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: ["Platform ", _jsx("span", { className: "text-primary-600", children: "\u00D6zellikleri" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: features.map((feature, index) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300", children: [_jsx("div", { className: "text-4xl mb-4", children: feature.icon }), _jsx("h3", { className: "text-lg font-bold text-gray-900 mb-3", children: feature.title }), _jsx("p", { className: "text-gray-600 text-sm", children: feature.description })] }, index))) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 mb-20 text-center", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: ["Video ile ", _jsx("span", { className: "text-primary-600", children: "\u00D6\u011Frenin" })] }), _jsx("p", { className: "text-gray-600 mb-8 max-w-2xl mx-auto", children: "Kargo Market'in nas\u0131l \u00E7al\u0131\u015Ft\u0131\u011F\u0131n\u0131 detayl\u0131 olarak anlatan videomuz\u0131 izleyin." }), _jsxs("div", { className: "aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden max-w-4xl mx-auto cursor-pointer group", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300", children: _jsx("div", { className: "w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl", children: _jsx(Play, { className: "text-primary-600 ml-1", size: 32 }) }) }), _jsxs("div", { className: "absolute bottom-4 left-4 text-white", children: [_jsx("h3", { className: "font-bold text-lg", children: "Kargo Market Kullan\u0131m K\u0131lavuzu" }), _jsx("p", { className: "text-sm text-gray-300", children: "5 dakikada t\u00FCm \u00F6zellikleri \u00F6\u011Frenin" })] })] })] }), _jsxs("div", { className: "mb-20", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: ["S\u0131k\u00E7a Sorulan ", _jsx("span", { className: "text-primary-600", children: "Sorular" })] }), _jsx("div", { className: "max-w-4xl mx-auto", children: faqs.map((faq, index) => (_jsxs("div", { className: "bg-white rounded-xl shadow-lg mb-4 overflow-hidden", children: [_jsxs("button", { onClick: () => setOpenFaq(openFaq === index ? null : index), className: "w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: faq.question }), openFaq === index ? (_jsx(ChevronUp, { className: "text-primary-600", size: 20 })) : (_jsx(ChevronDown, { className: "text-gray-400", size: 20 }))] }), openFaq === index && (_jsx("div", { className: "px-6 pb-6 animate-fade-in", children: _jsx("p", { className: "text-gray-600", children: faq.answer }) }))] }, index))) })] }), _jsxs("div", { className: "bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center mb-20", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Destek Ekibimiz" }), _jsx("p", { className: "text-xl mb-8 text-primary-100", children: "Herhangi bir sorunuz mu var? 7/24 destek ekibimiz size yard\u0131mc\u0131 olmaya haz\u0131r!" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto", children: [_jsxs("div", { className: "bg-white/10 rounded-lg p-6 backdrop-blur-sm", children: [_jsx(MessageSquare, { className: "mx-auto mb-4 text-white", size: 32 }), _jsx("h3", { className: "font-bold mb-2", children: "Canl\u0131 Destek" }), _jsx("p", { className: "text-primary-100 text-sm mb-4", children: "An\u0131nda yard\u0131m al\u0131n" }), _jsx("button", { className: "bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105", children: "Sohbet Ba\u015Flat" })] }), _jsxs("div", { className: "bg-white/10 rounded-lg p-6 backdrop-blur-sm", children: [_jsx(Phone, { className: "mx-auto mb-4 text-white", size: 32 }), _jsx("h3", { className: "font-bold mb-2", children: "Telefon Deste\u011Fi" }), _jsx("p", { className: "text-primary-100 text-sm mb-4", children: "+905412879705" }), _jsx("button", { className: "bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105", children: "Hemen Ara" })] }), _jsxs("div", { className: "bg-white/10 rounded-lg p-6 backdrop-blur-sm", children: [_jsx(Mail, { className: "mx-auto mb-4 text-white", size: 32 }), _jsx("h3", { className: "font-bold mb-2", children: "E-posta Deste\u011Fi" }), _jsx("p", { className: "text-primary-100 text-sm mb-4", children: "emrahbadas@gmail.com" }), _jsx("button", { className: "bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105", children: "E-posta G\u00F6nder" })] })] })] }), _jsxs("div", { className: "text-center", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: ["Hemen ", _jsx("span", { className: "text-primary-600", children: "Ba\u015Flay\u0131n!" })] }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "S\u0131k\u0131ld\u0131n\u0131z m\u0131? Hemen ilan a\u00E7\u0131n ve ilk teklifinizi g\u00F6r\u00FCn!" }), _jsx("button", { className: "bg-primary-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl", children: "\u00DCcretsiz \u00DCye Ol" })] })] }) }));
};
export default HowItWorksPage;
