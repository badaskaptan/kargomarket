import React from 'react';
import Modal from '../common/Modal';
// Modern modal: Tüm metadata ve owner bilgileri Türkçe label ile eksiksiz gösteriliyor
import type { ExtendedListing } from '../../types/database-types';

interface TransportServiceDetailModalProps {
    open: boolean;
    onClose: () => void;
    listing: ExtendedListing;
}

const TransportServiceDetailModal: React.FC<TransportServiceDetailModalProps> = ({ open, onClose, listing }) => {
    const owner = listing.owner_name || '-';
    const contactInfo = (listing.metadata && typeof listing.metadata.contact_info === 'object') ? listing.metadata.contact_info as Record<string, string> : {};
    const phone = listing.owner_phone || contactInfo.contact || '-';
    const email = listing.owner_email || contactInfo.email || '-';
    const company = listing.owner_company || contactInfo.company_name || '-';
    const address = listing.owner_address || contactInfo.address || '-';
    const taxOffice = listing.owner_tax_office || contactInfo.tax_office || '-';
    const taxNumber = listing.owner_tax_number || contactInfo.tax_number || '-';
    const userType = listing.owner_user_type || contactInfo.user_type || '-';
    const title = listing.title || '-';
    const description = listing.description || '-';
    const status = listing.status || '-';
    const createdAt = listing.created_at ? new Date(listing.created_at).toLocaleDateString() : '-';
    const vehicleType = listing.vehicle_types && listing.vehicle_types.length > 0 ? listing.vehicle_types.join(', ') : '-';
    const capacity = typeof listing?.metadata?.capacity === 'string' ? listing.metadata.capacity : '-';
    const transportMode = listing.transport_mode || '-';
    const origin = listing.origin || '-';
    const destination = listing.destination || '-';
    const availableFrom = listing.available_from_date || '-';
    const transportDetails = (listing.metadata && typeof listing.metadata.transport_details === 'object') ? listing.metadata.transport_details as Record<string, string> : {};
    const plate = transportDetails.plate_number || '-';
    const requiredDocs = Array.isArray(listing?.metadata?.required_documents) ? (listing.metadata.required_documents as string[]).join(', ') : '-';
    return (
        <Modal open={open} onClose={onClose} title="Nakliye İlan Detayı">
            <div className="space-y-6">
                {/* Header Bilgileri */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-t-2xl p-4 mb-4">
                    <span className="font-bold text-lg text-blue-700">İlan No:</span>
                    <span className="text-lg">{listing.listing_number}</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{status}</span>
                    <span className="ml-auto text-xs text-gray-500">{createdAt} tarihinde oluşturuldu</span>
                </div>
                {/* İlan Sahibi Bilgileri */}
                <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        {/* User icon ve başlık */}
                        <span className="font-semibold text-blue-700">İlan Sahibi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Ad Soyad</div>
                            <div className="font-medium">{owner}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Telefon</div>
                            <div className="font-medium">{phone}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">E-posta</div>
                            <div className="font-medium">{email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Şirket Adı</div>
                            <div className="font-medium">{company}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Adres</div>
                            <div className="font-medium">{address}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Vergi Dairesi</div>
                            <div className="font-medium">{taxOffice}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Vergi No</div>
                            <div className="font-medium">{taxNumber}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Kullanıcı Tipi</div>
                            <div className="font-medium">{userType}</div>
                        </div>
                    </div>
                </div>
                {/* İlan Bilgileri */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">İlan Başlığı</div>
                    <div className="font-semibold text-lg mb-2">{title}</div>
                    <div className="text-sm text-gray-500 mb-1">Açıklama</div>
                    <div className="mb-2">{description}</div>
                </div>
                {/* Taşıma Modu ve Detaylar */}
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Taşıma Modu</div>
                            <div className="font-medium">{transportMode}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Araç Tipi</div>
                            <div className="font-medium">{vehicleType}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Kapasite</div>
                            <div className="font-medium">{capacity}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Boşta Olma Tarihi</div>
                            <div className="font-medium">{availableFrom}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Plaka / Şasi No</div>
                            <div className="font-medium">{plate}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Gerekli Evraklar</div>
                            <div className="font-medium">{requiredDocs}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Kalkış Bölgesi</div>
                            <div className="font-medium">{origin}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Varış Bölgesi</div>
                            <div className="font-medium">{destination}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TransportServiceDetailModal;
