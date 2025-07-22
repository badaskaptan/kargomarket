import type { Database } from '../types/database-types';

type TransportService = Database['public']['Tables']['transport_services']['Row'];
type TransportServiceInsert = Database['public']['Tables']['transport_services']['Insert'];

export declare class TransportServiceService {
    static createTransportService(serviceData: TransportServiceInsert): Promise<TransportService>;
    static getTransportServices(userId: string): Promise<TransportService[]>;
    static getTransportServiceById(id: string): Promise<TransportService | null>;
    static updateTransportService(id: string, updates: Partial<TransportServiceInsert>): Promise<TransportService>;
    static deleteTransportService(id: string): Promise<boolean>;
    static searchTransportServices(query: string): Promise<TransportService[]>;
}

export declare function generateServiceNumber(): string;
export declare function validateIMO(imo: string): boolean;
export declare function validateMMSI(mmsi: string): boolean;
export declare function validatePlateNumber(plateNumber: string): boolean;
export declare function validateFlightNumber(flightNumber: string): boolean;
export declare function validateTrainNumber(trainNumber: string): boolean;
