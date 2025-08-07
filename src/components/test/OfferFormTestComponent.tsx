// Test component to demonstrate the dynamic offer form system
import React, { useState } from 'react';
import CreateOfferModal from '../modals/CreateOfferModal';
import type { Database } from '../../types/database-types';

type Listing = Database['public']['Tables']['listings']['Row'];

// Mock data examples
const mockLoadListing = {
    id: '1',
    user_id: 'user1',
    title: 'İstanbul-Ankara Genel Kargo Taşımacılığı',
    origin_city: 'İstanbul',
    destination_city: 'Ankara',
    // Bu alan load listing olduğunu gösteriyor
    listing_type: 'load_listing',
    cargo_type: 'general_cargo',
    weight_kg: 1000,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const mockShipmentRequest = {
    id: '2',
    user_id: 'user2',
    title: 'İstanbul-İzmir Nakliye Talebi',
    origin_city: 'İstanbul',
    destination_city: 'İzmir',
    // Bu alan shipment request olduğunu gösteriyor
    listing_type: 'shipment_request',
    vehicle_types: ['truck'],
    weight_kg: 2000,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const mockTransportServiceListing = {
    id: '3', 
    user_id: 'user3',
    title: 'İstanbul-Bursa Nakliye Hizmeti',
    origin_city: 'İstanbul',
    destination_city: 'Bursa',
    // Bu alanlar transport service olduğunu gösteriyor
    listing_type: 'transport_service',
    transport_mode: 'road' as const,
    vehicle_types: ['truck'],
    capacity_kg: 5000,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const OfferFormTestComponent: React.FC = () => {
    const [activeModal, setActiveModal] = useState<'load' | 'shipment' | 'transport' | null>(null);

    const openModal = (type: 'load' | 'shipment' | 'transport') => {
        // Önce mevcut modal'ı kapat
        if (activeModal) {
            setActiveModal(null);
            // 100ms bekle, sonra yeni modal'ı aç
            setTimeout(() => setActiveModal(type), 100);
        } else {
            setActiveModal(type);
        }
    };

    const handleOfferSubmit = async (offerData: Record<string, unknown>) => {
        console.log('Offer submitted:', offerData);
        // Burada normalde API çağrısı yapılır
        // Toast notification veya success state kullanılabilir
        setActiveModal(null); // Modal'ı kapat
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                Dinamik Teklif Formu Test Sayfası
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Load Listing Test */}
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-blue-900 mb-3">
                        Yük İlanı Teklifi
                    </h2>
                    <p className="text-blue-700 mb-4">
                        Bu test, yük ilanına teklif verme formunu gösterir. 
                        Form, kargo detayları, hizmet kapsamı, gümrük işlemleri gibi 
                        yük taşımacılığına özel alanları gösterecek.
                    </p>
                    <button
                        onClick={() => openModal('load')}
                        disabled={activeModal !== null}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {activeModal === 'load' ? 'Modal Açık...' : 'Yük İlanına Teklif Ver'}
                    </button>
                </div>

                {/* Shipment Request Test */}
                <div className="bg-green-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-900 mb-3">
                        Nakliye Talebi Teklifi
                    </h2>
                    <p className="text-green-700 mb-4">
                        Bu test, nakliye talebine teklif verme formunu gösterir.
                        Form, nakliyeci için optimize edilmiş alanları gösterecek,
                        gereksiz alanları gizleyecek.
                    </p>
                    <button
                        onClick={() => openModal('shipment')}
                        disabled={activeModal !== null}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {activeModal === 'shipment' ? 'Modal Açık...' : 'Nakliye Talebine Teklif Ver'}
                    </button>
                </div>

                {/* Transport Service Test */}
                <div className="bg-purple-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-purple-900 mb-3">
                        Nakliye Hizmeti Teklifi
                    </h2>
                    <p className="text-purple-700 mb-4">
                        Bu test, nakliye hizmeti ilanına teklif verme formunu gösterir.
                        Form, sadece temel bilgiler ve kapasite detaylarını gösterecek.
                    </p>
                    <button
                        onClick={() => openModal('transport')}
                        disabled={activeModal !== null}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
                    >
                        {activeModal === 'transport' ? 'Modal Açık...' : 'Nakliye Hizmetine Teklif Ver'}
                    </button>
                </div>
            </div>

            {/* Form Farkları Açıklaması */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Form Farkları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">Yük İlanı Formu:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Kargo türü seçimi</li>
                            <li>• Hizmet kapsamı (kapıdan-kapıya vs)</li>
                            <li>• Transit süresi</li>
                            <li>• Gümrük işlemleri</li>
                            <li>• Döküman işlemleri</li>
                            <li>• Yükleme/boşaltma</li>
                            <li>• Ödeme şartları</li>
                            <li>• Ödeme yöntemi</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-green-900 mb-2">Nakliye Talebi Formu:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Sadece temel fiyat bilgileri</li>
                            <li>• Hizmet tarihleri</li>
                            <li>• Nakliye kapasitesi mesajı</li>
                            <li>• Gereksiz alanlar gizli</li>
                            <li>• Nakliyeci odaklı validasyon</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-purple-900 mb-2">Nakliye Hizmeti Formu:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Sadece temel fiyat bilgileri</li>
                            <li>• Hizmet tarihleri</li>
                            <li>• Taşıma kapasitesi mesajı</li>
                            <li>• Gereksiz alanlar gizli</li>
                            <li>• Basitleştirilmiş validasyon</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Load Listing Modal */}
            {activeModal === 'load' && (
                <CreateOfferModal
                    key="load-modal"
                    listing={mockLoadListing as unknown as Listing}
                    isOpen={true}
                    onClose={closeModal}
                    onSubmit={handleOfferSubmit}
                    currentUserId="test-user"
                />
            )}

            {/* Shipment Request Modal */}
            {activeModal === 'shipment' && (
                <CreateOfferModal
                    key="shipment-modal"
                    listing={mockShipmentRequest as unknown as Listing}
                    isOpen={true}
                    onClose={closeModal}
                    onSubmit={handleOfferSubmit}
                    currentUserId="test-user"
                />
            )}

            {/* Transport Service Modal */}
            {activeModal === 'transport' && (
                <CreateOfferModal
                    key="transport-modal"
                    listing={mockTransportServiceListing as unknown as Listing}
                    isOpen={true}
                    onClose={closeModal}
                    onSubmit={handleOfferSubmit}
                    currentUserId="test-user"
                />
            )}
        </div>
    );
};

export default OfferFormTestComponent;
