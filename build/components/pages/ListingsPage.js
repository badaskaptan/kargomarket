import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Search, Filter, MapPin, Package, Clock, Eye, Star, LogIn, AlertTriangle } from 'lucide-react';
import LiveMap from '../common/LiveMap';
import { listings } from '../../data/listings';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
// ListingsPage component - no props needed since we use context
const ListingsPage = () => {
    const { isLoggedIn, login, register, googleLogin } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedTransport, setSelectedTransport] = useState('all');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showSelfOfferWarning, setShowSelfOfferWarning] = useState(false);
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
    // Simulated current user ID - gerçek uygulamada authentication context'ten gelecek
    const currentUserId = 'user_123'; // Bu değer gerçek uygulamada auth context'ten gelecek
    const categories = [
        { id: 'all', label: 'Tüm İlanlar', count: 156 },
        { id: 'cargo-trade', label: 'Yük Alım Satım', count: 89 },
        { id: 'transport-request', label: 'Nakliye Talebi', count: 34 },
        { id: 'transport-service', label: 'Nakliye İlanları', count: 33 }
    ];
    const transportModes = [
        { id: 'all', label: 'Tüm Taşıma' },
        { id: 'road', label: 'Karayolu' },
        { id: 'sea', label: 'Denizyolu' },
        { id: 'air', label: 'Havayolu' },
        { id: 'rail', label: 'Demiryolu' }
    ];
    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.loadType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || listing.category === activeCategory;
        const matchesTransport = selectedTransport === 'all' ||
            listing.transportMode === selectedTransport;
        return matchesSearch && matchesCategory && matchesTransport;
    });
    const stats = [
        { label: 'Toplam İlan', value: '1,247', color: 'text-blue-600' },
        { label: 'Bugün Yeni', value: '89', color: 'text-green-600' },
        { label: 'Aktif Nakliyeci', value: '3,456', color: 'text-purple-600' },
        { label: 'Tamamlanan', value: '12,890', color: 'text-orange-600' }
    ];
    const getCategoryColor = (category) => {
        const colors = {
            'all': 'bg-gray-100 text-gray-700 border-gray-200',
            'cargo-trade': 'bg-blue-100 text-blue-700 border-blue-200',
            'transport-request': 'bg-green-100 text-green-700 border-green-200',
            'transport-service': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[category] || colors.all;
    };
    const getListingTypeColor = (type) => {
        const colors = {
            'Satış İlanı': 'bg-blue-100 text-blue-800',
            'Alım İlanı': 'bg-green-100 text-green-800',
            'Nakliye Talebi': 'bg-orange-100 text-orange-800',
            'Nakliye Hizmeti': 'bg-purple-100 text-purple-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };
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
        return isLoggedIn && listing.ownerId === currentUserId;
    };
    // Teklif Ver butonu işlevi
    const handleShowOffer = (listing) => {
        if (!isLoggedIn) {
            setAuthModalOpen(true);
            return;
        }
        if (listing.ownerId === currentUserId) {
            setShowSelfOfferWarning(true);
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
    // Mesaj Gönder butonu işlevi
    const handleShowMessage = (listing) => {
        if (!isLoggedIn) {
            setAuthModalOpen(true);
            return;
        }
        if (listing.ownerId === currentUserId) {
            setShowSelfOfferWarning(true);
            return;
        }
        setMessageTarget(listing);
        setShowMessageModal(true);
    };
    // Dosya yükleme
    const handleNewOfferFileChange = (e) => {
        if (e.target.files) {
            setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
        }
    };
    // Teklif formu submit
    const handleNewOfferSubmit = (e) => {
        e.preventDefault();
        if (!newOfferForm.price || !newOfferForm.transportResponsible || !newOfferForm.origin || !newOfferForm.destination) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }
        alert('Teklif gönderildi!');
        setShowNewOfferModal(false);
    };
    // Mesaj gönderme
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim())
            return;
        alert('Mesaj gönderildi!');
        setShowMessageModal(false);
        setMessageText('');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 py-8", children: [_jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-6", children: ["G\u00FCncel ", _jsx("span", { className: "text-primary-600", children: "Y\u00FCk ve Nakliye \u0130lanlar\u0131" })] }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto mb-8", children: "Binlerce aktif ilan aras\u0131ndan size en uygun olan\u0131n\u0131 bulun" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto", children: stats.map((stat, index) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300", children: [_jsx("div", { className: `text-3xl font-bold ${stat.color} mb-2`, children: stat.value }), _jsx("div", { className: "text-gray-600 font-medium", children: stat.label })] }, index))) })] }), _jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex flex-wrap justify-center gap-4", children: categories.map(category => (_jsxs("button", { onClick: () => setActiveCategory(category.id), className: `px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${activeCategory === category.id
                                    ? getCategoryColor(category.id).replace('100', '200').replace('700', '800') + ' shadow-lg'
                                    : getCategoryColor(category.id) + ' hover:shadow-md'}`, children: [_jsx("span", { children: category.label }), _jsxs("span", { className: "ml-2 text-sm opacity-75", children: ["(", category.count, ")"] })] }, category.id))) }) }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 mb-8", children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "\u0130lan, \u015Fehir veya y\u00FCk tipi ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" })] }), _jsx("select", { value: selectedTransport, onChange: (e) => setSelectedTransport(e.target.value), className: "px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", title: "Ta\u015F\u0131ma modu se\u00E7in", children: transportModes.map(mode => (_jsx("option", { value: mode.id, children: mode.label }, mode.id))) }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center transform hover:scale-105", children: [_jsx(Filter, { size: 20, className: "mr-2" }), "Filtreler"] })] }), showFilters && (_jsx("div", { className: "mt-6 pt-6 border-t border-gray-200 animate-fade-in", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u011F\u0131rl\u0131k Aral\u0131\u011F\u0131" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", placeholder: "Min (ton)", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" }), _jsx("input", { type: "number", placeholder: "Max (ton)", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fiyat Aral\u0131\u011F\u0131" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", placeholder: "Min (\u20BA)", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" }), _jsx("input", { type: "number", placeholder: "Max (\u20BA)", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tarih Aral\u0131\u011F\u0131" }), _jsx("input", { type: "date", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500", title: "Tarih se\u00E7in", placeholder: "Tarih se\u00E7in" })] })] }) }))] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8", children: filteredListings.map((listing) => (_jsxs("div", { className: "bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden", children: [_jsxs("div", { className: "p-6 pb-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold", title: "\u0130lan No", children: listing.ilanNo }), listing.urgent && (_jsxs("div", { className: "inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold", children: [_jsx(Clock, { size: 12, className: "mr-1" }), "Acil"] })), isOwnListing(listing) && (_jsx("div", { className: "inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold", children: "Sizin \u0130lan\u0131n\u0131z" }))] }), _jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer", children: listing.title })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold text-primary-600", children: listing.price }), _jsxs("div", { className: "text-xs text-gray-500", children: [listing.offers, " teklif"] })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(MapPin, { size: 14, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-sm", children: listing.route })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Package, { size: 14, className: "mr-2 text-primary-500" }), _jsxs("span", { className: "text-sm", children: [listing.loadType, " \u2022 ", listing.weight, " \u2022 ", listing.volume] })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Clock, { size: 14, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-sm", children: listing.publishDate })] })] }), isLoggedIn ? (_jsxs("div", { className: "flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3", children: _jsx("span", { className: "text-white text-xs font-medium", children: listing.contact.name.split(' ').map(n => n[0]).join('') }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 text-sm", children: listing.contact.name }), _jsx("div", { className: "text-xs text-gray-500", children: listing.contact.company }), _jsx("div", { className: "text-xs text-gray-500", children: listing.contact.phone }), _jsx("div", { className: "text-xs text-gray-500", children: listing.contact.email })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Star, { className: "text-yellow-400 fill-current", size: 14 }), _jsx("span", { className: "text-sm font-medium text-gray-700 ml-1", children: listing.contact.rating })] })] })) : (_jsx("div", { className: "mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200", children: _jsxs("div", { className: "flex items-center text-yellow-800", children: [_jsx(LogIn, { size: 16, className: "mr-2" }), _jsx("span", { className: "text-sm font-medium", children: "\u0130leti\u015Fim bilgilerini g\u00F6rmek i\u00E7in giri\u015F yap\u0131n" })] }) }))] }), _jsx("div", { className: "h-32 border-t border-gray-100", children: _jsx(LiveMap, { coordinates: [listing.coordinates], height: "128px", onClick: () => setSelectedListing(listing), className: "cursor-pointer hover:opacity-80 transition-opacity" }) }), _jsx("div", { className: "p-6 pt-4 border-t border-gray-100", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleShowOffer(listing), className: `flex-1 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-105 ${isOwnListing(listing)
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-primary-600 text-white hover:bg-primary-700'}`, disabled: isOwnListing(listing), children: isLoggedIn
                                                    ? isOwnListing(listing)
                                                        ? 'Kendi İlanınız'
                                                        : 'Teklif Ver'
                                                    : 'Giriş Yap' }), _jsx("button", { onClick: () => setSelectedListing(listing), className: "px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105", title: "Detaylar\u0131 G\u00F6r\u00FCnt\u00FCle", children: _jsx(Eye, { size: 16 }) }), _jsx("button", { onClick: () => handleShowMessage(listing), className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(listing)
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, disabled: isOwnListing(listing), title: "Mesaj G\u00F6nder", children: isLoggedIn
                                                    ? isOwnListing(listing)
                                                        ? 'Kendi İlanınız'
                                                        : 'Mesaj Gönder'
                                                    : 'Giriş Yap' })] }) })] }, listing.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx("button", { className: "bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl", children: "Daha Fazla \u0130lan Y\u00FCkle" }) }), _jsxs("div", { className: "mt-20 bg-white rounded-xl shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6 text-center", children: "S\u0131k\u00E7a Sorulan Sorular" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "\u0130lan nas\u0131l verebilirim?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "\u00DCye olduktan sonra \"Yeni \u0130lan\" butonuna t\u0131klayarak kolayca ilan verebilirsiniz." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Teklif verme \u00FCcreti var m\u0131?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Hay\u0131r, teklif vermek tamamen \u00FCcretsizdir. Sadece anla\u015Ft\u0131\u011F\u0131n\u0131zda komisyon al\u0131n\u0131r." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "G\u00FCvenlik nas\u0131l sa\u011Flan\u0131yor?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "T\u00FCm \u00FCyelerimiz do\u011Frulan\u0131r ve i\u015Flemler sigorta g\u00FCvencesi alt\u0131ndad\u0131r." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "\u00D6deme nas\u0131l yap\u0131l\u0131r?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "G\u00FCvenli \u00F6deme sistemi ile kredi kart\u0131, havale veya \u00E7ek ile \u00F6deme yapabilirsiniz." })] })] })] })] }), showSelfOfferWarning && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full", children: [_jsx("button", { onClick: () => setShowSelfOfferWarning(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", children: "\u00D7" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(AlertTriangle, { className: "text-red-600", size: 32 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-4", children: "\u0130\u015Flem Yap\u0131lamaz" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Kendi ilan\u0131n\u0131za teklif veremez veya mesaj g\u00F6nderemezsiniz. Bu bir g\u00FCvenlik \u00F6nlemidir." }), _jsx("div", { className: "flex flex-col gap-3", children: _jsx("button", { onClick: () => setShowSelfOfferWarning(false), className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105", children: "Anlad\u0131m" }) })] })] }) })), selectedListing && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setSelectedListing(null), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", children: "\u00D7" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [selectedListing.urgent && (_jsxs("div", { className: "inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold", children: [_jsx(Clock, { size: 16, className: "mr-1" }), "Acil \u0130lan"] })), _jsx("div", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getListingTypeColor(selectedListing.listingType ?? '')}`, children: selectedListing.listingType }), isOwnListing(selectedListing) && (_jsx("div", { className: "inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold", children: "Sizin \u0130lan\u0131n\u0131z" }))] }), _jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-3", children: selectedListing.title }), _jsxs("div", { className: "flex items-center text-gray-600 mb-2", children: [_jsx(MapPin, { size: 18, className: "mr-2 text-primary-500" }), _jsx("span", { className: "text-lg", children: selectedListing.route })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [selectedListing.publishDate, " yay\u0131nland\u0131"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6 mb-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Y\u00FCk Detaylar\u0131" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Y\u00FCk Tipi:" }), _jsx("div", { className: "font-medium", children: selectedListing.loadType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "A\u011F\u0131rl\u0131k:" }), _jsx("div", { className: "font-medium", children: selectedListing.weight })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Hacim:" }), _jsx("div", { className: "font-medium", children: selectedListing.volume })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Ta\u015F\u0131ma Modu:" }), _jsx("div", { className: "font-medium capitalize", children: selectedListing.transportMode === 'road' ? 'Karayolu' : selectedListing.transportMode })] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6 mb-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "A\u00E7\u0131klama" }), _jsx("p", { className: "text-gray-700", children: selectedListing.description })] }), isLoggedIn ? (_jsxs("div", { className: "bg-primary-50 rounded-lg p-6 border border-primary-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: "\u0130leti\u015Fim Bilgileri" }), _jsxs("div", { className: "flex items-center", children: [_jsx(Star, { className: "text-yellow-400 fill-current", size: 16 }), _jsx("span", { className: "text-sm font-medium text-gray-700 ml-1", children: selectedListing.contact.rating })] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "\u0130sim:" }), " ", selectedListing.contact.name] }), _jsxs("div", { children: [_jsx("strong", { children: "Firma:" }), " ", selectedListing.contact.company] }), _jsxs("div", { children: [_jsx("strong", { children: "Telefon:" }), " ", selectedListing.contact.phone] }), _jsxs("div", { children: [_jsx("strong", { children: "E-posta:" }), " ", selectedListing.contact.email] })] })] })) : (_jsxs("div", { className: "bg-yellow-50 rounded-lg p-6 border border-yellow-200", children: [_jsxs("div", { className: "flex items-center text-yellow-800 mb-3", children: [_jsx(LogIn, { size: 20, className: "mr-2" }), _jsx("h4", { className: "font-semibold", children: "\u0130leti\u015Fim Bilgileri" })] }), _jsx("p", { className: "text-yellow-700 text-sm mb-4", children: "\u0130leti\u015Fim bilgilerini g\u00F6rmek ve teklif vermek i\u00E7in giri\u015F yapman\u0131z gerekiyor." }), _jsx("button", { onClick: () => {
                                                        setSelectedListing(null);
                                                        setAuthModalOpen(true);
                                                    }, className: "bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "Giri\u015F Yap" })] }))] }), _jsxs("div", { children: [_jsx("div", { className: "mb-6 h-80 rounded-lg overflow-hidden border border-gray-200", children: _jsx(LiveMap, { coordinates: [selectedListing.coordinates, selectedListing.destination], height: "320px", showRoute: true }) }), _jsx("div", { className: "bg-white border-2 border-primary-200 rounded-lg p-6 mb-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-primary-600 mb-2", children: selectedListing.price }), _jsxs("div", { className: "text-gray-600 mb-4", children: [selectedListing.offers, " teklif al\u0131nd\u0131"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleShowOffer(selectedListing), className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-primary-600 text-white hover:bg-primary-700'}`, disabled: isOwnListing(selectedListing), children: isLoggedIn
                                                                    ? isOwnListing(selectedListing)
                                                                        ? 'Kendi İlanınız'
                                                                        : 'Teklif Ver'
                                                                    : 'Giriş Yap' }), _jsx("button", { onClick: () => handleShowMessage(selectedListing), className: `flex-1 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 ${isOwnListing(selectedListing)
                                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, disabled: isOwnListing(selectedListing), children: isLoggedIn
                                                                    ? isOwnListing(selectedListing)
                                                                        ? 'Kendi İlanınız'
                                                                        : 'Mesaj Gönder'
                                                                    : 'Giriş Yap' })] })] }) }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "G\u00FCvenlik Bilgileri" }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Do\u011Frulanm\u0131\u015F \u00FCye"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Sigorta g\u00FCvencesi"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "G\u00FCvenli \u00F6deme sistemi"] })] })] })] })] })] }) })), showNewOfferModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative", children: [_jsx("button", { onClick: () => setShowNewOfferModal(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700", title: "Kapat", "aria-label": "Kapat", children: "\u00D7" }), _jsx("h3", { className: "text-xl font-bold mb-6", children: "Yeni Teklif Ver" }), _jsxs("form", { onSubmit: handleNewOfferSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\u0130lan Numaras\u0131" }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900", value: newOfferForm.listingId, disabled: true, readOnly: true, title: "\u0130lan Numaras\u0131", "aria-label": "\u0130lan Numaras\u0131", placeholder: "\u0130lan Numaras\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Nakliye Kime Ait" }), _jsxs("select", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.transportResponsible, onChange: e => setNewOfferForm(f => ({ ...f, transportResponsible: e.target.value })), required: true, title: "Nakliye Kime Ait", "aria-label": "Nakliye Kime Ait", children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "Al\u0131c\u0131", children: "Al\u0131c\u0131" }), _jsx("option", { value: "Sat\u0131c\u0131", children: "Sat\u0131c\u0131" }), _jsx("option", { value: "Nakliye Gerekmiyor", children: "Nakliye Gerekmiyor" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Kalk\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.origin, onChange: e => setNewOfferForm(f => ({ ...f, origin: e.target.value })), required: true, title: "Kalk\u0131\u015F Noktas\u0131", placeholder: "Kalk\u0131\u015F Noktas\u0131", "aria-label": "Kalk\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Var\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.destination, onChange: e => setNewOfferForm(f => ({ ...f, destination: e.target.value })), required: true, title: "Var\u0131\u015F Noktas\u0131", placeholder: "Var\u0131\u015F Noktas\u0131", "aria-label": "Var\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Teklif Tutar\u0131" }), _jsx("input", { type: "number", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.price, onChange: e => setNewOfferForm(f => ({ ...f, price: e.target.value })), required: true, min: "0", title: "Teklif Tutar\u0131", placeholder: "Teklif Tutar\u0131", "aria-label": "Teklif Tutar\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "A\u00E7\u0131klama" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.description, onChange: e => setNewOfferForm(f => ({ ...f, description: e.target.value })), rows: 3, title: "A\u00E7\u0131klama", placeholder: "A\u00E7\u0131klama", "aria-label": "A\u00E7\u0131klama" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Evrak ve Resim Y\u00FCkle" }), _jsx("input", { type: "file", className: "w-full border rounded-lg px-3 py-2", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", onChange: handleNewOfferFileChange, title: "Evrak ve Resim Y\u00FCkle", "aria-label": "Evrak ve Resim Y\u00FCkle" }), newOfferForm.files && newOfferForm.files.length > 0 && (_jsx("ul", { className: "mt-2 text-xs text-gray-600 list-disc list-inside", children: newOfferForm.files.map((file, idx) => (_jsx("li", { children: file.name }, idx))) }))] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2", children: "Teklif Ver" })] })] }) })), showMessageModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative", children: [_jsx("button", { onClick: () => setShowMessageModal(false), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700", title: "Kapat", "aria-label": "Kapat", children: "\u00D7" }), _jsx("h3", { className: "text-lg font-bold mb-4", children: "Mesaj G\u00F6nder" }), _jsxs("form", { onSubmit: handleSendMessage, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Al\u0131c\u0131" }), _jsx("input", { className: "w-full border rounded-lg px-3 py-2 bg-gray-100", value: messageTarget?.contact?.name || '', disabled: true, readOnly: true, title: "Al\u0131c\u0131", "aria-label": "Al\u0131c\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Mesaj\u0131n\u0131z" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2", value: messageText, onChange: e => setMessageText(e.target.value), rows: 3, required: true, title: "Mesaj\u0131n\u0131z", placeholder: "Mesaj\u0131n\u0131z\u0131 yaz\u0131n...", "aria-label": "Mesaj\u0131n\u0131z" })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2", children: "G\u00F6nder" })] })] }) })), _jsx(AuthModal, { isOpen: authModalOpen, onClose: () => setAuthModalOpen(false), onLogin: handleLogin, onRegister: handleRegister, onGoogleLogin: handleGoogleLogin })] }));
};
export default ListingsPage;
