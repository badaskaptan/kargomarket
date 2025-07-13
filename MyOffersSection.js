import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Search, Check, X, MessageCircle, Eye, Edit, Save, MapPin, Package, Calendar, User, Phone, Mail, Building, AlertTriangle, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
const MyOffersSection = () => {
    // --- STATE TANIMLARI ---
    const [activeTab, setActiveTab] = useState('incoming');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [showNewOfferModal, setShowNewOfferModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showSelfOfferWarning, setShowSelfOfferWarning] = useState(false);
    const [editFormData, setEditFormData] = useState({
        price: '',
        transportResponsible: '',
        origin: '',
        destination: '',
        description: '',
        files: []
    });
    const [newOfferForm, setNewOfferForm] = useState({
        listingId: '',
        price: '',
        description: '',
        transportResponsible: '',
        origin: '',
        destination: '',
        files: []
    });
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatOffer, setChatOffer] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    // --- SABİT VERİLER ---
    const currentUserId = 'user_123'; // Simulated user id
    const incomingOffers = [
        {
            id: 1,
            listingId: 'ILN2506230001',
            listingTitle: 'İstanbul-Ankara Tekstil Yükü',
            offerBy: 'Mehmet Kaya',
            offerById: 'user_456', // Farklı kullanıcı - normal teklif
            amount: '₺4.500',
            date: '16.06.2025, 14:32',
            status: 'pending',
            statusLabel: 'Beklemede',
            listingType: 'Yük İlanı',
            transportResponsible: 'Alıcı',
            origin: 'İstanbul, Türkiye',
            destination: 'Ankara, Türkiye',
            description: 'Kaliteli tekstil ürünleri, paletli yük. Yükleme ve boşaltma için forklift gerekli.',
            weight: '15 ton',
            volume: '25 m³',
            loadingDate: '2025-06-20',
            deliveryDate: '2025-06-22',
            loadType: 'Tekstil Ürünleri',
            offerType: 'Fiyat Belirleyerek',
            transportMode: 'Karayolu',
            vehicleType: 'Tır (Standart Dorse)',
            documents: ['Fatura', 'İrsaliye', 'Sigorta Poliçesi'],
            listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
            contact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            },
            offerContact: {
                name: 'Mehmet Kaya',
                company: 'Kaya Nakliyat Ltd.',
                phone: '+90 555 987 6543',
                email: 'mehmet@kayanakliyat.com',
                address: 'Cumhuriyet Mah. Lojistik Cad. No:12 Şişli/İstanbul'
            }
        },
        {
            id: 2,
            listingId: 'NT2506230002',
            listingTitle: 'Ankara-Konya Gıda Taşıma',
            offerBy: 'Ali Demir',
            offerById: 'user_789', // Farklı kullanıcı - normal teklif
            amount: '₺3.200',
            date: '15.06.2025, 09:45',
            status: 'pending',
            statusLabel: 'Beklemede',
            listingType: 'Nakliye Talebi',
            transportResponsible: 'Satıcı',
            origin: 'Ankara, Türkiye',
            destination: 'Konya, Türkiye',
            description: 'Organik gıda ürünleri nakliye talebi. Soğuk zincir gerektiren ürünler.',
            weight: '12 ton',
            volume: '20 m³',
            loadingDate: '2025-06-21',
            deliveryDate: '2025-06-23',
            loadType: 'Ambalajlı Gıda Ürünleri',
            offerType: 'Doğrudan Teklif',
            transportMode: 'Karayolu',
            vehicleType: 'Frigorifik Araç',
            documents: ['Gıda Sertifikası', 'Soğuk Zincir Belgesi'],
            listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
            contact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            },
            offerContact: {
                name: 'Ali Demir',
                company: 'Demir Lojistik A.Ş.',
                phone: '+90 555 456 7890',
                email: 'ali@demirlojistik.com',
                address: 'Kızılay Mah. Taşıma Sok. No:8 Çankaya/Ankara'
            }
        },
        {
            id: 3,
            listingId: 'NK2506230003',
            listingTitle: 'İzmir-Antalya Elektronik Eşya',
            offerBy: 'Ayşe Yılmaz',
            offerById: 'user_101', // Farklı kullanıcı - normal teklif
            amount: '₺5.800',
            date: '14.06.2025, 16:20',
            status: 'accepted',
            statusLabel: 'Kabul Edildi',
            listingType: 'Nakliye İlanı',
            transportResponsible: 'Nakliyeci',
            origin: 'İzmir, Türkiye',
            destination: 'Antalya, Türkiye',
            description: 'Hassas elektronik ürünler için özel ambalajlama ile nakliye hizmeti.',
            capacity: '30 ton / 90 m³',
            availableDate: '2025-06-25',
            companyName: 'Yılmaz Nakliyat A.Ş.',
            transportMode: 'Karayolu',
            vehicleType: 'Kapalı Kasa Kamyon',
            features: ['Sigorta Dahil', 'Takip Sistemi', 'Hassas Yük Taşıma'],
            listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
            contact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            },
            offerContact: {
                name: 'Ayşe Yılmaz',
                company: 'Yılmaz Elektronik Ltd.',
                phone: '+90 555 321 9876',
                email: 'ayse@yilmazelektronik.com',
                address: 'Alsancak Mah. Teknoloji Cad. No:25 Konak/İzmir'
            }
        },
        {
            id: 4,
            listingId: 'ILN2506230004',
            listingTitle: 'Adana-Mersin İnşaat Malzemesi',
            offerBy: 'Hakan Şahin',
            offerById: 'user_202', // Farklı kullanıcı - normal teklif
            amount: '₺2.750',
            date: '12.06.2025, 11:05',
            status: 'rejected',
            statusLabel: 'Reddedildi',
            listingType: 'Yük İlanı',
            transportResponsible: 'Satıcı',
            origin: 'Adana, Türkiye',
            destination: 'Mersin, Türkiye',
            description: 'Çimento ve demir malzemeler. Açık kasa araç uygun.',
            weight: '25 ton',
            volume: '15 m³',
            loadingDate: '2025-06-18',
            deliveryDate: '2025-06-19',
            loadType: 'İnşaat Malzemeleri',
            offerType: 'Doğrudan Teklif',
            transportMode: 'Karayolu',
            vehicleType: 'Açık Kasa Kamyon',
            documents: ['İnşaat Ruhsatı', 'Malzeme Listesi'],
            listingOwnerId: currentUserId, // İlan sahibi mevcut kullanıcı
            contact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            },
            offerContact: {
                name: 'Hakan Şahin',
                company: 'Şahin İnşaat Malz.',
                phone: '+90 555 654 3210',
                email: 'hakan@sahininşaat.com',
                address: 'Seyhan Mah. İnşaat Cad. No:67 Seyhan/Adana'
            }
        }
    ];
    const outgoingOffers = [
        {
            id: 5,
            listingId: 'ILN2506230005',
            listingTitle: 'Samsun-Trabzon Mobilya Taşıma',
            offerBy: 'Ahmet Yılmaz', // Mevcut kullanıcı
            offerById: currentUserId, // Teklif veren mevcut kullanıcı
            amount: '₺3.800',
            date: '15.06.2025, 10:15',
            status: 'pending',
            statusLabel: 'Beklemede',
            listingType: 'Yük İlanı',
            transportResponsible: 'Alıcı',
            origin: 'Samsun, Türkiye',
            destination: 'Trabzon, Türkiye',
            description: 'Mobilya taşıma işlemi. Dikkatli taşıma gerekli.',
            weight: '10 ton',
            volume: '30 m³',
            loadingDate: '2025-06-22',
            deliveryDate: '2025-06-23',
            loadType: 'Mobilya',
            offerType: 'Fiyat Belirleyerek',
            transportMode: 'Karayolu',
            vehicleType: 'Kapalı Kasa Kamyon',
            documents: ['Fatura', 'Sigorta Poliçesi'],
            listingOwnerId: 'user_303', // İlan sahibi farklı kullanıcı
            contact: {
                name: 'Kemal Demir',
                company: 'Demir Mobilya Ltd.',
                phone: '+90 555 222 3333',
                email: 'kemal@demirmobilya.com',
                address: 'Atatürk Mah. Mobilya Cad. No:45 Samsun'
            },
            offerContact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            }
        },
        {
            id: 6,
            listingId: 'NT2506230006',
            listingTitle: 'Eskişehir-Konya Makine Taşıma',
            offerBy: 'Ahmet Yılmaz', // Mevcut kullanıcı
            offerById: currentUserId, // Teklif veren mevcut kullanıcı
            amount: '₺4.200',
            date: '14.06.2025, 14:30',
            status: 'accepted',
            statusLabel: 'Kabul Edildi',
            listingType: 'Nakliye Talebi',
            transportResponsible: 'Satıcı',
            origin: 'Eskişehir, Türkiye',
            destination: 'Konya, Türkiye',
            description: 'Endüstriyel makine taşıma işlemi. Özel ekipman gerekli.',
            weight: '18 ton',
            volume: '40 m³',
            loadingDate: '2025-06-25',
            deliveryDate: '2025-06-26',
            loadType: 'Makine Ekipmanları',
            offerType: 'Doğrudan Teklif',
            transportMode: 'Karayolu',
            vehicleType: 'Low-bed',
            documents: ['Makine Teknik Belgesi', 'Sigorta Poliçesi'],
            listingOwnerId: 'user_404', // İlan sahibi farklı kullanıcı
            contact: {
                name: 'Murat Öztürk',
                company: 'Öztürk Makine San.',
                phone: '+90 555 444 5555',
                email: 'murat@ozturkmakine.com',
                address: 'Sanayi Mah. Makine Cad. No:78 Eskişehir'
            },
            offerContact: {
                name: 'Ahmet Yılmaz',
                company: 'Yılmaz Tekstil A.Ş.',
                phone: '+90 555 123 4567',
                email: 'ahmet@yilmaztekstil.com',
                address: 'Atatürk Mah. Sanayi Cad. No:45 Kadıköy/İstanbul'
            }
        }
    ];
    // listings dizisini fonksiyonun başında tanımla
    const listings = [
        { id: 'ILN2506230001', title: 'İstanbul-Ankara Tekstil Yükü' },
        { id: 'ILN2506230002', title: 'Bursa Tekstil Ürünleri Satışı' },
        { id: 'ILN2506230003', title: 'İzmir-Ankara Frigorifik Taşıma' }
    ];
    // --- YARDIMCI FONKSİYONLAR ---
    const getActiveOffers = () => (activeTab === 'incoming' ? incomingOffers : outgoingOffers);
    const getStatusBadge = (status, label) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (_jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`, children: label }));
    };
    const getListingTypeBadge = (type, id) => {
        const typeClasses = {
            'Yük İlanı': 'bg-blue-100 text-blue-800',
            'Nakliye Talebi': 'bg-orange-100 text-orange-800',
            'Nakliye İlanı': 'bg-purple-100 text-purple-800'
        };
        const typeIcons = {
            'Yük İlanı': '📦',
            'Nakliye Talebi': '🚚',
            'Nakliye İlanı': '🚛'
        };
        return (_jsxs("div", { className: "flex flex-col items-start", children: [_jsxs("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[type]} mb-1`, children: [typeIcons[type], " ", type] }), _jsx("span", { className: "text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded", children: id })] }));
    };
    // --- ACTION FONKSİYONLARI ---
    const handleEdit = (offer) => {
        if (activeTab === 'outgoing' && offer.listingOwnerId === currentUserId) {
            setShowSelfOfferWarning(true);
            return;
        }
        setSelectedOffer(offer);
        setEditFormData({
            price: offer.amount.replace('₺', '').replace('.', ''),
            transportResponsible: offer.transportResponsible,
            origin: offer.origin,
            destination: offer.destination,
            description: offer.description,
            files: []
        });
        setEditModalOpen(true);
    };
    const handlePreview = (offer) => {
        setSelectedOffer(offer);
        setPreviewModalOpen(true);
    };
    const handleSaveEdit = () => {
        // API çağrısı yapılacak
        setEditModalOpen(false);
        setSelectedOffer(null);
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAccept = (offer) => {
        alert(`Teklif kabul edildi: ${offer.listingId}`);
    };
    const handleReject = (offer) => {
        alert(`Teklif reddedildi: ${offer.listingId}`);
    };
    const handleChat = (offer) => {
        setChatOffer(offer);
        setShowChatModal(true);
        setChatMessage('');
    };
    // Dosya yükleme değişikliği
    const handleNewOfferFileChange = (e) => {
        if (e.target.files) {
            setNewOfferForm(f => ({ ...f, files: Array.from(e.target.files ?? []) }));
        }
    };
    // --- BUTONLAR ---
    const getActionButtons = (status, offer) => {
        const isSelfOffer = activeTab === 'outgoing' && offer.listingOwnerId === currentUserId;
        if (isSelfOffer) {
            return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => setShowSelfOfferWarning(true), className: "text-red-600 hover:text-red-900 transition-colors", title: "Uyar\u0131", children: _jsx(AlertTriangle, { size: 18 }) }), _jsx("button", { onClick: () => handlePreview(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "\u00D6n \u0130zleme", children: _jsx(Eye, { size: 18 }) })] }));
        }
        if (status === 'accepted') {
            return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handlePreview(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "\u00D6n \u0130zleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { onClick: () => handleChat(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "Mesaj G\u00F6nder", children: _jsx(MessageCircle, { size: 18 }) })] }));
        }
        if (status === 'rejected') {
            return (_jsx("div", { className: "flex space-x-2", children: _jsx("button", { onClick: () => handlePreview(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "\u00D6n \u0130zleme", children: _jsx(Eye, { size: 18 }) }) }));
        }
        if (activeTab === 'incoming') {
            return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handlePreview(offer), className: "text-purple-600 hover:text-purple-900 transition-colors", title: "\u00D6n \u0130zleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { className: "text-green-600 hover:text-green-900 transition-colors", title: "Kabul Et", onClick: () => handleAccept(offer), children: _jsx(Check, { size: 18 }) }), _jsx("button", { className: "text-red-600 hover:text-red-900 transition-colors", title: "Reddet", onClick: () => handleReject(offer), children: _jsx(X, { size: 18 }) }), _jsx("button", { className: "text-blue-600 hover:text-blue-900 transition-colors", title: "Mesaj G\u00F6nder", onClick: () => handleChat(offer), children: _jsx(MessageCircle, { size: 18 }) })] }));
        }
        return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleEdit(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "D\u00FCzenle", children: _jsx(Edit, { size: 18 }) }), _jsx("button", { onClick: () => handlePreview(offer), className: "text-purple-600 hover:text-purple-900 transition-colors", title: "\u00D6n \u0130zleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { onClick: () => handleChat(offer), className: "text-blue-600 hover:text-blue-900 transition-colors", title: "Mesaj G\u00F6nder", children: _jsx(MessageCircle, { size: 18 }) })] }));
    };
    // --- MODAL RENDER FONKSİYONLARI ---
    const renderEditModal = () => {
        if (!editModalOpen || !selectedOffer)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setEditModalOpen(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Teklif D\u00FCzenle" }), _jsxs("p", { className: "text-gray-600", children: [selectedOffer.listingId, " - ", selectedOffer.listingTitle] })] }), _jsxs("form", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "price", className: "block text-sm font-medium text-gray-700 mb-2", children: "Teklif Tutar\u0131 (TL)" }), _jsx("input", { type: "number", id: "price", name: "price", value: editFormData.price, onChange: handleEditInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "\u00D6rn: 4500", title: "Teklif Tutar\u0131", "aria-label": "Teklif Tutar\u0131" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "transportResponsible", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye Kime Ait" }), _jsxs("select", { id: "transportResponsible", name: "transportResponsible", value: editFormData.transportResponsible, onChange: handleEditInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", title: "Nakliye Kime Ait", "aria-label": "Nakliye Kime Ait", children: [_jsx("option", { value: "Al\u0131c\u0131", children: "Al\u0131c\u0131" }), _jsx("option", { value: "Sat\u0131c\u0131", children: "Sat\u0131c\u0131" }), _jsx("option", { value: "Nakliyeci", children: "Nakliyeci" }), _jsx("option", { value: "Nakliye Gerekmiyor", children: "Nakliye Gerekmiyor" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "origin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Kalk\u0131\u015F Noktas\u0131"] }), _jsx("input", { type: "text", id: "origin", name: "origin", value: editFormData.origin, onChange: handleEditInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "\u00D6rn: \u0130stanbul, T\u00FCrkiye", title: "Kalk\u0131\u015F Noktas\u0131", "aria-label": "Kalk\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "destination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Var\u0131\u015F Noktas\u0131"] }), _jsx("input", { type: "text", id: "destination", name: "destination", value: editFormData.destination, onChange: handleEditInputChange, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "\u00D6rn: Ankara, T\u00FCrkiye", title: "Var\u0131\u015F Noktas\u0131", "aria-label": "Var\u0131\u015F Noktas\u0131" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama" }), _jsx("textarea", { id: "description", name: "description", value: editFormData.description, onChange: handleEditInputChange, rows: 4, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "Teklif a\u00E7\u0131klamas\u0131...", title: "A\u00E7\u0131klama", "aria-label": "A\u00E7\u0131klama" })] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setEditModalOpen(false), className: "px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors", children: "\u0130ptal" }), _jsxs("button", { type: "button", onClick: handleSaveEdit, className: "px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center", children: [_jsx(Save, { size: 18, className: "mr-2" }), "Kaydet"] })] })] })] }) }));
    };
    const renderPreviewModal = () => {
        if (!previewModalOpen || !selectedOffer)
            return null;
        // Kullanıcının kendi ilanına teklif vermesi durumunu kontrol et
        const isSelfOffer = selectedOffer.listingOwnerId === currentUserId &&
            selectedOffer.offerById === currentUserId;
        return (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setPreviewModalOpen(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Teklif \u00D6n \u0130zleme" }), _jsxs("div", { className: "flex items-center space-x-4", children: [getListingTypeBadge(selectedOffer.listingType, selectedOffer.listingId), getStatusBadge(selectedOffer.status, selectedOffer.statusLabel), isSelfOffer && (_jsxs("div", { className: "inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold", children: [_jsx(AlertTriangle, { size: 16, className: "mr-1" }), "Kendi \u0130lan\u0131n\u0131za Teklif"] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "text-2xl font-bold text-gray-900 mb-4", children: selectedOffer.listingTitle }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "G\u00FCzergah" }), _jsxs("div", { className: "font-medium", children: [selectedOffer.origin, " \u2192 ", selectedOffer.destination] })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Y\u00FCk Tipi" }), _jsx("div", { className: "font-medium", children: selectedOffer.loadType })] })] }), selectedOffer.weight && (_jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "A\u011F\u0131rl\u0131k" }), _jsx("div", { className: "font-medium", children: selectedOffer.weight })] })] })), selectedOffer.volume && (_jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Hacim" }), _jsx("div", { className: "font-medium", children: selectedOffer.volume })] })] })), selectedOffer.capacity && (_jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Kapasite" }), _jsx("div", { className: "font-medium", children: selectedOffer.capacity })] })] })), selectedOffer.loadingDate && (_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Y\u00FCkleme Tarihi" }), _jsx("div", { className: "font-medium", children: selectedOffer.loadingDate })] })] })), selectedOffer.deliveryDate && (_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Teslimat Tarihi" }), _jsx("div", { className: "font-medium", children: selectedOffer.deliveryDate })] })] })), selectedOffer.availableDate && (_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "text-primary-500 mr-2", size: 18 }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Bo\u015Fta Olma Tarihi" }), _jsx("div", { className: "font-medium", children: selectedOffer.availableDate })] })] }))] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h5", { className: "font-semibold text-gray-900 mb-3", children: "A\u00E7\u0131klama" }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: selectedOffer.description })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h5", { className: "font-semibold text-gray-900 mb-4", children: "Ta\u015F\u0131ma Detaylar\u0131" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Ta\u015F\u0131ma Modu" }), _jsx("div", { className: "font-medium", children: selectedOffer.transportMode })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Ara\u00E7 Tipi" }), _jsx("div", { className: "font-medium", children: selectedOffer.vehicleType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Nakliye Sorumlusu" }), _jsx("div", { className: "font-medium", children: selectedOffer.transportResponsible })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Teklif T\u00FCr\u00FC" }), _jsx("div", { className: "font-medium", children: selectedOffer.offerType })] })] })] }), selectedOffer.features && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h5", { className: "font-semibold text-gray-900 mb-4", children: "Hizmet \u00D6zellikleri" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedOffer.features.map((feature, index) => (_jsxs("span", { className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium", children: ["\u2713 ", feature] }, index))) })] })), selectedOffer.documents && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h5", { className: "font-semibold text-gray-900 mb-4", children: "Gerekli Evraklar" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: selectedOffer.documents.map((doc, index) => (_jsxs("div", { className: "flex items-center text-sm text-gray-700", children: [_jsx("span", { className: "w-2 h-2 bg-primary-500 rounded-full mr-2" }), doc] }, index))) })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-primary-50 rounded-lg p-6 border border-primary-200", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-primary-600 mb-2", children: selectedOffer.amount }), _jsx("div", { className: "text-gray-600 mb-4", children: "Teklif Tutar\u0131" }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Teklif Tarihi: ", selectedOffer.date] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Teklif Veren: ", selectedOffer.offerBy] })] }) }), _jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("h5", { className: "font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(User, { className: "mr-2 text-primary-600", size: 20 }), "\u0130lan Sahibi \u0130leti\u015Fim Bilgileri"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(User, { className: "text-gray-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: selectedOffer.contact?.name }), _jsx("div", { className: "text-sm text-gray-500", children: selectedOffer.contact?.company })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "text-gray-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: selectedOffer.contact?.phone }), _jsx("div", { className: "text-sm text-gray-500", children: "Telefon" })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "text-gray-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: selectedOffer.contact?.email }), _jsx("div", { className: "text-sm text-gray-500", children: "E-posta" })] })] }), _jsxs("div", { className: "flex items-start", children: [_jsx(Building, { className: "text-gray-400 mr-3 mt-1", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: selectedOffer.contact?.address }), _jsx("div", { className: "text-sm text-gray-500", children: "Adres" })] })] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-6 border border-blue-200", children: [_jsxs("h5", { className: "font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx(User, { className: "mr-2 text-blue-600", size: 20 }), "Teklif Veren \u0130leti\u015Fim Bilgileri"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(User, { className: "text-blue-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900", children: selectedOffer.offerContact?.name }), _jsx("div", { className: "text-sm text-blue-600", children: selectedOffer.offerContact?.company })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "text-blue-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900", children: selectedOffer.offerContact?.phone }), _jsx("div", { className: "text-sm text-blue-600", children: "Telefon" })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "text-blue-400 mr-3", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900", children: selectedOffer.offerContact?.email }), _jsx("div", { className: "text-sm text-blue-600", children: "E-posta" })] })] }), _jsxs("div", { className: "flex items-start", children: [_jsx(Building, { className: "text-blue-400 mr-3 mt-1", size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900", children: selectedOffer.offerContact?.address }), _jsx("div", { className: "text-sm text-blue-600", children: "Adres" })] })] })] })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-6 border border-green-200", children: [_jsx("h5", { className: "font-semibold text-green-800 mb-3", children: "G\u00FCvenlik Bilgileri" }), _jsxs("div", { className: "space-y-2 text-sm text-green-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Do\u011Frulanm\u0131\u015F \u00FCye"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Sigorta g\u00FCvencesi"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "G\u00FCvenli \u00F6deme sistemi"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "7/24 m\u00FC\u015Fteri deste\u011Fi"] })] })] }), isSelfOffer && (_jsxs("div", { className: "bg-red-50 rounded-lg p-6 border border-red-200", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(AlertTriangle, { className: "text-red-600 mr-2", size: 20 }), _jsx("h5", { className: "font-semibold text-red-800", children: "G\u00FCvenlik Uyar\u0131s\u0131" })] }), _jsxs("p", { className: "text-sm text-red-700", children: [_jsx("strong", { children: "Kendi ilan\u0131n\u0131za teklif vermeniz sistem taraf\u0131ndan engellenmi\u015Ftir." }), " Bu, platformun g\u00FCvenli\u011Fini ve adil kullan\u0131m\u0131n\u0131 sa\u011Flamak i\u00E7in al\u0131nm\u0131\u015F bir \u00F6nlemdir."] })] }))] })] })] }) }));
    };
    // Kendi İlanına Teklif Verme Uyarı Modalı
    const renderSelfOfferWarningModal = () => {
        if (!showSelfOfferWarning)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full", children: [_jsx("button", { onClick: () => setShowSelfOfferWarning(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(AlertTriangle, { className: "text-red-600", size: 32 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-4", children: "G\u00FCvenlik Uyar\u0131s\u0131" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Kendi ilan\u0131n\u0131za teklif vermeniz sistem taraf\u0131ndan engellenmi\u015Ftir. Bu, platformun g\u00FCvenli\u011Fini ve adil kullan\u0131m\u0131n\u0131 sa\u011Flamak i\u00E7in al\u0131nm\u0131\u015F bir \u00F6nlemdir." }), _jsx("div", { className: "flex flex-col gap-3", children: _jsx("button", { onClick: () => setShowSelfOfferWarning(false), className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105", children: "Anlad\u0131m" }) })] })] }) }));
    };
    // Yeni Teklif Modalini Aç
    const closeNewOfferModal = () => setShowNewOfferModal(false);
    // Yeni Teklif Modalini render et
    const renderNewOfferModal = () => {
        if (!showNewOfferModal)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative", children: [_jsx("button", { onClick: closeNewOfferModal, className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-xl font-bold mb-6", children: "Yeni Teklif Ver" }), _jsxs("form", { onSubmit: e => { e.preventDefault(); /* Teklif gönderme işlemi */ /* Teklif gönderme işlemi */ closeNewOfferModal(); }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\u0130lan Se\u00E7" }), _jsxs("select", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.listingId, onChange: e => setNewOfferForm(f => ({ ...f, listingId: e.target.value })), required: true, title: "\u0130lan Se\u00E7iniz", "aria-label": "\u0130lan Se\u00E7iniz", children: [_jsx("option", { value: "", children: "\u0130lan Se\u00E7iniz" }), listings.map((listing) => (_jsxs("option", { value: listing.id, children: [listing.id, " - ", listing.title] }, listing.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Nakliye Kime Ait" }), _jsxs("select", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.transportResponsible, onChange: e => setNewOfferForm(f => ({ ...f, transportResponsible: e.target.value })), required: true, title: "Nakliye Kime Ait", "aria-label": "Nakliye Kime Ait", children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "Al\u0131c\u0131", children: "Al\u0131c\u0131" }), _jsx("option", { value: "Sat\u0131c\u0131", children: "Sat\u0131c\u0131" }), _jsx("option", { value: "Nakliye Gerekmiyor", children: "Nakliye Gerekmiyor" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Kalk\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.origin, onChange: e => setNewOfferForm(f => ({ ...f, origin: e.target.value })), required: true, title: "Kalk\u0131\u015F Noktas\u0131", placeholder: "Kalk\u0131\u015F Noktas\u0131", "aria-label": "Kalk\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Var\u0131\u015F Noktas\u0131" }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.destination || '', onChange: e => setNewOfferForm(f => ({ ...f, destination: e.target.value })), required: true, title: "Var\u0131\u015F Noktas\u0131", placeholder: "Var\u0131\u015F Noktas\u0131", "aria-label": "Var\u0131\u015F Noktas\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Teklif Tutar\u0131" }), _jsx("input", { type: "number", className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.price, onChange: e => setNewOfferForm(f => ({ ...f, price: e.target.value })), required: true, min: "0", title: "Teklif Tutar\u0131", placeholder: "Teklif Tutar\u0131", "aria-label": "Teklif Tutar\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "A\u00E7\u0131klama" }), _jsx("textarea", { className: "w-full border rounded-lg px-3 py-2", value: newOfferForm.description, onChange: e => setNewOfferForm(f => ({ ...f, description: e.target.value })), rows: 3, title: "A\u00E7\u0131klama", placeholder: "A\u00E7\u0131klama", "aria-label": "A\u00E7\u0131klama" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Evrak ve Resim Y\u00FCkle" }), _jsx("input", { type: "file", className: "w-full border rounded-lg px-3 py-2", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", onChange: handleNewOfferFileChange, title: "Evrak ve Resim Y\u00FCkle", "aria-label": "Evrak ve Resim Y\u00FCkle" }), newOfferForm.files && newOfferForm.files.length > 0 && (_jsx("ul", { className: "mt-2 text-xs text-gray-600 list-disc list-inside", children: newOfferForm.files.map((file, idx) => (_jsx("li", { children: file.name }, idx))) }))] }), _jsxs("button", { type: "submit", className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2", children: [_jsx(PlusCircle, { size: 18 }), "Teklif Ver"] })] })] }) }));
    };
    const renderChatModal = () => {
        if (!showChatModal || !chatOffer)
            return null;
        const recipient = activeTab === 'incoming' ? chatOffer.offerContact : chatOffer.contact;
        return (_jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in", role: "dialog", "aria-modal": "true", "aria-labelledby": "chat-modal-title", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-md w-full shadow-lg", children: [_jsx("button", { onClick: () => setShowChatModal(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { id: "chat-modal-title", className: "text-xl font-bold text-gray-900 mb-2", children: "Mesaj G\u00F6nder" }), _jsxs("div", { className: "mb-4 text-gray-700 text-sm", children: [_jsx("span", { className: "font-semibold", children: "\u0130lan:" }), " ", chatOffer.listingId, " - ", chatOffer.listingTitle] }), _jsxs("div", { className: "mb-4 text-gray-700 text-sm", children: [_jsx("span", { className: "font-semibold", children: "Al\u0131c\u0131:" }), " ", recipient?.name, " (", recipient?.company, ")"] }), _jsxs("form", { onSubmit: e => {
                            e.preventDefault();
                            setShowChatModal(false);
                            toast.success('Mesaj gönderildi!');
                        }, children: [_jsx("label", { htmlFor: "chat-message", className: "block text-sm font-medium mb-1", children: "Mesaj\u0131n\u0131z" }), _jsx("textarea", { id: "chat-message", className: "w-full border rounded-lg px-3 py-2 mb-4", value: chatMessage, onChange: e => setChatMessage(e.target.value), rows: 4, required: true, title: "Mesaj\u0131n\u0131z", "aria-label": "Mesaj\u0131n\u0131z", placeholder: "Mesaj\u0131n\u0131z\u0131 yaz\u0131n...", autoFocus: true }), _jsxs("button", { type: "submit", className: "w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2", children: [_jsx(MessageCircle, { size: 18 }), " G\u00F6nder"] })] })] }) }));
    };
    // --- RETURN ---
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [renderNewOfferModal(), renderChatModal(), _jsxs("button", { onClick: () => setShowNewOfferModal(true), className: "mb-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2", children: [_jsx(PlusCircle, { size: 20 }), " Yeni Teklif Ver"] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4 md:mb-0", children: "Tekliflerim" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Teklif ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", title: "Durum filtresi", children: [_jsx("option", { value: "", children: "T\u00FCm Durumlar" }), _jsx("option", { value: "pending", children: "Beklemede" }), _jsx("option", { value: "accepted", children: "Kabul Edildi" }), _jsx("option", { value: "rejected", children: "Reddedildi" })] })] })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex space-x-1 border-b border-gray-200", children: [_jsx("button", { onClick: () => setActiveTab('incoming'), className: `px-4 py-2 font-medium transition-colors ${activeTab === 'incoming'
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Gelen Teklifler" }), _jsx("button", { onClick: () => setActiveTab('outgoing'), className: `px-4 py-2 font-medium transition-colors ${activeTab === 'outgoing'
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Verdi\u011Fim Teklifler" })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130lan No & Tipi" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: activeTab === 'incoming' ? 'Teklif Veren' : 'İlan Sahibi' }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Teklif Tutar\u0131" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Teklif Tarihi" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Durum" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Eylemler" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: getActiveOffers().map((offer) => {
                                        const isSelfOffer = activeTab === 'outgoing' && offer.listingOwnerId === currentUserId;
                                        return (_jsxs("tr", { className: `hover:bg-gray-50 transition-colors ${isSelfOffer ? 'bg-red-50' : ''}`, children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getListingTypeBadge(offer.listingType, offer.listingId) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: offer.listingTitle }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-2", children: _jsx("span", { className: "text-white text-xs font-medium", children: activeTab === 'incoming'
                                                                        ? offer.offerBy.split(' ').map(n => n[0]).join('')
                                                                        : offer.contact.name.split(' ').map(n => n[0]).join('') }) }), _jsxs("div", { className: "text-sm text-gray-500", children: [activeTab === 'incoming' ? offer.offerBy : offer.contact.name, isSelfOffer && (_jsxs("div", { className: "text-xs text-red-600 font-medium flex items-center mt-1", children: [_jsx(AlertTriangle, { size: 12, className: "mr-1" }), "Kendi ilan\u0131n\u0131z!"] }))] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: offer.amount }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: offer.date }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(offer.status, offer.statusLabel) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getActionButtons(offer.status, offer) })] }, offer.id));
                                    }) })] }) }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Toplam ", getActiveOffers().length, " kay\u0131ttan 1-", getActiveOffers().length, " aras\u0131 g\u00F6steriliyor"] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors", disabled: true, children: "\u00D6nceki" }), _jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-primary-600 text-white", children: "1" }), _jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors", disabled: true, children: "Sonraki" })] })] })] }), renderEditModal(), renderPreviewModal(), renderSelfOfferWarningModal()] }));
};
export default MyOffersSection;
