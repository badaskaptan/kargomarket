import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { User, Bell, Lock, CreditCard, FileText, Globe, Shield } from 'lucide-react';
const SettingsSection = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [formData, setFormData] = useState({
        email: 'ahmet.yilmaz@example.com',
        phone: '+90 555 123 4567',
        language: 'tr',
        timezone: 'europe-istanbul',
        visibility: 'public',
        twoFactor: false
    });
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Settings updated:', formData);
        // Show success message
    };
    const menuItems = [
        {
            id: 'account',
            label: 'Hesap Ayarları',
            icon: User,
            active: activeTab === 'account'
        },
        {
            id: 'notifications',
            label: 'Bildirim Ayarları',
            icon: Bell,
            active: activeTab === 'notifications'
        },
        {
            id: 'security',
            label: 'Gizlilik ve Güvenlik',
            icon: Lock,
            active: activeTab === 'security'
        },
        {
            id: 'payment',
            label: 'Ödeme Yöntemleri',
            icon: CreditCard,
            active: activeTab === 'payment'
        },
        {
            id: 'billing',
            label: 'Fatura Bilgileri',
            icon: FileText,
            active: activeTab === 'billing'
        },
        {
            id: 'legal',
            label: 'Yasal Bilgiler',
            icon: Shield,
            active: activeTab === 'legal'
        }
    ];
    const renderLegalContent = () => (_jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Yasal Bilgiler" }), _jsx("p", { className: "text-gray-600", children: "Yasal bilgiler ve belgeler burada g\u00F6r\u00FCnt\u00FClenecek." })] }));
    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (_jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(User, { className: "mr-2 text-primary-600", size: 20 }), "Hesap Ayarlar\u0131"] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Globe, { className: "inline w-4 h-4 mr-1" }), "E-posta Adresi"] }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "E-posta adresinizi girin", title: "E-posta adresi" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-2", children: "Telefon Numaras\u0131" }), _jsx("input", { type: "tel", id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "Telefon numaran\u0131z\u0131 girin", title: "Telefon numaras\u0131" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "language", className: "block text-sm font-medium text-gray-700 mb-2", children: "Dil Se\u00E7imi" }), _jsxs("select", { id: "language", name: "language", value: formData.language, onChange: handleInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", title: "Dil se\u00E7imi", children: [_jsx("option", { value: "", disabled: true, children: "Bir dil se\u00E7in" }), _jsx("option", { value: "tr", children: "T\u00FCrk\u00E7e" }), _jsx("option", { value: "en", children: "English" })] }), _jsx("label", { htmlFor: "timezone", className: "block text-sm font-medium text-gray-700 mb-2 mt-4", children: "Saat Dilimi" }), _jsxs("select", { id: "timezone", name: "timezone", value: formData.timezone, onChange: handleInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", title: "Saat dilimi se\u00E7imi", children: [_jsx("option", { value: "", disabled: true, children: "Saat dilimi se\u00E7in" }), _jsx("option", { value: "europe-istanbul", children: "Europe/Istanbul (UTC+3)" }), _jsx("option", { value: "europe-london", children: "Europe/London (UTC+0)" }), _jsx("option", { value: "america-new_york", children: "America/New_York (UTC-5)" })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h4", { className: "font-medium mb-4 flex items-center", children: [_jsx(Shield, { className: "mr-2 text-primary-600", size: 16 }), "Hesap G\u00F6r\u00FCn\u00FCrl\u00FC\u011F\u00FC"] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex items-start", children: _jsxs("label", { htmlFor: "visibilityPublic", className: "flex items-start", children: [_jsx("input", { type: "radio", id: "visibilityPublic", name: "visibility", value: "public", checked: formData.visibility === 'public', onChange: handleInputChange, className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1", title: "Herkese A\u00E7\u0131k g\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi", placeholder: "G\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi" }), _jsxs("span", { className: "ml-3", children: [_jsx("span", { className: "font-medium text-gray-900", children: "Herkese A\u00E7\u0131k" }), _jsx("p", { className: "text-sm text-gray-500", children: "Profiliniz ve ilanlar\u0131n\u0131z t\u00FCm kullan\u0131c\u0131lar taraf\u0131ndan g\u00F6r\u00FClebilir." })] })] }) }), _jsx("div", { className: "flex items-start", children: _jsxs("label", { htmlFor: "visibilityLimited", className: "flex items-start", children: [_jsx("input", { type: "radio", id: "visibilityLimited", name: "visibility", value: "limited", checked: formData.visibility === 'limited', onChange: handleInputChange, className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1", title: "S\u0131n\u0131rl\u0131 g\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi", placeholder: "G\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi" }), _jsxs("span", { className: "ml-3", children: [_jsx("span", { className: "font-medium text-gray-900", children: "S\u0131n\u0131rl\u0131" }), _jsx("p", { className: "text-sm text-gray-500", children: "Profiliniz sadece i\u015F yapt\u0131\u011F\u0131n\u0131z kullan\u0131c\u0131lar taraf\u0131ndan g\u00F6r\u00FClebilir." })] })] }) }), _jsx("div", { className: "flex items-start", children: _jsxs("label", { htmlFor: "visibilityPrivate", className: "flex items-start", children: [_jsx("input", { type: "radio", id: "visibilityPrivate", name: "visibility", value: "private", checked: formData.visibility === 'private', onChange: handleInputChange, className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1", title: "\u00D6zel g\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi", placeholder: "G\u00F6r\u00FCn\u00FCrl\u00FCk se\u00E7ene\u011Fi" }), _jsxs("span", { className: "ml-3", children: [_jsx("span", { className: "font-medium text-gray-900", children: "\u00D6zel" }), _jsx("p", { className: "text-sm text-gray-500", children: "Profiliniz sadece sizin taraf\u0131n\u0131zdan g\u00F6r\u00FClebilir." })] })] }) })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h4", { className: "font-medium mb-4 flex items-center", children: [_jsx(Lock, { className: "mr-2 text-primary-600", size: 16 }), "\u0130ki Fakt\u00F6rl\u00FC Do\u011Frulama"] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "\u0130ki Fakt\u00F6rl\u00FC Do\u011Frulama" }), _jsx("p", { className: "text-sm text-gray-500", children: "Hesab\u0131n\u0131z\u0131 daha g\u00FCvenli hale getirmek i\u00E7in iki fakt\u00F6rl\u00FC do\u011Frulamay\u0131 etkinle\u015Ftirin." })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsxs("label", { htmlFor: "twoFactor", className: "sr-only", children: ["\u0130ki Fakt\u00F6rl\u00FC Do\u011Frulama", _jsx("input", { type: "checkbox", id: "twoFactor", name: "twoFactor", checked: formData.twoFactor, onChange: handleInputChange, className: "sr-only peer", title: "\u0130ki Fakt\u00F6rl\u00FC Do\u011Frulama", placeholder: "\u0130ki Fakt\u00F6rl\u00FC Do\u011Frulama se\u00E7ene\u011Fi" })] }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" })] })] })] }), _jsx("div", { className: "flex justify-end pt-6", children: _jsx("button", { type: "submit", className: "px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl", children: "De\u011Fi\u015Fiklikleri Kaydet" }) })] })] }));
            case 'notifications':
                // ... unchanged ...
                return (_jsx("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200" }));
            case 'legal':
                return renderLegalContent();
            default:
                return (_jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Bu b\u00F6l\u00FCm hen\u00FCz haz\u0131rlan\u0131yor" }), _jsx("p", { className: "text-gray-600", children: "Se\u00E7ti\u011Finiz ayar b\u00F6l\u00FCm\u00FC yak\u0131nda kullan\u0131ma sunulacak." })] }));
        }
    };
    return (_jsx("div", { className: "space-y-6 animate-fade-in", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Ayarlar" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "md:col-span-1", children: _jsxs("div", { className: "bg-gray-50 rounded-xl border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "p-4 bg-gray-100 border-b border-gray-200", children: _jsx("h3", { className: "font-medium text-gray-900", children: "Ayarlar Men\u00FCs\u00FC" }) }), _jsx("div", { className: "divide-y divide-gray-200", children: menuItems.map((item) => (_jsx("button", { onClick: () => setActiveTab(item.id), className: `w-full p-4 text-left hover:bg-gray-100 transition-colors ${item.active ? 'bg-primary-50 border-l-4 border-primary-600' : ''}`, children: _jsxs("div", { className: "flex items-center", children: [_jsx(item.icon, { size: 20, className: `mr-3 ${item.active ? 'text-primary-600' : 'text-gray-500'}` }), _jsx("span", { className: `font-medium ${item.active ? 'text-primary-600' : 'text-gray-700'}`, children: item.label })] }) }, item.id))) })] }) }), _jsx("div", { className: "md:col-span-2", children: renderContent() })] })] }) }));
};
export default SettingsSection;
