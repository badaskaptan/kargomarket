import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext';
import debugAuth from './utils/debugAuth';

function AppContent() {
  const { loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [publicLayoutKey, setPublicLayoutKey] = useState(0);

  // Debug auth bilgileri
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 Running Auth Debug...');
      debugAuth().then(authInfo => {
        console.log('🎯 Auth Debug Result:', authInfo);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <DashboardProvider>
        <DashboardLayout onBackToPublic={() => {
          setShowDashboard(false);
          setTimeout(() => setPublicLayoutKey(prev => prev + 1), 0); // PublicLayout'u sıfırla ve ana sayfaya dön
        }} />
      </DashboardProvider>
    );
  }

  return (
    <PublicLayout
      key={publicLayoutKey}
      onShowDashboard={() => setShowDashboard(true)}
      onBackToHome={() => { }}
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