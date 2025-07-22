import { OfferService } from '../services/offerService';
import { supabase } from '../lib/supabase';

// Test teklifi oluşturma fonksiyonu - Gerçek kullanıcı ID'si ile
export const testOfferCreation = async () => {
  console.log('🧪 Starting offer creation test...');

  try {
    // 1. Önce mevcut kullanıcıyı al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      alert('Lütfen önce giriş yapın!');
      return;
    }
    
    console.log('✅ Current user:', user.id);
    
    // 2. Kullanıcı profil bilgilerini al
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, email, company_name')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.warn('⚠️ Could not fetch user profile:', profileError);
    }
    
    console.log('👤 User profile:', userProfile);
    
    // İletişim bilgilerini otomatik hazırla
    const contactPerson = userProfile?.full_name || user.email?.split('@')[0] || 'Kullanıcı';
    const contactPhone = userProfile?.phone || '+90 555 000 0000';
    
    console.log('📞 Auto contact info:', { contactPerson, contactPhone });
    
    // 3. Mevcut listings'leri kontrol et
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, user_id, status')
      .eq('status', 'active')
      .limit(5);
      
    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      return;
    }
    
    console.log('📋 Available listings:', listings);
    console.log('📋 Available listings count:', listings?.length || 0);
    
    // Eğer listing yoksa, gerçek bir listing oluştur
    let targetListing = listings?.[0];
    
    if (!targetListing) {
      console.log('⚠️ No active listings found. Creating a test listing first...');
      
      // Test listing oluştur
      const { data: newListing, error: createError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: 'Test İlanı - Offer Testi için',
          description: 'Bu ilan offer testi için oluşturulmuştur',
          origin: 'İstanbul',
          destination: 'Ankara',
          listing_type: 'load_listing',
          transport_mode: 'road',
          load_type: 'general_cargo',
          status: 'active',
          weight_value: 1000,
          weight_unit: 'kg',
          price_amount: 500,
          price_currency: 'TRY'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating test listing:', createError);
        return;
      }
      
      console.log('✅ Test listing created successfully:', newListing);
      targetListing = newListing;
    }
    
    // Başka bir kullanıcının ilanını bul (kendi ilanına teklif veremezsin)
    const otherUserListings = listings?.filter(l => l.user_id !== user.id);
    if (otherUserListings && otherUserListings.length > 0) {
      targetListing = otherUserListings[0];
      console.log('🎯 Found other user listing for offer:', targetListing.id);
    } else {
      console.log('⚠️ No other user listings found, using own listing for test (this should show error)');
    }
    
    console.log('🎯 Target listing:', targetListing);

    const testOfferData = {
      listing_id: targetListing.id,
      user_id: user.id,
      offer_type: 'direct_offer' as const,
      price_amount: 1000.00,
      price_currency: 'TRY',
      price_per: 'total' as const,
      message: 'Test teklif mesajı - Otomatik kullanıcı ID ile',
      service_description: '2 gün teslimat',
      expires_at: '2025-08-01T00:00:00.000Z',
      status: 'pending' as const,
      transport_mode: 'road' as const,
      cargo_type: 'general_cargo' as const,
      service_scope: 'door_to_door' as const,
      transit_time_estimate: '2 gün',
      contact_person: contactPerson, // Otomatik kullanıcı profil bilgisi
      contact_phone: contactPhone, // Otomatik kullanıcı telefon bilgisi
      customs_handling_included: true,
      documentation_handling_included: false,
      loading_unloading_included: true,
      tracking_system_provided: true,
      express_service: false,
      weekend_service: true,
      fuel_surcharge_included: false,
      toll_fees_included: true,
      additional_terms: {
        insurance_included: true,
        payment_terms: 'after_delivery',
        loading_assistance: true,
        unloading_assistance: false,
        tracking_available: true
      },
      additional_services: {
        express_delivery: false,
        weekend_delivery: true,
        special_handling: false,
        customs_clearance: true,
        fuel_surcharge_included: false,
        toll_fees_included: true
      }
    };

    console.log('🚀 Creating offer with real user and listing IDs...');
    console.log('📋 Offer data:', JSON.stringify(testOfferData, null, 2));
    
    const result = await OfferService.createOffer(testOfferData);
    console.log('✅ Offer created successfully:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test offer creation failed:', error);
    throw error;
  }
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testOfferCreation = testOfferCreation;
}