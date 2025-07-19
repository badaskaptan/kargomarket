import React, { useState } from 'react';
import { Package, Truck, Ship } from 'lucide-react';
import MyLoadListings from './listings/MyLoadListings';
import MyShipmentRequests from './listings/MyShipmentRequests';
import MyTransportServices from './listings/MyTransportServices';

/**
 * Ana İlanlar Bölümü
 * Farklı ilan tiplerini ayrı component'lerde yönetir
 */
const MyListingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'load-listings' | 'shipment-requests' | 'transport-services'>('load-listings');

  const tabs = [
    {
      id: 'load-listings' as const,
      label: 'Yük İlanları',
      icon: Package,
      color: 'blue',
      component: MyLoadListings
    },
    {
      id: 'shipment-requests' as const,
      label: 'Nakliye Talepleri',
      icon: Truck,
      color: 'green',
      component: MyShipmentRequests
    },
    {
      id: 'transport-services' as const,
      label: 'Nakliye Hizmetleri',
      icon: Ship,
      color: 'purple',
      component: MyTransportServices
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MyLoadListings;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">İlanlarım</h1>
            <p className="text-gray-600">
              Tüm ilan tiplerinizi tek yerden yönetin
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Toplam İlan</div>
            <div className="text-2xl font-bold text-blue-600">-</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${isActive
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${isActive ? `text-${tab.color}-600` : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-500 rounded-full`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default MyListingsSection;
