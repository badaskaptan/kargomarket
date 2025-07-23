# 🤖 AI Agent & Developer Navigation Guide
## KargoMarket Project - Complete System Reference

> **Purpose**: This comprehensive guide serves as a reference for both human developers and AI agents working on this project. It prevents hallucination, reduces errors, and provides clear navigation through the complex project structure.

## 🔄 **MAINTENANCE PROTOCOL - CRITICAL**

> ⚠️ **MANDATORY UPDATE RULE**: This guide MUST be updated whenever:
> - Any component is added, moved, or deleted
> - Import paths change or new dependencies are added
> - Database schema or service layers are modified
> - New workflows or patterns are introduced
> - Project architecture decisions are made

### 📅 **Review Schedule**:
- **On VS Code startup**: Agent should scan this guide for relevance
- **After major changes**: Immediate update required
- **Weekly review**: Verify all information is current
- **Before complex tasks**: Reference this guide to prevent errors

### 🎯 **Agent Instructions**:
- Always check this guide before making assumptions about project structure
- Update relevant sections when implementing changes
- Maintain consistency with established patterns
- Flag outdated information immediately

---

## 📋 Quick Project Overview

**Project Type**: React TypeScript + Vite + Supabase  
**UI Framework**: Tailwind CSS + Lucide React  
**State Management**: React Context API  
**Backend**: Supabase (PostgreSQL + Auth + Storage)  
**Build Tool**: Vite  

---

## 🏗️ Project Architecture

```
kargomark/
├── src/
│   ├── components/          # React components (organized by type)
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks  
│   ├── lib/                # External library configurations
│   ├── services/           # API/Database service layers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── data/               # Static data
├── public/                 # Static assets
└── *.sql                   # Database schema files
```

---

## 🔧 Core System Components

### 1. **Authentication System**
- **Context**: `src/context/SupabaseAuthContext.tsx`
- **Hook**: `useAuth()` - Returns `{ user, loading, signIn, signOut }`
- **Usage**: Import in any component that needs user data
- **Supabase Integration**: Automatic session management

### 2. **Dashboard Context**
- **Context**: `src/context/DashboardContext.tsx`
- **Hook**: `useDashboard()` - Returns dashboard state and actions
- **State Management**: Handles active sections, modal states, data refresh

### 3. **Database Services**
Located in `src/services/`:
- **`listingService.ts`** (670 lines) - CRUD operations for listings (loads, shipments, transport services)
- **`offerService.ts`** (365 lines) - Regular offer management
- **`serviceOfferService.ts`** (325 lines) - Enhanced service offer operations

---

## 📂 Component Organization

### **Modal System** (Recently Reorganized)
```
src/components/modals/
├── listings/
│   ├── detail/             # View-only modals
│   │   ├── LoadListingDetailModal.tsx
│   │   ├── ShipmentRequestDetailModal.tsx
│   │   └── TransportServiceDetailModal.tsx
│   └── edit/               # Edit modals
│       ├── EditLoadListingModal.tsx
│       ├── EditShipmentRequestModal.tsx
│       └── EditTransportServiceModal.tsx
├── offers/
│   ├── regular/            # Standard offer modals
│   │   ├── AcceptRejectOfferModal.tsx
│   │   ├── CreateOfferModal.tsx
│   │   ├── EditOfferModal.tsx
│   │   └── OfferDetailModal.tsx
│   └── service/            # Service offer modals
│       ├── EnhancedServiceOfferModal.tsx
│       ├── ServiceOfferAcceptRejectModal.tsx
│       └── ServiceOfferDetailModal.tsx
└── unused/                 # Deprecated components
    └── CreateServiceOfferModal.tsx
```

### **Page Components**
```
src/components/pages/
├── DashboardPage.tsx       # Main dashboard container
└── ListingsPage.tsx        # Public listings view
```

### **Section Components**
```
src/components/sections/
├── listings/               # Listing management sections
│   ├── MyLoadListings.tsx
│   ├── MyShipmentRequests.tsx
│   └── MyTransportServices.tsx
├── MyOffersSection.tsx     # Offer management
├── OverviewSection.tsx     # Dashboard overview
└── Create*.tsx             # Item creation sections
```

---

## 🔄 Import Patterns & Dependencies

### **Common Import Patterns**:

1. **Authentication**:
```typescript
import { useAuth } from '../../../context/SupabaseAuthContext';
const { user } = useAuth();
```

2. **Dashboard State**:
```typescript
import { useDashboard } from '../../../context/DashboardContext';
const { activeSection, setActiveSection } = useDashboard();
```

3. **Services**:
```typescript
import { ListingService } from '../../../services/listingService';
import { OfferService } from '../../../services/offerService';
import { ServiceOfferService } from '../../../services/serviceOfferService';
```

4. **Types**:
```typescript
import type { ExtendedListing, ExtendedOffer } from '../../../types/database-types';
import type { ExtendedServiceOffer } from '../../../types/service-offer-types';
```

### **Modal Usage Pattern**:
```typescript
// In parent component
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

// Modal implementation
<SomeModal
  item={selectedItem}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={() => {
    setIsModalOpen(false);
    refreshData(); // Callback to refresh parent data
  }}
/>
```

