import React, { useState } from 'react';
import { Menu, X, User, LayoutDashboard, ChevronDown, Settings, LogOut } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../context/SupabaseAuthContext';

interface PublicHeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onShowDashboard: () => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({
  activePage,
  setActivePage,
  onShowDashboard
}) => {
  const { user, profile, loading, login, register, googleLogin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(profile?.user_type || 'buyer_seller');

  const menuItems = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'listings', label: 'İlanlar' },
    { id: 'ads', label: 'Reklamlar' },
    { id: 'reviews', label: 'Yorumlar' },
    { id: 'bilgi-merkezi', label: 'Bilgi Merkezi' },
    { id: 'how-it-works', label: 'Nasıl Çalışır' },
    { id: 'about', label: 'Hakkımızda' }
  ];

  const handleRoleChange = (newRole: 'buyer_seller' | 'carrier' | 'both') => {
    setUserRole(newRole);
    setUserMenuOpen(false);
    console.log('Rol değiştirildi:', newRole);
  };

  const handleDashboardClick = () => {
    console.log('Dashboard button clicked!');
    setUserMenuOpen(false);
    onShowDashboard();
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      // Hata AuthModal tarafından yakalanıp gösterilecek
      throw error;
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await register(fullName, email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Register error:', error);
      // Hata AuthModal tarafından yakalanıp gösterilecek
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
      // Hata AuthModal tarafından yakalanıp gösterilecek
      throw error;
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="font-pacifico text-primary-600 text-2xl font-bold cursor-pointer hover:text-primary-700 transition-all duration-300 transform hover:scale-110"
            onClick={() => setActivePage('home')}
          >
            KargoMarketing
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-110 ${activePage === item.id
                  ? 'text-primary-600 bg-primary-50 shadow-md hover:shadow-lg'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium transform hover:scale-110"
                  disabled={loading}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  Üye Ol
                </button>
              </>
            ) : (
              <div className="relative">
                {/* User Profile Button */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-primary-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Kullanıcı'}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {profile?.user_type === 'buyer_seller' ? 'Alıcı/Satıcı' : profile?.user_type === 'carrier' ? 'Nakliyeci' : profile?.user_type === 'both' ? 'Her İkisi' : 'Kullanıcı'}
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{profile?.full_name || 'Kullanıcı'}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Aktif Rol
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleRoleChange('buyer_seller')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'buyer_seller'
                            ? 'bg-primary-100 text-primary-800 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          🛒 Alıcı/Satıcı
                        </button>
                        <button
                          onClick={() => handleRoleChange('carrier')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'carrier'
                            ? 'bg-primary-100 text-primary-800 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          🚛 Nakliyeci
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <LayoutDashboard size={16} className="mr-3 text-gray-400" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // Profil sayfasına yönlendirme
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <Settings size={16} className="mr-3 text-gray-400" />
                        Profil Ayarları
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <LogOut size={16} className="mr-3 text-red-500" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlay to close menu when clicking outside */}
                {userMenuOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-125"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activePage === item.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {!user ? (
                  <>
                    <button
                      onClick={() => {
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Giriş Yap
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Üye Ol
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mobile User Info */}
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{profile?.full_name || 'Kullanıcı'}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {profile?.user_type === 'buyer_seller' ? 'Alıcı/Satıcı' : profile?.user_type === 'carrier' ? 'Nakliyeci' : profile?.user_type === 'both' ? 'Her İkisi' : 'Kullanıcı'}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Role Selection */}
                      <div className="space-y-2 mb-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol Değiştir
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleChange('buyer_seller')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'buyer_seller'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                          >
                            🛒 Alıcı/Satıcı
                          </button>
                          <button
                            onClick={() => handleRoleChange('carrier')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${userRole === 'carrier'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                          >
                            🚛 Nakliyeci
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Menu Items */}
                    <button
                      onClick={() => {
                        handleDashboardClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 bg-gray-50 rounded-lg transform hover:scale-105"
                    >
                      <LayoutDashboard size={18} className="mr-2" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        // Profil ayarlarına yönlendirme
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 transition-all duration-300 bg-gray-50 rounded-lg transform hover:scale-105"
                    >
                      <Settings size={18} className="mr-2" />
                      Profil Ayarları
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:text-red-700 transition-all duration-300 bg-red-50 rounded-lg transform hover:scale-105"
                    >
                      <LogOut size={18} className="mr-2" />
                      Çıkış Yap
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* AuthModal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />
    </header>
  );
};

export default PublicHeader;