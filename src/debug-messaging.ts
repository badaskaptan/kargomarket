// 🚨 MESAJLAŞMA SİSTEMİ DEBUG SCRIPT
// Bu dosyayı MessagesSection'a geçici olarak ekleyerek sorunu tespit edelim

console.log('🔍 MESSAGING DEBUG BAŞLATILIYOR...');

// 1. Auth durumu kontrol
console.log('👤 User ID:', user?.id);
console.log('🔐 User object:', user);

// 2. Hook durumu kontrol  
console.log('📚 Conversations:', conversations);
console.log('📨 Messages:', messages);
console.log('⏳ Loading:', loading);
console.log('❌ Error:', error);

// 3. Browser console'da Supabase client kontrol
console.log('🗃️ Checking Supabase client...');
if (typeof window !== 'undefined') {
  // Supabase client'i window'a ekle (geçici debug için)
  import('../lib/supabase.ts').then(({ supabase }) => {
    (window as any).supabaseDebug = supabase;
    
    // Auth durumunu kontrol et
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔑 Session:', session);
      console.log('🆔 Session User ID:', session?.user?.id);
      console.log('❌ Session Error:', error);
      
      if (session?.user?.id) {
        // Manuel olarak conversation_participants tablosunu kontrol et
        supabase
          .from('conversation_participants')
          .select('*')
          .eq('user_id', session.user.id)
          .then(({ data, error }) => {
            console.log('👥 User Participations:', data);
            console.log('❌ Participation Error:', error);
          });
          
        // Conversations tablosunu kontrol et  
        supabase
          .from('conversations')
          .select('*')
          .then(({ data, error }) => {
            console.log('💬 All Conversations:', data);
            console.log('❌ Conversations Error:', error);
          });
      }
    });
  });
}

export const debugMessaging = {
  user,
  conversations,
  messages,
  loading,
  error,
  loadConversations
};
