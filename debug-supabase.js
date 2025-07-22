// Supabase Debug Test - Console'da çalıştır
import { supabase } from './lib/supabase.js';

// Test fonksiyonu
async function debugListingsAndOffers() {
  console.log('🔍 Starting debug test...');
  
  try {
    // 1. Listings tablosundaki kayıt sayısını kontrol et
    const { count: listingsCount, error: countError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ Error counting listings:', countError);
      return;
    }
    
    console.log(`📊 Total listings in database: ${listingsCount}`);
    
    // 2. İlk 5 listing'in ID'lerini getir
    const { data: sampleListings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, created_at')
      .limit(5);
      
    if (listingsError) {
      console.error('❌ Error fetching sample listings:', listingsError);
      return;
    }
    
    console.log('📋 Sample listings:', sampleListings);
    
    // 3. Offers tablosundaki kayıt sayısını kontrol et
    const { count: offersCount, error: offersCountError } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true });
      
    if (offersCountError) {
      console.error('❌ Error counting offers:', offersCountError);
      return;
    }
    
    console.log(`📊 Total offers in database: ${offersCount}`);
    
    // 4. Foreign key constraint'i kontrol et
    const { data: constraintInfo, error: constraintError } = await supabase
      .rpc('get_foreign_key_info', { table_name: 'offers', column_name: 'listing_id' });
      
    if (constraintError) {
      console.log('⚠️ Custom constraint check failed, using direct query');
    } else {
      console.log('🔗 Foreign key constraint info:', constraintInfo);
    }
    
    // 5. Test için yeni listing oluştur
    console.log('🚀 Creating test listing...');
    const { data: newListing, error: createError } = await supabase
      .from('listings')
      .insert({
        user_id: 'test-user-id',
        title: 'Debug Test İlanı',
        description: 'Test açıklaması',
        origin: 'İstanbul',
        destination: 'Ankara',
        listing_type: 'load_listing',
        transport_mode: 'road',
        load_type: 'general_cargo',
        status: 'active'
      })
      .select()
      .single();
      
    if (createError) {
      console.error('❌ Error creating test listing:', createError);
      return;
    }
    
    console.log('✅ Test listing created:', newListing);
    
    // 6. Test listing için offer oluşturmayı dene
    console.log('🚀 Creating test offer...');
    const { data: newOffer, error: offerError } = await supabase
      .from('offers')
      .insert({
        listing_id: newListing.id,
        offerer_id: 'test-user-id',
        offer_type: 'price',
        price_amount: 1000,
        price_currency: 'TRY',
        message: 'Test teklifi',
        status: 'pending',
        transport_mode: 'road'
      })
      .select()
      .single();
      
    if (offerError) {
      console.error('❌ Error creating test offer:', offerError);
      return;
    }
    
    console.log('✅ Test offer created:', newOffer);
    
    // 7. Test verilerini temizle
    await supabase.from('offers').delete().eq('id', newOffer.id);
    await supabase.from('listings').delete().eq('id', newListing.id);
    console.log('🧹 Test data cleaned');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Fonksiyonu export et
window.debugListingsAndOffers = debugListingsAndOffers;
console.log('🎯 Debug function loaded. Run: debugListingsAndOffers()');
