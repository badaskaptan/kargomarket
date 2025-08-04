// ====================================
// SUPABASE DATABASE TYPES - UPDATED
// Mevcut schema + eksik tablolar için complete types
// ====================================

// JSONB Type definitions
export interface UserPreferences {
  language?: string
  timezone?: string
  notifications?: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
  theme?: 'light' | 'dark' | 'auto'
  dashboard?: {
    defaultView?: string
    itemsPerPage?: number
  }
}

export interface UserSettings {
  privacy?: {
    showPhone?: boolean
    showEmail?: boolean
    showAddress?: boolean
  }
  notifications?: {
    newOffers?: boolean
    newMessages?: boolean
    priceUpdates?: boolean
  }
}

export interface CargoDetails {
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  type?: string
  description?: string
  value?: number
  fragile?: boolean
  hazardous?: boolean
  temperature_controlled?: boolean
  special_handling?: string[]
}

export interface TransportDetails {
  vehicle_type?: string
  equipment_needed?: string[]
  loading_requirements?: string
  unloading_requirements?: string
  insurance_required?: boolean
  tracking_required?: boolean
}

export interface AdditionalRequirements {
  permits_needed?: string[]
  documentation?: string[]
  special_instructions?: string
  contact_preferences?: string[]
}

export interface GenericMetadata {
  tags?: string[]
  source?: string
  version?: number
  [key: string]: unknown
}

