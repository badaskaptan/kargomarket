# Last updated: 2025-07-29

# 🔧 KargoMarketing - Technical Implementation Guide
**Hedef Kitle**: Developers & Technical AI Agents  
**Focus**: Implementation details, code samples, technical decisions  
**⚠️ KRİTİK**: Bu dosya sürekli güncel tutulmalıdır!

---

## 📋 **GÜNCEL TUTMA TALİMATLARI**

### **🔄 Bu Dosyanın Güncellenmesi Zorunludur**
**AI Agent'lar için kritik görev**: Her implementation sonrasında bu dosyayı güncelleyin:

1. **Implementation Tamamlandığında**:
   ```markdown
   // ❌ CURRENT: Mock data  → // ✅ COMPLETED: Real data (Tarih)
   ```

2. **Yeni Gereksinim Çıktığında**:
   - Yeni service methods ekleyin
   - Database şema değişikliklerini dokumenta edin
   - Hook patterns'ı güncelleyin

3. **Database Değişiklikleri**:
   - Yeni tablolar eklendiyse SQL kodlarını güncelleyin
   - Index optimizasyonları yapıldıysa belirtinmerkayın

4. **Senkronizasyon**:
   - Bu dosya her değişiklik sonrası kontrol edilmeli
   - AI_AGENT_COMPLETE_GUIDE.md ile tutarlı olmalı

---

## 📋 **MODÜL BAZLI TEKNİK REHBER**

### **1. DATA INTEGRATION TASKS**

#### **MyAdsSection.tsx** - Real Data Integration
```typescript
// ❌ CURRENT: Mock data
const mockAds = [{ id: 1, title: 'Hızlı Taşıma', views: 142 }]

// ✅ TARGET: Real data integration
import { useListings } from '../hooks/useListings'
import { useListingStats } from '../hooks/useListingStats'

const MyAdsSection = () => {
  const { user } = useAuth()
  const { loadListings, transportServices, loading } = useListings(user?.id)
  
  // Combine both listing types
  const allAds = [
    ...loadListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      type: 'Yük İlanı',
      status: listing.is_active ? 'active' : 'inactive',
      views: listing.view_count || 0,
      createdAt: listing.created_at
    })),
    ...transportServices.map(service => ({
      id: service.id,
      title: service.title,
      type: 'Nakliye Hizmeti',
      status: service.is_active ? 'active' : 'inactive',
      views: service.view_count || 0,
      createdAt: service.created_at
    }))
  ]
  
  return (
    <div>
      {allAds.map(ad => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  )
}
```

**Gereken Service Methods**:
```typescript
// listingService.ts eklenecek
export const getListingStats = async (listingId: number) => {
  const { data: stats } = await supabase
    .rpc('get_listing_stats', { listing_id: listingId })
  
  return {
    views: stats?.view_count || 0,
    offers: stats?.offer_count || 0,
    favorites: stats?.favorite_count || 0
  }
}

// Database function needed
CREATE OR REPLACE FUNCTION get_listing_stats(listing_id bigint)
RETURNS TABLE(view_count int, offer_count int, favorite_count int) AS $$
BEGIN
  -- Implementation
END;
$$ LANGUAGE plpgsql;
```

#### **MyReviewsSection.tsx** - Database Integration
```typescript
// ❌ CURRENT: Mock reviews
const mockReviews = [...]

// ✅ TARGET: Real reviews from database
import { useReviews } from '../hooks/useReviews'

const MyReviewsSection = () => {
  const { user } = useAuth()
  const { 
    receivedReviews, 
    givenReviews, 
    createReview, 
    deleteReview 
  } = useReviews(user?.id)
  
  return (
    <Tabs>
      <TabPanel>
        <ReceivedReviews reviews={receivedReviews} />
      </TabPanel>
      <TabPanel>
        <GivenReviews reviews={givenReviews} onDelete={deleteReview} />
      </TabPanel>
    </Tabs>
  )
}
```

**New Tables Needed**:
```sql
-- reviews table
CREATE TABLE reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id bigint REFERENCES listings(id) ON DELETE SET NULL,
  offer_id bigint REFERENCES offers(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_type varchar(20) CHECK (review_type IN ('shipper', 'transporter')),
  is_public boolean DEFAULT true,
  is_reported boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ratings aggregate table
CREATE TABLE user_ratings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  overall_rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  as_shipper_rating decimal(3,2) DEFAULT 0,
  as_transporter_rating decimal(3,2) DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);
```

