import React from 'react';
import {
  Users,
  Target,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Globe,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Anchor,
  Ship
} from 'lucide-react';

const AboutUsPage: React.FC = () => {
  const milestones = [
    { year: '2005', title: 'Denizcilik Başlangıcı', description: 'Emrah Badaş denizcilik sektöründe çalışmaya başladı' },
    { year: '2023', title: 'Proje Fikri', description: 'KargoMarketing fikri doğdu ve geliştirme başladı' },
    { year: '2024', title: 'Beta Lansmanı', description: 'İlk 100 kullanıcı ile beta testleri başladı' },
    { year: '2025', title: 'Resmi Lansman', description: 'Türkiye genelinde hizmete başladık' }
  ];

  const team = [
    {
      name: 'Emrah Badaş',
      role: 'Kurucu & CEO',
      description: 'Uzakyol Gemi Kaptanı - 2005\'ten beri denizcilik sektöründe',
      image: '⚓',
      linkedin: 'https://linkedin.com/in/emrahbadas',
      specialty: 'Denizcilik ve Lojistik Uzmanı'
    },
    {
      name: 'Teknoloji Ekibi',
      role: 'Geliştirme Departmanı',
      description: 'Yapay zeka destekli platform geliştirme',
      image: '💻',
      linkedin: 'https://linkedin.com/company/kargomarketing',
      specialty: 'AI & Yazılım Geliştirme'
    },
    {
      name: 'İş Geliştirme',
      role: 'Stratejik Ortaklıklar',
      description: 'Sektörel bağlantılar ve büyüme stratejileri',
      image: '📈',
      linkedin: 'https://linkedin.com/company/kargomarketing',
      specialty: 'İş Geliştirme & Strategi'
    },
    {
      name: 'Müşteri Deneyimi',
      role: 'Kullanıcı Memnuniyeti',
      description: 'Kullanıcı odaklı hizmet geliştirme',
      image: '🎯',
      linkedin: 'https://linkedin.com/company/kargomarketing',
      specialty: 'UX & Müşteri İlişkileri'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Güvenilirlik',
      description: 'Tüm işlemlerinizde maksimum güvenlik ve şeffaflık sağlıyoruz'
    },
    {
      icon: Zap,
      title: 'Hız',
      description: 'Teknoloji ile süreçleri hızlandırıyor, zamandan tasarruf ettiriyoruz'
    },
    {
      icon: Heart,
      title: 'Müşteri Odaklılık',
      description: 'Kullanıcı deneyimini sürekli iyileştiriyor, ihtiyaçları dinliyoruz'
    },
    {
      icon: Globe,
      title: 'Erişilebilirlik',
      description: 'Türkiye\'nin her yerinden kolayca erişilebilir platform sunuyoruz'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Kayıtlı Kullanıcı', icon: Users },
    { number: '1M+', label: 'Taşınan Yük (Ton)', icon: TrendingUp },
    { number: '5,000+', label: 'Aktif Nakliyeci', icon: Target },
    { number: '99.8%', label: 'Müşteri Memnuniyeti', icon: Award }
  ];

  const partners = [
    { name: 'Aras Kargo', logo: '🚚' },
    { name: 'MNG Kargo', logo: '📦' },
    { name: 'Yurtiçi Kargo', logo: '🚛' },
    { name: 'UPS', logo: '📮' },
    { name: 'DHL', logo: '✈️' },
    { name: 'FedEx', logo: '🌍' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Hakkımızda</span>
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-600 mb-8">
            Hepimiz Kazanalım!
          </h2>

          {/* Founder Story */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-6">
                  <Ship className="text-white" size={40} />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900">Emrah Badaş</h3>
                  <p className="text-primary-600 font-semibold">Kurucu & CEO - Uzakyol Gemi Kaptanı</p>
                </div>
              </div>

              <div className="text-lg text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>2005 yılından bu yana denizcilik sektöründe çalışıyor</strong>, okyanusları aşan ticaretin zorluklarını ve fırsatlarını bizzat yaşıyorum. Uzakyol kaptanlığıyla başlayan yolculuğum, kimyasal tankerlerde edindiğim birikim ve deniz ticaret hukukundaki deneyimimle birleşti.
                </p>
                <p>
                  Teknolojinin ve yapay zekânın hızla geliştiği bu dönemde, sektörün ihtiyaçlarını karşılayan, herkesin kazanabileceği adil ve yenilikçi bir dijital pazar yeri fikri zihnimde bir anda parladı.
                </p>
                <p>
                  Mevcut platformlarda genellikle tek taraflı hizmetler öne çıkarken, ben alıcı, satıcı ve nakliyeciyi bir araya getiren, tarafsız ve güvenilir bir zincir kurmak istedim. Kişisel yapay zekâ asistanımın (ChatGPT!) yönlendirmeleriyle bu projeye başladım. Her adımda kendime şunu sordum:
                </p>
                <p className="text-xl font-bold text-primary-600 text-center py-4">
                  "Nasıl olur da herkes kazanır?"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-primary-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Vision */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 border border-primary-200">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                <Globe className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Vizyonumuz</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              Sektöre yenilik ve şeffaflık getiren, teknoloji ve etik değerleri birleştiren bir platform olarak,
              <strong> Türkiye'den dünyaya uzanan global bir yolculuğa çıkmak</strong>.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
                <Heart className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Misyonumuz</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              Kullanıcı odaklı, güvenli ve adil bir ortam sunmak;
              <strong> herkesin emeğinin karşılığını aldığı, hepimizin kazandığı sürdürülebilir bir ekosistem oluşturmak</strong>.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Kilometre <span className="text-primary-600">Taşlarımız</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200"></div>

              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                      <div className="text-2xl font-bold text-primary-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            <span className="text-primary-600">Değerlerimiz</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Ekibimizle <span className="text-primary-600">Tanışın</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-2">{member.description}</p>
                <p className="text-xs text-gray-500 mb-4">{member.specialty}</p>
                <a
                  href={member.linkedin}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={16} className="mr-1" />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            <span className="text-primary-600">Ortaklarımız</span>
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="group flex items-center space-x-3 bg-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <span className="text-3xl">{partner.logo}</span>
                <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            <span className="text-primary-600">İletişim</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">
                23 Nisan Mahallesi<br />
                Nilüfer / Bursa
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-primary-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600">
                +905412879705
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600">
                emrahbadas@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <Anchor className="text-yellow-300 mr-4" size={48} />
            <div>
              <h3 className="text-2xl font-bold">Emrah Badaş</h3>
              <p className="text-primary-200">Kurucu & CEO</p>
            </div>
          </div>
          <blockquote className="text-2xl font-bold mb-4 italic">
            "Bugün küçük bir adımla başladık, yarın birlikte büyük başarılara ulaşacağız."
          </blockquote>
          <p className="text-3xl font-bold text-yellow-300">
            Hepimiz Kazanalım!
          </p>
        </div>

        {/* English Version */}
        <div className="bg-gray-100 rounded-xl p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">🇺🇸</span>
              About Us - English
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-primary-600 mb-6 text-center">Let's All Win!</h3>

              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>Since 2005, I have been working in the maritime industry</strong>, experiencing firsthand the challenges and opportunities of global trade. My journey as an ocean-going captain, combined with expertise on chemical tankers and maritime law, inspired me to envision a fair and innovative digital marketplace—where truly, everyone can win.
                </p>
                <p>
                  Most platforms today serve only one side of the logistics equation. My goal was to create a trustworthy and impartial chain bringing together buyers, sellers, and carriers. With the support of my personal AI assistant (that's ChatGPT!), I set out to build this project, always guided by one simple question:
                </p>
                <p className="text-xl font-bold text-primary-600 text-center py-4">
                  "How can we all win together?"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-primary-50 p-6 rounded-lg">
                  <h4 className="font-bold text-primary-800 mb-3">Our Vision</h4>
                  <p className="text-gray-700">
                    To pioneer a new era of innovation and transparency in logistics, merging technology and ethics, and to grow from Turkey into a truly global platform.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">Our Mission</h4>
                  <p className="text-gray-700">
                    To offer a user-focused, secure, and fair environment—building a sustainable ecosystem where every effort is valued and we all win.
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <blockquote className="text-lg font-semibold text-gray-800 italic">
                  "Today, we take a small step—tomorrow, together, we'll achieve great things."
                </blockquote>
                <p className="text-xl font-bold text-primary-600 mt-4">
                  Let's All Win!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">KargoMarketing'te Siz de Kazananlar Arasına Katılın!</h2>
          <p className="text-xl mb-8 text-primary-100">
            Binlerce kullanıcımızla birlikte güvenli ve hızlı taşımacılık deneyimi yaşayın.
          </p>
          <button className="bg-white text-primary-600 px-12 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
            Hemen Üye Ol
          </button>
        </div>

        {/* Mini FAQ */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Hızlı Sorular</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Kayıt olmak ve ilan vermek ücretli mi?</h4>
              <p className="text-gray-600 text-sm">Evet, yalnız sitemiz geliştirme ve tanıtım aşamasındadır! İlk 3 ay boyunca hiçbir ilan veya kayıt ücreti alınmayacaktır. Sistemin kilit fonksiyonları %100 çalışmaktadır. Gönül rahatlığıyla ilan açabilir, teklif sunabilir, tüm işlemleri sorunsuzca gerçekleştirebilirsiniz!</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Yüklerim sigortalı mı? Ödeme nasıl yapılır?</h4>
              <p className="text-gray-600 text-sm">Profil böyle bir sorumluluk almamaktadır. İleride düşünülebilir. Sorumluluk reddi beyanında belirtilmiştir.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Sorun yaşarsam ne yapmalıyım?</h4>
              <p className="text-gray-600 text-sm">Avukatınızla görüşün. Sorumluluk reddi beyanında belirtilmiştir. Platform danışman olarak tavsiyede bulunabilir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;