# Offer Documents Storage Structure

## 📂 Dosya Saklama Yapısı

### Bucket: `verification-documents`

```
verification-documents/
├── offers/                              # Teklif evrakları
│   ├── {user_id}/                      # Kullanıcı bazlı klasör
│   │   ├── {offer_id}/                 # Teklif bazlı klasör
│   │   │   ├── {timestamp}-{filename}  # Dosyalar
│   │   │   ├── 1691234567890-sigorta_belgesi.pdf
│   │   │   ├── 1691234567891-yetki_belgesi.pdf
│   │   │   └── 1691234567892-is_sozlesmesi.docx
│   │   └── {other_offer_id}/
│   └── {other_user_id}/
├── profiles/                           # Profil evrakları (gelecek)
└── listings/                           # İlan evrakları (gelecek)
```

## 🔧 Dosya Yolları

### Örnek Dosya Yolu:
```
verification-documents/offers/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/1691234567890-sigorta_belgesi.pdf
```

### Yol Yapısı:
- **Bucket**: `verification-documents`
- **Kategori**: `offers`
- **User ID**: `550e8400-e29b-41d4-a716-446655440000`
- **Offer ID**: `660e8400-e29b-41d4-a716-446655440001`
- **Dosya Adı**: `1691234567890-sigorta_belgesi.pdf`

## 📋 Metadata Yapısı (offers.attachments JSONB)

```javascript
[
  {
    "fileName": "sigorta_belgesi.pdf",
    "fileSize": 245760,
    "fileType": "application/pdf",
    "bucketPath": "offers/550e8400.../660e8400.../1691234567890-sigorta_belgesi.pdf",
    "uploadedAt": "2025-08-04T10:30:00.000Z",
    "description": "Sigorta belgesi ve yetki belgeleri"
  },
  {
    "fileName": "yetki_belgesi.pdf", 
    "fileSize": 156890,
    "fileType": "application/pdf",
    "bucketPath": "offers/550e8400.../660e8400.../1691234567891-yetki_belgesi.pdf",
    "uploadedAt": "2025-08-04T10:30:01.000Z",
    "description": "Sigorta belgesi ve yetki belgeleri"
  }
]
```

## 🔐 Güvenlik Politikaları

### RLS (Row Level Security) Kuralları:

1. **Görüntüleme**: Kullanıcılar sadece kendi dosyalarını görebilir
2. **Yükleme**: Kullanıcılar sadece kendi klasörlerine dosya yükleyebilir
3. **Silme**: Kullanıcılar sadece kendi dosyalarını silebilir
4. **İlan Sahipleri**: Kendilerine gelen tekliflerin evraklarını görebilir

## 🎯 Desteklenen Dosya Türleri

- **PDF**: `application/pdf`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Resim**: `image/jpeg`, `image/png`

## 📏 Dosya Limitleri

- **Maksimum dosya boyutu**: 10MB
- **Maksimum dosya sayısı**: Sınır yok (pratik olarak 10-20 dosya önerilir)

## 🔧 Implementation Status

### ✅ Tamamlanan:
- [x] Dosya yapısı planlandı
- [x] OfferDocumentService oluşturuldu
- [x] CreateOfferModal'a entegre edildi
- [x] Metadata yapısı tasarlandı

### 🚧 Yapılacaklar:
- [ ] Supabase Storage policies oluştur
- [ ] Gerçek dosya yükleme işlemini aktif et
- [ ] Dosya görüntüleme/indirme sistemi
- [ ] Dosya silme işlemi
- [ ] Error handling geliştir

## 🚀 Kullanım Örnekleri

### Dosya Yükleme:
```typescript
import OfferDocumentService from '@/services/offerDocumentService';

const files = [file1, file2, file3];
const userId = 'user-uuid';
const offerId = 'offer-uuid';
const description = 'Sigorta ve yetki belgeleri';

const results = await OfferDocumentService.uploadOfferDocuments(
  files, 
  userId, 
  offerId, 
  description
);
```

### Dosya İndirme:
```typescript
const filePath = 'offers/user-id/offer-id/timestamp-filename.pdf';
const blob = await OfferDocumentService.downloadDocument(filePath);
```

### Dosya Silme:
```typescript
const filePaths = ['path1', 'path2', 'path3'];
await OfferDocumentService.deleteOfferDocuments(filePaths);
```

## 📈 Avantajlar

1. **Organize Yapı**: Kullanıcı ve teklif bazlı klasörleme
2. **Güvenlik**: RLS ile dosya erişim kontrolü
3. **Scalability**: Büyük dosya miktarlarına uygun yapı
4. **Maintenance**: Kolay dosya yönetimi ve temizlik
5. **Performance**: Index'li arama ve filtreleme
6. **Audit**: Dosya yükleme geçmişi ve metadata takibi
