import { useState, useEffect } from 'react';
import PublicLayout from './components/layout/PublicLayout.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import { DashboardProvider } from './context/DashboardContext.tsx';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext.tsx';
import { initializeStorageBuckets } from './lib/storage-setup';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  // Storage bucket'larını kontrol et
  useEffect(() => {
    const checkStorage = async () => {
      const result = await initializeStorageBuckets();
      
      if (!result.success && result.missingBuckets.length > 0) {
        console.warn('⚠️ Storage bucket kurulum rehberi için STORAGE_SETUP_GUIDE.md dosyasını inceleyin');
        console.warn('📋 Eksik bucket\'lar:', result.missingBuckets.join(', '));
      }
    };
    
    checkStorage();
  }, []);

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
    </AuthProvider>
  );
}

export default App;