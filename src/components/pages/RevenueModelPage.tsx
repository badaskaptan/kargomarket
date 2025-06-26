import React from 'react';

const RevenueModelPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-primary-600">Gelir Modeli</h1>
    <p className="mb-4">Platformun tüm gelirleri yalnızca üyelik ücretleri ve reklam/ilan yayınlama bedellerinden elde edilmektedir. Kullanıcılar arasında yapılan işlemlerden komisyon alınmaz, platform ticari taraf değildir.</p>
    <p className="mb-4">Detaylı bilgi için <a href="/legal-disclaimer" className="text-primary-600 underline">Sorumluluk Reddi</a> sayfasına bakınız.</p>
  </div>
);

export default RevenueModelPage;
