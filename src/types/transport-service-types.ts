// ====================================
// TRANSPORT SERVICES TYPES
// Yeni transport_services tablosu için TypeScript tipleri
// ====================================

export interface TransportService {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Kullanıcı bilgisi
  user_id: string;
  
  // Temel ilan bilgileri
  service_number: string;
  title: string;
  description: string | null;
  status: 'active' | 'inactive' | 'completed' | 'suspended';
  
  // Taşıma bilgileri
  transport_mode: 'road' | 'sea' | 'air' | 'rail';
  vehicle_type: string | null;
  origin: string | null;
  destination: string | null;
  
  // Tarih bilgileri
  available_from_date: string | null;
  available_until_date: string | null;
  
  // Kapasite bilgileri
  capacity_value: number | null;
  capacity_unit: string | null;
  
  // İletişim bilgileri
  contact_info: string | null;
  company_name: string | null;
  
  // KARAYOLU ÖZEL ALANLARI
  plate_number: string | null;
  
  // DENİZYOLU ÖZEL ALANLARI
  ship_name: string | null;
  imo_number: string | null;
  mmsi_number: string | null;
  dwt: number | null;
  gross_tonnage: number | null;
  net_tonnage: number | null;
  ship_dimensions: string | null;
  freight_type: string | null;
  charterer_info: string | null;
  ship_flag: string | null;
  home_port: string | null;
  year_built: number | null;
  speed_knots: number | null;
  fuel_consumption: string | null;
  ballast_capacity: number | null;
  
  // HAVAYOLU ÖZEL ALANLARI
  flight_number: string | null;
  aircraft_type: string | null;
  max_payload: number | null;
  cargo_volume: number | null;
  
  // DEMİRYOLU ÖZEL ALANLARI
  train_number: string | null;
  wagon_count: number | null;
  wagon_types: string[] | null;
  
  // Evrak ve belgeler
  required_documents: string[] | null;
  document_urls: string[] | null;
  
  // Rating ve görüntülenme
  rating: number;
  rating_count: number;
  view_count: number;
  
  // Metadata
  last_updated_by: string | null;
  is_featured: boolean;
  featured_until: string | null;
  created_by_user_type: string | null;
  last_activity_at: string;
}

// Insert tipi (yeni kayıt oluştururken)
export interface TransportServiceInsert {
  user_id: string;
  service_number: string;
  title: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'suspended';
  transport_mode: 'road' | 'sea' | 'air' | 'rail';
  vehicle_type?: string;
  origin?: string;
  destination?: string;
  available_from_date?: string;
  available_until_date?: string;
  capacity_value?: number;
  capacity_unit?: string;
  contact_info?: string;
  company_name?: string;
  
  // Karayolu
  plate_number?: string;
  
  // Denizyolu
  ship_name?: string;
  imo_number?: string;
  mmsi_number?: string;
  dwt?: number;
  gross_tonnage?: number;
  net_tonnage?: number;
  ship_dimensions?: string;
  freight_type?: string;
  charterer_info?: string;
  ship_flag?: string;
  home_port?: string;
  year_built?: number;
  speed_knots?: number;
  fuel_consumption?: string;
  ballast_capacity?: number;
  
  // Havayolu
  flight_number?: string;
  aircraft_type?: string;
  max_payload?: number;
  cargo_volume?: number;
  
  // Demiryolu
  train_number?: string;
  wagon_count?: number;
  wagon_types?: string[];
  
  // Evraklar
  required_documents?: string[];
  document_urls?: string[];
  
  // Metadata
  is_featured?: boolean;
  featured_until?: string;
  created_by_user_type?: string;
}

// Update tipi (güncelleme için)
export interface TransportServiceUpdate {
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'suspended';
  vehicle_type?: string;
  origin?: string;
  destination?: string;
  available_from_date?: string;
  available_until_date?: string;
  capacity_value?: number;
  capacity_unit?: string;
  contact_info?: string;
  company_name?: string;
  
  // Mode-specific fields
  plate_number?: string;
  ship_name?: string;
  imo_number?: string;
  mmsi_number?: string;
  dwt?: number;
  gross_tonnage?: number;
  net_tonnage?: number;
  ship_dimensions?: string;
  freight_type?: string;
  charterer_info?: string;
  ship_flag?: string;
  home_port?: string;
  year_built?: number;
  speed_knots?: number;
  fuel_consumption?: string;
  ballast_capacity?: number;
  flight_number?: string;
  aircraft_type?: string;
  max_payload?: number;
  cargo_volume?: number;
  train_number?: string;
  wagon_count?: number;
  wagon_types?: string[];
  
  // Arrays
  required_documents?: string[];
  document_urls?: string[];
  
  // Metadata
  last_updated_by?: string;
  is_featured?: boolean;
  featured_until?: string;
}

// Form data tipi (UI için)
export interface TransportServiceFormData {
  serviceNumber: string;
  serviceTitle: string;
  serviceTransportMode: string;
  serviceDescription: string;
  serviceOrigin: string;
  serviceDestination: string;
  serviceVehicleType: string;
  serviceAvailableDate: string;
  serviceAvailableUntilDate: string;
  serviceCapacity: string;
  serviceCompanyName: string;
  serviceContact: string;
  
  // Karayolu
  plateNumber: string;
  
  // Denizyolu
  shipName: string;
  imoNumber: string;
  mmsiNumber: string;
  dwt: string;
  grossTonnage: string;
  netTonnage: string;
  shipDimensions: string;
  freightType: string;
  chartererInfo: string;
  shipFlag: string;
  homePort: string;
  yearBuilt: string;
  speedKnots: string;
  fuelConsumption: string;
  ballastCapacity: string;
  
  // Havayolu
  flightNumber: string;
  aircraftType: string;
  maxPayload: string;
  cargoVolume: string;
  
  // Demiryolu
  trainNumber: string;
  wagonCount: string;
  wagonTypes: string;
}

// Helper functions
export const createEmptyTransportServiceForm = (): TransportServiceFormData => ({
  serviceNumber: '',
  serviceTitle: '',
  serviceTransportMode: '',
  serviceDescription: '',
  serviceOrigin: '',
  serviceDestination: '',
  serviceVehicleType: '',
  serviceAvailableDate: '',
  serviceAvailableUntilDate: '',
  serviceCapacity: '',
  serviceCompanyName: '',
  serviceContact: '',
  plateNumber: '',
  shipName: '',
  imoNumber: '',
  mmsiNumber: '',
  dwt: '',
  grossTonnage: '',
  netTonnage: '',
  shipDimensions: '',
  freightType: '',
  chartererInfo: '',
  shipFlag: '',
  homePort: '',
  yearBuilt: '',
  speedKnots: '',
  fuelConsumption: '',
  ballastCapacity: '',
  flightNumber: '',
  aircraftType: '',
  maxPayload: '',
  cargoVolume: '',
  trainNumber: '',
  wagonCount: '',
  wagonTypes: ''
});
