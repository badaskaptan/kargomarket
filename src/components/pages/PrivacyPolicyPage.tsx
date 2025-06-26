import React from 'react';

const PrivacyPolicyPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-primary-600">Gizlilik Politikası</h1>
    <p className="mb-4">Kişisel verileriniz yalnızca platform işleyişini sağlamak ve yasal yükümlülükler çerçevesinde KVKK kapsamında işlenir. Üçüncü şahıslarla paylaşılmaz, gizliliğiniz korunur. Detaylar için lütfen <a href="/kvkk" className="text-primary-600 underline">KVKK Aydınlatma Metni</a>'ni inceleyin.</p>
    <p className="mb-4">Platformumuzda gezinirken çerezler ve benzeri teknolojiler kullanılabilir. Detaylar için <a href="/cookie-policy" className="text-primary-600 underline">Çerez Politikası</a>'na bakınız.</p>
    <p className="mb-4">Daha fazla bilgi için iletişim: <a href="mailto:emrahbadas@gmail.com" className="text-primary-600 underline">emrahbadas@gmail.com</a></p>
  </div>
);

export default PrivacyPolicyPage;
