// Test kapasitesi verisi eklemek için basit script
// Bu script'i manual olarak browser console'dan çalıştırabiliriz

const testData = {
  id: 'test-capacity-1',
  listing_number: 'TST-001',
  title: 'Test Karayolu Nakliye',
  description: 'Kapasite test için',
  origin: 'İstanbul',
  destination: 'Ankara',
  transport_mode: 'road',
  weight_value: 15000,
  weight_unit: 'kg', 
  volume_value: 25,
  volume_unit: 'm³',
  vehicle_types: ['tir_standard'],
  available_from_date: '2025-07-15',
  listing_type: 'transport_service',
  status: 'active',
  metadata: {
    transport_details: {
      capacity: '15 ton / 25 m³',
      truck_capacity: '15000 kg',
      plate_number: 'İST 123 TEST'
    },
    contact_info: {
      contact: '+905551234567',
      company_name: 'Test Nakliye A.Ş.'
    }
  }
};

console.log('Test verisi hazır:', testData);
