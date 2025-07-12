import { supabase } from '../lib/supabase.js';
// ExtendedListing tipi (listing + owner info)
// export interface ExtendedListing extends Listing {
//   owner_name?: string;
//   owner_email?: string;
//   owner_phone?: string;
// }
export class ListingService {
    // Yeni ilan oluştur
    static async createListing(listingData) {
        try {
            console.log('Creating listing with real schema...');
            // Gerçek şemaya uygun data mapping - sadece var olan alanları kullan
            const realData = {
                user_id: listingData.user_id,
                listing_type: listingData.listing_type,
                title: listingData.title,
                description: listingData.description,
                origin: listingData.origin,
                destination: listingData.destination,
                transport_mode: listingData.transport_mode || 'road',
                vehicle_types: listingData.vehicle_types,
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
                required_documents: listingData.required_documents,
                related_load_listing_id: listingData.related_load_listing_id,
                status: listingData.status || 'active',
                listing_number: listingData.listing_number || this.generateListingNumber(),
                available_from_date: listingData.available_from_date,
                metadata: listingData.metadata,
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
            }, {}));
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
        }
        catch (error) {
            console.error('Error creating listing:', error);
            throw new Error(`İlan oluşturulurken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
    }
    // Kullanıcının ilanlarını getir (profil join'li)
    static async getUserListings(userId) {
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
        const listingsWithOwner = await Promise.all(data.map(async (listing) => {
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
            const profile = profileData;
            return {
                ...listing,
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
        }));
        return listingsWithOwner;
    }
    // Tüm aktif ilanları getir
    static async getActiveListings(limit) {
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
    static async getListingById(id) {
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
    static async updateListing(id, updates) {
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
    static async deleteListing(id) {
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
    static async incrementViewCount(id) {
        const { error } = await supabase.rpc('increment_listing_views', {
            listing_id: id
        });
        if (error) {
            console.error('Error incrementing view count:', error);
            // Bu hata kritik değil, sessizce geç
        }
    }
    // İlanları filtrele
    static async searchListings({ searchTerm, listingType, pickupLocation, deliveryLocation, minPrice, maxPrice, priority, limit = 50 }) {
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
    static generateListingNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `NK${year}${month}${day}${random}`;
    }
}
