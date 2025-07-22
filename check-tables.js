// Supabase'de service_offers tablosunu oluşturmak için test scripti
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rmqwrdeaecjyyalbnvbq.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcXdyZGVhZWNqeXlhbGJudmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzM3MzUsImV4cCI6MjA2NzQwOTczNX0.L4vYHbdMKHaSw_NrMTcAwEPjs2MI-OqH6BeFtbSVHy0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking existing tables...')
  
  // Check offers table
  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('*')
    .limit(1)
  
  if (offersError) {
    console.log('❌ offers table:', offersError.message)
  } else {
    console.log('✅ offers table exists')
  }
  
  // Check service_offers table
  const { data: serviceOffers, error: serviceOffersError } = await supabase
    .from('service_offers')
    .select('*')
    .limit(1)
  
  if (serviceOffersError) {
    console.log('❌ service_offers table:', serviceOffersError.message)
  } else {
    console.log('✅ service_offers table exists')
  }
  
  // Check listings table
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, listing_type')
    .limit(5)
  
  if (listingsError) {
    console.log('❌ listings table:', listingsError.message)
  } else {
    console.log('✅ listings table exists, sample data:')
    console.log(listings?.map(l => `${l.id.slice(0,8)} - ${l.listing_type}`))
  }
}

checkTables().catch(console.error)
