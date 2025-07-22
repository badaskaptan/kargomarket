// Service Offers için TypeScript türleri
export interface ServiceOffer {
  id: string;
  user_id: string;
  transport_service_id: string;
  price_amount: number | null;
  price_currency: 'TRY' | 'USD' | 'EUR';
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface ServiceOfferInsert {
  user_id: string;
  transport_service_id: string;
  price_amount?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR';
  message?: string | null;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface ServiceOfferUpdate {
  price_amount?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR';
  message?: string | null;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  updated_at?: string;
}

// Extended ServiceOffer with related data
export interface ExtendedServiceOffer extends ServiceOffer {
  transport_service?: {
    id: string;
    user_id: string;
    title: string;
    origin?: string;
    destination?: string;
    transport_mode: string;
    vehicle_type?: string;
    capacity_value?: number;
    capacity_unit?: string;
    available_from_date?: string;
    available_until_date?: string;
    company_name?: string;
  };
  sender?: {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    email: string;
    avatar_url?: string;
    rating: number;
  };
  service_owner?: {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    email: string;
    avatar_url?: string;
    rating: number;
  };
}
