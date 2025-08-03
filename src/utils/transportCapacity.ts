/**
 * Utility functions for transport service capacity display based on transport mode
 */

export type TransportMode = 'road' | 'sea' | 'air' | 'rail';

/**
 * Get capacity label with units based on transport mode
 */
export function getCapacityLabel(mode: TransportMode | string): string {
    switch (mode) {
        case 'air':
            return 'Kargo Kapasitesi (kg/m³)';
        case 'sea':
            return 'Yük Kapasitesi (DWT)';
        case 'road':
        case 'rail':
        default:
            return 'Kapasite (ton/m³)';
    }
}

/**
 * Get capacity unit based on transport mode
 */
export function getCapacityUnit(mode: TransportMode | string): string {
    switch (mode) {
        case 'air':
            return 'kg';
        case 'sea':
            return 'ton';
        case 'road':
        case 'rail':
        default:
            return 'ton';
    }
}

/**
 * Get formatted capacity display with proper prefix and unit
 */
export function getFormattedCapacity(
    capacityValue: number | string,
    mode: TransportMode | string
): string {
    const value = typeof capacityValue === 'string' ? capacityValue : capacityValue.toString();

    switch (mode) {
        case 'air':
            return `Kapasite ${value} kg`;
        case 'sea':
            return `DWT ${value} ton`;
        case 'road':
        case 'rail':
        default:
            return `Kapasite ${value} ton`;
    }
}

/**
 * Get short capacity display for listing cards
 */
export function getDisplayCapacity(
    capacity: number | string,
    mode: TransportMode | string
): string {
    const value = typeof capacity === 'string' ? capacity : capacity.toString();
    const unit = getCapacityUnit(mode);

    switch (mode) {
        case 'sea':
            return `${value} DWT`;
        default:
            return `${value} ${unit}`;
    }
}
