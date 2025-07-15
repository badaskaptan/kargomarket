// ====================================
// FORM VALIDATION UTILITIES
// Karakter ve sayı sınırlaması sistemi
// ====================================

export interface FieldLimits {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  patternMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  remainingChars?: number;
}

// Form alanları için sınırlamalar
export const FIELD_LIMITS = {
  // Temel metin alanları
  title: {
    minLength: 10,
    maxLength: 100,
  },
  description: {
    minLength: 20,
    maxLength: 500,
  },
  company_name: {
    minLength: 2,
    maxLength: 100,
  },
  contact_person: {
    minLength: 2,
    maxLength: 50,
  },
  
  // Lokasyon alanları
  origin: {
    minLength: 2,
    maxLength: 100,
  },
  destination: {
    minLength: 2,
    maxLength: 100,
  },
  
  // Numerik alanlar
  weight: {
    minValue: 0.1,
    maxValue: 50000, // kg
  },
  volume: {
    minValue: 0.1,
    maxValue: 10000, // m³
  },
  price: {
    minValue: 1,
    maxValue: 1000000, // ₺
  },
  
  // Özel formatlar
  phone: {
    pattern: /^(\+90|0)?[5][0-9]{9}$/,
    patternMessage: 'Geçerli bir telefon numarası girin (örn: 05XX XXX XX XX)',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Geçerli bir e-posta adresi girin',
  },
  imo_number: {
    pattern: /^(IMO\s?)?[0-9]{7}$/,
    patternMessage: 'IMO numarası 7 haneli olmalıdır (örn: IMO 1234567)',
  },
  mmsi_number: {
    pattern: /^[0-9]{9}$/,
    patternMessage: 'MMSI numarası 9 haneli olmalıdır',
  },
  plate_number: {
    pattern: /^[0-9]{2}\s?[A-Z]{1,3}\s?[0-9]{1,4}$/,
    patternMessage: 'Geçerli bir plaka numarası girin (örn: 34 ABC 1234)',
  },
} as const;

// Karakter sayısı validasyonu
export function validateCharacterCount(value: string, limits: FieldLimits): ValidationResult {
  const length = value.length;
  
  if (limits.minLength && length < limits.minLength) {
    return {
      isValid: false,
      message: `En az ${limits.minLength} karakter olmalıdır`,
      remainingChars: limits.maxLength ? limits.maxLength - length : undefined,
    };
  }
  
  if (limits.maxLength && length > limits.maxLength) {
    return {
      isValid: false,
      message: `En fazla ${limits.maxLength} karakter olmalıdır`,
      remainingChars: 0,
    };
  }
  
  return {
    isValid: true,
    remainingChars: limits.maxLength ? limits.maxLength - length : undefined,
  };
}

// Sayısal değer validasyonu
export function validateNumericValue(value: number, limits: FieldLimits): ValidationResult {
  if (limits.minValue && value < limits.minValue) {
    return {
      isValid: false,
      message: `En az ${limits.minValue} olmalıdır`,
    };
  }
  
  if (limits.maxValue && value > limits.maxValue) {
    return {
      isValid: false,
      message: `En fazla ${limits.maxValue} olmalıdır`,
    };
  }
  
  return { isValid: true };
}

// Pattern validasyonu
export function validatePattern(value: string, limits: FieldLimits): ValidationResult {
  if (limits.pattern && !limits.pattern.test(value)) {
    return {
      isValid: false,
      message: limits.patternMessage || 'Geçersiz format',
    };
  }
  
  return { isValid: true };
}

// Tüm validasyonları birleştiren ana fonksiyon
export function validateField(value: string | number, fieldName: keyof typeof FIELD_LIMITS): ValidationResult {
  const limits = FIELD_LIMITS[fieldName];
  if (!limits) {
    return { isValid: true };
  }
  
  // String değerler için
  if (typeof value === 'string') {
    // Karakter sayısı kontrolü
    const charResult = validateCharacterCount(value, limits);
    if (!charResult.isValid) {
      return charResult;
    }
    
    // Pattern kontrolü
    const patternResult = validatePattern(value, limits);
    if (!patternResult.isValid) {
      return patternResult;
    }
    
    return {
      isValid: true,
      remainingChars: charResult.remainingChars,
    };
  }
  
  // Numeric değerler için
  if (typeof value === 'number') {
    return validateNumericValue(value, limits);
  }
  
  return { isValid: true };
}

// React component'ler için hook
export function useFieldValidation(fieldName: keyof typeof FIELD_LIMITS) {
  const validateValue = (value: string | number) => {
    return validateField(value, fieldName);
  };
  
  const getLimits = () => {
    return FIELD_LIMITS[fieldName];
  };
  
  return {
    validateValue,
    getLimits,
    limits: FIELD_LIMITS[fieldName],
  };
}

// Form input component'i için validation helper
export interface ValidationInputProps {
  value: string | number;
  fieldName: keyof typeof FIELD_LIMITS;
  onChange: (value: string | number, validation: ValidationResult) => void;
  className?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel';
}
