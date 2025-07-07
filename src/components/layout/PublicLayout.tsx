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
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.tsx';
import TermsPage from '../pages/TermsPage.tsx';
import CookiePolicyPage from '../pages/CookiePolicyPage.tsx';
import KvkkPage from '../pages/KvkkPage.tsx';
import RefundPolicyPage from '../pages/RefundPolicyPage.tsx';
import RevenueModelPage from '../pages/RevenueModelPage.tsx';

interface PublicLayoutProps {
  onShowDashboard: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ onShowDashboard }) => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onShowDashboard={onShowDashboard} onShowListings={() => setActivePage('listings')} />;
      case 'listings':
        return <ListingsPage />;
      case 'ads':
        return <AdsPage />;
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
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'cookie-policy':
        return <CookiePolicyPage />;
      case 'kvkk':
        return <KvkkPage />;
      case 'refund-policy':
        return <RefundPolicyPage />;
      case 'revenue-model':
        return <RevenueModelPage />;
      default:
        return <HomePage onShowDashboard={onShowDashboard} onShowListings={() => setActivePage('listings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Beta Banner - Site genelinde görünür */}
      <BetaBanner />
       <PublicHeader
        activePage={activePage}
        setActivePage={setActivePage}
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