// Detailed service offers debugging
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// Bu değerleri .env dosyasından veya gerçek değerlerle değiştirin
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugServiceOffers() {
  console.log('🔍 Starting detailed service offers debug...');
  
  try {
    // 1. Tüm transport services
    const { data: allTransportServices } = await supabase
      .from('transport_services')
      .select('id, user_id, service_number, title, status');
    
    console.log('🚛 All transport services:', allTransportServices?.length || 0);
    if (allTransportServices) {
      allTransportServices.forEach((service, i) => {
        console.log(`  Service ${i+1}: ${service.service_number} - ${service.title} (owner: ${service.user_id}, status: ${service.status})`);
      });
    }
    
    // 2. Tüm service offers
    const { data: allServiceOffers } = await supabase
      .from('service_offers')
      .select(`
        id,
        user_id,
        transport_service_id,
        price_amount,
        message,
        status,
        created_at,
        transport_service:transport_services(id, user_id, service_number, title)
      `);
    
    console.log('📊 All service offers:', allServiceOffers?.length || 0);
    if (allServiceOffers) {
      allServiceOffers.forEach((offer, i) => {
        console.log(`  Offer ${i+1}:`, {
          id: offer.id,
          creator: offer.user_id,
          transport_service_id: offer.transport_service_id,
          transport_service_owner: offer.transport_service?.user_id,
          price: offer.price_amount,
          status: offer.status,
          message: offer.message?.substring(0, 30) + '...'
        });
      });
    }
    
    // 3. Cross-check: hangi kullanıcıların service offers alması gerekir
    if (allTransportServices && allServiceOffers) {
      console.log('\n🎯 Expected received offers per user:');
      
      const userServiceMap = {};
      allTransportServices.forEach(service => {
        if (!userServiceMap[service.user_id]) {
          userServiceMap[service.user_id] = [];
        }
        userServiceMap[service.user_id].push(service.id);
      });
      
      Object.keys(userServiceMap).forEach(userId => {
        const userServiceIds = userServiceMap[userId];
        const offersToUserServices = allServiceOffers.filter(offer => 
          userServiceIds.includes(offer.transport_service_id) && 
          offer.user_id !== userId
        );
        
        console.log(`User ${userId} should receive ${offersToUserServices.length} service offers:`, 
          offersToUserServices.map(o => ({
            from: o.user_id,
            service: o.transport_service?.service_number,
            price: o.price_amount
          }))
        );
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugServiceOffers();
