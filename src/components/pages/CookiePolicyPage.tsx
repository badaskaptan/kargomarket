import React from 'react';

const CookiePolicyPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-primary-600">Çerez Politikası</h1>
    <p className="mb-4">Platformumuzda kullanıcı deneyimini iyileştirmek ve hizmetlerimizi geliştirmek amacıyla çerezler kullanılmaktadır. Çerezler, tarayıcınızda saklanan küçük metin dosyalarıdır ve kişisel veri niteliği taşıyabilir.</p>
    <p className="mb-4">Çerezler hakkında detaylı bilgi ve tercihlerinizi nasıl yönetebileceğiniz için <a href="/privacy-policy" className="text-primary-600 underline">Gizlilik Politikası</a>'na bakınız.</p>
  </div>
);

export default CookiePolicyPage;
