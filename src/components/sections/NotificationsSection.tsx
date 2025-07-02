import React from 'react';

const NotificationsSection: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bildirimler</h2>
      <p className="text-gray-600">Burada bildirimleriniz listelenecektir. Henüz yeni bir bildiriminiz bulunmamaktadır.</p>
      {/* Gelecekte buraya bildirim listeleme mantığı eklenebilir */}
    </div>
  );
};

export default NotificationsSection;