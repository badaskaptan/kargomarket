import { supabase } from '../lib/supabase';
import type { ServiceOffer, ServiceOfferInsert, ServiceOfferUpdate, ExtendedServiceOffer } from '../types/service-offer-types';

export class ServiceOfferService {
  // Kullanıcının gönderdiği service tekliflerini getir (sent service offers)
  static async getSentServiceOffers(userId: string): Promise<ExtendedServiceOffer[]> {
    console.log('📤 Fetching sent service offers for user:', userId);

    try {
      const { data: offers, error: offersError } = await supabase
        .from('service_offers')
        .select(`
          *,
          transport_service:transport_services (
            id,
            service_number,
            title,
            origin,
            destination,
            user_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Sent service offers fetch failed:', offersError);
        throw new Error(`Sent service offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Sent service offers with transport_service data fetched:', offers?.length || 0);
      console.log('📊 Raw sent service offers data:', offers);

      if (!offers || offers.length === 0) {
        console.log('✅ No sent service offers found');
        return [];
      }

      const extendedOffers: ExtendedServiceOffer[] = offers.map(offer => ({
        ...offer,
        service_owner: null,
        sender: null
      }));

      console.log('✅ Sent service offers processed:', extendedOffers.length);
      return extendedOffers;

    } catch (error) {
      console.error('❌ Full sent service offers error:', error);
      throw error;
    }
  }

  // Kullanıcının aldığı service tekliflerini getir (received service offers)
  static async getReceivedServiceOffers(userId: string): Promise<ExtendedServiceOffer[]> {
    console.log('📥 Fetching received service offers for user:', userId);

    try {
      // Önce kullanıcının transport service'lerini bul
      const { data: userServices, error: userServicesError } = await supabase
        .from('transport_services')
        .select('id, title, service_number')
        .eq('user_id', userId);

      if (userServicesError) {
        console.error('❌ User transport services fetch failed:', userServicesError);
        throw new Error(`User transport services fetch failed: ${userServicesError.message}`);
      }

      console.log('✅ User transport services fetched:', userServices?.length || 0);
      console.log('📊 Raw user transport services:', userServices);

      if (!userServices || userServices.length === 0) {
        console.log('✅ No user transport services found');
        return [];
      }

      const serviceIds = userServices.map(service => service.id);
      console.log('🔍 Service IDs to query for received offers:', serviceIds);
      console.log('🔍 Query logic: Looking for service_offers where transport_service_id IN', serviceIds, 'AND user_id !=', userId);

      // Bu hizmetlere gelen teklifleri al (kendi verdiği teklifler hariç)
      const { data: offers, error: offersError } = await supabase
        .from('service_offers')
        .select(`
          *,
          transport_service:transport_services (
            id,
            service_number,
            title,
            origin,
            destination,
            user_id
          )
        `)
        .in('transport_service_id', serviceIds)
        .neq('user_id', userId) // Kendi verdiği teklifler hariç
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Received service offers fetch failed:', offersError);
        throw new Error(`Received service offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Received service offers with transport_service data fetched:', offers?.length || 0);
      console.log('📊 Raw received service offers data:', offers);

      // Debug: Check each offer individually
      if (offers && offers.length > 0) {
        offers.forEach((offer, index) => {
          console.log(`🔍 Offer ${index + 1}:`, {
            id: offer.id,
            message: offer.message,
            price_amount: offer.price_amount,
            transport_service_id: offer.transport_service_id,
            offer_user_id: offer.user_id,
            transport_service_owner: offer.transport_service?.user_id,
            current_user: userId,
            should_be_received: offer.transport_service?.user_id === userId && offer.user_id !== userId
          });
        });
      }

      if (!offers || offers.length === 0) {
        console.log('⚠️ No received service offers found - but database shows data exists!');
        console.log('🔍 Double-checking with direct query...');

        // Direct query for debugging
        const { data: directQuery } = await supabase
          .from('service_offers')
          .select('*')
          .in('transport_service_id', serviceIds);

        console.log('🔍 Direct query result:', directQuery?.length || 0, directQuery);
        return [];
      }

      const extendedOffers: ExtendedServiceOffer[] = offers.map(offer => ({
        ...offer,
        service_owner: null,
        sender: null
      }));

      console.log('✅ Received service offers processed:', extendedOffers.length);
      return extendedOffers;

    } catch (error) {
      console.error('❌ Full received service offers error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Yeni service teklifi oluştur
  static async createServiceOffer(offerData: ServiceOfferInsert): Promise<ServiceOffer> {
    console.log('📝 Creating new service offer with data:', JSON.stringify(offerData, null, 2));

    try {
      // Önce transport service'in gerçekten var olup olmadığını kontrol et
      const { data: existingService, error: serviceCheckError } = await supabase
        .from('transport_services') // listings yerine transport_services tablosundan çek
        .select('id, title, user_id, status')
        .eq('id', offerData.transport_service_id)
        .eq('status', 'active')
        .maybeSingle();

      if (serviceCheckError) {
        console.error('❌ Transport service verification failed:', serviceCheckError);
        throw new Error(`Transport service verification failed: ${serviceCheckError.message}`);
      }

      if (!existingService) {
        console.error('❌ Transport service not found with ID:', offerData.transport_service_id);
        throw new Error(`Transport service not found with ID: ${offerData.transport_service_id}`);
      }

      if (existingService.status !== 'active') {
        throw new Error('Bu nakliye hizmeti aktif değil');
      }

      // Kullanıcının kendi hizmetine teklif vermesini engelle
      if (existingService.user_id === offerData.user_id) {
        throw new Error('Kendi nakliye hizmetinize teklif veremezsiniz');
      }

      // Service offer oluştur
      const { data, error } = await supabase
        .from('service_offers')
        .insert([{
          ...offerData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Service offer creation failed:', error);
        throw new Error(`Service offer creation failed: ${error.message}`);
      }

      console.log('✅ Service offer created successfully:', data.id);
      return data;

    } catch (error) {
      console.error('❌ Full service offer creation error:', error);
      throw error;
    }
  }

  // Service teklifi güncelle
  static async updateServiceOffer(offerId: string, updates: ServiceOfferUpdate): Promise<ServiceOffer> {
    console.log('📝 Updating service offer:', offerId, 'with updates:', JSON.stringify(updates, null, 2));

    try {
      const { data, error } = await supabase
        .from('service_offers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) {
        console.error('❌ Service offer update failed:', error);
        throw new Error(`Service offer update failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Service offer not found');
      }

      console.log('✅ Service offer updated successfully:', data.id);
      return data;

    } catch (error) {
      console.error('❌ Full service offer update error:', error);
      throw error;
    }
  }

  // Service teklifi sil
  static async deleteServiceOffer(offerId: string): Promise<void> {
    console.log('🗑️ Deleting service offer:', offerId);

    try {
      const { error } = await supabase
        .from('service_offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('❌ Service offer deletion failed:', error);
        throw new Error(`Service offer deletion failed: ${error.message}`);
      }

      console.log('✅ Service offer deleted successfully:', offerId);

    } catch (error) {
      console.error('❌ Full service offer deletion error:', error);
      throw error;
    }
  }

  // Service teklifi geri çek
  static async withdrawServiceOffer(offerId: string): Promise<ServiceOffer> {
    console.log('↩️ Withdrawing service offer:', offerId);

    try {
      const { data, error } = await supabase
        .from('service_offers')
        .update({
          status: 'withdrawn',
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) {
        console.error('❌ Service offer withdrawal failed:', error);
        throw new Error(`Service offer withdrawal failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Service offer not found');
      }

      console.log('✅ Service offer withdrawn successfully:', data.id);
      return data;

    } catch (error) {
      console.error('❌ Full service offer withdrawal error:', error);
      throw error;
    }
  }

  // ID ile service teklifi getir
  static async getServiceOfferById(offerId: string): Promise<ExtendedServiceOffer | null> {
    console.log('🔍 Fetching service offer by ID:', offerId);

    try {
      const { data, error } = await supabase
        .from('service_offers')
        .select(`
          *,
          transport_service:transport_services (
            id,
            service_number,
            title,
            origin,
            destination,
            user_id
          )
        `)
        .eq('id', offerId)
        .single();

      if (error) {
        console.error('❌ Service offer fetch by ID failed:', error);
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Service offer fetch failed: ${error.message}`);
      }

      console.log('✅ Service offer fetched by ID:', data?.id);

      const extendedOffer: ExtendedServiceOffer = {
        ...data,
        service_owner: null,
        sender: null
      };

      return extendedOffer;

    } catch (error) {
      console.error('❌ Full service offer fetch by ID error:', error);
      throw error;
    }
  }

  // Transport service'e gelen tüm teklifleri getir (service owner için)
  static async getOffersForTransportService(transportServiceId: string): Promise<ExtendedServiceOffer[]> {
    console.log('📋 Fetching offers for transport service:', transportServiceId);

    try {
      const { data: offers, error } = await supabase
        .from('service_offers')
        .select(`
          *,
          transport_service:transport_services (
            id,
            service_number,
            title,
            origin,
            destination,
            user_id
          )
        `)
        .eq('transport_service_id', transportServiceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Transport service offers fetch failed:', error);
        throw new Error(`Transport service offers fetch failed: ${error.message}`);
      }

      console.log('✅ Transport service offers fetched:', offers?.length || 0);

      if (!offers || offers.length === 0) {
        return [];
      }

      const extendedOffers: ExtendedServiceOffer[] = offers.map(offer => ({
        ...offer,
        service_owner: null,
        sender: null
      }));

      return extendedOffers;

    } catch (error) {
      console.error('❌ Full transport service offers fetch error:', error);
      throw error;
    }
  }
}
