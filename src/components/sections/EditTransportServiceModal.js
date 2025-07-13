import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Modal from '../common/Modal';
import CreateTransportServiceSection from './CreateTransportServiceSection';
const EditTransportServiceModal = ({ open, onClose, listing }) => {
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Nakliye \u0130lan\u0131 D\u00FCzenle", children: _jsx(CreateTransportServiceSection, { initialData: { ...listing, metadata: (listing.metadata ?? {}) }, onClose: onClose }) }));
};
export default EditTransportServiceModal;
