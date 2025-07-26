import { supabase } from '../lib/supabase';

export interface UserBalance {
  user_id: string;
  current_balance: number;
  total_spent: number;
  currency: string;
  last_updated: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface AdPricing {
  banner: {
    daily_rate: number;
    minimum_budget: number;
  };
  video: {
    daily_rate: number;
    minimum_budget: number;
  };
  text: {
    daily_rate: number;
    minimum_budget: number;
  };
}

export const AD_PRICING: AdPricing = {
  banner: {
    daily_rate: 50, // 50 TL/gün
    minimum_budget: 100
  },
  video: {
    daily_rate: 100, // 100 TL/gün
    minimum_budget: 200
  },
  text: {
    daily_rate: 25, // 25 TL/gün
    minimum_budget: 50
  }
};

// Sistem ayarları
export const BILLING_CONFIG = {
  // Ücretsiz kullanım modu (gelişim aşamasında true)
  FREE_MODE: true,
  
  // İlk kayıtta verilen hediye bakiye (TL)
  WELCOME_BONUS: 500,
  
  // Hediye bakiye açıklaması
  WELCOME_BONUS_DESCRIPTION: 'Hoş geldin hediyesi - Ücretsiz reklam bakiyesi'
};

export class BillingService {
  /**
   * Kullanıcının bakiye bilgilerini getirir
   */
  static async getUserBalance(): Promise<{ data: UserBalance | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Get user balance error:', error);
        return { data: null, error: 'Bakiye bilgileri yüklenirken bir hata oluştu.' };
      }

      // Eğer kullanıcının bakiye kaydı yoksa oluştur
      if (!data) {
        const welcomeBalance = BILLING_CONFIG.FREE_MODE ? BILLING_CONFIG.WELCOME_BONUS : 0;
        
        const { data: newBalance, error: createError } = await supabase
          .from('user_balances')
          .insert([{
            user_id: user.id,
            current_balance: welcomeBalance,
            total_spent: 0,
            currency: 'TRY'
          }])
          .select()
          .single();

        if (createError) {
          console.error('Create user balance error:', createError);
          return { data: null, error: 'Bakiye kaydı oluşturulurken bir hata oluştu.' };
        }

        // Eğer hoş geldin bonusu varsa transaction kaydı oluştur
        if (welcomeBalance > 0) {
          await supabase
            .from('billing_transactions')
            .insert([{
              user_id: user.id,
              amount: welcomeBalance,
              type: 'credit',
              description: BILLING_CONFIG.WELCOME_BONUS_DESCRIPTION,
              reference_id: 'welcome_bonus',
              status: 'completed'
            }]);
        }

        return { data: newBalance as UserBalance, error: null };
      }

      return { data: data as UserBalance, error: null };
    } catch (error) {
      console.error('Get user balance error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Bakiye ekler (ödeme sonrası)
   */
  static async addBalance(amount: number, paymentReference: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Giriş yapmanız gerekiyor.' };
      }

      if (amount <= 0) {
        return { success: false, error: 'Geçersiz miktar.' };
      }

      // Transaction tablosuna kayıt ekle
      const { error: transactionError } = await supabase
        .from('billing_transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'credit',
          description: `Bakiye yükleme - ${amount} TL`,
          reference_id: paymentReference,
          status: 'completed'
        }]);

      if (transactionError) {
        console.error('Add transaction error:', transactionError);
        return { success: false, error: 'İşlem kaydedilirken bir hata oluştu.' };
      }

      // Bakiyeyi güncelle
      const { error: updateError } = await supabase.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'add'
      });

      if (updateError) {
        console.error('Update balance error:', updateError);
        return { success: false, error: 'Bakiye güncellenirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Add balance error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklam için bakiye düşer
   */
  static async deductBalance(amount: number, description: string, adId?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Giriş yapmanız gerekiyor.' };
      }

      // Ücretsiz mod aktifse bakiye kontrolü yapma
      if (BILLING_CONFIG.FREE_MODE) {
        // Sadece transaction kaydı oluştur (bakiye düşürme)
        const { error: transactionError } = await supabase
          .from('billing_transactions')
          .insert([{
            user_id: user.id,
            amount: -amount,
            type: 'debit',
            description: `${description} (Ücretsiz mod)`,
            reference_id: adId,
            status: 'completed'
          }]);

        if (transactionError) {
          console.error('Add transaction error:', transactionError);
          return { success: false, error: 'İşlem kaydedilirken bir hata oluştu.' };
        }

        return { success: true, error: null };
      }

      // Normal ücretli mod - bakiyeyi kontrol et
      const { data: balance } = await this.getUserBalance();
      if (!balance || balance.current_balance < amount) {
        return { success: false, error: 'Yetersiz bakiye. Lütfen bakiye ekleyin.' };
      }

      // Transaction tablosuna kayıt ekle
      const { error: transactionError } = await supabase
        .from('billing_transactions')
        .insert([{
          user_id: user.id,
          amount: -amount,
          type: 'debit',
          description,
          reference_id: adId,
          status: 'completed'
        }]);

      if (transactionError) {
        console.error('Add transaction error:', transactionError);
        return { success: false, error: 'İşlem kaydedilirken bir hata oluştu.' };
      }

      // Bakiyeyi düş
      const { error: updateError } = await supabase.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'subtract'
      });

      if (updateError) {
        console.error('Update balance error:', updateError);
        return { success: false, error: 'Bakiye güncellenirken bir hata oluştu.' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Deduct balance error:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * İşlem geçmişini getirir
   */
  static async getTransactionHistory(): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Giriş yapmanız gerekiyor.' };
      }

      const { data, error } = await supabase
        .from('billing_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Get transaction history error:', error);
        return { data: null, error: 'İşlem geçmişi yüklenirken bir hata oluştu.' };
      }

      return { data: data as Transaction[], error: null };
    } catch (error) {
      console.error('Get transaction history error:', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  /**
   * Reklam türüne göre minimum bütçeyi hesaplar
   */
  static calculateMinimumBudget(adType: string, days: number = 1): number {
    const pricing = AD_PRICING[adType as keyof AdPricing];
    if (!pricing) return 0;
    
    return Math.max(pricing.daily_rate * days, pricing.minimum_budget);
  }

  /**
   * Reklam türüne göre günlük maliyeti getirir
   */
  static getDailyRate(adType: string): number {
    const pricing = AD_PRICING[adType as keyof AdPricing];
    return pricing ? pricing.daily_rate : 0;
  }

  /**
   * Tarih aralığına göre toplam maliyeti hesaplar
   */
  static calculateTotalCost(adType: string, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return this.calculateMinimumBudget(adType, Math.max(1, days));
  }
}
