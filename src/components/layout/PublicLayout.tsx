import React, { useState } from 'react';
import PublicHeader from '../public/PublicHeader.tsx';
import PublicFooter from '../public/PublicFooter.tsx';
import BetaBanner from '../common/BetaBanner.tsx';
import HomePage from '../pages/HomePage.tsx';
import ListingsPage from '../pages/ListingsPage.tsx';
import AdPanelPage from '../pages/AdPanelPage.tsx';
import AdsPage from '../pages/AdsPage.tsx';
import ReviewsPage from '../pages/ReviewsPage.tsx';
import HowItWorksPage from '../pages/HowItWorksPage.tsx';
import AboutUsPage from '../pages/AboutUsPage.tsx';
import LegalDisclaimerPage from '../pages/LegalDisclaimerPage.tsx';

interface PublicLayoutProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onShowDashboard: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ isLoggedIn, onLogin, onShowDashboard }) => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'listings':
        return <ListingsPage isLoggedIn={isLoggedIn} onLogin={onLogin} />;
      case 'ads':
        return <AdsPage isLoggedIn={isLoggedIn} onLogin={onLogin} />;
      case 'reviews':
        return <ReviewsPage />;
      case 'ad-panel':
        return <AdPanelPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'about':
        return <AboutUsPage />;
      case 'legal-disclaimer':
        return <LegalDisclaimerPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Beta Banner - Site genelinde görünür */}
      <BetaBanner />
      
      <PublicHeader 
        activePage={activePage}
        setActivePage={setActivePage}
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onShowDashboard={onShowDashboard}
      />
      
      <main className="min-h-screen">
        {renderPage()}
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;