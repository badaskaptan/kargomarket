import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, Fragment } from 'react';
import { Plus, Search, Edit, Pause, Play, Trash2, Eye, MapPin, Package, Calendar, Loader2, FileText, Image as ImageIcon, ExternalLink, X, BarChart3 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import EditModalLoadListing from './EditModalLoadListing';
import EditModalShipmentRequest from './EditModalShipmentRequest';
import TransportServiceDetailSection from './TransportServiceDetailSection';
import EditTransportServiceModal from './EditTransportServiceModal';
const MyListingsSection = () => {
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [editListing, setEditListing] = useState(null);
    const [relatedLoadListing, setRelatedLoadListing] = useState(null);
    useEffect(() => {
        const loadUserListings = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                const userListings = await ListingService.getUserListings(user.id);
                setListings(userListings);
            }
            catch {
                setListings([]);
            }
            finally {
                setLoading(false);
            }
        };
        loadUserListings();
    }, [user]);
    const filteredListings = listings.filter(listing => listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.load_type?.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleTogglePause = async (listing) => {
        try {
            const newStatus = listing.status === 'active' ? 'paused' : 'active';
            await ListingService.updateListing(listing.id, { status: newStatus });
            setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
        }
        catch { }
    };
    const handleDeleteListing = async (listing) => {
        if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?'))
            return;
        try {
            await ListingService.deleteListing(listing.id);
            setListings(prev => prev.filter(l => l.id !== listing.id));
        }
        catch { }
    };
    const handleUpdateListing = (updatedListing) => {
        setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
    };
    const fetchRelatedLoadListing = async (relatedLoadListingId) => {
        try {
            const relatedListing = await ListingService.getListingById(relatedLoadListingId);
            setRelatedLoadListing(relatedListing);
        }
        catch {
            setRelatedLoadListing(null);
        }
    };
    useEffect(() => {
        if (selectedListing?.related_load_listing_id) {
            fetchRelatedLoadListing(selectedListing.related_load_listing_id);
        }
        else {
            setRelatedLoadListing(null);
        }
    }, [selectedListing?.related_load_listing_id]);
    const getListingTypeBadge = (type) => {
        const config = {
            'load_listing': { label: 'Yük İlanı', color: 'bg-blue-100 text-blue-800' },
            'shipment_request': { label: 'Nakliye Talebi', color: 'bg-green-100 text-green-800' },
            'transport_service': { label: 'Taşıma Hizmeti', color: 'bg-purple-100 text-purple-800' }
        };
        const { label, color } = config[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
        return React.createElement('span', { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}` }, label);
    };
    const getStatusBadge = (status) => {
        const config = {
            'active': { label: 'Aktif', color: 'bg-green-100 text-green-800' },
            'paused': { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-800' },
            'completed': { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
            'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
            'expired': { label: 'Süresi Doldu', color: 'bg-red-100 text-red-800' }
        };
        const { label, color } = config[status] || { label: 'Taslak', color: 'bg-gray-100 text-gray-800' };
        return React.createElement('span', { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}` }, label);
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u0130lanlar y\u00FCkleniyor..." })] }));
    }
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Oturumunuz Bulunamad\u0131" }), _jsx("p", { className: "text-gray-600", children: "L\u00FCtfen giri\u015F yap\u0131n\u0131z." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u0130lanlar\u0131m" }), _jsxs("p", { className: "mt-1 text-sm text-gray-600", children: ["Toplam ", listings.length, " ilan"] })] }), _jsxs("button", { onClick: () => setActiveSection('create-load-listing'), className: "inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Yeni \u0130lan"] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "\u0130lan ara...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500" })] }), filteredListings.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }), searchTerm ? (_jsxs(Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Arama sonucu bulunamad\u0131" }), _jsxs("p", { className: "text-gray-600", children: ["\"", searchTerm, "\" i\u00E7in hi\u00E7bir ilan bulunamad\u0131."] })] })) : (_jsxs(Fragment, { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: listings.length === 0 ? 'Henüz hiç ilanınız yok' : 'İlan bulunamadı' }), _jsx("p", { className: "text-gray-600 mb-2", children: listings.length === 0 ? 'İlk ilanınızı oluşturarak başlayın!' : `Toplam ${listings.length} ilanınız var ama filtreye uygun olan bulunamadı.` }), _jsxs("div", { className: "text-xs text-gray-400 mb-6", children: ["Debug: user_id=", user?.id, ", total_listings=", listings.length, ", loading=", loading.toString()] }), _jsxs("button", { onClick: () => setActiveSection('create-load-listing'), className: "inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "\u0130lan Olu\u015Ftur"] })] }))] })) : (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130lan Bilgisi" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Rota" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tarih" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Durum" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0130\u015Flemler" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredListings.map((listing) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: listing.title }), _jsx("div", { className: "text-sm text-gray-500", children: listing.load_type })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-900", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 text-gray-400 mr-1" }), listing.origin] }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx(MapPin, { className: "h-4 w-4 text-gray-400 mr-1" }), listing.destination] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400 mr-1" }), _jsxs("div", { children: [_jsxs("div", { children: ["Y\u00FCkleme: ", formatDate(listing.loading_date)] }), _jsxs("div", { children: ["Teslimat: ", formatDate(listing.delivery_date)] })] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(listing.status) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900", title: "\u0130lan Detay\u0131n\u0131 G\u00F6r\u00FCnt\u00FCle", "aria-label": "\u0130lan Detay\u0131n\u0131 G\u00F6r\u00FCnt\u00FCle", onClick: () => setSelectedListing(listing), children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx("button", { className: "text-indigo-600 hover:text-indigo-900", title: "\u0130lan\u0131 D\u00FCzenle", "aria-label": "\u0130lan\u0131 D\u00FCzenle", onClick: () => setEditListing(listing), children: _jsx(Edit, { className: "h-4 w-4" }) }), listing.status === 'active' ? (_jsx("button", { className: "text-orange-600 hover:text-orange-900", title: "\u0130lan\u0131 Duraklat", "aria-label": "\u0130lan\u0131 Duraklat", onClick: () => handleTogglePause(listing), children: _jsx(Pause, { className: "h-4 w-4" }) })) : (_jsx("button", { className: "text-green-600 hover:text-green-900", title: "\u0130lan\u0131 Etkinle\u015Ftir", "aria-label": "\u0130lan\u0131 Etkinle\u015Ftir", onClick: () => handleTogglePause(listing), children: _jsx(Play, { className: "h-4 w-4" }) })), _jsx("button", { className: "text-red-600 hover:text-red-900", title: "\u0130lan\u0131 Sil", "aria-label": "\u0130lan\u0131 Sil", onClick: () => handleDeleteListing(listing), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, listing.id))) })] }) }) })), selectedListing && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-100 relative", children: [_jsx("button", { onClick: () => setSelectedListing(null), className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl", title: "Modal\u0131 Kapat", "aria-label": "Modal\u0131 Kapat", children: _jsx(X, { className: "h-6 w-6" }) }), selectedListing.listing_type === 'transport_service' && (_jsx(TransportServiceDetailSection, { listing: prepareTransportServiceDetail(selectedListing) }))] }) })), editListing && editListing.listing_type === 'load_listing' && (_jsx(EditModalLoadListing, { listing: editListing, isOpen: true, onClose: () => setEditListing(null), onSave: handleUpdateListing })), editListing && editListing.listing_type === 'shipment_request' && (_jsx(EditModalShipmentRequest, { listing: editListing, isOpen: true, onClose: () => setEditListing(null), onSave: handleUpdateListing })), editListing && editListing.listing_type === 'transport_service' && (_jsx(EditTransportServiceModal, { listing: editListing, open: true, onClose: () => setEditListing(null) }))] }));
};
function prepareTransportServiceDetail(listing) {
    return {
        listing_number: listing.listing_number || '',
        title: listing.title || '',
        description: listing.description || '',
        origin: listing.origin || '',
        destination: listing.destination || '',
        transport_mode: listing.transport_mode || '',
        vehicle_types: listing.vehicle_types || [],
        capacity: ('capacity' in listing && typeof listing.capacity === 'string' ? listing.capacity : ''),
        available_from_date: ('available_from_date' in listing && typeof listing.available_from_date === 'string' ? listing.available_from_date : ''),
        status: listing.status || '',
        metadata: ('metadata' in listing && typeof listing.metadata === 'object' && listing.metadata !== null
            ? listing.metadata
            : {
                contact_info: {},
                transport_details: {},
                required_documents: [],
            }),
    };
}
export default MyListingsSection;
