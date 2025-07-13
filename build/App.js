import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext';
function AppContent() {
    const { user, profile, loading } = useAuth();
    const [showDashboard, setShowDashboard] = useState(false);
    // Kullanıcı giriş yaptığında otomatik Dashboard'ı aç
    useEffect(() => {
        if (user && profile && !loading) {
            console.log('🚀 User logged in, opening Dashboard automatically');
            setShowDashboard(true);
        }
    }, [user, profile, loading]);
    // Debug logs (production'da kaldırılabilir)
    if (import.meta.env.DEV) {
        console.log('App Debug:', JSON.stringify({ user: !!user, profile: !!profile, showDashboard, loading }));
        console.log('🎯 Dashboard Decision:', JSON.stringify({
            showDashboard,
            hasUser: !!user,
            hasProfile: !!profile
        }));
    }
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" }) }));
    }
    if (showDashboard && user) {
        return (_jsx(DashboardProvider, { children: _jsx(DashboardLayout, { onBackToPublic: () => setShowDashboard(false) }) }));
    }
    return (_jsx(PublicLayout, { onShowDashboard: () => setShowDashboard(true) }));
}
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
export default App;
