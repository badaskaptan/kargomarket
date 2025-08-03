// Debug script için statsService test
import { supabase } from './src/lib/supabase.js';

// Manuel test - sistem genelindeki toplam teklif sayısı
async function testTotalOffers() {
  console.log('=== TESTING TOTAL OFFERS ===');
  
  // offers tablosundan say
  const { count: offersCount, error: offersError } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true });
  
  console.log('Offers table count:', offersCount, 'Error:', offersError);

  // service_offers tablosundan say
  const { count: serviceOffersCount, error: serviceOffersError } = await supabase
    .from('service_offers')
    .select('*', { count: 'exact', head: true });
  
  console.log('Service offers table count:', serviceOffersCount, 'Error:', serviceOffersError);

  const totalCount = (offersCount || 0) + (serviceOffersCount || 0);
  console.log('TOTAL OFFERS:', totalCount);
  
  return totalCount;
}

// Manuel test - sistem genelindeki kabul edilmiş teklif sayısı
async function testCompletedTransactions() {
  console.log('=== TESTING COMPLETED TRANSACTIONS ===');
  
  // offers tablosundan kabul edilmiş teklifleri say
  const { count: acceptedOffersCount, error: offersError } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted');
  
  console.log('Accepted offers count:', acceptedOffersCount, 'Error:', offersError);

  // service_offers tablosundan kabul edilmiş teklifleri say
  const { count: acceptedServiceOffersCount, error: serviceOffersError } = await supabase
    .from('service_offers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted');
  
  console.log('Accepted service offers count:', acceptedServiceOffersCount, 'Error:', serviceOffersError);

  const totalCompleted = (acceptedOffersCount || 0) + (acceptedServiceOffersCount || 0);
  console.log('TOTAL COMPLETED TRANSACTIONS:', totalCompleted);
  
  return totalCompleted;
}

// Manuel test - tüm offer ve service_offer kayıtlarını kontrol et
async function inspectOfferTables() {
  console.log('=== INSPECTING OFFER TABLES ===');
  
  // offers tablosundaki tüm kayıtları kontrol et
  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('id, user_id, status, created_at')
    .limit(10);
  
  console.log('Sample offers:', offers, 'Error:', offersError);

  // service_offers tablosundaki tüm kayıtları kontrol et
  const { data: serviceOffers, error: serviceOffersError } = await supabase
    .from('service_offers')
    .select('id, user_id, status, created_at')
    .limit(10);
  
  console.log('Sample service offers:', serviceOffers, 'Error:', serviceOffersError);
}

// Tüm testleri çalıştır
async function runAllTests() {
  try {
    await inspectOfferTables();
    await testTotalOffers();
    await testCompletedTransactions();
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Global olarak kullanılabilir hale getir
window.debugStats = {
  testTotalOffers,
  testCompletedTransactions,
  inspectOfferTables,
  runAllTests
};

console.log('Debug stats loaded. Use window.debugStats.runAllTests() to test');
