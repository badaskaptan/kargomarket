import React, { useState } from 'react';
import { Edit, Lock, User, Mail, Phone, Calendar, Building, MapPin, Star, X, Globe } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';

type ProfileWithWebsite = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  user_type: 'buyer_seller' | 'carrier' | 'both';
  company_name?: string;
  tax_office?: string;
  tax_number?: string;
  address?: string;
  website?: string;
  [key: string]: unknown;
};

const ProfileSection: React.FC = () => {
  const { profile, updateProfile } = useAuth() as { profile: ProfileWithWebsite; updateProfile: (data: Partial<ProfileWithWebsite>) => Promise<void> };
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [buyerRole, setBuyerRole] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    tax_office: profile?.tax_office || '',
    tax_number: profile?.tax_number || '',
    address: profile?.address || '',
    website: profile?.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD-MM-YYYY)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    // Eğer ISO tarih formatındaysa (YYYY-MM-DDTHH:mm:ss), sadece tarih kısmını al
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}-${month}-${year}`;
    }
    
    // Eğer tarih YYYY-MM-DD formatındaysa, DD-MM-YYYY'ye çevir
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);
    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year}`;
    }
    
    // Fallback: Date objesini kullan
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  React.useEffect(() => {
    setForm({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      company_name: profile?.company_name || '',
      tax_office: profile?.tax_office || '',
      tax_number: profile?.tax_number || '',
      address: profile?.address || '',
      website: profile?.website || '',
    });
  }, [profile, editOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(form);
      setEditOpen(false);
    } catch (err: unknown) {
      let msg = 'Profil güncellenemedi.';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        msg = (err as { message: string }).message;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!passwordForm.new || passwordForm.new.length < 8) {
      setPasswordError('Yeni şifre en az 8 karakter olmalı.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setPasswordLoading(true);
    // Supabase password update
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess('Şifre başarıyla değiştirildi.');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordOpen(false), 1500);
    }
    setPasswordLoading(false);
  };

  const stats: { label: string; value: string | number; icon: React.ElementType; color: string }[] = [
    {
      label: 'Toplam İlan',
      value: profile?.total_listings !== undefined && profile?.total_listings !== null ? String(profile.total_listings) : '-',
      icon: Building,
      color: 'blue'
    },
    {
      label: 'Toplam Teklif',
      value: profile?.total_offers !== undefined && profile?.total_offers !== null ? String(profile.total_offers) : '-',
      icon: Star,
      color: 'green'
    },
    {
      label: 'Tamamlanan',
      value: profile?.total_completed_transactions !== undefined && profile?.total_completed_transactions !== null ? String(profile.total_completed_transactions) : '-',
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Ortalama Puan',
      value:
        typeof profile?.rating === 'number'
          ? profile.rating.toFixed(1)
          : '-',
      icon: Star,
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Şifre Değiştir Modalı */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Kapat"
              onClick={() => setPasswordOpen(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-900">Şifre Değiştir</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                <input
                  name="current"
                  type="password"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                  placeholder="Mevcut şifreniz"
                  title="Mevcut Şifre"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  autoComplete="current-password"
                  disabled
                />
                <span className="text-xs text-gray-400">(Supabase ile mevcut şifre doğrulaması zorunlu değildir.)</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                <input
                  name="new"
                  type="password"
                  value={passwordForm.new}
                  onChange={handlePasswordChange}
                  placeholder="Yeni şifreniz"
                  title="Yeni Şifre"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                <input
                  name="confirm"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Yeni şifre tekrar"
                  title="Yeni Şifre Tekrar"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setPasswordOpen(false)}
                  disabled={passwordLoading}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profil Düzenle Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Kapat"
              onClick={() => setEditOpen(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-900">Profili Düzenle</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleFormChange}
                  required
                  placeholder="Ad Soyad"
                  title="Ad Soyad"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="E-posta"
                  title="E-posta"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled
                />
                <span className="text-xs text-gray-400">E-posta değiştirilemez.</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Telefon"
                  title="Telefon"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
                <input
                  name="company_name"
                  type="text"
                  value={form.company_name}
                  onChange={handleFormChange}
                  placeholder="Firma Adı"
                  title="Firma Adı"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                  <input
                    name="tax_office"
                    type="text"
                    value={form.tax_office}
                    onChange={handleFormChange}
                    placeholder="Vergi Dairesi"
                    title="Vergi Dairesi"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No</label>
                  <input
                    name="tax_number"
                    type="text"
                    value={form.tax_number}
                    onChange={handleFormChange}
                    placeholder="Vergi No"
                    title="Vergi No"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Adres"
                  title="Adres"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                <input
                  name="website"
                  type="text"
                  value={form.website}
                  onChange={handleFormChange}
                  placeholder="firmawebsitesi.com veya tam adres"
                  title="Web Sitesi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-xs text-gray-400">Başında http:// veya https:// yazmak zorunda değilsiniz.</span>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profilim</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg">
                  <User size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile?.full_name || 'Kullanıcı'}
                </h3>
                <p className="text-gray-600 mb-4">{profile?.email || 'Email yükleniyor...'}</p>
                <div className="w-full space-y-3">
                  <button
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                    onClick={() => setEditOpen(true)}
                    aria-label="Profili Düzenle"
                  >
                    <Edit size={16} className="mr-2" />
                    <span>Profili Düzenle</span>
                  </button>
                  <button
                    className="w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setPasswordOpen(true)}
                    aria-label="Şifre Değiştir"
                  >
                    <Lock size={16} className="mr-2" />
                    <span>Şifre Değiştir</span>
                  </button>
                </div>
              </div>

              {/* Roles */}
              <div className="mt-6 pt-6 border-t border-primary-200">
                <h4 className="font-medium mb-3 text-gray-900">Roller</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700" id="role-buyer-label">Alıcı/Satıcı</span>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="role-buyer-checkbox">
                      <input
                        type="checkbox"
                        id="role-buyer-checkbox"
                        aria-labelledby="role-buyer-label"
                        checked={buyerRole}
                        onChange={(e) => setBuyerRole(e.target.checked)}
                        className="sr-only peer"
                        title="Alıcı/Satıcı rolünü seç"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mt-6 pt-6 border-t border-primary-200">
                <h4 className="font-medium mb-3 text-gray-900">Bildirim Tercihleri</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700" id="notif-email-label">E-posta Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="notif-email-checkbox">
                      <input
                        type="checkbox"
                        id="notif-email-checkbox"
                        aria-labelledby="notif-email-label"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                        title="E-posta bildirimlerini aç/kapat"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700" id="notif-sms-label">SMS Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="notif-sms-checkbox">
                      <input
                        type="checkbox"
                        id="notif-sms-checkbox"
                        aria-labelledby="notif-sms-label"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="sr-only peer"
                        title="SMS bildirimlerini aç/kapat"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700" id="notif-offer-label">Yeni Teklif Bildirimleri</span>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="notif-offer-checkbox">
                      <input
                        type="checkbox"
                        id="notif-offer-checkbox"
                        aria-labelledby="notif-offer-label"
                        checked={offerNotifications}
                        onChange={(e) => setOfferNotifications(e.target.checked)}
                        className="sr-only peer"
                        title="Yeni teklif bildirimlerini aç/kapat"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 text-primary-600" size={20} />
                Kişisel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium text-gray-900">
                      {profile?.full_name || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium text-gray-900">{profile?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900">{profile?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Üyelik Tarihi</p>
                    <p className="font-medium text-gray-900">{formatDate(profile?.created_at || null)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 text-primary-600" size={20} />
                Firma Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Firma Adı</p>
                    <p className="font-medium text-gray-900">{profile?.company_name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Vergi Dairesi</p>
                    <p className="font-medium text-gray-900">{profile?.tax_office || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Vergi No</p>
                    <p className="font-medium text-gray-900">{profile?.tax_number || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="font-medium text-gray-900">{profile?.address || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Globe className="mr-3 text-gray-400" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Web Sitesi</p>
                    {profile?.website ? (
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                         target="_blank" rel="noopener noreferrer"
                         className="font-medium text-primary-700 hover:underline break-all">
                        {profile.website}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-900">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="mr-2 text-primary-600" size={20} />
                Hesap İstatistikleri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 card-hover">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className={`w-8 h-8 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center`}>
                        <stat.icon size={16} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{String(stat.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;