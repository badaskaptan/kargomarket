import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState } from 'react';
const DashboardContext = createContext(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
export const DashboardProvider = ({ children }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [userRole, setUserRole] = useState('alici-satici');
    const [notifications, setNotifications] = useState(3);
    return (_jsx(DashboardContext.Provider, { value: {
            activeSection,
            setActiveSection,
            userRole,
            setUserRole,
            notifications,
            setNotifications,
        }, children: children }));
};
