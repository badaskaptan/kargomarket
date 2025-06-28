import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import OverviewSection from './sections/OverviewSection';
import MyListingsSection from './sections/MyListingsSection';
import CreateLoadListingSection from './sections/CreateLoadListingSection';
import CreateShipmentRequestSection from './sections/CreateShipmentRequestSection';
import CreateTransportServiceSection from './sections/CreateTransportServiceSection';
import MyOffersSection from './sections/MyOffersSection';
import MessagesSection from './sections/MessagesSection';
import MyAdsSection from './sections/MyAdsSection';
import CreateAdSection from './sections/CreateAdSection';
import MyReviewsSection from './sections/MyReviewsSection';
import ProfileSection from './sections/ProfileSection';
import SettingsSection from './sections/SettingsSection';
import NotificationsSection from './sections/NotificationsSection'; // Yeni eklenen import

const MainContent: React.FC = () => {
  const { activeSection } = useDashboard();

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
        return <MyOffersSection />;
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
      case 'settings':
        return <SettingsSection />;
      case 'notifications': // Yeni eklenen case
        return <NotificationsSection />;
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