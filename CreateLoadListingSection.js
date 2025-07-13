import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, Package, MapPin, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { ListingService } from '../../services/listingService';
import { storage } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
const CreateLoadListingSection = () => {
    const { setActiveSection } = useDashboard();
    const { user } = useAuth();
    const [roleType, setRoleType] = useState('');
    const [offerType, setOfferType] = useState('direct');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [formData, setFormData] = useState({
        listingNumber: `ILN${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}`,
        loadTitle: '',
        loadType: '',
        loadDescription: '',
        loadOrigin: '',
        loadDestination: '',
        loadingDate: '',
        deliveryDate: '',
        loadWeight: '',
        loadVolume: '',
        setPrice: '',
        loadRoleSelection: ''
    });
    const [loadImages, setLoadImages] = useState([null, null, null]);
    const [requiredDocuments, setRequiredDocuments] = useState([]);
    // Evrak etiketleri
    const documentLabels = {
        invoice: '📄 Fatura / Proforma Fatura',
        salesContract: '📝 Satış Sözleşmesi',
        waybill: '📋 İrsaliye / Sevk Fişi',
        originCertificate: '🌍 Menşe Şahadetnamesi',
        analysis: '🔬 Analiz Sertifikası / Laboratuvar Raporları',
        complianceCertificates: '📑 TSE, CE, ISO Uygunluk Sertifikaları',
        productPhotos: '🖼️ Ürün Fotoğrafları',
        packingList: '📦 Ambalaj / Packing List',
        warehouseReceipt: '🏪 Depo Teslim Fişi / Stok Belgesi',
        producerReceipt: '🌾 Müstahsil Makbuzu',
        customsDeclaration: '🛃 Gümrük Beyannamesi',
        msds: '🧪 MSDS',
        fumigationCertificate: '🌫️ Fumigasyon Sertifikası',
        inspectionReports: '🔎 SGS / Intertek Raporları',
        paymentDocuments: '💳 Ödeme Belgeleri',
        healthCertificates: '🩺 Sağlık/Veteriner/Fitosaniter Sertifika',
        specialCertificates: '🕋 Helal/Kosher/ECO Sertifikaları',
        importExportLicense: '📜 İthalat/İhracat Lisansı',
        antidampingCertificates: '🌱 Anti-damping/Orijinallik Belgeleri',
        productManuals: '📘 Ürün Teknik Bilgi Formları',
        other: '➕ Diğer'
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleDocumentChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setRequiredDocuments(prev => [...prev, value]);
        }
        else {
            setRequiredDocuments(prev => prev.filter(doc => doc !== value));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kullanıcı kontrolü
        if (!user) {
            toast.error('Giriş yapmanız gerekiyor!');
            return;
        }
        // Form validasyonu
        if (!formData.loadTitle || !formData.loadType || !formData.loadingDate || !formData.deliveryDate || !formData.loadWeight || !formData.loadVolume || !formData.loadRoleSelection || !formData.loadDescription) {
            toast.error('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }
        setIsSubmitting(true);
        try {
            // Sayısal değerlerin validasyonu
            const weightValue = formData.loadWeight ? parseFloat(formData.loadWeight) : null;
            const volumeValue = formData.loadVolume ? parseFloat(formData.loadVolume) : null;
            const priceAmount = formData.setPrice ? parseFloat(formData.setPrice) : null;
            // Sayısal sınır kontrolleri
            if (weightValue && (weightValue > 999999 || weightValue < 0)) {
                toast.error('Ağırlık değeri 0-999999 ton arasında olmalıdır!');
                return;
            }
            if (volumeValue && (volumeValue > 999999 || volumeValue < 0)) {
                toast.error('Hacim değeri 0-999999 m³ arasında olmalıdır!');
                return;
            }
            if (priceAmount && (priceAmount > 999999999 || priceAmount < 0)) {
                toast.error('Fiyat değeri 0-999,999,999 TL arasında olmalıdır!');
                return;
            }
            // Önce ilan kaydını oluşturalım
            const listingData = {
                user_id: user.id,
                listing_type: 'load_listing',
                title: formData.loadTitle,
                description: formData.loadDescription,
                origin: formData.loadOrigin,
                destination: formData.loadDestination,
                transport_mode: 'road',
                role_type: roleType || null,
                load_type: formData.loadType || null,
                weight_value: weightValue,
                weight_unit: 'ton',
                volume_value: volumeValue,
                volume_unit: 'm3',
                loading_date: formData.loadingDate || null,
                delivery_date: formData.deliveryDate || null,
                price_amount: priceAmount,
                price_currency: 'TRY',
                offer_type: offerType === 'price' ? 'fixed_price' : 'negotiable',
                transport_responsible: formData.loadRoleSelection || null,
                required_documents: requiredDocuments.length > 0 ? requiredDocuments : null,
                listing_number: formData.listingNumber,
                status: 'active'
            };
            const listing = await ListingService.createListing(listingData);
            const listingId = listing.id;
            // Yüklenen evrakları Supabase Storage'a yükle
            console.log('📋 Uploading documents:', uploadedDocuments.length);
            const documentUrls = [];
            for (const doc of uploadedDocuments) {
                if (doc.file && doc.documentType) {
                    try {
                        const result = await storage.uploadListingDocument(listingId, doc.file, doc.documentType);
                        if (result.data) {
                            documentUrls.push(result.data.publicUrl);
                            console.log('✅ Document uploaded:', result.data.publicUrl);
                        }
                        else {
                            console.warn('⚠️ Document upload failed (RLS policy issue):', result.error);
                            toast.error(`Evrak yükleme sorunu: ${doc.name}. Storage izinleri kontrol edilmeli.`);
                        }
                    }
                    catch (docError) {
                        console.warn('⚠️ Document upload exception (RLS policy issue):', docError);
                        toast.error(`Evrak yükleme sorunu: ${doc.name}. Storage izinleri kontrol edilmeli.`);
                    }
                }
            }
            // Yüklenen görselleri Supabase Storage'a yükle
            console.log('🖼️ Uploading images:', uploadedImages.length);
            const imageUrls = [];
            for (const img of uploadedImages) {
                try {
                    const result = await storage.uploadListingImage(listingId, img.file, img.index);
                    if (result.data) {
                        imageUrls.push(result.data.publicUrl);
                        console.log('✅ Image uploaded:', result.data.publicUrl);
                    }
                    else {
                        console.warn('⚠️ Image upload failed (RLS policy issue):', result.error);
                        toast.error(`Görsel yükleme sorunu: Görsel ${img.index + 1}. Storage izinleri kontrol edilmeli.`);
                    }
                }
                catch (imgError) {
                    console.warn('⚠️ Image upload exception (RLS policy issue):', imgError);
                    toast.error(`Görsel yükleme sorunu: Görsel ${img.index + 1}. Storage izinleri kontrol edilmeli.`);
                }
            }
            // İlanı evrak ve görsel URL'leri ile güncelle
            if (documentUrls.length > 0 || imageUrls.length > 0) {
                await ListingService.updateListing(listingId, {
                    document_urls: documentUrls.length > 0 ? documentUrls : null,
                    image_urls: imageUrls.length > 0 ? imageUrls : null
                });
            }
            // Başarı mesajı - yüklenen dosya sayısına göre
            const uploadedFiles = documentUrls.length + imageUrls.length;
            const totalFiles = uploadedDocuments.length + uploadedImages.length;
            if (uploadedFiles === totalFiles && totalFiles > 0) {
                toast.success(`Yük ilanı ve tüm dosyalar başarıyla yüklendi! (${uploadedFiles}/${totalFiles})`);
            }
            else if (uploadedFiles > 0) {
                toast.success(`Yük ilanı oluşturuldu! ${uploadedFiles}/${totalFiles} dosya yüklendi.`);
            }
            else if (totalFiles > 0) {
                toast.success('Yük ilanı oluşturuldu! Dosyalar yüklenemedi - Storage izinleri kontrol edilmeli.');
            }
            else {
                toast.success('Yük ilanı başarıyla oluşturuldu!');
            }
            // Success message and redirect
            setTimeout(() => setActiveSection('my-listings'), 1200);
        }
        catch (error) {
            console.error('Error creating listing:', error);
            toast.error(error instanceof Error ? error.message : 'İlan oluşturulurken bir hata oluştu!');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                // Dosya türü kontrolü
                const allowedTypes = [
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/png',
                    'image/jpeg',
                    'image/jpg'
                ];
                if (allowedTypes.includes(file.type)) {
                    const newDocument = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        type: file.type,
                        url: URL.createObjectURL(file), // Geçici preview URL
                        file: file, // Dosyayı saklıyoruz
                        documentType: 'general' // Varsayılan tip
                    };
                    setUploadedDocuments(prev => [...prev, newDocument]);
                }
                else {
                    toast.error('Desteklenmeyen dosya türü. Lütfen Excel, Word, PDF, PNG veya JPEG dosyası yükleyin.');
                }
            });
        }
    };
    const handleDocumentDelete = (id) => {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
    };
    const handleDocumentPreview = (document) => {
        window.open(document.url, '_blank');
    };
    const handleDocumentDownload = (document) => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        link.click();
    };
    const getFileIcon = (type) => {
        if (type.includes('pdf'))
            return '📄';
        if (type.includes('excel') || type.includes('spreadsheet'))
            return '📊';
        if (type.includes('word') || type.includes('document'))
            return '📝';
        if (type.includes('image'))
            return '🖼️';
        return '📎';
    };
    const getRoleBackground = () => {
        if (roleType === 'buyer') {
            return 'bg-gradient-to-br from-blue-50 to-blue-100';
        }
        else if (roleType === 'seller') {
            return 'bg-gradient-to-br from-green-50 to-green-100';
        }
        return 'bg-white';
    };
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsx(Toaster, { position: "top-right" }), _jsxs("div", { className: `rounded-3xl shadow-lg p-6 transition-all duration-300 ${getRoleBackground()}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => setActiveSection('my-listings'), className: "mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full", title: "Geri D\u00F6n", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Yeni Y\u00FCk \u0130lan\u0131 Olu\u015Ftur" })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { htmlFor: "roleType", className: "sr-only", children: "Rol Se\u00E7in" }), _jsxs("select", { id: "roleType", value: roleType, onChange: (e) => setRoleType(e.target.value), className: "px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium bg-white shadow-sm", title: "Rol Se\u00E7in", "aria-label": "Rol Se\u00E7in", children: [_jsx("option", { value: "", disabled: true, children: "Rol Se\u00E7in" }), _jsx("option", { value: "buyer", children: "\uD83D\uDED2 Al\u0131c\u0131" }), _jsx("option", { value: "seller", children: "\uD83C\uDFEA Sat\u0131c\u0131" })] })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "listingNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan No" }), _jsx("input", { type: "text", id: "listingNumber", name: "listingNumber", value: formData.listingNumber, className: "w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "loadTitle", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "loadTitle", name: "loadTitle", value: formData.loadTitle, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara Tekstil Y\u00FCk\u00FC" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "loadType", className: "block text-sm font-medium text-gray-700 mb-2", children: "Y\u00FCk Tipi *" }), _jsxs("select", { id: "loadType", name: "loadType", value: formData.loadType, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsxs("optgroup", { label: "Genel Kargo / Paletli \u00DCr\u00FCnler", children: [_jsx("option", { value: "box_package", children: "\uD83D\uDCE6 Koli / Paket" }), _jsx("option", { value: "pallet_standard", children: "\uD83C\uDFD7\uFE0F Paletli Y\u00FCkler - Standart Palet" }), _jsx("option", { value: "pallet_euro", children: "\uD83C\uDDEA\uD83C\uDDFA Paletli Y\u00FCkler - Euro Palet" }), _jsx("option", { value: "pallet_industrial", children: "\uD83C\uDFED Paletli Y\u00FCkler - End\u00FCstriyel Palet" }), _jsx("option", { value: "sack_bigbag", children: "\uD83D\uDECD\uFE0F \u00C7uval / Bigbag (D\u00F6kme Olmayan)" }), _jsx("option", { value: "barrel_drum", children: "\uD83D\uDEE2\uFE0F Varil / F\u0131\u00E7\u0131" }), _jsx("option", { value: "appliances_electronics", children: "\uD83D\uDCF1 Beyaz E\u015Fya / Elektronik" }), _jsx("option", { value: "furniture_decor", children: "\uD83E\uDE91 Mobilya / Dekorasyon \u00DCr\u00FCnleri" }), _jsx("option", { value: "textile_products", children: "\uD83D\uDC55 Tekstil \u00DCr\u00FCnleri" }), _jsx("option", { value: "automotive_parts", children: "\uD83D\uDE97 Otomotiv Par\u00E7alar\u0131 / Yedek Par\u00E7a" }), _jsx("option", { value: "machinery_parts", children: "\u2699\uFE0F Makine / Ekipman Par\u00E7alar\u0131 (B\u00FCy\u00FCk Olmayan)" }), _jsx("option", { value: "construction_materials", children: "\uD83C\uDFD7\uFE0F \u0130n\u015Faat Malzemeleri (Torbal\u0131 \u00C7imento, Demir Ba\u011Flar vb.)" }), _jsx("option", { value: "packaged_food", children: "\uD83E\uDD6B Ambalajl\u0131 G\u0131da \u00DCr\u00FCnleri (Kuru G\u0131da, Konserve vb.)" }), _jsx("option", { value: "consumer_goods", children: "\uD83D\uDED2 T\u00FCketim \u00DCr\u00FCnleri (Market \u00DCr\u00FCnleri)" }), _jsx("option", { value: "ecommerce_cargo", children: "\uD83D\uDCF1 E-ticaret Kargo" }), _jsx("option", { value: "other_general", children: "\uD83D\uDCCB Di\u011Fer Genel Kargo" })] }), _jsxs("optgroup", { label: "D\u00F6kme Y\u00FCkler", children: [_jsx("option", { value: "grain", children: "\uD83C\uDF3E Tah\u0131l (Bu\u011Fday, M\u0131s\u0131r, Arpa, Pirin\u00E7 vb.)" }), _jsx("option", { value: "ore", children: "\u26CF\uFE0F Maden Cevheri (Demir, Bak\u0131r, Boksit vb.)" }), _jsx("option", { value: "coal", children: "\u26AB K\u00F6m\u00FCr" }), _jsx("option", { value: "cement_bulk", children: "\uD83C\uDFD7\uFE0F \u00C7imento (D\u00F6kme)" }), _jsx("option", { value: "sand_gravel", children: "\uD83C\uDFD6\uFE0F Kum / \u00C7ak\u0131l" }), _jsx("option", { value: "fertilizer_bulk", children: "\uD83C\uDF31 G\u00FCbre (D\u00F6kme)" }), _jsx("option", { value: "soil_excavation", children: "\uD83C\uDFD7\uFE0F Toprak / Hafriyat" }), _jsx("option", { value: "scrap_metal", children: "\u267B\uFE0F Hurda Metal" }), _jsx("option", { value: "other_bulk", children: "\uD83D\uDCCB Di\u011Fer D\u00F6kme Y\u00FCkler" })] }), _jsxs("optgroup", { label: "S\u0131v\u0131 Y\u00FCkler (D\u00F6kme S\u0131v\u0131)", children: [_jsx("option", { value: "crude_oil", children: "\uD83D\uDEE2\uFE0F Ham Petrol / Petrol \u00DCr\u00FCnleri" }), _jsx("option", { value: "chemical_liquids", children: "\uD83E\uDDEA Kimyasal S\u0131v\u0131lar (Asit, Baz, Solvent vb.)" }), _jsx("option", { value: "vegetable_oils", children: "\uD83C\uDF3B Bitkisel Ya\u011Flar (Ay\u00E7i\u00E7ek Ya\u011F\u0131, Zeytinya\u011F\u0131 vb.)" }), _jsx("option", { value: "fuel", children: "\u26FD Yak\u0131t (Dizel, Benzin vb.)" }), _jsx("option", { value: "lpg_lng", children: "\uD83D\uDD25 LPG / LNG (S\u0131v\u0131la\u015Ft\u0131r\u0131lm\u0131\u015F Gazlar)" }), _jsx("option", { value: "water", children: "\uD83D\uDCA7 Su (\u0130\u00E7me Suyu, End\u00FCstriyel Su)" }), _jsx("option", { value: "milk_dairy", children: "\uD83E\uDD5B S\u00FCt / S\u00FCt \u00DCr\u00FCnleri (D\u00F6kme)" }), _jsx("option", { value: "wine_concentrate", children: "\uD83C\uDF77 \u015Earap / \u0130\u00E7ecek Konsantresi" }), _jsx("option", { value: "other_liquid", children: "\uD83D\uDCA7 Di\u011Fer S\u0131v\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "A\u011F\u0131r Y\u00FCk / Gabari D\u0131\u015F\u0131 Y\u00FCk", children: [_jsx("option", { value: "tbm", children: "\uD83D\uDE87 T\u00FCnel A\u00E7ma Makinesi (TBM)" }), _jsx("option", { value: "transformer_generator", children: "\u26A1 Trafo / Jenerat\u00F6r" }), _jsx("option", { value: "heavy_machinery", children: "\uD83C\uDFD7\uFE0F B\u00FCy\u00FCk \u0130\u015F Makineleri (Ekskavat\u00F6r, Vin\u00E7 vb.)" }), _jsx("option", { value: "boat_yacht", children: "\u26F5 Tekne / Yat" }), _jsx("option", { value: "industrial_parts", children: "\uD83C\uDFED B\u00FCy\u00FCk End\u00FCstriyel Par\u00E7alar" }), _jsx("option", { value: "prefab_elements", children: "\uD83C\uDFD7\uFE0F Prefabrik Yap\u0131 Elemanlar\u0131" }), _jsx("option", { value: "wind_turbine", children: "\uD83D\uDCA8 R\u00FCzgar T\u00FCrbini Kanatlar\u0131 / Kuleleri" }), _jsx("option", { value: "other_oversized", children: "\uD83D\uDCCF Di\u011Fer Gabari D\u0131\u015F\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "Hassas / K\u0131r\u0131labilir Kargo", children: [_jsx("option", { value: "art_antiques", children: "\uD83C\uDFA8 Sanat Eserleri / Antikalar" }), _jsx("option", { value: "glass_ceramic", children: "\uD83C\uDFFA Cam / Seramik \u00DCr\u00FCnler" }), _jsx("option", { value: "electronic_devices", children: "\uD83D\uDCBB Elektronik Cihaz" }), _jsx("option", { value: "medical_devices", children: "\uD83C\uDFE5 T\u0131bbi Cihazlar" }), _jsx("option", { value: "lab_equipment", children: "\uD83D\uDD2C Laboratuvar Ekipmanlar\u0131" }), _jsx("option", { value: "flowers_plants", children: "\uD83C\uDF38 \u00C7i\u00E7ek / Canl\u0131 Bitki" }), _jsx("option", { value: "other_sensitive", children: "\uD83D\uDD12 Di\u011Fer Hassas Kargo" })] }), _jsxs("optgroup", { label: "Tehlikeli Madde (ADR / IMDG / IATA S\u0131n\u0131fland\u0131rmas\u0131)", children: [_jsx("option", { value: "dangerous_class1", children: "\uD83D\uDCA5 Patlay\u0131c\u0131lar (S\u0131n\u0131f 1)" }), _jsx("option", { value: "dangerous_class2", children: "\uD83D\uDCA8 Gazlar (S\u0131n\u0131f 2)" }), _jsx("option", { value: "dangerous_class3", children: "\uD83D\uDD25 Yan\u0131c\u0131 S\u0131v\u0131lar (S\u0131n\u0131f 3)" }), _jsx("option", { value: "dangerous_class4", children: "\uD83D\uDD25 Yan\u0131c\u0131 Kat\u0131lar (S\u0131n\u0131f 4)" }), _jsx("option", { value: "dangerous_class5", children: "\u2697\uFE0F Oksitleyici Maddeler (S\u0131n\u0131f 5)" }), _jsx("option", { value: "dangerous_class6", children: "\u2620\uFE0F Zehirli ve Bula\u015F\u0131c\u0131 Maddeler (S\u0131n\u0131f 6)" }), _jsx("option", { value: "dangerous_class7", children: "\u2622\uFE0F Radyoaktif Maddeler (S\u0131n\u0131f 7)" }), _jsx("option", { value: "dangerous_class8", children: "\uD83E\uDDEA A\u015F\u0131nd\u0131r\u0131c\u0131 Maddeler (S\u0131n\u0131f 8)" }), _jsx("option", { value: "dangerous_class9", children: "\u26A0\uFE0F Di\u011Fer Tehlikeli Maddeler (S\u0131n\u0131f 9)" })] }), _jsxs("optgroup", { label: "So\u011Fuk Zincir / Is\u0131 Kontroll\u00FC Y\u00FCk", children: [_jsx("option", { value: "frozen_food", children: "\uD83E\uDDCA Donmu\u015F G\u0131da" }), _jsx("option", { value: "fresh_produce", children: "\uD83E\uDD6C Taze Meyve / Sebze" }), _jsx("option", { value: "meat_dairy", children: "\uD83E\uDD69 Et / S\u00FCt \u00DCr\u00FCnleri" }), _jsx("option", { value: "pharma_vaccine", children: "\uD83D\uDC8A \u0130la\u00E7 / A\u015F\u0131" }), _jsx("option", { value: "chemical_temp", children: "\uD83C\uDF21\uFE0F Kimyasal Maddeler (Is\u0131 Kontroll\u00FC)" }), _jsx("option", { value: "other_cold_chain", children: "\u2744\uFE0F Di\u011Fer So\u011Fuk Zincir Kargo" })] }), _jsxs("optgroup", { label: "Canl\u0131 Hayvan", children: [_jsx("option", { value: "small_livestock", children: "\uD83D\uDC11 K\u00FC\u00E7\u00FCk Ba\u015F Hayvan (Koyun, Ke\u00E7i vb.)" }), _jsx("option", { value: "large_livestock", children: "\uD83D\uDC04 B\u00FCy\u00FCk Ba\u015F Hayvan (S\u0131\u011F\u0131r, At vb.)" }), _jsx("option", { value: "poultry", children: "\uD83D\uDC14 Kanatl\u0131 Hayvan" }), _jsx("option", { value: "pets", children: "\uD83D\uDC15 Evcil Hayvan" }), _jsx("option", { value: "other_livestock", children: "\uD83D\uDC3E Di\u011Fer Canl\u0131 Hayvanlar" })] }), _jsxs("optgroup", { label: "Proje Y\u00FCkleri", children: [_jsx("option", { value: "factory_setup", children: "\uD83C\uDFED Fabrika Kurulumu" }), _jsx("option", { value: "power_plant", children: "\u26A1 Enerji Santrali Ekipmanlar\u0131" }), _jsx("option", { value: "infrastructure", children: "\uD83C\uDFD7\uFE0F Altyap\u0131 Proje Malzemeleri" }), _jsx("option", { value: "other_project", children: "\uD83D\uDCCB Di\u011Fer Proje Y\u00FCkleri" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loadOrigin", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Kalk\u0131\u015F Noktas\u0131 (Opsiyonel)"] }), _jsx("input", { type: "text", id: "loadOrigin", name: "loadOrigin", value: formData.loadOrigin, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: \u0130stanbul, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loadDestination", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "inline w-4 h-4 mr-1" }), "Var\u0131\u015F Noktas\u0131 (Opsiyonel)"] }), _jsx("input", { type: "text", id: "loadDestination", name: "loadDestination", value: formData.loadDestination, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: Ankara, T\u00FCrkiye" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loadingDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Y\u00FCkleme Tarihi *"] }), _jsx("input", { type: "date", id: "loadingDate", name: "loadingDate", value: formData.loadingDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "deliveryDate", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "inline w-4 h-4 mr-1" }), "Teslimat Tarihi *"] }), _jsx("input", { type: "date", id: "deliveryDate", name: "deliveryDate", value: formData.deliveryDate, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loadWeight", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "A\u011F\u0131rl\u0131k (ton) *"] }), _jsx("input", { type: "number", id: "loadWeight", name: "loadWeight", value: formData.loadWeight, onChange: handleInputChange, min: "0.1", max: "999999", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 10.5" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "loadVolume", className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Package, { className: "inline w-4 h-4 mr-1" }), "Hacim (m\u00B3) *"] }), _jsx("input", { type: "number", id: "loadVolume", name: "loadVolume", value: formData.loadVolume, onChange: handleInputChange, min: "0.1", max: "999999", step: "0.1", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "\u00D6rn: 25.0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Teklif Alma \u015Eekli" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypeDirect", name: "offerType", value: "direct", checked: offerType === 'direct', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" }), _jsx("label", { htmlFor: "offerTypeDirect", className: "ml-2 text-sm text-gray-700", children: "Do\u011Frudan Teklif" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypePrice", name: "offerType", value: "price", checked: offerType === 'price', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" }), _jsx("label", { htmlFor: "offerTypePrice", className: "ml-2 text-sm text-gray-700", children: "Fiyat Belirleyerek" })] })] })] }), offerType === 'price' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "setPrice", className: "block text-sm font-medium text-gray-700 mb-2", children: "Belirlenen Fiyat (TL) *" }), _jsx("input", { type: "number", id: "setPrice", name: "setPrice", value: formData.setPrice, onChange: handleInputChange, min: "1", max: "999999999", className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", placeholder: "\u00D6rn: 5000" })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "loadRoleSelection", className: "block text-sm font-medium text-gray-700 mb-2", children: "Nakliye Kime Ait *" }), _jsxs("select", { id: "loadRoleSelection", name: "loadRoleSelection", value: formData.loadRoleSelection, onChange: handleInputChange, className: "w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "buyer", children: "\uD83D\uDED2 Al\u0131c\u0131" }), _jsx("option", { value: "seller", children: "\uD83C\uDFEA Sat\u0131c\u0131" }), _jsx("option", { value: "carrier", children: "\uD83D\uDE9B Nakliyeci" }), _jsx("option", { value: "negotiable", children: "\uD83E\uDD1D Pazarl\u0131k Edilebilir" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "loadDescription", className: "block text-sm font-medium text-gray-700 mb-2", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "loadDescription", name: "loadDescription", value: formData.loadDescription, onChange: handleInputChange, rows: 4, className: "w-full px-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm", required: true, placeholder: "Y\u00FCk\u00FCn\u00FCz hakk\u0131nda detayl\u0131 bilgi verin..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Y\u00FCk G\u00F6rselleri (Opsiyonel)" }), _jsx("div", { className: "grid grid-cols-3 gap-4", children: [0, 1, 2].map((index) => (_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl aspect-square bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group", children: [_jsx("input", { type: "file", accept: "image/png, image/jpeg", className: "absolute inset-0 opacity-0 cursor-pointer z-10", title: "Y\u00FCk g\u00F6rseli y\u00FCkle", "aria-label": `Yük görseli ${index + 1} yükle`, onChange: e => {
                                                        const file = e.target.files?.[0];
                                                        if (!file)
                                                            return;
                                                        if (!['image/png', 'image/jpeg'].includes(file.type)) {
                                                            toast.error('Sadece PNG veya JPG dosyası yükleyebilirsiniz.');
                                                            return;
                                                        }
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.error('Dosya boyutu 5MB geçemez.');
                                                            return;
                                                        }
                                                        // Dosyayı uploadedImages state'ine ekle
                                                        const reader = new FileReader();
                                                        reader.onload = ev => {
                                                            const preview = ev.target?.result;
                                                            setLoadImages(imgs => {
                                                                const newImgs = [...imgs];
                                                                newImgs[index] = preview;
                                                                return newImgs;
                                                            });
                                                            // Dosyayı uploadedImages state'ine de ekle
                                                            setUploadedImages(prev => {
                                                                const filtered = prev.filter(img => img.index !== index);
                                                                return [...filtered, { index, file, preview }];
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } }), loadImages[index] ? (_jsx("img", { src: loadImages[index], alt: `Yük görseli ${index + 1}`, className: "object-cover w-full h-full" })) : (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [_jsx(Upload, { className: "w-8 h-8 text-gray-400 mb-2" }), _jsxs("p", { className: "text-xs text-gray-500 text-center px-2", children: ["PNG, JPG", _jsx("br", {}), "max. 5MB"] })] })), loadImages[index] && (_jsx("button", { type: "button", className: "absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-600 hover:text-red-600 z-20", onClick: () => {
                                                        setLoadImages(imgs => {
                                                            const newImgs = [...imgs];
                                                            newImgs[index] = null;
                                                            return newImgs;
                                                        });
                                                        setUploadedImages(prev => prev.filter(img => img.index !== index));
                                                    }, title: "G\u00F6rseli Kald\u0131r", children: _jsx(Trash2, { size: 18 }) }))] }, index))) })] }), _jsx("div", { className: "border-t border-gray-200 pt-6", children: _jsxs("fieldset", { children: [_jsx("legend", { className: "text-lg font-medium text-gray-900 mb-4", children: "\uD83D\uDCE6 Y\u00FCk \u0130lan\u0131 Evrak Listesi (Opsiyonel/\u0130ste\u011Fe Ba\u011Fl\u0131 Y\u00FCklenebilir)" }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [_jsx("button", { type: "button", onClick: () => setRequiredDocuments(Object.keys(documentLabels)), className: "px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors", children: "\u2713 T\u00FCm\u00FCn\u00FC Se\u00E7" }), _jsx("button", { type: "button", onClick: () => setRequiredDocuments([]), className: "px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors", children: "\u2715 T\u00FCm\u00FCn\u00FC Temizle" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "invoice", name: "documents", value: "invoice", checked: requiredDocuments.includes('invoice'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "invoice", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCC4 Fatura / Proforma Fatura" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "salesContract", name: "documents", value: "salesContract", checked: requiredDocuments.includes('salesContract'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "salesContract", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCDD Sat\u0131\u015F S\u00F6zle\u015Fmesi" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "waybill", name: "documents", value: "waybill", checked: requiredDocuments.includes('waybill'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "waybill", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCCB \u0130rsaliye / Sevk Fi\u015Fi" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "originCertificate", name: "documents", value: "originCertificate", checked: requiredDocuments.includes('originCertificate'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "originCertificate", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83C\uDF0D Men\u015Fe \u015Eahadetnamesi (Certificate of Origin)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "analysis", name: "documents", value: "analysis", checked: requiredDocuments.includes('analysis'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "analysis", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDD2C Analiz Sertifikas\u0131 / Laboratuvar Raporlar\u0131 (Quality/Quantity)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "complianceCertificates", name: "documents", value: "complianceCertificates", checked: requiredDocuments.includes('complianceCertificates'), className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "complianceCertificates", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCD1 TSE, CE, ISO, vb. Uygunluk Sertifikalar\u0131" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "productPhotos", name: "documents", value: "productPhotos", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "productPhotos", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDDBC\uFE0F \u00DCr\u00FCn Foto\u011Fraflar\u0131" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "packingList", name: "documents", value: "packingList", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "packingList", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCE6 Ambalaj / Packing List" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "warehouseReceipt", name: "documents", value: "warehouseReceipt", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "warehouseReceipt", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83C\uDFEA Depo Teslim Fi\u015Fi / Stok Belgesi" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "producerReceipt", name: "documents", value: "producerReceipt", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "producerReceipt", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83C\uDF3E M\u00FCstahsil Makbuzu (Tar\u0131m \u00FCr\u00FCnleri)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "customsDeclaration", name: "documents", value: "customsDeclaration", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "customsDeclaration", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDEC3 G\u00FCmr\u00FCk Beyannamesi (\u0130hracat/\u0130thalat)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "msds", name: "documents", value: "msds", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "msds", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83E\uDDEA MSDS (Malzeme G\u00FCvenlik Bilgi Formu)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "fumigationCertificate", name: "documents", value: "fumigationCertificate", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "fumigationCertificate", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83C\uDF2B\uFE0F Fumigasyon Sertifikas\u0131 (gerekiyorsa)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "inspectionReports", name: "documents", value: "inspectionReports", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "inspectionReports", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDD0E SGS / Intertek / Third Party Inspection Raporlar\u0131" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "paymentDocuments", name: "documents", value: "paymentDocuments", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "paymentDocuments", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCB3 \u00D6deme Belgeleri (Banka Dekontu, Akreditif, Teminat Mektubu)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "healthCertificates", name: "documents", value: "healthCertificates", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "healthCertificates", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83E\uDE7A Sa\u011Fl\u0131k/Veteriner/Fitosaniter Sertifika" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "specialCertificates", name: "documents", value: "specialCertificates", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "specialCertificates", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDD4B Helal/Kosher/ECO/\u00D6zel \u00DClke Sertifikalar\u0131" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "importExportLicense", name: "documents", value: "importExportLicense", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "importExportLicense", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCDC \u0130thalat/\u0130hracat Lisans\u0131 / Kota Belgesi" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "antidampingCertificates", name: "documents", value: "antidampingCertificates", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "antidampingCertificates", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83C\uDF31 Anti-damping/Orijinallik/\u00C7evre/Emisyon Belgeleri" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "productManuals", name: "documents", value: "productManuals", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "productManuals", className: "ml-3 text-sm font-medium text-gray-700", children: "\uD83D\uDCD8 \u00DCr\u00FCn Teknik Bilgi Formlar\u0131 / Kullan\u0131m K\u0131lavuzu" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "other", name: "documents", value: "other", className: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: "other", className: "ml-3 text-sm font-medium text-gray-700", children: "\u2795 Di\u011Fer (Belirtiniz): __________" })] })] })] }) }), requiredDocuments.length > 0 && (_jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(Package, { className: "mr-2 text-primary-600", size: 20 }), "Se\u00E7ilen Evraklar (", requiredDocuments.length, ")"] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: requiredDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100", children: [_jsx("span", { className: "text-sm text-gray-700", children: documentLabels[doc] || doc }), _jsx("button", { type: "button", onClick: () => setRequiredDocuments(prev => prev.filter(d => d !== doc)), className: "text-red-500 hover:text-red-700 text-xs", title: "Kald\u0131r", children: "\u2715" })] }, index))) }), _jsx("div", { className: "mt-3 text-xs text-blue-600", children: "\uD83D\uDCA1 \u0130pucu: Se\u00E7ilen evraklar ilan\u0131n\u0131zla birlikte g\u00F6r\u00FCnt\u00FClenecektir. \u0130stemedi\u011Finiz evraklar\u0131 \u2715 ile kald\u0131rabilirsiniz." })] })] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(FileText, { className: "mr-2 text-primary-600", size: 20 }), "Evrak Y\u00FCkleme Alan\u0131"] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary-400 transition-colors", children: [_jsx("input", { type: "file", id: "documentUpload", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", onChange: handleFileUpload, className: "hidden", "aria-label": "Evrak y\u00FCkle" }), _jsxs("label", { htmlFor: "documentUpload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" }), _jsx("p", { className: "text-sm text-gray-500", children: "Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Maksimum dosya boyutu: 10MB" })] })] }) }), uploadedDocuments.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Y\u00FCklenen Evraklar (", uploadedDocuments.length, ")"] }), _jsx("div", { className: "space-y-3", children: uploadedDocuments.map((document) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("span", { className: "text-2xl mr-3", children: getFileIcon(document.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: document.name }), _jsx("p", { className: "text-sm text-gray-500", children: document.size })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDocumentPreview(document), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors", title: "\u00D6nizleme", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDownload(document), className: "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors", title: "\u0130ndir", children: _jsx(Download, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => handleDocumentDelete(document.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors", title: "Sil", children: _jsx(Trash2, { size: 18 }) })] })] }, document.id))) })] }))] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-6 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: () => setActiveSection('my-listings'), className: "px-8 py-4 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors shadow-sm", children: "\u0130ptal" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "px-8 py-4 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? 'İlan Oluşturuluyor...' : 'İlanı Oluştur' })] })] })] })] }));
};
export default CreateLoadListingSection;
