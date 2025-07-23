// Debug script to check transport services and service offers data
import { supabase } from './src/lib/supabase.js';

async function debugServiceOffers() {
  console.log('🔍 DEBUG: Checking transport_services table...');
  
  // 1. Transport services'ları kontrol et
  const { data: transportServices, error: tsError } = await supabase
    .from('transport_services')
    .select('*')
    .limit(10);
    
  if (tsError) {
    console.error('❌ Transport services error:', tsError);
  } else {
    console.log('✅ Transport services found:', transportServices?.length);
    console.log('📊 Sample transport services:', transportServices);
  }
  
  console.log('\n🔍 DEBUG: Checking service_offers table...');
  
  // 2. Service offers'ları kontrol et
  const { data: serviceOffers, error: soError } = await supabase
    .from('service_offers')
    .select(`
      *,
      transport_service:transport_services (
        id,
        service_number,
        title,
        user_id
      )
    `)
    .limit(10);
    
  if (soError) {
    console.error('❌ Service offers error:', soError);
  } else {
    console.log('✅ Service offers found:', serviceOffers?.length);
    console.log('📊 Sample service offers:', serviceOffers);
  }
  
  // 3. Her user için received service offers'ları test et
  if (transportServices && transportServices.length > 0) {
    const testUserId = transportServices[0].user_id;
    console.log(`\n🔍 DEBUG: Testing received service offers for user: ${testUserId}`);
    
    const userServiceIds = transportServices
      .filter(service => service.user_id === testUserId)
      .map(service => service.id);
      
    console.log('📍 User service IDs:', userServiceIds);
    
    if (userServiceIds.length > 0) {
      const { data: receivedOffers, error: roError } = await supabase
        .from('service_offers')
        .select(`
          *,
          transport_service:transport_services (
            id,
            service_number,
            title,
            user_id
          )
        `)
        .in('transport_service_id', userServiceIds)
        .neq('user_id', testUserId);
        
      if (roError) {
        console.error('❌ Received service offers error:', roError);
      } else {
        console.log('✅ Received service offers for test user:', receivedOffers?.length);
        console.log('📊 Received offers data:', receivedOffers);
      }
    }
  }
}

debugServiceOffers().catch(console.error);
