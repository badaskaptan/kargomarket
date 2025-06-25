import React, { useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import MainContent from '../MainContent';
import BetaBanner from '../common/BetaBanner';

interface DashboardLayoutProps {
  onBackToPublic: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onBackToPublic }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Beta Banner - Dashboard'da da görünür */}
      <BetaBanner />
      
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        onBackToPublic={onBackToPublic}
      />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MainContent />
      </div>
    </div>
  );
};

export default DashboardLayout;