import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Modal from '../common/Modal';
import CreateTransportServiceSection from './CreateTransportServiceSection';
const EditModalTransportService = ({ listing, isOpen, onClose }) => {
    return (_jsx(Modal, { open: isOpen, onClose: onClose, title: "Ta\u015F\u0131ma Hizmeti D\u00FCzenle", children: _jsx(CreateTransportServiceSection, { initialData: { ...listing, metadata: (listing.metadata ?? {}) }, onClose: onClose }) }));
};
export default EditModalTransportService;
