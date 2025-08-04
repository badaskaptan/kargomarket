import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ServiceOfferService } from '../../../../services/serviceOfferService';
import { useAuth } from '../../../../context/SupabaseAuthContext';
import type { ExtendedServiceOffer } from '../../../../types/service-offer-types';

interface EditServiceOfferModalProps {
  offer: ExtendedServiceOffer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditServiceOfferModal: React.FC<EditServiceOfferModalProps> = ({ offer, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    price_amount: offer.price_amount?.toString() || '',
    price_currency: offer.price_currency || 'TRY',
    price_per: offer.price_per || 'total',
    message: offer.message || '',
    payment_terms: offer.payment_terms || '',
    payment_method: offer.payment_method || '',
    expires_at: offer.expires_at ? offer.expires_at.split('T')[0] : '',
    transport_mode: offer.transport_mode || '',
    cargo_type: offer.cargo_type || '',
    service_scope: offer.service_scope || '',
    pickup_date_preferred: offer.pickup_date_preferred ? offer.pickup_date_preferred.split('T')[0] : '',
    delivery_date_preferred: offer.delivery_date_preferred ? offer.delivery_date_preferred.split('T')[0] : '',
    transit_time_estimate: offer.transit_time_estimate || '',
    contact_person: offer.contact_person || '',
    contact_phone: offer.contact_phone || '',
    customs_handling_included: offer.customs_handling_included || false,
    documentation_handling_included: offer.documentation_handling_included || false,
    loading_unloading_included: offer.loading_unloading_included || false,
    tracking_system_provided: offer.tracking_system_provided || false,
    express_service: offer.express_service || false,
    weekend_service: offer.weekend_service || false,
    fuel_surcharge_included: offer.fuel_surcharge_included || false,
    toll_fees_included: offer.toll_fees_included || false,
    port_charges_included: offer.port_charges_included || false,
    airport_charges_included: offer.airport_charges_included || false,
    on_time_guarantee: offer.on_time_guarantee || false,
    damage_free_guarantee: offer.damage_free_guarantee || false,
    temperature_guarantee: offer.temperature_guarantee || false,
    emergency_contact: offer.emergency_contact || '',
    contingency_plan: offer.contingency_plan || '',
    cargo_weight: offer.cargo_weight?.toString() || '',
    cargo_weight_unit: offer.cargo_weight_unit || 'kg',
    cargo_volume: offer.cargo_volume?.toString() || '',
    cargo_volume_unit: offer.cargo_volume_unit || 'm3',
    insurance_company: offer.insurance_company || '',
    insurance_policy_number: offer.insurance_policy_number || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // 1: Temel Bilgiler, 2: Kapasite & Ekler

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.price_amount || parseFloat(formData.price_amount) <= 0) {
      newErrors.price_amount = 'Geçerli bir fiyat giriniz';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Teklif mesajı giriniz';
    }
    if (!formData.price_currency) {
      newErrors.price_currency = 'Para birimi seçiniz';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!user) {
      alert('Düzenleme için giriş yapmalısınız');
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await ServiceOfferService.updateServiceOffer(offer.id, {
        price_amount: parseFloat(formData.price_amount),
        price_currency: formData.price_currency,
        price_per: formData.price_per,
        message: formData.message.trim(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        transport_mode: formData.transport_mode,
        cargo_type: formData.cargo_type,
        service_scope: formData.service_scope,
        pickup_date_preferred: formData.pickup_date_preferred ? new Date(formData.pickup_date_preferred).toISOString() : null,
        delivery_date_preferred: formData.delivery_date_preferred ? new Date(formData.delivery_date_preferred).toISOString() : null,
        transit_time_estimate: formData.transit_time_estimate,
        customs_handling_included: formData.customs_handling_included,
        documentation_handling_included: formData.documentation_handling_included,
        loading_unloading_included: formData.loading_unloading_included,
        tracking_system_provided: formData.tracking_system_provided,
        express_service: formData.express_service,
        weekend_service: formData.weekend_service,
        fuel_surcharge_included: formData.fuel_surcharge_included,
        toll_fees_included: formData.toll_fees_included,
        port_charges_included: formData.port_charges_included,
        airport_charges_included: formData.airport_charges_included,
        on_time_guarantee: formData.on_time_guarantee,
        damage_free_guarantee: formData.damage_free_guarantee,
        temperature_guarantee: formData.temperature_guarantee,
        cargo_weight: formData.cargo_weight ? parseFloat(formData.cargo_weight) : null,
        cargo_weight_unit: formData.cargo_weight_unit,
        cargo_volume: formData.cargo_volume ? parseFloat(formData.cargo_volume) : null,
        cargo_volume_unit: formData.cargo_volume_unit,
        insurance_company: formData.insurance_company,
        insurance_policy_number: formData.insurance_policy_number
      });
      alert('Teklif başarıyla güncellendi!');
      onClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Teklif güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between pb-4 border-b mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nakliye Hizmeti Teklifi Düzenle</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" title="Kapat">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            {step === 1 && (
              <>
                {/* TEMEL BİLGİLER */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teklif Tutarı *</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" step="0.01" value={formData.price_amount} onChange={e => updateFormData('price_amount', e.target.value)} className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.price_amount ? 'border-red-300' : 'border-gray-300'}`} placeholder="0,00" title="Teklif Tutarı" aria-label="Teklif Tutarı" />
                    <select value={formData.price_currency} onChange={e => updateFormData('price_currency', e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" aria-label="Para birimi seçin" title="Para Birimi">
                      <option value="TRY">₺ TRY</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                    <select value={formData.price_per} onChange={e => updateFormData('price_per', e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" aria-label="Fiyatlandırma tipi" title="Fiyatlandırma Tipi">
                      <option value="total">Toplam</option>
                      <option value="per_km">Km Başına</option>
                      <option value="per_ton">Ton Başına</option>
                      <option value="per_ton_km">Ton-Km Başına</option>
                      <option value="per_pallet">Palet Başına</option>
                      <option value="per_hour">Saat Başına</option>
                      <option value="per_day">Gün Başına</option>
                      <option value="per_container">Konteyner Başına</option>
                      <option value="per_teu">TEU Başına</option>
                      <option value="per_cbm">CBM Başına</option>
                      <option value="per_piece">Parça Başına</option>
                      <option value="per_vehicle">Araç Başına</option>
                    </select>
                  </div>
                  {errors.price_amount && <p className="mt-1 text-sm text-red-600">{errors.price_amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teklif Mesajı *</label>
                  <textarea rows={3} value={formData.message} onChange={e => updateFormData('message', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${errors.message ? 'border-red-300' : 'border-gray-300'}`} placeholder="Teklif detayları..." title="Teklif Mesajı" aria-label="Teklif Mesajı" />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Şartları</label>
                    <input type="text" value={formData.payment_terms} onChange={e => updateFormData('payment_terms', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Örn: Hizmet sonrası, 30 gün vadeli" title="Ödeme Şartları" aria-label="Ödeme Şartları" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                    <input type="text" value={formData.payment_method} onChange={e => updateFormData('payment_method', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Örn: Banka havalesi" title="Ödeme Yöntemi" aria-label="Ödeme Yöntemi" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Son Geçerlilik Tarihi</label>
                  <input type="date" value={formData.expires_at} onChange={e => updateFormData('expires_at', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Son Geçerlilik Tarihi" aria-label="Son Geçerlilik Tarihi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taşıma Modu</label>
                    <select value={formData.transport_mode} onChange={e => updateFormData('transport_mode', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Taşıma Modu" aria-label="Taşıma Modu">
                      <option value="">Seçiniz</option>
                      <option value="road">Karayolu</option>
                      <option value="sea">Denizyolu</option>
                      <option value="air">Havayolu</option>
                      <option value="rail">Demiryolu</option>
                      <option value="multimodal">Multimodal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yük Tipi</label>
                    <select value={formData.cargo_type} onChange={e => updateFormData('cargo_type', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Yük Tipi" aria-label="Yük Tipi">
                      <option value="">Seçiniz</option>
                      <option value="general_cargo">Genel Yük</option>
                      <option value="bulk_cargo">Dökme Yük</option>
                      <option value="container">Konteyner</option>
                      <option value="liquid">Sıvı</option>
                      <option value="dry_bulk">Kuru Dökme</option>
                      <option value="refrigerated">Soğutmalı</option>
                      <option value="hazardous">Tehlikeli</option>
                      <option value="oversized">Ağır/Ölçü Dışı</option>
                      <option value="project_cargo">Proje Yükü</option>
                      <option value="livestock">Canlı Hayvan</option>
                      <option value="vehicles">Araç</option>
                      <option value="machinery">Makine</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hizmet Kapsamı</label>
                    <select value={formData.service_scope} onChange={e => updateFormData('service_scope', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Hizmet Kapsamı" aria-label="Hizmet Kapsamı">
                      <option value="">Seçiniz</option>
                      <option value="door_to_door">Kapıdan Kapıya</option>
                      <option value="port_to_port">Liman-Liman</option>
                      <option value="terminal_to_terminal">Terminal-Terminal</option>
                      <option value="warehouse_to_warehouse">Depodan Depoya</option>
                      <option value="pickup_only">Sadece Alım</option>
                      <option value="delivery_only">Sadece Teslim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahmini Transit Süre</label>
                    <input type="text" value={formData.transit_time_estimate} onChange={e => updateFormData('transit_time_estimate', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="örn: 2-3 gün, 1 hafta" title="Tahmini Transit Süre" aria-label="Tahmini Transit Süre" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alım Tarihi (Tercih)</label>
                    <input type="date" value={formData.pickup_date_preferred} onChange={e => updateFormData('pickup_date_preferred', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Alım Tarihi (Tercih)" aria-label="Alım Tarihi (Tercih)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teslim Tarihi (Tercih)</label>
                    <input type="date" value={formData.delivery_date_preferred} onChange={e => updateFormData('delivery_date_preferred', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Teslim Tarihi (Tercih)" aria-label="Teslim Tarihi (Tercih)" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İletişim Kişisi</label>
                    <input type="text" value={formData.contact_person} onChange={e => updateFormData('contact_person', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Ad Soyad" title="İletişim Kişisi" aria-label="İletişim Kişisi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İletişim Telefonu</label>
                    <input type="tel" value={formData.contact_phone} onChange={e => updateFormData('contact_phone', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-orange-500" placeholder="Telefon" title="İletişim Telefonu" aria-label="İletişim Telefonu" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Acil Durum İletişimi</label>
                    <input type="text" value={formData.emergency_contact} onChange={e => updateFormData('emergency_contact', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Acil iletişim" title="Acil Durum İletişimi" aria-label="Acil Durum İletişimi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternatif Plan</label>
                    <input type="text" value={formData.contingency_plan} onChange={e => updateFormData('contingency_plan', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Alternatif plan" title="Alternatif Plan" aria-label="Alternatif Plan" />
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                {/* KAPASİTE, SİGORTA, EK HİZMETLER */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Ağırlığı</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="0.01" value={formData.cargo_weight} onChange={e => updateFormData('cargo_weight', e.target.value)} className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Örn: 1500" title="Kargo Ağırlığı" aria-label="Kargo Ağırlığı" />
                      <select value={formData.cargo_weight_unit} onChange={e => updateFormData('cargo_weight_unit', e.target.value)} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Ağırlık Birimi" aria-label="Ağırlık Birimi">
                        <option value="kg">kg</option>
                        <option value="ton">ton</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Hacmi</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="0.001" value={formData.cargo_volume} onChange={e => updateFormData('cargo_volume', e.target.value)} className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Örn: 25" title="Kargo Hacmi" aria-label="Kargo Hacmi" />
                      <select value={formData.cargo_volume_unit} onChange={e => updateFormData('cargo_volume_unit', e.target.value)} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" title="Hacim Birimi" aria-label="Hacim Birimi">
                        <option value="m3">m³</option>
                        <option value="ft3">ft³</option>
                        <option value="l">l</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigorta Şirketi</label>
                    <input type="text" value={formData.insurance_company} onChange={e => updateFormData('insurance_company', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Örn: Allianz, Axa" title="Sigorta Şirketi" aria-label="Sigorta Şirketi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigorta Poliçe No</label>
                    <input type="text" value={formData.insurance_policy_number} onChange={e => updateFormData('insurance_policy_number', e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Poliçe numarası" title="Sigorta Poliçe No" aria-label="Sigorta Poliçe No" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.customs_handling_included} onChange={e => updateFormData('customs_handling_included', e.target.checked)} title="Gümrük Dahil" aria-label="Gümrük Dahil" />
                    <label className="text-sm">Gümrük Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.documentation_handling_included} onChange={e => updateFormData('documentation_handling_included', e.target.checked)} title="Evrak Dahil" aria-label="Evrak Dahil" />
                    <label className="text-sm">Evrak Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.loading_unloading_included} onChange={e => updateFormData('loading_unloading_included', e.target.checked)} title="Yükleme/Boşaltma Dahil" aria-label="Yükleme/Boşaltma Dahil" />
                    <label className="text-sm">Yükleme/Boşaltma Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.tracking_system_provided} onChange={e => updateFormData('tracking_system_provided', e.target.checked)} title="Canlı Takip" aria-label="Canlı Takip" />
                    <label className="text-sm">Canlı Takip</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.express_service} onChange={e => updateFormData('express_service', e.target.checked)} title="Ekspres Servis" aria-label="Ekspres Servis" />
                    <label className="text-sm">Ekspres Servis</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.weekend_service} onChange={e => updateFormData('weekend_service', e.target.checked)} title="Hafta Sonu Servisi" aria-label="Hafta Sonu Servisi" />
                    <label className="text-sm">Hafta Sonu Servisi</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.fuel_surcharge_included} onChange={e => updateFormData('fuel_surcharge_included', e.target.checked)} title="Yakıt Dahil" aria-label="Yakıt Dahil" />
                    <label className="text-sm">Yakıt Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.toll_fees_included} onChange={e => updateFormData('toll_fees_included', e.target.checked)} title="Köprü/Otoyol Dahil" aria-label="Köprü/Otoyol Dahil" />
                    <label className="text-sm">Köprü/Otoyol Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.port_charges_included} onChange={e => updateFormData('port_charges_included', e.target.checked)} title="Liman Ücretleri Dahil" aria-label="Liman Ücretleri Dahil" />
                    <label className="text-sm">Liman Ücretleri Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.airport_charges_included} onChange={e => updateFormData('airport_charges_included', e.target.checked)} title="Havalimanı Ücretleri Dahil" aria-label="Havalimanı Ücretleri Dahil" />
                    <label className="text-sm">Havalimanı Ücretleri Dahil</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.on_time_guarantee} onChange={e => updateFormData('on_time_guarantee', e.target.checked)} title="Zamanında Teslim Garantisi" aria-label="Zamanında Teslim Garantisi" />
                    <label className="text-sm">Zamanında Teslim Garantisi</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.damage_free_guarantee} onChange={e => updateFormData('damage_free_guarantee', e.target.checked)} title="Hasarsız Teslim Garantisi" aria-label="Hasarsız Teslim Garantisi" />
                    <label className="text-sm">Hasarsız Teslim Garantisi</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.temperature_guarantee} onChange={e => updateFormData('temperature_guarantee', e.target.checked)} title="Sıcaklık Garantisi" aria-label="Sıcaklık Garantisi" />
                    <label className="text-sm">Sıcaklık Garantisi</label>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => setStep(step - 1)}>
                  Geri
                </button>
              ) : <span />}
              {step < 2 ? (
                <button type="button" className="px-4 py-2 bg-orange-600 text-white rounded-lg" onClick={() => setStep(step + 1)}>
                  İleri
                </button>
              ) : (
                <button type="button" disabled={isSubmitting} onClick={handleUpdate} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Teklifi Güncelle</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditServiceOfferModal;
