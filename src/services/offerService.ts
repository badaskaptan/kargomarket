import { supabase } from '../lib/supabase';
import type { Database } from '../types/database-types';

type Offer = Database['public']['Tables']['offers']['Row'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];
export type OfferUpdate = Database['public']['Tables']['offers']['Update'];

// Extended Offer with related data
export interface ExtendedOffer extends Offer {
  listing?: {
    id: string;
    user_id?: string;
    listing_number?: string;
    title: string;
    origin: string;
    destination: string;
    listing_type: string;
    transport_mode?: string;
    weight_value?: number;
    weight_unit?: string;
    volume_value?: number;
    loading_date?: string;
    delivery_date?: string;
    load_type?: string;
    vehicle_types?: string[];
  };
  carrier?: {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    email: string;
    avatar_url?: string;
    rating: number;
  };
  listing_owner?: {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    email: string;
    avatar_url?: string;
    rating: number;
  };
}

export class OfferService {
  // Kullanıcının verdiği teklifleri getir (sent offers)
  static async getSentOffers(userId: string): Promise<ExtendedOffer[]> {
    console.log('📤 Fetching sent offers for user:', userId);

    try {
      // user_id kullanarak teklifleri al ve listing bilgilerini join et
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select(`
          *,
          listing:listings (
            id,
            user_id,
            listing_number,
            title,
            origin,
            destination,
            listing_type,
            transport_mode,
            weight_value,
            weight_unit,
            volume_value,
            loading_date,
            delivery_date,
            load_type,
            vehicle_types
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Sent offers fetch failed:', offersError);
        throw new Error(`Sent offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Offers with listing data fetched:', offers?.length || 0);

      if (!offers || offers.length === 0) {
        console.log('✅ No sent offers found');
        return [];
      }

      const extendedOffers: ExtendedOffer[] = offers.map(offer => ({
        ...offer,
        listing_owner: null,
        carrier: null
      }));

      console.log('✅ Sent offers processed:', extendedOffers.length);
      return extendedOffers;

    } catch (error) {
      console.error('❌ Full sent offers error:', error);
      throw error;
    }
  }

  // Kullanıcının aldığı teklifleri getir (received offers)
  static async getReceivedOffers(userId: string): Promise<ExtendedOffer[]> {
    console.log('📥 Fetching received offers for user:', userId);

    try {
      // Önce kullanıcının ilanlarını bul
      const { data: userListings, error: userListingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId);

      if (userListingsError) {
        console.error('❌ User listings fetch failed:', userListingsError);
        throw new Error(`User listings fetch failed: ${userListingsError.message}`);
      }

      console.log('✅ User listings fetched:', userListings?.length || 0);

      if (!userListings || userListings.length === 0) {
        console.log('✅ No user listings found');
        return [];
      }

      const listingIds = userListings.map(listing => listing.id);

      // Bu ilanlara gelen teklifleri al
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select(`
          *,
          listing:listings (
            id,
            user_id,
            listing_number,
            title,
            origin,
            destination,
            listing_type,
            transport_mode,
            weight_value,
            weight_unit,
            volume_value,
            loading_date,
            delivery_date,
            load_type,
            vehicle_types
          )
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Received offers fetch failed:', offersError);
        throw new Error(`Received offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Received offers with listing data fetched:', offers?.length || 0);

      if (!offers || offers.length === 0) {
        console.log('✅ No received offers found');
        return [];
      }

      const extendedOffers: ExtendedOffer[] = offers.map(offer => ({
        ...offer,
        listing_owner: null,
        carrier: null
      }));

      console.log('✅ Received offers processed:', extendedOffers.length);
      return extendedOffers;

    } catch (error) {
      console.error('❌ Full received offers error:', error);
      throw error;
    }
  }

  // Yeni teklif oluştur
  static async createOffer(offerData: OfferInsert): Promise<Offer> {
    console.log('📝 Creating new offer:', offerData);

    // Listing'in var olup olmadığını kontrol et
    if (offerData.listing_id) {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, listing_type')
        .eq('id', offerData.listing_id)
        .single();

      if (listingError || !listing) {
        console.error('❌ Listing not found:', offerData.listing_id);
        throw new Error('İlan bulunamadı. Lütfen geçerli bir ilan seçin.');
      }

      // Transport service'ler için offers tablosunu kullanma
      if (listing.listing_type === 'transport_service') {
        throw new Error('Nakliye hizmetleri için service_offers tablosunu kullanın.');
      }
    }

    const { data, error } = await supabase
      .from('offers')
      .insert({
        ...offerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Offer creation failed:', error);
      throw new Error(`Offer creation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from offer creation');
    }

    console.log('✅ Offer created successfully:', data.id);
    return data;
  }

  // Teklifi güncelle
  static async updateOffer(offerId: string, updates: OfferUpdate): Promise<Offer> {
    console.log('📝 Updating offer:', offerId, updates);

    const { data, error } = await supabase
      .from('offers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Offer update failed:', error);
      throw new Error(`Offer update failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from offer update');
    }

    console.log('✅ Offer updated successfully:', data.id);
    return data;
  }

  // Teklifi sil
  static async deleteOffer(offerId: string): Promise<boolean> {
    console.log('🗑️ Deleting offer:', offerId);

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      console.error('❌ Offer deletion failed:', error);
      throw new Error(`Offer deletion failed: ${error.message}`);
    }

    console.log('✅ Offer deleted successfully:', offerId);
    return true;
  }

  // Teklifi kabul et
  static async acceptOffer(offerId: string): Promise<Offer> {
    return this.updateOffer(offerId, { status: 'accepted' });
  }

  // Teklifi reddet
  static async rejectOffer(offerId: string): Promise<Offer> {
    return this.updateOffer(offerId, { status: 'rejected' });
  }

  // Teklifi geri çek
  static async withdrawOffer(offerId: string): Promise<Offer> {
    return this.updateOffer(offerId, { status: 'withdrawn' });
  }

  // Belirli bir ilan için teklifleri getir
  static async getOffersForListing(listingId: string): Promise<ExtendedOffer[]> {
    console.log('📋 Fetching offers for listing:', listingId);

    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        carrier:profiles!offers_carrier_id_fkey (
          id, full_name, company_name, phone, email, avatar_url, rating
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Listing offers fetch failed:', error);
      throw new Error(`Listing offers fetch failed: ${error.message}`);
    }

    console.log('✅ Listing offers fetched:', data?.length || 0);
    return data || [];
  }

  // Teklif istatistikleri
  static async getOfferStats(userId: string): Promise<{
    sent: { total: number; pending: number; accepted: number; rejected: number };
    received: { total: number; pending: number; accepted: number; rejected: number };
  }> {
    console.log('📊 Fetching offer stats for user:', userId);

    // Verilen teklifler
    const { data: sentOffers, error: sentError } = await supabase
      .from('offers')
      .select('status')
      .eq('carrier_id', userId);

    if (sentError) {
      console.error('❌ Sent offer stats fetch failed:', sentError);
      throw new Error(`Sent offer stats fetch failed: ${sentError.message}`);
    }

    // Alınan teklifler - önce kullanıcının ilanlarını al
    const { data: userListings, error: listingsError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId);

    if (listingsError) {
      console.error('❌ User listings fetch failed:', listingsError);
      throw new Error(`User listings fetch failed: ${listingsError.message}`);
    }

    const listingIds = userListings?.map(listing => listing.id) || [];
    
    const { data: receivedOffers, error: receivedError } = await supabase
      .from('offers')
      .select('status')
      .in('listing_id', listingIds);

    if (receivedError) {
      console.error('❌ Received offer stats fetch failed:', receivedError);
      throw new Error(`Received offer stats fetch failed: ${receivedError.message}`);
    }

    // İstatistikleri hesapla
    const sentStats = this.calculateStats(sentOffers || []);
    const receivedStats = this.calculateStats(receivedOffers || []);

    console.log('✅ Offer stats calculated:', { sent: sentStats, received: receivedStats });
    return { sent: sentStats, received: receivedStats };
  }

  private static calculateStats(offers: { status: string }[]) {
    return {
      total: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length
    };
  }
}
