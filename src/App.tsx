import { useState } from 'react';
import PublicLayout from './components/layout/PublicLayout.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import { DashboardProvider } from './context/DashboardContext.tsx';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext.tsx';

function AppContent() {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

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