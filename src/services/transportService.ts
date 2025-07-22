// ====================================
// TRANSPORT SERVICE - NAKLİYE HİZMETİ SERVİSİ
// transport_services tablosu için CRUD operasyonları
// Gerçek DB şemasına tam uyumlu
// ====================================

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database-types';

export type TransportService = Database['public']['Tables']['transport_services']['Row'];
export type TransportServiceInsert = Database['public']['Tables']['transport_services']['Insert'];

export class TransportServiceService {

  // Yeni nakliye hizmeti oluştur
  static async createTransportService(serviceData: TransportServiceInsert): Promise<TransportService> {
    console.log('🚀 Creating new transport service:', serviceData);

    const { data, error } = await supabase
      .from('transport_services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error('❌ Transport service creation failed:', error);
      throw new Error(`Transport service creation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from transport service creation');
    }

    console.log('✅ Transport service created successfully:', data);
    return data;
  }

  // Kullanıcının nakliye hizmetlerini getir
  static async getTransportServices(userId: string): Promise<TransportService[]> {
    const { data, error } = await supabase
      .from('transport_services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Transport services fetch failed:', error);
      throw new Error(`Transport services fetch failed: ${error.message}`);
    }

    return data || [];
  }

  // ID ile tek bir nakliye hizmeti getir
  static async getTransportServiceById(id: string): Promise<TransportService | null> {
    const { data, error } = await supabase
      .from('transport_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Transport service fetch failed:', error);
      return null;
    }

    return data;
  }

  // Nakliye hizmeti güncelle
  static async updateTransportService(id: string, updates: Partial<TransportServiceInsert>): Promise<TransportService> {
    const { data, error } = await supabase
      .from('transport_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Transport service update failed:', error);
      throw new Error(`Transport service update failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from transport service update');
    }

    return data;
  }

  // Nakliye hizmeti sil
  static async deleteTransportService(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transport_services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Transport service deletion failed:', error);
      throw new Error(`Transport service deletion failed: ${error.message}`);
    }

    return true;
  }

  // Nakliye hizmetlerinde arama yap
  static async searchTransportServices(query: string): Promise<TransportService[]> {
    const { data, error } = await supabase
      .from('transport_services')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Transport services search failed:', error);
      throw new Error(`Transport services search failed: ${error.message}`);
    }

    return data || [];
  }
}

// Utility fonksiyonları
export const generateServiceNumber = (): string => {
  const prefix = 'TS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

export const validateIMO = (imo: string): boolean => {
  if (!imo) return false;

  // IMO numarası formatı: 7 haneli sayı
  const imoRegex = /^\d{7}$/;
  return imoRegex.test(imo.trim());
};

export const validateMMSI = (mmsi: string): boolean => {
  if (!mmsi) return false;

  // MMSI numarası formatı: 9 haneli sayı
  const mmsiRegex = /^\d{9}$/;
  return mmsiRegex.test(mmsi.trim());
};

export const validatePlateNumber = (plateNumber: string): boolean => {
  if (!plateNumber) return false;

  // Türk plaka formatı: 12ABC34 veya 12A1234 vb.
  const plateRegex = /^\d{2}[A-Z]{1,3}\d{2,4}$/i;
  return plateRegex.test(plateNumber.trim().replace(/\s/g, ''));
};

export const validateFlightNumber = (flightNumber: string): boolean => {
  if (!flightNumber) return false;

  // Uçuş numarası formatı: TK123, PC1234, vb.
  const flightRegex = /^[A-Z]{2}\d{1,4}$/i;
  return flightRegex.test(flightNumber.trim());
};

export const validateTrainNumber = (trainNumber: string): boolean => {
  if (!trainNumber) return false;

  // Tren numarası formatı: sayısal veya harf+sayı
  const trainRegex = /^[A-Z0-9]{2,10}$/i;
  return trainRegex.test(trainNumber.trim());
};
