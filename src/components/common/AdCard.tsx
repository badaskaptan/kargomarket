import React, { useState } from 'react';
import type { ExtendedListing } from '../../types/database-types';
import EditLoadListingModal from '../modals/EditLoadListingModal';

interface AdCardProps {
  listing: ExtendedListing;
  onUpdated?: (updated: ExtendedListing) => void;
}

const AdCard: React.FC<AdCardProps> = ({ listing, onUpdated }) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="rounded-xl border p-4 shadow-md bg-white">
      <h3 className="text-lg font-bold mb-2">{listing.title}</h3>
      <p className="text-gray-700 mb-2">{listing.description}</p>
      {/* ... Diğer alanlar ... */}
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setEditOpen(true)}
        title="Düzenle"
      >
        Düzenle
      </button>
      <EditLoadListingModal
        listing={listing}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default AdCard;
