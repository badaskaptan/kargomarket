import React from 'react';

const TermsPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-primary-600">Kullanım Şartları</h1>
    <p className="mb-4">Platformu kullanan tüm kullanıcılar, platformun gelir modeli, sorumluluk reddi ve KVKK politikalarını peşinen kabul etmiş sayılır. Platformda yer alan tüm ilan, teklif, yorum ve işlemler ilgili kullanıcıların kendi sorumluluğundadır.</p>
    <p className="mb-4">Platform, kullanıcılar arasında gerçekleştirilen işlemlerde taraf değildir ve doğabilecek ihtilaflardan sorumlu tutulamaz.</p>
    <p className="mb-4">Detaylı bilgi için <a href="/legal-disclaimer" className="text-primary-600 underline">Sorumluluk Reddi</a> ve <a href="/revenue-model" className="text-primary-600 underline">Gelir Modeli</a> sayfalarına bakınız.</p>
  </div>
);

export default TermsPage;
