// En popüler 5 yük kategorisini getirir
export async function fetchTopLoadCategories(): Promise<Array<{ load_type: string; count: number }>> {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('load_type')
    .eq('status', 'active')
    .eq('listing_type', 'load_listing');
  if (error) {
    console.error('Error fetching load categories:', error);
    throw error;
  }
  // JS ile gruplama ve sayma
  const counts: Record<string, number> = {};
  for (const l of listings || []) {
    if (!l.load_type) continue;
    counts[l.load_type] = (counts[l.load_type] || 0) + 1;
  }
  // Sırala ve ilk 5'i al
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([load_type, count]) => ({ load_type, count }));
  return sorted;
}
// Transport modlarını say (transport_services tablosundan)
export async function fetchTransportModeCounts(): Promise<{
  road: number;
  sea: number;
  air: number;
  rail: number;
}> {
  const { data: services, error } = await supabase
    .from('transport_services')
    .select('transport_mode')
    .eq('status', 'active');
  if (error) {
    console.error('Error fetching transport mode counts:', error);
    throw error;
  }
  let road = 0, sea = 0, air = 0, rail = 0;
  for (const s of services || []) {
    if (s.transport_mode === 'road') road++;
    else if (s.transport_mode === 'sea') sea++;
    else if (s.transport_mode === 'air') air++;
    else if (s.transport_mode === 'rail') rail++;
  }
  return { road, sea, air, rail };
}

import { supabase } from '../lib/supabase';

// İlanları kategoriye göre say (ILN: Yük, NK: Nakliye Talebi, TS: Nakliye Hizmeti)
export async function fetchListingCategoryCounts(): Promise<{
  yuk: number;
  nakliyeTalebi: number;
  nakliyeHizmeti: number;
}> {
  // Listings tablosu
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('listing_type')
    .eq('status', 'active');
  if (listingsError) {
    console.error('Error fetching listings for category count:', listingsError);
    throw listingsError;
  }

  // Transport_services tablosu
  const { data: services, error: servicesError } = await supabase
    .from('transport_services')
    .select('service_number')
    .eq('status', 'active');
  if (servicesError) {
    console.error('Error fetching transport_services for category count:', servicesError);
    throw servicesError;
  }

  let yuk = 0, nakliyeTalebi = 0, nakliyeHizmeti = 0;

  // Listings tablosu için listing_type'a göre ayır
  for (const l of listings || []) {
    if (l.listing_type === 'load_listing') yuk++;
    else if (l.listing_type === 'shipment_request') nakliyeTalebi++;
  }
  // Transport_services tablosu için kod başına göre ayır
  for (const s of services || []) {
    if (!s.service_number) continue;
    if (s.service_number.startsWith('TS')) nakliyeHizmeti++;
  }

  return { yuk, nakliyeTalebi, nakliyeHizmeti };
}

// Toplam teklif sayısını çekme
export async function fetchTotalOffersCount(): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_total_offers_count');
  if (error) {
    console.error('Error fetching total offers count:', error);
    throw error;
  }
  return data ? Number(data) : 0;
}

// Toplam tamamlanmış iş sayısını çekme
export async function fetchTotalCompletedTransactionsCount(): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_total_completed_transactions_count');
  if (error) {
    console.error('Error fetching total completed transactions count:', error);
    throw error;
  }
  return data ? Number(data) : 0;
}

// Toplam kullanıcı sayısını çekme (profiles tablosundan)
export async function fetchTotalUsersCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error fetching total users count:', error);
    throw error;
  }
  return count;
}

// Toplam aktif ve public ilan sayısını çekme (listings tablosundan)
export async function fetchTotalActivePublicListingsCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .in('visibility', ['public', 'premium'])
    .gte('expires_at', new Date().toISOString());
  if (error) {
    console.error('Error fetching total active public listings count:', error);
    throw error;
  }
  return count;
}
