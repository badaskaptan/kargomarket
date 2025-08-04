// Service Offers için TypeScript türleri
export interface ServiceOffer {
  id: string;
  user_id: string;
  transport_service_id: string;
  
  // 🚨 ACİL EKLENDİ: Kritik coğrafi ve referans bilgiler
  pickup_location?: string | null;
  delivery_location?: string | null;
  service_reference_title?: string | null;
  offered_vehicle_type?: string | null;
  
  price_amount: number | null;
  price_currency: 'TRY' | 'USD' | 'EUR';
  price_per?: string | null; // Database'de var ama interface'de eksikti
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface ServiceOfferInsert {
  user_id: string;
  transport_service_id: string;
  
  // 🚨 ACİL EKLENDİ: Kritik coğrafi ve referans bilgiler
  pickup_location?: string | null;
  delivery_location?: string | null;
  service_reference_title?: string | null;
  offered_vehicle_type?: string | null;
  
  price_amount?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR';
  price_per?: string | null;
  message?: string | null;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  
  // Enhanced fields for transport services
  transport_mode?: string | null;
  cargo_type?: string | null;
  service_scope?: string | null;
  pickup_date_preferred?: string | null;
  pickup_date_latest?: string | null;
  delivery_date_preferred?: string | null;
  delivery_date_latest?: string | null;
  transit_time_estimate?: string | null;
  expires_at?: string | null;
  
  weight_capacity_kg?: number | null;
  volume_capacity_m3?: number | null;
  
  insurance_coverage_amount?: number | null;
  insurance_provider?: string | null;
  
  customs_handling_included?: boolean;
  documentation_handling_included?: boolean;
  loading_unloading_included?: boolean;
  tracking_system_provided?: boolean;
  express_service?: boolean;
  weekend_service?: boolean;
  
  fuel_surcharge_included?: boolean;
  toll_fees_included?: boolean;
  port_charges_included?: boolean;
  airport_charges_included?: boolean;
  
  on_time_guarantee?: boolean;
  damage_free_guarantee?: boolean;
  temperature_guarantee?: boolean;
  
  contact_person?: string | null;
  contact_phone?: string | null;
  emergency_contact?: string | null;
  
  payment_terms?: string | null;
  payment_method?: string | null;
  contingency_plan?: string | null;
}

export interface ServiceOfferUpdate {
  price_amount?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR';
  price_per?: string | null;
  message?: string | null;
  payment_terms?: string | null;
  payment_method?: string | null;
  service_description?: string | null;
  validity_period?: number | null;
  expires_at?: string | null;
  special_conditions?: string | null;
  transport_mode?: string | null;
  cargo_type?: string | null;
  service_scope?: string | null;
  pickup_date_preferred?: string | null;
  delivery_date_preferred?: string | null;
  transit_time_estimate?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  customs_handling_included?: boolean;
  documentation_handling_included?: boolean;
  loading_unloading_included?: boolean;
  tracking_system_provided?: boolean;
  express_service?: boolean;
  weekend_service?: boolean;
  fuel_surcharge_included?: boolean;
  toll_fees_included?: boolean;
  port_charges_included?: boolean;
  airport_charges_included?: boolean;
  on_time_guarantee?: boolean;
  damage_free_guarantee?: boolean;
  temperature_guarantee?: boolean;
  emergency_contact?: string | null;
  contingency_plan?: string | null;
  weight_capacity_kg?: number | null;
  volume_capacity_m3?: number | null;
  insurance_coverage_amount?: number | null;
  insurance_provider?: string | null;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered';
  updated_at?: string;
}

// Extended ServiceOffer with related data
export interface ExtendedServiceOffer extends ServiceOffer {
  // Supabase şemasındaki ek alanlar
  price_per?: string | null;
  price_breakdown?: Record<string, unknown>;
  payment_terms?: string | null;
  payment_method?: string | null;
  service_description?: string | null;
  proposed_dates?: Record<string, unknown>;
  validity_period?: number | null;
  expires_at?: string | null;
  additional_services?: Record<string, unknown>;
  special_conditions?: string | null;
  rejection_reason?: string | null;
  attachments?: string[];
  responded_at?: string | null;
  valid_until?: string | null;
  additional_terms?: Record<string, unknown>;
  counter_offer_to?: string | null;
  transport_mode?: string | null;
  cargo_type?: string | null;
  service_scope?: string | null;
  pickup_date_preferred?: string | null;
  delivery_date_preferred?: string | null;
  transit_time_estimate?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  customs_handling_included?: boolean;
  documentation_handling_included?: boolean;
  loading_unloading_included?: boolean;
  tracking_system_provided?: boolean;
  express_service?: boolean;
  weekend_service?: boolean;
  fuel_surcharge_included?: boolean;
  toll_fees_included?: boolean;
  port_charges_included?: boolean;
  airport_charges_included?: boolean;
  pickup_date_latest?: string | null;
  delivery_date_latest?: string | null;
  weight_capacity_kg?: number | null;
  volume_capacity_m3?: number | null;
  insurance_coverage_amount?: number | null;
  insurance_provider?: string | null;
  on_time_guarantee?: boolean;
  damage_free_guarantee?: boolean;
  temperature_guarantee?: boolean;
  emergency_contact?: string | null;
  contingency_plan?: string | null;
  // Eski alanlar
  transport_service?: {
    id: string;
    user_id: string;
    service_number?: string;
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
