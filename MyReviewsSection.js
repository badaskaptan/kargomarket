import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Star, Eye, Building, MessageCircle, ThumbsUp, Save, X } from 'lucide-react';
// myReviews değişkenini useState'ten önce tanımla
const myReviews = [
    {
        id: 1,
        companyId: 1,
        companyName: 'Aras Kargo',
        companyLogo: '🚚',
        rating: 5,
        comment: 'Çok hızlı ve güvenilir hizmet. Paketim zamanında geldi, hiçbir sorun yaşamadım. Kesinlikle tavsiye ederim.',
        date: '2025-01-12',
        status: 'published',
        statusLabel: 'Yayınlandı',
        helpful: 12,
        views: 156,
        isPublic: true,
        visibleOn: ['Reklamlar Sayfası', 'Firma Profili', 'Yorumlar Sayfası']
    },
    {
        id: 2,
        companyId: 2,
        companyName: 'MNG Kargo',
        companyLogo: '📦',
        rating: 4,
        comment: 'Genel olarak memnunum ama bazen teslimat saatleri değişebiliyor. Müşteri hizmetleri iyi.',
        date: '2025-01-08',
        status: 'published',
        statusLabel: 'Yayınlandı',
        helpful: 8,
        views: 89,
        isPublic: true,
        visibleOn: ['Reklamlar Sayfası', 'Yorumlar Sayfası']
    },
    {
        id: 3,
        companyId: 4,
        companyName: 'Güven Sigorta',
        companyLogo: '🛡️',
        rating: 5,
        comment: 'Hasar durumunda çok hızlı ödeme yaptılar. Profesyonel yaklaşım için teşekkürler.',
        date: '2024-12-20',
        status: 'pending',
        statusLabel: 'Moderasyonda',
        helpful: 0,
        views: 0,
        isPublic: true,
        visibleOn: []
    },
    {
        id: 4,
        companyId: 5,
        companyName: 'Lojistik Pro',
        companyLogo: '🏭',
        rating: 3,
        comment: 'Ortalama bir hizmet. Fiyat/performans dengesi makul ama daha iyisi olabilir.',
        date: '2024-12-15',
        status: 'draft',
        statusLabel: 'Taslak',
        helpful: 0,
        views: 0,
        isPublic: false,
        visibleOn: []
    }
];
const MyReviewsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [newReviewModalOpen, setNewReviewModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        rating: 5,
        comment: '',
        isPublic: true
    });
    const [newReviewFormData, setNewReviewFormData] = useState({
        companyId: null,
        companyName: '',
        companyLogo: '',
        rating: 5,
        comment: '',
        isPublic: true
    });
    const [myReviewsState, setMyReviewsState] = useState(myReviews);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    // Kullanıcının işlem yaptığı firmalar (sadece bunlara yorum verebilir)
    const eligibleCompanies = [
        { id: 1, name: 'Aras Kargo', logo: '🚚', lastTransaction: '2025-01-10' },
        { id: 2, name: 'MNG Kargo', logo: '📦', lastTransaction: '2025-01-05' },
        { id: 3, name: 'Yurtiçi Kargo', logo: '🚛', lastTransaction: '2024-12-28' },
        { id: 4, name: 'Güven Sigorta', logo: '🛡️', lastTransaction: '2024-12-15' },
        { id: 5, name: 'Lojistik Pro', logo: '🏭', lastTransaction: '2024-12-10' }
    ];
    const getStatusBadge = (status, label) => {
        const statusClasses = {
            published: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            draft: 'bg-gray-100 text-gray-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (_jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`, children: label }));
    };
    const handleEdit = (review) => {
        setSelectedReview(review);
        setEditFormData({
            rating: review.rating,
            comment: review.comment,
            isPublic: review.isPublic
        });
        setEditModalOpen(true);
    };
    const handleSaveEdit = () => {
        console.log('Yorum düzenleme kaydediliyor:', editFormData);
        setEditModalOpen(false);
        setSelectedReview(null);
    };
    const handleEditInputChange = (e) => {
        const { name, value, type } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value
        }));
    };
    const handleNewReview = (company) => {
        if (company) {
            setNewReviewFormData({
                companyId: company.id,
                companyName: company.name,
                companyLogo: company.logo,
                rating: 5,
                comment: '',
                isPublic: true
            });
            setNewReviewModalOpen(true);
        }
        else {
            setNewReviewModalOpen(true);
        }
    };
    const handleNewReviewInputChange = (e) => {
        const { name, value, type } = e.target;
        setNewReviewFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value
        }));
    };
    const handleSelectCompanyForReview = (company) => {
        setNewReviewFormData({
            companyId: company.id,
            companyName: company.name,
            companyLogo: company.logo,
            rating: 5,
            comment: '',
            isPublic: true
        });
        setNewReviewModalOpen(true);
    };
    const handleSaveNewReview = () => {
        if (!newReviewFormData.companyId || !newReviewFormData.comment.trim())
            return;
        const newReview = {
            id: myReviewsState.length + 1,
            companyId: newReviewFormData.companyId,
            companyName: newReviewFormData.companyName,
            companyLogo: newReviewFormData.companyLogo,
            rating: newReviewFormData.rating,
            comment: newReviewFormData.comment,
            date: new Date().toISOString().slice(0, 10),
            status: 'pending',
            statusLabel: 'Moderasyonda',
            helpful: 0,
            views: 0,
            isPublic: newReviewFormData.isPublic,
            visibleOn: []
        };
        setMyReviewsState(prev => [newReview, ...prev]);
        setNewReviewModalOpen(false);
    };
    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setDeleteConfirmOpen(true);
    };
    const handleConfirmDelete = () => {
        setMyReviewsState(prev => prev.filter(r => r.id !== reviewToDelete.id));
        setDeleteConfirmOpen(false);
        setReviewToDelete(null);
    };
    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setReviewToDelete(null);
    };
    const renderEditModal = () => {
        if (!editModalOpen || !selectedReview)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setEditModalOpen(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Yorumu D\u00FCzenle" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: selectedReview.companyLogo }), _jsx("span", { className: "text-lg font-medium text-gray-700", children: selectedReview.companyName })] })] }), _jsxs("form", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Puan\u0131n\u0131z" }), _jsxs("div", { className: "flex items-center space-x-2", children: [[1, 2, 3, 4, 5].map((star) => (_jsxs("button", { type: "button", onClick: () => setEditFormData(prev => ({ ...prev, rating: star })), className: "focus:outline-none", title: `${star} yıldız ver`, "aria-label": `${star} yıldız ver`, children: [_jsx(Star, { size: 32, className: `${star <= editFormData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors` }), _jsxs("span", { className: "sr-only", children: [star, " y\u0131ld\u0131z"] })] }, star))), _jsxs("span", { className: "ml-3 text-lg font-medium text-gray-700", children: [editFormData.rating, "/5"] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "comment", className: "block text-sm font-medium text-gray-700 mb-2", children: "Yorumunuz" }), _jsx("textarea", { id: "comment", name: "comment", value: editFormData.comment, onChange: handleEditInputChange, rows: 4, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "Deneyiminizi detayl\u0131 olarak payla\u015F\u0131n..." })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "isPublic", name: "isPublic", checked: editFormData.isPublic, onChange: handleEditInputChange, className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: "isPublic", className: "ml-2 text-sm text-gray-700", children: "Yorumum herkese a\u00E7\u0131k olsun" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Herkese a\u00E7\u0131k yorumlar reklamlar sayfas\u0131nda ve firma profilinde g\u00F6r\u00FCn\u00FCr." })] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setEditModalOpen(false), className: "px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors", children: "\u0130ptal" }), _jsxs("button", { type: "button", onClick: handleSaveEdit, className: "px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center", children: [_jsx(Save, { size: 18, className: "mr-2" }), "Kaydet"] })] })] })] }) }));
    };
    const renderNewReviewModal = () => {
        if (!newReviewModalOpen)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in", children: _jsxs("div", { className: "relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("button", { onClick: () => setNewReviewModalOpen(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200", title: "Kapat", "aria-label": "Kapat", children: _jsx(X, { size: 24 }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Yeni Yorum Ekle" }), _jsx("p", { className: "text-gray-600", children: "Sadece i\u015Flem yapt\u0131\u011F\u0131n\u0131z firmalar hakk\u0131nda yorum yapabilirsiniz." })] }), !newReviewFormData.companyId ? (_jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Firma Se\u00E7in" }), _jsx("div", { className: "grid grid-cols-1 gap-3", children: eligibleCompanies.map((company) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: company.logo }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: company.name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Son i\u015Flem: ", company.lastTransaction] })] })] }), _jsx("button", { className: "bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors", title: `'${company.name}' için yorum yap`, "aria-label": `'${company.name}' için yorum yap`, onClick: () => handleSelectCompanyForReview(company), children: "Yorum Yap" })] }) }, company.id))) })] }) })) : (_jsxs("form", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("span", { className: "text-2xl mr-3", children: newReviewFormData.companyLogo }), _jsx("span", { className: "text-lg font-medium text-gray-700", children: newReviewFormData.companyName })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Puan\u0131n\u0131z" }), _jsxs("div", { className: "flex items-center space-x-2", children: [[1, 2, 3, 4, 5].map((star) => (_jsxs("button", { type: "button", onClick: () => setNewReviewFormData(prev => ({ ...prev, rating: star })), className: "focus:outline-none", title: `${star} yıldız ver`, "aria-label": `${star} yıldız ver`, children: [_jsx(Star, { size: 32, className: `${star <= newReviewFormData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors` }), _jsxs("span", { className: "sr-only", children: [star, " y\u0131ld\u0131z"] })] }, star))), _jsxs("span", { className: "ml-3 text-lg font-medium text-gray-700", children: [newReviewFormData.rating, "/5"] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "comment", className: "block text-sm font-medium text-gray-700 mb-2", children: "Yorumunuz" }), _jsx("textarea", { id: "comment", name: "comment", value: newReviewFormData.comment, onChange: handleNewReviewInputChange, rows: 4, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", placeholder: "Deneyiminizi detayl\u0131 olarak payla\u015F\u0131n..." })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "isPublic", name: "isPublic", checked: newReviewFormData.isPublic, onChange: handleNewReviewInputChange, className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" }), _jsx("label", { htmlFor: "isPublic", className: "ml-2 text-sm text-gray-700", children: "Yorumum herkese a\u00E7\u0131k olsun" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Herkese a\u00E7\u0131k yorumlar reklamlar sayfas\u0131nda ve firma profilinde g\u00F6r\u00FCn\u00FCr." })] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setNewReviewModalOpen(false), className: "px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors", children: "\u0130ptal" }), _jsxs("button", { type: "button", onClick: handleSaveNewReview, className: "px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex items-center", disabled: !newReviewFormData.comment.trim(), children: [_jsx(Save, { size: 18, className: "mr-2" }), "Kaydet"] })] })] }))] }) }));
    };
    const filteredReviews = myReviewsState.filter((review) => {
        const matchesSearch = review.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || review.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4 md:mb-0", children: "Yorumlar\u0131m & Puanlar\u0131m" }), _jsxs("button", { onClick: handleNewReview, className: "bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl", title: "Yeni Yorum Ekle", "aria-label": "Yeni Yorum Ekle", children: [_jsx(Plus, { size: 20, className: "mr-2" }), _jsx("span", { children: "Yeni Yorum Ekle" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Toplam Yorum" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: myReviews.length })] }), _jsx(MessageCircle, { className: "text-blue-600", size: 24 })] }) }), _jsx("div", { className: "bg-green-50 rounded-lg p-4 border border-green-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Yay\u0131nlanan" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: myReviews.filter(r => r.status === 'published').length })] }), _jsx(Eye, { className: "text-green-600", size: 24 })] }) }), _jsx("div", { className: "bg-yellow-50 rounded-lg p-4 border border-yellow-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ortalama Puan" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1) })] }), _jsx(Star, { className: "text-yellow-600", size: 24 })] }) }), _jsx("div", { className: "bg-purple-50 rounded-lg p-4 border border-purple-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Toplam Be\u011Feni" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: myReviews.reduce((sum, r) => sum + r.helpful, 0) })] }), _jsx(ThumbsUp, { className: "text-purple-600", size: 24 })] }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-grow", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Yorum ara...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", "aria-label": "Yorum ara" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors", "aria-label": "Durum Filtrele", children: [_jsx("option", { value: "", children: "T\u00FCm Durumlar" }), _jsx("option", { value: "published", children: "Yay\u0131nlanan" }), _jsx("option", { value: "pending", children: "Moderasyonda" }), _jsx("option", { value: "draft", children: "Taslak" })] })] }), _jsx("div", { className: "space-y-4", children: filteredReviews.map((review) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: review.companyLogo }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: review.companyName }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx("div", { className: "flex items-center mr-3", children: [...Array(5)].map((_, i) => (_jsx(Star, { size: 16, className: `${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}` }, i))) }), _jsx("span", { className: "text-sm text-gray-500", children: review.date })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [getStatusBadge(review.status, review.statusLabel), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => handleEdit(review), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "D\u00FCzenle", "aria-label": "D\u00FCzenle", children: _jsx(Edit, { size: 16 }) }), _jsxs("button", { onClick: () => handleDeleteClick(review), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", "aria-label": "Sil", children: [_jsx(Trash2, { size: 16 }), _jsx("span", { className: "sr-only", children: "Sil" })] })] })] })] }), _jsx("p", { className: "text-gray-700 mb-4", children: review.comment }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Eye, { size: 14, className: "mr-1" }), _jsxs("span", { children: [review.views, " g\u00F6r\u00FCnt\u00FClenme"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(ThumbsUp, { size: 14, className: "mr-1" }), _jsxs("span", { children: [review.helpful, " be\u011Feni"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Building, { size: 14, className: "mr-1" }), _jsx("span", { children: review.isPublic ? 'Herkese açık' : 'Özel' })] })] }), review.visibleOn.length > 0 && (_jsxs("div", { className: "text-xs text-gray-500", children: [_jsx("span", { className: "font-medium", children: "G\u00F6r\u00FCn\u00FCr:" }), " ", review.visibleOn.join(', ')] }))] })] }, review.id))) }), filteredReviews.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(MessageCircle, { size: 48, className: "text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Hen\u00FCz yorum yapmam\u0131\u015Fs\u0131n\u0131z" }), _jsx("p", { className: "text-gray-600 mb-6", children: "\u0130\u015Flem yapt\u0131\u011F\u0131n\u0131z firmalar hakk\u0131nda yorum yaparak di\u011Fer kullan\u0131c\u0131lara yard\u0131mc\u0131 olun." }), _jsx("button", { onClick: handleNewReview, className: "bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors", children: "\u0130lk Yorumunuzu Yap\u0131n" })] }))] }), renderEditModal(), renderNewReviewModal(), deleteConfirmOpen && (_jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-8 max-w-sm w-full shadow-lg", children: [_jsx("h3", { className: "text-lg font-bold mb-4 text-gray-900", children: "Yorumu Sil" }), _jsx("p", { className: "mb-6 text-gray-700", children: "Bu yorumu silmek istedi\u011Finize emin misiniz?" }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: handleCancelDelete, className: "px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors", children: "\u0130ptal" }), _jsx("button", { onClick: handleConfirmDelete, className: "px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors", children: "Sil" })] })] }) }))] }));
};
export default MyReviewsSection;
