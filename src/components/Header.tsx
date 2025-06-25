import React from 'react';
import { Menu, Bell, User, ArrowLeft } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onBackToPublic?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onBackToPublic }) => {
  const { userRole, setUserRole, notifications, setActiveSection } = useDashboard();

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20 glass-effect">
      <div className="flex items-center">
        {onBackToPublic && (
          <button
            onClick={onBackToPublic}
            className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-all duration-300 transform hover:scale-110"
            title="Ana Siteye Dön"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <button
          onClick={onToggleSidebar}
          className="mr-4 md:hidden text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-110"
        >
          <Menu size={24} />
        </button>
        <h1 
          className="font-pacifico text-primary-600 text-2xl font-bold cursor-pointer hover:text-primary-700 transition-all duration-300 transform hover:scale-110"
          onClick={() => onBackToPublic?.()}
        >
          Kargo Market
        </h1>
        <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Dashboard
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-110">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                {notifications}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3 shadow-lg hover:scale-110 transition-all duration-300">
            <User size={20} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Merhaba, Ahmet Yılmaz</p>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:text-primary-600 transition-colors"
            >
              <option value="alici-satici">Alıcı/Satıcı</option>
              <option value="nakliyeci">Nakliyeci</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;