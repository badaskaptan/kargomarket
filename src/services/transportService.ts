import { supabase } from '../lib/supabase';
import type { Database } from '../types/database-types';

type TransportService = Database['public']['Tables']['transport_services']['Row'];
type TransportServiceInsert = Database['public']['Tables']['transport_services']['Insert'];
type TransportServiceUpdate = Database['public']['Tables']['transport_services']['Update'];

// Form'dan gelen veri tipi
interface FormTransportServiceData {
  user_id: string;
  service_name: string;
  description?: string;
  vehicle_types?: string[] | null;
  capacity?: string | null;
  coverage_areas?: string[];
  pricing?: Record<string, unknown>;
  availability?: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  additional_services?: Record<string, unknown>;
  status?: 'active' | 'inactive' | 'busy' | 'maintenance';
}

export class TransportServiceService {
  // Yeni nakliye hizmeti oluştur
  static async createTransportService(serviceData: FormTransportServiceData): Promise<TransportService> {
    try {
      console.log('Creating transport service...');
      
      // Gerçek şemaya uygun data mapping
      const realData: TransportServiceInsert = {
        user_id: serviceData.user_id,
        service_name: serviceData.service_name,
        description: serviceData.description,
        vehicle_types: serviceData.vehicle_types,
        capacity: serviceData.capacity,
        coverage_areas: serviceData.coverage_areas || [],
        pricing: serviceData.pricing || {},
        availability: serviceData.availability || {},
        contact_info: serviceData.contact_info || {},
        additional_services: serviceData.additional_services || {},
        status: serviceData.status || 'active',
        rating: 0.00,
        rating_count: 0,
        total_jobs: 0,
        is_verified: false,
        metadata: {}
      };

      console.log('Attempting to create transport service:', realData);

      const { data, error } = await supabase
        .from('transport_services')
        .insert([realData])
        .select()
        .single();

      if (error) {
        console.error('Error creating transport service:', error);
        throw new Error(`Nakliye hizmeti oluşturulurken hata oluştu: ${error.message}`);
      }

      console.log('✅ Transport service created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error creating transport service:', error);
      throw new Error(`Nakliye hizmeti oluşturulurken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Kullanıcının nakliye hizmetlerini getir
  static async getUserTransportServices(userId: string): Promise<TransportService[]> {
    try {
      console.log('Fetching user transport services for:', userId);

      const { data, error } = await supabase
        .from('transport_services')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user transport services:', error);
        throw new Error(`Nakliye hizmetleri getirilirken hata oluştu: ${error.message}`);
      }

      console.log('✅ User transport services fetched:', data.length);
      return data || [];
      
    } catch (error) {
      console.error('Error fetching user transport services:', error);
      throw new Error(`Nakliye hizmetleri getirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Tüm aktif nakliye hizmetlerini getir
  static async getActiveTransportServices(limit?: number): Promise<TransportService[]> {
    try {
      console.log('Fetching active transport services...');

      let query = supabase
        .from('transport_services')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching active transport services:', error);
        throw new Error(`Aktif nakliye hizmetleri getirilirken hata oluştu: ${error.message}`);
      }

      console.log('✅ Active transport services fetched:', data.length);
      return data || [];
      
    } catch (error) {
      console.error('Error fetching active transport services:', error);
      throw new Error(`Aktif nakliye hizmetleri getirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Belirli bir nakliye hizmetini getir
  static async getTransportServiceById(id: string): Promise<TransportService | null> {
    try {
      console.log('Fetching transport service by ID:', id);

      const { data, error } = await supabase
        .from('transport_services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Bulunamadı
        }
        console.error('Error fetching transport service:', error);
        throw new Error(`Nakliye hizmeti getirilirken hata oluştu: ${error.message}`);
      }

      console.log('✅ Transport service fetched:', data);
      return data;
      
    } catch (error) {
      console.error('Error fetching transport service:', error);
      throw new Error(`Nakliye hizmeti getirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Nakliye hizmetini güncelle
  static async updateTransportService(id: string, updates: TransportServiceUpdate): Promise<TransportService> {
    try {
      console.log('Updating transport service:', id, updates);

      const { data, error } = await supabase
        .from('transport_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transport service:', error);
        throw new Error(`Nakliye hizmeti güncellenirken hata oluştu: ${error.message}`);
      }

      console.log('✅ Transport service updated successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Error updating transport service:', error);
      throw new Error(`Nakliye hizmeti güncellenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Nakliye hizmetini sil
  static async deleteTransportService(id: string): Promise<void> {
    try {
      console.log('Deleting transport service:', id);

      const { error } = await supabase
        .from('transport_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transport service:', error);
        throw new Error(`Nakliye hizmeti silinirken hata oluştu: ${error.message}`);
      }

      console.log('✅ Transport service deleted successfully');
      
    } catch (error) {
      console.error('Error deleting transport service:', error);
      throw new Error(`Nakliye hizmeti silinirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Nakliye hizmetlerinde arama yap
  static async searchTransportServices(searchParams: {
    origin?: string;
    destination?: string;
    vehicleTypes?: string[];
    status?: string;
    limit?: number;
  }): Promise<TransportService[]> {
    try {
      console.log('Searching transport services with params:', searchParams);

      let query = supabase
        .from('transport_services')
        .select('*')
        .eq('status', searchParams.status || 'active');

      // Araç tipi filtresi (array intersection)
      if (searchParams.vehicleTypes && searchParams.vehicleTypes.length > 0) {
        query = query.overlaps('vehicle_types', searchParams.vehicleTypes);
      }

      // Kapsama alanı filtresi (origin/destination check)
      if (searchParams.origin) {
        query = query.ilike('coverage_areas', `%${searchParams.origin}%`);
      }

      if (searchParams.destination) {
        query = query.ilike('coverage_areas', `%${searchParams.destination}%`);
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      query = query.order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error searching transport services:', error);
        throw new Error(`Nakliye hizmetleri aranırken hata oluştu: ${error.message}`);
      }

      console.log('✅ Transport services search completed:', data.length);
      return data || [];
      
    } catch (error) {
      console.error('Error searching transport services:', error);
      throw new Error(`Nakliye hizmetleri aranırken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }
}
