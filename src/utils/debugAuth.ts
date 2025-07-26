// ====================================
// AUTH DEBUG UTILITY
// ====================================

import { supabase } from '../lib/supabase';

export const debugAuth = async () => {
  console.log('%c=== 🔍 AUTH DEBUG 🔍 ===', 'background: #4F46E5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  
  try {
    // Mevcut session'ı kontrol et
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session Data:', sessionData);
    console.log('Session Error:', sessionError);
    
    if (sessionData?.session?.user) {
      const user = sessionData.session.user;
      console.log('%c✅ USER FOUND!', 'background: #10B981; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
      console.log('%c👤 USER ID: ' + user.id, 'background: #F59E0B; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
      console.log('%c📧 EMAIL: ' + user.email, 'background: #3B82F6; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
      console.log('- Created At:', user.created_at);
      console.log('- Last Sign In:', user.last_sign_in_at);
      console.log('- Full User Object:', user);
      
      // Profile verilerini de kontrol et
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      console.log('Profile Data:', profileData);
      console.log('Profile Error:', profileError);
      
      // Büyük bir alert göster
      alert(`🎯 KULLANICI ID BULUNDU!\n\nUser ID: ${user.id}\nEmail: ${user.email}\n\nBu ID'yi kopyalayabilirsiniz!`);
      
      return {
        user,
        profile: profileData,
        authenticated: true
      };
    } else {
      console.log('%c❌ NO USER FOUND', 'background: #EF4444; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
      alert('❌ Kullanıcı bulunamadı! Lütfen giriş yapın.');
      return {
        user: null,
        profile: null,
        authenticated: false
      };
    }
  } catch (error) {
    console.error('Auth Debug Error:', error);
    return {
      user: null,
      profile: null,
      authenticated: false,
      error
    };
  }
};

// Tarayıcı console'unda kullanım için global olarak tanımla
(window as unknown as { debugAuth: typeof debugAuth }).debugAuth = debugAuth;

export default debugAuth;
