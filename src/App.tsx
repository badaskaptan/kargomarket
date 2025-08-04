import { useEffect, useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext';
import debugAuth from './utils/debugAuth';

// Lazy load major components
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  </div>
);

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
    return <LoadingSpinner />;
  }

  if (showDashboard) {
    return (
      <DashboardProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardLayout onBackToPublic={() => {
            setShowDashboard(false);
            setTimeout(() => setPublicLayoutKey(prev => prev + 1), 0); // PublicLayout'u sıfırla ve ana sayfaya dön
          }} />
        </Suspense>
      </DashboardProvider>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PublicLayout
        key={publicLayoutKey}
        onShowDashboard={() => setShowDashboard(true)}
        onBackToHome={() => { }}
      />
    </Suspense>
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