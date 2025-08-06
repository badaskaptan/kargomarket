import React, { useState } from 'react';
import PublicHeader from '../public/PublicHeader';
import PublicFooter from '../public/PublicFooter';
import BetaBanner from '../common/BetaBanner';
import HomePage from '../pages/HomePage';
import ListingsPage from '../pages/ListingsPage';
import AdsPage from '../pages/AdsPage';
import ReviewsPage from '../pages/ReviewsPage';
import HowItWorksPage from '../pages/HowItWorksPage';
import AboutUsPage from '../pages/AboutUsPage';
import LegalDisclaimerPage from '../pages/LegalDisclaimerPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import KvkkPage from '../pages/KvkkPage';
import RefundPolicyPage from '../pages/RefundPolicyPage';
import RevenueModelPage from '../pages/RevenueModelPage';
import InfoCenterPage from '../pages/InfoCenterPage';
import LogisticsDictionaryPage from '../pages/LogisticsDictionaryPage';
import LegalGuidePage from '../pages/LegalGuidePage';
import MarketDataPage from '../pages/MarketDataPage';
import NewsPage from '../pages/NewsPage';
import StatisticsPage from '../pages/StatisticsPage';
import CalculationToolsPage from '../pages/CalculationToolsPage';

interface PublicLayoutProps {
  onShowDashboard: () => void;
  onBackToHome?: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ onShowDashboard, onBackToHome }) => {
  const [activePage, setActivePage] = useState('home'); // Ana sayfa ile başla

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
      case 'bilgi-merkezi':
        return <InfoCenterPage setActivePage={setActivePage} />;
      case 'terimler-sozlugu':
        return <LogisticsDictionaryPage setActivePage={setActivePage} />;
      case 'ticaret-hukuku':
        return <LegalGuidePage setActivePage={setActivePage} />;
      case 'navlun-fiyatlari':
        return <MarketDataPage setActivePage={setActivePage} />;
      case 'sektor-haberleri':
        return <NewsPage setActivePage={setActivePage} />;
      case 'sektorel-analiz':
        return <StatisticsPage setActivePage={setActivePage} />;
      case 'hesaplama-araclari':
        return <CalculationToolsPage setActivePage={setActivePage} />;
      default:
        return <HomePage onShowDashboard={onShowDashboard} onShowListings={() => setActivePage('listings')} />;
    }
  };

  // Ana sayfaya dön fonksiyonu
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#home') {
      setActivePage('home');
      if (onBackToHome) onBackToHome();
      window.location.hash = '';
    }
  }, [onBackToHome]);

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