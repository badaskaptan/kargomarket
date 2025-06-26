import React from 'react';

const KvkkPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-primary-600">KVKK Aydınlatma Metni</h1>
    <p className="mb-4">Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, platform işleyişini sağlamak ve yasal yükümlülüklerimizi yerine getirmek amacıyla işlenmektedir.</p>
    <p className="mb-4">Verileriniz hiçbir şekilde üçüncü şahıslarla paylaşılmaz ve güvenliğiniz için gerekli tüm teknik ve idari tedbirler alınır.</p>
    <p className="mb-4">Daha fazla bilgi için <a href="/privacy-policy" className="text-primary-600 underline">Gizlilik Politikası</a>'na bakınız.</p>
  </div>
);

export default KvkkPage;
