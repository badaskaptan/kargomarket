import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import MainContent from '../MainContent';
import BetaBanner from '../common/BetaBanner';
const DashboardLayout = ({ onBackToPublic }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 font-inter", children: [_jsx(BetaBanner, {}), _jsx(Header, { onToggleSidebar: () => setSidebarOpen(!sidebarOpen), onBackToPublic: onBackToPublic }), _jsxs("div", { className: "flex", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsx(MainContent, {})] })] }));
};
export default DashboardLayout;
