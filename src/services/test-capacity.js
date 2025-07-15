// Test için kapasite verisi olan transport service
import { ListingService } from './listingService';
(async () => {
    // Karayolu transport service
    const roadService = await ListingService.createListing({
        user_id: 'test-user-123',
        listing_type: 'transport_service',
        title: 'Test Karayolu Nakliye Hizmeti',
        description: 'Kapasite test için karayolu nakliye hizmeti',
        origin: 'İstanbul',
        destination: 'Ankara',
        transport_mode: 'road',
        weight_value: 10000, // 10 ton
        weight_unit: 'kg',
        volume_value: 50,
        volume_unit: 'm³',
        vehicle_types: ['tir_standard'],
        available_from_date: '2025-07-15',
        offer_type: 'negotiable',
        status: 'active',
        metadata: {
            transport_details: {
                capacity: '15 ton / 80 m³',
                truck_capacity: '15000 kg',
                plate_number: 'İST 123 TEST'
            },
            contact_info: {
                contact: '+905551234567',
                company_name: 'Test Nakliye A.Ş.'
            }
        }
    });
    console.log('Karayolu test listingi eklendi:', roadService.listing_number);
    // Trenyolu transport service
    const railService = await ListingService.createListing({
        user_id: 'test-user-456',
        listing_type: 'transport_service',
        title: 'Test Trenyolu Nakliye Hizmeti',
        description: 'Kapasite test için trenyolu nakliye hizmeti',
        origin: 'İstanbul Liman',
        destination: 'Ankara Garı',
        transport_mode: 'rail',
        weight_value: 25000, // 25 ton
        weight_unit: 'kg',
        vehicle_types: ['container_wagon'],
        available_from_date: '2025-07-16',
        offer_type: 'fixed_price',
        price_amount: 8000,
        price_currency: 'TRY',
        status: 'active',
        metadata: {
            transport_details: {
                capacity: '40 ton / 2 konteyner',
                wagon_capacity: '40000 kg',
                train_number: 'TR-123',
                train_capacity: '200 ton'
            },
            contact_info: {
                contact: '+905557654321',
                company_name: 'Test Rail Lojistik'
            }
        }
    });
    console.log('Trenyolu test listingi eklendi:', railService.listing_number);
})();
