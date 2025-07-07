import { supabase } from '../lib/supabase';
import type { Database } from '../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export class ListingService {
  // Yeni ilan oluştur
  static async createListing(listingData: ListingInsert): Promise<Listing> {
    // En minimal data ile deneyelim + UUID
    const minimalData = {
      id: crypto.randomUUID(),
      user_id: listingData.user_id,
      listing_type: listingData.listing_type,
      title: listingData.title,
      pickup_location: listingData.pickup_location,
      delivery_location: listingData.delivery_location
    };

    console.log('Attempting to create listing with minimal data:', minimalData);

    const { data, error } = await supabase
      .from('listings')
      .insert([minimalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw new Error(`İlan oluşturulurken hata oluştu: ${error.message}`);
    }

    return data;
  }

  // Kullanıcının ilanlarını getir
  static async getUserListings(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user listings:', error);
      throw new Error(`İlanlar getirilemedi: ${error.message}`);
    }

    return data || [];
  }

  // Tüm aktif ilanları getir
  static async getActiveListings(limit?: number): Promise<Listing[]> {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active listings:', error);
      throw new Error(`Aktif ilanlar getirilemedi: ${error.message}`);
    }

    return data || [];
  }

  // Belirli bir ilanı getir
  static async getListingById(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // İlan bulunamadı
      }
      console.error('Error fetching listing:', error);
      throw new Error(`İlan getirilemedi: ${error.message}`);
    }

    return data;
  }

  // İlan güncelle
  static async updateListing(id: string, updates: ListingUpdate): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      throw new Error(`İlan güncellenemedi: ${error.message}`);
    }

    return data;
  }

  // İlan sil
  static async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting listing:', error);
      throw new Error(`İlan silinemedi: ${error.message}`);
    }
  }

  // İlan görüntülenme sayısını artır
  static async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_listing_views', {
      listing_id: id
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      // Bu hata kritik değil, sessizce geç
    }
  }

  // İlanları filtrele
  static async searchListings({
    searchTerm,
    listingType,
    pickupLocation,
    deliveryLocation,
    minPrice,
    maxPrice,
    priority,
    limit = 50
  }: {
    searchTerm?: string;
    listingType?: 'shipment_request' | 'load_listing';
    pickupLocation?: string;
    deliveryLocation?: string;
    minPrice?: number;
    maxPrice?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    limit?: number;
  }): Promise<Listing[]> {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (listingType) {
      query = query.eq('listing_type', listingType);
    }

    if (pickupLocation) {
      query = query.ilike('pickup_location', `%${pickupLocation}%`);
    }

    if (deliveryLocation) {
      query = query.ilike('delivery_location', `%${deliveryLocation}%`);
    }

    if (minPrice) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching listings:', error);
      throw new Error(`İlan araması başarısız: ${error.message}`);
    }

    return data || [];
  }

  // İlan numarası üret
  static generateListingNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `ILN${year}${month}${day}${random}`;
  }
}
