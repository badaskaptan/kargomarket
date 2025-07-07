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
          created_at: string
          updated_at: string
          user_id: string
          listing_type: 'shipment_request' | 'load_listing'
          title: string
          description: string | null
          origin: string
          destination: string
          pickup_date: string | null
          delivery_date: string | null
          price: number | null
          status: 'active' | 'inactive' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          views_count: number
          offers_count: number
          is_featured: boolean
          expires_at: string | null
          cargo_details: CargoDetails
          transport_details: TransportDetails
          additional_requirements: AdditionalRequirements
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          listing_type: 'shipment_request' | 'load_listing'
          title: string
          description?: string | null
          pickup_location: string
          delivery_location: string
          pickup_date?: string | null
          delivery_date?: string | null
          price?: number | null
          status?: 'active' | 'inactive' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          views_count?: number
          offers_count?: number
          is_featured?: boolean
          expires_at?: string | null
          cargo_details?: CargoDetails
          transport_details?: TransportDetails
          additional_requirements?: AdditionalRequirements
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          listing_type?: 'shipment_request' | 'load_listing'
          title?: string
          description?: string | null
          origin?: string
          destination?: string
          pickup_date?: string | null
          delivery_date?: string | null
          price?: number | null
          status?: 'active' | 'inactive' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          views_count?: number
          offers_count?: number
          is_featured?: boolean
          expires_at?: string | null
          cargo_details?: CargoDetails
          transport_details?: TransportDetails
          additional_requirements?: AdditionalRequirements
          metadata?: GenericMetadata
        }
      }
      transport_services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          service_name: string
          description: string | null
          vehicle_type: string
          capacity: string | null
          coverage_areas: string[]
          pricing: Record<string, unknown>
          availability: Record<string, unknown>
          status: 'active' | 'inactive' | 'busy' | 'maintenance'
          rating: number
          rating_count: number
          total_jobs: number
          is_verified: boolean
          contact_info: Record<string, unknown>
          additional_services: Record<string, unknown>
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          service_name: string
          description?: string | null
          vehicle_type: string
          capacity?: string | null
          coverage_areas?: string[]
          pricing?: Record<string, unknown>
          availability?: Record<string, unknown>
          status?: 'active' | 'inactive' | 'busy' | 'maintenance'
          rating?: number
          rating_count?: number
          total_jobs?: number
          is_verified?: boolean
          contact_info?: Record<string, unknown>
          additional_services?: Record<string, unknown>
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          service_name?: string
          description?: string | null
          vehicle_type?: string
          capacity?: string | null
          coverage_areas?: string[]
          pricing?: Record<string, unknown>
          availability?: Record<string, unknown>
          status?: 'active' | 'inactive' | 'busy' | 'maintenance'
          rating?: number
          rating_count?: number
          total_jobs?: number
          is_verified?: boolean
          contact_info?: Record<string, unknown>
          additional_services?: Record<string, unknown>
          metadata?: GenericMetadata
        }
      }
      offers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listing_id: string
          carrier_id: string
          price: number
          currency: string
          estimated_delivery_time: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          message: string | null
          expires_at: string | null
          terms_conditions: Record<string, unknown>
          additional_services: Record<string, unknown>
          metadata: GenericMetadata
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id: string
          carrier_id: string
          price: number
          currency?: string
          estimated_delivery_time?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          message?: string | null
          expires_at?: string | null
          terms_conditions?: Record<string, unknown>
          additional_services?: Record<string, unknown>
          metadata?: GenericMetadata
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string
          carrier_id?: string
          price?: number
          currency?: string
          estimated_delivery_time?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          message?: string | null
          expires_at?: string | null
          terms_conditions?: Record<string, unknown>
          additional_services?: Record<string, unknown>
          metadata?: GenericMetadata
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
export type TransportService = Database['public']['Tables']['transport_services']['Row']
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
