import { supabase } from '../lib/supabase';
import type { ServiceOffer, ServiceOfferInsert, ServiceOfferUpdate, ExtendedServiceOffer } from '../types/service-offer-types';

export class ServiceOfferService {
  // Kullanıcının verdiği service tekliflerini getir (sent service offers)
  static async getSentServiceOffers(userId: string): Promise<ExtendedServiceOffer[]> {
    console.log('📤 Fetching sent service offers for user:', userId);

    try {
      const { data: offers, error: offersError } = await supabase
        .from('service_offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Sent service offers fetch failed:', offersError);
        throw new Error(`Sent service offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Base service offers fetched:', offers?.length || 0);

      if (!offers || offers.length === 0) {
        console.log('✅ No sent service offers found');
        return [];
      }

      const extendedOffers: ExtendedServiceOffer[] = offers.map(offer => ({
        ...offer,
        transport_service: null,
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
        .from('listings')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_type', 'transport_service');

      if (userServicesError) {
        console.error('❌ User transport services fetch failed:', userServicesError);
        throw new Error(`User transport services fetch failed: ${userServicesError.message}`);
      }

      console.log('✅ User transport services fetched:', userServices?.length || 0);

      if (!userServices || userServices.length === 0) {
        console.log('✅ No user transport services found');
        return [];
      }

      const serviceIds = userServices.map(service => service.id);

      // Bu hizmetlere gelen teklifleri al
      const { data: offers, error: offersError } = await supabase
        .from('service_offers')
        .select('*')
        .in('transport_service_id', serviceIds)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('❌ Received service offers fetch failed:', offersError);
        throw new Error(`Received service offers fetch failed: ${offersError.message}`);
      }

      console.log('✅ Base received service offers fetched:', offers?.length || 0);

      if (!offers || offers.length === 0) {
        console.log('✅ No received service offers found');
        return [];
      }

      const extendedOffers: ExtendedServiceOffer[] = offers.map(offer => ({
        ...offer,
        transport_service: null,
        service_owner: null,
        sender: null
      }));

      console.log('✅ Received service offers processed:', extendedOffers.length);
      return extendedOffers;

    } catch (error) {
      console.error('❌ Full received service offers error:', error);
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

      if (existingService.user_id === offerData.user_id) {
        throw new Error('Kendi nakliye hizmetinize teklif veremezsiniz');
      }

      console.log('✅ Transport service verified:', existingService);

      const { data, error } = await supabase
        .from('service_offers')
        .insert({
          ...offerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Service offer creation failed with error:', error);
        throw new Error(`Service offer creation failed: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from service offer creation');
        throw new Error('No data returned from service offer creation');
      }

      console.log('✅ Service offer created successfully:', data.id);
      return data;
    } catch (err) {
      console.error('❌ Exception during service offer creation:', err);
      throw err;
    }
  }

  // Service teklifi güncelle
  static async updateServiceOffer(offerId: string, updates: ServiceOfferUpdate): Promise<ServiceOffer> {
    console.log('📝 Updating service offer:', offerId, updates);

    const { data, error } = await supabase
      .from('service_offers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Service offer update failed:', error);
      throw new Error(`Service offer update failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from service offer update');
    }

    console.log('✅ Service offer updated successfully:', data.id);
    return data;
  }

  // Service teklifi sil
  static async deleteServiceOffer(offerId: string): Promise<boolean> {
    console.log('🗑️ Deleting service offer:', offerId);

    const { error } = await supabase
      .from('service_offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      console.error('❌ Service offer deletion failed:', error);
      throw new Error(`Service offer deletion failed: ${error.message}`);
    }

    console.log('✅ Service offer deleted successfully:', offerId);
    return true;
  }

  // Service teklifi kabul et
  static async acceptServiceOffer(offerId: string): Promise<ServiceOffer> {
    return this.updateServiceOffer(offerId, { status: 'accepted' });
  }

  // Service teklifi reddet
  static async rejectServiceOffer(offerId: string): Promise<ServiceOffer> {
    return this.updateServiceOffer(offerId, { status: 'rejected' });
  }

  // Service teklifi geri çek
  static async withdrawServiceOffer(offerId: string): Promise<ServiceOffer> {
    return this.updateServiceOffer(offerId, { status: 'withdrawn' });
  }

  // Belirli bir transport service için teklifleri getir
  static async getOffersForTransportService(serviceId: string): Promise<ExtendedServiceOffer[]> {
    console.log('📋 Fetching offers for transport service:', serviceId);

    const { data, error } = await supabase
      .from('service_offers')
      .select(`
        *,
        sender:profiles!service_offers_user_id_fkey (
          id, full_name, company_name, phone, email, avatar_url, rating
        )
      `)
      .eq('transport_service_id', serviceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Service offers fetch failed:', error);
      throw new Error(`Service offers fetch failed: ${error.message}`);
    }

    console.log('✅ Service offers fetched:', data?.length || 0);
    return data || [];
  }

  // Service teklif istatistikleri
  static async getServiceOfferStats(userId: string): Promise<{
    sent: { total: number; pending: number; accepted: number; rejected: number };
    received: { total: number; pending: number; accepted: number; rejected: number };
  }> {
    console.log('📊 Fetching service offer stats for user:', userId);

    // Verilen teklifler
    const { data: sentOffers, error: sentError } = await supabase
      .from('service_offers')
      .select('status')
      .eq('user_id', userId);

    if (sentError) {
      console.error('❌ Sent service offer stats fetch failed:', sentError);
      throw new Error(`Sent service offer stats fetch failed: ${sentError.message}`);
    }

    // Alınan teklifler - önce kullanıcının transport service'lerini al
    const { data: userServices, error: servicesError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_type', 'transport_service');

    if (servicesError) {
      console.error('❌ User transport services fetch failed:', servicesError);
      throw new Error(`User transport services fetch failed: ${servicesError.message}`);
    }

    const serviceIds = userServices?.map(service => service.id) || [];

    const { data: receivedOffers, error: receivedError } = await supabase
      .from('service_offers')
      .select('status')
      .in('transport_service_id', serviceIds);

    if (receivedError) {
      console.error('❌ Received service offer stats fetch failed:', receivedError);
      throw new Error(`Received service offer stats fetch failed: ${receivedError.message}`);
    }

    // İstatistikleri hesapla
    const sentStats = this.calculateStats(sentOffers || []);
    const receivedStats = this.calculateStats(receivedOffers || []);

    console.log('✅ Service offer stats calculated:', { sent: sentStats, received: receivedStats });
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
