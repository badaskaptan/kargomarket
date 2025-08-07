import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  FileText,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { NewsletterService } from '../../services/newsletterService';

const PublicFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Lütfen e-posta adresinizi girin.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await NewsletterService.subscribe(email);
      setMessage({ type: 'success', text: 'Başarıyla abone oldunuz! E-posta adresinizi doğruladığınızda haberlerden haberdar olacaksınız.' });
      setEmail('');
      setIsSubscribed(true);
      
      // Başarı mesajını 5 saniye sonra temizle
      setTimeout(() => {
        setMessage(null);
        setIsSubscribed(false);
      }, 5000);
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };
  const quickLinks = [
    { label: 'Ana Sayfa', href: '#' },
    { label: 'İlanlar', href: '#' },
    { label: 'Nasıl Çalışır', href: '#' },
    { label: 'Hakkımızda', href: '#' },
    { label: 'İletişim', href: '#' }
  ];

  const services = [
    { label: 'Yük İlanları', href: '#' },
    { label: 'Nakliye Hizmetleri', href: '#' },
    { label: 'Reklam Paneli', href: '#' },
    { label: 'Kurumsal Çözümler', href: '#' }
  ];

  const support = [
    { label: 'Yardım Merkezi', href: '#' },
    { label: 'Canlı Destek', href: '#' },
    { label: 'SSS', href: '#' },
    { label: 'Kullanım Kılavuzu', href: '#' },
    { label: 'Video Eğitimler', href: '#' }
  ];

  const legal = [
    { label: 'Gizlilik Politikası', href: '/privacy-policy' },
    { label: 'Kullanım Şartları', href: '/terms' },
    { label: 'Çerez Politikası', href: '/cookie-policy' },
    { label: 'KVKK', href: '/kvkk' },
    { label: 'İptal ve İade', href: '/refund-policy' },
    { label: 'Sorumluluk Reddi', href: '/legal-disclaimer' },
    { label: 'Gelir Modeli', href: '/revenue-model' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/kargomarketing', color: 'hover:text-blue-600' },
    { icon: Twitter, href: 'https://twitter.com/kargomarketing', color: 'hover:text-blue-400' },
    { icon: Instagram, href: 'https://instagram.com/kargomarketing', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: 'https://linkedin.com/company/kargomarketing', color: 'hover:text-blue-700' },
    { icon: Youtube, href: 'https://youtube.com/@kargomarketing', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-600 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Haberlerden Haberdar Olun!</h3>
              <p className="text-primary-100">Yeni özellikler ve fırsatları kaçırmayın.</p>
            </div>
            
            <div className="w-full md:w-auto">
              {/* Success/Error Message */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <Check size={16} className="mr-2" />
                    ) : (
                      <X size={16} className="mr-2" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                  <button 
                    onClick={clearMessage}
                    className="ml-2 text-current hover:opacity-70"
                    aria-label="Mesajı kapat"
                    title="Mesajı kapat"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Newsletter Form */}
              {!isSubscribed && (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    disabled={isLoading}
                    className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none flex-1 md:w-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[120px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                        <span>Gönderiliyor...</span>
                      </div>
                    ) : (
                      <>
                        <span>Abone Ol</span>
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Success State */}
              {isSubscribed && !message && (
                <div className="flex items-center justify-center bg-green-100 text-green-800 px-6 py-3 rounded-lg border border-green-200">
                  <Check size={20} className="mr-2" />
                  <span className="font-medium">Başarıyla abone oldunuz!</span>
                </div>
              )}

              {/* KVKK Notice */}
              <p className="text-xs text-primary-100 mt-3 text-center md:text-left">
                Abone olarak <a href="#" className="underline hover:text-white">KVKK</a> ve <a href="#" className="underline hover:text-white">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="font-pacifico text-primary-400 text-3xl font-bold mb-4">
                KargoMarketing
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Türkiye'nin en güvenilir yük ve nakliye platformu. Binlerce kullanıcı ile
                güvenli, hızlı ve kolay taşımacılık çözümleri sunuyoruz.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <MapPin size={18} className="mr-3 text-primary-400" />
                  <span>23 Nisan Mahallesi, Nilüfer / Bursa</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone size={18} className="mr-3 text-primary-400" />
                  <span>+905412879705</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={18} className="mr-3 text-primary-400" />
                  <span>emrahbadas@gmail.com</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-110 hover:bg-gray-700`}
                    title={social.icon.displayName || social.icon.name || 'Sosyal Medya'}
                    aria-label={
                      social.icon === Facebook ? 'Facebook' :
                        social.icon === Twitter ? 'Twitter' :
                          social.icon === Instagram ? 'Instagram' :
                            social.icon === Linkedin ? 'Linkedin' :
                              social.icon === Youtube ? 'Youtube' :
                                'Sosyal Medya'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Hızlı Linkler</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Hizmetlerimiz</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center group"
                      title={service.label}
                      aria-label={service.label}
                    >
                      <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Destek</h4>
              <ul className="space-y-3">
                {support.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal Disclaimer Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-yellow-400 mr-3" size={24} />
                <h4 className="text-xl font-semibold text-white">Platform Sorumluluk Reddi ve Gelir Modeli Beyanı</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Turkish Version */}
                <div>
                  <h5 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                    <Shield className="mr-2" size={18} />
                    Türkçe Açıklama
                  </h5>

                  <div className="space-y-4 text-sm text-gray-300">
                    <div>
                      <h6 className="font-semibold text-white mb-2">1. Platformun Gelir Modeli ve Ticari Tarafsızlığı</h6>
                      <p className="leading-relaxed">
                        Bu platformun tüm gelirleri yalnızca üyelik ücretleri ve reklam/ilan yayınlama bedellerinden elde edilmektedir.
                        Platform, kullanıcılar arasında gerçekleştirilen herhangi bir mal, hizmet veya finansal işlemde doğrudan ya da dolaylı olarak hiçbir şekilde ticari taraf değildir.
                      </p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-white mb-2">2. Sorumluluk Reddi</h6>
                      <p className="leading-relaxed">
                        Platformda yer alan ilan, teklif, yorum, mesaj, içerik ve tüm kullanıcı işlemleri, ilgili kullanıcıların kendi beyan ve sorumluluğundadır.
                        Platform; kara para aklama, dolandırıcılık, hayali işlem, kalitesiz hizmet, ürün veya hizmette gecikme, kaybolma, çalınma, ayıplı mal, sözleşme ihlali, maddi/manevi zarar dahil fakat bunlarla sınırlı olmamak üzere,
                        her türlü hukuki, mali, cezai, idari veya diğer doğabilecek sonuç ve ihtilaflardan kesinlikle sorumlu değildir.
                      </p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-white mb-2">3. Kişisel Veriler ve KVKK</h6>
                      <p className="leading-relaxed">
                        Kişisel verileriniz yalnızca platform işleyişini sağlamak ve yasal yükümlülükler çerçevesinde KVKK kapsamında işlenir. Üçüncü şahıslarla paylaşılmaz, gizliliğiniz korunur.
                      </p>
                    </div>
                  </div>
                </div>

                {/* English Version */}
                <div>
                  <h5 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                    <FileText className="mr-2" size={18} />
                    English Statement
                  </h5>

                  <div className="space-y-4 text-sm text-gray-300">
                    <div>
                      <h6 className="font-semibold text-white mb-2">1. Platform Revenue Model and Commercial Neutrality</h6>
                      <p className="leading-relaxed">
                        All revenues of this platform are derived solely from membership fees and advertising/listing publication fees.
                        The platform is in no way, directly or indirectly, a commercial party to any goods, services, or financial transaction between users.
                      </p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-white mb-2">2. Disclaimer of Liability</h6>
                      <p className="leading-relaxed">
                        All listings, offers, comments, messages, content, and all user transactions on the platform are the sole responsibility and declaration of the respective users.
                        The platform shall not be liable for, and accepts no responsibility including but not limited to: money laundering, fraud, fictitious transactions, low quality of service, delays, loss, theft, defective goods, breach of contract, material or moral damages.
                      </p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-white mb-2">3. Personal Data and Privacy</h6>
                      <p className="leading-relaxed">
                        Your personal data is processed only to ensure the operation of the platform and within the scope of legal obligations in accordance with data protection laws. It is not shared with third parties, and your privacy is protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
                <div className="flex items-center text-yellow-300">
                  <AlertTriangle size={16} className="mr-2" />
                  <span className="font-semibold text-sm">Önemli Uyarı / Important Notice</span>
                </div>
                <p className="text-xs text-yellow-200 mt-2">
                  Platformu kullanan tüm kullanıcılar, bu açıklamaları ve yukarıda belirtilen koşulları peşinen kabul etmiş sayılır.
                  All users who use the platform are deemed to have accepted these statements and the above-mentioned conditions in advance.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
                {legal.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300 text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="text-gray-400 text-sm">
                © 2025 KargoMarketing. Tüm hakları saklıdır.
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                  ✓
                </div>
                SSL Güvenlik Sertifikası
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  🛡️
                </div>
                KVKK Uyumlu
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                  ⭐
                </div>
                ISO 27001 Sertifikalı
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-2">
                  🏆
                </div>
                Güvenilir Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;