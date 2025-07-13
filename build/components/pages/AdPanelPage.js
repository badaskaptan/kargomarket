import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ArrowRight, Target, BarChart3, Users, Zap } from 'lucide-react';
const AdPanelPage = () => {
    const adTypes = [
        {
            title: 'Banner Reklamları',
            description: 'Ana sayfa ve ilan sayfalarında görünen banner reklamları',
            price: '₺50/gün',
            features: ['Yüksek görünürlük', 'Tıklama bazlı ödeme', 'Detaylı analitik'],
            icon: '🎯'
        },
        {
            title: 'Öne Çıkan İlanlar',
            description: 'İlanınızı arama sonuçlarında en üstte gösterin',
            price: '₺25/gün',
            features: ['Öncelikli listeleme', 'Renkli vurgulama', 'Daha fazla görüntülenme'],
            icon: '⭐'
        },
        {
            title: 'Yan Panel Reklamları',
            description: 'Sayfa kenarlarında görünen kompakt reklamlar',
            price: '₺30/gün',
            features: ['Sürekli görünürlük', 'Mobil uyumlu', 'Hedef kitle seçimi'],
            icon: '📱'
        },
        {
            title: 'Pop-up Reklamları',
            description: 'Dikkat çekici pop-up reklamları',
            price: '₺75/gün',
            features: ['Maksimum etki', 'Zamanlama kontrolü', 'A/B test desteği'],
            icon: '💥'
        }
    ];
    const stats = [
        { label: 'Günlük Ziyaretçi', value: '50,000+', icon: Users },
        { label: 'Aylık Sayfa Görüntüleme', value: '2M+', icon: BarChart3 },
        { label: 'Ortalama CTR', value: '%3.2', icon: Target },
        { label: 'Aktif Kullanıcı', value: '15,000+', icon: Zap }
    ];
    const benefits = [
        {
            title: 'Hedefli Reklam',
            description: 'Bölge, sektör ve kullanıcı tipine göre hedefleme yapın',
            icon: '🎯'
        },
        {
            title: 'Gerçek Zamanlı Analitik',
            description: 'Reklamlarınızın performansını anlık olarak takip edin',
            icon: '📊'
        },
        {
            title: 'Esnek Bütçe',
            description: 'Günlük bütçenizi istediğiniz zaman ayarlayın',
            icon: '💰'
        },
        {
            title: 'Profesyonel Destek',
            description: 'Reklam kampanyalarınız için uzman desteği alın',
            icon: '🤝'
        }
    ];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: _jsx("span", { className: "text-primary-600", children: "Reklam Paneli" }) }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto mb-8", children: "Binlerce potansiyel m\u00FC\u015Fteriye ula\u015F\u0131n! Reklamlar\u0131n\u0131zla i\u015Finizi b\u00FCy\u00FCt\u00FCn." }), _jsx("button", { className: "bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl", children: "Hemen Reklam Ver" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-16", children: stats.map((stat, index) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300", children: [_jsx("div", { className: "w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(stat.icon, { className: "text-primary-600", size: 24 }) }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-1", children: stat.value }), _jsx("div", { className: "text-gray-600 text-sm", children: stat.label })] }, index))) }), _jsxs("div", { className: "mb-16", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: ["Reklam ", _jsx("span", { className: "text-primary-600", children: "T\u00FCrleri" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: adTypes.map((adType, index) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2", children: [_jsx("div", { className: "text-4xl mb-4 text-center", children: adType.icon }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3 text-center", children: adType.title }), _jsx("p", { className: "text-gray-600 text-sm mb-4 text-center", children: adType.description }), _jsx("div", { className: "text-center mb-4", children: _jsx("span", { className: "text-2xl font-bold text-primary-600", children: adType.price }) }), _jsx("ul", { className: "space-y-2 mb-6", children: adType.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-center text-sm text-gray-600", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), feature] }, featureIndex))) }), _jsx("button", { className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105", children: "Se\u00E7" })] }, index))) })] }), _jsxs("div", { className: "mb-16", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: ["Neden ", _jsx("span", { className: "text-primary-600", children: "Kargo Market" }), " Reklamlar\u0131?"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: benefits.map((benefit, index) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-4", children: benefit.icon }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: benefit.title }), _jsx("p", { className: "text-gray-600", children: benefit.description })] }, index))) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 mb-16", children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: ["Nas\u0131l ", _jsx("span", { className: "text-primary-600", children: "\u00C7al\u0131\u015F\u0131r?" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [
                                { step: '01', title: 'Reklam Türü Seçin', description: 'Size uygun reklam türünü belirleyin' },
                                { step: '02', title: 'Hedef Kitle Belirleyin', description: 'Reklamınızın kimler tarafından görüleceğini seçin' },
                                { step: '03', title: 'Bütçe Ayarlayın', description: 'Günlük veya toplam bütçenizi belirleyin' },
                                { step: '04', title: 'Yayınlayın', description: 'Reklamınız onaylandıktan sonra yayına başlar' }
                            ].map((step, index) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl", children: step.step }), _jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: step.title }), _jsx("p", { className: "text-gray-600 text-sm", children: step.description })] }, index))) })] }), _jsxs("div", { className: "bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Reklam\u0131n\u0131zla Binlerce Kullan\u0131c\u0131ya Ula\u015F\u0131n!" }), _jsx("p", { className: "text-xl mb-8 text-primary-100", children: "Hemen reklam verin ve i\u015Finizi b\u00FCy\u00FCtmeye ba\u015Flay\u0131n." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs("button", { className: "bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center", children: [_jsx("span", { children: "Reklam Olu\u015Ftur" }), _jsx(ArrowRight, { className: "ml-2", size: 20 })] }), _jsx("button", { className: "border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105", children: "Fiyat Listesi" })] })] }), _jsxs("div", { className: "mt-16 bg-white rounded-xl shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6 text-center", children: "S\u0131k\u00E7a Sorulan Sorular" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Reklam onay s\u00FCreci ne kadar?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Reklamlar\u0131n\u0131z genellikle 24 saat i\u00E7inde onaylan\u0131r ve yay\u0131na ba\u015Flar." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Minimum reklam b\u00FCt\u00E7esi var m\u0131?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Minimum g\u00FCnl\u00FCk b\u00FCt\u00E7e 25 TL'dir. \u0130stedi\u011Finiz zaman art\u0131rabilir veya azaltabilirsiniz." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Reklam performans\u0131n\u0131 nas\u0131l takip ederim?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Reklam panelinizden ger\u00E7ek zamanl\u0131 analitikleri g\u00F6r\u00FCnt\u00FCleyebilirsiniz." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Reklam\u0131m\u0131 istedi\u011Fim zaman durdurabilir miyim?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Evet, reklamlar\u0131n\u0131z\u0131 istedi\u011Finiz zaman duraklatabilir veya tamamen durdurabilirsiniz." })] })] })] })] }) }));
};
export default AdPanelPage;
