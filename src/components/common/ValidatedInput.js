import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateField, FIELD_LIMITS } from '../../utils/fieldValidation';
export const ValidatedInput = ({ fieldName, value, onChange, type = 'text', placeholder, className = '', label, required = false, disabled = false, rows = 3, }) => {
    const [validation, setValidation] = useState({ isValid: true });
    const [showValidation, setShowValidation] = useState(false);
    const limits = FIELD_LIMITS[fieldName];
    useEffect(() => {
        if (value !== '' && value !== 0) {
            const result = validateField(value, fieldName);
            setValidation(result);
            setShowValidation(true);
            onChange(value, result.isValid);
        }
        else {
            setValidation({ isValid: !required });
            setShowValidation(required);
            onChange(value, !required);
        }
    }, [value, fieldName, required, onChange]);
    const handleChange = (e) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        onChange(newValue, validation.isValid);
    };
    const getInputClassName = () => {
        let baseClassName = `block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${className}`;
        if (disabled) {
            baseClassName += ' bg-gray-100 text-gray-500 cursor-not-allowed';
        }
        else if (showValidation) {
            if (validation.isValid) {
                baseClassName += ' border-green-300 focus:ring-green-500 focus:border-green-500';
            }
            else {
                baseClassName += ' border-red-300 focus:ring-red-500 focus:border-red-500';
            }
        }
        else {
            baseClassName += ' border-gray-300 focus:ring-primary-500 focus:border-primary-500';
        }
        return baseClassName;
    };
    const renderValidationMessage = () => {
        if (!showValidation)
            return null;
        return (_jsxs("div", { className: "mt-1 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [validation.isValid ? (_jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-red-500" })), _jsx("span", { className: `text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`, children: validation.message || (validation.isValid ? 'Geçerli' : '') })] }), typeof value === 'string' && limits && 'maxLength' in limits && (_jsxs("span", { className: `text-xs ${validation.remainingChars !== undefined && validation.remainingChars < 10
                        ? 'text-orange-600'
                        : 'text-gray-500'}`, children: [value.length, "/", limits.maxLength] }))] }));
    };
    const renderLimitsInfo = () => {
        if (!limits)
            return null;
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
        if (infos.length === 0)
            return null;
        return (_jsx("div", { className: "mt-1", children: _jsx("span", { className: "text-xs text-gray-400", children: infos.join(' • ') }) }));
    };
    return (_jsxs("div", { className: "space-y-1", children: [label && (_jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), type === 'textarea' ? (_jsx("textarea", { value: typeof value === 'string' ? value : String(value), onChange: handleChange, placeholder: placeholder, className: getInputClassName(), disabled: disabled, required: required, rows: rows })) : (_jsx("input", { type: type, value: typeof value === 'string' ? value : String(value), onChange: handleChange, placeholder: placeholder, className: getInputClassName(), disabled: disabled, required: required, min: type === 'number' && limits && 'minValue' in limits ? limits.minValue : undefined, max: type === 'number' && limits && 'maxValue' in limits ? limits.maxValue : undefined })), renderValidationMessage(), !showValidation && renderLimitsInfo()] }));
};
// Özel input türleri için wrapper'lar
export const ValidatedTextInput = (props) => (_jsx(ValidatedInput, { ...props, type: "text" }));
export const ValidatedNumberInput = (props) => (_jsx(ValidatedInput, { ...props, type: "number" }));
export const ValidatedEmailInput = (props) => (_jsx(ValidatedInput, { ...props, type: "email" }));
export const ValidatedPhoneInput = (props) => (_jsx(ValidatedInput, { ...props, type: "tel" }));
export const ValidatedTextarea = (props) => (_jsx(ValidatedInput, { ...props, type: "textarea" }));
export default ValidatedInput;