#### **OverviewSection.tsx** - Dynamic Statistics
```typescript
// ❌ CURRENT: Static mock data
const stats = [
  { title: 'Aktif İlanlar', value: '12' },
  { title: 'Bekleyen Teklifler', value: '3' }
]

// ✅ TARGET: Real-time dashboard stats
import { useDashboardStats } from '../hooks/useDashboardStats'

const OverviewSection = () => {
  const { user } = useAuth()
  const { stats, activities, loading } = useDashboardStats(user?.id)
  
  return (
    <div>
      <StatsGrid stats={stats} />
      <ActivityFeed activities={activities} />
    </div>
  )
}
```

**Dashboard Stats Service**:
```typescript
// dashboardService.ts - New file
export const getDashboardStats = async (userId: string) => {
  const [listings, offers, messages, reviews] = await Promise.all([
    supabase.from('listings').select('*').eq('created_by', userId),
    supabase.from('offers').select('*').eq('sender_id', userId),
    supabase.from('conversations').select('*').eq('creator_id', userId),
    supabase.from('reviews').select('*').eq('reviewed_id', userId)
  ])
  
  return {
    activeListings: listings.data?.filter(l => l.is_active).length || 0,
    pendingOffers: offers.data?.filter(o => o.status === 'pending').length || 0,
    totalMessages: messages.data?.length || 0,
    averageRating: calculateAverageRating(reviews.data || [])
  }
}
```

---

### **2. FEATURE COMPLETION TASKS**

#### **ProfileSection.tsx** - Avatar Upload
```typescript
// Eklenecek avatar upload functionality
const handleAvatarUpload = async (file: File) => {
  try {
    // 1. Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece resim dosyaları yüklenebilir')
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır')
    }
    
    // 2. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)
    
    if (uploadError) throw uploadError
    
    // 3. Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // 4. Update profile
    await updateProfile({ avatar_url: urlData.publicUrl })
    
  } catch (error) {
    console.error('Avatar upload error:', error)
    setError(error.message)
  }
}
```

**Storage Setup Needed**:
```sql
-- Supabase Dashboard > Storage > Create new bucket
Bucket name: avatars
Public: true
File size limit: 5MB
Allowed file types: image/*

-- RLS Policy for avatars bucket
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **HomePage.tsx** - Maps Integration
```bash
# Install required packages
npm install react-leaflet leaflet
npm install @types/leaflet
```

```typescript
// HomePage.tsx maps integration
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const HomePage = () => {
  const { featuredListings } = useFeaturedListings()
  
  return (
    <div>
      {/* Hero section */}
      <HeroSection />
      
      {/* Featured listings */}
      <FeaturedListings listings={featuredListings} />
      
      {/* Interactive map */}
      <section className="py-16">
        <h2>Aktif Rotalar</h2>
        <MapContainer center={[39.9334, 32.8597]} zoom={6} className="h-96">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {featuredListings.map(listing => (
            <Marker key={listing.id} position={[listing.lat, listing.lng]}>
              <Popup>{listing.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>
    </div>
  )
}
```

---

### **3. NAVIGATION & UX IMPROVEMENTS**

#### **Navigation Flow Fixes**
```typescript
// src/components/layout/DashboardLayout.tsx
const handleBackNavigation = () => {
  // Fix: Dashboard back button should go to HomePage, not ListingsPage
  if (location.pathname.startsWith('/dashboard')) {
    navigate('/', { replace: true })
  } else {
    navigate(-1)
  }
}

// src/context/DashboardContext.tsx - Add breadcrumb state
const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

const updateBreadcrumbs = (path: string) => {
  const pathMap = {
    '/': 'Ana Sayfa',
    '/dashboard': 'Dashboard',
    '/dashboard/messages': 'Mesajlar',
    '/dashboard/ads': 'Reklamlarım',
    '/dashboard/offers': 'Tekliflerim',
    '/dashboard/profile': 'Profilim'
  }
  
  setBreadcrumbs(generateBreadcrumbs(path, pathMap))
}
```

#### **Logout Implementation**
```typescript
// src/components/ui/UserMenu.tsx
const handleLogout = async () => {
  try {
    // 1. Clear Supabase session
    await supabase.auth.signOut()
    
    // 2. Clear local storage
    localStorage.removeItem('supabase.auth.token')
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    // 3. Reset context state
    setUser(null)
    setProfile(null)
    
    // 4. Redirect to home
    navigate('/', { replace: true })
    
  } catch (error) {
    console.error('Logout error:', error)
  }
}
```

---

### **4. PERFORMANCE OPTIMIZATIONS**

#### **Bundle Size Reduction**
```typescript
// Implement lazy loading for heavy components
const LazyMessagingSection = lazy(() => import('../sections/MessagingSection'))
const LazyMapComponent = lazy(() => import('../ui/MapComponent'))

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />
})

// Dynamic imports for heavy libraries
const loadMapLibrary = async () => {
  const { MapContainer } = await import('react-leaflet')
  return MapContainer
}
```

#### **Image Optimization**
```typescript
// Implement progressive image loading
const OptimizedImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.src = src
  }, [src])
  
  return (
    <div className={`${className} ${!isLoaded ? 'animate-pulse bg-gray-200' : ''}`}>
      {isLoaded && <img src={imageSrc} alt={alt} />}
    </div>
  )
}
```

---

### **5. DATABASE OPTIMIZATIONS**

#### **Required Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_listings_created_by ON listings(created_by);
CREATE INDEX idx_listings_is_active ON listings(is_active);
CREATE INDEX idx_offers_sender_id ON offers(sender_id);
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Composite indexes
CREATE INDEX idx_listings_active_created ON listings(is_active, created_at DESC);
CREATE INDEX idx_offers_status_created ON offers(status, created_at DESC);
```

