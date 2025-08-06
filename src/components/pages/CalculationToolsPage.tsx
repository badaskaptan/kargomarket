import React, { useState } from 'react';
import { 
  Calculator, 
  Truck,
  Package,
  DollarSign,
  ArrowLeft,
  Info,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CalculationToolsPageProps {
  setActivePage?: (page: string) => void;
}

const CalculationToolsPage: React.FC<CalculationToolsPageProps> = ({ setActivePage }) => {
  const [activeCalculator, setActiveCalculator] = useState<'volume' | 'freight' | 'customs' | 'container'>('volume');
  
  // Hacim Hesaplama
  const [volumeData, setVolumeData] = useState({
    length: '',
    width: '',
    height: '',
    weight: '',
    quantity: '1'
  });
  const [volumeResult, setVolumeResult] = useState<{
    volume: number;
    volumeWeight: number;
    chargeableWeight: number;
    category: string;
  } | null>(null);

  // Navlun Hesaplama
  const [freightData, setFreightData] = useState({
    origin: '',
    destination: '',
    transportMode: 'road',
    cargoType: 'general',
    weight: '',
    volume: '',
    distance: ''
  });
  const [freightResult, setFreightResult] = useState<{
    baseCost: number;
    fuelSurcharge: number;
    insurance: number;
    totalCost: number;
    perKm: number;
    perTon: number;
  } | null>(null);

  // Gümrük Vergisi Hesaplama
  const [customsData, setCustomsData] = useState({
    value: '',
    hsCode: '',
    origin: '',
    tariffRate: '18',
    vatRate: '18'
  });
  const [customsResult, setCustomsResult] = useState<{
    customsDuty: number;
    vat: number;
    totalTax: number;
    totalCost: number;
  } | null>(null);

  // Konteyner Doluluk Hesaplama
  const [containerData, setContainerData] = useState({
    containerType: '20ft',
    packageLength: '',
    packageWidth: '',
    packageHeight: '',
    packageWeight: '',
    packageQuantity: '1'
  });
  const [containerResult, setContainerResult] = useState<{
    usedVolume: number;
    usedWeight: number;
    volumeUtilization: number;
    weightUtilization: number;
    remainingVolume: number;
    remainingWeight: number;
    efficiency: string;
  } | null>(null);

  const calculatorOptions = [
    { 
      id: 'volume', 
      name: 'Hacim & Ağırlık', 
      icon: Package, 
      description: 'Yük hacmi ve tarifeli ağırlık hesaplama',
      color: 'bg-blue-500'
    },
    { 
      id: 'freight', 
      name: 'Navlun Hesaplama', 
      icon: Truck, 
      description: 'Taşıma maliyeti ve navlun hesaplama',
      color: 'bg-green-500'
    },
    { 
      id: 'customs', 
      name: 'Gümrük Vergisi', 
      icon: DollarSign, 
      description: 'Gümrük vergi ve harç hesaplama',
      color: 'bg-purple-500'
    },
    { 
      id: 'container', 
      name: 'Konteyner Doluluk', 
      icon: BarChart3, 
      description: 'Konteyner kapasitesi ve doluluk oranı',
      color: 'bg-orange-500'
    }
  ];

  const containerTypes = {
    '20ft': { volume: 33.2, weight: 28200, name: '20ft Konteyner' },
    '40ft': { volume: 67.7, weight: 30480, name: '40ft Konteyner' },
    '40hc': { volume: 76.4, weight: 30480, name: '40ft HC Konteyner' }
  };

  const calculateVolume = () => {
    const length = parseFloat(volumeData.length);
    const width = parseFloat(volumeData.width);
    const height = parseFloat(volumeData.height);
    const weight = parseFloat(volumeData.weight);
    const quantity = parseInt(volumeData.quantity);

    if (length && width && height && weight && quantity) {
      const volume = (length * width * height * quantity) / 1000000; // m³
      const volumeWeight = volume * 167; // havayolu için 167 kg/m³
      const chargeableWeight = Math.max(weight * quantity, volumeWeight);
      
      let category = 'Standart';
      if (volumeWeight > weight * quantity * 1.5) {
        category = 'Hacimli Yük';
      } else if (weight * quantity > volumeWeight * 1.5) {
        category = 'Ağır Yük';
      }

      setVolumeResult({
        volume,
        volumeWeight,
        chargeableWeight,
        category
      });
    }
  };

  const calculateFreight = () => {
    const weight = parseFloat(freightData.weight);
    const distance = parseFloat(freightData.distance);

    if (weight && distance) {
      let baseCostPerKm = 2.5; // TL/km base
      let baseCostPerTon = 150; // TL/ton base

      // Transport mode multiplier
      const modeMultipliers = {
        road: 1.0,
        sea: 0.6,
        air: 3.5,
        rail: 0.8
      };

      const multiplier = modeMultipliers[freightData.transportMode as keyof typeof modeMultipliers];
      baseCostPerKm *= multiplier;
      baseCostPerTon *= multiplier;

      const baseCost = (baseCostPerKm * distance) + (baseCostPerTon * weight);
      const fuelSurcharge = baseCost * 0.15; // %15 yakıt surcharge
      const insurance = baseCost * 0.02; // %2 sigorta
      const totalCost = baseCost + fuelSurcharge + insurance;

      setFreightResult({
        baseCost,
        fuelSurcharge,
        insurance,
        totalCost,
        perKm: totalCost / distance,
        perTon: totalCost / weight
      });
    }
  };

  const calculateCustoms = () => {
    const value = parseFloat(customsData.value);
    const tariffRate = parseFloat(customsData.tariffRate);
    const vatRate = parseFloat(customsData.vatRate);

    if (value && tariffRate && vatRate) {
      const customsDuty = (value * tariffRate) / 100;
      const taxableValue = value + customsDuty;
      const vat = (taxableValue * vatRate) / 100;
      const totalTax = customsDuty + vat;
      const totalCost = value + totalTax;

      setCustomsResult({
        customsDuty,
        vat,
        totalTax,
        totalCost
      });
    }
  };

  const calculateContainer = () => {
    const packageLength = parseFloat(containerData.packageLength);
    const packageWidth = parseFloat(containerData.packageWidth);
    const packageHeight = parseFloat(containerData.packageHeight);
    const packageWeight = parseFloat(containerData.packageWeight);
    const packageQuantity = parseInt(containerData.packageQuantity);

    if (packageLength && packageWidth && packageHeight && packageWeight && packageQuantity) {
      const container = containerTypes[containerData.containerType as keyof typeof containerTypes];
      
      const packageVolume = (packageLength * packageWidth * packageHeight) / 1000000; // m³
      const usedVolume = packageVolume * packageQuantity;
      const usedWeight = packageWeight * packageQuantity;

      const volumeUtilization = (usedVolume / container.volume) * 100;
      const weightUtilization = (usedWeight / container.weight) * 100;

      const remainingVolume = container.volume - usedVolume;
      const remainingWeight = container.weight - usedWeight;

      let efficiency = 'Düşük';
      if (volumeUtilization > 80 || weightUtilization > 80) {
        efficiency = 'Yüksek';
      } else if (volumeUtilization > 60 || weightUtilization > 60) {
        efficiency = 'Orta';
      }

      setContainerResult({
        usedVolume,
        usedWeight,
        volumeUtilization,
        weightUtilization,
        remainingVolume,
        remainingWeight,
        efficiency
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setActivePage?.('bilgi-merkezi')} 
                className="mr-4"
                aria-label="Bilgi Merkezi'ne dön"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-orange-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hesaplama Araçları</h1>
                <p className="text-gray-600 mt-1">Lojistik hesaplama ve planlama araçları</p>
              </div>
            </div>
            <Calculator className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calculator Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hesaplama Araçları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculatorOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveCalculator(option.id as typeof activeCalculator)}
                className={`p-4 rounded-lg text-left transition-all ${
                  activeCalculator === option.id
                    ? 'ring-2 ring-orange-500 shadow-md'
                    : 'border border-gray-200 hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-3`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Volume Calculator */}
        {activeCalculator === 'volume' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-blue-500" />
                Hacim & Ağırlık Hesaplama
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uzunluk (cm)</label>
                    <input
                      type="number"
                      value={volumeData.length}
                      onChange={(e) => setVolumeData({...volumeData, length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (cm)</label>
                    <input
                      type="number"
                      value={volumeData.width}
                      onChange={(e) => setVolumeData({...volumeData, width: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yükseklik (cm)</label>
                    <input
                      type="number"
                      value={volumeData.height}
                      onChange={(e) => setVolumeData({...volumeData, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ağırlık (kg)</label>
                    <input
                      type="number"
                      value={volumeData.weight}
                      onChange={(e) => setVolumeData({...volumeData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adet</label>
                    <input
                      type="number"
                      value={volumeData.quantity}
                      onChange={(e) => setVolumeData({...volumeData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateVolume}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Hesapla
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sonuçlar</h3>
              
              {volumeResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-gray-900">Hesaplama Tamamlandı</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Hacim:</span>
                        <span className="ml-2 font-medium">{volumeResult.volume.toFixed(3)} m³</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hacimsel Ağırlık:</span>
                        <span className="ml-2 font-medium">{volumeResult.volumeWeight.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tarifeli Ağırlık:</span>
                        <span className="ml-2 font-medium">{volumeResult.chargeableWeight.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kategori:</span>
                        <span className="ml-2 font-medium">{volumeResult.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Açıklama:</p>
                        <p>Tarifeli ağırlık, gerçek ağırlık ile hacimsel ağırlığın büyük olanıdır. 
                        Havayolu kargo için hacimsel ağırlık 167 kg/m³ oranında hesaplanır.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Hesaplama için tüm alanları doldurun ve hesapla butonuna tıklayın.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Freight Calculator */}
        {activeCalculator === 'freight' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-green-500" />
                Navlun Hesaplama
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kalkış</label>
                    <input
                      type="text"
                      value={freightData.origin}
                      onChange={(e) => setFreightData({...freightData, origin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varış</label>
                    <input
                      type="text"
                      value={freightData.destination}
                      onChange={(e) => setFreightData({...freightData, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Berlin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taşıma Türü</label>
                    <select
                      value={freightData.transportMode}
                      onChange={(e) => setFreightData({...freightData, transportMode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      title="Taşıma türünü seçin"
                    >
                      <option value="road">Karayolu</option>
                      <option value="sea">Deniz Yolu</option>
                      <option value="air">Havayolu</option>
                      <option value="rail">Demiryolu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yük Türü</label>
                    <select
                      value={freightData.cargoType}
                      onChange={(e) => setFreightData({...freightData, cargoType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      title="Yük türünü seçin"
                    >
                      <option value="general">Genel Kargo</option>
                      <option value="fragile">Kırılır</option>
                      <option value="hazardous">Tehlikeli</option>
                      <option value="oversized">Büyük Boy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ağırlık (kg)</label>
                    <input
                      type="number"
                      value={freightData.weight}
                      onChange={(e) => setFreightData({...freightData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hacim (m³)</label>
                    <input
                      type="number"
                      value={freightData.volume}
                      onChange={(e) => setFreightData({...freightData, volume: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mesafe (km)</label>
                    <input
                      type="number"
                      value={freightData.distance}
                      onChange={(e) => setFreightData({...freightData, distance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="2200"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateFreight}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Navlun Hesapla
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Maliyet Analizi</h3>
              
              {freightResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-gray-900">Maliyet Hesaplandı</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Temel Navlun:</span>
                        <span className="font-medium">{freightResult.baseCost.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Yakıt Surcharge (%15):</span>
                        <span className="font-medium">{freightResult.fuelSurcharge.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sigorta (%2):</span>
                        <span className="font-medium">{freightResult.insurance.toFixed(2)} ₺</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                        <span className="text-lg font-bold text-green-600">{freightResult.totalCost.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-600">Km Başına</span>
                      <div className="text-lg font-bold text-gray-900">{freightResult.perKm.toFixed(2)} ₺</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-600">Ton Başına</span>
                      <div className="text-lg font-bold text-gray-900">{freightResult.perTon.toFixed(2)} ₺</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Navlun hesaplaması için gerekli bilgileri girin.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customs Calculator */}
        {activeCalculator === 'customs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-purple-500" />
                Gümrük Vergisi Hesaplama
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mal Değeri (₺)</label>
                  <input
                    type="number"
                    value={customsData.value}
                    onChange={(e) => setCustomsData({...customsData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HS Kodu</label>
                  <input
                    type="text"
                    value={customsData.hsCode}
                    onChange={(e) => setCustomsData({...customsData, hsCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="8703.10.11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menşei Ülke</label>
                  <input
                    type="text"
                    value={customsData.origin}
                    onChange={(e) => setCustomsData({...customsData, origin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Almanya"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gümrük Vergisi (%)</label>
                    <input
                      type="number"
                      value={customsData.tariffRate}
                      onChange={(e) => setCustomsData({...customsData, tariffRate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">KDV (%)</label>
                    <input
                      type="number"
                      value={customsData.vatRate}
                      onChange={(e) => setCustomsData({...customsData, vatRate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="18"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateCustoms}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Vergi Hesapla
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vergi Detayı</h3>
              
              {customsResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-gray-900">Vergi Hesaplandı</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Mal Değeri:</span>
                        <span className="font-medium">{parseFloat(customsData.value).toLocaleString()} ₺</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Gümrük Vergisi:</span>
                        <span className="font-medium">{customsResult.customsDuty.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">KDV:</span>
                        <span className="font-medium">{customsResult.vat.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Toplam Vergi:</span>
                        <span className="font-medium text-red-600">{customsResult.totalTax.toFixed(2)} ₺</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Toplam Maliyet:</span>
                        <span className="text-lg font-bold text-purple-600">{customsResult.totalCost.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">Uyarı:</p>
                        <p>Bu hesaplama genel bir tahmindir. Gerçek vergi oranları ürün kategorisine, menşei ülkeye ve ticaret anlaşmalarına göre değişebilir.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gümrük vergisi hesaplaması için gerekli bilgileri girin.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Container Calculator */}
        {activeCalculator === 'container' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-orange-500" />
                Konteyner Doluluk Hesaplama
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konteyner Türü</label>
                  <select
                    value={containerData.containerType}
                    onChange={(e) => setContainerData({...containerData, containerType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    title="Konteyner türünü seçin"
                  >
                    <option value="20ft">20ft Konteyner (33.2 m³, 28.2 ton)</option>
                    <option value="40ft">40ft Konteyner (67.7 m³, 30.5 ton)</option>
                    <option value="40hc">40ft HC Konteyner (76.4 m³, 30.5 ton)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Koli Uzunluk (cm)</label>
                    <input
                      type="number"
                      value={containerData.packageLength}
                      onChange={(e) => setContainerData({...containerData, packageLength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Koli Genişlik (cm)</label>
                    <input
                      type="number"
                      value={containerData.packageWidth}
                      onChange={(e) => setContainerData({...containerData, packageWidth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Koli Yükseklik (cm)</label>
                    <input
                      type="number"
                      value={containerData.packageHeight}
                      onChange={(e) => setContainerData({...containerData, packageHeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Koli Ağırlığı (kg)</label>
                    <input
                      type="number"
                      value={containerData.packageWeight}
                      onChange={(e) => setContainerData({...containerData, packageWeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Koli Adedi</label>
                    <input
                      type="number"
                      value={containerData.packageQuantity}
                      onChange={(e) => setContainerData({...containerData, packageQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="200"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateContainer}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Doluluk Hesapla
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Doluluk Analizi</h3>
              
              {containerResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-gray-900">Doluluk Hesaplandı</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Hacim Kullanımı</span>
                          <span className="text-sm font-medium">{containerResult.volumeUtilization.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(containerResult.volumeUtilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Ağırlık Kullanımı</span>
                          <span className="text-sm font-medium">{containerResult.weightUtilization.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(containerResult.weightUtilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kullanılan Hacim:</span>
                        <div className="font-medium">{containerResult.usedVolume.toFixed(2)} m³</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Kullanılan Ağırlık:</span>
                        <div className="font-medium">{(containerResult.usedWeight/1000).toFixed(2)} ton</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Kalan Hacim:</span>
                        <div className="font-medium">{Math.max(0, containerResult.remainingVolume).toFixed(2)} m³</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Kalan Ağırlık:</span>
                        <div className="font-medium">{Math.max(0, containerResult.remainingWeight/1000).toFixed(2)} ton</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    containerResult.efficiency === 'Yüksek' ? 'bg-green-50' :
                    containerResult.efficiency === 'Orta' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center">
                      <BarChart3 className={`w-5 h-5 mr-2 ${
                        containerResult.efficiency === 'Yüksek' ? 'text-green-600' :
                        containerResult.efficiency === 'Orta' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                      <span className="font-medium">Verimlilik: {containerResult.efficiency}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Konteyner doluluk analizi için gerekli bilgileri girin.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculationToolsPage;
