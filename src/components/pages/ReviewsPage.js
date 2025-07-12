import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Search, Star, ThumbsUp, ThumbsDown, MessageCircle, Award, Users, ChevronDown, ChevronUp } from 'lucide-react';
const ReviewsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companies = [
        {
            id: 1,
            name: 'Aras Kargo',
            logo: '🚚',
            description: 'Türkiye\'nin önde gelen kargo şirketi',
            rating: 4.8,
            reviewCount: 1247,
            totalTransactions: 15420,
            joinDate: '2018',
            category: 'Kargo Hizmetleri',
            recentReviews: [
                {
                    id: 1,
                    userName: 'Mehmet Y.',
                    rating: 5,
                    date: '2 gün önce',
                    comment: 'Çok hızlı ve güvenilir hizmet. Paketim zamanında geldi, hiçbir sorun yaşamadım.',
                    helpful: 12,
                    type: 'positive',
                    verified: true
                },
                {
                    id: 2,
                    userName: 'Ayşe K.',
                    rating: 4,
                    date: '1 hafta önce',
                    comment: 'Genel olarak memnunum ama bazen teslimat saatleri değişebiliyor.',
                    helpful: 8,
                    type: 'neutral',
                    verified: true
                }
            ]
        },
        {
            id: 2,
            name: 'MNG Kargo',
            logo: '📦',
            description: 'Güvenilir kargo ve lojistik çözümleri',
            rating: 4.6,
            reviewCount: 856,
            totalTransactions: 12350,
            joinDate: '2019',
            category: 'Kargo Hizmetleri',
            recentReviews: [
                {
                    id: 3,
                    userName: 'Ali D.',
                    rating: 5,
                    date: '3 gün önce',
                    comment: 'Müşteri hizmetleri çok iyi, sorunumu hemen çözdüler.',
                    helpful: 15,
                    type: 'positive',
                    verified: true
                },
                {
                    id: 4,
                    userName: 'Fatma S.',
                    rating: 3,
                    date: '5 gün önce',
                    comment: 'Fiyatlar biraz yüksek ama hizmet kalitesi iyi.',
                    helpful: 6,
                    type: 'neutral',
                    verified: false
                }
            ]
        },
        {
            id: 3,
            name: 'Yurtiçi Kargo',
            logo: '🚛',
            description: 'Türkiye\'nin en geniş şube ağı',
            rating: 4.7,
            reviewCount: 2134,
            totalTransactions: 18750,
            joinDate: '2017',
            category: 'Kargo Hizmetleri',
            recentReviews: [
                {
                    id: 5,
                    userName: 'Hasan M.',
                    rating: 5,
                    date: '1 gün önce',
                    comment: 'Her zaman tercih ettiğim kargo şirketi. Güvenilir ve hızlı.',
                    helpful: 20,
                    type: 'positive',
                    verified: true
                },
                {
                    id: 6,
                    userName: 'Zeynep A.',
                    rating: 2,
                    date: '4 gün önce',
                    comment: 'Paketim zarar görmüş halde geldi, daha dikkatli olunmalı.',
                    helpful: 9,
                    type: 'negative',
                    verified: true
                }
            ]
        },
        {
            id: 4,
            name: 'Güven Sigorta',
            logo: '🛡️',
            description: 'Nakliye ve kargo sigortası uzmanı',
            rating: 4.5,
            reviewCount: 432,
            totalTransactions: 8920,
            joinDate: '2020',
            category: 'Sigorta Hizmetleri',
            recentReviews: [
                {
                    id: 7,
                    userName: 'Murat K.',
                    rating: 5,
                    date: '6 gün önce',
                    comment: 'Hasar durumunda çok hızlı ödeme yaptılar, teşekkürler.',
                    helpful: 18,
                    type: 'positive',
                    verified: true
                }
            ]
        },
        {
            id: 5,
            name: 'Lojistik Pro',
            logo: '🏭',
            description: 'Entegre lojistik çözümleri',
            rating: 4.9,
            reviewCount: 678,
            totalTransactions: 11200,
            joinDate: '2019',
            category: 'Lojistik Hizmetleri',
            recentReviews: [
                {
                    id: 8,
                    userName: 'Ahmet T.',
                    rating: 5,
                    date: '2 gün önce',
                    comment: 'Profesyonel ekip, mükemmel hizmet kalitesi.',
                    helpful: 25,
                    type: 'positive',
                    verified: true
                }
            ]
        }
    ];
    const stats = [
        {
            label: 'Toplam Firma',
            value: companies.length.toString(),
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Toplam Yorum',
            value: companies.reduce((sum, company) => sum + company.reviewCount, 0).toLocaleString(),
            icon: MessageCircle,
            color: 'green'
        },
        {
            label: 'Ortalama Puan',
            value: (companies.reduce((sum, company) => sum + company.rating, 0) / companies.length).toFixed(1),
            icon: Star,
            color: 'yellow'
        },
        {
            label: 'En Yüksek Puan',
            value: Math.max(...companies.map(c => c.rating)).toString(),
            icon: Award,
            color: 'purple'
        }
    ];
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            purple: 'bg-purple-100 text-purple-600'
        };
        return colors[color] || colors.blue;
    };
    const getReviewTypeColor = (type) => {
        const colors = {
            positive: 'border-l-green-500 bg-green-50',
            negative: 'border-l-red-500 bg-red-50',
            neutral: 'border-l-yellow-500 bg-yellow-50'
        };
        return colors[type] || colors.neutral;
    };
    const filteredCompanies = companies.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'reviews':
                return b.reviewCount - a.reviewCount;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: [_jsx("span", { className: "text-primary-600", children: "Yorumlar" }), " ve De\u011Ferlendirmeler"] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto mb-8", children: "Kullan\u0131c\u0131 deneyimlerini ke\u015Ffedin, g\u00FCvenilir firmalar hakk\u0131nda ger\u00E7ek yorumlar\u0131 okuyun." })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-12", children: stats.map((stat, index) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300", children: [_jsx("div", { className: `w-12 h-12 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center mx-auto mb-4`, children: _jsx(stat.icon, { size: 24 }) }), _jsx("div", { className: "text-3xl font-bold text-gray-900 mb-2", children: stat.value }), _jsx("div", { className: "text-gray-600 font-medium", children: stat.label })] }, index))) }), _jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 mb-8", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Firma ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", "aria-label": "S\u0131rala", title: "S\u0131rala", children: [_jsx("option", { value: "rating", children: "Puana G\u00F6re" }), _jsx("option", { value: "reviews", children: "Yorum Say\u0131s\u0131na G\u00F6re" }), _jsx("option", { value: "name", children: "\u0130sme G\u00F6re" })] })] }) }), _jsx("div", { className: "space-y-8", children: sortedCompanies.map((company) => (_jsxs("div", { className: "bg-white rounded-xl shadow-lg overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg", children: _jsx("span", { className: "text-white text-2xl", children: company.logo }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: company.name }), _jsx("p", { className: "text-gray-600 mb-2", children: company.description }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full", children: company.category }), _jsxs("span", { children: ["\uD83D\uDCC5 ", company.joinDate, "'den beri"] }), _jsxs("span", { children: ["\uD83D\uDCCA ", company.totalTransactions.toLocaleString(), " i\u015Flem"] })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx("div", { className: "flex items-center mr-2", children: [...Array(5)].map((_, i) => (_jsx(Star, { size: 20, className: `${i < Math.floor(company.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}` }, i))) }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: company.rating })] }), _jsxs("p", { className: "text-gray-600", children: [company.reviewCount, " yorum"] })] })] }) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900", children: "Son Yorumlar" }), _jsxs("button", { onClick: () => setSelectedCompany(selectedCompany === company.name ? null : company.name), className: "text-primary-600 hover:text-primary-700 font-medium flex items-center", children: ["T\u00FCm Yorumlar\u0131 G\u00F6r", selectedCompany === company.name ? (_jsx(ChevronUp, { size: 16, className: "ml-1" })) : (_jsx(ChevronDown, { size: 16, className: "ml-1" }))] })] }), _jsx("div", { className: "space-y-4", children: company.recentReviews.slice(0, selectedCompany === company.name ? company.recentReviews.length : 2).map((review) => (_jsxs("div", { className: `border-l-4 p-4 rounded-lg ${getReviewTypeColor(review.type)}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "font-medium text-gray-900", children: review.userName }), review.verified && (_jsx("span", { className: "ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium", children: "\u2713 Do\u011Frulanm\u0131\u015F" })), _jsx("div", { className: "flex items-center ml-3", children: [...Array(5)].map((_, i) => (_jsx(Star, { size: 14, className: `${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}` }, i))) })] }), _jsx("span", { className: "text-sm text-gray-500", children: review.date })] }), _jsx("p", { className: "text-gray-700 mb-3", children: review.comment }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("button", { className: "flex items-center text-green-600 hover:text-green-700 transition-colors", children: [_jsx(ThumbsUp, { size: 14, className: "mr-1" }), _jsx("span", { className: "text-sm", children: review.helpful })] }), _jsxs("button", { className: "flex items-center text-gray-400 hover:text-gray-600 transition-colors", children: [_jsx(ThumbsDown, { size: 14, className: "mr-1" }), _jsx("span", { className: "text-sm", children: "0" })] })] }), _jsx("button", { className: "text-primary-600 hover:text-primary-700 text-sm font-medium", children: "Yan\u0131tla" })] })] }, review.id))) }), selectedCompany === company.name && company.recentReviews.length > 2 && (_jsx("div", { className: "mt-4 text-center", children: _jsx("button", { className: "bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors", children: "Daha Fazla Yorum Y\u00FCkle" }) }))] })] }, company.id))) }), _jsxs("div", { className: "mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Deneyiminizi Payla\u015F\u0131n!" }), _jsx("p", { className: "text-xl mb-8 text-primary-100", children: "\u00C7al\u0131\u015Ft\u0131\u011F\u0131n\u0131z firmalar hakk\u0131nda yorum yaparak di\u011Fer kullan\u0131c\u0131lara yard\u0131mc\u0131 olun." }), _jsx("button", { className: "bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg", children: "Yorum Yap" })] })] }) }));
};
export default ReviewsPage;
