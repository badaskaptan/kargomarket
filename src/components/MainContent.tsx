import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/SupabaseAuthContext';
import OverviewSection from './sections/OverviewSection';
import MyListingsSection from './sections/MyListingsSection';
import CreateLoadListingSection from './sections/CreateLoadListingSection';
import CreateShipmentRequestSection from './sections/CreateShipmentRequestSection';
import CreateTransportServiceSection from './sections/CreateTransportServiceSection';
import MyOffersSectionComponent from './sections/MyOffersSection';
import MyAdsSection from './sections/MyAdsSection';
import CreateAdSection from './sections/CreateAdSection';
import MyReviewsSection from './sections/MyReviewsSection';
import ProfileSection from './sections/ProfileSection';
import MessagesSection from './sections/MessagesSection';

const MainContent: React.FC = () => {
  const { activeSection } = useDashboard();
  const { user } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'my-listings':
        return <MyListingsSection />;
      case 'create-load-listing':
        return <CreateLoadListingSection />;
      case 'create-shipment-request':
        return <CreateShipmentRequestSection />;
      case 'create-transport-service':
        return <CreateTransportServiceSection />;
      case 'my-offers':
        return user?.id ? <MyOffersSectionComponent currentUserId={user.id} /> : null;
      case 'messages':
        return <MessagesSection />;
      case 'my-ads':
        return <MyAdsSection />;
      case 'create-ad':
        return <CreateAdSection />;
      case 'my-reviews':
        return <MyReviewsSection />;
      case 'profile':
        return <ProfileSection />;
      // 'settings' kaldırıldı
      default:
        return <OverviewSection />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto animate-fade-in">
      {renderSection()}
    </main>
  );
};

export default MainContent;