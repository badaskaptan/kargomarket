import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Save, Eye, Play } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
const CreateAdSection = () => {
    const { setActiveSection } = useDashboard();
    const [adType, setAdType] = useState('');
    const [uploadedMedia, setUploadedMedia] = useState([]);
    const [formData, setFormData] = useState({
        adNumber: `AD${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        companyName: '',
        adTitle: '',
        shortDescription: '',
        fullDescription: '',
        specialOffer: '',
        contactPhone: '',
        contactEmail: '',
        website: '',
        targetAudience: 'all',
        budget: '',
        duration: '30',
        features: []
    });
    const adTypes = [
        {
            id: 'premium-card',
            title: 'Premium Reklam Kartı',
            description: 'Öne çıkan konumda, büyük boyutlu reklam kartı',
            price: '₺500/ay',
            features: ['Öne çıkan konum', 'Büyük kart boyutu', 'Video desteği', 'Özel rozet'],
            icon: '⭐'
        },
        {
            id: 'standard-card',
            title: 'Standart Reklam Kartı',
            description: 'Normal boyutlu, etkili reklam kartı',
            price: '₺300/ay',
            features: ['Standart konum', 'Normal kart boyutu', 'Resim desteği', 'İletişim butonları'],
            icon: '📋'
        },
        {
            id: 'video-ad',
            title: 'Video Reklamı',
            description: 'Video içerikli, dikkat çekici reklam',
            price: '₺750/ay',
            features: ['Video oynatma', 'Otomatik oynatma', 'HD kalite', 'Ses desteği'],
            icon: '🎥'
        }
    ];
    const availableFeatures = [
        'Aynı Gün Teslimat',
        'SMS Bilgilendirme',
        'Online Takip',
        '7/24 Müşteri Hizmetleri',
        'Kapıdan Kapıya',
        'Sigortalı Taşıma',
        'Esnek Ödeme',
        'Geniş Şube Ağı',
        'Hızlı Teslimat',
        'Güvenli Paketleme',
        'Müşteri Memnuniyeti',
        'Express Teslimat',
        'Motokurye',
        'Anlık Takip'
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleFeatureToggle = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };
    const handleMediaUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                // Dosya türü kontrolü
                const allowedTypes = [
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                    'image/gif',
                    'video/mp4',
                    'video/webm',
                    'video/ogg'
                ];
                // Dosya boyutu kontrolü (50MB)
                if (file.size > 50 * 1024 * 1024) {
                    alert(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 50MB'dir.`);
                    return;
                }
                if (allowedTypes.includes(file.type)) {
                    const newMedia = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: file.type.startsWith('video/') ? 'video' : 'image',
                        url: URL.createObjectURL(file),
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
                    };
                    setUploadedMedia(prev => [...prev, newMedia]);
                }
                else {
                    alert('Desteklenmeyen dosya türü. Lütfen PNG, JPEG, GIF, MP4, WebM veya OGG dosyası yükleyin.');
                }
            });
        }
    };
    const handleMediaDelete = (id) => {
        setUploadedMedia(prev => prev.filter(media => media.id !== id));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Reklam oluşturuluyor:', {
            ...formData,
            adType,
            uploadedMedia
        });
        setActiveSection('my-ads');
    };
    const getAdTypeStyle = () => {
        const styles = {
            'premium-card': 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300',
            'standard-card': 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
            'video-ad': 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300'
        };
        return styles[adType] || 'bg-white border-gray-200';
    };
    return (_jsx("div", { className: "space-y-6 animate-fade-in", children: _jsxs("div", { className: `rounded-3xl shadow-lg p-6 transition-all duration-300 border-2 ${getAdTypeStyle()}`, children: [_jsxs("div", { className: "flex items-center mb-8", children: [_jsx("button", { onClick: () => setActiveSection('my-ads'), className: "mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full", title: "Geri", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Yeni Reklam Olu\u015Ftur" })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Reklam T\u00FCr\u00FC Se\u00E7in" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: adTypes.map((type) => (_jsx("div", { onClick: () => setAdType(type.id), className: `border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${adType === type.id
                                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-primary-300'}`, children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-3", children: type.icon }), _jsx("h4", { className: "text-lg font-bold text-gray-900 mb-2", children: type.title }), _jsx("p", { className: "text-gray-600 text-sm mb-3", children: type.description }), _jsx("div", { className: "text-xl font-bold text-primary-600 mb-3", children: type.price }), _jsx("ul", { className: "text-xs text-gray-500 space-y-1", children: type.features.map((feature, index) => (_jsxs("li", { className: "flex items-center", children: [_jsx("span", { className: "w-1 h-1 bg-green-500 rounded-full mr-2" }), feature] }, index))) })] }) }, type.id))) })] }), adType && (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "adNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Reklam No" }), _jsx("input", { type: "text", id: "adNumber", name: "adNumber", value: formData.adNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "companyName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Firma Ad\u0131 *" }), _jsx("input", { type: "text", id: "companyName", name: "companyName", value: formData.companyName, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: ABC Lojistik A.\u015E." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "adTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "Reklam Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "adTitle", name: "adTitle", value: formData.adTitle, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: T\u00FCrkiye'nin En H\u0131zl\u0131 Kargo Hizmeti" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "targetAudience", className: "block text-sm font-medium text-gray-700 mb-2", children: "Hedef Kitle *" }), _jsxs("select", { id: "targetAudience", name: "targetAudience", value: formData.targetAudience, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "all", children: "T\u00FCm Kullan\u0131c\u0131lar" }), _jsx("option", { value: "buyers", children: "Al\u0131c\u0131/Sat\u0131c\u0131lar" }), _jsx("option", { value: "carriers", children: "Nakliyeciler" }), _jsx("option", { value: "companies", children: "Kurumsal M\u00FC\u015Fteriler" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contactPhone", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130leti\u015Fim Telefonu *" }), _jsx("input", { type: "tel", id: "contactPhone", name: "contactPhone", value: formData.contactPhone, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: +90 444 2 727" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contactEmail", className: "block text-sm font-medium text-gray-700 mb-2", children: "E-posta Adresi *" }), _jsx("input", { type: "email", id: "contactEmail", name: "contactEmail", value: formData.contactEmail, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: info@abclojistik.com" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "website", className: "block text-sm font-medium text-gray-700 mb-2", children: "Website (Opsiyonel)" }), _jsx("input", { type: "url", id: "website", name: "website", value: formData.website, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: https://www.abclojistik.com" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "budget", className: "block text-sm font-medium text-gray-700 mb-2", children: "Ayl\u0131k B\u00FCt\u00E7e (TL) *" }), _jsx("input", { type: "number", id: "budget", name: "budget", value: formData.budget, onChange: handleInputChange, min: "100", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 1000" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shortDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "K\u0131sa A\u00E7\u0131klama *" }), _jsx("textarea", { id: "shortDescription", name: "shortDescription", value: formData.shortDescription, onChange: handleInputChange, rows: 2, maxLength: 150, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Reklam kart\u0131nda g\u00F6r\u00FCnecek k\u0131sa a\u00E7\u0131klama (max 150 karakter)" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [formData.shortDescription.length, "/150 karakter"] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "fullDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "Detayl\u0131 A\u00E7\u0131klama *" }), _jsx("textarea", { id: "fullDescription", name: "fullDescription", value: formData.fullDescription, onChange: handleInputChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Firman\u0131z ve hizmetleriniz hakk\u0131nda detayl\u0131 bilgi" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "specialOffer", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u00D6zel Teklif/Kampanya (Opsiyonel)" }), _jsx("input", { type: "text", id: "specialOffer", name: "specialOffer", value: formData.specialOffer, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: %20 \u0130ndirim - \u0130lk Sipari\u015Finizde" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Hizmet \u00D6zellikleri (En fazla 6 adet se\u00E7in)" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: availableFeatures.map((feature) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: feature, checked: formData.features.includes(feature), onChange: () => handleFeatureToggle(feature), disabled: formData.features.length >= 6 && !formData.features.includes(feature), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: feature, className: "ml-2 text-sm text-gray-700", children: feature })] }, feature))) }), _jsxs("div", { className: "text-xs text-gray-500 mt-2", children: [formData.features.length, "/6 \u00F6zellik se\u00E7ildi"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Reklam G\u00F6rseli/Videosu *" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors", children: [_jsx("input", { type: "file", id: "mediaUpload", multiple: true, accept: "image/*,video/*", onChange: handleMediaUpload, className: "hidden" }), _jsxs("label", { htmlFor: "mediaUpload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Medya dosyalar\u0131n\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" }), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PNG, JPEG, GIF, MP4, WebM, OGG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 50MB" })] })] }), uploadedMedia.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Medya (", uploadedMedia.length, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: uploadedMedia.map((media) => (_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "aspect-square bg-gray-100 rounded-lg overflow-hidden", children: media.type === 'video' ? (_jsxs("div", { className: "relative w-full h-full", children: [_jsx("video", { src: media.url, className: "w-full h-full object-cover", muted: true }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/30", children: _jsx(Play, { className: "text-white", size: 24 }) })] })) : (_jsx("img", { src: media.url, alt: media.name, className: "w-full h-full object-cover" })) }), _jsx("button", { type: "button", onClick: () => handleMediaDelete(media.id), className: "absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", title: "Sil", children: _jsx(X, { size: 14 }) }), _jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs font-medium text-gray-900 truncate", children: media.name }), _jsx("p", { className: "text-xs text-gray-500", children: media.size })] })] }, media.id))) })] }))] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setActiveSection('my-ads'), className: "px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm", children: "\u0130ptal" }), _jsxs("button", { type: "button", className: "px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center", title: "\u00D6nizleme", children: [_jsx(Eye, { size: 18, className: "mr-2" }), "\u00D6nizleme"] }), _jsxs("button", { type: "submit", className: "px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center", title: "Reklam\u0131 Yay\u0131nla", children: [_jsx(Save, { size: 18, className: "mr-2" }), "Reklam\u0131 Yay\u0131nla"] })] })] }))] }) }));
};
export default CreateAdSection;
