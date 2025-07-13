import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { FileText, Tag, Clock, CheckCheck, TrendingUp, Package, Truck, MessageCircle, User, ArrowRight, Activity } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
const OverviewSection = () => {
    const { setActiveSection } = useDashboard();
    const { profile } = useAuth();
    const stats = [
        {
            title: 'Aktif İlanlarım',
            value: '8',
            subtitle: 'Son 7 günde 3 yeni',
            icon: FileText,
            color: 'blue',
            trend: '+12%'
        },
        {
            title: 'Bekleyen Teklifler',
            value: '12',
            subtitle: 'Son 24 saatte 5 yeni',
            icon: Tag,
            color: 'green',
            trend: '+25%'
        },
        {
            title: 'Devam Eden İşlemler',
            value: '4',
            subtitle: '2 tanesi bugün başladı',
            icon: Clock,
            color: 'amber',
            trend: '+8%'
        },
        {
            title: 'Tamamlanan İşlemler',
            value: '27',
            subtitle: 'Bu ay 15 işlem',
            icon: CheckCheck,
            color: 'purple',
            trend: '+18%'
        }
    ];
    const activities = [
        {
            title: 'İstanbul-Ankara Tekstil Yükü ilanınıza yeni bir teklif geldi',
            time: 'Bugün, 14:32',
            icon: Tag,
            color: 'blue'
        },
        {
            title: 'Bursa-İzmir Mobilya Taşıma işlemi tamamlandı',
            time: 'Dün, 18:45',
            icon: CheckCheck,
            color: 'green'
        },
        {
            title: 'Mehmet Kaya size yeni bir mesaj gönderdi',
            time: 'Dün, 10:15',
            icon: MessageCircle,
            color: 'amber'
        },
        {
            title: 'Ankara-Konya Gıda Taşıma ilanınız yayınlandı',
            time: '16.06.2025, 09:28',
            icon: FileText,
            color: 'purple'
        }
    ];
    const quickActions = [
        {
            title: 'Yeni Yük İlanı Oluştur',
            icon: Package,
            action: () => setActiveSection('create-load-listing'),
            primary: true
        },
        {
            title: 'Yeni Nakliye Talebi Oluştur',
            icon: Truck,
            action: () => setActiveSection('create-shipment-request'),
            primary: false
        }
    ];
    const quickLinks = [
        { title: 'Tekliflerim', icon: Tag, action: () => setActiveSection('my-offers') },
        { title: 'Mesajlar', icon: MessageCircle, action: () => setActiveSection('messages') },
        { title: 'İlanlarım', icon: FileText, action: () => setActiveSection('my-listings') },
        { title: 'Profilim', icon: User, action: () => setActiveSection('profile') }
    ];
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-100 text-blue-600',
            green: 'bg-green-50 border-green-100 text-green-600',
            amber: 'bg-amber-50 border-amber-100 text-amber-600',
            purple: 'bg-purple-50 border-purple-100 text-purple-600'
        };
        return colors[color] || colors.blue;
    };
    return (_jsxs("div", { className: "space-y-8 animate-fade-in", children: [_jsx("div", { className: "bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold mb-2", children: ["Ho\u015F Geldiniz, ", profile?.full_name || 'Kullanıcı', "!"] }), _jsx("p", { className: "text-primary-100 text-lg", children: "Bug\u00FCn nas\u0131l yard\u0131mc\u0131 olabiliriz?" })] }), _jsx("div", { className: "hidden md:block", children: _jsx(Activity, { size: 64, className: "text-primary-200" }) })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: stats.map((stat, index) => (_jsxs("div", { className: `${getColorClasses(stat.color)} rounded-xl p-6 border card-hover`, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-700", children: stat.title }), _jsx("div", { className: "w-12 h-12 rounded-full bg-white/50 flex items-center justify-center", children: _jsx(stat.icon, { size: 24 }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-3xl font-bold text-gray-800", children: stat.value }), _jsx("p", { className: "text-sm text-gray-600", children: stat.subtitle }), _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { size: 16, className: "text-green-500 mr-1" }), _jsx("span", { className: "text-sm font-medium text-green-600", children: stat.trend })] })] })] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsxs("h3", { className: "text-xl font-semibold mb-6 flex items-center", children: [_jsx(Activity, { className: "mr-2 text-primary-600", size: 24 }), "Son Etkinlikler"] }), _jsx("div", { className: "space-y-4", children: activities.map((activity, index) => (_jsxs("div", { className: "flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx("div", { className: `w-10 h-10 rounded-full ${getColorClasses(activity.color)} flex items-center justify-center mr-4 flex-shrink-0`, children: _jsx(activity.icon, { size: 20 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900", children: activity.title }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: activity.time })] })] }, index))) }), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: _jsxs("button", { className: "text-primary-600 font-medium flex items-center hover:text-primary-700 transition-colors", children: [_jsx("span", { children: "T\u00FCm etkinlikleri g\u00F6r\u00FCnt\u00FCle" }), _jsx(ArrowRight, { size: 16, className: "ml-1" })] }) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-6", children: "H\u0131zl\u0131 \u0130\u015Flemler" }), _jsx("div", { className: "space-y-4", children: quickActions.map((action, index) => (_jsxs("button", { onClick: action.action, className: `w-full flex items-center justify-center p-4 rounded-lg font-medium transition-all duration-200 ${action.primary
                                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                                                : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'}`, children: [_jsx(action.icon, { size: 20, className: "mr-2" }), _jsx("span", { children: action.title })] }, index))) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsx("h4", { className: "font-semibold mb-4", children: "H\u0131zl\u0131 Eri\u015Fim" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: quickLinks.map((link, index) => (_jsxs("button", { onClick: link.action, className: "flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 card-hover", children: [_jsx(link.icon, { size: 20, className: "mb-2" }), _jsx("span", { className: "text-sm font-medium text-center", children: link.title })] }, index))) })] })] })] })] }));
};
export default OverviewSection;
