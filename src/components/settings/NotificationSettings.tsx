import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNotificationPreferences } from '../../hooks/useEmailNotifications';
import { useAuth } from '../../context/AuthContext';

interface NotificationPreferences {
  email_notifications: boolean;
  new_ad_notifications: boolean;
  new_message_notifications: boolean;
  new_offer_notifications: boolean;
  newsletter_notifications: boolean;
  system_notifications: boolean;
  notification_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  preferred_notification_time: string;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { getPreferences, updatePreferences } = useNotificationPreferences();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    new_ad_notifications: true,
    new_message_notifications: true,
    new_offer_notifications: true,
    newsletter_notifications: true,
    system_notifications: true,
    notification_frequency: 'instant',
    preferred_notification_time: '09:00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Kullanıcının mevcut tercihlerini yükle
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const prefs = await getPreferences(user.id);
      setPreferences({
        email_notifications: prefs.email_notifications ?? true,
        new_ad_notifications: prefs.new_ad_notifications ?? true,
        new_message_notifications: prefs.new_message_notifications ?? true,
        new_offer_notifications: prefs.new_offer_notifications ?? true,
        newsletter_notifications: prefs.newsletter_notifications ?? true,
        system_notifications: prefs.system_notifications ?? true,
        notification_frequency: prefs.notification_frequency ?? 'instant',
        preferred_notification_time: prefs.preferred_notification_time ?? '09:00'
      });
    } catch (error) {
      console.error('Tercihler yüklenirken hata:', error);
      setMessage({ type: 'error', text: 'Bildirim tercihleri yüklenirken hata oluştu.' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await updatePreferences(user.id, preferences);
      setMessage({ type: 'success', text: 'Bildirim tercihleri başarıyla güncellendi!' });
      
      // Başarı mesajını 3 saniye sonra temizle
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Tercihler güncellenirken hata:', error);
      setMessage({ type: 'error', text: 'Bildirim tercihleri güncellenirken hata oluştu.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Bildirim tercihleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h2>
              <p className="text-gray-600 mt-1">Email bildirimlerinizi ve tercihlerinizi yönetin</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check size={20} className="mr-3" />
              ) : (
                <AlertCircle size={20} className="mr-3" />
              )}
              <span>{message.text}</span>
            </div>
            <button 
              onClick={() => setMessage(null)}
              className="text-current hover:opacity-70"
              aria-label="Mesajı kapat"
              title="Mesajı kapat"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Master Email Toggle */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Bildirimleri</h3>
                  <p className="text-gray-600">Tüm email bildirimlerini etkinleştir/devre dışı bırak</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => handleToggle('email_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Email bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div className={`space-y-6 ${!preferences.email_notifications ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Bildirim Türleri
            </h3>

            {/* New Ad Notifications */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Yeni İlan Bildirimleri</h4>
                  <p className="text-sm text-gray-600">Kriterlerinize uygun yeni ilanlar yayınlandığında email alın</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.new_ad_notifications}
                  onChange={(e) => handleToggle('new_ad_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Yeni ilan bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* New Message Notifications */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Yeni Mesaj Bildirimleri</h4>
                  <p className="text-sm text-gray-600">Size yeni mesaj geldiğinde email ile bilgilendirilir</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.new_message_notifications}
                  onChange={(e) => handleToggle('new_message_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Yeni mesaj bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* New Offer Notifications */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Yeni Teklif Bildirimleri</h4>
                  <p className="text-sm text-gray-600">İlanlarınız için teklif geldiğinde email alın</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.new_offer_notifications}
                  onChange={(e) => handleToggle('new_offer_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Yeni teklif bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Newsletter Notifications */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Haftalık Bülten</h4>
                  <p className="text-sm text-gray-600">Haftalık özetler, yeni özellikler ve fırsatlar</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.newsletter_notifications}
                  onChange={(e) => handleToggle('newsletter_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Haftalık bülten bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* System Notifications */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Sistem Bildirimleri</h4>
                  <p className="text-sm text-gray-600">Önemli sistem güncellemeleri ve duyurular</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.system_notifications}
                  onChange={(e) => handleToggle('system_notifications', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Sistem bildirimlerini etkinleştir"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Frequency and Timing */}
          <div className={`space-y-6 border-t border-gray-200 pt-6 ${!preferences.email_notifications ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Bildirim Sıklığı
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bildirim Sıklığı
                </label>
                <select
                  value={preferences.notification_frequency}
                  onChange={(e) => handleToggle('notification_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Bildirim sıklığı seçin"
                >
                  <option value="instant">Anında</option>
                  <option value="daily">Günlük Özet</option>
                  <option value="weekly">Haftalık Özet</option>
                  <option value="never">Hiçbir Zaman</option>
                </select>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tercih Edilen Saat (Özet bildirimleri için)
                </label>
                <input
                  type="time"
                  value={preferences.preferred_notification_time}
                  onChange={(e) => handleToggle('preferred_notification_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Tercih edilen bildirim saati"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving || !preferences.email_notifications}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
