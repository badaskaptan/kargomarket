import { supabase } from '../src/lib/supabase.js';

const debugServiceOffers = async () => {
  console.log('🔍 DEBUG: Service Offers Investigation');
  
  try {
    // 1. Transport services'ları kontrol et
    console.log('\n1️⃣ Checking transport_services table...');
    const { data: transportServices, error: tsError } = await supabase
      .from('transport_services')
      .select('id, service_number, title, user_id, created_at')
      .order('created_at', { ascending: false });
      
    if (tsError) {
      console.error('❌ Transport services error:', tsError);
      return;
    }
    
    console.log(`✅ Found ${transportServices?.length || 0} transport services`);
    if (transportServices && transportServices.length > 0) {
      console.log('📊 Sample transport services:');
      transportServices.slice(0, 3).forEach((service, index) => {
        console.log(`  ${index + 1}. ID: ${service.id}, User: ${service.user_id}, Title: ${service.title}`);
      });
    }
    
    // 2. Service offers'ları kontrol et
    console.log('\n2️⃣ Checking service_offers table...');
    const { data: serviceOffers, error: soError } = await supabase
      .from('service_offers')
      .select('id, user_id, transport_service_id, price_amount, status, created_at')
      .order('created_at', { ascending: false });
      
    if (soError) {
      console.error('❌ Service offers error:', soError);
      return;
    }
    
    console.log(`✅ Found ${serviceOffers?.length || 0} service offers`);
    if (serviceOffers && serviceOffers.length > 0) {
      console.log('📊 Sample service offers:');
      serviceOffers.slice(0, 3).forEach((offer, index) => {
        console.log(`  ${index + 1}. ID: ${offer.id}, From User: ${offer.user_id}, To Service: ${offer.transport_service_id}, Status: ${offer.status}`);
      });
    }
    
    // 3. Cross-check: Her transport service için gelen teklifler
    if (transportServices && transportServices.length > 0 && serviceOffers && serviceOffers.length > 0) {
      console.log('\n3️⃣ Cross-checking service offers for each transport service...');
      
      const userServiceMap = new Map();
      transportServices.forEach(service => {
        if (!userServiceMap.has(service.user_id)) {
          userServiceMap.set(service.user_id, []);
        }
        userServiceMap.get(service.user_id).push(service.id);
      });
      
      userServiceMap.forEach((serviceIds, userId) => {
        const receivedOffers = serviceOffers.filter(offer => 
          serviceIds.includes(offer.transport_service_id) && 
          offer.user_id !== userId
        );
        
        console.log(`👤 User ${userId}:`);
        console.log(`  - Has ${serviceIds.length} transport services`);
        console.log(`  - Received ${receivedOffers.length} service offers`);
        
        if (receivedOffers.length > 0) {
          receivedOffers.forEach((offer, index) => {
            console.log(`    ${index + 1}. Offer ID: ${offer.id}, From: ${offer.user_id}, Amount: ${offer.price_amount}, Status: ${offer.status}`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
};

debugServiceOffers();
