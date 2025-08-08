import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  FileText,
  Search,
  MessageCircle,
  CheckCircle,
  Truck,
  Play,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../context/SupabaseAuthContext';

const HowItWorksPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState('buyer');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const steps = {
    buyer: [
      {
        icon: UserPlus,
        title: 'Üye Olun',
        description: 'Hızlı ve kolay kayıt işlemi ile platformumuza katılın',
        details: 'E-posta adresiniz ve temel bilgilerinizle 2 dakikada üye olabilirsiniz.'
      },
      {
        icon: FileText,
        title: 'Yük İlanı Verin',
        description: 'Almak veya satmak istediğiniz yükün detaylarını girin',
        details: 'Yük tipi, ağırlık, hacim, kalkış-varış noktaları ve tarih bilgilerini ekleyin.'
      },
      {
        icon: Search,
        title: 'Teklifleri Karşılaştırın',
        description: 'Gelen teklifleri inceleyin ve en uygununu seçin',
        details: 'Fiyat, nakliyeci profili, değerlendirmeler ve hizmet kalitesini karşılaştırın.'
      },
      {
        icon: MessageCircle,
        title: 'İletişime Geçin',
        description: 'Seçtiğiniz nakliyeci ile detayları konuşun',
        details: 'Platform üzerinden güvenli mesajlaşma ile tüm detayları netleştirin.'
      },
      {
        icon: CheckCircle,
        title: 'Anlaşmayı Onaylayın',
        description: 'Koşulları kabul edin ve taşıma işlemini başlatın',
        details: 'Platform üzerinden güvenli anlaşma yapın, ödeme ve sigorta konularında kendi sorumluluğunuzu alın.'
      },
      {
        icon: Truck,
        title: 'Takip Edin',
        description: 'Nakliyeci ile iletişim halinde kalarak yükünüzü takip edin',
        details: 'Platform üzerinden nakliyeci ile iletişim kurarak güncel bilgi alın.'
      }
    ],
    carrier: [
      {
        icon: UserPlus,
        title: 'Üye Olun',
        description: 'Nakliyeci olarak platformumuza katılın',
        details: 'Firma bilgileriniz ve araç detaylarınızla kayıt olun.'
      },
      {
        icon: Search,
        title: 'İlanları İnceleyin',
        description: 'Size uygun yük ilanlarını bulun',
        details: 'Güzergah, yük tipi ve tarih filtrelerini kullanarak uygun ilanları bulun.'
      },
      {
        icon: FileText,
        title: 'Teklif Verin',
        description: 'Uygun gördüğünüz ilanlara teklif gönderin',
        details: 'Rekabetçi fiyatlarla teklif verin ve müşterilerle iletişime geçin.'
      },
      {
        icon: MessageCircle,
        title: 'Müşteri ile Görüşün',
        description: 'Yük sahibi ile detayları konuşun',
        details: 'Yükleme, taşıma ve teslimat detaylarını netleştirin.'
      },
      {
        icon: CheckCircle,
        title: 'İşi Alın',
        description: 'Anlaşma sağlandığında işi onaylayın',
        details: 'Platform üzerinden güvenli anlaşma yapın, ödeme ve sigorta konularında kendi sorumluluğunuzu alın.'
      },
      {
        icon: Truck,
        title: 'Taşıma Yapın',
        description: 'Güvenli taşıma ile işi tamamlayın',
        details: 'Profesyonel hizmet vererek müşteri memnuniyetini sağlayın.'
      }
    ]
  };

  const features = [
    {
      title: 'Ücretsiz Platform',
      description: 'İlk 3 ay hiçbir ücret alınmıyor, tamamen ücretsiz kullanın',
      icon: '�'
    },
    {
      title: 'Güvenli İletişim',
      description: 'Platform üzerinden güvenli mesajlaşma sistemi',
      icon: '�'
    },
    {
      title: 'Kolay Kullanım',
      description: '2 dakikada üye olun, hemen ilan vermeye başlayın',
      icon: '⚡'
    },
    {
      title: 'Danışmanlık Desteği',
      description: 'Gerektiğinde tavsiye ve yönlendirme desteği',
      icon: '�'
    }
  ];

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await register(email, password, fullName);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    // Google login implementation can be added here
  };

  const faqs = [
    {
      question: 'Kayıt olmak ve ilan vermek ücretli mi?',
      answer: 'Evet, yalnız sitemiz geliştirme ve tanıtım aşamasındadır! İlk 3 ay boyunca hiçbir ilan veya kayıt ücreti alınmayacaktır. Sistemin kilit fonksiyonları %100 çalışmaktadır. Gönül rahatlığıyla ilan açabilir, teklif sunabilir, tüm işlemleri sorunsuzca gerçekleştirebilirsiniz!'
    },
    {
      question: 'Yüklerim sigortalı mı?',
      answer: 'Profil böyle bir sorumluluk almamaktadır. İleride düşünülebilir. Sorumluluk reddi beyanında belirtilmiştir.'
    },
    {
      question: 'Nakliyeci nasıl seçerim?',
      answer: 'Nakliyecilerin profil bilgilerini, geçmiş işlerini ve müşteri değerlendirmelerini inceleyerek karar verebilirsiniz.'
    },
    {
      question: 'Ödeme nasıl yapılır?',
      answer: 'Profil böyle bir sorumluluk almamaktadır. İleride düşünülebilir. Sorumluluk reddi beyanında belirtilmiştir.'
    },
    {
      question: 'Sorun yaşarsam ne yapmalıyım?',
      answer: 'Avukatınızla görüşün. Sorumluluk reddi beyanında belirtilmiştir. Platform danışman olarak tavsiyede bulunabilir.'
    },
    {
      question: 'Yükümü takip edebilir miyim?',
      answer: 'Platform üzerinden nakliyeci ile iletişim kurarak yükünüzün durumunu öğrenebilirsiniz. Şu anda otomatik GPS takip sistemi bulunmamaktadır.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Nasıl</span> Çalışır?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            KargoMarketing'te işlem yapmak çok kolay! Adım adım süreçlerimizi inceleyin.
          </p>

          {/* Role Selector */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <button
                onClick={() => setActiveRole('buyer')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeRole === 'buyer'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600'
                  }`}
              >
                Yük Sahibi / Alıcı
              </button>
              <button
                onClick={() => setActiveRole('carrier')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeRole === 'carrier'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600'
                  }`}
              >
                Nakliyeci
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps[activeRole as keyof typeof steps].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                    <step.icon className="text-primary-600" size={32} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <p className="text-sm text-gray-500">{step.details}</p>
                </div>

                {/* Connection Line */}
                {index < steps[activeRole as keyof typeof steps].length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Platform <span className="text-primary-600">Özellikleri</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Video ile <span className="text-primary-600">Öğrenin</span>
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            KargoMarketing'in nasıl çalıştığını detaylı olarak anlatan videomuzı izleyin.
          </p>
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden max-w-4xl mx-auto cursor-pointer group">
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Play className="text-primary-600 ml-1" size={32} />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-bold text-lg">KargoMarketing Kullanım Kılavuzu</h3>
              <p className="text-sm text-gray-300">5 dakikada tüm özellikleri öğrenin</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Sıkça Sorulan <span className="text-primary-600">Sorular</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="text-primary-600" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-4">İletişim ve Destek</h2>
          <p className="text-xl mb-8 text-primary-100">
            Sorularınız için bizimle iletişime geçebilirsiniz. Danışmanlık ve yönlendirme konularında yardımcı olmaya çalışırız.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Phone className="mx-auto mb-4 text-white" size={32} />
              <h3 className="font-bold mb-2">Telefon İletişimi</h3>
              <p className="text-primary-100 text-sm mb-4">+905412879705</p>
              <p className="text-primary-100 text-xs">Çalışma saatleri içinde</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Mail className="mx-auto mb-4 text-white" size={32} />
              <h3 className="font-bold mb-2">E-posta İletişimi</h3>
              <p className="text-primary-100 text-sm mb-4">emrahbadas@gmail.com</p>
              <p className="text-primary-100 text-xs">En geç 24 saat içinde dönüş</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Hemen <span className="text-primary-600">Başlayın!</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Platform geliştirme aşamasında! İlk 3 ay tamamen ücretsiz kullanın ve ilk teklifinizi görün!
          </p>
          {user ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">✅ Zaten üye oldunuz! Dashboard'unuza gidebilirsiniz.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Dashboard'a Git
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-primary-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Ücretsiz Üye Ol
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default HowItWorksPage;