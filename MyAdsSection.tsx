import React, { useState } from 'react';
import { Plus, Search, Edit, Pause, Play, Trash2, Eye, BarChart3, CreditCard, X, CheckCircle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

// Ad interface tanımı
interface Ad {
  id: number;
  title: string;
  type: string;
  duration: string;
  targetRole: string;
  status: string;
  statusLabel: string;
  remainingDays: string;
  views: number;
  clicks: number;
  budget: string;
  spent: string;
}

// Reklamlar dizisi en üste taşındı
const initialAds = [
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

const MyAdsSection: React.FC = () => {
  const { setActiveSection } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balance, setBalance] = useState(1250); // Varsayılan bakiye
  const [balanceForm, setBalanceForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    amount: ''
  });
  const [balanceSuccess, setBalanceSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    type: '',
    targetRole: '',
    budget: '',
    duration: ''
  });
  const [adsState, setAdsState] = useState(initialAds);
  const [infoMessage, setInfoMessage] = useState('');

  const getStatusBadge = (status: string, label: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status === 'active' ? 'Aktif' : status === 'paused' ? 'Pasif' : label}
      </span>
    );
  };

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setEditForm({
      title: ad.title,
      type: ad.type,
      targetRole: ad.targetRole,
      budget: ad.budget.replace('₺',''),
      duration: ad.duration.replace(' gün','')
    });
    setShowEditModal(true);
  };
  const handlePreview = (ad: Ad) => {
    setSelectedAd(ad);
    setShowPreviewModal(true);
  };
  const handlePause = (ad: Ad) => {
    setAdsState(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'paused', statusLabel: 'Pasif' } : a));
    setInfoMessage('Reklam pasif hale getirildi.');
    setTimeout(() => setInfoMessage(''), 2000);
  };
  const handleActivate = (ad: Ad) => {
    setAdsState(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'active', statusLabel: 'Aktif' } : a));
    setInfoMessage('Reklam aktif hale getirildi.');
    setTimeout(() => setInfoMessage(''), 2000);
  };
  const handleDelete = (ad: Ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
  };
  const confirmDelete = () => {
    if (!selectedAd) return;
    setAdsState(prev => prev.filter(a => a.id !== selectedAd.id));
    setShowDeleteModal(false);
    setInfoMessage('Reklam silindi.');
    setTimeout(() => setInfoMessage(''), 2000);
  };
  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const saveEdit = () => {
    if (!selectedAd) return;
    setAdsState(prev => prev.map(a => a.id === selectedAd.id ? {
      ...a,
      title: editForm.title,
      type: editForm.type,
      targetRole: editForm.targetRole,
      budget: `₺${editForm.budget}`,
      duration: `${editForm.duration} gün`
    } : a));
    setShowEditModal(false);
    setInfoMessage('Reklam başarıyla güncellendi.');
    setTimeout(() => setInfoMessage(''), 2000);
  };

  const getActionButtons = (status: string, ad: Ad) => {
    if (status === 'pending') {
      return (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle" onClick={() => handleEdit(ad)}>
            <Edit size={18} />
          </button>
          <button className="text-green-600 hover:text-green-900 transition-colors" title="Aktifleştir" onClick={() => handleActivate(ad)}>
            <Play size={18} />
          </button>
          <button title="Sil" onClick={() => handleDelete(ad)}>
            <Trash2 />
          </button>
        </div>
      );
    }
    return (
      <div className="flex space-x-2">
        <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle" onClick={() => handleEdit(ad)}>
          <Edit size={18} />
        </button>
        <button className="text-purple-600 hover:text-purple-900 transition-colors" title="Önizleme" onClick={() => handlePreview(ad)}>
          <Eye size={18} />
        </button>
        {status === 'active' ? (
          <button className="text-yellow-600 hover:text-yellow-900 transition-colors" title="Pasif Yap" onClick={() => handlePause(ad)}>
            <Pause size={18} />
          </button>
        ) : status === 'paused' ? (
          <button className="text-green-600 hover:text-green-900 transition-colors" title="Aktif Yap" onClick={() => handleActivate(ad)}>
            <Play size={18} />
          </button>
        ) : null}
        <button className="text-green-600 hover:text-green-900 transition-colors" title="Performans" onClick={() => { setSelectedAd(ad); setShowPerformanceModal(true); }}>
          <BarChart3 size={18} />
        </button>
        <button title="Sil" onClick={() => handleDelete(ad)}>
          <Trash2 />
        </button>
      </div>
    );
  };

  // Kullanıcı dostu reklam performans modalı
  const renderPerformanceModal = () => {
    if (!showPerformanceModal || !selectedAd) return null;
    // CTR hesaplama
    const ctr = selectedAd.views > 0 ? ((selectedAd.clicks / selectedAd.views) * 100).toFixed(2) : '0.00';
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <button
            onClick={() => setShowPerformanceModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2">
            <BarChart3 size={24} /> Reklam Performansı
          </h3>
          <div className="mb-4">
            <div className="text-lg font-semibold text-gray-900 mb-1">{selectedAd.title}</div>
            <div className="text-sm text-gray-500">{selectedAd.type} • {selectedAd.targetRole}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Görüntülenme</div>
              <div className="text-xl font-bold text-blue-600">{selectedAd.views.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Tıklama</div>
              <div className="text-xl font-bold text-green-600">{selectedAd.clicks}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Tıklanma Oranı (CTR)</div>
              <div className="text-xl font-bold text-amber-600">{ctr}%</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Kalan Gün</div>
              <div className="text-xl font-bold text-purple-600">{selectedAd.remainingDays}</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 text-center col-span-2">
              <div className="text-xs text-gray-500 mb-1">Bütçe / Harcama</div>
              <div className="text-lg font-bold text-pink-600">{selectedAd.budget} / {selectedAd.spent}</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center mb-2">Reklam performansınızı artırmak için <b>görsel/video kalitesine</b> ve <b>hedef kitle seçimine</b> dikkat edin.</div>
          <button
            onClick={() => setShowPerformanceModal(false)}
            className="w-full mt-2 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  };

  // Bakiye yükleme modalı
  const renderBalanceModal = () => {
    if (!showBalanceModal) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <button
            onClick={() => { setShowBalanceModal(false); setBalanceSuccess(false); setBalanceForm({cardNumber:'',expiry:'',cvc:'',amount:''}); }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200"
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2">
            <CreditCard size={24} /> Bakiye Yükle
          </h3>
          {balanceSuccess ? (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <div className="text-lg font-semibold text-green-700 mb-2">Bakiye başarıyla yüklendi!</div>
              <div className="text-gray-600 mb-4">Yeni bakiyeniz: <span className="font-bold text-primary-600">{balance.toLocaleString()} ₺</span></div>
              <button
                onClick={() => { setShowBalanceModal(false); setBalanceSuccess(false); setBalanceForm({cardNumber:'',expiry:'',cvc:'',amount:''}); }}
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2"
              >
                Kapat
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={e => { e.preventDefault();
              if (!balanceForm.cardNumber || !balanceForm.expiry || !balanceForm.cvc || !balanceForm.amount) return;
              setBalance(b => b + parseInt(balanceForm.amount));
              setBalanceSuccess(true);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                <input
                  type="text"
                  maxLength={19}
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={balanceForm.cardNumber}
                  onChange={e => setBalanceForm(f => ({ ...f, cardNumber: e.target.value.replace(/[^0-9 ]/g, '') }))}
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="AA/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={balanceForm.expiry}
                    onChange={e => setBalanceForm(f => ({ ...f, expiry: e.target.value.replace(/[^0-9/]/g, '') }))}
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={balanceForm.cvc}
                    onChange={e => setBalanceForm(f => ({ ...f, cvc: e.target.value.replace(/[^0-9]/g, '') }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yüklenecek Tutar (₺)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Örn: 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={balanceForm.amount}
                  onChange={e => setBalanceForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2"
              >
                Yüklemeyi Onayla
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  // Edit Modal
  const renderEditModal = () => {
    if (!showEditModal || !selectedAd) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200" title="Kapat" aria-label="Kapat">
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold text-primary-700 mb-4">Reklamı Düzenle</h3>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input type="text" name="title" value={editForm.title} onChange={handleEditInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required placeholder="Reklam başlığı" title="Reklam başlığı" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
              <select name="type" value={editForm.type} onChange={handleEditInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" title="Reklam tipi">
                <option>Premium Reklam Kartı</option>
                <option>Video Reklamı</option>
                <option>Standart Reklam Kartı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kitle</label>
              <select name="targetRole" value={editForm.targetRole} onChange={handleEditInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" title="Hedef kitle">
                <option>Alıcı/Satıcı</option>
                <option>Nakliyeci</option>
                <option>Tümü</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bütçe (₺)</label>
              <input type="number" name="budget" value={editForm.budget} onChange={handleEditInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required placeholder="Bütçe" title="Bütçe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Süre (gün)</label>
              <input type="number" name="duration" value={editForm.duration} onChange={handleEditInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required placeholder="Süre (gün)" title="Süre (gün)" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">İptal</button>
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // Preview Modal
  const renderPreviewModal = () => {
    if (!showPreviewModal || !selectedAd) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <button onClick={() => setShowPreviewModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200" title="Kapat" aria-label="Kapat">
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold text-primary-700 mb-4">Reklam Önizleme</h3>
          <div className="mb-2 text-lg font-semibold">{selectedAd.title}</div>
          <div className="mb-1 text-gray-600">{selectedAd.type} • {selectedAd.targetRole}</div>
          <div className="mb-1">Bütçe: <span className="font-bold">{selectedAd.budget}</span></div>
          <div className="mb-1">Süre: <span className="font-bold">{selectedAd.duration}</span></div>
          <div className="mb-1">Durum: {getStatusBadge(selectedAd.status, selectedAd.statusLabel)}</div>
          {/* Duruma göre bilgilendirme */}
          {selectedAd.status === 'active' ? (
            <div className="mt-2 text-green-700 text-sm font-medium">Bu reklam yayında ve herkes tarafından görüntülenebilir.</div>
          ) : selectedAd.status === 'paused' ? (
            <div className="mt-2 text-yellow-700 text-sm font-medium">Bu reklam pasif durumda, yayında değildir.</div>
          ) : null}
          <div className="mt-4 flex justify-end">
            <button onClick={() => setShowPreviewModal(false)} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Kapat</button>
          </div>
        </div>
      </div>
    );
  };
  // Delete Modal
  const renderDeleteModal = () => {
    if (!showDeleteModal || !selectedAd) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transform hover:scale-110 transition-all duration-200" title="Kapat" aria-label="Kapat">
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold text-red-700 mb-4">Reklamı Sil</h3>
          <div className="mb-4">"{selectedAd.title}" reklamını silmek istediğinize emin misiniz?</div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">İptal</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Sil</button>
          </div>
        </div>
      </div>
    );
  };

  // Filtrelenmiş reklamlar
  const filteredAds = adsState.filter(ad =>
    (!searchTerm || ad.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!statusFilter || ad.status === statusFilter)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Balance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reklam Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Mevcut Bakiye: <span className="font-medium text-green-600">{balance.toLocaleString()} ₺</span>
            </div>
            <button onClick={() => setShowBalanceModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
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
              title="Reklam ara"
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
            title="Reklam Durumu Filtrele"
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
              {filteredAds.map((ad: Ad) => (
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
                    {getActionButtons(ad.status, ad)}
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
        {renderPerformanceModal()}
        {renderBalanceModal()}
        {infoMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in">
            {infoMessage}
          </div>
        )}
        {renderEditModal()}
        {renderPreviewModal()}
        {renderDeleteModal()}
      </div>
    </div>
  );
};

export default MyAdsSection;