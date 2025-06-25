import React, { useState } from 'react';
import { X, Zap, Info, ExternalLink } from 'lucide-react';

const BetaBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg z-50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="animate-pulse absolute top-1 left-4 w-2 h-2 bg-white rounded-full"></div>
          <div className="animate-pulse absolute top-3 right-8 w-1 h-1 bg-white rounded-full delay-300"></div>
          <div className="animate-pulse absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-white rounded-full delay-700"></div>
          <div className="animate-pulse absolute bottom-1 right-1/4 w-1 h-1 bg-white rounded-full delay-1000"></div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Main Content */}
          <div className="flex items-center flex-1">
            <div className="flex items-center mr-4">
              <div className="relative">
                <Zap className="w-6 h-6 text-yellow-200 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <div className="flex-1">
              {/* Turkish Text */}
              <div className="mb-1">
                <span className="font-bold text-sm md:text-base">
                  🚀 BETA AŞAMASI: Sitemiz geliştirme ve tanıtım aşamasındadır! 
                </span>
                <span className="text-sm md:text-base">
                  İlk 3 ay boyunca hiçbir ilan veya kayıt ücreti alınmayacaktır. 
                  Sistemin kilit fonksiyonları %100 çalışmaktadır. 
                  Gönül rahatlığıyla ilan açabilir, teklif sunabilir, tüm işlemleri sorunsuzca gerçekleştirebilirsiniz!
                </span>
              </div>
              
              {/* English Text */}
              <div className="text-xs md:text-sm opacity-90">
                <span className="font-semibold">
                  🌟 BETA PHASE: Our platform is in development and promotional phase! 
                </span>
                <span>
                  For the first 3 months, no listing or registration fees will be charged. 
                  All key features are fully operational. 
                  Feel free to create listings, submit offers, and perform all critical actions with confidence!
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Info Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 group"
              title="Detaylı Bilgi"
            >
              <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 group"
              title="Kapat"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Detailed Information Panel */}
        {showDetails && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Turkish Details */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  🇹🇷 Türkçe Detaylar
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Ücretsiz Kullanım:</strong> İlk 3 ay tamamen ücretsiz</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Tam Fonksiyonellik:</strong> Tüm özellikler çalışır durumda</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Güvenli İşlemler:</strong> Sigorta ve evrak güvencesi</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>7/24 Destek:</strong> Teknik destek her zaman aktif</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-300 mr-2">ℹ️</span>
                    <span><strong>Beta Sürümü:</strong> Sürekli iyileştirmeler yapılmaktadır</span>
                  </div>
                </div>
              </div>

              {/* English Details */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  🇺🇸 English Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Free Usage:</strong> Completely free for the first 3 months</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Full Functionality:</strong> All features are operational</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>Secure Transactions:</strong> Insurance and document protection</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-300 mr-2">✅</span>
                    <span><strong>24/7 Support:</strong> Technical support always available</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-300 mr-2">ℹ️</span>
                    <span><strong>Beta Version:</strong> Continuous improvements being made</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg">
                🚀 Hemen Üye Ol / Sign Up Now
              </button>
              <button className="bg-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors transform hover:scale-105 border border-white/30">
                📋 Nasıl Çalışır? / How It Works
              </button>
              <button className="bg-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors transform hover:scale-105 border border-white/30 flex items-center">
                📞 Destek / Support
                <ExternalLink className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"></div>
    </div>
  );
};

export default BetaBanner;