import React from 'react';
import Modal from '../common/Modal';
import CreateTransportServiceSection from './CreateTransportServiceSection';
import type { ExtendedListing } from '../../types/database-types';

interface EditTransportServiceModalProps {
    open: boolean;
    onClose: () => void;
    listing: ExtendedListing;
}

const EditTransportServiceModal: React.FC<EditTransportServiceModalProps> = ({ open, onClose, listing }) => {
    return (
        <Modal open={open} onClose={onClose} title="Nakliye İlanı Düzenle">
            {/* initialData propunu CreateTransportServiceSection'a ekleyin */}
            <CreateTransportServiceSection
                initialData={{ ...listing, metadata: (listing.metadata ?? {}) as import('../../types/database-types').GenericMetadata }}
                onClose={onClose}
            />
        </Modal>
    );
};

export default EditTransportServiceModal;
