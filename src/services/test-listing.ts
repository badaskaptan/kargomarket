import { ListingService } from './listingService.js';

(async () => {
  const result = await ListingService.createListing({
    user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    listing_type: 'transport_service',
    title: 'Test İlan',
    description: 'Test açıklama',
    origin: 'İstanbul',
    destination: 'Ankara',
    transport_mode: 'road',
    vehicle_types: ['truck'],
    role_type: 'seller',
    load_type: 'general',
    weight_value: 1000,
    weight_unit: 'kg',
    volume_value: 10,
    volume_unit: 'm3',
    loading_date: '2025-07-13',
    delivery_date: '2025-07-14',
    price_amount: 5000,
    price_currency: 'TRY',
    offer_type: 'fixed_price',
    transport_responsible: 'seller',
    required_documents: ['fatura'],
    status: 'active',
    listing_number: 'NK2507130001',
    available_from_date: '2025-07-13',
    metadata: { tags: ['test', 'örnek'], source: 'test-script' },
    transport_details: { vehicle_type: 'truck', equipment_needed: ['lift'] },
    contact_info: { phone: '+905555555555', email: 'test@example.com' },
    cargo_details: { weight: 1000, type: 'general', fragile: false }
  });
  console.log('Test ilanı başarıyla eklendi. İlan numarası:', result.listing_number);
})();
