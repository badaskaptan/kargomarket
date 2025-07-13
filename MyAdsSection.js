import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Plus, Search, Edit, Pause, Play, Trash2, Eye, BarChart3, CreditCard, X, CheckCircle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
// Reklamlar dizisi en üste taşındı
const initialAds = [
    {
        id: 1,
        title: 'Hızlı Taşıma Hizmetleri',
        type: 'Premium Reklam Kartı',
        duration: '30 gün',
        targetRole: 'Alıcı/Satıcı',
        status: 'active',
        statusLabel: 'Aktif',
        remainingDays: '25 gün',
        views: 1234,
        clicks: 89,
        budget: '₺500',
        spent: '₺300'
    },
    {
        id: 2,
        title: 'Özel Fiyat Kampanyası',
        type: 'Video Reklamı',
        duration: '15 gün',
        targetRole: 'Nakliyeci',
        status: 'active',
        statusLabel: 'Aktif',
        remainingDays: '8 gün',
        views: 856,
        clicks: 67,
        budget: '₺750',
        spent: '₺500'
    },
    {
        id: 3,
        title: 'Yeni Rota Duyurusu',
        type: 'Standart Reklam Kartı',
        duration: '7 gün',
        targetRole: 'Tümü',
        status: 'pending',
        statusLabel: 'Beklemede',
        remainingDays: '-',
        views: 0,
        clicks: 0,
        budget: '₺300',
        spent: '₺0'
    }
];
const MyAdsSection = () => {
    const { setActiveSection } = useDashboard();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balance, setBalance] = useState(1250); // Varsayılan bakiye
    const [balanceForm, setBalanceForm] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        amount: ''
    });
    const [balanceSuccess, setBalanceSuccess] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        type: '',
        targetRole: '',
        budget: '',
        duration: ''
    });
    const [adsState, setAdsState] = useState(initialAds);
    const [infoMessage, setInfoMessage] = useState('');
    const getStatusBadge = (status, label) => {
        const statusClasses = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800',
            paused: 'bg-gray-100 text-gray-800'
        };
        return (_jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`, children: status === 'active' ? 'Aktif' : status === 'paused' ? 'Pasif' : label }));
    };
    const handleEdit = (ad) => {
        setSelectedAd(ad);
        setEditForm({
            title: ad.title,
            type: ad.type,
            targetRole: ad.targetRole,
            budget: ad.budget.replace('₺', ''),
            duration: ad.duration.replace(' gün', '')
        });
        setShowEditModal(true);
    };
    const handlePreview = (ad) => {
        setSelectedAd(ad);
        setShowPreviewModal(true);
    };
    const handlePause = (ad) => {
        setAdsState(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'paused', statusLabel: 'Pasif' } : a));
        setInfoMessage('Reklam pasif hale getirildi.');
        setTimeout(() => setInfoMessage(''), 2000);
    };
    const handleActivate = (ad) => {
        setAdsState(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'active', statusLabel: 'Aktif' } : a));
        setInfoMessage('Reklam aktif hale getirildi.');
        setTimeout(() => setInfoMessage(''), 2000);
    };
    const handleDelete = (ad) => {
        setSelectedAd(ad);
        setShowDeleteModal(true);
    };
    const confirmDelete = () => {
        if (!selectedAd)
            return;
        setAdsState(prev => prev.filter(a => a.id !== selectedAd.id));
        setShowDeleteModal(false);
        setInfoMessage('Reklam silindi.');
        setTimeout(() => setInfoMessage(''), 2000);
    };
    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditForm(f => ({ ...f, [name]: value }));
    };
    const saveEdit = () => {
        if (!selectedAd)
            return;
        setAdsState(prev => prev.map(a => a.id === selectedAd.id ? {
            ...a,
            title: editForm.title,
            type: editForm.type,
            targetRole: editForm.targetRole,
            budget: `₺${editForm.budget}`,
            duration: `${editForm.duration} gün`
        } : a));
        setShowEditModal(false);
        setInfoMessage('Reklam başarıyla güncellendi.');
        setTimeout(() => setInfoMessage(''), 2000);
    };
    const getActionButtons = (status, ad) => {
        if (status === 'pending') {
            return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 transition-colors", title: "D\u00FCzenle", onClick: () => handleEdit(ad), children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-green-600 hover:text-green-900 transition-colors", title: "Aktifle\u015Ftir", onClick: () => handleActivate(ad), children: _jsx(Play, { size: 18 }) }), _jsx("button", { title: "Sil", onClick: () => handleDelete(ad), children: _jsx(Trash2, {}) })] }));
        }
        return (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 transition-colors", title: "D\u00FCzenle", onClick: () => handleEdit(ad), children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-purple-600 hover:text-purple-900 transition-colors", title: "\u00D6nizleme", onClick: () => handlePreview(ad), children: _jsx(Eye, { size: 18 }) }), status === 'active' ? (_jsx("button", { className: "text-yellow-600 hover:text-yellow-900 transition-colors", title: "Pasif Yap", onClick: () => handlePause(ad), children: _jsx(Pause, { size: 18 }) })) : status === 'paused' ? (_jsx("button", { className: "text-green-600 hover:text-green-900 transition-colors", title: "Aktif Yap", onClick: () => handleActivate(ad), children: _jsx(Play, { size: 18 }) })) : null, _jsx("button", { className: "text-green-600 hover:text-green-900 transition-colors", title: "Performans", onClick: () => { setSelectedAd(ad); setShowPerformanceModal(true); }, children: _jsx(BarChart3, { size: 18 }) }), _jsx("button", { title: "Sil", onClick: () => handleDelete(ad), children: _jsx(Trash2, {}) })] }));
    };
    // Kullanıcı dostu reklam performans modalı
    const renderPerformanceModal = () => {
        if (!showPerformanceModal || !selectedAd)
            return null;
        // CTR hesaplama
        const ctr = selectedAd.views > 0 ? ((selectedAd.clicks / selectedAd.views) * 100).toFixed(2) : '0.00';
        return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [_jsx("button", { onClick: () => setShowPerformanceModal(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("h3", { className: "text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2", children: [_jsx(BarChart3, { size: 24 }), " Reklam Performans\u0131"] }), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900 mb-1", children: selectedAd.title }), _jsxs("div", { className: "text-sm text-gray-500", children: [selectedAd.type, " \u2022 ", selectedAd.targetRole] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "G\u00F6r\u00FCnt\u00FClenme" }), _jsx("div", { className: "text-xl font-bold text-blue-600", children: selectedAd.views.toLocaleString() })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "T\u0131klama" }), _jsx("div", { className: "text-xl font-bold text-green-600", children: selectedAd.clicks })] }), _jsxs("div", { className: "bg-amber-50 rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "T\u0131klanma Oran\u0131 (CTR)" }), _jsxs("div", { className: "text-xl font-bold text-amber-600", children: [ctr, "%"] })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-3 text-center", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Kalan G\u00FCn" }), _jsx("div", { className: "text-xl font-bold text-purple-600", children: selectedAd.remainingDays })] }), _jsxs("div", { className: "bg-pink-50 rounded-lg p-3 text-center col-span-2", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "B\u00FCt\u00E7e / Harcama" }), _jsxs("div", { className: "text-lg font-bold text-pink-600", children: [selectedAd.budget, " / ", selectedAd.spent] })] })] }), _jsxs("div", { className: "text-sm text-gray-600 text-center mb-2", children: ["Reklam performans\u0131n\u0131z\u0131 art\u0131rmak i\u00E7in ", _jsx("b", { children: "g\u00F6rsel/video kalitesine" }), " ve ", _jsx("b", { children: "hedef kitle se\u00E7imine" }), " dikkat edin."] }), _jsx("button", { onClick: () => setShowPerformanceModal(false), className: "w-full mt-2 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "Kapat" })] }) }));
    };
    // Bakiye yükleme modalı
    const renderBalanceModal = () => {
        if (!showBalanceModal)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [_jsx("button", { onClick: () => { setShowBalanceModal(false); setBalanceSuccess(false); setBalanceForm({ cardNumber: '', expiry: '', cvc: '', amount: '' }); }, className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("h3", { className: "text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2", children: [_jsx(CreditCard, { size: 24 }), " Bakiye Y\u00FCkle"] }), balanceSuccess ? (_jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { size: 48, className: "mx-auto text-green-500 mb-4" }), _jsx("div", { className: "text-lg font-semibold text-green-700 mb-2", children: "Bakiye ba\u015Far\u0131yla y\u00FCklendi!" }), _jsxs("div", { className: "text-gray-600 mb-4", children: ["Yeni bakiyeniz: ", _jsxs("span", { className: "font-bold text-primary-600", children: [balance.toLocaleString(), " \u20BA"] })] }), _jsx("button", { onClick: () => { setShowBalanceModal(false); setBalanceSuccess(false); setBalanceForm({ cardNumber: '', expiry: '', cvc: '', amount: '' }); }, className: "w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2", children: "Kapat" })] })) : (_jsxs("form", { className: "space-y-5", onSubmit: e => {
                            e.preventDefault();
                            if (!balanceForm.cardNumber || !balanceForm.expiry || !balanceForm.cvc || !balanceForm.amount)
                                return;
                            setBalance(b => b + parseInt(balanceForm.amount));
                            setBalanceSuccess(true);
                        }, children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kart Numaras\u0131" }), _jsx("input", { type: "text", maxLength: 19, inputMode: "numeric", pattern: "[0-9 ]*", placeholder: "1234 5678 9012 3456", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", value: balanceForm.cardNumber, onChange: e => setBalanceForm(f => ({ ...f, cardNumber: e.target.value.replace(/[^0-9 ]/g, '') })), required: true })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Son Kullanma" }), _jsx("input", { type: "text", maxLength: 5, placeholder: "AA/YY", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", value: balanceForm.expiry, onChange: e => setBalanceForm(f => ({ ...f, expiry: e.target.value.replace(/[^0-9/]/g, '') })), required: true })] }), _jsxs("div", { className: "w-24", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "CVC" }), _jsx("input", { type: "text", maxLength: 4, placeholder: "123", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", value: balanceForm.cvc, onChange: e => setBalanceForm(f => ({ ...f, cvc: e.target.value.replace(/[^0-9]/g, '') })), required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Y\u00FCklenecek Tutar (\u20BA)" }), _jsx("input", { type: "number", min: 1, placeholder: "\u00D6rn: 500", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", value: balanceForm.amount, onChange: e => setBalanceForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') })), required: true })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2", children: "Y\u00FCklemeyi Onayla" })] }))] }) }));
    };
    // Edit Modal
    const renderEditModal = () => {
        if (!showEditModal || !selectedAd)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [_jsx("button", { onClick: () => setShowEditModal(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-2xl font-bold text-primary-700 mb-4", children: "Reklam\u0131 D\u00FCzenle" }), _jsxs("form", { className: "space-y-4", onSubmit: e => { e.preventDefault(); saveEdit(); }, children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ba\u015Fl\u0131k" }), _jsx("input", { type: "text", name: "title", value: editForm.title, onChange: handleEditInput, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", required: true, placeholder: "Reklam ba\u015Fl\u0131\u011F\u0131", title: "Reklam ba\u015Fl\u0131\u011F\u0131" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tip" }), _jsxs("select", { name: "type", value: editForm.type, onChange: handleEditInput, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", title: "Reklam tipi", children: [_jsx("option", { children: "Premium Reklam Kart\u0131" }), _jsx("option", { children: "Video Reklam\u0131" }), _jsx("option", { children: "Standart Reklam Kart\u0131" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Hedef Kitle" }), _jsxs("select", { name: "targetRole", value: editForm.targetRole, onChange: handleEditInput, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", title: "Hedef kitle", children: [_jsx("option", { children: "Al\u0131c\u0131/Sat\u0131c\u0131" }), _jsx("option", { children: "Nakliyeci" }), _jsx("option", { children: "T\u00FCm\u00FC" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "B\u00FCt\u00E7e (\u20BA)" }), _jsx("input", { type: "number", name: "budget", value: editForm.budget, onChange: handleEditInput, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", required: true, placeholder: "B\u00FCt\u00E7e", title: "B\u00FCt\u00E7e" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "S\u00FCre (g\u00FCn)" }), _jsx("input", { type: "number", name: "duration", value: editForm.duration, onChange: handleEditInput, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500", required: true, placeholder: "S\u00FCre (g\u00FCn)", title: "S\u00FCre (g\u00FCn)" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx("button", { type: "button", onClick: () => setShowEditModal(false), className: "px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300", children: "\u0130ptal" }), _jsx("button", { type: "submit", className: "px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700", children: "Kaydet" })] })] })] }) }));
    };
    // Preview Modal
    const renderPreviewModal = () => {
        if (!showPreviewModal || !selectedAd)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [_jsx("button", { onClick: () => setShowPreviewModal(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-2xl font-bold text-primary-700 mb-4", children: "Reklam \u00D6nizleme" }), _jsx("div", { className: "mb-2 text-lg font-semibold", children: selectedAd.title }), _jsxs("div", { className: "mb-1 text-gray-600", children: [selectedAd.type, " \u2022 ", selectedAd.targetRole] }), _jsxs("div", { className: "mb-1", children: ["B\u00FCt\u00E7e: ", _jsx("span", { className: "font-bold", children: selectedAd.budget })] }), _jsxs("div", { className: "mb-1", children: ["S\u00FCre: ", _jsx("span", { className: "font-bold", children: selectedAd.duration })] }), _jsxs("div", { className: "mb-1", children: ["Durum: ", getStatusBadge(selectedAd.status, selectedAd.statusLabel)] }), selectedAd.status === 'active' ? (_jsx("div", { className: "mt-2 text-green-700 text-sm font-medium", children: "Bu reklam yay\u0131nda ve herkes taraf\u0131ndan g\u00F6r\u00FCnt\u00FClenebilir." })) : selectedAd.status === 'paused' ? (_jsx("div", { className: "mt-2 text-yellow-700 text-sm font-medium", children: "Bu reklam pasif durumda, yay\u0131nda de\u011Fildir." })) : null, _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { onClick: () => setShowPreviewModal(false), className: "px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700", children: "Kapat" }) })] }) }));
    };
    // Delete Modal
    const renderDeleteModal = () => {
        if (!showDeleteModal || !selectedAd)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [_jsx("button", { onClick: () => setShowDeleteModal(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-2xl font-bold text-red-700 mb-4", children: "Reklam\u0131 Sil" }), _jsxs("div", { className: "mb-4", children: ["\"", selectedAd.title, "\" reklam\u0131n\u0131 silmek istedi\u011Finize emin misiniz?"] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setShowDeleteModal(false), className: "px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300", children: "\u0130ptal" }), _jsx("button", { onClick: confirmDelete, className: "px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700", children: "Sil" })] })] }) }));
    };
    // Filtrelenmiş reklamlar
    const filteredAds = adsState.filter(ad => (!searchTerm || ad.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!statusFilter || ad.status === statusFilter));
    return (_jsx("div", { className: "space-y-6 animate-fade-in", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Reklam Y\u00F6netim Paneli" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Mevcut Bakiye: ", _jsxs("span", { className: "font-medium text-green-600", children: [balance.toLocaleString(), " \u20BA"] })] }), _jsxs("button", { onClick: () => setShowBalanceModal(true), className: "bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl", children: [_jsx(CreditCard, { size: 16 }), "Bakiye Y\u00FCkle"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Aktif Reklamlar" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: "2" })] }), _jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(Eye, { className: "text-blue-600", size: 20 }) })] }) }), _jsx("div", { className: "bg-green-50 rounded-lg p-4 border border-green-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Toplam G\u00F6r\u00FCnt\u00FClenme" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "2,090" })] }), _jsx("div", { className: "w-10 h-10 rounded-full bg-green-100 flex items-center justify-center", children: _jsx(BarChart3, { className: "text-green-600", size: 20 }) })] }) }), _jsx("div", { className: "bg-purple-50 rounded-lg p-4 border border-purple-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Bu Ay Harcama" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: "800 \u20BA" })] }), _jsx("div", { className: "w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center", children: _jsx(CreditCard, { className: "text-purple-600", size: 20 }) })] }) }), _jsx("div", { className: "bg-amber-50 rounded-lg p-4 border border-amber-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ortalama CTR" }), _jsx("p", { className: "text-2xl font-bold text-amber-600", children: "4.2%" })] }), _jsx("div", { className: "w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center", children: _jsx(BarChart3, { className: "text-amber-600", size: 20 }) })] }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-6", children: [_jsxs("button", { onClick: () => setActiveSection('create-ad'), className: "bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl", children: [_jsx(Plus, { size: 20, className: "mr-2" }), _jsx("span", { children: "Yeni Reklam Olu\u015Ftur" })] }), _jsxs("button", { className: "bg-white text-primary-600 border-2 border-primary-600 py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-50 transition-colors", children: [_jsx(BarChart3, { size: 20, className: "mr-2" }), _jsx("span", { children: "Reklam Performans\u0131" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-grow", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Reklam ara...", title: "Reklam ara", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", "aria-label": "Reklam Durumu Filtrele", title: "Reklam Durumu Filtrele", children: [_jsx("option", { value: "", children: "T\u00FCm Durumlar" }), _jsx("option", { value: "active", children: "Aktif" }), _jsx("option", { value: "pending", children: "Beklemede" }), _jsx("option", { value: "completed", children: "Tamamland\u0131" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ba\u015Fl\u0131k" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tip" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Hedef Kitle" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "G\u00F6r\u00FCnt\u00FClenme" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "T\u0131klama" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "B\u00FCt\u00E7e/Harcama" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Durum" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "S\u00FCresi Kalan" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Eylemler" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredAds.map((ad) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: ad.title }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: ad.type }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: ad.targetRole }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: ad.views.toLocaleString() }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: ad.clicks }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-500", children: [ad.budget, " / ", ad.spent] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(ad.status, ad.statusLabel) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: ad.remainingDays }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getActionButtons(ad.status, ad) })] }, ad.id))) })] }) }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Toplam 3 kay\u0131ttan 1-3 aras\u0131 g\u00F6steriliyor" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors", disabled: true, children: "\u00D6nceki" }), _jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-primary-600 text-white", children: "1" }), _jsx("button", { className: "px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors", disabled: true, children: "Sonraki" })] })] }), renderPerformanceModal(), renderBalanceModal(), infoMessage && (_jsx("div", { className: "fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in", children: infoMessage })), renderEditModal(), renderPreviewModal(), renderDeleteModal()] }) }));
};
export default MyAdsSection;
