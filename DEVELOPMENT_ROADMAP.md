# 🚀 KargoMarketing Development Roadmap - Kalan İşler
**Updated**: 26 Temmuz 2025  
**Focus**: Dashboard Modülleri + Vitrin Sayfaları

---

## 📋 **DASHBOARD MODÜLLERİ - Teknik Plan**

### 1. **Reklamlarım Modülü** 
**Component**: `src/components/sections/MyAdsSection.tsx`

```typescript
interface MyAdsSection {
  // Kullanıcının tüm ilanları (yük + nakliye)
  loadListings: Listing[]
  transportServices: TransportService[] 
  
  // İstatistikler
  getAdStats(adId: string): {
    views: number
    offers: number
    favorites: number
  }
  
  // CRUD operations
  editAd(id: string): void
  deleteAd(id: string): void
  duplicateAd(id: string): void
  promoteAd(id: string): void // Öne çıkarma
}
```

**Backend Requirements**:
- `listings.view_count` field addition
- `favorites` table creation
- `getMyAds()` service method

### 2. **Yorumlarım ve Puanlarım Modülü**
**Component**: `src/components/sections/ReviewsSection.tsx`

```typescript
interface ReviewSystem {
  // Değerlendirme tipları
  type ReviewType = 'received' | 'given'
  
  // Puan sistemi
  calculateRating(userId: string): {
    overall: number  // 1-5
    delivery: number
    communication: number
    professionalism: number
  }
  
  // CRUD
  createReview(review: Review): void
  reportReview(reviewId: string): void
}
```

**New Tables**:
```sql
-- reviews tablosu
CREATE TABLE reviews (
  id bigint PRIMARY KEY,
  reviewer_id uuid REFERENCES profiles(id),
  reviewed_id uuid REFERENCES profiles(id),
  listing_id bigint REFERENCES listings(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_type varchar(20), -- 'shipper', 'transporter'
  created_at timestamp DEFAULT now()
);

-- ratings tablosu
CREATE TABLE ratings (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  overall_rating decimal(2,1),
  total_reviews integer DEFAULT 0,
  updated_at timestamp DEFAULT now()
);
```

### 3. **Profilim Modülü Completion**
**Existing**: `src/components/sections/ProfileSection.tsx`

**Missing Features**:
- Avatar upload to Supabase Storage
- Company information fields
- Verification badge system
- Contact preferences

```typescript
interface ProfileCompletion {
  // Avatar system
  uploadAvatar(file: File): Promise<string>
  
  // Company info
  companyDetails: {
    companyName?: string
    taxNumber?: string
    tradeRegistryNumber?: string
    authorizedPerson?: string
  }
  
  // Preferences
  notificationSettings: {
    emailOffers: boolean
    smsOffers: boolean
    marketingEmails: boolean
  }
}
```

### 4. **Ayarlar Modülü**
**Component**: `src/components/sections/SettingsSection.tsx`

```typescript
interface SettingsModule {
  // Bildirim ayarları
  notifications: {
    newOffers: boolean
    messages: boolean
    systemUpdates: boolean
  }
  
  // Gizlilik ayarları
  privacy: {
    showProfile: boolean
    showContactInfo: boolean
    allowDirectContact: boolean
  }
  
  // Hesap ayarları
  account: {
    changePassword(): void
    deleteAccount(): void
    exportData(): void
  }
}
```

---

## 🏪 **VİTRİN SAYFALARI - Teknik Plan**

### 1. **Ana Sayfa Enhancement**
**Component**: `src/components/pages/HomePage.tsx` (revamp)

**New Features**:
```typescript
// Öne çıkan ilanlar
interface FeaturedListings {
  getFeaturedListings(): {
    urgentLoads: Listing[]    // Son 24 saat
    popularRoutes: Listing[]  // En çok teklif alan
    newTransports: TransportService[] // Yeni hizmetler
  }
}

// Harita entegrasyonu  
interface MapIntegration {
  component: 'react-leaflet' | 'google-maps'
  features: {
    activeRoutes: RouteDisplay[]
    transporterLocations: Location[]
    interactiveRoutes: boolean
  }
}

// İstatistikler
interface Statistics {
  totalUsers: number
  activeListings: number
  completedShipments: number
  averageRating: number
}
```

**Dependencies to Add**:
```bash
npm install react-leaflet leaflet
npm install @types/leaflet
```

### 2. **Reklamlar Sayfası (Public)**
**Component**: `src/components/pages/PublicListingsPage.tsx`

```typescript
interface PublicListings {
  // Gelişmiş filtreleme
  filters: {
    transportMode: TransportMode[]
    route: { from: City, to: City }
    dateRange: DateRange
    priceRange: PriceRange
    rating: number
  }
  
  // Pagination
  pagination: {
    page: number
    limit: number
    totalCount: number
  }
  
  // Search
  searchQuery: string
  searchFields: ['title', 'description', 'route']
}
```

### 3. **Yorumlar Sayfası (Public)**
**Component**: `src/components/pages/PublicReviewsPage.tsx`

```typescript
interface PublicReviews {
  // Değerlendirme showcase
  showcaseReviews: Review[]
  
  // İstatistikler
  reviewStats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<1|2|3|4|5, number>
  }
  
  // Filtreleme
  filterByRating(rating: number): Review[]
  filterByType(type: 'shipper' | 'transporter'): Review[]
}
```

### 4. **Nasıl Çalışır Sayfası**
**Component**: `src/components/pages/HowItWorksPage.tsx`

```typescript
interface HowItWorks {
  // Video integration
  videoSections: {
    shippers: string // YouTube/Vimeo embed
    transporters: string
    messaging: string
  }
  
  // Interactive guide
  stepByStepGuide: {
    registration: Step[]
    createListing: Step[]
    makeOffer: Step[]
    messaging: Step[]
  }
}
```

---

## 🔧 **UX/NAVIGATION İyileştirmeleri**

### Navigation Flow Fixes:
```typescript
// src/components/layout/DashboardLayout.tsx
interface NavigationFix {
  // Back button behavior
  handleBackNavigation(): void {
    // Dashboard → Ana Sayfa (not listings)
    // Modal close → Previous page
  }
  
  // Breadcrumb implementation
  breadcrumbs: BreadcrumbItem[]
  
  // Auth state management
  logout(): Promise<void>
  redirectToLogin(): void
}
```

### Logout Button Implementation:
```typescript
// src/components/ui/UserMenu.tsx
const logoutHandler = async () => {
  await supabase.auth.signOut()
  clearSession()
  navigate('/')
}
```

---

## 📊 **Cleanup & Optimizations**

### Component Cleanup:
- [ ] Remove duplicate Reklam Paneli from dashboard
- [ ] Consolidate similar modal components
- [ ] Implement component lazy loading

### Performance:
- [ ] Bundle analysis: `npm run build:analyze`
- [ ] Dynamic imports for heavy components
- [ ] Image optimization pipeline

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Week 1**: Dashboard Core
1. Reklamlarım modülü (2 gün)
2. Yorumlarım/Puanlarım (2 gün) 
3. Ayarlar completion (1 gün)

### **Week 2**: Public Pages
1. Ana Sayfa enhancement (2 gün)
2. Reklamlar/Yorumlar pages (2 gün)
3. Navigation fixes (1 gün)

### **Week 3**: Polish & Launch
1. Performance optimization
2. Mobile responsiveness
3. Final testing & deployment

---

**SONUÇ**: Teknik detaylar hazır! Hangi modülden başlayalım? 🚀
