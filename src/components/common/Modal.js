import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Modal = ({ open, onClose, title, children }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative", children: [title && _jsx("h2", { className: "text-xl font-bold mb-4", children: title }), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg", "aria-label": "Kapat", children: "\u00D7" }), _jsx("div", { className: "overflow-auto max-h-[60vh]", children: children })] }) }));
};
export default Modal;
