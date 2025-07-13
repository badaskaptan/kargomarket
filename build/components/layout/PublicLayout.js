import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import PublicHeader from '../public/PublicHeader';
import PublicFooter from '../public/PublicFooter';
import BetaBanner from '../common/BetaBanner';
import HomePage from '../pages/HomePage';
import ListingsPage from '../pages/ListingsPage';
import AdPanelPage from '../pages/AdPanelPage';
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
const PublicLayout = ({ onShowDashboard }) => {
    const [activePage, setActivePage] = useState('home');
    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return _jsx(HomePage, { onShowDashboard: onShowDashboard, onShowListings: () => setActivePage('listings') });
            case 'listings':
                return _jsx(ListingsPage, {});
            case 'ads':
                return _jsx(AdsPage, {});
            case 'reviews':
                return _jsx(ReviewsPage, {});
            case 'ad-panel':
                return _jsx(AdPanelPage, {});
            case 'how-it-works':
                return _jsx(HowItWorksPage, {});
            case 'about':
                return _jsx(AboutUsPage, {});
            case 'legal-disclaimer':
                return _jsx(LegalDisclaimerPage, {});
            case 'privacy-policy':
                return _jsx(PrivacyPolicyPage, {});
            case 'terms':
                return _jsx(TermsPage, {});
            case 'cookie-policy':
                return _jsx(CookiePolicyPage, {});
            case 'kvkk':
                return _jsx(KvkkPage, {});
            case 'refund-policy':
                return _jsx(RefundPolicyPage, {});
            case 'revenue-model':
                return _jsx(RevenueModelPage, {});
            default:
                return _jsx(HomePage, { onShowDashboard: onShowDashboard, onShowListings: () => setActivePage('listings') });
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 font-inter", children: [_jsx(BetaBanner, {}), _jsx(PublicHeader, { activePage: activePage, setActivePage: setActivePage, onShowDashboard: onShowDashboard }), _jsx("main", { className: "min-h-screen", children: renderPage() }), _jsx(PublicFooter, {})] }));
};
export default PublicLayout;
