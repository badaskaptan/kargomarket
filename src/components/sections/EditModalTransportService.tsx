import React from 'react';
import Modal from '../common/Modal';
import CreateTransportServiceSection from './CreateTransportServiceSection';
import type { ExtendedListing } from '../../types/database-types';

interface EditModalTransportServiceProps {
  listing: ExtendedListing;
  isOpen: boolean;
  onClose: () => void;
}

const EditModalTransportService: React.FC<EditModalTransportServiceProps> = ({ listing, isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onClose={onClose} title="Taşıma Hizmeti Düzenle">
      <CreateTransportServiceSection
        initialData={{ ...listing, metadata: (listing.metadata ?? {}) as import('../../types/database-types').GenericMetadata }}
        onClose={onClose}
      />
    </Modal>
  );
};

export default EditModalTransportService;
