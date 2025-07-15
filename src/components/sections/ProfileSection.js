import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Edit, Lock, User, Mail, Phone, Calendar, Building, MapPin, Star, X } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';
const ProfileSection = () => {
    const { profile, updateProfile } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [offerNotifications, setOfferNotifications] = useState(true);
    const [buyerRole, setBuyerRole] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        company_name: profile?.company_name || '',
        tax_office: profile?.tax_office || '',
        tax_number: profile?.tax_number || '',
        address: profile?.address || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);
    // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD-MM-YYYY)
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        // Eğer ISO tarih formatındaysa (YYYY-MM-DDTHH:mm:ss), sadece tarih kısmını al
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return `${day}-${month}-${year}`;
        }
        // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
        const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateString.match(datePattern);
        if (match) {
            const [, year, month, day] = match;
            return `${day}-${month}-${year}`;
        }
        // Fallback: Date objesini kullan
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        catch {
            return dateString;
        }
    };
    React.useEffect(() => {
        setForm({
            full_name: profile?.full_name || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            company_name: profile?.company_name || '',
            tax_office: profile?.tax_office || '',
            tax_number: profile?.tax_number || '',
            address: profile?.address || '',
        });
    }, [profile, editOpen]);
    const handleFormChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await updateProfile(form);
            setEditOpen(false);
        }
        catch (err) {
            let msg = 'Profil güncellenemedi.';
            if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
                msg = err.message;
            }
            setError(msg);
        }
        finally {
            setSaving(false);
        }
    };
    const handlePasswordChange = (e) => {
        setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);
        if (!passwordForm.new || passwordForm.new.length < 8) {
            setPasswordError('Yeni şifre en az 8 karakter olmalı.');
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordError('Yeni şifreler eşleşmiyor.');
            return;
        }
        setPasswordLoading(true);
        // Supabase password update
        const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
        if (error) {
            setPasswordError(error.message);
        }
        else {
            setPasswordSuccess('Şifre başarıyla değiştirildi.');
            setPasswordForm({ current: '', new: '', confirm: '' });
            setTimeout(() => setPasswordOpen(false), 1500);
        }
        setPasswordLoading(false);
    };
    const stats = [
        {
            label: 'Toplam İlan',
            value: profile?.total_listings ?? '-',
            icon: Building,
            color: 'blue'
        },
        {
            label: 'Toplam Teklif',
            value: profile?.total_offers ?? '-',
            icon: Star,
            color: 'green'
        },
        {
            label: 'Tamamlanan',
            value: profile?.total_completed_transactions ?? '-',
            icon: Calendar,
            color: 'purple'
        },
        {
            label: 'Ortalama Puan',
            value: profile?.rating !== undefined && profile?.rating !== null ? profile.rating.toFixed(1) : '-',
            icon: Star,
            color: 'amber'
        }
    ];
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            amber: 'bg-amber-100 text-amber-600'
        };
        return colors[color] || colors.blue;
    };
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [passwordOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in", children: [_jsx("button", { className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl", "aria-label": "Kapat", onClick: () => setPasswordOpen(false), children: _jsx(X, {}) }), _jsx("h2", { className: "text-xl font-bold mb-6 text-gray-900", children: "\u015Eifre De\u011Fi\u015Ftir" }), _jsxs("form", { onSubmit: handlePasswordSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Mevcut \u015Eifre" }), _jsx("input", { name: "current", type: "password", value: passwordForm.current, onChange: handlePasswordChange, placeholder: "Mevcut \u015Fifreniz", title: "Mevcut \u015Eifre", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500", autoComplete: "current-password", disabled: true }), _jsx("span", { className: "text-xs text-gray-400", children: "(Supabase ile mevcut \u015Fifre do\u011Frulamas\u0131 zorunlu de\u011Fildir.)" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Yeni \u015Eifre" }), _jsx("input", { name: "new", type: "password", value: passwordForm.new, onChange: handlePasswordChange, placeholder: "Yeni \u015Fifreniz", title: "Yeni \u015Eifre", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500", autoComplete: "new-password", minLength: 8, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Yeni \u015Eifre (Tekrar)" }), _jsx("input", { name: "confirm", type: "password", value: passwordForm.confirm, onChange: handlePasswordChange, placeholder: "Yeni \u015Fifre tekrar", title: "Yeni \u015Eifre Tekrar", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500", autoComplete: "new-password", minLength: 8, required: true })] }), passwordError && _jsx("div", { className: "text-red-600 text-sm", children: passwordError }), passwordSuccess && _jsx("div", { className: "text-green-600 text-sm", children: passwordSuccess }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx("button", { type: "button", className: "px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50", onClick: () => setPasswordOpen(false), disabled: passwordLoading, children: "Vazge\u00E7" }), _jsx("button", { type: "submit", className: "px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60", disabled: passwordLoading, children: passwordLoading ? 'Kaydediliyor...' : 'Kaydet' })] })] })] }) })), editOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in", children: [_jsx("button", { className: "absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl", "aria-label": "Kapat", onClick: () => setEditOpen(false), children: _jsx(X, {}) }), _jsx("h2", { className: "text-xl font-bold mb-6 text-gray-900", children: "Profili D\u00FCzenle" }), _jsxs("form", { onSubmit: handleProfileSave, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ad Soyad" }), _jsx("input", { name: "full_name", type: "text", value: form.full_name, onChange: handleFormChange, required: true, placeholder: "Ad Soyad", title: "Ad Soyad", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "E-posta" }), _jsx("input", { name: "email", type: "email", value: form.email, onChange: handleFormChange, required: true, placeholder: "E-posta", title: "E-posta", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500", disabled: true }), _jsx("span", { className: "text-xs text-gray-400", children: "E-posta de\u011Fi\u015Ftirilemez." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefon" }), _jsx("input", { name: "phone", type: "tel", value: form.phone, onChange: handleFormChange, placeholder: "Telefon", title: "Telefon", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Firma Ad\u0131" }), _jsx("input", { name: "company_name", type: "text", value: form.company_name, onChange: handleFormChange, placeholder: "Firma Ad\u0131", title: "Firma Ad\u0131", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vergi Dairesi" }), _jsx("input", { name: "tax_office", type: "text", value: form.tax_office, onChange: handleFormChange, placeholder: "Vergi Dairesi", title: "Vergi Dairesi", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vergi No" }), _jsx("input", { name: "tax_number", type: "text", value: form.tax_number, onChange: handleFormChange, placeholder: "Vergi No", title: "Vergi No", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Adres" }), _jsx("input", { name: "address", type: "text", value: form.address, onChange: handleFormChange, placeholder: "Adres", title: "Adres", className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500" })] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx("button", { type: "button", className: "px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50", onClick: () => setEditOpen(false), disabled: saving, children: "Vazge\u00E7" }), _jsx("button", { type: "submit", className: "px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60", disabled: saving, children: saving ? 'Kaydediliyor...' : 'Kaydet' })] })] })] }) })), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Profilim" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "md:col-span-1", children: _jsxs("div", { className: "bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200", children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg", children: _jsx(User, { size: 48, className: "text-white" }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-1", children: profile?.full_name || 'Kullanıcı' }), _jsx("p", { className: "text-gray-600 mb-4", children: profile?.email || 'Email yükleniyor...' }), _jsxs("div", { className: "w-full space-y-3", children: [_jsxs("button", { className: "w-full bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl", onClick: () => setEditOpen(true), "aria-label": "Profili D\u00FCzenle", children: [_jsx(Edit, { size: 16, className: "mr-2" }), _jsx("span", { children: "Profili D\u00FCzenle" })] }), _jsxs("button", { className: "w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-gray-50 transition-colors", onClick: () => setPasswordOpen(true), "aria-label": "\u015Eifre De\u011Fi\u015Ftir", children: [_jsx(Lock, { size: 16, className: "mr-2" }), _jsx("span", { children: "\u015Eifre De\u011Fi\u015Ftir" })] })] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-primary-200", children: [_jsx("h4", { className: "font-medium mb-3 text-gray-900", children: "Roller" }), _jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", id: "role-buyer-label", children: "Al\u0131c\u0131/Sat\u0131c\u0131" }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", htmlFor: "role-buyer-checkbox", children: [_jsx("input", { type: "checkbox", id: "role-buyer-checkbox", "aria-labelledby": "role-buyer-label", checked: buyerRole, onChange: (e) => setBuyerRole(e.target.checked), className: "sr-only peer", title: "Al\u0131c\u0131/Sat\u0131c\u0131 rol\u00FCn\u00FC se\u00E7" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" })] })] }) })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-primary-200", children: [_jsx("h4", { className: "font-medium mb-3 text-gray-900", children: "Bildirim Tercihleri" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", id: "notif-email-label", children: "E-posta Bildirimleri" }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", htmlFor: "notif-email-checkbox", children: [_jsx("input", { type: "checkbox", id: "notif-email-checkbox", "aria-labelledby": "notif-email-label", checked: emailNotifications, onChange: (e) => setEmailNotifications(e.target.checked), className: "sr-only peer", title: "E-posta bildirimlerini a\u00E7/kapat" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", id: "notif-sms-label", children: "SMS Bildirimleri" }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", htmlFor: "notif-sms-checkbox", children: [_jsx("input", { type: "checkbox", id: "notif-sms-checkbox", "aria-labelledby": "notif-sms-label", checked: smsNotifications, onChange: (e) => setSmsNotifications(e.target.checked), className: "sr-only peer", title: "SMS bildirimlerini a\u00E7/kapat" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700", id: "notif-offer-label", children: "Yeni Teklif Bildirimleri" }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", htmlFor: "notif-offer-checkbox", children: [_jsx("input", { type: "checkbox", id: "notif-offer-checkbox", "aria-labelledby": "notif-offer-label", checked: offerNotifications, onChange: (e) => setOfferNotifications(e.target.checked), className: "sr-only peer", title: "Yeni teklif bildirimlerini a\u00E7/kapat" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" })] })] })] })] })] }) }), _jsxs("div", { className: "md:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(User, { className: "mr-2 text-primary-600", size: 20 }), "Ki\u015Fisel Bilgiler"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(User, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Ad Soyad" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.full_name || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "E-posta" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.email || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Telefon" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.phone || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "\u00DCyelik Tarihi" }), _jsx("p", { className: "font-medium text-gray-900", children: formatDate(profile?.created_at || null) })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Building, { className: "mr-2 text-primary-600", size: 20 }), "Firma Bilgileri"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Building, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Firma Ad\u0131" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.company_name || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Building, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Vergi Dairesi" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.tax_office || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Building, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Vergi No" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.tax_number || '-' })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "mr-3 text-gray-400", size: 16 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Adres" }), _jsx("p", { className: "font-medium text-gray-900", children: profile?.address || '-' })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-xl p-6 border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Star, { className: "mr-2 text-primary-600", size: 20 }), "Hesap \u0130statistikleri"] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200 card-hover", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: stat.label }), _jsx("div", { className: `w-8 h-8 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center`, children: _jsx(stat.icon, { size: 16 }) })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stat.value })] }, index))) })] })] })] })] })] }));
};
export default ProfileSection;
