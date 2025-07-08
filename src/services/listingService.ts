import { supabase } from '../lib/supabase';
import type { Database, ExtendedListing } from '../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];
// type ListingInsert = Database['public']['Tables']['listings']['Insert']; // Şu an kullanılmıyor
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

// Form'dan gelen veri tipi
interface FormListingData {
  user_id: string;
  listing_type: 'load_listing' | 'shipment_request';
  title: string;
  description?: string;
  origin: string;
  destination: string;
  transport_mode?: string;
  role_type?: string | null;
  load_type?: string | null;
  weight_value?: number | null;
  weight_unit?: string;
  volume_value?: number | null;
  volume_unit?: string;
  loading_date?: string | null;
  delivery_date?: string | null;
  price_amount?: number | null;
  price_currency?: string;
  offer_type?: string | null;
  transport_responsible?: string | null;
  required_documents?: string[] | null;
  status?: string;
}

// ExtendedListing tipi (listing + owner info)
// export interface ExtendedListing extends Listing {
//   owner_name?: string;
//   owner_email?: string;
//   owner_phone?: string;
// }

export class ListingService {
  // Yeni ilan oluştur
  static async createListing(listingData: FormListingData): Promise<Listing> {
    try {
      console.log('Creating listing with real schema...');
      
      // Gerçek şemaya uygun data mapping
      const realData = {
        user_id: listingData.user_id,
        listing_type: listingData.listing_type,
        title: listingData.title,
        description: listingData.description,
        origin: listingData.origin, // Doğru alan adı
        destination: listingData.destination, // Doğru alan adı
        transport_mode: listingData.transport_mode || 'road', // Zorunlu alan
        role_type: listingData.role_type,
        load_type: listingData.load_type,
        weight_value: listingData.weight_value,
        weight_unit: listingData.weight_unit,
        volume_value: listingData.volume_value,
        volume_unit: listingData.volume_unit,
        loading_date: listingData.loading_date,
        delivery_date: listingData.delivery_date,
        price_amount: listingData.price_amount,
        price_currency: listingData.price_currency,
        offer_type: listingData.offer_type,
        transport_responsible: listingData.transport_responsible,
        required_documents: listingData.required_documents, // Evrak listesi
        status: listingData.status || 'active',
        listing_number: this.generateListingNumber(), // Manuel olarak listing_number ekle
      };

      console.log('Attempting to create listing with real schema:', realData);

      const { data, error } = await supabase
        .from('listings')
        .insert([realData])
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        throw new Error(`İlan oluşturulurken hata oluştu: ${error.message}`);
      }

      console.log('✅ Listing created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error(`İlan oluşturulurken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Kullanıcının ilanlarını getir (profil join'li)
  static async getUserListings(userId: string): Promise<ExtendedListing[]> {
    // Önce basit query ile deneyelim
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user listings:', error);
      throw new Error(`İlanlar getirilemedi: ${error.message}`);
    }

    // Eğer data varsa, her ilan için ayrı ayrı profil bilgilerini çekelim
    if (!data || data.length === 0) {
      console.log('No listings found for user:', userId);
      return [];
    }

    console.log('Found listings:', data.length);

    // Her ilan için owner bilgilerini ekle
    const listingsWithOwner = await Promise.all(
      data.map(async (listing) => {
        // Profil bilgilerini ayrı çekelim
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            full_name,
            email,
            phone,
            company_name,
            city,
            rating,
            address,
            tax_office,
            tax_number,
            avatar_url,
            user_type,
            total_listings,
            total_completed_transactions,
            rating_count
          `)
          .eq('id', listing.user_id)
          .single();

        if (profileError) {
          console.warn('Profile not found for user:', listing.user_id, profileError);
        }

        const profile = profileData as {
          full_name?: string;
          email?: string;
          phone?: string;
          company_name?: string;
          city?: string;
          rating?: number;
          address?: string;
          tax_office?: string;
          tax_number?: string;
          avatar_url?: string;
          user_type?: string;
          total_listings?: number;
          total_completed_transactions?: number;
          rating_count?: number;
        } | null;

        return {
          ...(listing as Listing),
          owner_name: profile?.full_name || '',
          owner_email: profile?.email || '',
          owner_phone: profile?.phone || '',
          owner_company: profile?.company_name || '',
          owner_city: profile?.city || '',
          owner_rating: profile?.rating || 0,
          owner_address: profile?.address || '',
          owner_tax_office: profile?.tax_office || '',
          owner_tax_number: profile?.tax_number || '',
          owner_avatar_url: profile?.avatar_url || '',
          owner_user_type: profile?.user_type || '',
          owner_total_listings: profile?.total_listings || 0,
          owner_total_completed_transactions: profile?.total_completed_transactions || 0,
          owner_rating_count: profile?.rating_count || 0,
        };
      })
    );

    return listingsWithOwner;
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
      query = query.ilike('origin', `%${pickupLocation}%`);
    }

    if (deliveryLocation) {
      query = query.ilike('destination', `%${deliveryLocation}%`);
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
