import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateField, FIELD_LIMITS, type ValidationResult } from '../../utils/fieldValidation';

interface ValidatedInputProps {
  fieldName: keyof typeof FIELD_LIMITS;
  value: string | number;
  onChange: (value: string | number, isValid: boolean) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number; // textarea için
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  fieldName,
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  label,
  required = false,
  disabled = false,
  rows = 3,
}) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [showValidation, setShowValidation] = useState(false);
  
  const limits = FIELD_LIMITS[fieldName];
  
  useEffect(() => {
    if (value !== '' && value !== 0) {
      const result = validateField(value, fieldName);
      setValidation(result);
      setShowValidation(true);
      onChange(value, result.isValid);
    } else {
      setValidation({ isValid: !required });
      setShowValidation(required);
      onChange(value, !required);
    }
  }, [value, fieldName, required, onChange]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue, validation.isValid);
  };
  
  const getInputClassName = () => {
    let baseClassName = `block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${className}`;
    
    if (disabled) {
      baseClassName += ' bg-gray-100 text-gray-500 cursor-not-allowed';
    } else if (showValidation) {
      if (validation.isValid) {
        baseClassName += ' border-green-300 focus:ring-green-500 focus:border-green-500';
      } else {
        baseClassName += ' border-red-300 focus:ring-red-500 focus:border-red-500';
      }
    } else {
      baseClassName += ' border-gray-300 focus:ring-primary-500 focus:border-primary-500';
    }
    
    return baseClassName;
  };
  
  const renderValidationMessage = () => {
    if (!showValidation) return null;
    
    return (
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {validation.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.message || (validation.isValid ? 'Geçerli' : '')}
          </span>
        </div>
        
        {/* Karakter sayısı göstergesi */}
        {typeof value === 'string' && limits && 'maxLength' in limits && (
          <span className={`text-xs ${
            validation.remainingChars !== undefined && validation.remainingChars < 10 
              ? 'text-orange-600' 
              : 'text-gray-500'
          }`}>
            {value.length}/{limits.maxLength}
          </span>
        )}
      </div>
    );
  };
  
  const renderLimitsInfo = () => {
    if (!limits) return null;
    
    const infos = [];
    
    if ('minLength' in limits) {
      infos.push(`Min: ${limits.minLength} karakter`);
    }
    if ('maxLength' in limits) {
      infos.push(`Max: ${limits.maxLength} karakter`);
    }
    if ('minValue' in limits) {
      infos.push(`Min: ${limits.minValue}`);
    }
    if ('maxValue' in limits) {
      infos.push(`Max: ${limits.maxValue}`);
    }
    
    if (infos.length === 0) return null;
    
    return (
      <div className="mt-1">
        <span className="text-xs text-gray-400">
          {infos.join(' • ')}
        </span>
      </div>
    );
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          value={typeof value === 'string' ? value : String(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className={getInputClassName()}
          disabled={disabled}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={typeof value === 'string' ? value : String(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className={getInputClassName()}
          disabled={disabled}
          required={required}
          min={type === 'number' && limits && 'minValue' in limits ? limits.minValue : undefined}
          max={type === 'number' && limits && 'maxValue' in limits ? limits.maxValue : undefined}
        />
      )}
      
      {renderValidationMessage()}
      {!showValidation && renderLimitsInfo()}
    </div>
  );
};

// Özel input türleri için wrapper'lar
export const ValidatedTextInput: React.FC<Omit<ValidatedInputProps, 'type'>> = (props) => (
  <ValidatedInput {...props} type="text" />
);

export const ValidatedNumberInput: React.FC<Omit<ValidatedInputProps, 'type'>> = (props) => (
  <ValidatedInput {...props} type="number" />
);

export const ValidatedEmailInput: React.FC<Omit<ValidatedInputProps, 'type'>> = (props) => (
  <ValidatedInput {...props} type="email" />
);

export const ValidatedPhoneInput: React.FC<Omit<ValidatedInputProps, 'type'>> = (props) => (
  <ValidatedInput {...props} type="tel" />
);

export const ValidatedTextarea: React.FC<Omit<ValidatedInputProps, 'type'>> = (props) => (
  <ValidatedInput {...props} type="textarea" />
);

export default ValidatedInput;
