import React, { useState } from "react";
import { Mail, User, Lock, LogIn, UserPlus, Eye, EyeOff, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (fullName: string, email: string, password: string) => void;
  onGoogleLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState("email"); // email | username
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const identifier = loginType === "email" ? formData.email : formData.username;
        await onLogin(identifier, formData.password);
      } else {
        await onRegister(formData.fullName, formData.email, formData.password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await onGoogleLogin();
    } catch (error) {
      console.error("Google authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Dalga efekti */}
      <svg className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-10" viewBox="0 0 1440 320">
        <path fill="#93c5fd" fillOpacity="0.3" d="M0,288L40,272C80,256,160,224,240,208C320,192,400,192,480,213.3C560,235,640,277,720,266.7C800,256,880,192,960,170.7C1040,149,1120,171,1200,197.3C1280,224,1360,256,1400,272L1440,288L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
      </svg>

      <div className="relative bg-white shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-md mx-4 z-20 animate-slideUp flex flex-col items-center">
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Modalı kapat"
          title="Modalı kapat"
        >
          <X size={20} />
        </button>

        {/* Logo veya başlık */}
        <div className="flex flex-col items-center mb-6">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg mb-4 animate-pulse">
            <div className="text-white text-2xl font-bold">KM</div>
          </span>
          <h2 className="text-3xl font-extrabold text-gray-800 drop-shadow">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h2>
          <p className="text-gray-500 mt-1 text-center text-sm">
            {isLogin 
              ? "Hoş geldin, seni yeniden görmek güzel!" 
              : "Hemen kaydol, fırsatları kaçırma!"
            }
          </p>
        </div>

        {/* Google ile giriş */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 shadow hover:bg-blue-50 text-gray-700 font-semibold transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile {isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </button>

        {/* Veya */}
        <div className="flex items-center w-full my-4">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-4 text-xs text-gray-400 font-medium">veya</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* Giriş veya Kayıt formu */}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          {isLogin ? (
            <>
              {/* Kullanıcı adı/eposta seçimi */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${
                    loginType === "email"
                      ? "bg-blue-500 text-white border-blue-500 shadow"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  E-posta ile
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("username")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${
                    loginType === "username"
                      ? "bg-blue-500 text-white border-blue-500 shadow"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  Kullanıcı Adı ile
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {loginType === "email" ? "E-posta" : "Kullanıcı Adı"}
                </label>
                <div className="relative">
                  {loginType === "email" ? (
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  ) : (
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  )}
                  <input
                    type={loginType === "email" ? "email" : "text"}
                    value={loginType === "email" ? formData.email : formData.username}
                    onChange={(e) => handleInputChange(loginType === "email" ? "email" : "username", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none"
                    placeholder={loginType === "email" ? "eposta@site.com" : "kullaniciadi"}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none"
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none"
                    placeholder="eposta@site.com"
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-10 py-3 pr-12 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none"
                placeholder={isLogin ? "••••••••" : "Şifreniz"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 select-none cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" 
                />
                <span className="text-gray-600">Beni Hatırla</span>
              </label>
              <a href="#" className="text-blue-500 hover:underline font-medium">
                Şifremi Unuttum?
              </a>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-bold rounded-xl py-3 shadow-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                </>
              )}
            </span>
          </button>
        </form>

        {/* Giriş/Kayıt arasında geçiş */}
        <div className="text-center mt-8">
          <span className="text-gray-500 text-sm">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
          </span>
          <button
            type="button"
            className="ml-3 px-4 py-2 rounded-full bg-white border border-gray-300 font-semibold shadow hover:bg-blue-50 text-blue-600 transition inline-flex items-center gap-2"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({
                fullName: "",
                email: "",
                username: "",
                password: "",
                rememberMe: false
              });
            }}
          >
            {isLogin ? (
              <>
                <UserPlus size={16} /> Kayıt Ol
              </>
            ) : (
              <>
                <LogIn size={16} /> Giriş Yap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
