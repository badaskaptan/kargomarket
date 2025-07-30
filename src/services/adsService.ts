import { supabase } from '../lib/supabase';

// Ad type matching KargoMarketing ads table schema
export interface TargetAudience {
  roles?: string[];
  demographics?: Record<string, unknown>;
  interests?: string[];
}

export interface Ad {
  id: bigint;
  user_id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  target_url?: string;
  placement: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  target_audience?: TargetAudience;
  keywords?: string[];
  created_at: string;
  updated_at: string;
  ad_type: string;
  // Yeni billing alanları
  daily_budget?: number;
  total_cost?: number;
  billing_status?: string;
}

// Interface for Ad combined with advertiser's KargoMarketing profile
export interface AdWithProfile extends Ad {
  video_url?: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    company_name?: string;
  }
}

export interface CreateAdData {
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  target_url?: string;
  placement: string;
  start_date: string;
  end_date: string;
  budget: number;
  target_audience?: TargetAudience;
  keywords?: string[];
  ad_type: string;
  // Yeni billing alanları
  daily_budget?: number;
  total_cost?: number;
  billing_status?: string;
}

export interface UpdateAdData extends Partial<CreateAdData> {
  video_url?: string;
  id: bigint;
}

export class AdsService {
  /**
   * Kullanıcının tüm reklamlarını getirir
   */
  static async getUserAds(): Promise<{ data: AdWithProfile[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get user ads error:', error);
        return { data: null, error: 'Reklamlar yüklenirken bir hata oluştu.' };
      }

      // Attach profile info
      const adsWithProfile = data.map(ad => ({
        ...ad,
        profile: {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          company_name: user.user_metadata?.company_name || ''
        }
      }));

      return { data: adsWithProfile, error: null };
    } catch (error) {
      console.error('Get user ads error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Yeni reklam oluşturur
   */
  static async createAd(adData: CreateAdData): Promise<{ data: Ad | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { data, error } = await supabase
        .from('ads')
        .insert([{
          ...adData,
          user_id: user.id,
          spent: 0,
          impressions: 0,
          clicks: 0,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Create ad error:', error);
        return { data: null, error: 'Reklam oluşturulurken bir hata oluştu.' };
      }

      return { data: data as Ad, error: null };
    } catch (error) {
      console.error('Create ad error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklamı günceller
   */
  static async updateAd(updateData: UpdateAdData): Promise<{ data: Ad | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { id, ...updateFields } = updateData;

      const { data, error } = await supabase
        .from('ads')
        .update({
          ...updateFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update ad error:', error);
        return { data: null, error: 'Reklam güncellenirken bir hata oluştu.' };
      }

      return { data: data as Ad, error: null };
    } catch (error) {
      console.error('Update ad error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklamı siler
   */
  static async deleteAd(adId: bigint): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete ad error:', error);
        return { success: false, error: 'Reklam silinirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Delete ad error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklam durumunu değiştirir (aktif/pasif/duraklatılmış)
   */
  static async updateAdStatus(adId: bigint, newStatus: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Giriş yapmanız gerekiyor.' };
      }

      const validStatuses = ['active', 'paused', 'pending', 'completed', 'rejected'];
      if (!validStatuses.includes(newStatus)) {
        return { success: false, error: 'Geçersiz durum.' };
      }

      const { error } = await supabase
        .from('ads')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Update ad status error:', error);
        return { success: false, error: 'Reklam durumu güncellenirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update ad status error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Aktif reklamları getirir (public - tüm kullanıcılar için) - KargoMarketing PROFİL BİLGİLERİYLE
   */
  static async getActiveAds(placement?: string): Promise<{ data: AdWithProfile[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (placement) {
        query = query.eq('placement', placement);
      }

      const { data: ads, error } = await query;

      if (error) {
        console.error('Get active ads error:', error);
        return { data: null, error: 'Aktif reklamlar yüklenirken bir hata oluştu.' };
      }

      if (!ads || ads.length === 0) {
        return { data: [], error: null };
      }

      // Get unique user IDs from ads
      const userIds = [...new Set(ads.map(ad => ad.user_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, avatar_url, phone, email, website')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles for ads:', profileError);
        // Continue without profile data if it fails
        return { data: ads.map(ad => ({ ...ad })), error: null };
      }

      // Map profiles to ads
      const adsWithProfiles = ads.map(ad => ({
        ...ad,
        profile: profiles?.find(p => p.id === ad.user_id)
      }));

      return { data: adsWithProfiles, error: null };
    } catch (error) {
      console.error('Get active ads error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklam tıklamasını kaydeder
   */
  static async recordAdClick(adId: bigint): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('ad_clicks')
        .insert([{ ad_id: adId }]);

      if (error) {
        console.error('Record ad click error:', error);
        return { success: false, error: 'Tıklama kaydedilirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Record ad click error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklam gösterimini kaydeder
   */
  static async recordAdImpression(adId: bigint): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('ad_impressions')
        .insert([{ ad_id: adId }]);

      if (error) {
        console.error('Record ad impression error:', error);
        return { success: false, error: 'Gösterim kaydedilirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Record ad impression error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }
}
