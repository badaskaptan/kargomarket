import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const ReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyToReviewId, setReplyToReviewId] = useState<number | null>(null);

  const companies = [
    {
      id: 1,
      name: 'Aras Kargo',
      logo: '🚚',
      description: "Türkiye'nin önde gelen kargo şirketi",
      rating: 4.8,
      reviewCount: 1247,
      totalTransactions: 15420,
      joinDate: '2018',
      category: 'Kargo Hizmetleri',
      recentReviews: [
        {
          id: 1,
          userName: 'Mehmet Y.',
          rating: 5,
          date: '2 gün önce',
          comment: "Çok hızlı ve güvenilir hizmet. Paketim zamanında geldi, hiçbir sorun yaşamadım.",
          helpful: 12,
          type: 'positive',
          verified: true
        },
        {
          id: 2,
          userName: 'Ayşe K.',
          rating: 4,
          date: '1 hafta önce',
          comment: "Genel olarak memnunum ama bazen teslimat saatleri değişebiliyor.",
          helpful: 8,
          type: 'neutral',
          verified: true
        },
        {
          id: 9,
          userName: 'Can D.',
          rating: 5,
          date: '3 hafta önce',
          comment: "Harika bir deneyim! Kargo süreci sorunsuzdu.",
          helpful: 5,
          type: 'positive',
          verified: true
        },
        {
          id: 10,
          userName: 'Elif G.',
          rating: 3,
          date: '1 ay önce',
          comment: "Biraz yavaş olsa da sonunda ulaştı. İyileştirme bekliyorum.",
          helpful: 2,
          type: 'neutral',
          verified: false
        }
      ]
    },
    {
      id: 2,
      name: 'MNG Kargo',
      logo: '📦',
      description: 'Güvenilir kargo ve lojistik çözümleri',
      rating: 4.6,
      reviewCount: 856,
      totalTransactions: 12350,
      joinDate: '2019',
      category: 'Kargo Hizmetleri',
      recentReviews: [
        {
          id: 3,
          userName: 'Ali D.',
          rating: 5,
          date: '3 gün önce',
          comment: "Müşteri hizmetleri çok iyi, sorunumu hemen çözdüler.",
          helpful: 15,
          type: 'positive',
          verified: true
        },
        {
          id: 4,
          userName: 'Fatma S.',
          rating: 3,
          date: '5 gün önce',
          comment: "Fiyatlar biraz yüksek ama hizmet kalitesi iyi.",
          helpful: 6,
          type: 'neutral',
          verified: false
        },
        {
          id: 11,
          userName: 'Berk T.',
          rating: 4,
          date: '2 hafta önce',
          comment: "Paketim sağlam geldi, genel olarak iyiydi.",
          helpful: 7,
          type: 'positive',
          verified: true
        }
      ]
    },
    {
      id: 3,
      name: 'Yurtiçi Kargo',
      logo: '🚛',
      description: "Türkiye'nin en geniş şube ağı",
      rating: 4.7,
      reviewCount: 2134,
      totalTransactions: 18750,
      joinDate: '2017',
      category: 'Kargo Hizmetleri',
      recentReviews: [
        {
          id: 5,
          userName: 'Hasan M.',
          rating: 5,
          date: '1 gün önce',
          comment: "Her zaman tercih ettiğim kargo şirketi. Güvenilir ve hızlı.",
          helpful: 20,
          type: 'positive',
          verified: true
        },
        {
          id: 6,
          userName: 'Zeynep A.',
          rating: 2,
          date: '4 gün önce',
          comment: "Paketim zarar görmüş halde geldi, daha dikkatli olunmalı.",
          helpful: 9,
          type: 'negative',
          verified: true
        },
        {
          id: 12,
          userName: 'Emre B.',
          rating: 4,
          date: '10 gün önce',
          comment: "Şubeleri çok yaygın, bu büyük avantaj.",
          helpful: 11,
          type: 'positive',
          verified: true
        },
        {
          id: 13,
          userName: 'Deniz C.',
          rating: 1,
          date: '2 hafta önce',
          comment: "Kargom kayboldu, iletişim kurmak çok zordu.",
          helpful: 15,
          type: 'negative',
          verified: false
        }
      ]
    },
    {
      id: 4,
      name: 'Güven Sigorta',
      logo: '🛡️',
      description: 'Nakliye ve kargo sigortası uzmanı',
      rating: 4.5,
      reviewCount: 432,
      totalTransactions: 8920,
      joinDate: '2020',
      category: 'Sigorta Hizmetleri',
      recentReviews: [
        {
          id: 7,
          userName: 'Murat K.',
          rating: 5,
          date: '6 gün önce',
          comment: "Hasar durumunda çok hızlı ödeme yaptılar, teşekkürler.",
          helpful: 18,
          type: 'positive',
          verified: true
        },
        {
          id: 14,
          userName: 'Selin E.',
          rating: 5,
          date: '3 hafta önce',
          comment: "İşlemler çok kolay ve hızlıydı. Tavsiye ederim.",
          helpful: 10,
          type: 'positive',
          verified: true
        }
      ]
    },
    {
      id: 5,
      name: 'Lojistik Pro',
      logo: '🏭',
      description: 'Entegre lojistik çözümleri',
      rating: 4.9,
      reviewCount: 678,
      totalTransactions: 11200,
      joinDate: '2019',
      category: 'Lojistik Hizmetleri',
      recentReviews: [
        {
          id: 8,
          userName: 'Ahmet T.',
          rating: 5,
          date: '2 gün önce',
          comment: "Profesyonel ekip, mükemmel hizmet kalitesi.",
          helpful: 25,
          type: 'positive',
          verified: true
        },
        {
          id: 15,
          userName: 'Gizem Y.',
          rating: 5,
          date: '1 ay önce',
          comment: "Tüm lojistik süreçlerimizi kolaylaştırdılar.",
          helpful: 18,
          type: 'positive',
          verified: true
        }
      ]
    }
  ];

  const stats = [
    {
      label: 'Toplam Firma',
      value: companies.length.toString(),
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Toplam Yorum',
      value: companies.reduce((sum, company) => sum + company.reviewCount, 0).toLocaleString(),
      icon: MessageCircle,
      color: 'green'
    },
    {
      label: 'Ortalama Puan',
      value: (companies.reduce((sum, company) => sum + company.rating, 0) / companies.length).toFixed(1),
      icon: Star,
      color: 'yellow'
    },
    {
      label: 'En Yüksek Puan',
      value: Math.max(...companies.map(c => c.rating)).toString(),
      icon: Award,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getReviewTypeColor = (type: string) => {
    const colors = {
      positive: 'border-l-green-500 bg-green-50',
      negative: 'border-l-red-500 bg-red-50',
      neutral: 'border-l-yellow-500 bg-yellow-50'
    };
    return colors[type as keyof typeof colors] || colors.neutral;
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      alert('Lütfen yanıtınızı yazın!');
      return;
    }
    // Gerçek uygulamada burada API çağrısı yaparak yanıtı backend'e göndereceksiniz.
    // Şimdilik sadece bir alert gösterip modalı kapatıyoruz.
    console.log(`Yanıt gönderildi - Yorum ID: ${replyToReviewId}, Yanıt: ${replyText}`);
    alert('Yanıtınız başarıyla gönderildi!');
    setReplyText('');
    setReplyToReviewId(null);
    setShowReplyModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Yorumlar</span> ve Değerlendirmeler
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Kullanıcı deneyimlerini keşfedin, güvenilir firmalar hakkında gerçek yorumları okuyun.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className={`w-12 h-12 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Sırala"
              title="Sırala"
            >
              <option value="rating">Puana Göre</option>
              <option value="reviews">Yorum Sayısına Göre</option>
              <option value="name">İsme Göre</option>
            </select>
          </div>
        </div>

        {/* Companies List */}
        <div className="space-y-8">
          {sortedCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Company Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-2xl">{company.logo}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{company.name}</h3>
                      <p className="text-gray-600 mb-2">{company.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{company.category}</span>
                        <span>📅 {company.joinDate}'den beri</span>
                        <span>📊 {company.totalTransactions.toLocaleString()} işlem</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={`${i < Math.floor(company.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{company.rating}</span>
                    </div>
                    <p className="text-gray-600">{company.reviewCount} yorum</p>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Son Yorumlar</h4>
                  <button
                    onClick={() => setSelectedCompany(selectedCompany === company.name ? null : company.name)}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    Tüm Yorumları Gör
                    {selectedCompany === company.name ? (
                      <ChevronUp size={16} className="ml-1" />
                    ) : (
                      <ChevronDown size={16} className="ml-1" />
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {company.recentReviews.slice(0, selectedCompany === company.name ? company.recentReviews.length : 2).map((review) => (
                    <div key={review.id} className={`border-l-4 p-4 rounded-lg ${getReviewTypeColor(review.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.userName}</span>
                          {review.verified && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              ✓ Doğrulanmış
                            </span>
                          )}
                          <div className="flex items-center ml-3">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center text-green-600 hover:text-green-700 transition-colors">
                            <ThumbsUp size={14} className="mr-1" />
                            <span className="text-sm">{review.helpful}</span>
                          </button>
                          <button className="flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                            <ThumbsDown size={14} className="mr-1" />
                            <span className="text-sm">0</span>
                          </button>
                        </div>
                        <button
                          onClick={() => { setReplyToReviewId(review.id); setShowReplyModal(true); }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Yanıtla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCompany === company.name && company.recentReviews.length > 2 && (
                  <div className="mt-4 text-center">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Daha Fazla Yorum Yükle
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Deneyiminizi Paylaşın!</h2>
          <p className="text-xl mb-8 text-primary-100">
            Çalıştığınız firmalar hakkında yorum yaparak diğer kullanıcılara yardımcı olun.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg">
            Yorum Yap
          </button>
        </div>

        {/* Yanıtla Modalı */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md relative">
              <button onClick={() => setShowReplyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-6">Yorumu Yanıtla</h3>
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <div>
                  <label htmlFor="reply-text" className="block text-sm font-medium mb-1">Yanıtınız</label>
                  <textarea
                    id="reply-text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                    required
                    placeholder="Yanıtınızı buraya yazın..."
                    aria-label="Yanıt metni"
                  />
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
                  Yanıtı Gönder
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;