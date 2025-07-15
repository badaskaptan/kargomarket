import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ValidatedTextInput, ValidatedNumberInput, ValidatedEmailInput, ValidatedPhoneInput, ValidatedTextarea } from '../common/ValidatedInput';
export const ValidationDemoPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company_name: '',
        contact_person: '',
        origin: '',
        destination: '',
        weight: 0,
        volume: 0,
        price: 0,
        phone: '',
        email: '',
        imo_number: '',
        mmsi_number: '',
        plate_number: '',
    });
    const [validationStates, setValidationStates] = useState({});
    const handleChange = (field) => (value, isValid) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setValidationStates(prev => ({ ...prev, [field]: isValid }));
    };
    const isFormValid = Object.values(validationStates).every(isValid => isValid);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            console.log('Form submitted:', formData);
            alert('Form başarıyla gönderildi!');
        }
        else {
            alert('Lütfen tüm alanları doğru şekilde doldurun.');
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Form Validasyon Sistemi Demo" }), _jsx("p", { className: "text-gray-600", children: "Bu demo sayfas\u0131, karakter ve say\u0131 s\u0131n\u0131rlamas\u0131 olan form alanlar\u0131n\u0131 g\u00F6sterir. Her alan i\u00E7in ger\u00E7ek zamanl\u0131 validasyon ve kullan\u0131c\u0131 dostu uyar\u0131lar sunulur." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Temel Bilgiler" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(ValidatedTextInput, { fieldName: "title", value: formData.title, onChange: handleChange('title'), label: "\u0130lan Ba\u015Fl\u0131\u011F\u0131", placeholder: "\u00D6rn: \u0130stanbul - Ankara Nakliye Hizmeti", required: true }), _jsx(ValidatedTextInput, { fieldName: "company_name", value: formData.company_name, onChange: handleChange('company_name'), label: "\u015Eirket Ad\u0131", placeholder: "\u015Eirket ad\u0131n\u0131z\u0131 girin", required: true })] }), _jsx("div", { className: "mt-4", children: _jsx(ValidatedTextarea, { fieldName: "description", value: formData.description, onChange: handleChange('description'), label: "A\u00E7\u0131klama", placeholder: "Hizmet detaylar\u0131n\u0131 a\u00E7\u0131klay\u0131n...", required: true, rows: 4 }) })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Lokasyon Bilgileri" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(ValidatedTextInput, { fieldName: "origin", value: formData.origin, onChange: handleChange('origin'), label: "\u00C7\u0131k\u0131\u015F Noktas\u0131", placeholder: "\u015Eehir, b\u00F6lge veya adres", required: true }), _jsx(ValidatedTextInput, { fieldName: "destination", value: formData.destination, onChange: handleChange('destination'), label: "Var\u0131\u015F Noktas\u0131", placeholder: "\u015Eehir, b\u00F6lge veya adres", required: true })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Kapasite ve Fiyat" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(ValidatedNumberInput, { fieldName: "weight", value: formData.weight, onChange: handleChange('weight'), label: "A\u011F\u0131rl\u0131k (kg)", placeholder: "0", required: true }), _jsx(ValidatedNumberInput, { fieldName: "volume", value: formData.volume, onChange: handleChange('volume'), label: "Hacim (m\u00B3)", placeholder: "0", required: true }), _jsx(ValidatedNumberInput, { fieldName: "price", value: formData.price, onChange: handleChange('price'), label: "Fiyat (\u20BA)", placeholder: "0", required: true })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "\u0130leti\u015Fim Bilgileri" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(ValidatedTextInput, { fieldName: "contact_person", value: formData.contact_person, onChange: handleChange('contact_person'), label: "\u0130leti\u015Fim Ki\u015Fisi", placeholder: "Ad Soyad", required: true }), _jsx(ValidatedPhoneInput, { fieldName: "phone", value: formData.phone, onChange: handleChange('phone'), label: "Telefon", placeholder: "05XX XXX XX XX", required: true })] }), _jsx("div", { className: "mt-4", children: _jsx(ValidatedEmailInput, { fieldName: "email", value: formData.email, onChange: handleChange('email'), label: "E-posta", placeholder: "ornek@email.com", required: true }) })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "\u00D6zel Format Alanlar\u0131" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(ValidatedTextInput, { fieldName: "plate_number", value: formData.plate_number, onChange: handleChange('plate_number'), label: "Plaka Numaras\u0131", placeholder: "34 ABC 1234" }), _jsx(ValidatedTextInput, { fieldName: "imo_number", value: formData.imo_number, onChange: handleChange('imo_number'), label: "IMO Numaras\u0131", placeholder: "IMO 1234567" }), _jsx(ValidatedTextInput, { fieldName: "mmsi_number", value: formData.mmsi_number, onChange: handleChange('mmsi_number'), label: "MMSI Numaras\u0131", placeholder: "123456789" })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-6 border-t border-gray-200", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Form Durumu: ", isFormValid ? (_jsx("span", { className: "text-green-600 font-medium", children: "\u2713 T\u00FCm alanlar ge\u00E7erli" })) : (_jsx("span", { className: "text-red-600 font-medium", children: "\u26A0 Baz\u0131 alanlar eksik veya hatal\u0131" }))] }), _jsx("button", { type: "submit", disabled: !isFormValid, className: `px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isFormValid
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`, children: "Formu G\u00F6nder" })] })] }), _jsxs("div", { className: "mt-8 p-4 bg-gray-100 rounded-lg", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Debug Bilgileri:" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-1", children: "Form Verileri:" }), _jsx("pre", { className: "text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32", children: JSON.stringify(formData, null, 2) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-1", children: "Validasyon Durumlar\u0131:" }), _jsx("pre", { className: "text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32", children: JSON.stringify(validationStates, null, 2) })] })] })] })] }));
};
export default ValidationDemoPage;
