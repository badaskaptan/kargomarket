import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Package, AlertCircle, Loader2, FileText, Upload, Trash2 } from 'lucide-react';
import { ListingService } from '../../services/listingService';
import { UploadService } from '../../services/uploadService';
const EditModalLoadListing = ({ listing, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        listing_number: '',
        title: '',
        description: '',
        origin: '',
        destination: '',
        load_type: '',
        weight_value: '',
        weight_unit: 'ton',
        volume_value: '',
        volume_unit: 'm³',
        quantity: '',
        loading_date: '',
        delivery_date: '',
        price_amount: '',
        price_currency: 'TRY',
        special_requirements: '',
        transport_responsibility: ''
    });
    const [offerType, setOfferType] = useState('direct');
    const [requiredDocuments, setRequiredDocuments] = useState([]);
    const [loadImages, setLoadImages] = useState([null, null, null]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [imageUploading, setImageUploading] = useState([false, false, false]);
    const [documentUploading, setDocumentUploading] = useState(false);
    useEffect(() => {
        if (listing) {
            setFormData({
                listing_number: listing.listing_number || '',
                title: listing.title || '',
                description: listing.description || '',
                origin: listing.origin || '',
                destination: listing.destination || '',
                load_type: listing.load_type || '',
                weight_value: listing.weight_value?.toString() || '',
                weight_unit: listing.weight_unit || 'ton',
                volume_value: listing.volume_value?.toString() || '',
                volume_unit: listing.volume_unit || 'm³',
                quantity: listing.quantity?.toString() || '',
                loading_date: listing.loading_date || '',
                delivery_date: listing.delivery_date || '',
                price_amount: listing.price_amount?.toString() || '',
                price_currency: listing.price_currency || 'TRY',
                special_requirements: listing.special_handling_requirements?.[0] || '',
                transport_responsibility: listing.transport_responsible || ''
            });
            // Set offer type based on database value
            if (listing.offer_type === 'fixed_price') {
                setOfferType('price');
            }
            else {
                setOfferType('direct');
            }
            // Set required documents
            setRequiredDocuments(listing.required_documents || []);
            // Set existing images
            if (listing.image_urls && listing.image_urls.length > 0) {
                const imageArray = [null, null, null];
                listing.image_urls.slice(0, 3).forEach((url, index) => {
                    imageArray[index] = url;
                });
                setLoadImages(imageArray);
                setUploadedImageUrls(listing.image_urls.slice(0, 3));
            }
            // Set existing documents (if any)
            if (listing.document_urls && listing.document_urls.length > 0) {
                const existingDocs = listing.document_urls.map((url, index) => ({
                    name: `Evrak ${index + 1}`,
                    url: url,
                    type: 'application/pdf', // Default type
                    size: 'Bilinmiyor'
                }));
                setUploadedDocuments(existingDocs);
            }
        }
    }, [listing]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                origin: formData.origin,
                destination: formData.destination,
                load_type: formData.load_type,
                weight_value: formData.weight_value ? parseFloat(formData.weight_value) : null,
                weight_unit: formData.weight_unit,
                volume_value: formData.volume_value ? parseFloat(formData.volume_value) : null,
                volume_unit: formData.volume_unit,
                quantity: formData.quantity ? parseInt(formData.quantity) : null,
                loading_date: formData.loading_date,
                delivery_date: formData.delivery_date,
                price_amount: formData.price_amount ? parseFloat(formData.price_amount) : null,
                price_currency: formData.price_currency,
                special_handling_requirements: formData.special_requirements ? [formData.special_requirements] : null,
                transport_responsible: formData.transport_responsibility,
                offer_type: (offerType === 'price' ? 'fixed_price' : 'negotiable'),
                required_documents: requiredDocuments.length > 0 ? requiredDocuments : null,
                image_urls: uploadedImageUrls.filter(url => url), // Sadece dolu URL'leri ekle
                document_urls: uploadedDocuments.map(doc => doc.url), // Yüklenen evrak URL'leri
                updated_at: new Date().toISOString()
            };
            console.log('Updating listing with data:', updateData);
            const updatedListing = await ListingService.updateListing(listing.id, updateData);
            setSuccess(true);
            onSave(updatedListing);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        }
        catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Güncelleme sırasında hata oluştu');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
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
    // Görsel yükleme fonksiyonu
    const handleImageUpload = async (file, index) => {
        try {
            // Dosya validasyonu
            const validation = UploadService.validateFile(file, true);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }
            setImageUploading(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
            });
            // Önce preview'u göster
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = ev.target?.result;
                setLoadImages(imgs => {
                    const newImgs = [...imgs];
                    newImgs[index] = preview;
                    return newImgs;
                });
            };
            reader.readAsDataURL(file);
            // Supabase'e yükle
            const result = await UploadService.uploadImage(file, listing.id, index);
            // Yüklenen URL'i kaydet
            setUploadedImageUrls(prev => {
                const newUrls = [...prev];
                newUrls[index] = result.url;
                return newUrls;
            });
            console.log('✅ Image uploaded successfully:', result);
        }
        catch (error) {
            console.error('❌ Image upload failed:', error);
            alert('Görsel yüklenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
            // Hata durumunda preview'u temizle
            setLoadImages(imgs => {
                const newImgs = [...imgs];
                newImgs[index] = null;
                return newImgs;
            });
        }
        finally {
            setImageUploading(prev => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
            });
        }
    };
    // Evrak yükleme fonksiyonu
    const handleDocumentUpload = async (files) => {
        if (!files || files.length === 0)
            return;
        setDocumentUploading(true);
        const successfulUploads = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Dosya validasyonu
                const validation = UploadService.validateFile(file, false);
                if (!validation.valid) {
                    alert(`${file.name}: ${validation.error}`);
                    continue;
                }
                try {
                    const result = await UploadService.uploadDocument(file, listing.id, 'general');
                    successfulUploads.push({
                        name: file.name,
                        url: result.url,
                        type: file.type,
                        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    });
                }
                catch (error) {
                    console.error(`Failed to upload ${file.name}:`, error);
                    alert(`${file.name} yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                }
            }
            if (successfulUploads.length > 0) {
                setUploadedDocuments(prev => [...prev, ...successfulUploads]);
                console.log('✅ Documents uploaded successfully:', successfulUploads);
            }
        }
        finally {
            setDocumentUploading(false);
        }
    };
    // Evrak silme fonksiyonu
    const handleDocumentRemove = (index) => {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
    };
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
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 rounded-t-2xl relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10" }) }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white/20 p-3 rounded-xl backdrop-blur-sm", children: _jsx(Package, { className: "h-7 w-7 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Y\u00FCk \u0130lan\u0131n\u0131 D\u00FCzenle" }), _jsx("p", { className: "text-white/80 text-sm mt-1", children: "\u0130lan bilgilerini g\u00FCncelleyin" })] })] }), _jsx("button", { onClick: onClose, className: "text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm", title: "Kapat", "aria-label": "D\u00FCzenleme modal\u0131n\u0131 kapat", children: _jsx(X, { className: "h-6 w-6" }) })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white", children: [error && (_jsxs("div", { className: "bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx(AlertCircle, { className: "h-6 w-6 text-red-600 flex-shrink-0" }), _jsx("span", { className: "text-red-800 font-medium", children: error })] })), success && (_jsxs("div", { className: "bg-green-50 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow-sm", children: [_jsx("div", { className: "h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-sm", children: "\u2713" }) }), _jsx("span", { className: "text-green-800 font-medium", children: "\u0130lan ba\u015Far\u0131yla g\u00FCncellendi!" })] })), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-blue-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-5 w-5 text-blue-600" }) }), "Temel Bilgiler"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "listing_number", className: "block text-sm font-semibold text-gray-700 mb-3", children: "\u0130lan No" }), _jsx("input", { type: "text", id: "listing_number", name: "listing_number", value: formData.listing_number, className: "w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed shadow-sm", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-semibold text-gray-700 mb-3", children: "\u0130lan Ba\u015Fl\u0131\u011F\u0131 *" }), _jsx("input", { type: "text", id: "title", name: "title", value: formData.title, onChange: handleChange, required: true, placeholder: "\u00D6rn: \u0130stanbul-Ankara Tekstil Y\u00FCk\u00FC", title: "\u0130lan ba\u015Fl\u0131\u011F\u0131", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-purple-100 p-2 rounded-lg mr-3", children: _jsx(MapPin, { className: "h-5 w-5 text-purple-600" }) }), "Rota ve Y\u00FCk Bilgileri"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "origin", className: "block text-sm font-semibold text-gray-700 mb-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full mr-2" }), "Kalk\u0131\u015F Noktas\u0131"] }) }), _jsx("input", { type: "text", id: "origin", name: "origin", value: formData.origin, onChange: handleChange, placeholder: "\u00D6rn: \u0130stanbul, T\u00FCrkiye", title: "Kalk\u0131\u015F noktas\u0131", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "destination", className: "block text-sm font-semibold text-gray-700 mb-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full mr-2" }), "Var\u0131\u015F Noktas\u0131"] }) }), _jsx("input", { type: "text", id: "destination", name: "destination", value: formData.destination, onChange: handleChange, placeholder: "\u00D6rn: Ankara, T\u00FCrkiye", title: "Var\u0131\u015F noktas\u0131", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "load_type", className: "block text-sm font-semibold text-gray-700 mb-3", children: [_jsx(Package, { className: "inline h-4 w-4 mr-2" }), "Y\u00FCk Tipi *"] }), _jsxs("select", { id: "load_type", name: "load_type", value: formData.load_type, onChange: handleChange, required: true, title: "Y\u00FCk tipi se\u00E7imi", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white", children: [_jsx("option", { value: "", children: "Y\u00FCk tipini se\u00E7iniz" }), _jsxs("optgroup", { label: "Genel Kargo / Paletli \u00DCr\u00FCnler", children: [_jsx("option", { value: "box_package", children: "\uD83D\uDCE6 Koli / Paket" }), _jsx("option", { value: "pallet_standard", children: "\uD83C\uDFD7\uFE0F Paletli Y\u00FCkler - Standart Palet" }), _jsx("option", { value: "pallet_euro", children: "\uD83C\uDDEA\uD83C\uDDFA Paletli Y\u00FCkler - Euro Palet" }), _jsx("option", { value: "pallet_industrial", children: "\uD83C\uDFED Paletli Y\u00FCkler - End\u00FCstriyel Palet" }), _jsx("option", { value: "sack_bigbag", children: "\uD83D\uDECD\uFE0F \u00C7uval / Bigbag (D\u00F6kme Olmayan)" }), _jsx("option", { value: "barrel_drum", children: "\uD83D\uDEE2\uFE0F Varil / F\u0131\u00E7\u0131" }), _jsx("option", { value: "appliances_electronics", children: "\uD83D\uDCF1 Beyaz E\u015Fya / Elektronik" }), _jsx("option", { value: "furniture_decor", children: "\uD83E\uDE91 Mobilya / Dekorasyon \u00DCr\u00FCnleri" }), _jsx("option", { value: "textile_products", children: "\uD83D\uDC55 Tekstil \u00DCr\u00FCnleri" }), _jsx("option", { value: "automotive_parts", children: "\uD83D\uDE97 Otomotiv Par\u00E7alar\u0131 / Yedek Par\u00E7a" }), _jsx("option", { value: "machinery_parts", children: "\u2699\uFE0F Makine / Ekipman Par\u00E7alar\u0131 (B\u00FCy\u00FCk Olmayan)" }), _jsx("option", { value: "construction_materials", children: "\uD83C\uDFD7\uFE0F \u0130n\u015Faat Malzemeleri (Torbal\u0131 \u00C7imento, Demir Ba\u011Flar vb.)" }), _jsx("option", { value: "packaged_food", children: "\uD83E\uDD6B Ambalajl\u0131 G\u0131da \u00DCr\u00FCnleri (Kuru G\u0131da, Konserve vb.)" }), _jsx("option", { value: "consumer_goods", children: "\uD83D\uDED2 T\u00FCketim \u00DCr\u00FCnleri (Market \u00DCr\u00FCnleri)" }), _jsx("option", { value: "ecommerce_cargo", children: "\uD83D\uDCF1 E-ticaret Kargo" }), _jsx("option", { value: "other_general", children: "\uD83D\uDCCB Di\u011Fer Genel Kargo" })] }), _jsxs("optgroup", { label: "D\u00F6kme Y\u00FCkler", children: [_jsx("option", { value: "grain", children: "\uD83C\uDF3E Tah\u0131l (Bu\u011Fday, M\u0131s\u0131r, Arpa, Pirin\u00E7 vb.)" }), _jsx("option", { value: "ore", children: "\u26CF\uFE0F Maden Cevheri (Demir, Bak\u0131r, Boksit vb.)" }), _jsx("option", { value: "coal", children: "\u26AB K\u00F6m\u00FCr" }), _jsx("option", { value: "cement_bulk", children: "\uD83C\uDFD7\uFE0F \u00C7imento (D\u00F6kme)" }), _jsx("option", { value: "sand_gravel", children: "\uD83C\uDFD6\uFE0F Kum / \u00C7ak\u0131l" }), _jsx("option", { value: "fertilizer_bulk", children: "\uD83C\uDF31 G\u00FCbre (D\u00F6kme)" }), _jsx("option", { value: "soil_excavation", children: "\uD83C\uDFD7\uFE0F Toprak / Hafriyat" }), _jsx("option", { value: "scrap_metal", children: "\u267B\uFE0F Hurda Metal" }), _jsx("option", { value: "other_bulk", children: "\uD83D\uDCCB Di\u011Fer D\u00F6kme Y\u00FCkler" })] }), _jsxs("optgroup", { label: "S\u0131v\u0131 Y\u00FCkler (D\u00F6kme S\u0131v\u0131)", children: [_jsx("option", { value: "crude_oil", children: "\uD83D\uDEE2\uFE0F Ham Petrol / Petrol \u00DCr\u00FCnleri" }), _jsx("option", { value: "chemical_liquids", children: "\uD83E\uDDEA Kimyasal S\u0131v\u0131lar (Asit, Baz, Solvent vb.)" }), _jsx("option", { value: "vegetable_oils", children: "\uD83C\uDF3B Bitkisel Ya\u011Flar (Ay\u00E7i\u00E7ek Ya\u011F\u0131, Zeytinya\u011F\u0131 vb.)" }), _jsx("option", { value: "fuel", children: "\u26FD Yak\u0131t (Dizel, Benzin vb.)" }), _jsx("option", { value: "lpg_lng", children: "\uD83D\uDD25 LPG / LNG (S\u0131v\u0131la\u015Ft\u0131r\u0131lm\u0131\u015F Gazlar)" }), _jsx("option", { value: "water", children: "\uD83D\uDCA7 Su (\u0130\u00E7me Suyu, End\u00FCstriyel Su)" }), _jsx("option", { value: "milk_dairy", children: "\uD83E\uDD5B S\u00FCt / S\u00FCt \u00DCr\u00FCnleri (D\u00F6kme)" }), _jsx("option", { value: "wine_concentrate", children: "\uD83C\uDF77 \u015Earap / \u0130\u00E7ecek Konsantresi" }), _jsx("option", { value: "other_liquid", children: "\uD83D\uDCA7 Di\u011Fer S\u0131v\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "A\u011F\u0131r Y\u00FCk / Gabari D\u0131\u015F\u0131 Y\u00FCk", children: [_jsx("option", { value: "tbm", children: "\uD83D\uDE87 T\u00FCnel A\u00E7ma Makinesi (TBM)" }), _jsx("option", { value: "transformer_generator", children: "\u26A1 Trafo / Jenerat\u00F6r" }), _jsx("option", { value: "heavy_machinery", children: "\uD83C\uDFD7\uFE0F B\u00FCy\u00FCk \u0130\u015F Makineleri (Ekskavat\u00F6r, Vin\u00E7 vb.)" }), _jsx("option", { value: "boat_yacht", children: "\u26F5 Tekne / Yat" }), _jsx("option", { value: "industrial_parts", children: "\uD83C\uDFED B\u00FCy\u00FCk End\u00FCstriyel Par\u00E7alar" }), _jsx("option", { value: "prefab_elements", children: "\uD83C\uDFD7\uFE0F Prefabrik Yap\u0131 Elemanlar\u0131" }), _jsx("option", { value: "wind_turbine", children: "\uD83D\uDCA8 R\u00FCzgar T\u00FCrbini Kanatlar\u0131 / Kuleleri" }), _jsx("option", { value: "other_oversized", children: "\uD83D\uDCCF Di\u011Fer Gabari D\u0131\u015F\u0131 Y\u00FCkler" })] }), _jsxs("optgroup", { label: "Hassas / K\u0131r\u0131labilir Kargo", children: [_jsx("option", { value: "art_antiques", children: "\uD83C\uDFA8 Sanat Eserleri / Antikalar" }), _jsx("option", { value: "glass_ceramic", children: "\uD83C\uDFFA Cam / Seramik \u00DCr\u00FCnler" }), _jsx("option", { value: "electronic_devices", children: "\uD83D\uDCBB Elektronik Cihaz" }), _jsx("option", { value: "medical_devices", children: "\uD83C\uDFE5 T\u0131bbi Cihazlar" }), _jsx("option", { value: "lab_equipment", children: "\uD83D\uDD2C Laboratuvar Ekipmanlar\u0131" }), _jsx("option", { value: "flowers_plants", children: "\uD83C\uDF38 \u00C7i\u00E7ek / Canl\u0131 Bitki" }), _jsx("option", { value: "other_sensitive", children: "\uD83D\uDD12 Di\u011Fer Hassas Kargo" })] }), _jsxs("optgroup", { label: "Tehlikeli Madde (ADR / IMDG / IATA S\u0131n\u0131fland\u0131rmas\u0131)", children: [_jsx("option", { value: "dangerous_class1", children: "\uD83D\uDCA5 Patlay\u0131c\u0131lar (S\u0131n\u0131f 1)" }), _jsx("option", { value: "dangerous_class2", children: "\uD83D\uDCA8 Gazlar (S\u0131n\u0131f 2)" }), _jsx("option", { value: "dangerous_class3", children: "\uD83D\uDD25 Yan\u0131c\u0131 S\u0131v\u0131lar (S\u0131n\u0131f 3)" }), _jsx("option", { value: "dangerous_class4", children: "\uD83D\uDD25 Yan\u0131c\u0131 Kat\u0131lar (S\u0131n\u0131f 4)" }), _jsx("option", { value: "dangerous_class5", children: "\u2697\uFE0F Oksitleyici Maddeler (S\u0131n\u0131f 5)" }), _jsx("option", { value: "dangerous_class6", children: "\u2620\uFE0F Zehirli ve Bula\u015F\u0131c\u0131 Maddeler (S\u0131n\u0131f 6)" }), _jsx("option", { value: "dangerous_class7", children: "\u2622\uFE0F Radyoaktif Maddeler (S\u0131n\u0131f 7)" }), _jsx("option", { value: "dangerous_class8", children: "\uD83E\uDDEA A\u015F\u0131nd\u0131r\u0131c\u0131 Maddeler (S\u0131n\u0131f 8)" }), _jsx("option", { value: "dangerous_class9", children: "\u26A0\uFE0F Di\u011Fer Tehlikeli Maddeler (S\u0131n\u0131f 9)" })] }), _jsxs("optgroup", { label: "So\u011Fuk Zincir / Is\u0131 Kontroll\u00FC Y\u00FCk", children: [_jsx("option", { value: "frozen_food", children: "\uD83E\uDDCA Donmu\u015F G\u0131da" }), _jsx("option", { value: "fresh_produce", children: "\uD83E\uDD6C Taze Meyve / Sebze" }), _jsx("option", { value: "meat_dairy", children: "\uD83E\uDD69 Et / S\u00FCt \u00DCr\u00FCnleri" }), _jsx("option", { value: "pharma_vaccine", children: "\uD83D\uDC8A \u0130la\u00E7 / A\u015F\u0131" }), _jsx("option", { value: "chemical_temp", children: "\uD83C\uDF21\uFE0F Kimyasal Maddeler (Is\u0131 Kontroll\u00FC)" }), _jsx("option", { value: "other_cold_chain", children: "\u2744\uFE0F Di\u011Fer So\u011Fuk Zincir Kargo" })] }), _jsxs("optgroup", { label: "Canl\u0131 Hayvan", children: [_jsx("option", { value: "small_livestock", children: "\uD83D\uDC11 K\u00FC\u00E7\u00FCk Ba\u015F Hayvan (Koyun, Ke\u00E7i vb.)" }), _jsx("option", { value: "large_livestock", children: "\uD83D\uDC04 B\u00FCy\u00FCk Ba\u015F Hayvan (S\u0131\u011F\u0131r, At vb.)" }), _jsx("option", { value: "poultry", children: "\uD83D\uDC14 Kanatl\u0131 Hayvan" }), _jsx("option", { value: "pets", children: "\uD83D\uDC15 Evcil Hayvan" }), _jsx("option", { value: "other_livestock", children: "\uD83D\uDC3E Di\u011Fer Canl\u0131 Hayvanlar" })] }), _jsxs("optgroup", { label: "Proje Y\u00FCkleri", children: [_jsx("option", { value: "factory_setup", children: "\uD83C\uDFED Fabrika Kurulumu" }), _jsx("option", { value: "power_plant", children: "\u26A1 Enerji Santrali Ekipmanlar\u0131" }), _jsx("option", { value: "infrastructure", children: "\uD83C\uDFD7\uFE0F Altyap\u0131 Proje Malzemeleri" }), _jsx("option", { value: "other_project", children: "\uD83D\uDCCB Di\u011Fer Proje Y\u00FCkleri" })] })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-green-100 p-2 rounded-lg mr-3", children: _jsx(Package, { className: "h-5 w-5 text-green-600" }) }), "A\u011F\u0131rl\u0131k ve Hacim Bilgileri"] }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "weight_value", className: "block text-sm font-semibold text-gray-700 mb-3", children: [_jsx(Package, { className: "inline h-4 w-4 mr-2" }), "A\u011F\u0131rl\u0131k (ton) *"] }), _jsx("input", { type: "number", id: "weight_value", name: "weight_value", value: formData.weight_value, onChange: handleChange, min: "0.1", max: "999999", step: "0.1", required: true, placeholder: "\u00D6rn: 10.5", title: "A\u011F\u0131rl\u0131k de\u011Feri", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "volume_value", className: "block text-sm font-semibold text-gray-700 mb-3", children: [_jsx(Package, { className: "inline h-4 w-4 mr-2" }), "Hacim (m\u00B3) *"] }), _jsx("input", { type: "number", id: "volume_value", name: "volume_value", value: formData.volume_value, onChange: handleChange, min: "0.1", max: "999999", step: "0.1", required: true, placeholder: "\u00D6rn: 25.0", title: "Hacim de\u011Feri", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 focus:bg-white" })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-yellow-100 p-2 rounded-lg mr-3", children: _jsx(Calendar, { className: "h-5 w-5 text-yellow-600" }) }), "Tarih ve Fiyat Bilgileri"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "loading_date", className: "block text-sm font-semibold text-gray-700 mb-3", children: [_jsx(Calendar, { className: "inline h-4 w-4 mr-2" }), "Y\u00FCkleme Tarihi *"] }), _jsx("input", { type: "date", id: "loading_date", name: "loading_date", value: formData.loading_date, onChange: handleChange, required: true, title: "Y\u00FCkleme tarihi", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "delivery_date", className: "block text-sm font-semibold text-gray-700 mb-3", children: [_jsx(Calendar, { className: "inline h-4 w-4 mr-2" }), "Teslimat Tarihi *"] }), _jsx("input", { type: "date", id: "delivery_date", name: "delivery_date", value: formData.delivery_date, onChange: handleChange, required: true, title: "Teslimat tarihi", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-3", children: "Teklif Alma \u015Eekli" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypeDirect", name: "offerType", value: "direct", checked: offerType === 'direct', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" }), _jsx("label", { htmlFor: "offerTypeDirect", className: "ml-2 text-sm text-gray-700", children: "Do\u011Frudan Teklif" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: "offerTypePrice", name: "offerType", value: "price", checked: offerType === 'price', onChange: (e) => setOfferType(e.target.value), className: "w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" }), _jsx("label", { htmlFor: "offerTypePrice", className: "ml-2 text-sm text-gray-700", children: "Fiyat Belirleyerek" })] })] })] }), offerType === 'price' && (_jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "price_amount", className: "block text-sm font-semibold text-gray-700 mb-3", children: "Belirlenen Fiyat (TL) *" }), _jsx("input", { type: "number", id: "price_amount", name: "price_amount", value: formData.price_amount, onChange: handleChange, min: "0", step: "0.01", required: offerType === 'price', placeholder: "\u00D6rn: 5000", title: "Fiyat miktar\u0131", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "price_currency", className: "block text-sm font-semibold text-gray-700 mb-3", children: "Para Birimi" }), _jsxs("select", { id: "price_currency", name: "price_currency", value: formData.price_currency, onChange: handleChange, title: "Para birimi", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white", children: [_jsx("option", { value: "TRY", children: "TRY" }), _jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" })] })] })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "transport_responsibility", className: "block text-sm font-semibold text-gray-700 mb-3", children: "Nakliye Kime Ait *" }), _jsxs("select", { id: "transport_responsibility", name: "transport_responsibility", value: formData.transport_responsibility, onChange: handleChange, required: true, title: "Nakliye sorumlusu", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-gray-50 focus:bg-white", children: [_jsx("option", { value: "", children: "Se\u00E7iniz" }), _jsx("option", { value: "buyer", children: "\uD83D\uDED2 Al\u0131c\u0131" }), _jsx("option", { value: "seller", children: "\uD83C\uDFEA Sat\u0131c\u0131" }), _jsx("option", { value: "carrier", children: "\uD83D\uDE9B Nakliyeci" }), _jsx("option", { value: "negotiable", children: "\uD83E\uDD1D Pazarl\u0131k Edilebilir" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-indigo-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-5 w-5 text-indigo-600" }) }), "A\u00E7\u0131klama"] }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-semibold text-gray-700 mb-3", children: "A\u00E7\u0131klama *" }), _jsx("textarea", { id: "description", name: "description", value: formData.description, onChange: handleChange, required: true, rows: 4, placeholder: "Y\u00FCk\u00FCn\u00FCz hakk\u0131nda detayl\u0131 bilgi verin...", title: "\u0130lan a\u00E7\u0131klamas\u0131", className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white resize-none" })] }) })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-pink-100 p-2 rounded-lg mr-3", children: _jsx(Upload, { className: "h-5 w-5 text-pink-600" }) }), "Y\u00FCk G\u00F6rselleri (Opsiyonel)"] }), _jsx("div", { className: "grid grid-cols-3 gap-4", children: [0, 1, 2].map((index) => (_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-xl aspect-square bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group", children: [_jsx("input", { type: "file", accept: "image/png, image/jpeg", className: "absolute inset-0 opacity-0 cursor-pointer z-10", title: "Y\u00FCk g\u00F6rseli y\u00FCkle", "aria-label": `Yük görseli ${index + 1} yükle`, onChange: async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file)
                                                        return;
                                                    await handleImageUpload(file, index);
                                                } }), loadImages[index] ? (_jsx("img", { src: loadImages[index], alt: `Yük görseli ${index + 1}`, className: "object-cover w-full h-full" })) : imageUploading[index] ? (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [_jsx(Loader2, { className: "w-8 h-8 text-blue-500 mb-2 animate-spin" }), _jsx("p", { className: "text-xs text-gray-500 text-center px-2", children: "Y\u00FCkleniyor..." })] })) : (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [_jsx(Upload, { className: "w-8 h-8 text-gray-400 mb-2" }), _jsxs("p", { className: "text-xs text-gray-500 text-center px-2", children: ["PNG, JPG", _jsx("br", {}), "max. 5MB"] })] })), loadImages[index] && (_jsx("button", { type: "button", className: "absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-600 hover:text-red-600 z-20", onClick: () => {
                                                    setLoadImages(imgs => {
                                                        const newImgs = [...imgs];
                                                        newImgs[index] = null;
                                                        return newImgs;
                                                    });
                                                }, title: "G\u00F6rseli Kald\u0131r", children: _jsx(Trash2, { size: 18 }) }))] }, index))) })] }), _jsx("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-6", children: _jsxs("fieldset", { children: [_jsxs("legend", { className: "text-lg font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx("div", { className: "bg-orange-100 p-2 rounded-lg mr-3", children: _jsx(FileText, { className: "h-5 w-5 text-orange-600" }) }), "\uD83D\uDCE6 Y\u00FCk \u0130lan\u0131 Evrak Listesi (Opsiyonel/\u0130ste\u011Fe Ba\u011Fl\u0131 Y\u00FCklenebilir)"] }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-6", children: [_jsx("button", { type: "button", onClick: () => setRequiredDocuments(Object.keys(documentLabels)), className: "px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium", children: "\u2713 T\u00FCm\u00FCn\u00FC Se\u00E7" }), _jsx("button", { type: "button", onClick: () => setRequiredDocuments([]), className: "px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium", children: "\u2715 T\u00FCm\u00FCn\u00FC Temizle" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(documentLabels).map(([key, label]) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: key, name: "documents", value: key, checked: requiredDocuments.includes(key), className: "w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500", onChange: handleDocumentChange }), _jsx("label", { htmlFor: key, className: "ml-3 text-sm font-medium text-gray-700", children: label })] }, key))) }), _jsxs("div", { className: "mt-8 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors", children: [_jsx("input", { type: "file", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg", className: "hidden", id: "documents-upload", onChange: (e) => {
                                                    if (e.target.files) {
                                                        handleDocumentUpload(e.target.files);
                                                    }
                                                } }), _jsxs("label", { htmlFor: "documents-upload", className: "cursor-pointer", children: [documentUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" }), _jsx("h4", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar y\u00FCkleniyor..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h4", { className: "text-lg font-medium text-gray-700 mb-2", children: "Evraklar\u0131 buraya s\u00FCr\u00FCkleyin veya t\u0131klay\u0131n" })] })), _jsxs("p", { className: "text-sm text-gray-500", children: ["Desteklenen formatlar: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PNG, JPEG", _jsx("br", {}), "Maksimum dosya boyutu: 10MB"] })] })] }), uploadedDocuments.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsx("h5", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Y\u00FCklenen Evraklar" }), _jsx("div", { className: "space-y-2", children: uploadedDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-50 p-3 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: doc.name }), _jsx("p", { className: "text-xs text-gray-500", children: doc.size })] })] }), _jsx("button", { type: "button", onClick: () => handleDocumentRemove(index), className: "text-red-500 hover:text-red-700 transition-colors", title: "Evrak\u0131 kald\u0131r", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, index))) })] }))] }) }), _jsxs("div", { className: "flex justify-end gap-4 pt-8 border-t border-gray-200", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium transform hover:scale-105", title: "\u0130ptal et", children: "\u0130ptal" }), _jsxs("button", { type: "submit", disabled: loading, className: "px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg", title: "De\u011Fi\u015Fiklikleri kaydet", children: [loading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "G\u00FCncelle"] })] })] })] }) }));
};
export default EditModalLoadListing;
