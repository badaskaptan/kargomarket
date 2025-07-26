import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Play, Pause, Trash2, TrendingUp, MousePointer } from 'lucide-react';
import MediaUploader from '../MediaUploader';
import BalanceDisplay from '../BalanceDisplay';
import { AdsService, Ad, CreateAdData, TargetAudience } from '../../services/adsService';
import { BillingService, UserBalance, AD_PRICING, BILLING_CONFIG } from '../../services/billingService';

const MyAdsSection = () => {
  // State
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'banner',
    targetRole: '',
    budget: '',
    duration: '',
    placement: '',
    description: '',
    mediaUrl: '',
    startDate: '',
    endDate: ''
  });

  // Load ads on component mount
  useEffect(() => {
    loadAds();
  }, []);

  // Reklam oluşturma fonksiyonu
  const handleCreateAd = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== REKLAM OLUŞTURMA BAŞLADI ===');
      console.log('Form data:', editForm);

      // Form doğrulama
      if (!editForm.title || !editForm.description) {
        setError('Lütfen başlık ve açıklama alanlarını doldurun.');
        return;
      }

      // Maliyet hesaplama
      const dailyRate = BillingService.getDailyRate(editForm.type);
      const totalCost = BillingService.calculateTotalCost(editForm.type, editForm.startDate, editForm.endDate);
      const budgetValue = parseFloat(editForm.budget) || dailyRate;

      console.log('Hesaplanan değerler:', { dailyRate, totalCost, budgetValue });

      // Ücretsiz modda değilse bakiye kontrolü
      if (!BILLING_CONFIG.FREE_MODE && userBalance && userBalance.current_balance < totalCost) {
        setError('Yetersiz bakiye. Lütfen bakiye ekleyin.');
        return;
      }

      // Reklam verisi hazırlama
      const adData: CreateAdData = {
        title: editForm.title,
        description: editForm.description,
        image_url: editForm.mediaUrl || undefined,
        target_url: undefined,
        placement: editForm.placement,
        start_date: new Date(editForm.startDate).toISOString(),
        end_date: new Date(editForm.endDate).toISOString(),
        budget: budgetValue,
        ad_type: editForm.type,
        daily_budget: dailyRate,
        total_cost: totalCost,
        billing_status: 'active',
        target_audience: {
          roles: editForm.targetRole === 'Tümü' ? [] : [editForm.targetRole]
        },
        keywords: []
      };

      console.log('Gönderilecek ad data:', adData);

      // Reklam oluştur
      const { data: newAd, error: adError } = await AdsService.createAd(adData);
      
      console.log('AdsService.createAd sonucu:', { newAd, adError });
      
      if (adError) {
        setError(adError);
        return;
      }

      if (!newAd) {
        setError('Reklam oluşturulamadı - veri döndürülmedi.');
        return;
      }

      // Billing işlemi
      const { success: billingSuccess, error: billingError } = await BillingService.deductBalance(
        totalCost,
        `Reklam oluşturma - ${editForm.title}`,
        newAd.id.toString()
      );

      console.log('Billing sonucu:', { billingSuccess, billingError });

      if (!billingSuccess && billingError && !BILLING_CONFIG.FREE_MODE) {
        console.error('Billing error:', billingError);
        setError('Ödeme işlemi başarısız: ' + billingError);
        return;
      }

      // UI güncellemeleri
      setInfoMessage(`Reklam başarıyla oluşturuldu! ${BILLING_CONFIG.FREE_MODE ? '(Ücretsiz mod)' : `Ücret: ${totalCost} TL`}`);
      setIsCreateModalOpen(false);
      
      // Reklamları yeniden yükle
      await loadAds();
      
      setTimeout(() => setInfoMessage(''), 5000);

      console.log('=== REKLAM OLUŞTURMA TAMAMLANDI ===');

    } catch (error) {
      console.error('Create ad error:', error);
      setError('Reklam oluşturulurken beklenmeyen bir hata oluştu: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadAds = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: apiError } = await AdsService.getUserAds();
    
    if (apiError) {
      setError(apiError);
    } else {
      setAds(data || []);
    }
    
    setLoading(false);
  };

  // Event handlers
  const handleEdit = (id: bigint | number) => {
    const ad = ads.find(ad => ad.id === id);
    if (ad) {
      setSelectedAd(ad);
      setEditForm({
        title: ad.title || '',
        type: ad.ad_type || '',
        targetRole: getTargetAudienceLabel(ad.target_audience),
        budget: ad.budget ? String(ad.budget) : '',
        duration: getRemainingDays(ad.end_date),
        placement: ad.placement || '',
        description: ad.description || '',
        mediaUrl: ad.image_url || '',
        startDate: ad.start_date || '',
        endDate: ad.end_date || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const handleView = (id: bigint | number) => {
    const ad = ads.find(ad => ad.id === id);
    if (ad) {
      setSelectedAd(ad);
      setIsViewModalOpen(true);
    }
  };

  const handleDelete = async (id: bigint | number) => {
    const adId = typeof id === 'bigint' ? id : BigInt(id);
    
    const { success, error: apiError } = await AdsService.deleteAd(adId);
    
    if (success) {
      setInfoMessage('Reklam başarıyla silindi.');
      await loadAds(); // Listeyi yenile
    } else {
      setInfoMessage(apiError || 'Reklam silinirken bir hata oluştu.');
    }
    
    setTimeout(() => setInfoMessage(''), 3000);
  };

  const handleStatusChange = async (id: bigint | number, newStatus: string) => {
    const adId = typeof id === 'bigint' ? id : BigInt(id);
    
    const { success, error: apiError } = await AdsService.updateAdStatus(adId, newStatus);
    
    if (success) {
      setInfoMessage(`Reklam durumu "${getStatusLabel(newStatus)}" olarak güncellendi.`);
      await loadAds(); // Listeyi yenile
    } else {
      setInfoMessage(apiError || 'Durum güncellenirken bir hata oluştu.');
    }
    
    setTimeout(() => setInfoMessage(''), 3000);
  };

  // Helper fonksiyonlar
  const formatId = (id: bigint | number) => {
    return id.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Beklemede';
      case 'completed': return 'Tamamlandı';
      case 'paused': return 'Pasif';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses] || statusClasses.paused}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Helper functions for ads data
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} gün` : 'Süresi doldu';
  };

  const getTargetAudienceLabel = (targetAudience?: TargetAudience) => {
    if (!targetAudience || !targetAudience.roles) return 'Tümü';
    const roles = targetAudience.roles;
    if (roles.includes('all')) return 'Tümü';
    if (roles.includes('shipper') && roles.includes('carrier')) return 'Alıcı/Satıcı';
    if (roles.includes('carrier')) return 'Nakliyeci';
    if (roles.includes('shipper')) return 'Yük Sahibi';
    return 'Tümü';
  };

  const handleCreateNew = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setEditForm({
      title: '',
      type: 'banner',
      targetRole: 'Tümü',
      budget: '',
      duration: '',
      placement: 'homepage',
      description: '',
      mediaUrl: '',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    });
    setIsCreateModalOpen(true);
  };

  const handlePause = async (id: bigint | number) => {
    await handleStatusChange(id, 'paused');
  };

  const handleActivate = async (id: bigint | number) => {
    await handleStatusChange(id, 'active');
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-600 text-center">
          Reklamlar yüklenirken bir hata oluştu: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Balance Display */}
      <div className="mb-6">
        <BalanceDisplay onBalanceUpdate={setUserBalance} />
      </div>

      {/* Pricing Info */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Reklam Fiyatlandırması</h3>
        {BILLING_CONFIG.FREE_MODE ? (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-center text-center">
              <div>
                <h4 className="text-xl font-bold mb-2">🎉 Beta Sürüm - Tamamen Ücretsiz!</h4>
                <p className="text-sm opacity-90">
                  Tüm reklam türleri sınırsız kullanım. Hiçbir ödeme yapmanıza gerek yok!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(AD_PRICING).map(([type, pricing]) => (
              <div key={type} className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {type === 'banner' ? 'Banner' : type === 'video' ? 'Video' : 'Metin'}
                  </span>
                  <span className="text-sm text-gray-500">Reklam</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {pricing.daily_rate} TL
                </div>
                <div className="text-sm text-gray-600">
                  günlük • min. {pricing.minimum_budget} TL
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reklamlarım</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={handleCreateNew}
        >
          Yeni Reklam Oluştur
        </button>
      </div>

      {infoMessage && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
          {infoMessage}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-blue-50 rounded-lg p-6 mb-4">
            <p className="text-gray-700 mb-2">🎯 Henüz reklam oluşturmadınız.</p>
            <p className="text-sm text-gray-600 mb-4">
              {BILLING_CONFIG.FREE_MODE ? 
                'Reklamlarınızla daha fazla müşteriye ulaşın! Beta sürümde sınırsız reklam oluşturabilirsiniz.' : 
                'Reklamlarınızla daha fazla müşteriye ulaşın ve işinizi büyütün!'
              }
            </p>
            <div className="text-sm text-gray-600 mb-4">
              {BILLING_CONFIG.FREE_MODE ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg">
                  🎉 Şu anda tüm reklam türleri ÜCRETSIZ!
                </span>
              ) : (
                '💰 Banner: 50 TL/gün • Video: 100 TL/gün • Metin: 25 TL/gün'
              )}
            </div>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={handleCreateNew}
          >
            İlk Reklamınızı Oluşturun
          </button>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Reklam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Durum</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tür</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Bütçe</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Performans</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={formatId(ad.id)} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{ad.title}</div>
                        <div className="text-sm text-gray-500">
                          {ad.placement} • {getTargetAudienceLabel(ad.target_audience)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(ad.status)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{ad.ad_type}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatCurrency(ad.budget)}</div>
                        <div className="text-gray-500">{formatCurrency(ad.spent)} harcanmış</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <TrendingUp className="h-3 w-3 mr-1 text-blue-600" />
                          <span className="font-medium">{ad.impressions.toLocaleString()}</span>
                          <span className="text-gray-500 ml-1">gösterim</span>
                        </div>
                        <div className="flex items-center">
                          <MousePointer className="h-3 w-3 mr-1 text-green-600" />
                          <span className="font-medium">{ad.clicks.toLocaleString()}</span>
                          <span className="text-gray-500 ml-1">tıklama</span>
                          <span className="ml-2 text-purple-600">(%{ad.ctr.toFixed(2)})</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Görüntüle" 
                          onClick={() => handleView(ad.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Düzenle" 
                          onClick={() => handleEdit(ad.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {ad.status === 'active' ? (
                          <button 
                            className="text-orange-600 hover:text-orange-900 transition-colors" 
                            title="Duraklat" 
                            onClick={() => handlePause(ad.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors" 
                            title="Başlat" 
                            onClick={() => handleActivate(ad.id)}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors" 
                          title="Sil" 
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {ads.map((ad) => (
              <div key={formatId(ad.id)} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{ad.title}</h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {ad.ad_type} • {ad.placement} • {getTargetAudienceLabel(ad.target_audience)}
                    </div>
                    {getStatusBadge(ad.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <div className="text-gray-500">Bütçe</div>
                    <div className="font-medium">{formatCurrency(ad.budget)}</div>
                    <div className="text-gray-500">{formatCurrency(ad.spent)} harcanmış</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Performans</div>
                    <div className="font-medium">{ad.impressions.toLocaleString()} gösterim</div>
                    <div className="text-gray-500">{ad.clicks.toLocaleString()} tıklama (%{ad.ctr.toFixed(2)})</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex space-x-3">
                    <button 
                      className="text-blue-600 hover:text-blue-900 transition-colors" 
                      title="Görüntüle" 
                      onClick={() => handleView(ad.id)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 transition-colors" 
                      title="Düzenle" 
                      onClick={() => handleEdit(ad.id)}
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    {ad.status === 'active' ? (
                      <button 
                        className="text-orange-600 hover:text-orange-900 transition-colors" 
                        title="Duraklat" 
                        onClick={() => handlePause(ad.id)}
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    ) : (
                      <button 
                        className="text-green-600 hover:text-green-900 transition-colors" 
                        title="Başlat" 
                        onClick={() => handleActivate(ad.id)}
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <button 
                    className="text-red-600 hover:text-red-900 transition-colors" 
                    title="Sil" 
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedAd.title}</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">{selectedAd.ad_type} • {getTargetAudienceLabel(selectedAd.target_audience)}</div>
                <div className="mt-2">{getStatusBadge(selectedAd.status)}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{selectedAd.impressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Gösterim</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{selectedAd.clicks.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Tıklama</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">%{selectedAd.ctr.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{getRemainingDays(selectedAd.end_date)}</div>
                  <div className="text-sm text-gray-600">Kalan Süre</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Açıklama</h4>
                <p className="text-gray-700">{selectedAd.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Bütçe Bilgileri</h4>
                  <div className="text-sm space-y-1">
                    <div>Toplam Bütçe: <span className="font-medium">{formatCurrency(selectedAd.budget)}</span></div>
                    <div>Harcanan: <span className="font-medium">{formatCurrency(selectedAd.spent)}</span></div>
                    <div>Kalan: <span className="font-medium">{formatCurrency(selectedAd.budget - selectedAd.spent)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tarihler</h4>
                  <div className="text-sm space-y-1">
                    <div>Başlangıç: <span className="font-medium">{formatDate(selectedAd.start_date)}</span></div>
                    <div>Bitiş: <span className="font-medium">{formatDate(selectedAd.end_date)}</span></div>
                    <div>Oluşturulma: <span className="font-medium">{formatDate(selectedAd.created_at)}</span></div>
                  </div>
                </div>
              </div>
              {selectedAd.keywords && selectedAd.keywords.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Anahtar Kelimeler</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAd.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reklamı Düzenle</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reklam Başlığı
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Reklam başlığını girin"
                  aria-label="Reklam Başlığı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reklam Türü
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newDailyRate = BillingService.getDailyRate(newType);
                      setEditForm({ 
                        ...editForm, 
                        type: newType, 
                        budget: newDailyRate.toString() 
                      });
                    }}
                    aria-label="Reklam Türü"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="banner">Banner</option>
                    <option value="video">Video</option>
                    <option value="text">Metin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hedef Kitle
                  </label>
                  <select
                    value={editForm.targetRole}
                    onChange={(e) => setEditForm({ ...editForm, targetRole: e.target.value })}
                    aria-label="Hedef Kitle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tümü">Tümü</option>
                    <option value="Nakliyeci">Nakliyeci</option>
                    <option value="Yük Sahibi">Yük Sahibi</option>
                    <option value="Alıcı/Satıcı">Alıcı/Satıcı</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Bütçe (₺)
                  </label>
                  <input
                    type="number"
                    value={editForm.budget || BillingService.getDailyRate(editForm.type)}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={BillingService.getDailyRate(editForm.type)}
                    placeholder={`Minimum: ${BillingService.getDailyRate(editForm.type)} TL`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yerleşim
                  </label>
                  <select
                    value={editForm.placement}
                    onChange={(e) => setEditForm({ ...editForm, placement: e.target.value })}
                    aria-label="Yerleşim"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="homepage">Ana Sayfa</option>
                    <option value="sidebar">Yan Bar</option>
                    <option value="search">Arama Sonuçları</option>
                    <option value="listings">İlan Listesi</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reklam Medyası
                </label>
                <MediaUploader
                  adId={selectedAd.id.toString()}
                  currentMediaUrl={editForm.mediaUrl}
                  acceptVideo={editForm.type === 'video'}
                  onUploadSuccess={(url) => setEditForm({ ...editForm, mediaUrl: url })}
                  onUploadError={(error) => setInfoMessage(error)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  placeholder="Reklam açıklamasını girin"
                  aria-label="Açıklama"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Reklam Oluştur</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              await handleCreateAd();
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reklam Başlığı
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reklam başlığınızı girin"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reklam Türü
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="banner">Banner</option>
                    <option value="video">Video</option>
                    <option value="text">Metin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hedef Kitle
                  </label>
                  <select
                    value={editForm.targetRole}
                    onChange={(e) => setEditForm({ ...editForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Tümü">Tümü</option>
                    <option value="Nakliyeci">Nakliyeci</option>
                    <option value="Yük Sahibi">Yük Sahibi</option>
                    <option value="Alıcı/Satıcı">Alıcı/Satıcı</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Bütçe (₺)
                  </label>
                  <input
                    type="number"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Günlük bütçe"
                    min="10"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yerleşim
                  </label>
                  <select
                    value={editForm.placement}
                    onChange={(e) => setEditForm({ ...editForm, placement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="homepage">Ana Sayfa</option>
                    <option value="sidebar">Yan Bar</option>
                    <option value="search">Arama Sonuçları</option>
                    <option value="listings">İlan Listesi</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reklam Medyası
                </label>
                <MediaUploader
                  adId="new"
                  currentMediaUrl={editForm.mediaUrl}
                  acceptVideo={editForm.type === 'video'}
                  onUploadSuccess={(url) => setEditForm({ ...editForm, mediaUrl: url })}
                  onUploadError={(error) => setInfoMessage(error)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reklam açıklaması"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdsSection;
