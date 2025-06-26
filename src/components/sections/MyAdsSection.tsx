import React, { useState } from 'react';
import { Plus, Search, Edit, Pause, Play, Trash2, Eye, BarChart3, CreditCard } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const MyAdsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const ads = [
    {
      id: 1,
      title: 'Hızlı Taşıma Hizmetleri',
      type: 'Premium Reklam Kartı',
      duration: '30 gün',
      targetRole: 'Alıcı/Satıcı',
      status: 'active',
      statusLabel: 'Aktif',
      remainingDays: '25 gün',
      views: 1234,
      clicks: 89,
      budget: '₺500',
      spent: '₺300'
    },
    {
      id: 2,
      title: 'Özel Fiyat Kampanyası',
      type: 'Video Reklamı',
      duration: '15 gün',
      targetRole: 'Nakliyeci',
      status: 'active',
      statusLabel: 'Aktif',
      remainingDays: '8 gün',
      views: 856,
      clicks: 67,
      budget: '₺750',
      spent: '₺500'
    },
    {
      id: 3,
      title: 'Yeni Rota Duyurusu',
      type: 'Standart Reklam Kartı',
      duration: '7 gün',
      targetRole: 'Tümü',
      status: 'pending',
      statusLabel: 'Beklemede',
      remainingDays: '-',
      views: 0,
      clicks: 0,
      budget: '₺300',
      spent: '₺0'
    }
  ];

  const getStatusBadge = (status: string, label: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {label}
      </span>
    );
  };

  const getActionButtons = (status: string) => {
    if (status === 'pending') {
      return (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle">
            <Edit size={18} />
          </button>
          <button className="text-green-600 hover:text-green-900 transition-colors" title="Aktifleştir">
            <Play size={18} />
          </button>
          <button title="Sil">
            <Trash2 />
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle">
          <Edit size={18} />
        </button>
        <button className="text-purple-600 hover:text-purple-900 transition-colors" title="Önizleme">
          <Eye size={18} />
        </button>
        <button className="text-yellow-600 hover:text-yellow-900 transition-colors" title="Duraklat">
          <Pause size={18} />
        </button>
        <button className="text-green-600 hover:text-green-900 transition-colors" title="Performans">
          <BarChart3 size={18} />
        </button>
        <button title="Sil">
          <Trash2 />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Balance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reklam Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Mevcut Bakiye: <span className="font-medium text-green-600">1,250 ₺</span>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
              <CreditCard size={16} />
              Bakiye Yükle
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Reklamlar</p>
                <p className="text-2xl font-bold text-blue-600">2</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-green-600">2,090</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bu Ay Harcama</p>
                <p className="text-2xl font-bold text-purple-600">800 ₺</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ortalama CTR</p>
                <p className="text-2xl font-bold text-amber-600">4.2%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <BarChart3 className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button 
            onClick={() => setActiveSection('create-ad')}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            <span>Yeni Reklam Oluştur</span>
          </button>
          <button className="bg-white text-primary-600 border-2 border-primary-600 py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-50 transition-colors">
            <BarChart3 size={20} className="mr-2" />
            <span>Reklam Performansı</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Reklam ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Reklam Durumu Filtrele"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Beklemede</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hedef Kitle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Görüntülenme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bütçe/Harcama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Süresi Kalan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eylemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.targetRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.clicks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.budget} / {ad.spent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ad.status, ad.statusLabel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ad.remainingDays}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionButtons(ad.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam 3 kayıttan 1-3 arası gösteriliyor
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
              Önceki
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-primary-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAdsSection;