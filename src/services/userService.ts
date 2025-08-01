import { supabase } from '../lib/supabase';

export type SimpleUser = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    company_name?: string | null;
    email?: string | null;
};

// Sadece profiles tablosundan, email ve company_name ile
export async function fetchAllUsers(): Promise<SimpleUser[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, company_name')
        .eq('account_status', 'active');
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return (data || []).map((profile: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        company_name?: string | null;
        email?: string | null;
    }) => ({
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        company_name: profile.company_name || null,
        email: profile.email || null,
    }));
}