---

## 🗄️ Database Integration

### **Supabase Configuration**
- **File**: `src/lib/supabase.ts`
- **Exports**: `supabase`, `storage`
- **Types**: Auto-generated in `src/types/database-types.ts`

### **Key Tables**:
1. **`listings`** - Load requests, shipment requests, transport services
2. **`offers`** - Regular offers for listings
3. **`service_offers`** - Enhanced offers for transport services
4. **`profiles`** - User profile information

### **Service Layer Pattern**:
```typescript
// All services follow this pattern
export class ServiceName {
  static async create(data: InsertType): Promise<RowType>
  static async getById(id: string): Promise<RowType | null>
  static async update(id: string, data: UpdateType): Promise<RowType>
  static async delete(id: string): Promise<boolean>
}
```

---

## 🎯 Key Workflows

### **1. Creating a New Listing**
1. User fills form in `CreateLoadListingSection.tsx` or similar
2. Form calls `ListingService.createListing()`
3. Service inserts to Supabase `listings` table
4. Dashboard refreshes via context

### **2. Making an Offer**
1. User clicks "Teklif Ver" on a listing
2. Opens `CreateOfferModal.tsx` or `EnhancedServiceOfferModal.tsx`
3. Modal calls appropriate service (`OfferService` or `ServiceOfferService`)
4. Offer saved to database with foreign key to listing

### **3. Managing Offers**
1. `MyOffersSection.tsx` displays user's offers
2. Uses both `OfferService` and `ServiceOfferService` for different offer types
3. Offers can be viewed, edited, or deleted through dedicated modals

---

## ⚠️ Critical Notes for AI Agents

### **File Path Precision**:
- Modal imports changed recently - always use the new organized structure
- Service imports are exact: `../../../services/serviceName`
- Context imports: `../../../context/ContextName`

### **Type Safety**:
- Always use proper types from `database-types.ts` or `service-offer-types.ts`
- `ExtendedListing` includes joined profile data
- `ExtendedOffer` and `ExtendedServiceOffer` are service-specific

### **State Management**:
- User state: Use `useAuth()` hook
- Dashboard state: Use `useDashboard()` hook
- Modal state: Local `useState` in parent component

### **Database Operations**:
- All DB operations go through service layers
- Services handle error catching and logging
- Always await async operations

---

## 🚨 Common Pitfalls & Solutions

### **1. Import Path Errors**:
**Problem**: Modals moved to organized folders  
**Solution**: Use the correct new paths from the modal organization

### **2. Type Mismatches**:
**Problem**: Using wrong type for different offer types  
**Solution**: `ExtendedOffer` for regular offers, `ExtendedServiceOffer` for service offers

### **3. State Not Updating**:
**Problem**: Component not re-rendering after data changes  
**Solution**: Ensure proper `onSuccess` callbacks in modals to refresh parent data

### **4. Authentication Issues**:
**Problem**: Operations failing due to missing user  
**Solution**: Always check `if (!user)` before database operations

---

## 🔍 Current Technical Debt

1. **Inline Functions**: Some components have duplicate inline functions (e.g., file upload in transport service creation)
2. **Type Consistency**: Some components use `any` types instead of proper typing
3. **Error Handling**: Not all service calls have comprehensive error handling
4. **Performance**: Large bundle size due to Lucide React icons

---

## 📚 Dependencies Worth Noting

### **Major Libraries**:
- **React 18** - Core framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons (large bundle impact)
- **Supabase** - Backend as a service
- **React Leaflet** - Map components

### **Development Tools**:
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 🎓 Quick Reference Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
tsc --noEmit

# Lint
npm run lint
```

---

**Last Updated**: July 2025  
**Version**: Post-Modal-Reorganization  
**Maintainer**: AI-Assistant Ready Documentation

> 💡 **Pro Tip for AI Agents**: When making changes, always verify import paths, use proper types, and follow the established service layer patterns. This project has grown complex but follows consistent patterns throughout.

---

## 📋 **CONTINUOUS IMPROVEMENT CHECKLIST**

### 🔍 **Before Starting Any Task**:
- [ ] Review this guide for current project structure
- [ ] Verify import paths match the documented patterns
- [ ] Check if similar functionality already exists
- [ ] Understand the data flow for the area you're working on

### ✅ **After Completing Any Task**:
- [ ] Update this guide if any structural changes were made
- [ ] Document new patterns or workflows introduced
- [ ] Verify all import paths are still accurate
- [ ] Test that builds still work correctly
- [ ] Add any new pitfalls or solutions discovered

### 🔄 **Guide Maintenance Tasks**:
- [ ] Remove outdated information
- [ ] Update file counts and line numbers in services
- [ ] Add newly discovered common patterns
- [ ] Enhance troubleshooting sections based on recent issues
- [ ] Verify all code examples still work

---

## 🎯 **CRITICAL REMINDER**

**This guide is the project's memory**. Without regular updates, it becomes technical debt instead of technical asset. Every agent and developer working on this project has the responsibility to keep this navigation system current and accurate.

**Remember**: 5 minutes updating this guide can save hours of debugging and confusion later!
