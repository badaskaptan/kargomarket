import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { LayoutDashboard, FileText, Plus, Truck, Ship, Tag, MessageCircle, Megaphone, Star, User, Settings, LogOut, ChevronDown, Package, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import clsx from 'clsx';
const Sidebar = ({ isOpen, onClose }) => {
    const { activeSection, setActiveSection } = useDashboard();
    const [newListingOpen, setNewListingOpen] = React.useState(false);
    const menuItems = [
        {
            id: 'overview',
            label: 'Genel Bakış',
            icon: LayoutDashboard,
            active: activeSection === 'overview'
        },
        {
            id: 'my-listings',
            label: 'İlanlarım',
            icon: FileText,
            active: activeSection === 'my-listings'
        },
        {
            id: 'new-listing',
            label: 'Yeni İlan Oluştur',
            icon: Plus,
            hasSubmenu: true,
            submenu: [
                {
                    id: 'create-load-listing',
                    label: 'Yük İlanı Oluştur',
                    icon: Package,
                    active: activeSection === 'create-load-listing'
                },
                {
                    id: 'create-shipment-request',
                    label: 'Nakliye Talebi Oluştur',
                    icon: Truck,
                    active: activeSection === 'create-shipment-request'
                },
                {
                    id: 'create-transport-service',
                    label: 'Nakliye İlanı Oluştur',
                    icon: Ship,
                    active: activeSection === 'create-transport-service'
                }
            ]
        },
        {
            id: 'my-offers',
            label: 'Tekliflerim',
            icon: Tag,
            active: activeSection === 'my-offers'
        },
        {
            id: 'messages',
            label: 'Mesajlar',
            icon: MessageCircle,
            badge: 2,
            active: activeSection === 'messages'
        },
        {
            id: 'my-ads',
            label: 'Reklamlarım',
            icon: Megaphone,
            active: activeSection === 'my-ads'
        },
        {
            id: 'my-reviews',
            label: 'Yorumlarım & Puanlarım',
            icon: Star,
            active: activeSection === 'my-reviews'
        }
    ];
    const bottomMenuItems = [
        {
            id: 'profile',
            label: 'Profilim',
            icon: User,
            active: activeSection === 'profile'
        },
        {
            id: 'settings',
            label: 'Ayarlar',
            icon: Settings,
            active: activeSection === 'settings'
        },
        {
            id: 'logout',
            label: 'Çıkış Yap',
            icon: LogOut,
            active: false
        }
    ];
    const handleMenuClick = (id) => {
        if (id === 'new-listing') {
            setNewListingOpen(!newListingOpen);
        }
        else {
            setActiveSection(id);
            onClose();
        }
    };
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden", onClick: onClose })), _jsxs("aside", { className: clsx("bg-gray-800 text-white w-64 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out custom-scrollbar", "fixed md:sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-40", isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"), children: [_jsx("div", { className: "md:hidden flex justify-end p-4", children: _jsx("button", { onClick: onClose, className: "text-gray-300 hover:text-white", title: "Kapat", "aria-label": "Men\u00FCy\u00FC kapat", children: _jsx(X, { size: 24 }) }) }), _jsx("nav", { className: "flex-1 p-6", children: _jsx("ul", { className: "space-y-2", children: menuItems.map((item) => (_jsxs("li", { children: [_jsxs("button", { onClick: () => handleMenuClick(item.id), className: clsx("flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200", item.active
                                            ? "bg-primary-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"), children: [_jsxs("div", { className: "flex items-center", children: [_jsx(item.icon, { size: 20, className: "mr-3" }), _jsx("span", { className: "font-medium", children: item.label })] }), _jsxs("div", { className: "flex items-center", children: [item.badge && (_jsx("span", { className: "bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2", children: item.badge })), item.hasSubmenu && (_jsx(ChevronDown, { size: 16, className: clsx("transition-transform duration-200", newListingOpen ? "rotate-180" : "") }))] })] }), item.hasSubmenu && (_jsx("ul", { className: clsx("ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300", newListingOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"), children: item.submenu?.map((subItem) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleMenuClick(subItem.id), className: clsx("flex items-center w-full p-2 rounded-lg transition-all duration-200", subItem.active
                                                    ? "bg-primary-600 text-white"
                                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"), children: [_jsx(subItem.icon, { size: 16, className: "mr-2" }), _jsx("span", { className: "text-sm", children: subItem.label })] }) }, subItem.id))) }))] }, item.id))) }) }), _jsx("div", { className: "border-t border-gray-700 p-6", children: _jsx("ul", { className: "space-y-2", children: bottomMenuItems.map((item) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleMenuClick(item.id), className: clsx("flex items-center w-full p-3 rounded-lg transition-all duration-200", item.active
                                        ? "bg-primary-600 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"), children: [_jsx(item.icon, { size: 20, className: "mr-3" }), _jsx("span", { className: "font-medium", children: item.label })] }) }, item.id))) }) })] })] }));
};
export default Sidebar;
