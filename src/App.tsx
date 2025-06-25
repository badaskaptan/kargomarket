import React, { useState } from 'react';
import PublicLayout from './components/layout/PublicLayout.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import { DashboardProvider } from './context/DashboardContext.tsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard && isLoggedIn) {
    return (
      <DashboardProvider>
        <DashboardLayout onBackToPublic={() => setShowDashboard(false)} />
      </DashboardProvider>
    );
  }

  return (
    <PublicLayout 
      isLoggedIn={isLoggedIn}
      onLogin={() => setIsLoggedIn(true)}
      onShowDashboard={() => setShowDashboard(true)}
    />
  );
}

export default App;