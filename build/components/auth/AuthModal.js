import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { Mail, User, Lock, LogIn, UserPlus, Eye, EyeOff, X } from "lucide-react";
const AuthModal = ({ isOpen, onClose, onLogin, onRegister, onGoogleLogin }) => {
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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (isLogin) {
                const identifier = loginType === "email" ? formData.email : formData.username;
                await onLogin(identifier, formData.password);
                setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
            else {
                await onRegister(formData.fullName, formData.email, formData.password);
                setSuccess("Kayıt başarılı! Email adresinizi kontrol edin.");
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess(null);
                }, 2000);
            }
        }
        catch (error) {
            console.error("Authentication error:", error);
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu. Lütfen tekrar deneyin.";
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await onGoogleLogin();
            setSuccess("Google ile giriş başarılı!");
            setTimeout(() => {
                onClose();
            }, 1500);
        }
        catch (error) {
            console.error("Google authentication error:", error);
            const errorMessage = error instanceof Error ? error.message : "Google ile giriş başarısız. Lütfen tekrar deneyin.";
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn", children: [_jsx("svg", { className: "absolute bottom-0 left-0 w-full h-32 pointer-events-none z-10", viewBox: "0 0 1440 320", children: _jsx("path", { fill: "#93c5fd", fillOpacity: "0.3", d: "M0,288L40,272C80,256,160,224,240,208C320,192,400,192,480,213.3C560,235,640,277,720,266.7C800,256,880,192,960,170.7C1040,149,1120,171,1200,197.3C1280,224,1360,256,1400,272L1440,288L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" }) }), _jsxs("div", { className: "relative bg-white shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-md mx-4 z-20 animate-slideUp flex flex-col items-center", children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors", "aria-label": "Modal\u0131 kapat", title: "Modal\u0131 kapat", children: _jsx(X, { size: 20 }) }), _jsxs("div", { className: "flex flex-col items-center mb-6", children: [_jsx("span", { className: "flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg mb-4 animate-pulse", children: _jsx("div", { className: "text-white text-2xl font-bold", children: "KM" }) }), _jsx("h2", { className: "text-3xl font-extrabold text-gray-800 drop-shadow", children: isLogin ? "Giriş Yap" : "Kayıt Ol" }), _jsx("p", { className: "text-gray-500 mt-1 text-center text-sm", children: isLogin
                                    ? "Hoş geldin, seni yeniden görmek güzel!"
                                    : "Hemen kaydol, fırsatları kaçırma!" })] }), _jsxs("button", { onClick: handleGoogleAuth, disabled: isLoading, className: "w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 shadow hover:bg-blue-50 text-gray-700 font-semibold transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Google ile ", isLogin ? "Giriş Yap" : "Kayıt Ol"] }), _jsxs("div", { className: "flex items-center w-full my-4", children: [_jsx("div", { className: "flex-grow h-px bg-gray-200" }), _jsx("span", { className: "px-4 text-xs text-gray-400 font-medium", children: "veya" }), _jsx("div", { className: "flex-grow h-px bg-gray-200" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5 w-full", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slideDown", children: error })), success && (_jsx("div", { className: "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-slideDown", children: success })), isLogin ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2 justify-center mb-4", children: [_jsx("button", { type: "button", onClick: () => setLoginType("email"), className: `px-4 py-2 rounded-full text-xs font-semibold transition border ${loginType === "email"
                                                    ? "bg-blue-500 text-white border-blue-500 shadow"
                                                    : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50"}`, children: "E-posta ile" }), _jsx("button", { type: "button", onClick: () => setLoginType("username"), className: `px-4 py-2 rounded-full text-xs font-semibold transition border ${loginType === "username"
                                                    ? "bg-blue-500 text-white border-blue-500 shadow"
                                                    : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50"}`, children: "Kullan\u0131c\u0131 Ad\u0131 ile" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700", children: loginType === "email" ? "E-posta" : "Kullanıcı Adı" }), _jsxs("div", { className: "relative", children: [loginType === "email" ? (_jsx(Mail, { className: "absolute left-3 top-3 text-gray-400", size: 18 })) : (_jsx(User, { className: "absolute left-3 top-3 text-gray-400", size: 18 })), _jsx("input", { type: loginType === "email" ? "email" : "text", value: loginType === "email" ? formData.email : formData.username, onChange: (e) => handleInputChange(loginType === "email" ? "email" : "username", e.target.value), className: "w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none", placeholder: loginType === "email" ? "eposta@site.com" : "kullaniciadi", required: true })] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700", children: "Ad Soyad" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 text-gray-400", size: 18 }), _jsx("input", { type: "text", value: formData.fullName, onChange: (e) => handleInputChange("fullName", e.target.value), className: "w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none", placeholder: "Ad\u0131n\u0131z Soyad\u0131n\u0131z", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700", children: "E-posta" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 text-gray-400", size: 18 }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), className: "w-full border border-gray-300 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none", placeholder: "eposta@site.com", required: true })] })] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700", children: "\u015Eifre" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 text-gray-400", size: 18 }), _jsx("input", { type: showPassword ? "text" : "password", value: formData.password, onChange: (e) => handleInputChange("password", e.target.value), className: "w-full border border-gray-300 rounded-xl px-10 py-3 pr-12 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition outline-none", placeholder: isLogin ? "••••••••" : "Şifreniz", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), isLogin && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("label", { className: "flex items-center gap-2 select-none cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.rememberMe, onChange: (e) => handleInputChange("rememberMe", e.target.checked), className: "rounded border-gray-300 text-blue-500 focus:ring-blue-400" }), _jsx("span", { className: "text-gray-600", children: "Beni Hat\u0131rla" })] }), _jsx("a", { href: "#", className: "text-blue-500 hover:underline font-medium", children: "\u015Eifremi Unuttum?" })] })), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-blue-500 text-white font-bold rounded-xl py-3 shadow-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6", children: _jsx("span", { className: "flex items-center justify-center gap-2", children: isLoading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [isLogin ? _jsx(LogIn, { size: 18 }) : _jsx(UserPlus, { size: 18 }), isLogin ? "Giriş Yap" : "Kayıt Ol"] })) }) })] }), _jsxs("div", { className: "text-center mt-8", children: [_jsx("span", { className: "text-gray-500 text-sm", children: isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?" }), _jsx("button", { type: "button", className: "ml-3 px-4 py-2 rounded-full bg-white border border-gray-300 font-semibold shadow hover:bg-blue-50 text-blue-600 transition inline-flex items-center gap-2", onClick: () => {
                                    setIsLogin(!isLogin);
                                    setFormData({
                                        fullName: "",
                                        email: "",
                                        username: "",
                                        password: "",
                                        rememberMe: false
                                    });
                                }, children: isLogin ? (_jsxs(_Fragment, { children: [_jsx(UserPlus, { size: 16 }), " Kay\u0131t Ol"] })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { size: 16 }), " Giri\u015F Yap"] })) })] })] })] }));
};
export default AuthModal;
