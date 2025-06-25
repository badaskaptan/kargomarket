import React from 'react';
import { ArrowRight, Target, BarChart3, Users, Zap } from 'lucide-react';

const AdPanelPage: React.FC = () => {
  const adTypes = [
    {
      title: 'Banner Reklamları',
      description: 'Ana sayfa ve ilan sayfalarında görünen banner reklamları',
      price: '₺50/gün',
      features: ['Yüksek görünürlük', 'Tıklama bazlı ödeme', 'Detaylı analitik'],
      icon: '🎯'
    },
    {
      title: 'Öne Çıkan İlanlar',
      description: 'İlanınızı arama sonuçlarında en üstte gösterin',
      price: '₺25/gün',
      features: ['Öncelikli listeleme', 'Renkli vurgulama', 'Daha fazla görüntülenme'],
      icon: '⭐'
    },
    {
      title: 'Yan Panel Reklamları',
      description: 'Sayfa kenarlarında görünen kompakt reklamlar',
      price: '₺30/gün',
      features: ['Sürekli görünürlük', 'Mobil uyumlu', 'Hedef kitle seçimi'],
      icon: '📱'
    },
    {
      title: 'Pop-up Reklamları',
      description: 'Dikkat çekici pop-up reklamları',
      price: '₺75/gün',
      features: ['Maksimum etki', 'Zamanlama kontrolü', 'A/B test desteği'],
      icon: '💥'
    }
  ];

  const stats = [
    { label: 'Günlük Ziyaretçi', value: '50,000+', icon: Users },
    { label: 'Aylık Sayfa Görüntüleme', value: '2M+', icon: BarChart3 },
    { label: 'Ortalama CTR', value: '%3.2', icon: Target },
    { label: 'Aktif Kullanıcı', value: '15,000+', icon: Zap }
  ];

  const benefits = [
    {
      title: 'Hedefli Reklam',
      description: 'Bölge, sektör ve kullanıcı tipine göre hedefleme yapın',
      icon: '🎯'
    },
    {
      title: 'Gerçek Zamanlı Analitik',
      description: 'Reklamlarınızın performansını anlık olarak takip edin',
      icon: '📊'
    },
    {
      title: 'Esnek Bütçe',
      description: 'Günlük bütçenizi istediğiniz zaman ayarlayın',
      icon: '💰'
    },
    {
      title: 'Profesyonel Destek',
      description: 'Reklam kampanyalarınız için uzman desteği alın',
      icon: '🤝'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Reklam Paneli</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Binlerce potansiyel müşteriye ulaşın! Reklamlarınızla işinizi büyütün.
          </p>
          <button className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
            Hemen Reklam Ver
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-primary-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ad Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Reklam <span className="text-primary-600">Türleri</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {adTypes.map((adType, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4 text-center">{adType.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{adType.title}</h3>
                <p className="text-gray-600 text-sm mb-4 text-center">{adType.description}</p>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">{adType.price}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {adType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105">
                  Seç
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Neden <span className="text-primary-600">Kargo Market</span> Reklamları?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nasıl <span className="text-primary-600">Çalışır?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Reklam Türü Seçin', description: 'Size uygun reklam türünü belirleyin' },
              { step: '02', title: 'Hedef Kitle Belirleyin', description: 'Reklamınızın kimler tarafından görüleceğini seçin' },
              { step: '03', title: 'Bütçe Ayarlayın', description: 'Günlük veya toplam bütçenizi belirleyin' },
              { step: '04', title: 'Yayınlayın', description: 'Reklamınız onaylandıktan sonra yayına başlar' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Reklamınızla Binlerce Kullanıcıya Ulaşın!</h2>
          <p className="text-xl mb-8 text-primary-100">
            Hemen reklam verin ve işinizi büyütmeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center">
              <span>Reklam Oluştur</span>
              <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105">
              Fiyat Listesi
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sıkça Sorulan Sorular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reklam onay süreci ne kadar?</h3>
              <p className="text-gray-600 text-sm">Reklamlarınız genellikle 24 saat içinde onaylanır ve yayına başlar.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Minimum reklam bütçesi var mı?</h3>
              <p className="text-gray-600 text-sm">Minimum günlük bütçe 25 TL'dir. İstediğiniz zaman artırabilir veya azaltabilirsiniz.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reklam performansını nasıl takip ederim?</h3>
              <p className="text-gray-600 text-sm">Reklam panelinizden gerçek zamanlı analitikleri görüntüleyebilirsiniz.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reklamımı istediğim zaman durdurabilir miyim?</h3>
              <p className="text-gray-600 text-sm">Evet, reklamlarınızı istediğiniz zaman duraklatabilir veya tamamen durdurabilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPanelPage;