import { jsx as _jsx } from "react/jsx-runtime";
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
const MainContent = () => {
    const { activeSection } = useDashboard();
    const renderSection = () => {
        switch (activeSection) {
            case 'overview':
                return _jsx(OverviewSection, {});
            case 'my-listings':
                return _jsx(MyListingsSection, {});
            case 'create-load-listing':
                return _jsx(CreateLoadListingSection, {});
            case 'create-shipment-request':
                return _jsx(CreateShipmentRequestSection, {});
            case 'create-transport-service':
                return _jsx(CreateTransportServiceSection, {});
            case 'my-offers':
                return _jsx(MyOffersSection, {});
            case 'messages':
                return _jsx(MessagesSection, {});
            case 'my-ads':
                return _jsx(MyAdsSection, {});
            case 'create-ad':
                return _jsx(CreateAdSection, {});
            case 'my-reviews':
                return _jsx(MyReviewsSection, {});
            case 'profile':
                return _jsx(ProfileSection, {});
            case 'settings':
                return _jsx(SettingsSection, {});
            default:
                return _jsx(OverviewSection, {});
        }
    };
    return (_jsx("main", { className: "flex-1 overflow-y-auto animate-fade-in", children: renderSection() }));
};
export default MainContent;
