import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Menu, X, User, LayoutDashboard, ChevronDown, Settings, LogOut } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../context/SupabaseAuthContext';
const PublicHeader = ({ activePage, setActivePage, onShowDashboard }) => {
    const { user, profile, loading, login, register, googleLogin, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [userRole, setUserRole] = useState(profile?.user_type || 'buyer_seller');
    const menuItems = [
        { id: 'home', label: 'Ana Sayfa' },
        { id: 'listings', label: 'İlanlar' },
        { id: 'ads', label: 'Reklamlar' },
        { id: 'reviews', label: 'Yorumlar' },
        { id: 'ad-panel', label: 'Reklam Paneli' },
        { id: 'how-it-works', label: 'Nasıl Çalışır' },
        { id: 'about', label: 'Hakkımızda' }
    ];
    const handleRoleChange = (newRole) => {
        setUserRole(newRole);
        setUserMenuOpen(false);
        console.log('Rol değiştirildi:', newRole);
    };
    const handleDashboardClick = () => {
        console.log('Dashboard button clicked!');
        setUserMenuOpen(false);
        onShowDashboard();
    };
    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Login error:', error);
            // Hata AuthModal tarafından yakalanıp gösterilecek
            throw error;
        }
    };
    const handleRegister = async (fullName, email, password) => {
        try {
            await register(fullName, email, password);
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Register error:', error);
            // Hata AuthModal tarafından yakalanıp gösterilecek
            throw error;
        }
    };
    const handleGoogleLogin = async () => {
        try {
            await googleLogin();
            setAuthModalOpen(false);
        }
        catch (error) {
            console.error('Google login error:', error);
            // Hata AuthModal tarafından yakalanıp gösterilecek
            throw error;
        }
    };
    const handleLogout = () => {
        setUserMenuOpen(false);
        logout();
    };
    return (_jsxs("header", { className: "bg-white shadow-lg sticky top-0 z-50", children: [_jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsx("div", { className: "font-pacifico text-primary-600 text-2xl font-bold cursor-pointer hover:text-primary-700 transition-all duration-300 transform hover:scale-110", onClick: () => setActivePage('home'), children: "Kargo Market" }), _jsx("nav", { className: "hidden md:flex space-x-8", children: menuItems.map((item) => (_jsx("button", { onClick: () => setActivePage(item.id), className: `px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-110 ${activePage === item.id
                                        ? 'text-primary-600 bg-primary-50 shadow-md hover:shadow-lg'
                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`, children: item.label }, item.id))) }), _jsx("div", { className: "hidden md:flex items-center space-x-4", children: !user ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setAuthModalOpen(true), className: "text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium transform hover:scale-110", disabled: loading, children: "Giri\u015F Yap" }), _jsx("button", { onClick: () => setAuthModalOpen(true), className: "bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-lg hover:shadow-xl", disabled: loading, children: "\u00DCye Ol" })] })) : (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setUserMenuOpen(!userMenuOpen), className: "flex items-center space-x-3 bg-gray-50 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-primary-200", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg", children: _jsx(User, { size: 18, className: "text-white" }) }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "text-sm font-semibold text-gray-900", children: profile?.full_name || 'Kullanıcı' }), _jsx("div", { className: "text-xs text-gray-500 capitalize", children: profile?.user_type === 'buyer_seller' ? 'Alıcı/Satıcı' : profile?.user_type === 'carrier' ? 'Nakliyeci' : profile?.user_type === 'both' ? 'Her İkisi' : 'Kullanıcı' })] }), _jsx(ChevronDown, { size: 16, className: `text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}` })] }), userMenuOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-100", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg", children: _jsx(User, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: profile?.full_name || 'Kullanıcı' }), _jsx("div", { className: "text-sm text-gray-500", children: user?.email })] })] }) }), _jsxs("div", { className: "px-4 py-3 border-b border-gray-100", children: [_jsx("div", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider mb-2", children: "Aktif Rol" }), _jsxs("div", { className: "space-y-1", children: [_jsx("button", { onClick: () => handleRoleChange('buyer_seller'), className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'buyer_seller'
                                                                        ? 'bg-primary-100 text-primary-800 font-medium'
                                                                        : 'text-gray-700 hover:bg-gray-100'}`, children: "\uD83D\uDED2 Al\u0131c\u0131/Sat\u0131c\u0131" }), _jsx("button", { onClick: () => handleRoleChange('carrier'), className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'carrier'
                                                                        ? 'bg-primary-100 text-primary-800 font-medium'
                                                                        : 'text-gray-700 hover:bg-gray-100'}`, children: "\uD83D\uDE9B Nakliyeci" })] })] }), _jsxs("div", { className: "py-2", children: [_jsxs("button", { onClick: handleDashboardClick, className: "w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center", children: [_jsx(LayoutDashboard, { size: 16, className: "mr-3 text-gray-400" }), "Dashboard"] }), _jsxs("button", { onClick: () => {
                                                                setUserMenuOpen(false);
                                                                // Profil sayfasına yönlendirme
                                                            }, className: "w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center", children: [_jsx(Settings, { size: 16, className: "mr-3 text-gray-400" }), "Profil Ayarlar\u0131"] })] }), _jsx("div", { className: "border-t border-gray-100 pt-2", children: _jsxs("button", { onClick: handleLogout, className: "w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center", children: [_jsx(LogOut, { size: 16, className: "mr-3 text-red-500" }), "\u00C7\u0131k\u0131\u015F Yap"] }) })] })), userMenuOpen && (_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setUserMenuOpen(false) }))] })) }), _jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "md:hidden text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-125", children: mobileMenuOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), mobileMenuOpen && (_jsx("div", { className: "md:hidden py-4 border-t border-gray-200 animate-fade-in", children: _jsxs("nav", { className: "flex flex-col space-y-2", children: [menuItems.map((item) => (_jsx("button", { onClick: () => {
                                        setActivePage(item.id);
                                        setMobileMenuOpen(false);
                                    }, className: `text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activePage === item.id
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`, children: item.label }, item.id))), _jsx("div", { className: "pt-4 border-t border-gray-200 space-y-2", children: !user ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                                    setAuthModalOpen(true);
                                                    setMobileMenuOpen(false);
                                                }, className: "w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-105", children: "Giri\u015F Yap" }), _jsx("button", { onClick: () => {
                                                    setAuthModalOpen(true);
                                                    setMobileMenuOpen(false);
                                                }, className: "w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-105", children: "\u00DCye Ol" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-4 py-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center", children: _jsx(User, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: profile?.full_name || 'Kullanıcı' }), _jsx("div", { className: "text-sm text-gray-500 capitalize", children: profile?.user_type === 'buyer_seller' ? 'Alıcı/Satıcı' : profile?.user_type === 'carrier' ? 'Nakliyeci' : profile?.user_type === 'both' ? 'Her İkisi' : 'Kullanıcı' })] })] }), _jsxs("div", { className: "space-y-2 mb-3", children: [_jsx("div", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Rol De\u011Fi\u015Ftir" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleRoleChange('buyer_seller'), className: `flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'buyer_seller'
                                                                            ? 'bg-primary-600 text-white'
                                                                            : 'bg-white text-gray-700 border border-gray-300'}`, children: "\uD83D\uDED2 Al\u0131c\u0131/Sat\u0131c\u0131" }), _jsx("button", { onClick: () => handleRoleChange('carrier'), className: `flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'carrier'
                                                                            ? 'bg-primary-600 text-white'
                                                                            : 'bg-white text-gray-700 border border-gray-300'}`, children: "\uD83D\uDE9B Nakliyeci" })] })] })] }), _jsxs("button", { onClick: () => {
                                                    handleDashboardClick();
                                                    setMobileMenuOpen(false);
                                                }, className: "w-full flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 bg-gray-50 rounded-lg transform hover:scale-105", children: [_jsx(LayoutDashboard, { size: 18, className: "mr-2" }), "Dashboard"] }), _jsxs("button", { onClick: () => {
                                                    setMobileMenuOpen(false);
                                                    // Profil ayarlarına yönlendirme
                                                }, className: "w-full flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 bg-gray-50 rounded-lg transform hover:scale-105", children: [_jsx(Settings, { size: 18, className: "mr-2" }), "Profil Ayarlar\u0131"] }), _jsxs("button", { onClick: () => {
                                                    handleLogout();
                                                    setMobileMenuOpen(false);
                                                }, className: "w-full flex items-center px-4 py-3 text-red-600 hover:text-red-700 transition-all duration-300 bg-red-50 rounded-lg transform hover:scale-105", children: [_jsx(LogOut, { size: 18, className: "mr-2" }), "\u00C7\u0131k\u0131\u015F Yap"] })] })) })] }) }))] }), _jsx(AuthModal, { isOpen: authModalOpen, onClose: () => setAuthModalOpen(false), onLogin: handleLogin, onRegister: handleRegister, onGoogleLogin: handleGoogleLogin })] }));
};
export default PublicHeader;
