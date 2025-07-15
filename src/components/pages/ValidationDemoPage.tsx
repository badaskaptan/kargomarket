import React, { useState } from 'react';
import { 
  ValidatedTextInput, 
  ValidatedNumberInput, 
  ValidatedEmailInput, 
  ValidatedPhoneInput, 
  ValidatedTextarea 
} from '../common/ValidatedInput';

export const ValidationDemoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    contact_person: '',
    origin: '',
    destination: '',
    weight: 0,
    volume: 0,
    price: 0,
    phone: '',
    email: '',
    imo_number: '',
    mmsi_number: '',
    plate_number: '',
  });
  
  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({});
  
  const handleChange = (field: string) => (value: string | number, isValid: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationStates(prev => ({ ...prev, [field]: isValid }));
  };
  
  const isFormValid = Object.values(validationStates).every(isValid => isValid);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Form submitted:', formData);
      alert('Form başarıyla gönderildi!');
    } else {
      alert('Lütfen tüm alanları doğru şekilde doldurun.');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Validasyon Sistemi Demo</h1>
        <p className="text-gray-600">
          Bu demo sayfası, karakter ve sayı sınırlaması olan form alanlarını gösterir.
          Her alan için gerçek zamanlı validasyon ve kullanıcı dostu uyarılar sunulur.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedTextInput
              fieldName="title"
              value={formData.title}
              onChange={handleChange('title')}
              label="İlan Başlığı"
              placeholder="Örn: İstanbul - Ankara Nakliye Hizmeti"
              required
            />
            
            <ValidatedTextInput
              fieldName="company_name"
              value={formData.company_name}
              onChange={handleChange('company_name')}
              label="Şirket Adı"
              placeholder="Şirket adınızı girin"
              required
            />
          </div>
          
          <div className="mt-4">
            <ValidatedTextarea
              fieldName="description"
              value={formData.description}
              onChange={handleChange('description')}
              label="Açıklama"
              placeholder="Hizmet detaylarını açıklayın..."
              required
              rows={4}
            />
          </div>
        </div>
        
        {/* Lokasyon Bilgileri */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lokasyon Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedTextInput
              fieldName="origin"
              value={formData.origin}
              onChange={handleChange('origin')}
              label="Çıkış Noktası"
              placeholder="Şehir, bölge veya adres"
              required
            />
            
            <ValidatedTextInput
              fieldName="destination"
              value={formData.destination}
              onChange={handleChange('destination')}
              label="Varış Noktası"
              placeholder="Şehir, bölge veya adres"
              required
            />
          </div>
        </div>
        
        {/* Sayısal Bilgiler */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kapasite ve Fiyat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ValidatedNumberInput
              fieldName="weight"
              value={formData.weight}
              onChange={handleChange('weight')}
              label="Ağırlık (kg)"
              placeholder="0"
              required
            />
            
            <ValidatedNumberInput
              fieldName="volume"
              value={formData.volume}
              onChange={handleChange('volume')}
              label="Hacim (m³)"
              placeholder="0"
              required
            />
            
            <ValidatedNumberInput
              fieldName="price"
              value={formData.price}
              onChange={handleChange('price')}
              label="Fiyat (₺)"
              placeholder="0"
              required
            />
          </div>
        </div>
        
        {/* İletişim Bilgileri */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedTextInput
              fieldName="contact_person"
              value={formData.contact_person}
              onChange={handleChange('contact_person')}
              label="İletişim Kişisi"
              placeholder="Ad Soyad"
              required
            />
            
            <ValidatedPhoneInput
              fieldName="phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              label="Telefon"
              placeholder="05XX XXX XX XX"
              required
            />
          </div>
          
          <div className="mt-4">
            <ValidatedEmailInput
              fieldName="email"
              value={formData.email}
              onChange={handleChange('email')}
              label="E-posta"
              placeholder="ornek@email.com"
              required
            />
          </div>
        </div>
        
        {/* Özel Formatlar */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Özel Format Alanları</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ValidatedTextInput
              fieldName="plate_number"
              value={formData.plate_number}
              onChange={handleChange('plate_number')}
              label="Plaka Numarası"
              placeholder="34 ABC 1234"
            />
            
            <ValidatedTextInput
              fieldName="imo_number"
              value={formData.imo_number}
              onChange={handleChange('imo_number')}
              label="IMO Numarası"
              placeholder="IMO 1234567"
            />
            
            <ValidatedTextInput
              fieldName="mmsi_number"
              value={formData.mmsi_number}
              onChange={handleChange('mmsi_number')}
              label="MMSI Numarası"
              placeholder="123456789"
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Form Durumu: {isFormValid ? (
              <span className="text-green-600 font-medium">✓ Tüm alanlar geçerli</span>
            ) : (
              <span className="text-red-600 font-medium">⚠ Bazı alanlar eksik veya hatalı</span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isFormValid
                ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Formu Gönder
          </button>
        </div>
      </form>
      
      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Bilgileri:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Form Verileri:</h4>
            <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Validasyon Durumları:</h4>
            <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(validationStates, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationDemoPage;
