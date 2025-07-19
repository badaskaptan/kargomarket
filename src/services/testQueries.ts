// TEST: Basit offers query
import { supabase } from '../lib/supabase';

export async function testOffers() {
  console.log('🧪 Testing basic offers query...');
  
  // Önce tablo yapısını kontrol et
  const { data: tableInfo, error: tableError } = await supabase
    .rpc('get_table_columns', { table_name: 'offers' })
    .limit(1);
    
  if (!tableError) {
    console.log('📋 Offers table columns:', tableInfo);
  }
  
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('❌ Test offers error:', error);
    
    // Alternatif: sadece ID ve temel alanları al
    const { data: basicData, error: basicError } = await supabase
      .from('offers')
      .select('id, created_at, listing_id, price, status')
      .limit(5);
      
    if (basicError) {
      console.error('❌ Basic offers error:', basicError);
    } else {
      console.log('✅ Basic offers success:', basicData);
      if (basicData && basicData.length > 0) {
        console.log('📋 Available columns in first row:', Object.keys(basicData[0]));
      }
    }
  } else {
    console.log('✅ Test offers success:', data);
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]));
    }
  }
  
  return { data, error };
}

export async function testProfiles() {
  console.log('🧪 Testing basic profiles query...');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('❌ Test profiles error:', error);
  } else {
    console.log('✅ Test profiles success:', data);
  }
  
  return { data, error };
}

export async function testListings() {
  console.log('🧪 Testing basic listings query...');
  
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('❌ Test listings error:', error);
  } else {
    console.log('✅ Test listings success:', data);
  }
  
  return { data, error };
}
