# 🚛 KargoMarketing - Nakliye ve Reklam Platformu

Modern nakliye hizmetleri ve reklam yönetimi için kapsamlı platform. React + TypeScript + Vite + Supabase teknolojileri ile geliştirilmiştir.

## 🌟 Özellikler

### 📦 Nakliye Sistemi
- **Yük İlanları**: Nakliye talepleri ve yük ilanları yönetimi
- **Nakliyeci Profilleri**: Taşıyıcı firma profilleri ve değerlendirmeler
- **Mesajlaşma Sistemi**: Gerçek zamanlı kullanıcı iletişimi
- **Lokasyon Entegrasyonu**: İl/ilçe bazlı filtreleme ve arama

### 🎯 Reklam Sistemi
- **Çoklu Reklam Türleri**: Banner, Video, Metin reklamları
- **Hedefleme**: Rol bazlı ve demografik hedefleme
- **Gerçek Zamanlı Metrikler**: Impression, click, CTR takibi
- **Billing Entegrasyonu**: Otomatik faturalama ve bakiye yönetimi

### 💰 Ödeme ve Billing
- **Esnek Fiyatlandırma**: Günlük/haftalık/aylık reklam paketleri
- **Otomatik Bakiye**: Kullanıcı bakiye sistemi ve transaction geçmişi
- **Ücretsiz Mod**: Beta sürümde sınırsız kullanım
- **Kredi Kartı Entegrasyonu**: Güvenli ödeme altyapısı

## 🏗️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI geliştirme
- **TypeScript** - Type-safe kod yazımı
- **Vite** - Hızlı geliştirme ve build
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon seti

### Backend & Database
- **Supabase** - PostgreSQL veritabanı ve authentication
- **Row Level Security (RLS)** - Veri güvenliği
- **Real-time Subscriptions** - Canlı veri güncellemeleri
- **Storage Buckets** - Medya dosyası yönetimi

### Özel Özellikler
- **Progressive Web App (PWA)** desteği
- **Responsive Design** - Mobil/tablet uyumlu
- **Dark/Light Mode** - Tema değiştirme
- **Real-time Messaging** - Supabase Realtime ile

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/badaskaptan/kargomarketing.git
cd kargomarketing

# Bağımlılıkları yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env
# .env dosyasında Supabase bilgilerinizi güncelleyin

# Development server'ı başlatın
npm run dev
```

### Supabase Kurulumu

1. **Database Schema**: `create-billing-tables.sql` dosyasını Supabase SQL Editor'de çalıştırın
2. **Storage**: `advertisements` bucket'ını oluşturun
3. **Authentication**: Email/password veya sosyal medya girişi aktif edin
4. **RLS Policies**: Otomatik olarak oluşturulur

Detaylı kurulum için: [SUPABASE_BILLING_SETUP.md](./SUPABASE_BILLING_SETUP.md)

## 📱 Uygulama Bölümleri

### Dashboard
- **Genel Bakış**: Sistem istatistikleri ve son aktiviteler
- **Hızlı Erişim**: Yeni ilan, reklam ve mesaj oluşturma
- **Bildirimler**: Gerçek zamanlı sistem bildirimleri

### Nakliye Yönetimi
- **İlan Verme**: Yeni nakliye talebi oluşturma
- **İlan Arama**: Filtreleme ve arama özellikleri
 - **Teklif Sistemi**: Yük ve nakliye ilanlarında HomePage ve ListingsPage üzerinden tam teklif akışı, CreateOfferModal ile eksiksiz modal entegrasyonu, tüm build/type hataları giderildi, testler geçti

### Reklam Yönetimi
- **Reklam Oluşturma**: Banner, video ve metin reklamları
- **Performance Dashboard**: Detaylı analytics ve raporlar
- **Budget Yönetimi**: Harcama kontrolü ve optimizasyon

### Mesajlaşma
- **Gerçek Zamanlı Chat**: Anlık mesajlaşma
- **Dosya Paylaşımı**: Resim ve doküman gönderme
- **Mesaj Geçmişi**: Arama ve filtreleme

## 🔧 Geliştirme

### Available Scripts

```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Production build (HomePage ve CreateOfferModal'da teklif sistemi ve modal entegrasyonu hatasız)
npm run preview      # Preview production build
npm run lint         # ESLint kontrolü
npm run type-check   # TypeScript kontrolü
```

### Project Structure

```
src/
├── components/          # React bileşenleri
│   ├── sections/       # Sayfa bölümleri
│   ├── ui/            # Temel UI bileşenleri
│   └── layout/        # Layout bileşenleri
├── services/           # API servisleri
│   ├── adsService.ts  # Reklam işlemleri
│   ├── billingService.ts # Ödeme işlemleri
│   └── supabase.ts    # Supabase client
├── hooks/             # Custom React hooks
├── utils/             # Yardımcı fonksiyonlar
└── types/             # TypeScript type tanımları
```

## 🛡️ Güvenlik

- **Row Level Security (RLS)** - Supabase seviyesinde veri güvenliği
- **JWT Authentication** - Güvenli kullanıcı doğrulama
- **HTTPS Enforcement** - Tüm istekler şifreli
- **Input Validation** - Frontend ve backend doğrulama

## 📊 Analytics ve Raporlama

- **Reklam Performansı**: CTR, impression, conversion metrikleri
- **Kullanıcı Aktivitesi**: Sayfa görüntüleme ve etkileşim analizi
- **Gelir Raporları**: Detaylı finansal raporlar
- **A/B Testing**: Reklam performans karşılaştırması

## 🚀 Production Deployment

### Vercel (Önerilen)
```bash
npm run build
# Vercel dashboard'dan deploy edin
```

### Netlify
```bash
npm run build
# dist/ klasörünü Netlify'a yükleyin
```

### Manual Deployment
```bash
npm run build
# dist/ klasörünü web server'ınıza kopyalayın
```

## 🔄 Billing System

### Ücretsiz Mod (Şu Anki Durum)
```typescript
BILLING_CONFIG = {
  FREE_MODE: true,        // Ücretsiz kullanım
  WELCOME_BONUS: 500,     // 500 TL hediye bakiye
}
```

### Ücretli Moda Geçiş
```typescript
BILLING_CONFIG = {
  FREE_MODE: false,       // Ücretli mod
  // Payment gateway entegrasyonu
}
```

### Fiyatlandırma
- **Banner Reklamları**: 50 TL/gün
- **Video Reklamları**: 100 TL/gün  
- **Metin Reklamları**: 25 TL/gün

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

## 📞 İletişim

- **GitHub**: [badaskaptan](https://github.com/badaskaptan)
- **Email**: [İletişim bilgileri]
- **Website**: [Demo URL]

## 🙏 Teşekkürler

- [Supabase](https://supabase.com) - Backend altyapısı
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Lucide](https://lucide.dev) - Icon library
- [Vite](https://vitejs.dev) - Build tool

---

**⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!**
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
test
