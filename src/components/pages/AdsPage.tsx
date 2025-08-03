import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AuthModal from '../auth/AuthModal';
import { AdsService, type AdWithProfile as OriginalAdWithProfile } from '../../services/adsService';

// Profile tipini genişlet
type ProfileWithContact = {
  id: string;
  full_name: string;
  avatar_url?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  website?: string;
};

type AdWithProfile = Omit<OriginalAdWithProfile, 'profile'> & {
  profile: ProfileWithContact;
};

const AdsPage = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [ads, setAds] = useState<AdWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { login, register, googleLogin, isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Temporarily removed filters for debugging
        const { data, error: fetchError } = await AdsService.getActiveAds();
        if (fetchError) {
          throw new Error('Reklamlar yüklenirken bir hata oluştu.');
        }
        // Profile alanı olmayanları filtrele veya varsayılan profile ile dönüştür
        const originalAds: OriginalAdWithProfile[] = data || [];
        const safeAds: AdWithProfile[] = originalAds
          .filter((ad) => ad.profile)
          .map((ad) => {
            const profile = ad.profile! as ProfileWithContact | { id: string; full_name: string; avatar_url?: string; company_name?: string };
            return {
              ...ad,
              profile: {
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                company_name: profile.company_name,
                phone: (profile as ProfileWithContact).phone ?? '',
                email: (profile as ProfileWithContact).email ?? '',
                website: (profile as ProfileWithContact).website ?? '',
              },
            };
          });
        setAds(safeAds);
        console.log('AdsPage: Fetched ads with profiles:', data); // Debug log
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Bilinmeyen bir hata oluştu.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);

  const categories = useMemo(() => {
    const transportCount = ads.filter(ad => ad.category === 'transport').length;
    const insuranceCount = ads.filter(ad => ad.category === 'insurance').length;
    const logisticsCount = ads.filter(ad => ad.category === 'logistics').length;

    return [
      { id: 'all', label: 'Tümü', count: ads.length },
      { id: 'transport', label: 'Kargo', count: transportCount },
      { id: 'insurance', label: 'Sigorta', count: insuranceCount },
      { id: 'logistics', label: 'Lojistik', count: logisticsCount }
    ];
  }, [ads]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await register(fullName, email, password);
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleContactClick = (ad: AdWithProfile, type: 'phone' | 'email' | 'website') => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    AdsService.recordAdClick(ad.id);
    if (type === 'website' && ad.profile?.website) {
      let url = ad.profile.website.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
    } else if (type === 'phone' && ad.profile?.phone) {
      window.open(`tel:${ad.profile.phone}`);
    } else if (type === 'email' && ad.profile?.email) {
      window.open(`mailto:${ad.profile.email}`);
    } else {
      alert(`Bu özellik için ${type} bilgisi reklamda mevcut değil.`);
    }
  };

  const handleViewReviews = (revieweeId?: string) => {
    console.log('AdsPage: Navigating to reviews with revieweeId:', revieweeId); // New debug log
    if (!revieweeId) {
      console.warn('AdsPage: revieweeId is missing or null, cannot navigate to reviews page for specific company.');
      // Navigate to general reviews page if revieweeId is missing
      navigate('/reviews');
      return;
    }
    navigate(`/reviews?revieweeId=${revieweeId}`);
  };

  const getTypeStyle = (type: string) => {
    return type === 'premium'
      ? 'border-2 border-yellow-300 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50'
      : 'border border-gray-200 shadow-lg bg-white';
  };

  const getTypeBadge = (type: string) => {
    if (type === 'premium') {
      return (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ PREMIUM
        </div>
      );
    }
    return null;
  };

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const companyName = ad.profile?.company_name || ad.profile?.full_name || '';
      const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || ad.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [ads, searchTerm, categoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">Reklam</span> Vitrini
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Güvenilir firmalardan özel teklifler ve hizmetler. Kaliteli iş ortakları ile tanışın.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${categoryFilter === category.id
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
                  }`}
              >
                <span>{category.label}</span>
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Firma veya hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm text-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={48} className="animate-spin text-primary-500" />
            <p className="ml-4 text-gray-700">Reklamlar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl h-64 flex items-center justify-center">
            Hata: {error}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center text-gray-600 text-xl h-64 flex items-center justify-center">
            Gösterilecek aktif reklam bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAds.map((ad) => (
              <div key={ad.id.toString()} className={`rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl relative ${getTypeStyle(ad.ad_type)}`}>
                {getTypeBadge(ad.ad_type)}

                {ad.ad_type === 'video' ? (
                  <div className="relative h-48 bg-black overflow-hidden group cursor-pointer flex items-center justify-center">
                    {ad.video_url ? (
                      <video
                        src={ad.video_url}
                        controls
                        className="w-full h-full object-cover"
                        poster={ad.image_url || undefined}
                      >
                        Tarayıcınız video etiketini desteklemiyor.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-lg">Video bulunamadı</div>
                    )}
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      🎥 VİDEO
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    {ad.image_url ? (
                      <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">{ad.profile?.company_name?.charAt(0) || 'A'}</div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        {ad.profile?.avatar_url ? (
                          <img src={ad.profile.avatar_url} alt={ad.profile.company_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-lg">{ad.profile?.company_name?.charAt(0) || 'A'}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{ad.profile?.company_name || ad.profile?.full_name}</h3>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">{ad.title}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{ad.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      <span>{ad.impressions.toLocaleString()} görüntülenme</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      <span>{ad.clicks} tıklama</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleContactClick(ad, 'website')}
                        className={`flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium ${!ad.profile?.website?.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Website"
                        disabled={!ad.profile?.website || !ad.profile.website.trim()}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Daha Fazla Bilgi
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {ad.profile?.phone && (
                        <button
                          onClick={() => handleContactClick(ad, 'phone')}
                          className="bg-green-100 text-green-700 rounded-full p-2"
                          title="Telefon ile ara"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                      {ad.profile?.email && (
                        <button
                          onClick={() => handleContactClick(ad, 'email')}
                          className="bg-blue-100 text-blue-700 rounded-full p-2"
                          title="E-posta gönder"
                        >
                          <Mail size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {/* Favorilere ekle fonksiyonu buraya */ }}
                        className="bg-pink-100 text-pink-700 rounded-full p-2"
                        title="Favorilere ekle"
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        onClick={() => {/* Paylaş fonksiyonu buraya */ }}
                        className="bg-gray-100 text-gray-700 rounded-full p-2"
                        title="Paylaş"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleViewReviews(ad.profile?.id)}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Star size={14} className="mr-2" />
                      Yorumları Gör
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl">
            Daha Fazla Reklam Yükle
          </button>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Reklam Vermek İster misiniz?</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Firmanızı binlerce potansiyel müşteriye tanıtın. Reklam kartları ve video reklamları ile işinizi büyütün.
          </p>
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGoogleLogin={handleGoogleLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default AdsPage;