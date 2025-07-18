import { supabase } from '../lib/supabase';
import type { Database, ExtendedListing } from '../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

// Form'dan gelen veri tipi
interface FormListingData {
  user_id: string;
  listing_type: 'load_listing' | 'shipment_request' | 'transport_service';
  title: string;
  description?: string;
  origin: string;
  destination: string;
  transport_mode?: string;
  vehicle_types?: string[] | null;
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
  related_load_listing_id?: string | null;
  status?: string;
  listing_number?: string;
  available_from_date?: string | null;
  metadata?: import('../types/database-types').GenericMetadata | null;
  transport_details?: Record<string, unknown> | null;
  contact_info?: Record<string, unknown> | null;
  cargo_details?: Record<string, unknown> | null;
}

// ExtendedListing tipi (listing + owner info)
// export interface ExtendedListing extends Listing {
//   owner_name?: string;
//   owner_email?: string;
//   owner_phone?: string;
// }

export class ListingService {
  // Metadata'dan gereksiz alanları temizle
  private static cleanMetadata(metadata: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    // Shallow copy oluştur
    const cleanedMetadata = { ...metadata };

    // required_documents'ı metadata'dan kaldır (root level'da zaten var)
    if ('required_documents' in cleanedMetadata) {
      delete cleanedMetadata.required_documents;
      console.log('🧹 Cleaned required_documents from metadata');
    }

    // transport_details içindeki required_documents'ı da temizle
    if (cleanedMetadata.transport_details && typeof cleanedMetadata.transport_details === 'object') {
      const transportDetails = { ...cleanedMetadata.transport_details };
      if ('required_documents' in transportDetails) {
        delete transportDetails.required_documents;
        cleanedMetadata.transport_details = transportDetails;
        console.log('🧹 Cleaned required_documents from transport_details');
      }
    }

    // vehicle_types duplicate'ini de temizle
    if ('vehicle_types' in cleanedMetadata) {
      delete cleanedMetadata.vehicle_types;
      console.log('🧹 Cleaned duplicate vehicle_types from metadata');
    }

    return cleanedMetadata;
  }

  // Yeni ilan oluştur
  static async createListing(listingData: FormListingData): Promise<Listing> {
    try {
      console.log('Creating listing with real schema...');
      
      // Gerçek şemaya uygun data mapping - sadece var olan alanları kullan
      const realData: ListingInsert = {
        user_id: listingData.user_id,
        listing_type: listingData.listing_type,
        title: listingData.title,
        description: listingData.description,
        origin: listingData.origin,
        destination: listingData.destination,
        transport_mode: (listingData.transport_mode as 'road' | 'sea' | 'air' | 'rail' | 'multimodal') || 'road',
        vehicle_types: listingData.vehicle_types,
        role_type: listingData.role_type as 'buyer' | 'seller' | null,
        load_type: listingData.load_type,
        weight_value: listingData.weight_value,
        weight_unit: listingData.weight_unit,
        volume_value: listingData.volume_value,
        volume_unit: listingData.volume_unit,
        loading_date: listingData.loading_date,
        delivery_date: listingData.delivery_date,
        price_amount: listingData.price_amount,
        price_currency: listingData.price_currency,
        offer_type: listingData.offer_type as 'fixed_price' | 'negotiable' | 'auction' | 'free_quote' | null,
        transport_responsible: listingData.transport_responsible as 'buyer' | 'seller' | 'negotiable' | 'carrier' | null,
        required_documents: listingData.required_documents,
        related_load_listing_id: listingData.related_load_listing_id,
        status: (listingData.status as 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired') || 'active',
        listing_number: listingData.listing_number || this.generateListingNumber(),
        available_from_date: listingData.available_from_date,
        metadata: listingData.metadata ? this.cleanMetadata(listingData.metadata) : null,
        transport_details: listingData.transport_details,
        contact_info: listingData.contact_info,
        cargo_details: listingData.cargo_details,
      };

      console.log('Attempting to create listing with real schema:', realData);
      console.log('🚗 Vehicle Types Check:', { 
        input: listingData.vehicle_types, 
        mapped: realData.vehicle_types 
      });

      // Debug: Test data yapısını kontrol et
      console.log('🔍 Data keys:', Object.keys(realData));
      console.log('🔍 Data types:', Object.entries(realData).reduce((acc, [key, value]) => {
        acc[key] = typeof value;
        return acc;
      }, {} as Record<string, string>));

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
        console.log('🔍 Debug: Fetching profile for user_id:', listing.user_id);
        
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
            user_role,
            total_listings,
            total_completed_transactions,
            rating_count
          `)
          .eq('id', listing.user_id)
          .single();

        console.log('📊 Debug: Profile data result:', {
          profileData,
          profileError,
          listing_id: listing.id,
          user_id: listing.user_id
        });

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
          user_role?: string;
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
          owner_user_type: profile?.user_role || '',
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
    console.log('📝 ListingService.updateListing called with:');
    console.log('- Listing ID:', id);
    console.log('- Updates object:', JSON.stringify(updates, null, 2));
    console.log('- Updates.metadata:', JSON.stringify(updates.metadata, null, 2));
    console.log('- Updates.required_documents:', updates.required_documents);

    // Metadata'ı temizle (eğer varsa)
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.metadata) {
      cleanedUpdates.metadata = this.cleanMetadata(cleanedUpdates.metadata);
      console.log('🧹 Cleaned metadata for update:', JSON.stringify(cleanedUpdates.metadata, null, 2));
    }

    const { data, error } = await supabase
      .from('listings')
      .update({ ...cleanedUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating listing:', error);
      throw new Error(`İlan güncellenemedi: ${error.message}`);
    }

    console.log('✅ Listing updated successfully:');
    console.log('- Updated data.metadata:', JSON.stringify(data.metadata, null, 2));
    console.log('- Updated data.required_documents:', data.required_documents);

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
      query = query.gte('price_amount', minPrice);
    }

    if (maxPrice) {
      query = query.lte('price_amount', maxPrice);
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
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `NK${year}${month}${day}${random}`;
  }

  // Veritabanındaki mevcut metadata'ları temizle
  static async cleanAllListingsMetadata(): Promise<void> {
    try {
      console.log('🧹 Starting metadata cleanup for all listings...');
      
      // Tüm ilanları çek
      const { data: listings, error: fetchError } = await supabase
        .from('listings')
        .select('id, metadata')
        .not('metadata', 'is', null);

      if (fetchError) {
        console.error('Error fetching listings for cleanup:', fetchError);
        return;
      }

      if (!listings || listings.length === 0) {
        console.log('No listings with metadata found');
        return;
      }

      console.log(`Found ${listings.length} listings with metadata to clean`);

      // Her ilan için metadata'yı temizle
      for (const listing of listings) {
        const cleanedMetadata = this.cleanMetadata(listing.metadata);
        
        // Eğer metadata değiştiyse güncelle
        if (JSON.stringify(cleanedMetadata) !== JSON.stringify(listing.metadata)) {
          console.log(`🧹 Cleaning metadata for listing: ${listing.id}`);
          
          const { error: updateError } = await supabase
            .from('listings')
            .update({ metadata: cleanedMetadata })
            .eq('id', listing.id);

          if (updateError) {
            console.error(`Error cleaning metadata for listing ${listing.id}:`, updateError);
          } else {
            console.log(`✅ Cleaned metadata for listing: ${listing.id}`);
          }
        }
      }

      console.log('🧹 Metadata cleanup completed');
    } catch (error) {
      console.error('Error during metadata cleanup:', error);
    }
  }
}