export interface Database {
  public: {
    Tables: {
      // The actual table name in your Supabase (keeping both for compatibility)
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          user_type: 'buyer_seller' | 'carrier' | 'both'
          company_name: string | null
          tax_office: string | null
          tax_number: string | null
          address: string | null
          city: string | null
          country: string
          status: 'active' | 'suspended' | 'pending_verification'
          email_verified: boolean
          phone_verified: boolean
          total_listings: number
          total_offers: number
          total_completed_transactions: number
          rating: number
          rating_count: number
          preferences: UserPreferences
          settings: UserSettings
          metadata: GenericMetadata
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'buyer_seller' | 'carrier' | 'both'
          company_name?: string | null
          tax_office?: string | null
          tax_number?: string | null
          address?: string | null
          city?: string | null
          country?: string
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified?: boolean
          phone_verified?: boolean
          total_listings?: number
          total_offers?: number
          total_completed_transactions?: number
          rating?: number
          rating_count?: number
          preferences?: UserPreferences
          settings?: UserSettings
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'buyer_seller' | 'carrier' | 'both'
          company_name?: string | null
          tax_office?: string | null
          tax_number?: string | null
          address?: string | null
          city?: string | null
          country?: string
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified?: boolean
          phone_verified?: boolean
          total_listings?: number
          total_offers?: number
          total_completed_transactions?: number
          rating?: number
          rating_count?: number
          preferences?: UserPreferences
          settings?: UserSettings
          metadata?: GenericMetadata
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          user_type: 'buyer_seller' | 'carrier' | 'both'
          company_name: string | null
          tax_office: string | null
          tax_number: string | null
          address: string | null
          city: string | null
          country: string
          status: 'active' | 'suspended' | 'pending_verification'
          email_verified: boolean
          phone_verified: boolean
          total_listings: number
          total_offers: number
          total_completed_transactions: number
          rating: number
          rating_count: number
          preferences: UserPreferences
          settings: UserSettings
          metadata: GenericMetadata
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'buyer_seller' | 'carrier' | 'both'
          company_name?: string | null
          tax_office?: string | null
          tax_number?: string | null
          address?: string | null
          city?: string | null
          country?: string
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified?: boolean
          phone_verified?: boolean
          total_listings?: number
          total_offers?: number
          total_completed_transactions?: number
          rating?: number
          rating_count?: number
          preferences?: UserPreferences
          settings?: UserSettings
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'buyer_seller' | 'carrier' | 'both'
          company_name?: string | null
          tax_office?: string | null
          tax_number?: string | null
          address?: string | null
          city?: string | null
          country?: string
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified?: boolean
          phone_verified?: boolean
          total_listings?: number
          total_offers?: number
          total_completed_transactions?: number
          rating?: number
          rating_count?: number
          preferences?: UserPreferences
          settings?: UserSettings
          metadata?: GenericMetadata
        }
      }
      listings: {
        Row: {
          id: string
          listing_number: string
          user_id: string | null
          listing_type: 'load_listing' | 'shipment_request' | 'transport_service'
          role_type: 'buyer' | 'seller' | null
          title: string
          description: string | null
          category: string | null
          subcategory: string | null
          origin: string
          destination: string
          origin_coordinates: unknown | null
          destination_coordinates: unknown | null
          origin_details: Record<string, unknown> | null
          destination_details: Record<string, unknown> | null
          route_waypoints: unknown[] | null
          load_type: string | null
          load_category: string | null
          weight_value: number | null
          weight_unit: string | null
          volume_value: number | null
          volume_unit: string | null
          dimensions: Record<string, unknown> | null
          quantity: number | null
          packaging_type: string | null
          special_handling_requirements: string[] | null
          loading_date: string | null
          loading_time: string | null
          delivery_date: string | null
          delivery_time: string | null
          available_from_date: string | null
          available_until_date: string | null
          flexible_dates: boolean | null
          transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal'
          vehicle_types: string[] | null
          transport_responsible: 'buyer' | 'seller' | 'carrier' | 'negotiable' | null
          special_requirements: string | null
          temperature_controlled: boolean | null
          temperature_range: Record<string, unknown> | null
          humidity_controlled: boolean | null
          hazardous_materials: boolean | null
          fragile_cargo: boolean | null
          offer_type: 'fixed_price' | 'negotiable' | 'auction' | 'free_quote' | null
          price_amount: number | null
          price_currency: string | null
          price_per: 'total' | 'ton' | 'km' | 'day' | 'hour' | null
          budget_min: number | null
          budget_max: number | null
          required_documents: string[] | null
          insurance_required: boolean | null
          insurance_value: number | null
          customs_clearance_required: boolean | null
          related_load_listing_id: string | null
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired' | null
          is_urgent: boolean | null
          priority_level: number | null
          visibility: 'public' | 'private' | 'premium' | null
          view_count: number | null
          offer_count: number | null
          favorite_count: number | null
          search_tags: string[] | null
          seo_keywords: string[] | null
          document_urls: string[] | null
          image_urls: string[] | null
          created_at: string | null
          updated_at: string | null
          published_at: string | null
          expires_at: string | null
          metadata: GenericMetadata | null
          transport_details: Record<string, unknown> | null
          contact_info: Record<string, unknown> | null
          cargo_details: Record<string, unknown> | null
        }
        Insert: {
          id?: string
          listing_number?: string
          user_id?: string | null
          listing_type: 'load_listing' | 'shipment_request' | 'transport_service'
          role_type?: 'buyer' | 'seller' | null
          title: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          origin: string
          destination: string
          origin_coordinates?: unknown | null
          destination_coordinates?: unknown | null
          origin_details?: Record<string, unknown> | null
          destination_details?: Record<string, unknown> | null
          route_waypoints?: unknown[] | null
          load_type?: string | null
          load_category?: string | null
          weight_value?: number | null
          weight_unit?: string | null
          volume_value?: number | null
          volume_unit?: string | null
          dimensions?: Record<string, unknown> | null
          quantity?: number | null
          packaging_type?: string | null
          special_handling_requirements?: string[] | null
          loading_date?: string | null
          loading_time?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
          available_from_date?: string | null
          available_until_date?: string | null
          flexible_dates?: boolean | null
          transport_mode: 'road' | 'sea' | 'air' | 'rail' | 'multimodal'
          vehicle_types?: string[] | null
          transport_responsible?: 'buyer' | 'seller' | 'carrier' | 'negotiable' | null
          special_requirements?: string | null
          temperature_controlled?: boolean | null
          temperature_range?: Record<string, unknown> | null
          humidity_controlled?: boolean | null
          hazardous_materials?: boolean | null
          fragile_cargo?: boolean | null
          offer_type?: 'fixed_price' | 'negotiable' | 'auction' | 'free_quote' | null
          price_amount?: number | null
          price_currency?: string | null
          price_per?: 'total' | 'ton' | 'km' | 'day' | 'hour' | null
          budget_min?: number | null
          budget_max?: number | null
          required_documents?: string[] | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          customs_clearance_required?: boolean | null
          related_load_listing_id?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired' | null
          is_urgent?: boolean | null
          priority_level?: number | null
          visibility?: 'public' | 'private' | 'premium' | null
          view_count?: number | null
          offer_count?: number | null
          favorite_count?: number | null
          search_tags?: string[] | null
          seo_keywords?: string[] | null
          document_urls?: string[] | null
          image_urls?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
          expires_at?: string | null
          metadata?: GenericMetadata | null
          transport_details?: Record<string, unknown> | null
          contact_info?: Record<string, unknown> | null
          cargo_details?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          listing_number?: string
          user_id?: string | null
          listing_type?: 'load_listing' | 'shipment_request' | 'transport_service'
          role_type?: 'buyer' | 'seller' | null
          title?: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          origin?: string
          destination?: string
          origin_coordinates?: unknown | null
          destination_coordinates?: unknown | null
          origin_details?: Record<string, unknown> | null
          destination_details?: Record<string, unknown> | null
          route_waypoints?: unknown[] | null
          load_type?: string | null
          load_category?: string | null
          weight_value?: number | null
          weight_unit?: string | null
          volume_value?: number | null
          volume_unit?: string | null
          dimensions?: Record<string, unknown> | null
          quantity?: number | null
          packaging_type?: string | null
          special_handling_requirements?: string[] | null
          loading_date?: string | null
          loading_time?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
          available_from_date?: string | null
          available_until_date?: string | null
          flexible_dates?: boolean | null
          transport_mode?: 'road' | 'sea' | 'air' | 'rail' | 'multimodal'
          vehicle_types?: string[] | null
          transport_responsible?: 'buyer' | 'seller' | 'carrier' | 'negotiable' | null
          special_requirements?: string | null
          temperature_controlled?: boolean | null
          temperature_range?: Record<string, unknown> | null
          humidity_controlled?: boolean | null
          hazardous_materials?: boolean | null
          fragile_cargo?: boolean | null
          offer_type?: 'fixed_price' | 'negotiable' | 'auction' | 'free_quote' | null
          price_amount?: number | null
          price_currency?: string | null
          price_per?: 'total' | 'ton' | 'km' | 'day' | 'hour' | null
          budget_min?: number | null
          budget_max?: number | null
          required_documents?: string[] | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          customs_clearance_required?: boolean | null
          related_load_listing_id?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'expired' | null
          is_urgent?: boolean | null
          priority_level?: number | null
          visibility?: 'public' | 'private' | 'premium' | null
          view_count?: number | null
          offer_count?: number | null
          favorite_count?: number | null
          search_tags?: string[] | null
          seo_keywords?: string[] | null
          document_urls?: string[] | null
          image_urls?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
          expires_at?: string | null
          metadata?: GenericMetadata | null
          transport_details?: Record<string, unknown> | null
          contact_info?: Record<string, unknown> | null
          cargo_details?: Record<string, unknown> | null
        }
      }
      transport_services: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          service_number: string
          title: string
          description: string | null
          status: 'active' | 'inactive' | 'completed' | 'suspended' | null
          transport_mode: 'road' | 'sea' | 'air' | 'rail'
          vehicle_type: string | null
          origin: string | null
          destination: string | null
          available_from_date: string | null
          available_until_date: string | null
          capacity_value: number | null
          capacity_unit: string | null
          contact_info: string | null
          company_name: string | null
          plate_number: string | null
          ship_name: string | null
          imo_number: string | null
          mmsi_number: string | null
          dwt: number | null
          gross_tonnage: number | null
          net_tonnage: number | null
          ship_dimensions: string | null
          freight_type: string | null
          charterer_info: string | null
          ship_flag: string | null
          home_port: string | null
          year_built: number | null
          speed_knots: number | null
          fuel_consumption: string | null
          ballast_capacity: number | null
          flight_number: string | null
          aircraft_type: string | null
          max_payload: number | null
          cargo_volume: number | null
          train_number: string | null
          wagon_count: number | null
          wagon_types: string[] | null
          required_documents: string[] | null
          document_urls: string[] | null
          rating: number | null
          rating_count: number | null
          view_count: number | null
          last_updated_by: string | null
          is_featured: boolean | null
          featured_until: string | null
          created_by_user_type: string | null
          last_activity_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          service_number: string
          title: string
          description?: string | null
          status?: 'active' | 'inactive' | 'completed' | 'suspended' | null
          transport_mode: 'road' | 'sea' | 'air' | 'rail'
          vehicle_type?: string | null
          origin?: string | null
          destination?: string | null
          available_from_date?: string | null
          available_until_date?: string | null
          capacity_value?: number | null
          capacity_unit?: string | null
          contact_info?: string | null
          company_name?: string | null
          plate_number?: string | null
          ship_name?: string | null
          imo_number?: string | null
          mmsi_number?: string | null
          dwt?: number | null
          gross_tonnage?: number | null
          net_tonnage?: number | null
          ship_dimensions?: string | null
          freight_type?: string | null
          charterer_info?: string | null
          ship_flag?: string | null
          home_port?: string | null
          year_built?: number | null
          speed_knots?: number | null
          fuel_consumption?: string | null
          ballast_capacity?: number | null
          flight_number?: string | null
          aircraft_type?: string | null
          max_payload?: number | null
          cargo_volume?: number | null
          train_number?: string | null
          wagon_count?: number | null
          wagon_types?: string[] | null
          required_documents?: string[] | null
          document_urls?: string[] | null
          rating?: number | null
          rating_count?: number | null
          view_count?: number | null
          last_updated_by?: string | null
          is_featured?: boolean | null
          featured_until?: string | null
          created_by_user_type?: string | null
          last_activity_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          service_number?: string
          title?: string
          description?: string | null
          status?: 'active' | 'inactive' | 'completed' | 'suspended' | null
          transport_mode?: 'road' | 'sea' | 'air' | 'rail'
          vehicle_type?: string | null
          origin?: string | null
          destination?: string | null
          available_from_date?: string | null
          available_until_date?: string | null
          capacity_value?: number | null
          capacity_unit?: string | null
          contact_info?: string | null
          company_name?: string | null
          plate_number?: string | null
          ship_name?: string | null
          imo_number?: string | null
          mmsi_number?: string | null
          dwt?: number | null
          gross_tonnage?: number | null
          net_tonnage?: number | null
          ship_dimensions?: string | null
          freight_type?: string | null
          charterer_info?: string | null
          ship_flag?: string | null
          home_port?: string | null
          year_built?: number | null
          speed_knots?: number | null
          fuel_consumption?: string | null
          ballast_capacity?: number | null
          flight_number?: string | null
          aircraft_type?: string | null
          max_payload?: number | null
          cargo_volume?: number | null
          train_number?: string | null
          wagon_count?: number | null
          wagon_types?: string[] | null
          required_documents?: string[] | null
          document_urls?: string[] | null
          rating?: number | null
          rating_count?: number | null
          view_count?: number | null
          last_updated_by?: string | null
          is_featured?: boolean | null
          featured_until?: string | null
          created_by_user_type?: string | null
          last_activity_at?: string | null
        }
      }
      offers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listing_id: string | null
          user_id: string | null
          offer_type: string
          parent_offer_id: string | null
          price_amount: number
          price_currency: string | null
          price_per: string | null
          price_breakdown: Record<string, unknown> | null
          payment_terms: string | null
          payment_method: string | null
          service_description: string | null
          proposed_dates: Record<string, unknown> | null
          validity_period: number | null
          expires_at: string | null
          additional_services: Record<string, unknown> | null
          special_conditions: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | null
          rejection_reason: string | null
          message: string | null
          attachments: Record<string, unknown> | null
          responded_at: string | null
          valid_until: string | null
          additional_terms: Record<string, unknown> | null
          counter_offer_to: string | null
          // Yeni alanlar - Supabase'deki gerçek tablo
          transport_mode: string | null
          cargo_type: string | null
          service_scope: string | null
          pickup_date_preferred: string | null
          delivery_date_preferred: string | null
          transit_time_estimate: string | null
          contact_person: string | null
          contact_phone: string | null
          customs_handling_included: boolean | null
          documentation_handling_included: boolean | null
          loading_unloading_included: boolean | null
          tracking_system_provided: boolean | null
          express_service: boolean | null
          weekend_service: boolean | null
          fuel_surcharge_included: boolean | null
          toll_fees_included: boolean | null
          // Document handling fields (listings pattern)
          documents_description: string | null
          document_urls: string[] | null
          image_urls: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string | null
          user_id?: string | null
          offer_type: string
          parent_offer_id?: string | null
          price_amount: number
          price_currency?: string | null
          price_per?: string | null
          price_breakdown?: Record<string, unknown> | null
          payment_terms?: string | null
          payment_method?: string | null
          service_description?: string | null
          proposed_dates?: Record<string, unknown> | null
          validity_period?: number | null
          expires_at?: string | null
          additional_services?: Record<string, unknown> | null
          special_conditions?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | null
          rejection_reason?: string | null
          message?: string | null
          attachments?: Record<string, unknown> | null
          responded_at?: string | null
          valid_until?: string | null
          additional_terms?: Record<string, unknown> | null
          counter_offer_to?: string | null
          // Yeni alanlar - Supabase'deki gerçek tablo
          transport_mode?: string | null
          cargo_type?: string | null
          service_scope?: string | null
          pickup_date_preferred?: string | null
          delivery_date_preferred?: string | null
          transit_time_estimate?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          customs_handling_included?: boolean | null
          documentation_handling_included?: boolean | null
          loading_unloading_included?: boolean | null
          tracking_system_provided?: boolean | null
          express_service?: boolean | null
          weekend_service?: boolean | null
          fuel_surcharge_included?: boolean | null
          toll_fees_included?: boolean | null
          // Document handling fields (listings pattern)
          documents_description?: string | null
          document_urls?: string[] | null
          image_urls?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string | null
          user_id?: string | null
          offer_type?: string
          parent_offer_id?: string | null
          price_amount?: number
          price_currency?: string | null
          price_per?: string | null
          price_breakdown?: Record<string, unknown> | null
          payment_terms?: string | null
          payment_method?: string | null
          service_description?: string | null
          proposed_dates?: Record<string, unknown> | null
          validity_period?: number | null
          expires_at?: string | null
          additional_services?: Record<string, unknown> | null
          special_conditions?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | null
          rejection_reason?: string | null
          message?: string | null
          attachments?: Record<string, unknown> | null
          responded_at?: string | null
          valid_until?: string | null
          additional_terms?: Record<string, unknown> | null
          counter_offer_to?: string | null
        }
      }
      service_offers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          transport_service_id: string
          price_amount: number | null
          price_currency: string
          message: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered'
          // Zenginleştirilmiş alanlar - offers tablosu ile aynı
          offer_type: string
          parent_offer_id: string | null
          price_per: string | null
          price_breakdown: Record<string, unknown> | null
          payment_terms: string | null
          payment_method: string | null
          service_description: string | null
          proposed_dates: Record<string, unknown> | null
          validity_period: number | null
          expires_at: string | null
          additional_services: Record<string, unknown> | null
          special_conditions: string | null
          rejection_reason: string | null
          attachments: Record<string, unknown> | null
          responded_at: string | null
          valid_until: string | null
          additional_terms: Record<string, unknown> | null
          counter_offer_to: string | null
          // Transport Service özel alanlar
          transport_mode: string | null
          cargo_type: string | null
          service_scope: string | null
          pickup_date_preferred: string | null
          delivery_date_preferred: string | null
          transit_time_estimate: string | null
          contact_person: string | null
          contact_phone: string | null
          customs_handling_included: boolean | null
          documentation_handling_included: boolean | null
          loading_unloading_included: boolean | null
          tracking_system_provided: boolean | null
          express_service: boolean | null
          weekend_service: boolean | null
          fuel_surcharge_included: boolean | null
          toll_fees_included: boolean | null
          // Yeni eklenen alanlar
          pickup_date_latest: string | null
          delivery_date_latest: string | null
          weight_capacity_kg: number | null
          volume_capacity_m3: number | null
          insurance_coverage_amount: number | null
          insurance_provider: string | null
          port_charges_included: boolean | null
          airport_charges_included: boolean | null
          on_time_guarantee: boolean | null
          damage_free_guarantee: boolean | null
          temperature_guarantee: boolean | null
          emergency_contact: string | null
          contingency_plan: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          transport_service_id: string
          price_amount?: number | null
          price_currency?: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered'
          // Zenginleştirilmiş alanlar
          offer_type?: string
          parent_offer_id?: string | null
          price_per?: string | null
          price_breakdown?: Record<string, unknown> | null
          payment_terms?: string | null
          payment_method?: string | null
          service_description?: string | null
          proposed_dates?: Record<string, unknown> | null
          validity_period?: number | null
          expires_at?: string | null
          additional_services?: Record<string, unknown> | null
          special_conditions?: string | null
          rejection_reason?: string | null
          attachments?: Record<string, unknown> | null
          responded_at?: string | null
          valid_until?: string | null
          additional_terms?: Record<string, unknown> | null
          counter_offer_to?: string | null
          // Transport Service özel alanlar
          transport_mode?: string | null
          cargo_type?: string | null
          service_scope?: string | null
          pickup_date_preferred?: string | null
          delivery_date_preferred?: string | null
          transit_time_estimate?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          customs_handling_included?: boolean | null
          documentation_handling_included?: boolean | null
          loading_unloading_included?: boolean | null
          tracking_system_provided?: boolean | null
          express_service?: boolean | null
          weekend_service?: boolean | null
          fuel_surcharge_included?: boolean | null
          toll_fees_included?: boolean | null
          // Yeni eklenen alanlar
          pickup_date_latest?: string | null
          delivery_date_latest?: string | null
          weight_capacity_kg?: number | null
          volume_capacity_m3?: number | null
          insurance_coverage_amount?: number | null
          insurance_provider?: string | null
          port_charges_included?: boolean | null
          airport_charges_included?: boolean | null
          on_time_guarantee?: boolean | null
          damage_free_guarantee?: boolean | null
          temperature_guarantee?: boolean | null
          emergency_contact?: string | null
          contingency_plan?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          transport_service_id?: string
          price_amount?: number | null
          price_currency?: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered'
          // Zenginleştirilmiş alanlar
          offer_type?: string
          parent_offer_id?: string | null
          price_per?: string | null
          price_breakdown?: Record<string, unknown> | null
          payment_terms?: string | null
          payment_method?: string | null
          service_description?: string | null
          proposed_dates?: Record<string, unknown> | null
          validity_period?: number | null
          expires_at?: string | null
          additional_services?: Record<string, unknown> | null
          special_conditions?: string | null
          rejection_reason?: string | null
          attachments?: Record<string, unknown> | null
          responded_at?: string | null
          valid_until?: string | null
          additional_terms?: Record<string, unknown> | null
          counter_offer_to?: string | null
          // Transport Service özel alanlar
          transport_mode?: string | null
          cargo_type?: string | null
          service_scope?: string | null
          pickup_date_preferred?: string | null
          delivery_date_preferred?: string | null
          transit_time_estimate?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          customs_handling_included?: boolean | null
          documentation_handling_included?: boolean | null
          loading_unloading_included?: boolean | null
          tracking_system_provided?: boolean | null
          express_service?: boolean | null
          weekend_service?: boolean | null
          fuel_surcharge_included?: boolean | null
          toll_fees_included?: boolean | null
          // Yeni eklenen alanlar
          pickup_date_latest?: string | null
          delivery_date_latest?: string | null
          weight_capacity_kg?: number | null
          volume_capacity_m3?: number | null
          insurance_coverage_amount?: number | null
          insurance_provider?: string | null
          port_charges_included?: boolean | null
          airport_charges_included?: boolean | null
          on_time_guarantee?: boolean | null
          damage_free_guarantee?: boolean | null
          temperature_guarantee?: boolean | null
          emergency_contact?: string | null
          contingency_plan?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          sender_id: string
          recipient_id: string
          listing_id: string | null
          offer_id: string | null
          subject: string | null
          content: string
          message_type: 'general' | 'offer_related' | 'listing_inquiry' | 'system'
          is_read: boolean
          is_archived: boolean
          attachments: Array<{
            filename: string
            url: string
            size: number
            type: string
          }>
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          sender_id: string
          recipient_id: string
          listing_id?: string | null
          offer_id?: string | null
          subject?: string | null
          content: string
          message_type?: 'general' | 'offer_related' | 'listing_inquiry' | 'system'
          is_read?: boolean
          is_archived?: boolean
          attachments?: Array<{
            filename: string
            url: string
            size: number
            type: string
          }>
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          sender_id?: string
          recipient_id?: string
          listing_id?: string | null
          offer_id?: string | null
          subject?: string | null
          content?: string
          message_type?: 'general' | 'offer_related' | 'listing_inquiry' | 'system'
          is_read?: boolean
          is_archived?: boolean
          attachments?: Array<{
            filename: string
            url: string
            size: number
            type: string
          }>
          metadata?: GenericMetadata
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string | null
          offer_id: string | null
          rating: number
          title: string | null
          comment: string | null
          review_type: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general'
          status: 'active' | 'hidden' | 'reported'
          response: string | null
          response_date: string | null
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          reviewer_id: string
          reviewed_id: string
          listing_id?: string | null
          offer_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          review_type: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general'
          status?: 'active' | 'hidden' | 'reported'
          response?: string | null
          response_date?: string | null
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          reviewer_id?: string
          reviewed_id?: string
          listing_id?: string | null
          offer_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          review_type?: 'buyer_to_carrier' | 'carrier_to_buyer' | 'general'
          status?: 'active' | 'hidden' | 'reported'
          response?: string | null
          response_date?: string | null
          metadata?: GenericMetadata
        }
      }
      ads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string | null
          ad_type: 'banner' | 'featured_listing' | 'sponsored_post' | 'premium_placement'
          category: 'transport' | 'insurance' | 'logistics' | 'general' // Yeni kategori alanı
          placement: string // Mevcut placement alanı korundu
          target_audience: Record<string, unknown>
          target_locations: string[]
          target_categories: string[]
          budget_total: number | null
          budget_daily: number | null
          cost_per_click: number | null
          cost_per_impression: number | null
          impressions: number
          clicks: number
          conversions: number
          start_date: string
          end_date: string
          status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected'
          images: Array<{
            url: string
            alt?: string
            order?: number
          }>
          call_to_action: string | null
          landing_url: string | null
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description?: string | null
          ad_type: 'banner' | 'featured_listing' | 'sponsored_post' | 'premium_placement'
          category?: 'transport' | 'insurance' | 'logistics' | 'general' // Yeni kategori alanı
          placement?: string // Mevcut placement alanı korundu
          target_audience?: Record<string, unknown>
          target_locations?: string[]
          target_categories?: string[]
          budget_total?: number | null
          budget_daily?: number | null
          cost_per_click?: number | null
          cost_per_impression?: number | null
          impressions?: number
          clicks?: number
          conversions?: number
          start_date: string
          end_date: string
          status?: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected'
          images?: Array<{
            url: string
            alt?: string
            order?: number
          }>
          call_to_action?: string | null
          landing_url?: string | null
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string | null
          ad_type?: 'banner' | 'featured_listing' | 'sponsored_post' | 'premium_placement'
          category?: 'transport' | 'insurance' | 'logistics' | 'general' // Yeni kategori alanı
          placement?: string // Mevcut placement alanı korundu
          target_audience?: Record<string, unknown>
          target_locations?: string[]
          target_categories?: string[]
          budget_total?: number | null
          budget_daily?: number | null
          cost_per_click?: number | null
          cost_per_impression?: number | null
          impressions?: number
          clicks?: number
          conversions?: number
          start_date?: string
          end_date?: string
          status?: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected'
          images?: Array<{
            url: string
            alt?: string
            order?: number
          }>
          call_to_action?: string | null
          landing_url?: string | null
          metadata?: GenericMetadata
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listing_id: string
          offer_id: string
          buyer_id: string
          carrier_id: string
          amount: number
          currency: string
          platform_fee: number
          carrier_amount: number
          status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          payment_method: string | null
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_reference: string | null
          pickup_date: string | null
          delivery_date: string | null
          estimated_delivery: string | null
          tracking_number: string | null
          tracking_updates: Array<{
            timestamp: string
            location: string
            status: string
            description?: string
          }>
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id: string
          offer_id: string
          buyer_id: string
          carrier_id: string
          amount: number
          currency?: string
          platform_fee?: number
          carrier_amount: number
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_reference?: string | null
          pickup_date?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          tracking_number?: string | null
          tracking_updates?: Array<{
            timestamp: string
            location: string
            status: string
            description?: string
          }>
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string
          offer_id?: string
          buyer_id?: string
          carrier_id?: string
          amount?: number
          currency?: string
          platform_fee?: number
          carrier_amount?: number
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_reference?: string | null
          pickup_date?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          tracking_number?: string | null
          tracking_updates?: Array<{
            timestamp: string
            location: string
            status: string
            description?: string
          }>
          metadata?: GenericMetadata
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          notification_type: 'info' | 'success' | 'warning' | 'error' | 'marketing'
          category: 'offer' | 'message' | 'listing' | 'transaction' | 'system' | 'marketing'
          related_id: string | null
          related_type: string | null
          is_read: boolean
          read_at: string | null
          delivery_method: 'in_app' | 'email' | 'sms' | 'push'
          is_sent: boolean
          sent_at: string | null
          action_url: string | null
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'marketing'
          category: 'offer' | 'message' | 'listing' | 'transaction' | 'system' | 'marketing'
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          read_at?: string | null
          delivery_method?: 'in_app' | 'email' | 'sms' | 'push'
          is_sent?: boolean
          sent_at?: string | null
          action_url?: string | null
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'marketing'
          category?: 'offer' | 'message' | 'listing' | 'transaction' | 'system' | 'marketing'
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          read_at?: string | null
          delivery_method?: 'in_app' | 'email' | 'sms' | 'push'
          is_sent?: boolean
          sent_at?: string | null
          action_url?: string | null
          metadata?: GenericMetadata
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_rating: {
        Args: {
          user_uuid: string
        }
        Returns: void
      }
      increment_listing_views: {
        Args: {
          listing_uuid: string
        }
        Returns: void
      }
      update_listing_offers_count: {
        Args: {
          listing_uuid: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type TransportService = Database['public']['Tables']['transport_services']['Row'] & {
  /** Hizmet ilanına yüklenen resimler */
  image_urls?: string[];
  /** Hizmet ilanına yüklenen dökümanlar */
  document_urls?: string[];
}
export type Offer = Database['public']['Tables']['offers']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Ad = Database['public']['Tables']['ads']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert types
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type TransportServiceInsert = Database['public']['Tables']['transport_services']['Insert']
export type OfferInsert = Database['public']['Tables']['offers']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type AdInsert = Database['public']['Tables']['ads']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Update types
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']
export type TransportServiceUpdate = Database['public']['Tables']['transport_services']['Update']
export type OfferUpdate = Database['public']['Tables']['offers']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
export type AdUpdate = Database['public']['Tables']['ads']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Extended listing type for joined owner info (Supabase join)
export type ExtendedListing = Database['public']['Tables']['listings']['Row'] & {
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_company?: string;
  owner_city?: string;
  owner_rating?: number;
  owner_address?: string;
  owner_website?: string;
  owner_tax_office?: string;
  owner_tax_number?: string;
  owner_avatar_url?: string;
  owner_user_type?: string;
  owner_total_listings?: number;
  owner_total_completed_transactions?: number;
  owner_rating_count?: number;
  /** Yüklenen dosyalar ve resimler */
  uploaded_files?: Array<{
    url: string;
    name: string;
    type?: string;
  }>;
};
