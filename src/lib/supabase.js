// ====================================
// SUPABASE CLIENT CONFIGURATION
// ====================================
import { createClient } from '@supabase/supabase-js';
// Supabase URL ve Anon Key - Bu değerleri .env dosyasından alın
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
// Type-safe Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Modern auth flow
    }
});
// Auth helper functions
export const auth = {
    // Sign up with email and password
    signUp: async (email, password, fullName) => {
        console.log('🔑 Attempting signup:', { email, fullName });
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                // Development: Skip email confirmation for testing
                emailRedirectTo: window.location.origin
            }
        });
        console.log('📝 Signup result:', { data: !!data, error: error?.message });
        return { data, error };
    },
    // Sign in with email and password
    signIn: async (email, password) => {
        console.log('🔐 Attempting signin:', { email });
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log('🔓 Signin result:', { data: !!data, error: error?.message });
        return { data, error };
    },
    // Sign in with Google
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        return { data, error };
    },
    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },
    // Get current session
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },
    // Get current user
    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    }
};
// Database helper functions
export const db = {
    // Profile operations
    profiles: {
        get: async (userId) => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            return { data, error };
        },
        update: async (userId, updates) => {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            return { data, error };
        }
    },
    // Listings operations
    listings: {
        getAll: async (filters) => {
            let query = supabase
                .from('listings')
                .select('*, profiles(full_name, avatar_url, rating)')
                .order('created_at', { ascending: false });
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.listing_type) {
                query = query.eq('listing_type', filters.listing_type);
            }
            const { data, error } = await query;
            return { data, error };
        },
        getById: async (id) => {
            const { data, error } = await supabase
                .from('listings')
                .select('*, profiles(full_name, avatar_url, rating, phone)')
                .eq('id', id)
                .single();
            return { data, error };
        },
        create: async (listing) => {
            const { data, error } = await supabase
                .from('listings')
                .insert(listing)
                .select()
                .single();
            return { data, error };
        },
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('listings')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },
        incrementViews: async (id) => {
            const { error } = await supabase.rpc('increment_listing_views', {
                listing_uuid: id
            });
            return { error };
        }
    },
    // Offers operations
    offers: {
        getForListing: async (listingId) => {
            const { data, error } = await supabase
                .from('offers')
                .select('*, profiles(full_name, avatar_url, rating)')
                .eq('listing_id', listingId)
                .order('created_at', { ascending: false });
            return { data, error };
        },
        create: async (offer) => {
            const { data, error } = await supabase
                .from('offers')
                .insert(offer)
                .select()
                .single();
            return { data, error };
        },
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('offers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        }
    },
    // Messages operations
    messages: {
        getConversation: async (conversationId) => {
            const { data, error } = await supabase
                .from('messages')
                .select('*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            return { data, error };
        },
        send: async (message) => {
            const { data, error } = await supabase
                .from('messages')
                .insert(message)
                .select()
                .single();
            return { data, error };
        }
    },
    // Reviews operations
    reviews: {
        getForUser: async (userId) => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
                .eq('reviewed_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            return { data, error };
        },
        create: async (review) => {
            const { data, error } = await supabase
                .from('reviews')
                .insert(review)
                .select()
                .single();
            return { data, error };
        }
    }
};
// Real-time subscriptions
export const realtime = {
    // Subscribe to new messages in a conversation
    subscribeToMessages: (conversationId, callback) => {
        return supabase
            .channel(`messages:conversation_id=eq.${conversationId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
        }, callback)
            .subscribe();
    },
    // Subscribe to new offers on a listing
    subscribeToOffers: (listingId, callback) => {
        return supabase
            .channel(`offers:listing_id=eq.${listingId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'offers',
            filter: `listing_id=eq.${listingId}`
        }, callback)
            .subscribe();
    },
    // Subscribe to user notifications
    subscribeToNotifications: (userId, callback) => {
        return supabase
            .channel(`notifications:user_id=eq.${userId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
        }, callback)
            .subscribe();
    }
};
// Storage helper functions
export const storage = {
    // Upload avatar
    uploadAvatar: async (userId, file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });
        if (error)
            return { data: null, error };
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
        return { data: { path: data.path, publicUrl }, error: null };
    },
    // Upload listing documents
    uploadListingDocument: async (listingId, file, documentType) => {
        console.log('📄 Uploading document:', { listingId, fileName: file.name, documentType, size: file.size });
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        // Kullanıcı ID'si ile başlat (RLS politikaları için)
        const { data: { user } } = await supabase.auth.getUser();
        const fileName = `${user?.id}/${listingId}_${documentType}_${timestamp}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file);
        if (error) {
            console.error('❌ Document upload error:', error);
            return { data: null, error };
        }
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);
        console.log('✅ Document uploaded successfully:', { fileName, publicUrl });
        return { data: { path: data.path, publicUrl, originalName: file.name }, error: null };
    },
    // Upload listing images
    uploadListingImage: async (listingId, file, index) => {
        console.log('🖼️ Uploading image:', { listingId, fileName: file.name, index, size: file.size });
        const fileExt = file.name.split('.').pop();
        // Kullanıcı ID'si ile başlat (RLS politikaları için)
        const { data: { user } } = await supabase.auth.getUser();
        const fileName = `${user?.id}/${listingId}_${index}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('listings')
            .upload(fileName, file);
        if (error) {
            console.error('❌ Image upload error:', error);
            return { data: null, error };
        }
        const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName);
        console.log('✅ Image uploaded successfully:', { fileName, publicUrl });
        return { data: { path: data.path, publicUrl }, error: null };
    }
};
export default supabase;
