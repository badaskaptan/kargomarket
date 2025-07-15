// ====================================
// TRANSPORT SERVICE - YENİ NAKLİYE HİZMETİ SERVİSİ
// transport_services tablosu için CRUD operasyonları
// ====================================
import { supabase } from '../lib/supabase';
export class TransportServiceService {
    // Yeni nakliye hizmeti oluştur
    static async createTransportService(serviceData) {
        console.log('🚀 Creating new transport service:', serviceData);
        const { data, error } = await supabase
            .from('transport_services')
            .insert([serviceData])
            .select()
            .single();
        if (error) {
            console.error('❌ Error creating transport service:', error);
            throw new Error(`Nakliye hizmeti oluşturulamadı: ${error.message}`);
        }
        console.log('✅ Transport service created successfully:', data);
        return data;
    }
    // Tüm aktif nakliye hizmetlerini getir
    static async getAllActiveServices() {
        const { data, error } = await supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Error fetching transport services:', error);
            throw new Error(`Nakliye hizmetleri getirilemedi: ${error.message}`);
        }
        return data || [];
    }
    // Kullanıcının nakliye hizmetlerini getir
    static async getUserServices(userId) {
        try {
            console.log('Fetching user transport services for:', userId);
            const { data, error } = await supabase
                .from('transport_services')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching user transport services:', error);
                throw new Error(`Transport services getirilirken hata oluştu: ${error.message}`);
            }
            console.log('✅ User transport services fetched:', data.length);
            return data || [];
        }
        catch (error) {
            console.error('Error fetching user transport services:', error);
            throw new Error(`Transport services getirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
    }
    // ID ile nakliye hizmeti getir
    static async getServiceById(id) {
        const { data, error } = await supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Bulunamadı
            }
            console.error('❌ Error fetching transport service:', error);
            throw new Error(`Nakliye hizmeti getirilemedi: ${error.message}`);
        }
        return data;
    }
    // Nakliye hizmetini güncelle
    static async updateService(id, updates) {
        const { data, error } = await supabase
            .from('transport_services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('❌ Error updating transport service:', error);
            throw new Error(`Nakliye hizmeti güncellenemedi: ${error.message}`);
        }
        return data;
    }
    // Nakliye hizmetini sil
    static async deleteService(id) {
        const { error } = await supabase
            .from('transport_services')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('❌ Error deleting transport service:', error);
            throw new Error(`Nakliye hizmeti silinemedi: ${error.message}`);
        }
    }
    // Görüntüleme sayısını artır
    static async incrementViewCount(id) {
        const { error } = await supabase.rpc('increment_transport_service_views', {
            service_id: id
        });
        if (error) {
            console.error('❌ Error incrementing view count:', error);
            // Bu hata kritik değil, sessizce devam et
        }
    }
    // Taşıma moduna göre filtrele
    static async getServicesByTransportMode(mode) {
        const { data, error } = await supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('transport_mode', mode)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Error fetching services by transport mode:', error);
            throw new Error(`${mode} nakliye hizmetleri getirilemedi: ${error.message}`);
        }
        return data || [];
    }
    // Lokasyona göre ara
    static async searchServicesByLocation(origin, destination) {
        let query = supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('status', 'active');
        if (origin) {
            query = query.ilike('origin', `%${origin}%`);
        }
        if (destination) {
            query = query.ilike('destination', `%${destination}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Error searching services by location:', error);
            throw new Error(`Lokasyon araması başarısız: ${error.message}`);
        }
        return data || [];
    }
    // Öne çıkan hizmetleri getir
    static async getFeaturedServices() {
        const { data, error } = await supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('status', 'active')
            .eq('is_featured', true)
            .gte('featured_until', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) {
            console.error('❌ Error fetching featured services:', error);
            throw new Error(`Öne çıkan hizmetler getirilemedi: ${error.message}`);
        }
        return data || [];
    }
    // Service number ile ara (unique olduğu için)
    static async getServiceByNumber(serviceNumber) {
        const { data, error } = await supabase
            .from('transport_services')
            .select('*')
            .eq('service_number', serviceNumber)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Bulunamadı
            }
            console.error('❌ Error fetching service by number:', error);
            throw new Error(`Servis numarası ile arama başarısız: ${error.message}`);
        }
        return data;
    }
    // Tarih aralığına göre müsait hizmetleri getir
    static async getAvailableServicesInDateRange(startDate, endDate) {
        const { data, error } = await supabase
            .from('transport_services')
            .select(`
        *,
        profiles!transport_services_user_id_fkey (
          full_name,
          company_name,
          avatar_url,
          rating
        )
      `)
            .eq('status', 'active')
            .gte('available_from_date', startDate)
            .lte('available_until_date', endDate)
            .order('available_from_date', { ascending: true });
        if (error) {
            console.error('❌ Error fetching services by date range:', error);
            throw new Error(`Tarih aralığı araması başarısız: ${error.message}`);
        }
        return data || [];
    }
}
// Helper fonksiyonlar
export const generateServiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    return `NK${year}${month}${day}${hour}${minute}${second}`;
};
// Validasyon fonksiyonları
export const validateIMO = (imo) => {
    // IMO prefix'li veya prefix'siz 7 haneli numarayı kabul et
    const cleaned = imo.trim().replace(/^IMO\s?/i, '');
    return /^\d{7}$/.test(cleaned);
};
export const validateMMSI = (mmsi) => {
    // MMSI 9 haneli olmalı ve ilk hane 0 olamaz
    const cleaned = mmsi.trim();
    return /^\d{9}$/.test(cleaned) && !cleaned.startsWith('0');
};
