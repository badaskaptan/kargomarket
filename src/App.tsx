import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showDashboard && user) {
    return (
      <DashboardProvider>
        <DashboardLayout onBackToPublic={() => setShowDashboard(false)} />
      </DashboardProvider>
    );
  }

  return (
    <PublicLayout 
      onShowDashboard={() => setShowDashboard(true)}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;