#### **Database Functions**
```sql
-- Get user statistics function
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id uuid)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_listings', (SELECT COUNT(*) FROM listings WHERE created_by = user_id AND is_active = true),
    'pending_offers', (SELECT COUNT(*) FROM offers WHERE sender_id = user_id AND status = 'pending'),
    'total_messages', (SELECT COUNT(*) FROM messages WHERE sender_id = user_id),
    'average_rating', (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewed_id = user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Environment Variables**
```bash
# .env.production
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

### **Build Optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          maps: ['react-leaflet', 'leaflet'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

---

## 📋 **FINAL IMPLEMENTATION STEPS**

1. **Data Integration** (Priority 1)
   - MyAdsSection real data
   - MyReviewsSection database
   - OverviewSection statistics

2. **Feature Completion** (Priority 2)
   - ProfileSection avatar upload
   - HomePage maps integration
   - Navigation improvements

3. **Performance** (Priority 3)
   - Bundle optimization
   - Image optimization
   - Database indexing

4. **Testing & Deployment** (Priority 4)
   - End-to-end testing
   - Performance testing
   - Production deployment

---

## 📊 **IMPLEMENTATION STATUS TRACKER**

### **🔄 Güncel Durum - 26 Temmuz 2025**


#### **Data Integration Status**
- [x] MyAdsSection.tsx - Real data integration (✅ COMPLETED: Canlı veri, Supabase entegrasyonu, 28 Temmuz 2025)
- [x] MyReviewsSection.tsx - Database integration (✅ COMPLETED: Gerçek Supabase verisi, 28 Temmuz 2025)
- [x] OverviewSection.tsx - Dynamic statistics (✅ COMPLETED: Gerçek zamanlı dashboard istatistikleri, 28 Temmuz 2025)


#### **Feature Completion Status**
- [x] ProfileSection.tsx - Avatar upload (✅ COMPLETED: Supabase Storage ile avatar yükleme, 28 Temmuz 2025)
- [x] HomePage.tsx - Maps integration (✅ COMPLETED: react-leaflet ile harita ve öne çıkan ilanlar, 28 Temmuz 2025)
- [x] Navigation flow fixes (✅ COMPLETED: Dashboard geri butonu ve breadcrumb iyileştirmeleri, 28 Temmuz 2025)


#### **Performance Status**
- [x] Bundle size optimization (✅ COMPLETED: Kod bölme ve lazy loading, 28 Temmuz 2025)
- [x] Image optimization (✅ COMPLETED: Progressive image loading, 28 Temmuz 2025)
- [x] Database indexing (✅ COMPLETED: Performans indexleri eklendi, 28 Temmuz 2025)


#### **Database Schema Status**
- [x] Reviews table creation (✅ COMPLETED: reviews & user_ratings tabloları oluşturuldu ve kullanılıyor, 28 Temmuz 2025)
- [x] Dashboard stats function (✅ COMPLETED: get_user_dashboard_stats fonksiyonu eklendi, 28 Temmuz 2025)
- [x] Storage setup for avatars (✅ COMPLETED: Supabase storage bucket ve RLS policy, 28 Temmuz 2025)

### **🎯 Next Agent Instructions**
1. Check yukarıdaki status'ları kontrol et
2. Implementation yap
3. ✅ işaretini koy
4. AI_AGENT_COMPLETE_GUIDE.md'deki yüzdeyi güncelle
5. Bu dosyayı güncel tut

---

**Bu technical guide ile implementation'a hazırsınız!** 🚀
